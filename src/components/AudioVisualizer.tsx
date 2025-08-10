import React, { useRef, useEffect, useState } from 'react';

interface AudioVisualizerProps {
  audioElement: HTMLAudioElement | null;
  className?: string;
}

export const AudioVisualizer: React.FC<AudioVisualizerProps> = ({ 
  audioElement, 
  className = "w-full h-24" 
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>();
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (!audioElement || !canvasRef.current) return;

    const initializeAudioContext = async () => {
      try {
        // Create audio context only once
        if (!audioContextRef.current) {
          audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        }

        const audioContext = audioContextRef.current;
        
        // Resume audio context if suspended
        if (audioContext.state === 'suspended') {
          await audioContext.resume();
        }

        // Create analyser and source only once
        if (!analyserRef.current) {
          analyserRef.current = audioContext.createAnalyser();
          analyserRef.current.fftSize = 256;
        }

        if (!sourceRef.current) {
          sourceRef.current = audioContext.createMediaElementSource(audioElement);
          sourceRef.current.connect(analyserRef.current);
          analyserRef.current.connect(audioContext.destination);
        }

        setIsInitialized(true);
      } catch (error) {
        console.warn('Failed to initialize audio context:', error);
      }
    };

    // Initialize when audio starts playing
    const handlePlay = () => {
      if (!isInitialized) {
        initializeAudioContext();
      }
    };

    audioElement.addEventListener('play', handlePlay);

    return () => {
      audioElement.removeEventListener('play', handlePlay);
    };
  }, [audioElement, isInitialized]);

  useEffect(() => {
    if (!isInitialized || !analyserRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const analyser = analyserRef.current;
    
    if (!ctx) return;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      if (!ctx || !analyser) return;

      analyser.getByteFrequencyData(dataArray);

      // Set canvas size
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * window.devicePixelRatio;
      canvas.height = rect.height * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

      // Clear canvas
      ctx.fillStyle = 'rgb(243, 244, 246)'; // bg-gray-100
      ctx.fillRect(0, 0, rect.width, rect.height);

      // Draw frequency bars
      const barWidth = rect.width / bufferLength;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const barHeight = (dataArray[i] / 255) * rect.height * 0.8;
        
        // Create gradient
        const gradient = ctx.createLinearGradient(0, rect.height, 0, rect.height - barHeight);
        gradient.addColorStop(0, 'rgb(59, 130, 246)'); // blue-500
        gradient.addColorStop(1, 'rgb(147, 197, 253)'); // blue-300
        
        ctx.fillStyle = gradient;
        ctx.fillRect(x, rect.height - barHeight, barWidth - 1, barHeight);
        
        x += barWidth;
      }

      animationFrameRef.current = requestAnimationFrame(draw);
    };

    // Start animation
    draw();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isInitialized]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (sourceRef.current) {
        sourceRef.current.disconnect();
      }
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close();
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={`${className} bg-gray-100 rounded-md border`}
      style={{ display: 'block' }}
    />
  );
};