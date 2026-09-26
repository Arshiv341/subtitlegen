import React, { forwardRef } from 'react';

const VideoPlayer = forwardRef(function VideoPlayer({ videoUrl, onTimeUpdate }, ref) {
  return (
    <div className="w-full bg-black rounded-lg overflow-hidden border border-border aspect-video">
      <video
        ref={ref}
        src={videoUrl}
        controls
        playsInline
        onTimeUpdate={onTimeUpdate}
        className="w-full h-full object-contain"
      />
    </div>
  );
});

export default VideoPlayer;
