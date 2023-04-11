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
        const buff: Uint8Array[] = [];
        let isReady = true;

        sourceBuffer.addEventListener('updateend', () => {
          if (buff.length > 0) {
            sourceBuffer.appendBuffer(buff.shift() as Uint8Array);
          } else {
            isReady = true;
          }
        });

        const response = await fetch(
          'https://edge-tts-as-a-service.doctoroyy.repl.co/tts/stream',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              text,
            }),
          }
        );

        if (!response.ok) {
          throw new Error('Network response was not ok');
        }

        const reader = response.body?.getReader();

        if (!reader) {
          return;
        }

        const pump = async () => {
          const { done, value } = await reader.read();
          if (done) {
            mediaSource.endOfStream();
            sourceBuffer.abort();
          } else {
            if (isReady) {
              sourceBuffer.appendBuffer(value);
              audioRef.current?.play();
              isReady = false;
            } else {
              buff.push(value);
            }
            await pump();
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
