"use client";

import { useEffect, useRef, useState } from "react";
import { motion, type Variants } from "framer-motion";
import Image from "next/image";
import { LoaderCircle, RefreshCw, Volume2, VolumeX } from "lucide-react";

import { cn } from "@/lib/utils";
import { photos, videos, type Photo, type Video } from "@/lib/media";

const imagePlaceholder =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 8 12'%3E%3Crect width='8' height='12' fill='%23201612'/%3E%3C/svg%3E";

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

const MemoryPhoto = ({ photo }: { photo: Photo }) => {
  const [inColor, setInColor] = useState(false);
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);

  return (
    <motion.button
      type="button"
      aria-pressed={inColor}
      aria-label={inColor ? "Show photo in warm tone" : "Show photo in color"}
      onClick={() => {
        if (failed) {
          setFailed(false);
          setAttempt((value) => value + 1);
          return;
        }
        setInColor((value) => !value);
      }}
      className="group relative mb-4 block w-full break-inside-avoid overflow-hidden rounded-3xl bg-espresso/60 shadow-lg"
      variants={fadeUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-50px" }}
    >
      <Image
        key={`${photo.src}-${attempt}`}
        src={photo.src}
        width={photo.width}
        height={photo.height}
        alt=""
        sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw"
        loading="lazy"
        decoding="async"
        placeholder={imagePlaceholder}
        onError={() => setFailed(true)}
        draggable={false}
        className={cn(
          "h-auto w-full transition duration-700 [@media(hover:hover)]:group-hover:scale-105 [@media(hover:hover)]:group-hover:warm-tone-none",
          inColor ? "warm-tone-none" : "warm-tone"
        )}
      />
      {failed && (
        <span className="absolute inset-0 flex items-center justify-center bg-espresso/90 px-5 text-center text-xs tracking-[0.14em] text-crema/70">
          photo unavailable — tap to retry
        </span>
      )}
    </motion.button>
  );
};

const MemoryVideo = ({ video, index }: { video: Video; index: number }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [attempt, setAttempt] = useState(0);
  const [inView, setInView] = useState(false);
  const [shouldLoad, setShouldLoad] = useState(false);
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);
  const [muted, setMuted] = useState(true);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const scrollRoot = container.closest('[role="dialog"]');

    const loadObserver = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setShouldLoad(true);
      },
      {
        root: scrollRoot,
        rootMargin: "300px 0px",
        threshold: 0.01,
      }
    );

    const playbackObserver = new IntersectionObserver(
      ([entry]) => {
        setInView(entry.isIntersecting);
        if (!entry.isIntersecting) {
          setMuted(true);
          setLoading(false);
        }
      },
      {
        root: scrollRoot,
        threshold: 0.2,
      }
    );

    loadObserver.observe(container);
    playbackObserver.observe(container);
    return () => {
      loadObserver.disconnect();
      playbackObserver.disconnect();
    };
  }, []);

  useEffect(() => {
    const current = videoRef.current;
    if (!current) return;

    if (inView) {
      if (shouldLoad) {
        current.muted = muted;
        current.play().catch(() => {});
      }
    } else {
      current.pause();
      current.muted = true;
    }
  }, [inView, muted, shouldLoad]);

  useEffect(() => {
    const muteWhenAnotherVideoGetsSound = (event: Event) => {
      const source = (event as CustomEvent<string>).detail;
      if (source === video.src) return;
      if (videoRef.current) videoRef.current.muted = true;
      setMuted(true);
    };

    window.addEventListener("gallery-sound", muteWhenAnotherVideoGetsSound);
    return () =>
      window.removeEventListener("gallery-sound", muteWhenAnotherVideoGetsSound);
  }, [video.src]);

  const toggleSound = () => {
    const current = videoRef.current;
    if (!current) return;

    const nextMuted = !muted;
    current.muted = nextMuted;
    setMuted(nextMuted);

    if (!nextMuted) {
      window.dispatchEvent(
        new CustomEvent<string>("gallery-sound", { detail: video.src })
      );
      current.play().catch(() => {});
    }
  };

  return (
    <motion.div
      ref={containerRef}
      className="relative mb-4 break-inside-avoid overflow-hidden rounded-3xl bg-espresso/60 shadow-lg"
      style={{ aspectRatio: `${video.width} / ${video.height}` }}
      variants={fadeUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-50px" }}
    >
      {shouldLoad ? (
        <video
          key={`${video.src}-${attempt}`}
          ref={videoRef}
          data-gallery-video
          src={video.src}
          poster={video.poster}
          aria-label={`Memory video ${index + 1}`}
          loop
          muted={muted}
          playsInline
          preload="metadata"
          className="h-full w-full object-cover"
          onPlaying={() => setLoading(false)}
          onCanPlay={() => setLoading(false)}
          onWaiting={() => setLoading(true)}
          onStalled={() => setLoading(true)}
          onError={() => {
            setLoading(false);
            setFailed(true);
          }}
        />
      ) : (
        <Image
          src={video.poster}
          alt=""
          fill
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover"
        />
      )}

      {shouldLoad && !failed && (
        <button
          type="button"
          aria-label={muted ? `Turn on sound for memory video ${index + 1}` : `Mute memory video ${index + 1}`}
          onClick={toggleSound}
          className="absolute inset-0 z-10 cursor-pointer rounded-3xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-caramel"
        >
          <span className="absolute bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-1.5 whitespace-nowrap rounded-full bg-roast/65 px-3 py-1.5 text-[10px] tracking-[0.12em] text-crema/85 backdrop-blur-sm sm:text-xs">
            {muted ? (
              <VolumeX className="h-3.5 w-3.5" />
            ) : (
              <Volume2 className="h-3.5 w-3.5" />
            )}
            {muted ? "tap for sound" : "sound on · tap to mute"}
          </span>
        </button>
      )}

      {loading && !failed && (
        <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center bg-roast/35 text-crema">
          <span className="flex items-center gap-2 rounded-full bg-roast/75 px-4 py-2 text-xs tracking-[0.14em] backdrop-blur">
            <LoaderCircle className="h-4 w-4 animate-spin" />
            brewing video…
          </span>
        </div>
      )}

      {failed && (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-3 bg-roast/90 px-6 text-center text-crema">
          <p className="text-sm text-crema/75">This memory did not load.</p>
          <button
            type="button"
            onClick={() => {
              setFailed(false);
              setAttempt((value) => value + 1);
            }}
            className="flex min-h-11 items-center gap-2 rounded-full border border-crema/25 px-4 py-2 text-sm transition hover:border-caramel/70"
          >
            <RefreshCw className="h-4 w-4" />
            try again
          </button>
        </div>
      )}
    </motion.div>
  );
};

export const Memories = () => {
  return (
    <section className="relative bg-roast px-4 py-20 text-crema">
      <div className="mx-auto max-w-7xl">
        <motion.h2
          className="mb-10 text-center font-display text-4xl font-light italic tracking-tight md:text-6xl"
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          Moments
        </motion.h2>

        <div className="mb-24 columns-1 gap-4 sm:columns-2 lg:columns-3">
          {videos.map((video, index) => (
            <MemoryVideo key={video.src} video={video} index={index} />
          ))}
        </div>

        <motion.h2
          className="mb-10 text-center font-display text-4xl font-light italic tracking-tight md:text-6xl"
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          Memories
        </motion.h2>

        <div className="columns-2 gap-4 md:columns-3 lg:columns-4">
          {photos.map((photo) => (
            <MemoryPhoto key={photo.src} photo={photo} />
          ))}
        </div>
      </div>
    </section>
  );
};
