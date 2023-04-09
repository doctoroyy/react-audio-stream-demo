import { Button, Input, Layout } from 'antd';
import React, { FC, useState } from 'react';

interface AudioPlayerProps {
  [key: string]: any;
}

export const AudioPlayer: FC<AudioPlayerProps> = (props) => {
  const [text, setText] = useState('');

  const audioRef = React.useRef<HTMLAudioElement>(null);

  const play = () => {
    if (audioRef.current) {
      const mediaSource = new MediaSource();
      const url = URL.createObjectURL(mediaSource);
      audioRef.current.src = url;
      mediaSource.addEventListener('sourceopen', async () => {
        const sourceBuffer = mediaSource.addSourceBuffer('audio/mpeg');
        const audioReader = await fetch(
          'http://101.43.199.9:5000/tts/stream/tts/stream',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              text: decodeURIComponent(text),
            }),
          }
        );

        const reader = audioReader.body?.getReader();

        const pump = async () => {
          if (reader) {
            const { done, value } = await reader.read();
            if (done) {
              mediaSource.endOfStream();
              sourceBuffer.abort();
            } else {
              sourceBuffer.appendBuffer(value);
              if (audioRef.current?.paused) {
                audioRef.current.play();
              }
              pump();
            }
          }
        };
        pump();
      });
    }
  };

  return (
    <Layout>
      <Layout.Content>
        <Input.TextArea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="请输入小说正文"
          autoSize={{ minRows: 10, maxRows: 20 }}
        />
        <audio ref={audioRef} controls />
        <Button disabled={text.length === 0} onClick={play}>
          Play
        </Button>
      </Layout.Content>
    </Layout>
  );
};
