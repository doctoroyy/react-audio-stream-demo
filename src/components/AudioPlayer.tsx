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
import { Play, Download, Loader2, Mic2, Volume2 } from 'lucide-react';

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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <ThemeToggle />
      
      {/* Hero Section */}
      <div className="pt-16 pb-8">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="text-center space-y-6">
            <div className="flex justify-center">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Volume2 className="w-8 h-8 text-white" />
              </div>
            </div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
              Audio Stream Demo
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Transform your text into lifelike speech with real-time streaming technology
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 max-w-4xl pb-16">
        <div className="space-y-10">
          
          {/* Text Input Section */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border-0 p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                <Mic2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Text to Convert</h2>
            </div>
            <Textarea
              value={text}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setText(e.target.value)}
              placeholder="Enter your text here and watch it come to life with natural speech..."
              className="min-h-[160px] text-base border-0 resize-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              rows={8}
            />
          </div>

          {/* Audio Player Section */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border-0 p-8">
            <div className="space-y-6">
              <audio ref={audioRef} className="hidden" />
              
              {/* Audio Visualizer */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Audio Visualization</h3>
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-700 dark:to-gray-600 rounded-xl p-4">
                  <AudioVisualizer audioElement={audioRef.current} className="w-full h-24" />
                </div>
              </div>

              {/* Enhanced Audio Controls */}
              <EnhancedAudioControls audioElement={audioRef.current} />
            </div>
          </div>

          {/* Voice & Controls Section */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border-0 p-8">
            <div className="space-y-6">
              
              {/* Voice Selection */}
              <div className="space-y-3">
                <label className="text-lg font-semibold text-gray-900 dark:text-white">Voice Selection</label>
                <Select
                  value={voice}
                  onValueChange={(value: string) => setVoice(value)}
                  disabled={voicesQuery.isFetching || voicesQuery.isLoading}
                >
                  <SelectTrigger className="w-full h-12 text-base border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:border-blue-500 dark:focus:border-blue-400">
                    <SelectValue placeholder={
                      voicesQuery.isFetching || voicesQuery.isLoading 
                        ? "Loading voices..." 
                        : "Choose your preferred voice..."
                    } />
                  </SelectTrigger>
                  <SelectContent className="dark:bg-gray-700 dark:text-white">
                    {voicesQuery.isError ? (
                      <SelectItem value="error" disabled>
                        Error loading voices
                      </SelectItem>
                    ) : options.length > 0 ? (
                      options.map((option) => (
                        <SelectItem key={option.value} value={option.value} className="dark:focus:bg-gray-600">
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

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
                <Button
                  disabled={disable}
                  onClick={play}
                  size="lg"
                  className="h-14 px-8 text-base font-semibold bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 border-0 shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  {isFetchingStream ? (
                    <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                  ) : (
                    <Play className="mr-3 h-5 w-5" />
                  )}
                  {isFetchingStream ? 'Generating Audio...' : 'Play Audio'}
                </Button>
                <Button
                  disabled={disable}
                  onClick={download}
                  variant="outline"
                  size="lg"
                  className="h-14 px-8 text-base font-semibold border-2 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-gray-300"
                >
                  {isDownloading ? (
                    <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                  ) : (
                    <Download className="mr-3 h-5 w-5" />
                  )}
                  {isDownloading ? 'Preparing Download...' : 'Download MP3'}
                </Button>
              </div>
            </div>
          </div>

          {/* Keyboard Shortcuts - Collapsible */}
          <KeyboardShortcutsHelp />
        </div>
      </div>
    </div>
  );
};
