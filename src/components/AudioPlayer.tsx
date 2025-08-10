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
    <div className="min-h-screen animated-bg dark:animated-bg-dark relative overflow-hidden">
      {/* Floating decoration elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-purple-300/20 rounded-full blur-xl floating-element"></div>
        <div className="absolute top-40 right-20 w-24 h-24 bg-pink-300/20 rounded-full blur-xl floating-element" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-40 left-1/3 w-40 h-40 bg-blue-300/20 rounded-full blur-xl floating-element" style={{ animationDelay: '4s' }}></div>
        <div className="absolute bottom-20 right-10 w-28 h-28 bg-indigo-300/20 rounded-full blur-xl floating-element" style={{ animationDelay: '1s' }}></div>
      </div>

      <ThemeToggle />
      
      {/* Hero Section */}
      <div className="pt-20 pb-12 relative z-10">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="text-center space-y-8">
            <div className="flex justify-center">
              <div className="relative">
                <div className="w-24 h-24 bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 rounded-3xl flex items-center justify-center shadow-2xl floating-element glow-button">
                  <Volume2 className="w-12 h-12 text-white" />
                </div>
                <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 rounded-3xl blur opacity-30"></div>
              </div>
            </div>
            <div className="space-y-4">
              <h1 className="text-7xl font-black bg-gradient-to-r from-purple-400 via-pink-400 to-red-400 dark:from-purple-300 dark:via-pink-300 dark:to-red-300 bg-clip-text text-transparent tracking-tight">
                Audio Stream
              </h1>
              <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 dark:from-blue-400 dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent">
                Studio
              </h2>
            </div>
            <p className="text-2xl text-white/90 dark:text-white/80 max-w-3xl mx-auto font-medium leading-relaxed">
              ✨ Transform your text into lifelike speech with cutting-edge AI technology
            </p>
            <div className="flex justify-center space-x-4 text-white/70">
              <span className="px-4 py-2 bg-white/10 rounded-full backdrop-blur-sm">Real-time Streaming</span>
              <span className="px-4 py-2 bg-white/10 rounded-full backdrop-blur-sm">HD Audio Quality</span>
              <span className="px-4 py-2 bg-white/10 rounded-full backdrop-blur-sm">Multiple Voices</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 max-w-5xl pb-20 relative z-10">
        <div className="space-y-12">
          
          {/* Text Input Section */}
          <div className="glass-card dark:glass-card-dark rounded-3xl p-10 relative overflow-hidden group hover:shadow-2xl transition-all duration-500">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-pink-500/5 to-red-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg">
                  <Mic2 className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400 bg-clip-text text-transparent">
                  Text to Convert
                </h2>
              </div>
              <Textarea
                value={text}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setText(e.target.value)}
                placeholder="Enter your text here and watch it transform into beautiful, natural speech with our advanced AI technology..."
                className="min-h-[180px] text-lg border-0 resize-none focus:ring-2 focus:ring-purple-500/50 bg-white/50 dark:bg-black/30 backdrop-blur-sm rounded-2xl p-6 text-gray-800 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 transition-all duration-300"
                rows={8}
              />
            </div>
          </div>

          {/* Audio Player Section */}
          <div className="glass-card dark:glass-card-dark rounded-3xl p-10 relative overflow-hidden group hover:shadow-2xl transition-all duration-500">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-indigo-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative z-10 space-y-8">
              <audio ref={audioRef} className="hidden" />
              
              {/* Audio Visualizer */}
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center">
                    <Volume2 className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
                    Audio Visualization
                  </h3>
                </div>
                <div className="relative">
                  <div className="glass-card dark:glass-card-dark rounded-2xl p-6 bg-gradient-to-br from-blue-50/50 to-indigo-100/50 dark:from-blue-900/20 dark:to-indigo-900/20">
                    <AudioVisualizer audioElement={audioRef.current} className="w-full h-32" />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-400/10 to-purple-400/10 rounded-2xl pointer-events-none"></div>
                </div>
              </div>

              {/* Enhanced Audio Controls */}
              <div className="glass-card dark:glass-card-dark rounded-2xl p-6">
                <EnhancedAudioControls audioElement={audioRef.current} />
              </div>
            </div>
          </div>

          {/* Voice & Controls Section */}
          <div className="glass-card dark:glass-card-dark rounded-3xl p-10 relative overflow-hidden group hover:shadow-2xl transition-all duration-500">
            <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 via-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative z-10 space-y-8">
              
              {/* Voice Selection */}
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-500 rounded-xl flex items-center justify-center">
                    <Mic2 className="w-5 h-5 text-white" />
                  </div>
                  <label className="text-xl font-bold bg-gradient-to-r from-green-600 to-blue-600 dark:from-green-400 dark:to-blue-400 bg-clip-text text-transparent">
                    Voice Selection
                  </label>
                </div>
                <Select
                  value={voice}
                  onValueChange={(value: string) => setVoice(value)}
                  disabled={voicesQuery.isFetching || voicesQuery.isLoading}
                >
                  <SelectTrigger className="w-full h-16 text-lg border-0 bg-white/50 dark:bg-black/30 backdrop-blur-sm rounded-2xl px-6 text-gray-800 dark:text-white focus:ring-2 focus:ring-green-500/50 transition-all duration-300 hover:shadow-lg">
                    <SelectValue placeholder={
                      voicesQuery.isFetching || voicesQuery.isLoading 
                        ? "🔄 Loading voices..." 
                        : "🎤 Choose your preferred voice..."
                    } />
                  </SelectTrigger>
                  <SelectContent className="bg-white/80 dark:bg-black/80 backdrop-blur-xl border-0 shadow-2xl rounded-2xl">
                    {voicesQuery.isError ? (
                      <SelectItem value="error" disabled className="text-red-500">
                        ❌ Error loading voices
                      </SelectItem>
                    ) : options.length > 0 ? (
                      options.map((option) => (
                        <SelectItem 
                          key={option.value} 
                          value={option.value} 
                          className="dark:focus:bg-gray-600/50 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-xl m-1 text-gray-800 dark:text-white"
                        >
                          🗣️ {option.label}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="loading" disabled className="text-gray-500">
                        {voicesQuery.isFetching ? "⏳ Loading..." : "No voices available"}
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row justify-center gap-6 pt-6">
                <Button
                  disabled={disable}
                  onClick={play}
                  size="lg"
                  className="h-18 px-12 text-xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 hover:from-purple-700 hover:via-pink-700 hover:to-red-700 border-0 shadow-2xl hover:shadow-purple-500/25 transition-all duration-300 rounded-2xl relative overflow-hidden group"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                  <div className="relative z-10 flex items-center">
                    {isFetchingStream ? (
                      <Loader2 className="mr-4 h-6 w-6 animate-spin" />
                    ) : (
                      <Play className="mr-4 h-6 w-6" />
                    )}
                    {isFetchingStream ? '✨ Generating Audio...' : '🎵 Play Audio'}
                  </div>
                </Button>
                <Button
                  disabled={disable}
                  onClick={download}
                  variant="outline"
                  size="lg"
                  className="h-18 px-12 text-xl font-bold border-2 border-white/30 dark:border-white/20 bg-white/10 dark:bg-black/20 backdrop-blur-sm hover:bg-white/20 dark:hover:bg-black/30 text-white dark:text-white rounded-2xl transition-all duration-300 hover:shadow-2xl"
                >
                  <div className="flex items-center">
                    {isDownloading ? (
                      <Loader2 className="mr-4 h-6 w-6 animate-spin" />
                    ) : (
                      <Download className="mr-4 h-6 w-6" />
                    )}
                    {isDownloading ? '📦 Preparing Download...' : '💾 Download MP3'}
                  </div>
                </Button>
              </div>
            </div>
          </div>

          {/* Keyboard Shortcuts - Enhanced */}
          <div className="glass-card dark:glass-card-dark rounded-3xl p-2 relative overflow-hidden hover:shadow-xl transition-all duration-500">
            <KeyboardShortcutsHelp />
          </div>
        </div>
      </div>
    </div>
  );
};
