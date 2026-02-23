import { useState, useCallback, useRef, useEffect } from 'react';
import AgoraRTC, {
    IAgoraRTCClient,
    IAgoraRTCRemoteUser,
    ICameraVideoTrack,
    IMicrophoneAudioTrack,
    IRemoteVideoTrack,
    IRemoteAudioTrack,
    NetworkQuality,
} from 'agora-rtc-sdk-ng';
import { api } from '../lib/api';
import { prewarmPermissions as prewarm } from '../lib/videoUtils';

const APP_ID = process.env.NEXT_PUBLIC_AGORA_APP_ID;

export const useAgora = () => {
    const [localVideoTrack, setLocalVideoTrack] = useState<ICameraVideoTrack | null>(null);
    const [remoteVideoTrack, setRemoteVideoTrack] = useState<IRemoteVideoTrack | null>(null);
    const [localAudioTrack, setLocalAudioTrack] = useState<IMicrophoneAudioTrack | null>(null);
    const [remoteAudioTrack, setRemoteAudioTrack] = useState<IRemoteAudioTrack | null>(null);

    const [isRemoteUserConnected, setIsRemoteUserConnected] = useState(false);
    const [isRemoteVideoEnabled, setIsRemoteVideoEnabled] = useState(false);

    const [localNetworkQuality, setLocalNetworkQuality] = useState<number>(0);
    const [remoteNetworkQuality, setRemoteNetworkQuality] = useState<number>(0);

    const [isMuted, setIsMuted] = useState(false);
    const [isCameraOff, setIsCameraOff] = useState(false);

    const [error, setError] = useState<string | null>(null);

    const clientRef = useRef<IAgoraRTCClient | null>(null);
    const audioTrackRef = useRef<IMicrophoneAudioTrack | null>(null);
    const videoTrackRef = useRef<ICameraVideoTrack | null>(null);
    const joiningRef = useRef(false);

    useEffect(() => {
        const client = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });
        clientRef.current = client;

        const handleUserJoined = (user: IAgoraRTCRemoteUser) => {
            console.log('User joined:', user.uid);
            setIsRemoteUserConnected(true);
        };

        const handleUserLeft = (user: IAgoraRTCRemoteUser) => {
            console.log('User left:', user.uid);
            setIsRemoteUserConnected(false);
            setRemoteVideoTrack(null);
            setRemoteAudioTrack(null);
            setIsRemoteVideoEnabled(false);
        };

        const handleUserPublished = async (user: IAgoraRTCRemoteUser, mediaType: 'audio' | 'video') => {
            await client.subscribe(user, mediaType);

            if (mediaType === 'video') {
                setRemoteVideoTrack(user.videoTrack!);
                setIsRemoteVideoEnabled(true);
            }
            if (mediaType === 'audio') {
                setRemoteAudioTrack(user.audioTrack!);
                user.audioTrack?.play();
            }
        };

        const handleUserUnpublished = (user: IAgoraRTCRemoteUser, mediaType: 'audio' | 'video') => {
            if (mediaType === 'video') {
                setRemoteVideoTrack(null);
                setIsRemoteVideoEnabled(false);
            }
            if (mediaType === 'audio') {
                setRemoteAudioTrack(null);
            }
        };

        const handleNetworkQuality = (stats: NetworkQuality) => {
            setLocalNetworkQuality(stats.uplinkNetworkQuality);
            setRemoteNetworkQuality(stats.downlinkNetworkQuality);
        };

        client.on('user-joined', handleUserJoined);
        client.on('user-left', handleUserLeft);
        client.on('user-published', handleUserPublished as any);
        client.on('user-unpublished', handleUserUnpublished as any);
        client.on('network-quality', handleNetworkQuality);

        return () => {
            client.off('user-joined', handleUserJoined);
            client.off('user-left', handleUserLeft);
            client.off('user-published', handleUserPublished as any);
            client.off('user-unpublished', handleUserUnpublished as any);
            client.off('network-quality', handleNetworkQuality);
        };
    }, []);


    const join = useCallback(async (channelName: string) => {
        if (!APP_ID || !clientRef.current) {
            setError('Agora App ID is missing or client not initialized');
            return;
        }

        if (joiningRef.current) return;
        joiningRef.current = true;
        setError(null);

        try {
            // 1. Parallelize: Token fetch and Track creation (Before join)
            const [tokenData, tracks] = await Promise.all([
                api.agora.getToken(channelName),
                Promise.all([
                    AgoraRTC.createMicrophoneAudioTrack({
                        encoderConfig: "music_standard",
                        AEC: true, AGC: true, ANS: true,
                    }),
                    AgoraRTC.createCameraVideoTrack({
                        facingMode: "user",
                        encoderConfig: {
                            width: { min: 320, ideal: 640, max: 1280 },
                            height: { min: 240, ideal: 480, max: 720 },
                            frameRate: 15,
                        }
                    })
                ]).catch(async (e) => {
                    console.warn("[Agora] Camera access failed, falling back to audio only:", e);
                    const audioOnly = await AgoraRTC.createMicrophoneAudioTrack({
                        encoderConfig: "music_standard",
                        AEC: true, AGC: true, ANS: true,
                    });
                    return [audioOnly, null];
                })
            ]);

            // 2. Client side check: If we left while tokens/tracks were fetching, stop here
            if (clientRef.current.connectionState !== 'DISCONNECTED') {
                if (clientRef.current.connectionState !== 'CONNECTING') {
                    joiningRef.current = false;
                    return;
                }
            }

            const [audioTrack, videoTrack] = tracks as [IMicrophoneAudioTrack, ICameraVideoTrack | null];

            // 3. Join with actual token
            await clientRef.current.join(APP_ID, channelName, tokenData.token, tokenData.uid);

            audioTrackRef.current = audioTrack;
            setLocalAudioTrack(audioTrack);

            if (videoTrack) {
                videoTrackRef.current = videoTrack;
                setLocalVideoTrack(videoTrack);
                await clientRef.current.publish([audioTrack, videoTrack]);
            } else {
                await clientRef.current.publish([audioTrack]);
                setError("Could not access camera, proceeding with audio only.");
            }

        } catch (error: any) {
            if (error.code === 'OPERATION_ABORTED') {
                console.warn('[Agora] Join operation aborted (expected if user left).');
                return;
            }
            console.error('Failed to join Agora channel:', error);
            setError(`Something went wrong: ${error.message || 'Unknown error'} (code: ${error.code})`);
        } finally {
            joiningRef.current = false;
        }
    }, []);

    const leave = useCallback(async () => {
        // Stop and close tracks
        if (audioTrackRef.current) {
            audioTrackRef.current.stop();
            audioTrackRef.current.close();
            audioTrackRef.current = null;
        }
        if (videoTrackRef.current) {
            videoTrackRef.current.stop();
            videoTrackRef.current.close();
            videoTrackRef.current = null;
        }

        // Leave client if connected
        if (clientRef.current && (
            clientRef.current.connectionState === 'CONNECTED' ||
            clientRef.current.connectionState === 'CONNECTING' ||
            clientRef.current.connectionState === 'RECONNECTING'
        )) {
            try {
                await clientRef.current.leave();
            } catch (err) {
                console.error('Error leaving Agora channel:', err);
            }
        }

        setLocalVideoTrack(null);
        setLocalAudioTrack(null);
        setRemoteVideoTrack(null);
        setRemoteAudioTrack(null);
        setIsRemoteUserConnected(false);
        setIsRemoteVideoEnabled(false);
    }, []);

    const toggleMute = useCallback(async () => {
        if (audioTrackRef.current) {
            await audioTrackRef.current.setEnabled(isMuted);
            setIsMuted(!isMuted);
        }
    }, [isMuted]);

    const toggleCamera = useCallback(async () => {
        if (videoTrackRef.current) {
            await videoTrackRef.current.setEnabled(isCameraOff);
            setIsCameraOff(!isCameraOff);
        }
    }, [isCameraOff]);

    return {
        localVideoTrack,
        localAudioTrack,
        remoteVideoTrack,
        remoteAudioTrack,
        isRemoteUserConnected,
        isRemoteVideoEnabled,
        localNetworkQuality,
        remoteNetworkQuality,
        join,
        leave,
        isMuted,
        toggleMute,
        isCameraOff,
        toggleCamera,
        error,
        setError,
        prewarmPermissions: prewarm
    };
};
