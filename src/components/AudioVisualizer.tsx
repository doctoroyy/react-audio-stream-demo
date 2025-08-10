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
  const [isPlaying, setIsPlaying] = useState(false);

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
      setIsPlaying(true);
      if (!isInitialized) {
        initializeAudioContext();
      }
    };

    const handlePause = () => {
      setIsPlaying(false);
    };

    const handleEnded = () => {
      setIsPlaying(false);
    };

    audioElement.addEventListener('play', handlePlay);
    audioElement.addEventListener('pause', handlePause);
    audioElement.addEventListener('ended', handleEnded);

    return () => {
      audioElement.removeEventListener('play', handlePlay);
      audioElement.removeEventListener('pause', handlePause);
      audioElement.removeEventListener('ended', handleEnded);
    };
  }, [audioElement, isInitialized]);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) return;

    const drawPlaceholder = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * window.devicePixelRatio;
      canvas.height = rect.height * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

      // Clear canvas with gradient background
      const gradient = ctx.createLinearGradient(0, 0, rect.width, 0);
      gradient.addColorStop(0, 'rgb(239, 246, 255)'); // blue-50
      gradient.addColorStop(1, 'rgb(238, 242, 255)'); // indigo-50
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, rect.width, rect.height);

      // Draw static placeholder bars
      const numBars = 64;
      const barWidth = rect.width / numBars;
      
      for (let i = 0; i < numBars; i++) {
        // Create varied heights for visual interest
        const barHeight = (Math.sin(i * 0.1) * 0.3 + 0.4) * rect.height * 0.3;
        const x = i * barWidth;
        
        // Create gradient for bars
        const barGradient = ctx.createLinearGradient(0, rect.height, 0, rect.height - barHeight);
        barGradient.addColorStop(0, 'rgb(191, 219, 254)'); // blue-200
        barGradient.addColorStop(1, 'rgb(165, 180, 252)'); // indigo-300
        
        ctx.fillStyle = barGradient;
        ctx.fillRect(x, rect.height - barHeight, barWidth - 1, barHeight);
      }

      // Add text overlay
      ctx.fillStyle = 'rgb(99, 102, 241)'; // indigo-500
      ctx.font = '14px system-ui, -apple-system, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Audio visualization will appear here when playing', rect.width / 2, rect.height / 2 + 5);
    };

    const draw = () => {
      if (!isInitialized || !analyserRef.current || !isPlaying) {
        drawPlaceholder();
        if (!isPlaying) {
          return; // Don't continue animation if not playing
        }
      } else {
        const analyser = analyserRef.current;
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        
        analyser.getByteFrequencyData(dataArray);

        // Set canvas size
        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width * window.devicePixelRatio;
        canvas.height = rect.height * window.devicePixelRatio;
        ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

        // Clear canvas with gradient background
        const gradient = ctx.createLinearGradient(0, 0, rect.width, 0);
        gradient.addColorStop(0, 'rgb(239, 246, 255)'); // blue-50
        gradient.addColorStop(1, 'rgb(238, 242, 255)'); // indigo-50
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, rect.width, rect.height);

        // Draw frequency bars
        const barWidth = rect.width / bufferLength;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
          const barHeight = (dataArray[i] / 255) * rect.height * 0.8;
          
          // Create gradient for bars
          const barGradient = ctx.createLinearGradient(0, rect.height, 0, rect.height - barHeight);
          barGradient.addColorStop(0, 'rgb(59, 130, 246)'); // blue-500
          barGradient.addColorStop(1, 'rgb(99, 102, 241)'); // indigo-500
          
          ctx.fillStyle = barGradient;
          ctx.fillRect(x, rect.height - barHeight, barWidth - 1, barHeight);
          
          x += barWidth;
        }
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
  }, [isInitialized, isPlaying]);

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
      className={`${className} rounded-lg border-0`}
      style={{ display: 'block' }}
    />
  );
};