import React, { useEffect, useRef } from "react";
import Hls from "hls.js";

const HlsVideoPlayer = ({ tsFiles, m3u8File }) => {
  const videoRef = useRef(null);

  useEffect(() => {
    const video = videoRef.current;

    if (Hls.isSupported()) {
      const hls = new Hls();

      hls.on(Hls.Events.ERROR, (event, data) => {
        console.error(`HLS.js error: ${data.type} - ${data.details}`);
      });

      hls.loadSource(m3u8File);
      hls.attachMedia(video);
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = m3u8File;
    }
  }, [tsFiles, m3u8File]);

  return <video ref={videoRef} controls width="100%" height="auto" />;
};

export default HlsVideoPlayer;
