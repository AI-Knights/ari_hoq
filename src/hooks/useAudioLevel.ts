import { useState, useEffect, useRef } from 'react';
import AgoraRTC, { IRemoteAudioTrack, IMicrophoneAudioTrack } from 'agora-rtc-sdk-ng';

type IAudioTrack = IRemoteAudioTrack | IMicrophoneAudioTrack;

export const useAudioLevel = (audioTrack: IAudioTrack | null) => {
    const [audioLevel, setAudioLevel] = useState(0);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const rafIdRef = useRef<number | null>(null);

    useEffect(() => {
        if (!audioTrack) {
            setAudioLevel(0);
            return;
        }

        try {
            const mediaStreamTrack = audioTrack.getMediaStreamTrack();
            const mediaStream = new MediaStream([mediaStreamTrack]);

            const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
            const audioContext = new AudioContextClass();
            audioContextRef.current = audioContext;

            const source = audioContext.createMediaStreamSource(mediaStream);
            const analyser = audioContext.createAnalyser();
            analyser.fftSize = 256;
            source.connect(analyser);
            analyserRef.current = analyser;

            const bufferLength = analyser.frequencyBinCount;
            const dataArray = new Uint8Array(bufferLength);

            const updateLevel = () => {
                if (!analyserRef.current) return;
                analyserRef.current.getByteFrequencyData(dataArray);

                let sum = 0;
                for (let i = 0; i < bufferLength; i++) {
                    sum += dataArray[i];
                }
                const average = sum / bufferLength;
                // Normalize average (0-255) to 0-1 range
                const normalized = Math.min(average / 128, 1);
                setAudioLevel(normalized);
                rafIdRef.current = requestAnimationFrame(updateLevel);
            };

            updateLevel();

            return () => {
                if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
                if (audioContextRef.current) {
                    audioContextRef.current.close().catch(err => console.error('Error closing AudioContext:', err));
                }
                analyserRef.current = null;
                audioContextRef.current = null;
            };
        } catch (error) {
            console.error('Error setting up useAudioLevel:', error);
            setAudioLevel(0);
        }
    }, [audioTrack]);

    return audioLevel;
};
