import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { 
  Play, 
  Pause, 
  Square, 
  VolumeX, 
  Volume1, 
  Volume2,
  SkipBack,
  SkipForward 
} from 'lucide-react';

interface EnhancedAudioControlsProps {
  audioElement: HTMLAudioElement | null;
  className?: string;
}

export const EnhancedAudioControls: React.FC<EnhancedAudioControlsProps> = ({ 
  audioElement, 
  className = "" 
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);

  // Update state based on audio element events
  useEffect(() => {
    if (!audioElement) return;

    const updateTime = () => setCurrentTime(audioElement.currentTime);
    const updateDuration = () => setDuration(audioElement.duration || 0);
    const updatePlaying = () => setIsPlaying(!audioElement.paused);
    const updateEnded = () => setIsPlaying(false);

    audioElement.addEventListener('timeupdate', updateTime);
    audioElement.addEventListener('durationchange', updateDuration);
    audioElement.addEventListener('loadedmetadata', updateDuration);
    audioElement.addEventListener('play', updatePlaying);
    audioElement.addEventListener('pause', updatePlaying);
    audioElement.addEventListener('ended', updateEnded);

    // Initialize state
    setCurrentTime(audioElement.currentTime);
    setDuration(audioElement.duration || 0);
    setIsPlaying(!audioElement.paused);
    setVolume(audioElement.volume);
    setIsMuted(audioElement.muted);

    return () => {
      audioElement.removeEventListener('timeupdate', updateTime);
      audioElement.removeEventListener('durationchange', updateDuration);
      audioElement.removeEventListener('loadedmetadata', updateDuration);
      audioElement.removeEventListener('play', updatePlaying);
      audioElement.removeEventListener('pause', updatePlaying);
      audioElement.removeEventListener('ended', updateEnded);
    };
  }, [audioElement]);

  const togglePlayPause = useCallback(() => {
    if (!audioElement) return;
    
    if (isPlaying) {
      audioElement.pause();
    } else {
      audioElement.play();
    }
  }, [audioElement, isPlaying]);

  const stop = useCallback(() => {
    if (!audioElement) return;
    
    audioElement.pause();
    audioElement.currentTime = 0;
  }, [audioElement]);

  const handleSeek = useCallback((value: number[]) => {
    if (!audioElement) return;
    
    const newTime = value[0];
    audioElement.currentTime = newTime;
    setCurrentTime(newTime);
  }, [audioElement]);

  const handleVolumeChange = useCallback((value: number[]) => {
    if (!audioElement) return;
    
    const newVolume = value[0];
    audioElement.volume = newVolume;
    setVolume(newVolume);
    
    if (newVolume === 0) {
      setIsMuted(true);
    } else if (isMuted) {
      setIsMuted(false);
    }
  }, [audioElement, isMuted]);

  const toggleMute = useCallback(() => {
    if (!audioElement) return;
    
    const newMuted = !isMuted;
    audioElement.muted = newMuted;
    setIsMuted(newMuted);
  }, [audioElement, isMuted]);

  const skip = useCallback((seconds: number) => {
    if (!audioElement) return;
    
    const newTime = Math.max(0, Math.min(duration, currentTime + seconds));
    audioElement.currentTime = newTime;
  }, [audioElement, currentTime, duration]);

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const getVolumeIcon = () => {
    if (isMuted || volume === 0) return VolumeX;
    if (volume < 0.5) return Volume1;
    return Volume2;
  };

  const VolumeIcon = getVolumeIcon();

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700 p-4 space-y-4 ${className}`}>
      {/* Progress Bar */}
      <div className="space-y-2">
        <Slider
          value={[currentTime]}
          max={duration || 100}
          step={1}
          onValueChange={handleSeek}
          disabled={!duration}
          className="w-full"
        />
        <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Main Controls */}
      <div className="flex items-center justify-center space-x-4">
        <Button
          variant="outline"
          size="icon"
          onClick={() => skip(-10)}
          disabled={!audioElement}
        >
          <SkipBack className="h-4 w-4" />
        </Button>

        <Button
          variant="default"
          size="icon"
          onClick={togglePlayPause}
          disabled={!audioElement}
          className="h-12 w-12"
        >
          {isPlaying ? (
            <Pause className="h-6 w-6" />
          ) : (
            <Play className="h-6 w-6" />
          )}
        </Button>

        <Button
          variant="outline"
          size="icon"
          onClick={stop}
          disabled={!audioElement}
        >
          <Square className="h-4 w-4" />
        </Button>

        <Button
          variant="outline"
          size="icon"
          onClick={() => skip(10)}
          disabled={!audioElement}
        >
          <SkipForward className="h-4 w-4" />
        </Button>
      </div>

      {/* Volume Control */}
      <div className="flex items-center space-x-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleMute}
          disabled={!audioElement}
        >
          <VolumeIcon className="h-4 w-4" />
        </Button>
        <Slider
          value={[isMuted ? 0 : volume]}
          max={1}
          step={0.1}
          onValueChange={handleVolumeChange}
          disabled={!audioElement}
          className="flex-1 max-w-32"
        />
      </div>
    </div>
  );
};