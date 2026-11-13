"use client";

import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Images, MailOpen, Moon, PenLine, X } from "lucide-react";

import { Backdrop } from "@/components/ui/backdrop";
import { CoffeeNotes, type NotesFocus } from "@/components/ui/coffee-notes";
import { Steam } from "@/components/ui/coffee";
import { PhotoFan } from "@/components/ui/gallery";
import { Intro, useIntro } from "@/components/ui/intro";
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
          className="mt-10 flex flex-col items-center gap-3 sm:flex-row"
          {...fadeIn(0.9)}
        >
          <button
            type="button"
            onClick={() => openNotes("read")}
            className="group inline-flex min-h-12 w-60 items-center justify-center gap-2.5 sm:w-auto rounded-full bg-crema px-7 text-sm font-medium text-roast shadow-[0_8px_30px_-6px_rgba(199,154,107,0.55)] transition hover:-translate-y-0.5 hover:bg-white hover:shadow-[0_12px_36px_-6px_rgba(199,154,107,0.7)]"
          >
            <MailOpen className="h-4 w-4 transition group-hover:-rotate-6" />
            read the letters
          </button>
          <button
            type="button"
            onClick={() => openNotes("write")}
            className="group inline-flex min-h-12 w-60 items-center justify-center gap-2.5 sm:w-auto rounded-full border border-crema/30 bg-roast/30 px-7 text-sm text-crema/90 backdrop-blur-sm transition hover:-translate-y-0.5 hover:border-caramel/80 hover:text-crema"
          >
            <PenLine className="h-4 w-4 transition group-hover:rotate-12" />
            write one for her
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
