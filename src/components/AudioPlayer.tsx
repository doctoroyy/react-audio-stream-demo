import React, { FC, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AudioVisualizer } from './AudioVisualizer';
import { EnhancedAudioControls } from './EnhancedAudioControls';
import { ThemeToggle } from './theme-toggle';
import { useKeyboardShortcuts, KeyboardShortcutsHelp } from './KeyboardShortcuts';
import { fetchAudioBlob, fetchAudioStream } from '../queries';
import { downloadFile } from '../utils/download';
import { useVoices } from '../hooks/useVoices';
import { DEFAULT_VOICE } from '../constants';
import { Play, Download, Loader2 } from 'lucide-react';

export const AudioPlayer: FC = () => {
  const [text, setText] = useState('');
  const [voice, setVoice] = useState(DEFAULT_VOICE);

  const audioRef = React.useRef<HTMLAudioElement>(null);
  const mediaSourceRef = React.useRef<MediaSource>();
  const [isFetchingStream, setIsFetchingStream] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const voicesQuery = useVoices();

  const options = useMemo(
    () =>
      voicesQuery.data?.map((voice) => ({
        label: voice.ShortName,
        value: voice.ShortName,
      })) ?? [],
    [voicesQuery.data]
  );

  const play = () => {
    setIsFetchingStream(true);
    if (audioRef.current) {
      try {
        mediaSourceRef.current = new MediaSource();
      } catch (e) {
        console.log(e);
        alert('MediaSource API is not supported by your browser');
        return;
      }

      const url = URL.createObjectURL(mediaSourceRef.current);
      audioRef.current.src = url;
      let isReady = true;
      let isDone = false;
      const buff: Uint8Array[] = [];
      mediaSourceRef.current.addEventListener('sourceopen', async () => {
        const sourceBuffer =
          mediaSourceRef.current!.addSourceBuffer('audio/mpeg');
        sourceBuffer.addEventListener('updateend', () => {
          if (buff.length > 0) {
            sourceBuffer.appendBuffer(buff.shift() as Uint8Array);
          } else {
            if (isDone) {
              mediaSourceRef.current!.endOfStream();
              sourceBuffer.abort();
            } else {
              isReady = true;
            }
          }
        });

        const response = await fetchAudioStream(text, voice);
        const reader = response?.getReader();

        if (!reader) {
          return;
        }

        const pump = async () => {
          const { done, value } = await reader.read();
          if (done) {
            isDone = true;
            return;
          }
          if (isReady) {
            sourceBuffer.appendBuffer(value);
            audioRef.current?.play();
            setIsFetchingStream(false);
            isReady = false;
          } else {
            buff.push(value);
          }
          await pump();
        };

        await pump();
      });
    }
  };

  const download = async () => {
    setIsDownloading(true);
    try {
      const blob = await fetchAudioBlob(text, voice);
      const url = window.URL.createObjectURL(blob);
      downloadFile(url, 'audio.mp3');
    } finally {
      setIsDownloading(false);
    }
  };

  const disable = text.length === 0;

  // Setup keyboard shortcuts
  useKeyboardShortcuts({
    audioElement: audioRef.current,
    onPlay: play,
    onDownload: download,
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 relative">
      <ThemeToggle />
      <div className="container mx-auto p-8 max-w-4xl">
        <div className="space-y-8">
          <div className="text-center space-y-2">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white">Audio Stream Demo</h1>
            <p className="text-gray-600 dark:text-gray-300 text-lg">
              Convert text to speech with real-time streaming
            </p>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Text to Convert</label>
              <Textarea
                value={text}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setText(e.target.value)}
                placeholder="Enter text to convert to speech..."
                className="min-h-[200px] text-base dark:bg-gray-800 dark:text-white"
                rows={10}
              />
            </div>

            <div className="space-y-4">
              <audio ref={audioRef} className="hidden" />
              
              {/* Audio Visualizer */}
              <div className="bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700 p-4">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Audio Visualization</h3>
                <AudioVisualizer audioElement={audioRef.current} className="w-full h-32" />
              </div>

              {/* Enhanced Audio Controls */}
              <EnhancedAudioControls audioElement={audioRef.current} />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Voice Selection</label>
              <Select
                value={voice}
                onValueChange={(value: string) => setVoice(value)}
                disabled={voicesQuery.isFetching || voicesQuery.isLoading}
              >
                <SelectTrigger className="w-full max-w-sm mx-auto dark:bg-gray-800 dark:text-white">
                  <SelectValue placeholder={
                    voicesQuery.isFetching || voicesQuery.isLoading 
                      ? "Loading voices..." 
                      : "Select a voice..."
                  } />
                </SelectTrigger>
                <SelectContent className="dark:bg-gray-800 dark:text-white">
                  {voicesQuery.isError ? (
                    <SelectItem value="error" disabled>
                      Error loading voices
                    </SelectItem>
                  ) : options.length > 0 ? (
                    options.map((option) => (
                      <SelectItem key={option.value} value={option.value} className="dark:focus:bg-gray-700">
                        {option.label}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="loading" disabled>
                      {voicesQuery.isFetching ? "Loading..." : "No voices available"}
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-center gap-4">
              <Button
                disabled={disable}
                onClick={play}
                size="lg"
                className="min-w-32"
              >
                {isFetchingStream ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Play className="mr-2 h-4 w-4" />
                )}
                {isFetchingStream ? 'Loading...' : 'Play'}
              </Button>
              <Button
                disabled={disable}
                onClick={download}
                variant="outline"
                size="lg"
                className="min-w-32 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
              >
                {isDownloading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Download className="mr-2 h-4 w-4" />
                )}
                {isDownloading ? 'Downloading...' : 'Download MP3'}
              </Button>
            </div>

            {/* Keyboard Shortcuts Help */}
            <KeyboardShortcutsHelp />
          </div>
        </div>
      </div>
    </div>
  );
};
