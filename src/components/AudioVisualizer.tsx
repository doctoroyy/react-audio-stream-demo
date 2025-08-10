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

      // Clear canvas with beautiful animated gradient background
      const time = Date.now() * 0.002;
      const gradient = ctx.createLinearGradient(0, 0, rect.width, rect.height);
      gradient.addColorStop(0, `hsla(${240 + Math.sin(time) * 20}, 60%, 85%, 0.8)`);
      gradient.addColorStop(0.5, `hsla(${260 + Math.cos(time * 0.7) * 15}, 70%, 80%, 0.9)`);
      gradient.addColorStop(1, `hsla(${280 + Math.sin(time * 1.2) * 10}, 65%, 75%, 0.8)`);
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, rect.width, rect.height);

      // Draw animated placeholder bars with rainbow effect
      const numBars = 80;
      const barWidth = rect.width / numBars;
      
      for (let i = 0; i < numBars; i++) {
        // Create animated heights with multiple sine waves
        const wave1 = Math.sin(i * 0.15 + time * 2) * 0.3;
        const wave2 = Math.sin(i * 0.08 + time * 1.5) * 0.2;
        const wave3 = Math.sin(i * 0.25 + time * 3) * 0.15;
        const barHeight = (wave1 + wave2 + wave3 + 0.5) * rect.height * 0.4;
        const x = i * barWidth + barWidth * 0.1;
        
        // Create rainbow gradient for bars
        const hue = (i / numBars * 360 + time * 50) % 360;
        const barGradient = ctx.createLinearGradient(0, rect.height, 0, rect.height - barHeight);
        barGradient.addColorStop(0, `hsla(${hue}, 70%, 60%, 0.8)`);
        barGradient.addColorStop(0.5, `hsla(${hue + 20}, 80%, 70%, 0.9)`);
        barGradient.addColorStop(1, `hsla(${hue + 40}, 90%, 80%, 1)`);
        
        ctx.fillStyle = barGradient;
        ctx.fillRect(x, rect.height - barHeight, barWidth * 0.8, barHeight);
        
        // Add glow effect
        ctx.shadowColor = `hsla(${hue}, 70%, 60%, 0.5)`;
        ctx.shadowBlur = 10;
        ctx.fillRect(x, rect.height - barHeight, barWidth * 0.8, barHeight);
        ctx.shadowBlur = 0;
      }

      // Add floating particles effect
      const numParticles = 15;
      for (let i = 0; i < numParticles; i++) {
        const particleX = (Math.sin(time * 0.5 + i) * 0.5 + 0.5) * rect.width;
        const particleY = (Math.cos(time * 0.7 + i * 1.5) * 0.3 + 0.5) * rect.height;
        const size = Math.sin(time * 2 + i) * 2 + 3;
        
        const particleGradient = ctx.createRadialGradient(particleX, particleY, 0, particleX, particleY, size);
        particleGradient.addColorStop(0, `hsla(${(time * 100 + i * 30) % 360}, 80%, 80%, 0.8)`);
        particleGradient.addColorStop(1, `hsla(${(time * 100 + i * 30) % 360}, 80%, 80%, 0)`);
        
        ctx.fillStyle = particleGradient;
        ctx.beginPath();
        ctx.arc(particleX, particleY, size, 0, Math.PI * 2);
        ctx.fill();
      }

      // Add beautiful text overlay with glow
      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.strokeStyle = 'rgba(139, 92, 246, 0.5)';
      ctx.lineWidth = 2;
      ctx.font = 'bold 16px system-ui, -apple-system, sans-serif';
      ctx.textAlign = 'center';
      ctx.shadowColor = 'rgba(139, 92, 246, 0.5)';
      ctx.shadowBlur = 10;
      
      const text = '✨ Audio visualization will appear here when playing ✨';
      ctx.strokeText(text, rect.width / 2, rect.height / 2);
      ctx.fillText(text, rect.width / 2, rect.height / 2);
      ctx.shadowBlur = 0;
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

        // Clear canvas with beautiful animated gradient background
        const time = Date.now() * 0.001;
        const gradient = ctx.createLinearGradient(0, 0, rect.width, rect.height);
        gradient.addColorStop(0, `hsla(${200 + Math.sin(time) * 30}, 70%, 20%, 1)`);
        gradient.addColorStop(0.5, `hsla(${220 + Math.cos(time * 0.8) * 20}, 80%, 25%, 1)`);
        gradient.addColorStop(1, `hsla(${240 + Math.sin(time * 1.3) * 15}, 75%, 30%, 1)`);
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, rect.width, rect.height);

        // Draw frequency bars with enhanced effects
        const barWidth = rect.width / bufferLength;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
          const barHeight = (dataArray[i] / 255) * rect.height * 0.9;
          
          // Create dynamic rainbow gradient for bars
          const hue = (i / bufferLength * 360 + time * 100) % 360;
          const barGradient = ctx.createLinearGradient(0, rect.height, 0, rect.height - barHeight);
          barGradient.addColorStop(0, `hsla(${hue}, 90%, 50%, 0.9)`);
          barGradient.addColorStop(0.3, `hsla(${hue + 30}, 95%, 60%, 1)`);
          barGradient.addColorStop(0.7, `hsla(${hue + 60}, 100%, 70%, 1)`);
          barGradient.addColorStop(1, `hsla(${hue + 90}, 100%, 80%, 1)`);
          
          ctx.fillStyle = barGradient;
          
          // Add glow effect
          ctx.shadowColor = `hsla(${hue}, 90%, 60%, 0.8)`;
          ctx.shadowBlur = 15;
          
          const barX = x + barWidth * 0.1;
          const barActualWidth = barWidth * 0.8;
          
          // Draw main bar
          ctx.fillRect(barX, rect.height - barHeight, barActualWidth, barHeight);
          
          // Add reflection effect
          const reflectionHeight = barHeight * 0.3;
          const reflectionGradient = ctx.createLinearGradient(0, rect.height, 0, rect.height + reflectionHeight);
          reflectionGradient.addColorStop(0, `hsla(${hue}, 90%, 50%, 0.3)`);
          reflectionGradient.addColorStop(1, `hsla(${hue}, 90%, 50%, 0)`);
          ctx.fillStyle = reflectionGradient;
          ctx.fillRect(barX, rect.height, barActualWidth, reflectionHeight);
          
          ctx.shadowBlur = 0;
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