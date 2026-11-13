"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

import { Cup, Steam } from "@/components/ui/coffee";

const INTRO_SEEN_KEY = "nayana:intro-seen";
const MIN_INTRO_MS = 1000;
const MAX_INTRO_MS = 1600;

// sessionStorage throws in some private-browsing and in-app browser modes.
const readIntroSeen = () => {
  try {
    return sessionStorage.getItem(INTRO_SEEN_KEY) === "1";
  } catch {
    return false;
  }
};

const markIntroSeen = () => {
  try {
    sessionStorage.setItem(INTRO_SEEN_KEY, "1");
  } catch {}
};

// Visible until the backdrop can play (after a short minimum) or the maximum
// time runs out. Shown once per session, and skipped for reduced motion.
export const useIntro = (backdropReady: boolean) => {
  const reduceMotion = useReducedMotion();
  const [done, setDone] = useState(false);
  const [minElapsed, setMinElapsed] = useState(false);

  useEffect(() => {
    if (reduceMotion || readIntroSeen()) {
      const skip = setTimeout(() => setDone(true), 0);
      return () => clearTimeout(skip);
    }
    markIntroSeen();
    const min = setTimeout(() => setMinElapsed(true), MIN_INTRO_MS);
    const max = setTimeout(() => setDone(true), MAX_INTRO_MS);
    return () => {
      clearTimeout(min);
      clearTimeout(max);
    };
  }, [reduceMotion]);

  return !done && !(minElapsed && backdropReady);
};

export const Intro = ({ visible }: { visible: boolean }) => (
  <AnimatePresence>
    {visible && (
      <motion.div
        aria-hidden
        className="fixed inset-0 z-[55] flex flex-col items-center justify-center bg-roast text-crema/80"
        exit={{ opacity: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <div className="relative">
          <Steam className="absolute -top-9 left-1/2 h-10 w-10 -translate-x-1/2 text-crema/60" />
          <Cup className="h-20 w-20" />
        </div>
        <p className="mt-5 font-display text-sm italic tracking-wide text-crema/60">
          brewing…
        </p>
      </motion.div>
    )}
  </AnimatePresence>
);
