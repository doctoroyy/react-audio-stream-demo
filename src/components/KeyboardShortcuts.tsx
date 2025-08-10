import { useEffect } from 'react';

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
  return (
    <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 text-sm">
      <h3 className="font-medium text-gray-900 dark:text-white mb-2">Keyboard Shortcuts</h3>
      <div className="grid grid-cols-2 gap-2 text-gray-600 dark:text-gray-300">
        <div><kbd className="px-1 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-xs">Space</kbd> Play/Pause</div>
        <div><kbd className="px-1 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-xs">Ctrl+S</kbd> Stop</div>
        <div><kbd className="px-1 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-xs">←/→</kbd> Skip ±10s</div>
        <div><kbd className="px-1 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-xs">↑/↓</kbd> Volume</div>
        <div><kbd className="px-1 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-xs">M</kbd> Mute</div>
        <div><kbd className="px-1 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-xs">Ctrl+D</kbd> Download</div>
      </div>
    </div>
  );
};