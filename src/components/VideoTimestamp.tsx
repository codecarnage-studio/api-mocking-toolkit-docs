import React from 'react';

/**
 * Simple component to jump the embedded YouTube player to a specific timestamp.
 *
 * Usage in MDX:
 *
 * ```mdx
 * import VideoTimestamp from '@site/src/components/VideoTimestamp';
 *
 * ## Run the Demo Scene
 * <VideoTimestamp seconds={60} label="Jump to video @ 1:00" />
 * ```
 *
 * Requirements:
 * - The page must contain a YouTube iframe with id="demo-video".
 * - The iframe src must include `?enablejsapi=1` so the postMessage API works.
 */
export interface VideoTimestampProps {
  seconds: number;
  label?: string;
}

function formatTime(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

const VideoTimestamp: React.FC<VideoTimestampProps> = ({ seconds, label }) => {
  const handleClick = () => {
    const iframe = document.getElementById('demo-video') as HTMLIFrameElement | null;
    if (!iframe || !iframe.contentWindow) return;

    const seekMessage = JSON.stringify({
      event: 'command',
      func: 'seekTo',
      args: [seconds, true],
    });

    const playMessage = JSON.stringify({
      event: 'command',
      func: 'playVideo',
      args: [],
    });

    iframe.contentWindow.postMessage(seekMessage, '*');
    iframe.contentWindow.postMessage(playMessage, '*');
  };

  return (
    <button type="button" className="video-timestamp-link" onClick={handleClick}>
      {label ?? `Jump to ${formatTime(seconds)}`}
    </button>
  );
};

export default VideoTimestamp;
