import { Button, Input, Layout, Row, Space, message } from 'antd';
import React, { FC, useState } from 'react';

export const AudioPlayer: FC = () => {
  const [text, setText] = useState('');

  const audioRef = React.useRef<HTMLAudioElement>(null);
  const mediaSourceRef = React.useRef<MediaSource>();

  const play = () => {
    if (audioRef.current) {
      try {
        mediaSourceRef.current = new MediaSource();
      } catch (e) {
        console.log(e);
        message.error('MediaSource API is not supported by your browser');
        return;
      }

      const url = URL.createObjectURL(mediaSourceRef.current);
      audioRef.current.src = url;
      let isReady = true;
      let isDone = false;
      const buff: Uint8Array[] = [];
      mediaSourceRef.current.addEventListener('sourceopen', async () => {
        const sourceBuffer = mediaSourceRef.current!.addSourceBuffer('audio/mpeg');
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

        const response = await fetch('https://edge-tts-as-a-service.doctoroyy.repl.co/tts/stream', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            text,
          }),
        });

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
            isDone = true;
            return;
          }
          if (isReady) {
            sourceBuffer.appendBuffer(value);
            audioRef.current?.play();
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
    message.loading('downloading...', 0);

    try {
      const response = await fetch('https://edge-tts-as-a-service.doctoroyy.repl.co/tts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
        }),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'audio.mp3';
      a.click();
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
      }, 0);
    } finally {
      message.destroy();
    }
  };

  const disable = text.length === 0;

  return (
    <Layout>
      <Layout.Content>
        <Input.TextArea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Enter text to convert to speech"
          autoSize={{ minRows: 10, maxRows: 20 }}
        />
        <Row gutter={16}>
          <audio ref={audioRef} controls />
        </Row>
        <Row justify="center" gutter={16}>
          <Space>
            <Button disabled={disable} onClick={play}>
              Play
            </Button>
            <Button disabled={disable} onClick={download}>
              Download MP3
            </Button>
          </Space>
        </Row>
      </Layout.Content>
    </Layout>
  );
};
