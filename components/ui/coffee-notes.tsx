"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowRight, X } from "lucide-react";

import { CoffeeMachine, type BrewPhase } from "@/components/ui/coffee-machine";
import { site } from "@/lib/site";

type SubmitState =
  | { kind: "idle" }
  | { kind: "sending" }
  | { kind: "sent"; message: string }
  | { kind: "error"; message: string };

export type NotesFocus = "read" | "write";

const BREW_MS = 2300;

const padInput =
  "w-full border-0 border-b border-dashed border-roast/30 bg-transparent px-0 py-2.5 font-display text-lg italic text-roast outline-none transition placeholder:font-sans placeholder:text-sm placeholder:not-italic placeholder:text-roast/35 focus:border-solid focus:border-roast/70";

const timeNow = () =>
  new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

const PrintedLetter = ({
  note,
  phase,
  brewKey,
}: {
  note: (typeof site.coffeeNotes.friends)[number];
  phase: BrewPhase;
  brewKey: number;
}) => {
  const reduceMotion = useReducedMotion();
  const sizeClass =
    note.message.length > 420
      ? "text-[15px] leading-[1.7] sm:text-base"
      : note.message.length > 200
        ? "text-base leading-[1.65] sm:text-lg"
        : "text-xl leading-[1.5] sm:text-2xl";

  return (
    <div className="relative mx-auto w-full max-w-[340px]">
      {/* printer slot the receipt feeds out of */}
      <div
        aria-hidden
        className="relative z-10 mx-auto h-3 w-[300px] rounded-full bg-[#050302] shadow-[0_0_0_3px_#2a1d15,0_0_0_4px_rgba(241,228,209,0.12),inset_0_2px_4px_rgba(0,0,0,1)]"
      />
      <div className="relative -mt-1.5 min-h-[120px] overflow-hidden px-[14px] pb-10">
        {phase === "brewing" && (
          <motion.p
            className="pt-6 text-center font-mono text-[10px] uppercase tracking-[0.3em] text-crema/40"
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 1.6, repeat: Infinity }}
          >
            printing your letter…
          </motion.p>
        )}
        <AnimatePresence>
          {phase === "served" && (
            <motion.article
              id="brewed-letter"
              role="tabpanel"
              key={brewKey}
              className="coffee-ticket relative px-6 pb-7 pt-8 text-roast"
              initial={reduceMotion ? false : { y: "-100%" }}
              animate={{ y: 0 }}
              exit={
                reduceMotion
                  ? undefined
                  : { opacity: 0, y: 12, transition: { duration: 0.25 } }
              }
              transition={{ duration: 1.5, ease: [0.3, 0.1, 0.3, 1] }}
            >
              <div className="flex items-start justify-between gap-4 border-b border-dashed border-roast/25 pb-3 font-mono text-[9px] uppercase tracking-[0.2em] text-roast/55">
                <div>
                  <p>nayana · café</p>
                  <p className="mt-1 text-roast/80">1 × {note.order}</p>
                </div>
                <p className="text-right">
                  order for
                  <br />
                  <span className="text-roast/80">nayana</span>
                </p>
              </div>
              <blockquote
                className={`mt-5 whitespace-pre-line font-display font-light italic ${sizeClass}`}
              >
                {note.message}
              </blockquote>
              <p className="mt-6 text-right font-display text-lg italic text-bean">
                — {note.author}
              </p>
              <p className="mt-5 border-t border-dashed border-roast/25 pt-3 text-center font-mono text-[8px] uppercase tracking-[0.3em] text-roast/40">
                paid in full · with love
              </p>
            </motion.article>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export const CoffeeNotes = ({
  focus = "read",
  onClose,
  closeClassName,
}: {
  focus?: NotesFocus;
  onClose: () => void;
  closeClassName: string;
}) => {
  const { coffeeNotes } = site;
  const drinks = coffeeNotes.friends;
  const reduceMotion = useReducedMotion();

  const [activeIndex, setActiveIndex] = useState(0);
  const [phase, setPhase] = useState<BrewPhase>("brewing");
  const [brewKey, setBrewKey] = useState(0);
  const [submitState, setSubmitState] = useState<SubmitState>({ kind: "idle" });
  // The panel only mounts after a tap, so reading the clock here is safe.
  const [placedAt] = useState(timeNow);
  const startedAt = useRef(0);
  const orderSection = useRef<HTMLElement>(null);
  const messageField = useRef<HTMLTextAreaElement>(null);
  const orderNumber = String(drinks.length + 1).padStart(3, "0");

  useEffect(() => {
    startedAt.current = Date.now();
  }, []);

  // Each brew runs the machine, then prints the letter.
  useEffect(() => {
    const timer = setTimeout(
      () => setPhase("served"),
      reduceMotion ? 0 : BREW_MS,
    );
    return () => clearTimeout(timer);
  }, [brewKey, reduceMotion]);

  // "write a letter for her" lands on the order pad.
  useEffect(() => {
    if (focus !== "write") return;
    const timer = setTimeout(
      () => {
        orderSection.current?.scrollIntoView({
          behavior: reduceMotion ? "auto" : "smooth",
          block: "start",
        });
        messageField.current?.focus({ preventScroll: true });
      },
      reduceMotion ? 0 : 450,
    );
    return () => clearTimeout(timer);
  }, [focus, reduceMotion]);

  const brew = (index: number) => {
    setActiveIndex(index);
    setPhase("brewing");
    setBrewKey((key) => key + 1);
  };

  const submitNote = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const fields = new FormData(form);
    const name = String(fields.get("name") ?? "").trim();
    const message = String(fields.get("message") ?? "").trim();

    if (!message) {
      setSubmitState({
        kind: "error",
        message: "The order is empty. Write a little something first.",
      });
      return;
    }

    setSubmitState({ kind: "sending" });

    try {
      const response = await fetch("/api/letters", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          message,
          website: String(fields.get("website") ?? ""),
          startedAt: startedAt.current,
        }),
      });
      const result = (await response.json().catch(() => null)) as {
        message?: string;
      } | null;

      if (!response.ok) {
        throw new Error(
          result?.message || "The order could not go through just yet.",
        );
      }

      form.reset();
      startedAt.current = Date.now();
      setSubmitState({
        kind: "sent",
        message: result?.message || "Your letter is on its way.",
      });
    } catch (error) {
      setSubmitState({
        kind: "error",
        message:
          error instanceof Error
            ? error.message
            : "The order could not go through just yet.",
      });
    }
  };

  const sent = submitState.kind === "sent";

  return (
    <motion.div
      role="dialog"
      aria-label="Coffee letters for Nayana"
      className="fixed inset-0 z-40 overflow-y-auto overflow-x-hidden overscroll-contain bg-roast text-crema"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: reduceMotion ? 0 : 0.45 }}
    >
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_30%_35%,rgba(199,154,107,0.16),transparent_40%),radial-gradient(circle_at_85%_80%,rgba(107,68,48,0.2),transparent_40%)]"
      />

      <button
        type="button"
        aria-label="Close coffee letters"
        onClick={onClose}
        className={`fixed right-5 top-5 z-50 ${closeClassName}`}
      >
        <X className="h-6 w-6" />
      </button>

      <main className="relative mx-auto min-h-full max-w-6xl px-5 pb-16 pt-24 sm:px-8 lg:pb-24">
        <header className="mx-auto max-w-2xl text-center">
          <p className="font-mono text-[10px] uppercase tracking-[0.34em] text-caramel/75">
            nayana · café · open all day
          </p>
          <h2 className="mt-5 font-display text-4xl font-light italic leading-tight tracking-tight sm:text-5xl md:text-6xl">
            {coffeeNotes.title}
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-sm leading-7 text-crema/60 sm:text-base">
            Press a button on the machine. Every cup comes with a letter from
            someone who loves her.
          </p>
        </header>

        <div className="mt-10 grid items-start gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14">
          <section aria-label="The coffee machine" className="min-w-0">
            <div className="lg:[zoom:1.18]">
              <CoffeeMachine
                drinks={drinks}
                activeIndex={activeIndex}
                phase={phase}
                brewKey={brewKey}
                onSelect={brew}
              />
            </div>
            {/* counter edge */}
            <div
              aria-hidden
              className="mx-auto -mt-2 mb-6 h-[3px] max-w-md rounded-full bg-gradient-to-r from-transparent via-caramel/40 to-transparent"
            />
            <PrintedLetter
              note={drinks[activeIndex]}
              phase={phase}
              brewKey={brewKey}
            />
          </section>

          <section
            ref={orderSection}
            aria-labelledby="new-order-heading"
            className="scroll-mt-20 lg:sticky lg:top-20"
          >
            <div className="relative mx-auto max-w-md">
              {/* spiral binding */}
              <div
                aria-hidden
                className="relative z-10 flex justify-around px-8"
              >
                {Array.from({ length: 9 }, (_, i) => (
                  <span
                    key={i}
                    className="h-6 w-2.5 translate-y-3 rounded-full border-2 border-[#b8b2aa] bg-gradient-to-b from-[#e9e4dd] to-[#8a857f] shadow"
                  />
                ))}
              </div>

              <div className="coffee-letter relative overflow-hidden rounded-b-xl rounded-t-sm px-6 pb-7 pt-8 text-roast shadow-2xl shadow-black/40 sm:px-8">
                <div
                  aria-hidden
                  className="absolute inset-x-0 top-0 h-3 bg-[radial-gradient(circle,#120c08_3px,transparent_3.5px)] bg-[length:22px_12px] bg-center opacity-80"
                />

                <div className="flex items-start justify-between border-b-2 border-roast/80 pb-3">
                  <div>
                    <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-roast/50">
                      guest check
                    </p>
                    <h3
                      id="new-order-heading"
                      className="mt-1 font-display text-3xl font-light italic"
                    >
                      New order
                    </h3>
                  </div>
                  <div className="text-right font-mono text-[10px] uppercase leading-5 tracking-[0.18em] text-roast/55">
                    <p>no. {orderNumber}</p>
                    <p>table · nayana</p>
                    <p>{placedAt}</p>
                  </div>
                </div>

                <form onSubmit={submitNote} className="mt-5">
                  <div
                    className="absolute left-[-9999px] top-auto h-px w-px overflow-hidden"
                    aria-hidden="true"
                  >
                    <label htmlFor="website">Website</label>
                    <input
                      id="website"
                      name="website"
                      tabIndex={-1}
                      autoComplete="off"
                    />
                  </div>

                  <label className="block">
                    <span className="font-mono text-[9px] uppercase tracking-[0.24em] text-roast/50">
                      name on the cup · optional
                    </span>
                    <input
                      name="name"
                      type="text"
                      maxLength={80}
                      autoComplete="name"
                      placeholder="Anonymous is lovely too"
                      className={padInput}
                    />
                  </label>

                  <label className="mt-6 block">
                    <span className="font-mono text-[9px] uppercase tracking-[0.24em] text-roast/50">
                      the order · your letter to her
                    </span>
                    <textarea
                      ref={messageField}
                      name="message"
                      required
                      maxLength={1200}
                      rows={7}
                      placeholder="Dear Nayana…"
                      className={`${padInput} resize-none leading-8 [background-image:repeating-linear-gradient(180deg,transparent_0_31px,rgba(18,12,8,0.12)_31px_32px)] [background-attachment:local]`}
                    />
                  </label>

                  <div className="mt-5 flex items-center justify-between border-t border-dashed border-roast/30 pt-4 font-mono text-[10px] uppercase tracking-[0.2em] text-roast/60">
                    <span>1 × letter, made with love</span>
                    <span>₹ 0.00</span>
                  </div>

                  <button
                    type="submit"
                    disabled={submitState.kind === "sending"}
                    className="group mt-5 flex min-h-12 w-full items-center justify-center gap-2 rounded-md bg-roast px-6 font-mono text-xs uppercase tracking-[0.25em] text-crema shadow-[0_4px_0_#000] transition active:translate-y-[3px] active:shadow-[0_1px_0_#000] disabled:cursor-wait disabled:opacity-60"
                  >
                    {submitState.kind === "sending" ? (
                      "sending to the kitchen…"
                    ) : (
                      <>
                        place the order
                        <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
                      </>
                    )}
                  </button>

                  <div className="mt-4 min-h-6" aria-live="polite">
                    {submitState.kind === "error" && (
                      <p className="rounded-md border border-[#8a3d2f]/25 bg-[#8a3d2f]/[0.07] px-4 py-3 text-sm text-[#6f2f25]">
                        {submitState.message}
                      </p>
                    )}
                    {sent && (
                      <p className="text-center text-sm text-roast/70">
                        {submitState.message}{" "}
                        <button
                          type="button"
                          onClick={() => setSubmitState({ kind: "idle" })}
                          className="underline decoration-dotted underline-offset-4"
                        >
                          write another
                        </button>
                      </p>
                    )}
                  </div>
                </form>

                {/* rubber stamp once the order is in */}
                <AnimatePresence>
                  {sent && (
                    <motion.div
                      aria-hidden
                      className="pointer-events-none absolute left-1/2 top-[46%] -translate-x-1/2 -translate-y-1/2 rounded-md border-[3px] border-[#9a3b2a]/80 px-5 py-2 text-center font-mono uppercase text-[#9a3b2a]/85 mix-blend-multiply"
                      initial={
                        reduceMotion
                          ? { opacity: 1, rotate: -9 }
                          : { opacity: 0, scale: 2.4, rotate: -20 }
                      }
                      animate={{ opacity: 1, scale: 1, rotate: -9 }}
                      exit={{ opacity: 0 }}
                      transition={{
                        type: "spring",
                        stiffness: 380,
                        damping: 18,
                      }}
                    >
                      <p className="text-xl font-bold tracking-[0.2em]">
                        order in
                      </p>
                      <p className="text-[9px] tracking-[0.3em]">
                        she&apos;ll read it soon
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>

                <p className="mt-3 border-t border-dashed border-roast/20 pt-4 text-center font-mono text-[8px] uppercase tracking-[0.28em] text-roast/40">
                  goes privately to the person looking after this café
                </p>
              </div>
            </div>
          </section>
        </div>
      </main>
    </motion.div>
  );
};
