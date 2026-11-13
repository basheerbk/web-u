"use client";

import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Images, MountainSnow, Moon, X } from "lucide-react";

import { Backdrop } from "@/components/ui/backdrop";
import { CoffeeNotes, type NotesFocus } from "@/components/ui/coffee-notes";
import { Steam } from "@/components/ui/coffee";
import { PhotoFan } from "@/components/ui/gallery";
import { Intro, useIntro } from "@/components/ui/intro";
import { MusicButton } from "@/components/ui/music";
import { Memories } from "@/components/ui/memories";
import { Poem } from "@/components/ui/poem";
import { site } from "@/lib/site";

type Panel = "album" | "poem" | "notes" | null;

const iconButton =
  "flex h-14 w-14 items-center justify-center rounded-full border border-crema/10 bg-espresso/80 text-crema/90 shadow-lg backdrop-blur transition hover:bg-espresso";

const fadeIn = (delay: number) => ({
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 1, delay, ease: "easeOut" as const },
});

export const Home = () => {
  const [panel, setPanel] = useState<Panel>(null);
  const [notesFocus, setNotesFocus] = useState<NotesFocus>("read");
  const [backdropReady, setBackdropReady] = useState(false);
  const [mountainNote, setMountainNote] = useState(0);
  const showIntro = useIntro(backdropReady);

  // Each panel gets a history entry so the phone's back button closes it
  // instead of leaving the site.
  const openPanel = (next: Exclude<Panel, null>) => {
    window.history.pushState({ panel: next }, "");
    setPanel(next);
  };

  const openNotes = (focus: NotesFocus) => {
    setNotesFocus(focus);
    openPanel("notes");
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
          {...fadeIn(0.3)}
        >
          {site.headline}
        </motion.h1>

        <motion.div
          className="mt-8"
          {...fadeIn(0.9)}
        >
          <button
            type="button"
            onClick={() => openNotes("write")}
            className="min-h-10 rounded-full border border-crema/20 bg-roast/40 px-5 text-[13px] text-crema/90 shadow-lg shadow-black/20 backdrop-blur-md transition hover:border-caramel/60 hover:bg-roast/60 hover:text-crema sm:text-sm"
          >
            write a letter for her
          </button>
        </motion.div>
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

      {/* Bottom-right corner: the little mountain secret and the music */}
      <div className="absolute bottom-5 right-5 z-20 flex flex-row-reverse items-center gap-2">
        <button
          type="button"
          aria-label="A little secret"
          onClick={() => setMountainNote((n) => n + 1)}
          className="flex h-9 w-9 items-center justify-center rounded-full text-crema/45 transition hover:text-crema/90 active:scale-90"
        >
          <MountainSnow className="h-[18px] w-[18px]" />
        </button>
        <MusicButton />
        <AnimatePresence>
          {mountainNote > 0 && (
            <motion.p
              key={mountainNote}
              role="status"
              className="font-display text-sm italic text-crema/75"
              initial={{ opacity: 0, x: 6 }}
              animate={{ opacity: [0, 1, 1, 0], x: 0 }}
              transition={{ duration: 3, times: [0, 0.15, 0.8, 1] }}
            >
              {site.mountainNote}
            </motion.p>
          )}
        </AnimatePresence>
      </div>

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
          <CoffeeNotes
            focus={notesFocus}
            onClose={closePanel}
            closeClassName={iconButton}
          />
        )}
      </AnimatePresence>
    </div>
  );
};
