import { useEffect, useState } from 'react';
import { Keyboard, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface KeyboardShortcutsProps {
  audioElement: HTMLAudioElement | null;
  onPlay?: () => void;
  onDownload?: () => void;
}

export const useKeyboardShortcuts = ({ 
  audioElement, 
  onPlay, 
  onDownload 
}: KeyboardShortcutsProps) => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in input fields
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement ||
        event.target instanceof HTMLSelectElement
      ) {
        return;
      }

      switch (event.code) {
        case 'Space':
          event.preventDefault();
          if (audioElement) {
            if (audioElement.paused) {
              audioElement.play();
            } else {
              audioElement.pause();
            }
          } else if (onPlay) {
            onPlay();
          }
          break;

        case 'KeyS':
          if (event.ctrlKey || event.metaKey) {
            event.preventDefault();
            if (audioElement) {
              audioElement.pause();
              audioElement.currentTime = 0;
            }
          }
          break;

        case 'KeyD':
          if (event.ctrlKey || event.metaKey) {
            event.preventDefault();
            if (onDownload) {
              onDownload();
            }
          }
          break;

        case 'ArrowLeft':
          event.preventDefault();
          if (audioElement) {
            audioElement.currentTime = Math.max(0, audioElement.currentTime - 10);
          }
          break;

        case 'ArrowRight':
          event.preventDefault();
          if (audioElement) {
            audioElement.currentTime = Math.min(
              audioElement.duration || 0,
              audioElement.currentTime + 10
            );
          }
          break;

        case 'ArrowUp':
          event.preventDefault();
          if (audioElement) {
            audioElement.volume = Math.min(1, audioElement.volume + 0.1);
          }
          break;

        case 'ArrowDown':
          event.preventDefault();
          if (audioElement) {
            audioElement.volume = Math.max(0, audioElement.volume - 0.1);
          }
          break;

        case 'KeyM':
          event.preventDefault();
          if (audioElement) {
            audioElement.muted = !audioElement.muted;
          }
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [audioElement, onPlay, onDownload]);
};

export const KeyboardShortcutsHelp = () => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="glass-card dark:glass-card-dark rounded-3xl overflow-hidden relative group">
      <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 via-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      <Button
        variant="ghost"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-8 flex items-center justify-between hover:bg-white/10 dark:hover:bg-black/20 transition-all duration-300 relative z-10"
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-2xl flex items-center justify-center shadow-lg floating-element">
            <Keyboard className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-blue-600 dark:from-emerald-400 dark:to-blue-400 bg-clip-text text-transparent">
            ⌨️ Keyboard Shortcuts
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-white/70 hidden sm:block">
            {isExpanded ? 'Hide shortcuts' : 'Show shortcuts'}
          </span>
          <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center backdrop-blur-sm">
            {isExpanded ? (
              <ChevronUp className="w-5 h-5 text-white/80" />
            ) : (
              <ChevronDown className="w-5 h-5 text-white/80" />
            )}
          </div>
        </div>
      </Button>
      
      {isExpanded && (
        <div className="px-8 pb-8 relative z-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-center justify-between p-4 glass-card dark:glass-card-dark rounded-2xl hover:shadow-lg transition-all duration-300 group/item">
              <span className="text-white/90 font-medium">🎵 Play/Pause</span>
              <kbd className="px-3 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg text-sm font-bold shadow-lg">
                Space
              </kbd>
            </div>
            <div className="flex items-center justify-between p-4 glass-card dark:glass-card-dark rounded-2xl hover:shadow-lg transition-all duration-300 group/item">
              <span className="text-white/90 font-medium">⏹️ Stop</span>
              <kbd className="px-3 py-2 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-lg text-sm font-bold shadow-lg">
                Ctrl+S
              </kbd>
            </div>
            <div className="flex items-center justify-between p-4 glass-card dark:glass-card-dark rounded-2xl hover:shadow-lg transition-all duration-300 group/item">
              <span className="text-white/90 font-medium">⏭️ Skip ±10 seconds</span>
              <kbd className="px-3 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-lg text-sm font-bold shadow-lg">
                ←/→
              </kbd>
            </div>
            <div className="flex items-center justify-between p-4 glass-card dark:glass-card-dark rounded-2xl hover:shadow-lg transition-all duration-300 group/item">
              <span className="text-white/90 font-medium">🔊 Volume control</span>
              <kbd className="px-3 py-2 bg-gradient-to-r from-green-500 to-teal-500 text-white rounded-lg text-sm font-bold shadow-lg">
                ↑/↓
              </kbd>
            </div>
            <div className="flex items-center justify-between p-4 glass-card dark:glass-card-dark rounded-2xl hover:shadow-lg transition-all duration-300 group/item">
              <span className="text-white/90 font-medium">🔇 Mute toggle</span>
              <kbd className="px-3 py-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-lg text-sm font-bold shadow-lg">
                M
              </kbd>
            </div>
            <div className="flex items-center justify-between p-4 glass-card dark:glass-card-dark rounded-2xl hover:shadow-lg transition-all duration-300 group/item">
              <span className="text-white/90 font-medium">💾 Download audio</span>
              <kbd className="px-3 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg text-sm font-bold shadow-lg">
                Ctrl+D
              </kbd>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};