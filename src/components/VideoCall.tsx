'use client';

import React, { useEffect, useRef, useState } from 'react';
import { PhoneOff, Mic, MicOff, Video, VideoOff, Wifi, WifiOff, CameraOff } from 'lucide-react';
import { useAgora } from '../hooks/useAgora';
import { useAudioLevel } from '../hooks/useAudioLevel';
import { api } from '../lib/api';
import { ILocalVideoTrack, IRemoteVideoTrack } from 'agora-rtc-sdk-ng';
import { clearPrewarmedTracks } from '../lib/videoUtils';

interface VideoCallProps {
    channelName: string;
    onCallEnd: () => void;
    partnerName: string;
    partnerAvatar?: string;
    autoJoin?: boolean;
    remoteMutedFromWs?: boolean;
    remoteCameraOffFromWs?: boolean;
    onMuteToggle?: (muted: boolean) => void;
    onCameraToggle?: (cameraOff: boolean) => void;
}

export const VideoCall: React.FC<VideoCallProps> = ({
    channelName, onCallEnd, partnerName, partnerAvatar, autoJoin,
    remoteMutedFromWs, remoteCameraOffFromWs, onMuteToggle, onCameraToggle
}) => {
    const [hasJoined, setHasJoined] = useState(autoJoin || false);
    const {
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
        setError
    } = useAgora();

    const localVolume = useAudioLevel(localAudioTrack);
    const remoteVolume = useAudioLevel(remoteAudioTrack);

    const localVideoRef = useRef<HTMLDivElement>(null);
    const remoteVideoRef = useRef<HTMLDivElement>(null);

    // Draggable state for local tile
    const [localPos, setLocalPos] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const dragStart = useRef({ x: 0, y: 0 });

    useEffect(() => {
        if (autoJoin) {
            handleJoin();
        }
        return () => {
            leave();
            clearPrewarmedTracks();
        };
    }, [channelName, autoJoin, leave]);

    // ── 15-Second Connection Timeout ──
    useEffect(() => {
        if (!hasJoined) return;

        const timeout = setTimeout(() => {
            if (!isRemoteUserConnected && hasJoined) {
                setError('Connection timed out. Please check your network or try again.');
                setTimeout(() => handleEndCall(), 3000);
            }
        }, 15000);

        return () => clearTimeout(timeout);
    }, [hasJoined, isRemoteUserConnected]);

    const handleJoin = async () => {
        setHasJoined(true);
        await join(channelName);
    };

    const handlePointerDown = (e: React.PointerEvent) => {
        setIsDragging(true);
        dragStart.current = { x: e.clientX - localPos.x, y: e.clientY - localPos.y };
        (e.target as HTMLElement).setPointerCapture(e.pointerId);
    };

    const handlePointerMove = (e: React.PointerEvent) => {
        if (!isDragging) return;
        const newX = e.clientX - dragStart.current.x;
        const newY = e.clientY - dragStart.current.y;

        // Prevent tile from being dragged too far off screen (basic bounds)
        const maxX = window.innerWidth - 100;
        const maxY = window.innerHeight - 100;
        setLocalPos({
            x: Math.max(-maxX, Math.min(0, newX)),
            y: Math.max(-maxY, Math.min(0, newY))
        });
    };

    const handlePointerUp = (e: React.PointerEvent) => {
        setIsDragging(false);
        (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    };

    useEffect(() => {
        if (localVideoTrack && localVideoRef.current) {
            (localVideoTrack as ILocalVideoTrack).play(localVideoRef.current);
        }
    }, [localVideoTrack]);

    useEffect(() => {
        if (remoteVideoTrack && remoteVideoRef.current) {
            (remoteVideoTrack as IRemoteVideoTrack).play(remoteVideoRef.current);
        }
    }, [remoteVideoTrack]);

    const handleEndCall = async () => {
        await leave();
        try {
            await api.video.end(channelName);
        } catch (err) {
            console.error('Failed to end call via API:', err);
        }
        onCallEnd();
    };

    const getQualityColor = (quality: number) => {
        if (quality === 1 || quality === 2) return 'text-green-500';
        if (quality === 3) return 'text-yellow-500';
        if (quality > 3) return 'text-red-500';
        return 'text-gray-500';
    };

    const handleToggleMute = () => {
        toggleMute();
        onMuteToggle?.(!isMuted);
    };

    const handleToggleCamera = () => {
        toggleCamera();
        onCameraToggle?.(!isCameraOff);
    };

    return (
        <div className="fixed inset-0 bg-black z-[120] flex flex-col items-center justify-center overflow-hidden touch-none">
            {/* ── Error Banner & Permission Guide ── */}
            {error && (
                <div className="absolute top-4 left-4 right-4 z-[150] space-y-2">
                    <div className="bg-red-500/90 backdrop-blur-md text-white p-4 rounded-2xl border border-red-400/50 shadow-lg text-center font-medium">
                        {error}
                    </div>
                </div>
            )}

            {/* ── Pre-Join / User Gesture UI ── */}
            {!hasJoined ? (
                <div className="text-center space-y-8 animate-in fade-in zoom-in duration-500">
                    <div className="relative w-32 h-32 mx-auto">
                        <div className="absolute inset-0 rounded-full border-4 border-[#D4AF37]/20 border-t-[#D4AF37] animate-spin" />
                        <div className="absolute inset-4 rounded-full overflow-hidden bg-[#1a1a1a] border border-white/10">
                            {partnerAvatar ? <img src={partnerAvatar} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-4xl font-serif text-white">{partnerName.charAt(0)}</div>}
                        </div>
                    </div>
                    <div>
                        <h3 className="text-2xl font-serif text-white font-bold mb-2">Video Call with {partnerName}</h3>
                        <p className="text-gray-400 text-sm">Tap the button below to start your camera and join.</p>
                    </div>
                    <div className="flex flex-col gap-4 max-w-xs mx-auto">
                        <button
                            onClick={handleJoin}
                            className="w-full py-4 bg-[#D4AF37] hover:bg-[#B8962E] active:scale-95 text-[#0a0a0a] rounded-2xl font-black text-lg shadow-[0_10px_30px_rgba(212,175,55,0.3)] transition-all flex items-center justify-center gap-3"
                        >
                            <Video className="w-6 h-6" />
                            JOIN CALL
                        </button>
                        <button onClick={onCallEnd} className="text-gray-500 hover:text-white transition-colors text-sm font-medium">Cancel Call</button>
                    </div>
                </div>
            ) : (
                <>
                    {/* Main Video Area (Remote) */}
                    <div className="relative w-full h-[calc(100vh-80px)] md:h-screen bg-[#050505]">
                        {!isRemoteUserConnected ? (
                            <div className="absolute inset-0 flex flex-col items-center justify-center space-y-4">
                                <div className="w-16 h-16 rounded-full border-4 border-[#D4AF37]/20 border-t-[#D4AF37] animate-spin" />
                                <p className="text-[#D4AF37] text-sm font-medium tracking-wide animate-pulse">Connecting to {partnerName}...</p>
                            </div>
                        ) : !isRemoteVideoEnabled || remoteCameraOffFromWs ? (
                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0a0a0a]">
                                <div className="relative">
                                    <div
                                        className="absolute inset-0 rounded-full bg-[#D4AF37]/20 transition-all duration-75"
                                        style={{ transform: `scale(${1 + remoteVolume * 1.5})`, opacity: remoteVolume > 0.05 ? 0.6 : 0 }}
                                    />
                                    <div className="relative w-32 h-32 md:w-48 md:h-48 rounded-full border-4 border-[#D4AF37]/30 overflow-hidden bg-[#1a1a1a] shadow-2xl">
                                        {partnerAvatar ? (
                                            <img src={partnerAvatar} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-white text-6xl font-serif">
                                                {partnerName.charAt(0).toUpperCase()}
                                            </div>
                                        )}
                                    </div>
                                    <div className="absolute bottom-1 right-1 md:bottom-2 md:right-2 flex gap-2 z-10">
                                        <div className="bg-black/80 backdrop-blur-md p-2.5 rounded-full border border-white/10 shadow-lg">
                                            <CameraOff className="w-4 h-4 md:w-5 md:h-5 text-red-500" />
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-8 text-center text-white z-10">
                                    <h3 className="text-xl font-medium">{partnerName}</h3>
                                    <p className="text-gray-500 text-sm">{remoteCameraOffFromWs ? 'Camera is off' : 'Video paused'}</p>
                                </div>
                            </div>
                        ) : (
                            <div ref={remoteVideoRef} className="w-full h-full bg-black [&>div]:!bg-transparent [&>div>video]:!object-cover" />
                        )}
                    </div>

                    {/* Header / Remote User Info - Rendered after video for Z-order visibility */}
                    <div className={`absolute top-8 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center transition-all duration-300 ${remoteVolume > 0.05 ? 'scale-110' : 'scale-100'}`}>
                        <div className={`text-white text-lg font-medium mb-1 px-4 py-1 rounded-full bg-black/40 backdrop-blur-md border transition-colors ${remoteVolume > 0.05 ? 'border-[#D4AF37] shadow-[0_0_15px_rgba(212,175,55,0.4)]' : 'border-white/10'}`}>
                            {partnerName}
                        </div>
                        {isRemoteUserConnected && (
                            <div className="flex items-center gap-2 bg-black/40 backdrop-blur-sm px-3 py-1 mt-1 rounded-full border border-white/5 text-xs shadow-lg">
                                <div className="flex items-center gap-1">
                                    <Wifi className={`w-3 h-3 ${getQualityColor(remoteNetworkQuality)}`} />
                                    <span className="text-gray-300 capitalize">
                                        {remoteNetworkQuality <= 2 ? 'Excellent' : remoteNetworkQuality === 3 ? 'Good' : 'Poor'}
                                    </span>
                                </div>
                                {remoteMutedFromWs && (
                                    <div className="flex items-center gap-1 pl-2 border-l border-white/20">
                                        <MicOff className="w-3 h-3 text-red-500" />
                                        <span className="text-red-500 font-medium">Muted</span>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Local Video Area (Self) - PIP Layout */}
                    <div
                        onPointerDown={handlePointerDown}
                        onPointerMove={handlePointerMove}
                        onPointerUp={handlePointerUp}
                        style={{
                            transform: `translate(${localPos.x}px, ${localPos.y}px)`,
                            transition: isDragging ? 'none' : 'transform 0.2s ease-out'
                        }}
                        className={`absolute bottom-[100px] right-4 w-[100px] h-[140px] md:w-[160px] md:h-[220px] bg-[#1a1a1a] rounded-xl overflow-hidden shadow-2xl border-2 transition-all cursor-move z-40 ${localVolume > 0.05 ? 'border-[#D4AF37] shadow-[0_0_20px_rgba(212,175,55,0.3)]' : 'border-white/20'}`}
                    >
                        {isCameraOff || !localVideoTrack ? (
                            <div className="w-full h-full flex flex-col items-center justify-center bg-[#0f0f0f]">
                                <div className="relative p-3 rounded-full bg-white/5 border border-white/10">
                                    <CameraOff className="w-6 h-6 text-gray-600" />
                                </div>
                            </div>
                        ) : (
                            <div ref={localVideoRef} className="w-full h-full bg-black [&>div]:!bg-transparent [&>div>video]:!object-cover" />
                        )}
                        <div className="absolute bottom-1 right-1 flex items-center gap-1 bg-black/60 backdrop-blur-md px-2 py-1 rounded-lg border border-white/10">
                            <span className="text-[8px] md:text-[10px] text-white font-bold uppercase tracking-widest">You</span>
                        </div>
                    </div>

                    {/* Controls Bar - Fixed Bottom */}
                    <div className="fixed bottom-0 left-0 right-0 h-[80px] px-4 pb-[env(safe-area-inset-bottom)] bg-black/60 backdrop-blur-2xl border-t border-white/5 z-50">
                        <div className="h-full max-w-md mx-auto flex items-center justify-evenly">
                            <button
                                onClick={handleToggleMute}
                                className={`p-4 rounded-full transition-all active:scale-90 ${isMuted ? 'bg-red-500 text-white shadow-lg shadow-red-500/20' : 'bg-white/5 text-white hover:bg-white/10 border border-white/10'}`}
                            >
                                {isMuted ? <MicOff className="w-5 h-5 md:w-6 md:h-6" /> : <Mic className="w-5 h-5 md:w-6 md:h-6" />}
                            </button>

                            <button
                                onClick={handleEndCall}
                                className="p-5 bg-red-600 hover:bg-red-700 text-white rounded-full transition-all active:scale-90 shadow-xl shadow-red-600/30"
                            >
                                <PhoneOff className="w-6 h-6 md:w-7 md:h-7" />
                            </button>

                            <button
                                onClick={handleToggleCamera}
                                className={`p-4 rounded-full transition-all active:scale-90 ${isCameraOff ? 'bg-red-500 text-white shadow-lg shadow-red-500/20' : 'bg-white/5 text-white hover:bg-white/10 border border-white/10'}`}
                            >
                                {isCameraOff ? <VideoOff className="w-5 h-5 md:w-6 md:h-6" /> : <Video className="w-5 h-5 md:w-6 md:h-6" />}
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default VideoCall;
