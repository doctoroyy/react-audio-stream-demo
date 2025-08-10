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
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border-0 overflow-hidden">
      <Button
        variant="ghost"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-6 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
            <Keyboard className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          </div>
          <span className="text-lg font-semibold text-gray-900 dark:text-white">
            Keyboard Shortcuts
          </span>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-5 h-5 text-gray-500" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-500" />
        )}
      </Button>
      
      {isExpanded && (
        <div className="px-6 pb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <span className="text-gray-700 dark:text-gray-300">Play/Pause</span>
              <kbd className="px-2 py-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded text-xs font-mono text-gray-900 dark:text-gray-100">
                Space
              </kbd>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <span className="text-gray-700 dark:text-gray-300">Stop</span>
              <kbd className="px-2 py-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded text-xs font-mono text-gray-900 dark:text-gray-100">
                Ctrl+S
              </kbd>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <span className="text-gray-700 dark:text-gray-300">Skip ±10 seconds</span>
              <kbd className="px-2 py-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded text-xs font-mono text-gray-900 dark:text-gray-100">
                ←/→
              </kbd>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <span className="text-gray-700 dark:text-gray-300">Volume control</span>
              <kbd className="px-2 py-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded text-xs font-mono text-gray-900 dark:text-gray-100">
                ↑/↓
              </kbd>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <span className="text-gray-700 dark:text-gray-300">Mute toggle</span>
              <kbd className="px-2 py-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded text-xs font-mono text-gray-900 dark:text-gray-100">
                M
              </kbd>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <span className="text-gray-700 dark:text-gray-300">Download audio</span>
              <kbd className="px-2 py-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded text-xs font-mono text-gray-900 dark:text-gray-100">
                Ctrl+D
              </kbd>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};