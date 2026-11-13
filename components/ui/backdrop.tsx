"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { videos } from "@/lib/media";
import { useIsPortrait } from "@/lib/hooks";

export const Backdrop = ({
  paused = false,
  onReady,
}: {
  paused?: boolean;
  onReady?: () => void;
}) => {
  const [index, setIndex] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const failedVideos = useRef(0);
  const isPortrait = useIsPortrait();

  const playlist = useMemo(() => {
    const matching = videos.filter(
      (video) => video.height > video.width === isPortrait
    );
    return matching.length > 0 ? matching : videos;
  }, [isPortrait]);
  const current = playlist[index % playlist.length];

  // React doesn't reliably apply `muted` before autoplay kicks in (notably on
  // iOS), so set it on the element and control playback explicitly.
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = true;
    if (paused) video.pause();
    else video.play().catch(() => {});
  }, [current.src, paused]);

  const next = () => setIndex((i) => i + 1);

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden bg-roast">
      <video
        ref={videoRef}
        key={current.src}
        src={current.src}
        poster={current.poster}
        autoPlay
        muted
        playsInline
        preload="auto"
        className="warm-tone h-full w-full object-cover object-center"
        onCanPlay={onReady}
        onEnded={() => {
          failedVideos.current = 0;
          next();
        }}
        onError={() => {
          failedVideos.current += 1;
          if (failedVideos.current < playlist.length) next();
        }}
      />
      <div className="absolute inset-0 bg-roast/50" />
      <div className="absolute inset-0 bg-gradient-to-b from-roast/40 via-transparent to-roast/70" />
    </div>
  );
};
