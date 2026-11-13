"use client";

import { useId } from "react";
import { motion, useReducedMotion } from "framer-motion";

export const BEAN_SHADES = ["#6b4430", "#7a4f37", "#5a3826", "#8a5c3f"];

export const Bean = ({
  className,
  color = BEAN_SHADES[0],
}: {
  className?: string;
  color?: string;
}) => (
  <svg viewBox="0 0 24 32" className={className} aria-hidden>
    <ellipse cx="12" cy="16" rx="10" ry="14" fill={color} />
    <path
      d="M7 8 C 9 5, 12 4, 14 5"
      stroke="#fff"
      strokeOpacity="0.18"
      strokeWidth="1.5"
      strokeLinecap="round"
      fill="none"
    />
    <path
      d="M12 3 C 7.5 10, 16.5 21, 12 29"
      stroke="#2a1a10"
      strokeWidth="1.8"
      strokeLinecap="round"
      fill="none"
    />
  </svg>
);

const steamPaths = [
  "M12 34 C 6 28, 18 22, 12 14 S 16 4, 12 0",
  "M20 34 C 14 27, 26 21, 20 13 S 24 3, 20 -1",
  "M28 34 C 22 28, 34 22, 28 14 S 32 4, 28 0",
];

export const Steam = ({ className }: { className?: string }) => {
  const reduceMotion = useReducedMotion();

  return (
    <svg viewBox="0 -4 40 40" className={className} aria-hidden fill="none">
      {steamPaths.map((d, i) => (
        <motion.path
          key={d}
          d={d}
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          initial={{ opacity: reduceMotion ? 0.35 : 0, y: 0 }}
          animate={
            reduceMotion
              ? undefined
              : { opacity: [0, 0.55, 0], y: [4, -4, -10] }
          }
          transition={{
            duration: 3.2,
            delay: i * 0.7,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </svg>
  );
};

export const Cup = ({ className }: { className?: string }) => {
  // Some React versions put characters in ids that break `url(#...)`.
  const clipId = `cup-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const reduceMotion = useReducedMotion();

  return (
    <svg viewBox="0 0 56 56" className={className} aria-hidden fill="none">
      <defs>
        <clipPath id={clipId}>
          <path d="M12 22 H40 V31 A12 12 0 0 1 28 43 H24 A12 12 0 0 1 12 31 Z" />
        </clipPath>
      </defs>
      <motion.rect
        x="10"
        width="32"
        height="24"
        fill="#6b4430"
        clipPath={`url(#${clipId})`}
        initial={{ y: reduceMotion ? 26 : 44 }}
        animate={{ y: 26 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
      />
      <path
        d="M12 22 H40 V31 A12 12 0 0 1 28 43 H24 A12 12 0 0 1 12 31 Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path
        d="M40 25 H43 A5 5 0 0 1 43 35 H40"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <path d="M6 48 H50" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
};
