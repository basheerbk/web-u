"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Music2, SkipForward } from "lucide-react";

import { site } from "@/lib/site";

const VOLUME = 0.55;
const TITLE_MS = 4500;

// Three little bars that bounce while a song is playing.
const Bars = ({ still }: { still: boolean }) => (
  <span aria-hidden className="flex h-[14px] items-end gap-[2px]">
    {[0.55, 1, 0.75].map((height, i) => (
      <motion.span
        key={i}
        className="w-[3px] rounded-full bg-current"
        style={{ height: `${height * 100}%` }}
        animate={still ? undefined : { scaleY: [0.35, 1, 0.5, 0.9, 0.35] }}
        transition={{ duration: 1.1 + i * 0.2, repeat: Infinity, ease: "easeInOut" }}
      />
    ))}
  </span>
);

export const MusicButton = () => {
  const songs = site.music;
  const audioRef = useRef<HTMLAudioElement>(null);
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [showTitle, setShowTitle] = useState(false);
  const reduceMotion = useReducedMotion() ?? false;
  const song = songs[index];

  // Album videos and the music shouldn't talk over each other.
  useEffect(() => {
    const onGallerySound = (event: Event) => {
      if ((event as CustomEvent<string>).detail === "music") return;
      audioRef.current?.pause();
    };
    window.addEventListener("gallery-sound", onGallerySound);
    return () => window.removeEventListener("gallery-sound", onGallerySound);
  }, []);

  useEffect(() => {
    if (!showTitle) return;
    const timer = setTimeout(() => setShowTitle(false), TITLE_MS);
    return () => clearTimeout(timer);
  }, [showTitle, index]);

  const play = async () => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = VOLUME;
    try {
      await audio.play();
      window.dispatchEvent(new CustomEvent("gallery-sound", { detail: "music" }));
      setShowTitle(true);
    } catch {
      // Autoplay blocked or file missing; stay paused.
    }
  };

  const toggle = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) void play();
    else audio.pause();
  };

  const next = () => {
    setIndex((i) => (i + 1) % songs.length);
    setShowTitle(true);
  };

  // A new track loads when the index changes; keep playing if we were.
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !playing) return;
    audio.volume = VOLUME;
    audio.play().catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index]);

  if (songs.length === 0) return null;

  return (
    <div
      className="flex items-center gap-1.5"
      onMouseEnter={() => playing && setShowTitle(true)}
    >
      <audio
        ref={audioRef}
        src={song.src}
        preload="none"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={next}
      />

      <AnimatePresence>
        {showTitle && playing && (
          <motion.div
            className="flex items-center gap-1 rounded-full border border-crema/15 bg-roast/50 py-1 pl-3 pr-1 backdrop-blur-md"
            initial={{ opacity: 0, x: 8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 8 }}
            transition={{ duration: 0.35 }}
          >
            <p className="max-w-[44vw] truncate font-display text-[13px] italic text-crema/85">
              {song.title}
              <span className="not-italic text-crema/45"> · {song.artist}</span>
            </p>
            {songs.length > 1 && (
              <button
                type="button"
                aria-label="Next song"
                onClick={next}
                className="flex h-7 w-7 items-center justify-center rounded-full text-crema/60 transition hover:bg-crema/10 hover:text-crema"
              >
                <SkipForward className="h-3.5 w-3.5" />
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <button
        type="button"
        aria-label={playing ? `Pause ${song.title}` : "Play music"}
        aria-pressed={playing}
        onClick={toggle}
        className={`flex h-9 w-9 items-center justify-center rounded-full transition active:scale-90 ${
          playing ? "text-caramel" : "text-crema/45 hover:text-crema/90"
        }`}
      >
        {playing ? <Bars still={reduceMotion} /> : <Music2 className="h-[18px] w-[18px]" />}
      </button>
    </div>
  );
};
