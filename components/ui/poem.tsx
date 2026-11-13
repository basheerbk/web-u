"use client";

import { motion, useReducedMotion } from "framer-motion";
import { X } from "lucide-react";

import { site } from "@/lib/site";

const Waves = ({ still }: { still: boolean }) => (
  <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-40 overflow-hidden">
    {[0, 1, 2].map((i) => (
      <motion.svg
        key={i}
        viewBox="0 0 1200 40"
        preserveAspectRatio="none"
        className="absolute h-10 w-[200%] text-crema"
        style={{ bottom: 24 + i * 28, opacity: 0.1 - i * 0.025 }}
        animate={still ? undefined : { x: ["0%", "-50%"] }}
        transition={{ duration: 18 + i * 6, repeat: Infinity, ease: "linear" }}
      >
        <path
          d="M0 20 Q 75 6 150 20 T 300 20 T 450 20 T 600 20 T 750 20 T 900 20 T 1050 20 T 1200 20"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.2"
          vectorEffect="non-scaling-stroke"
        />
      </motion.svg>
    ))}
  </div>
);

export const Poem = ({ onClose, closeClassName }: { onClose: () => void; closeClassName: string }) => {
  const reduceMotion = useReducedMotion() ?? false;
  const { lines, by } = site.poem;
  const lineDelay = (i: number) => (reduceMotion ? 0 : 0.6 + i * 0.45);

  return (
    <motion.div
      role="dialog"
      aria-label={`A poem by ${by}`}
      className="fixed inset-0 z-40 overflow-y-auto overscroll-contain bg-[#0b0705]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div
        aria-hidden
        className="pointer-events-none fixed left-1/2 top-[8%] h-[70vmin] w-[70vmin] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(241,228,209,0.10)_0%,rgba(241,228,209,0.03)_35%,transparent_65%)]"
      />
      <motion.div
        aria-hidden
        className="pointer-events-none fixed left-1/2 top-[14%] h-14 w-14 -translate-x-1/2 rounded-full bg-crema/85 shadow-[0_0_60px_18px_rgba(241,228,209,0.18)] md:h-16 md:w-16"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: reduceMotion ? 0 : 2, ease: "easeOut" }}
      />
      <div className="fixed inset-0">
        <Waves still={reduceMotion} />
      </div>

      <button
        type="button"
        aria-label="Close poem"
        onClick={onClose}
        className={`fixed right-5 top-5 z-50 ${closeClassName}`}
      >
        <X className="h-6 w-6" />
      </button>

      <article className="relative flex min-h-full flex-col items-center justify-center px-6 pb-28 pt-40 md:pb-40 md:pt-52">
        <div className="max-w-lg">
          {lines.map((line, i) => (
            <motion.p
              key={i}
              className="pl-5 -indent-5 font-display text-base font-light leading-[2.1] text-crema/90 sm:text-lg md:text-2xl md:leading-[2.1]"
              initial={{ opacity: 0, y: 6, filter: "blur(4px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ duration: reduceMotion ? 0 : 1.4, delay: lineDelay(i), ease: "easeOut" }}
            >
              {line}
            </motion.p>
          ))}
          <motion.p
            className="mt-8 text-right font-display text-base italic text-caramel"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: reduceMotion ? 0 : 1.2, delay: lineDelay(lines.length) + 0.4 }}
          >
            — {by}
          </motion.p>
        </div>
      </article>
    </motion.div>
  );
};
