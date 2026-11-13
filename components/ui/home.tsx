"use client";

import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Coffee, Images, Moon, X } from "lucide-react";

import { Backdrop } from "@/components/ui/backdrop";
import { CoffeeNotes } from "@/components/ui/coffee-notes";
import { BEAN_SHADES, Bean, Steam } from "@/components/ui/coffee";
import { PhotoFan } from "@/components/ui/gallery";
import { Intro, useIntro } from "@/components/ui/intro";
import { Memories } from "@/components/ui/memories";
import { Poem } from "@/components/ui/poem";
import { site } from "@/lib/site";

type Panel = "album" | "poem" | "notes" | null;

type Particle = {
  id: number;
  kind: "bean" | "heart";
  x: number;
  y: number;
  lift: number;
  rotate: number;
  delay: number;
  size: number;
  color: string;
};

const random = (min: number, max: number) => min + Math.random() * (max - min);

const makeParticles = (): Particle[] => [
  ...Array.from({ length: 14 }, (_, id) => ({
    id,
    kind: "bean" as const,
    x: random(-170, 170),
    y: random(220, 420),
    lift: random(60, 140),
    rotate: random(180, 540) * (Math.random() < 0.5 ? -1 : 1),
    delay: random(0, 0.15),
    size: random(14, 22),
    color: BEAN_SHADES[id % BEAN_SHADES.length],
  })),
  ...Array.from({ length: 6 }, (_, i) => ({
    id: 100 + i,
    kind: "heart" as const,
    x: random(-110, 110),
    y: random(-320, -160),
    lift: 0,
    rotate: random(-25, 25),
    delay: random(0.1, 0.4),
    size: random(18, 26),
    color: "",
  })),
];

const iconButton =
  "flex h-14 w-14 items-center justify-center rounded-full border border-crema/10 bg-espresso/80 text-crema/90 shadow-lg backdrop-blur transition hover:bg-espresso";

export const Home = () => {
  const [panel, setPanel] = useState<Panel>(null);
  const [pressed, setPressed] = useState(false);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [backdropReady, setBackdropReady] = useState(false);
  const reduceMotion = useReducedMotion();
  const showIntro = useIntro(backdropReady);

  // Each panel gets a history entry so the phone's back button closes it
  // instead of leaving the site.
  const openPanel = (next: Exclude<Panel, null>) => {
    window.history.pushState({ panel: next }, "");
    setPanel(next);
  };

  const closePanel = useCallback(() => {
    if (window.history.state?.panel) window.history.back();
    else setPanel(null);
  }, []);

  useEffect(() => {
    const onPopState = () => setPanel(window.history.state?.panel ?? null);
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  useEffect(() => {
    if (!panel) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closePanel();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [panel, closePanel]);

  const pressButton = () => {
    setPressed(true);
    if (!reduceMotion) setParticles(makeParticles());
  };

  return (
    <div className="relative h-dvh w-full overflow-hidden bg-roast text-crema">
      <Intro visible={showIntro} />
      <Backdrop
        paused={panel !== null}
        onReady={() => setBackdropReady(true)}
      />

      {/* Center */}
      <div className="relative z-10 flex h-full flex-col items-center justify-center px-6 text-center">
        <Steam className="h-9 w-9 text-crema/35" />
        <motion.h1
          className="mt-4 max-w-xl font-display text-3xl font-light italic leading-tight tracking-tight [text-wrap:balance] md:text-5xl"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, delay: 0.3, ease: "easeOut" }}
        >
          {site.headline}
        </motion.h1>

        <div className="relative mt-10">
          <button
            type="button"
            onClick={pressButton}
            disabled={pressed}
            className="min-h-11 rounded-full border border-crema/25 px-6 py-2 text-sm text-crema/80 backdrop-blur-sm transition hover:border-caramel/70 hover:text-crema disabled:cursor-default disabled:opacity-60"
          >
            {pressed ? "you pressed it anyway ☕" : "please, don't press this"}
          </button>

          <div className="pointer-events-none absolute left-1/2 top-1/2">
            {particles.map((particle) =>
              particle.kind === "bean" ? (
                <motion.div
                  key={particle.id}
                  className="absolute"
                  style={{
                    width: particle.size,
                    height: particle.size * 1.33,
                    marginLeft: -particle.size / 2,
                    marginTop: -particle.size / 2,
                  }}
                  initial={{ x: 0, y: 0, rotate: 0, opacity: 1 }}
                  animate={{
                    x: [0, particle.x * 0.6, particle.x],
                    y: [0, -particle.lift, particle.y],
                    rotate: particle.rotate,
                    opacity: [1, 1, 0],
                  }}
                  transition={{
                    duration: 1.6,
                    delay: particle.delay,
                    times: [0, 0.3, 1],
                    ease: ["easeOut", "easeIn"],
                  }}
                >
                  <Bean color={particle.color} className="h-full w-full" />
                </motion.div>
              ) : (
                <motion.span
                  key={particle.id}
                  className="absolute -translate-x-1/2 -translate-y-1/2"
                  style={{ fontSize: particle.size }}
                  initial={{ x: 0, y: 0, opacity: 0, scale: 0.5 }}
                  animate={{
                    x: particle.x,
                    y: particle.y,
                    opacity: [0, 1, 0],
                    scale: 1.1,
                    rotate: particle.rotate,
                  }}
                  transition={{ duration: 2.4, delay: particle.delay, ease: "easeOut" }}
                >
                  ❤️
                </motion.span>
              )
            )}
          </div>
        </div>

        <AnimatePresence>
          {pressed && (
            <motion.p
              className="mt-6 max-w-sm font-display text-base italic text-crema/75"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.7 }}
            >
              {site.secretNote}
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      {/* Album button */}
      <button
        type="button"
        aria-label="Open album"
        onClick={() => openPanel("album")}
        className={`absolute right-5 top-5 z-20 ${iconButton}`}
      >
        <Images className="h-6 w-6" />
      </button>

      {/* Her poem */}
      <button
        type="button"
        aria-label="Read her poem"
        onClick={() => openPanel("poem")}
        className={`absolute left-5 top-5 z-20 ${iconButton}`}
      >
        <Moon className="h-6 w-6" />
      </button>

      {/* Coffee notes */}
      <button
        type="button"
        aria-label="Read and leave coffee notes"
        onClick={() => openPanel("notes")}
        className={`absolute bottom-5 right-5 z-20 ${iconButton}`}
      >
        <Coffee className="h-6 w-6" />
      </button>

      {/* Album */}
      <AnimatePresence>
        {panel === "album" && (
          <motion.div
            role="dialog"
            aria-label="Album"
            className="fixed inset-0 z-40 overflow-y-auto overscroll-contain bg-roast"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            <button
              type="button"
              aria-label="Close album"
              onClick={closePanel}
              className={`fixed right-5 top-5 z-50 ${iconButton}`}
            >
              <X className="h-6 w-6" />
            </button>

            <div className="flex min-h-[70dvh] flex-col items-center justify-center px-4 pt-16">
              <PhotoFan />
              <p className="mt-2 text-xs tracking-[0.2em] text-crema/45">
                tap a photo to warm it back to color
              </p>
            </div>
            <Memories />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {panel === "poem" && <Poem onClose={closePanel} closeClassName={iconButton} />}
      </AnimatePresence>

      <AnimatePresence>
        {panel === "notes" && (
          <CoffeeNotes onClose={closePanel} closeClassName={iconButton} />
        )}
      </AnimatePresence>
    </div>
  );
};
