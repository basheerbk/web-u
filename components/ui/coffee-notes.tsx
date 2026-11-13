"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, ArrowRight, Check, Send, X } from "lucide-react";

import { Steam } from "@/components/ui/coffee";
import { site } from "@/lib/site";

type SubmitState =
  | { kind: "idle" }
  | { kind: "sending" }
  | { kind: "sent"; message: string }
  | { kind: "error"; message: string };

const inputClassName =
  "w-full border-b border-roast/25 bg-transparent px-0 py-3 text-sm text-roast outline-none transition placeholder:text-roast/40 focus:border-roast";

export const CoffeeNotes = ({
  onClose,
  closeClassName,
}: {
  onClose: () => void;
  closeClassName: string;
}) => {
  const { coffeeNotes } = site;
  const [activeIndex, setActiveIndex] = useState(0);
  const [submitState, setSubmitState] = useState<SubmitState>({ kind: "idle" });
  const startedAt = useRef(0);
  const reduceMotion = useReducedMotion();
  const activeNote = coffeeNotes.friends[activeIndex];
  const noteSizeClass =
    activeNote.message.length > 320
      ? "text-lg leading-[1.6] sm:text-xl"
      : activeNote.message.length > 170
        ? "text-xl leading-[1.55] sm:text-2xl"
        : "text-2xl leading-[1.45] sm:text-3xl";

  useEffect(() => {
    startedAt.current = Date.now();
  }, []);

  const chooseNote = (index: number) => {
    setActiveIndex(index);
  };

  const stepNote = (direction: -1 | 1) => {
    setActiveIndex(
      (current) =>
        (current + direction + coffeeNotes.friends.length) % coffeeNotes.friends.length
    );
  };

  const submitNote = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const fields = new FormData(form);
    const name = String(fields.get("name") ?? "").trim();
    const message = String(fields.get("message") ?? "").trim();

    if (!message) {
      setSubmitState({ kind: "error", message: "Write a little something first." });
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
      const result = (await response.json().catch(() => null)) as
        | { message?: string }
        | null;

      if (!response.ok) {
        throw new Error(result?.message || "The note could not be sent just yet.");
      }

      form.reset();
      startedAt.current = Date.now();
      setSubmitState({
        kind: "sent",
        message: result?.message || "Your note is on its way.",
      });
    } catch (error) {
      setSubmitState({
        kind: "error",
        message:
          error instanceof Error
            ? error.message
            : "The note could not be sent just yet.",
      });
    }
  };

  return (
    <motion.div
      role="dialog"
      aria-label="Coffee notes for Nayana"
      className="fixed inset-0 z-40 overflow-y-auto overscroll-contain bg-roast text-crema"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: reduceMotion ? 0 : 0.45 }}
    >
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(199,154,107,0.12),transparent_34%),radial-gradient(circle_at_85%_72%,rgba(107,68,48,0.18),transparent_38%)]"
      />

      <button
        type="button"
        aria-label="Close coffee notes"
        onClick={onClose}
        className={`fixed right-5 top-5 z-50 ${closeClassName}`}
      >
        <X className="h-6 w-6" />
      </button>

      <main className="relative mx-auto min-h-full max-w-7xl px-5 pb-16 pt-24 sm:px-8 lg:px-12 lg:pb-24">
        <header className="mx-auto max-w-2xl text-center">
          <p className="font-mono text-[10px] uppercase tracking-[0.34em] text-caramel/75">
            counter no. 03 · coffee notes
          </p>
          <h2 className="mt-5 font-display text-4xl font-light italic leading-tight tracking-tight sm:text-5xl md:text-6xl">
            {coffeeNotes.title}
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-sm leading-7 text-crema/60 sm:text-base">
            {coffeeNotes.intro}
          </p>
        </header>

        <div className="mt-14 grid items-start gap-8 lg:grid-cols-[1.12fr_0.88fr] lg:gap-10">
          <section aria-labelledby="friends-notes-heading">
            <div className="mb-5 flex items-end justify-between gap-4">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-caramel/70">
                  friends at the counter
                </p>
                <h3
                  id="friends-notes-heading"
                  className="mt-2 font-display text-2xl font-light italic sm:text-3xl"
                >
                  Pick a cup. Get a note.
                </h3>
              </div>
              <p className="hidden text-right text-xs leading-5 text-crema/40 sm:block">
                {activeIndex + 1} / {coffeeNotes.friends.length}
              </p>
            </div>

            <div className="overflow-hidden rounded-[2rem] border border-crema/10 bg-espresso/80 shadow-2xl shadow-black/25">
              <div className="border-b border-crema/10 bg-gradient-to-b from-crema/[0.08] to-transparent p-5 sm:p-7">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-mono text-[9px] uppercase tracking-[0.28em] text-crema/40">
                      Nayana’s note maker
                    </p>
                    <p className="mt-1 text-xs text-crema/65">choose your brew</p>
                  </div>
                  <div className="relative flex h-14 w-14 items-center justify-center rounded-full border border-crema/15 bg-roast/60">
                    <span className="absolute h-px w-5 origin-right -rotate-[35deg] bg-caramel" />
                    <span className="font-mono text-[7px] uppercase tracking-wider text-crema/35">
                      warm
                    </span>
                  </div>
                </div>

                <div
                  role="tablist"
                  aria-label="Choose a friend's note"
                  className="mt-6 grid grid-cols-3 gap-2 sm:grid-cols-6"
                >
                  {coffeeNotes.friends.map((note, index) => (
                    <button
                      key={note.id}
                      type="button"
                      role="tab"
                      aria-selected={index === activeIndex}
                      aria-controls="active-coffee-note"
                      onClick={() => chooseNote(index)}
                      className={`group flex min-h-16 flex-col items-center justify-center rounded-xl border px-1 py-2 text-center transition ${
                        index === activeIndex
                          ? "border-caramel/80 bg-caramel/15 text-crema"
                          : "border-crema/10 bg-roast/35 text-crema/45 hover:border-crema/25 hover:text-crema/80"
                      }`}
                    >
                      <span className="font-mono text-[9px] tracking-[0.2em]">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <span className="mt-1 line-clamp-2 text-[10px] leading-tight">
                        {note.order}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="relative min-h-[390px] overflow-hidden px-5 pb-8 pt-16 sm:min-h-[420px] sm:px-10">
                <div aria-hidden className="absolute left-1/2 top-0 h-16 w-28 -translate-x-1/2">
                  <div className="mx-auto h-7 w-20 rounded-b-xl bg-[#0b0705] shadow-lg" />
                  <div className="mx-auto h-8 w-3 bg-gradient-to-r from-[#5f554e] via-[#b7a69b] to-[#4d4540]" />
                  <div className="mx-auto h-1.5 w-8 rounded-full bg-[#17100c]" />
                </div>

                <AnimatePresence mode="wait">
                  <motion.article
                    id="active-coffee-note"
                    role="tabpanel"
                    key={activeNote.id}
                    className="coffee-ticket relative mx-auto flex min-h-[280px] max-w-md flex-col justify-between px-7 pb-7 pt-9 text-roast sm:px-10 sm:pb-9 sm:pt-11"
                    initial={reduceMotion ? false : { opacity: 0, y: -28, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={reduceMotion ? undefined : { opacity: 0, y: 16, scale: 0.98 }}
                    transition={{ duration: 0.45, ease: "easeOut" }}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-5 border-b border-roast/15 pb-4">
                        <div>
                          <p className="font-mono text-[9px] uppercase tracking-[0.28em] text-roast/50">
                            order for Nayana
                          </p>
                          <p className="mt-1 font-display text-lg italic">{activeNote.order}</p>
                        </div>
                        <span className="rounded-full border border-roast/15 px-2 py-1 font-mono text-[8px] uppercase tracking-[0.18em] text-roast/50">
                          {activeNote.placeholder ? "placeholder" : "with love"}
                        </span>
                      </div>

                      <blockquote
                        className={`mt-7 whitespace-pre-line font-display font-light italic ${noteSizeClass}`}
                      >
                        “{activeNote.message}”
                      </blockquote>
                    </div>

                    <footer className="mt-8 flex items-end justify-between gap-5">
                      <p className="text-sm text-roast/70">— {activeNote.author}</p>
                      <div aria-hidden className="flex items-center gap-1.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-roast/25" />
                        <span className="h-1.5 w-5 rounded-full bg-roast/15" />
                      </div>
                    </footer>
                  </motion.article>
                </AnimatePresence>

                <div className="mx-auto mt-5 flex max-w-md items-center justify-between">
                  <button
                    type="button"
                    onClick={() => stepNote(-1)}
                    className="flex min-h-11 items-center gap-2 rounded-full px-3 text-xs text-crema/55 transition hover:text-crema"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    previous
                  </button>
                  <Steam className="h-8 w-8 text-crema/25" />
                  <button
                    type="button"
                    onClick={() => stepNote(1)}
                    className="flex min-h-11 items-center gap-2 rounded-full px-3 text-xs text-crema/55 transition hover:text-crema"
                  >
                    next
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </section>

          <section aria-labelledby="leave-note-heading" className="lg:sticky lg:top-20">
            <div className="coffee-letter relative overflow-hidden rounded-[2rem] p-6 text-roast shadow-2xl shadow-black/20 sm:p-9">
              <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-roast/45">
                open tab · no. 07
              </p>
              <h3
                id="leave-note-heading"
                className="mt-4 pr-14 font-display text-3xl font-light italic sm:pr-0 sm:text-4xl"
              >
                Leave something warm.
              </h3>
              <p className="mt-3 max-w-md text-sm leading-6 text-roast/60">
                A memory, an inside joke, or the one thing about her you hope she never forgets.
              </p>

              <form onSubmit={submitNote} className="mt-8">
                <div
                  className="absolute left-[-9999px] top-auto h-px w-px overflow-hidden"
                  aria-hidden="true"
                >
                  <label htmlFor="website">Website</label>
                  <input id="website" name="website" tabIndex={-1} autoComplete="off" />
                </div>

                <label className="block">
                  <span className="font-mono text-[9px] uppercase tracking-[0.24em] text-roast/45">
                    your name · optional
                  </span>
                  <input
                    name="name"
                    type="text"
                    maxLength={80}
                    autoComplete="name"
                    placeholder="Anonymous is lovely too"
                    className={inputClassName}
                  />
                </label>

                <label className="mt-7 block">
                  <span className="font-mono text-[9px] uppercase tracking-[0.24em] text-roast/45">
                    your note
                  </span>
                  <textarea
                    name="message"
                    required
                    maxLength={1200}
                    rows={7}
                    placeholder="Dear Nayana…"
                    className={`${inputClassName} resize-none leading-6`}
                  />
                </label>

                <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <p className="max-w-[16rem] text-xs leading-5 text-roast/45">
                    Your note goes privately to the person looking after this little café.
                  </p>
                  <button
                    type="submit"
                    disabled={submitState.kind === "sending"}
                    className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-roast px-6 text-sm text-crema transition hover:bg-espresso disabled:cursor-wait disabled:opacity-60"
                  >
                    {submitState.kind === "sending" ? (
                      "sending…"
                    ) : submitState.kind === "sent" ? (
                      <>
                        <Check className="h-4 w-4" />
                        sent
                      </>
                    ) : (
                      <>
                        send the note
                        <Send className="h-4 w-4" />
                      </>
                    )}
                  </button>
                </div>

                <div className="mt-5 min-h-10" aria-live="polite">
                  {submitState.kind === "sent" && (
                    <p className="rounded-2xl bg-roast/[0.07] px-4 py-3 text-sm text-roast/70">
                      {submitState.message}
                    </p>
                  )}
                  {submitState.kind === "error" && (
                    <p className="rounded-2xl border border-[#8a3d2f]/25 bg-[#8a3d2f]/[0.07] px-4 py-3 text-sm text-[#6f2f25]">
                      {submitState.message}
                    </p>
                  )}
                </div>
              </form>

              <div aria-hidden className="mt-3 border-t border-dashed border-roast/20 pt-5 text-center font-mono text-[8px] uppercase tracking-[0.28em] text-roast/35">
                brewed gently · delivered privately
              </div>
            </div>
          </section>
        </div>
      </main>
    </motion.div>
  );
};
