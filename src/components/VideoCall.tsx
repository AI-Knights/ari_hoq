'use client';

import React, { useEffect, useRef } from 'react';
import { PhoneOff, Mic, MicOff, Video, VideoOff, Wifi, WifiOff, CameraOff } from 'lucide-react';
import { useAgora } from '../hooks/useAgora';
import { useAudioLevel } from '../hooks/useAudioLevel';
import { api } from '../lib/api';
import { ILocalVideoTrack, IRemoteVideoTrack } from 'agora-rtc-sdk-ng';

interface VideoCallProps {
    channelName: string;
    onCallEnd: () => void;
    partnerName: string;
    partnerAvatar?: string;
}

export const VideoCall: React.FC<VideoCallProps> = ({ channelName, onCallEnd, partnerName, partnerAvatar }) => {
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
    } = useAgora();

    const localVolume = useAudioLevel(localAudioTrack);
    const remoteVolume = useAudioLevel(remoteAudioTrack);

    const localVideoRef = useRef<HTMLDivElement>(null);
    const remoteVideoRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        join(channelName);
        return () => {
            leave();
        };
    }, [channelName, join, leave]);

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

    return (
        <div className="fixed inset-0 bg-[#0a0a0a] z-[120] flex flex-col items-center justify-center p-4">
            {/* Header / Remote User Info */}
            <div className={`absolute top-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center transition-all duration-300 ${remoteVolume > 0.05 ? 'scale-110' : 'scale-100'}`}>
                <div className={`text-white text-xl font-medium mb-2 px-4 py-1 rounded-full bg-black/40 backdrop-blur-md border transition-colors ${remoteVolume > 0.05 ? 'border-[#D4AF37] shadow-[0_0_15px_rgba(212,175,55,0.4)]' : 'border-white/10'}`}>
                    {partnerName}
                </div>
                {isRemoteUserConnected && (
                    <div className="flex items-center gap-1 bg-black/40 backdrop-blur-sm px-2 py-0.5 rounded-full border border-white/5 text-[10px]">
                        <Wifi className={`w-3 h-3 ${getQualityColor(remoteNetworkQuality)}`} />
                        <span className="text-gray-400 capitalize">
                            {remoteNetworkQuality <= 2 ? 'Excellent' : remoteNetworkQuality === 3 ? 'Good' : 'Poor'}
                        </span>
                    </div>
                )}
            </div>

            {/* Main Video Area (Remote) */}
            <div className="relative w-full max-w-5xl aspect-video bg-[#1a1a1a] rounded-3xl overflow-hidden shadow-2xl border border-white/5">
                {!isRemoteUserConnected ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center space-y-4">
                        <div className="w-24 h-24 rounded-full border-4 border-[#D4AF37]/20 border-t-[#D4AF37] animate-spin" />
                        <p className="text-[#D4AF37] font-medium tracking-wide animate-pulse">Waiting for {partnerName}...</p>
                    </div>
                ) : !isRemoteVideoEnabled ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0f0f0f]">
                        <div className="relative">
                            {/* Pulsing Audio Ring */}
                            <div
                                className="absolute inset-0 rounded-full bg-[#D4AF37]/20 transition-all duration-75"
                                style={{ transform: `scale(${1 + remoteVolume * 1.5})`, opacity: remoteVolume > 0.05 ? 0.6 : 0 }}
                            />
                            <div className="relative w-40 h-40 rounded-full border-4 border-[#D4AF37]/30 overflow-hidden bg-[#1a1a1a] shadow-2xl">
                                {partnerAvatar ? (
                                    <img src={partnerAvatar} alt="" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-white text-6xl font-serif">
                                        {partnerName.charAt(0).toUpperCase()}
                                    </div>
                                )}
                                <div className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-md p-2 rounded-full border border-white/10">
                                    <CameraOff className="w-5 h-5 text-red-500" />
                                </div>
                            </div>
                        </div>
                        <div className="mt-6 text-center">
                            <h3 className="text-white text-xl font-medium">{partnerName}</h3>
                            <p className="text-gray-500 text-sm">Camera is off</p>
                        </div>
                    </div>
                ) : (
                    <div ref={remoteVideoRef} className="w-full h-full bg-black object-cover" />
                )
                }
            </div>

            {/* Local Video Area (Self) */}
            <div className={`absolute bottom-24 right-8 w-48 h-64 bg-[#1a1a1a] rounded-2xl overflow-hidden shadow-2xl border-2 transition-all duration-300 ${localVolume > 0.05 ? 'border-[#D4AF37] scale-105 shadow-[0_0_20px_rgba(212,175,55,0.3)]' : 'border-white/10'}`}>
                {isCameraOff ? (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-[#0f0f0f]">
                        <div className="relative">
                            <div
                                className="absolute inset-0 rounded-full bg-[#D4AF37]/20 transition-all duration-75"
                                style={{ transform: `scale(${1 + localVolume * 1.2})`, opacity: localVolume > 0.05 ? 0.5 : 0 }}
                            />
                            <div className="w-16 h-16 rounded-full bg-[#1a1a1a] flex items-center justify-center border border-white/10">
                                <CameraOff className="w-6 h-6 text-gray-500" />
                            </div>
                        </div>
                        <span className="text-[10px] text-gray-500 mt-2 uppercase tracking-widest font-bold">You</span>
                    </div>
                ) : (
                    <div ref={localVideoRef} className="w-full h-full bg-black object-cover" />
                )}
                {/* Local Info */}
                <div className="absolute top-2 right-2 flex items-center gap-1 bg-black/40 backdrop-blur-sm px-1.5 py-0.5 rounded-full border border-white/5 text-[8px]">
                    <Wifi className={`w-2 h-2 ${getQualityColor(localNetworkQuality)}`} />
                </div>
            </div>

            {/* Controls */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-6 bg-black/40 backdrop-blur-xl border border-white/10 p-4 rounded-[2rem] shadow-2xl">
                <button
                    onClick={toggleMute}
                    className={`p-4 rounded-full transition-all active:scale-95 ${isMuted ? 'bg-red-500 text-white shadow-lg shadow-red-500/20' : 'bg-white/10 text-white hover:bg-white/20'}`}
                >
                    {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
                </button>

                <button
                    onClick={handleEndCall}
                    className="p-4 bg-red-600 hover:bg-red-700 text-white rounded-full transition-all active:scale-95 shadow-lg shadow-red-600/30"
                >
                    <PhoneOff className="w-7 h-7" />
                </button>

                <button
                    onClick={toggleCamera}
                    className={`p-4 rounded-full transition-all active:scale-95 ${isCameraOff ? 'bg-red-500 text-white shadow-lg shadow-red-500/20' : 'bg-white/10 text-white hover:bg-white/20'}`}
                >
                    {isCameraOff ? <VideoOff className="w-6 h-6" /> : <Video className="w-6 h-6" />}
                </button>
            </div>
        </div>
    );
};

export default VideoCall;
