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
    <div className={`glass-card dark:glass-card-dark rounded-2xl p-6 space-y-6 relative overflow-hidden group ${className}`}>
      <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-pink-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      
      {/* Progress Bar */}
      <div className="space-y-3 relative z-10">
        <Slider
          value={[currentTime]}
          max={duration || 100}
          step={1}
          onValueChange={handleSeek}
          disabled={!duration}
          className="w-full"
        />
        <div className="flex justify-between text-sm font-medium">
          <span className="px-2 py-1 bg-purple-500/20 text-purple-300 rounded-lg backdrop-blur-sm">
            {formatTime(currentTime)}
          </span>
          <span className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded-lg backdrop-blur-sm">
            {formatTime(duration)}
          </span>
        </div>
      </div>

      {/* Main Controls */}
      <div className="flex items-center justify-center space-x-4 relative z-10">
        <Button
          variant="outline"
          size="icon"
          onClick={() => skip(-10)}
          disabled={!audioElement}
          className="h-12 w-12 glass-card dark:glass-card-dark border-white/20 hover:bg-gradient-to-r hover:from-orange-500/20 hover:to-red-500/20 transition-all duration-300 hover:shadow-lg group/btn"
        >
          <SkipBack className="h-5 w-5 text-white/80 group-hover/btn:text-orange-300 transition-colors" />
        </Button>

        <Button
          variant="default"
          size="icon"
          onClick={togglePlayPause}
          disabled={!audioElement}
          className="h-16 w-16 bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 hover:from-purple-700 hover:via-pink-700 hover:to-red-700 border-0 shadow-2xl hover:shadow-purple-500/25 rounded-2xl transition-all duration-300 relative overflow-hidden group/play"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 opacity-0 group-hover/play:opacity-20 transition-opacity duration-300"></div>
          {isPlaying ? (
            <Pause className="h-8 w-8 text-white relative z-10" />
          ) : (
            <Play className="h-8 w-8 text-white relative z-10" />
          )}
        </Button>

        <Button
          variant="outline"
          size="icon"
          onClick={stop}
          disabled={!audioElement}
          className="h-12 w-12 glass-card dark:glass-card-dark border-white/20 hover:bg-gradient-to-r hover:from-red-500/20 hover:to-pink-500/20 transition-all duration-300 hover:shadow-lg group/btn"
        >
          <Square className="h-5 w-5 text-white/80 group-hover/btn:text-red-300 transition-colors" />
        </Button>

        <Button
          variant="outline"
          size="icon"
          onClick={() => skip(10)}
          disabled={!audioElement}
          className="h-12 w-12 glass-card dark:glass-card-dark border-white/20 hover:bg-gradient-to-r hover:from-blue-500/20 hover:to-indigo-500/20 transition-all duration-300 hover:shadow-lg group/btn"
        >
          <SkipForward className="h-5 w-5 text-white/80 group-hover/btn:text-blue-300 transition-colors" />
        </Button>
      </div>

      {/* Volume Control */}
      <div className="flex items-center space-x-4 relative z-10">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleMute}
          disabled={!audioElement}
          className="h-10 w-10 glass-card dark:glass-card-dark border-white/10 hover:bg-gradient-to-r hover:from-green-500/20 hover:to-teal-500/20 transition-all duration-300 group/vol"
        >
          <VolumeIcon className="h-5 w-5 text-white/80 group-hover/vol:text-green-300 transition-colors" />
        </Button>
        <div className="flex-1 max-w-40">
          <Slider
            value={[isMuted ? 0 : volume]}
            max={1}
            step={0.1}
            onValueChange={handleVolumeChange}
            disabled={!audioElement}
            className="w-full"
          />
        </div>
        <div className="w-12 text-right">
          <span className="text-sm font-medium text-white/70">
            {Math.round((isMuted ? 0 : volume) * 100)}%
          </span>
        </div>
      </div>
    </div>
  );
};