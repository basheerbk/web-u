"use client";

import { type PointerEvent } from "react";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
} from "framer-motion";

import { Steam } from "@/components/ui/coffee";

export type BrewPhase = "brewing" | "served";

type Drink = { id: string; order: string; author: string };

// Machine size in px. The box is drawn with real 3D faces, so the front,
// sides and top move together when the scene tilts.
const W = 280;
const H = 380;
const D = 110;

const TRAY_Y = 322; // top edge of the drip tray on the front face
const TRAY_DEPTH = 34;

// Button labels have ~46px; long names get a café-board abbreviation.
const shortLabel = (order: string) =>
  ({ "filter coffee": "filter" } as Record<string, string>)[order] ?? order;

const REST_TILT = { x: 7, y: -20 };

const enamel =
  "linear-gradient(160deg, #3a2a20 0%, #22170f 38%, #1a120c 62%, #2b1e15 100%)";
const enamelSide = "linear-gradient(180deg, #24180f 0%, #140d08 100%)";
const chrome =
  "linear-gradient(90deg, #7d7873 0%, #e6e1da 14%, #9d9891 30%, #f4f0ea 48%, #a5a09a 64%, #d8d3cc 82%, #77726d 100%)";
const chromeVertical =
  "linear-gradient(180deg, #f2eee8 0%, #b3ada6 40%, #e9e4dd 60%, #8a857f 100%)";

const Gauge = ({ phase }: { phase: BrewPhase }) => {
  const reduceMotion = useReducedMotion();
  const ticks = Array.from({ length: 13 }, (_, i) => -120 + i * 20);

  return (
    <div
      className="relative h-[60px] w-[60px] rounded-full p-[3px] shadow-[0_2px_6px_rgba(0,0,0,0.6)]"
      style={{ background: chrome }}
    >
      <div className="relative h-full w-full overflow-hidden rounded-full bg-[radial-gradient(circle_at_40%_30%,#fbf6ee,#e5dccd_70%,#cdbfa9)] shadow-[inset_0_1px_4px_rgba(0,0,0,0.45)]">
        <svg viewBox="0 0 54 54" className="absolute inset-0 h-full w-full">
          {ticks.map((angle, i) => (
            <line
              key={angle}
              x1="27"
              y1={i % 3 === 0 ? 6 : 7.5}
              x2="27"
              y2="10.5"
              stroke={i >= 9 ? "#9a3b2a" : "#3b2a20"}
              strokeWidth={i % 3 === 0 ? 1.4 : 0.8}
              transform={`rotate(${angle} 27 27)`}
            />
          ))}
          <path
            d="M 41.8 18.4 A 17 17 0 0 1 43.4 33"
            stroke="#c79a6b"
            strokeWidth="2.4"
            fill="none"
            opacity="0.7"
          />
          <text x="27" y="38" textAnchor="middle" fontSize="4.6" fill="#6b4430" fontFamily="monospace">
            BAR
          </text>
        </svg>
        <motion.div
          className="absolute bottom-1/2 left-1/2 h-[21px] w-[2px] -translate-x-1/2 rounded-full bg-[#8f2f22]"
          style={{ originY: 1 }}
          initial={false}
          animate={{ rotate: phase === "brewing" ? 42 : -112 }}
          transition={
            reduceMotion
              ? { duration: 0 }
              : phase === "brewing"
                ? { type: "spring", stiffness: 40, damping: 6 }
                : { duration: 1.6, ease: "easeInOut" }
          }
        />
        <div className="absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#2a1d15] shadow" />
        <div className="pointer-events-none absolute inset-0 rounded-full bg-[linear-gradient(145deg,rgba(255,255,255,0.55)_0%,transparent_45%)]" />
      </div>
    </div>
  );
};

const Cup = ({ name, phase, brewKey }: { name: string; phase: BrewPhase; brewKey: number }) => {
  const reduceMotion = useReducedMotion();
  const fillDuration = reduceMotion ? 0 : 1.9;

  return (
    <svg viewBox="0 0 78 54" className="h-[54px] w-[78px] drop-shadow-[0_6px_6px_rgba(0,0,0,0.45)]">
      <defs>
        <linearGradient id="cup-body" x1="0" x2="1">
          <stop offset="0" stopColor="#cfc6ba" />
          <stop offset="0.3" stopColor="#fbf8f3" />
          <stop offset="0.55" stopColor="#ffffff" />
          <stop offset="1" stopColor="#bdb3a6" />
        </linearGradient>
        <radialGradient id="cup-crema" cx="0.45" cy="0.4" r="0.7">
          <stop offset="0" stopColor="#d7a676" />
          <stop offset="0.6" stopColor="#a8693e" />
          <stop offset="1" stopColor="#5a3420" />
        </radialGradient>
      </defs>
      <ellipse cx="35" cy="49" rx="34" ry="4.5" fill="#d9d1c6" />
      <ellipse cx="35" cy="48" rx="27" ry="3" fill="#efe9e1" />
      <path d="M60 17 C 75 17, 75 36, 57 35" stroke="url(#cup-body)" strokeWidth="4.5" fill="none" />
      <path d="M9 11 L61 11 L57 39 Q 55 46 46 46 L 24 46 Q 15 46 13 39 Z" fill="url(#cup-body)" />
      <ellipse cx="35" cy="11" rx="26" ry="4" fill="#e8e1d7" />
      <ellipse cx="35" cy="11.6" rx="23.5" ry="3.1" fill="#bfb5a8" />
      <motion.ellipse
        key={brewKey}
        cx="35"
        cy="11.8"
        rx="23"
        ry="2.9"
        fill="url(#cup-crema)"
        initial={{ opacity: 0, scale: 0.4 }}
        animate={{ opacity: 1, scale: 1 }}
        style={{ originX: "50%", originY: "50%" }}
        transition={{ duration: fillDuration, delay: reduceMotion ? 0 : 0.5, ease: "easeOut" }}
      />
      <AnimatePresence>
        {phase === "served" && (
          <motion.path
            d="M28 11.5 C 31 9.6, 34 13.6, 37 11.2 C 39 9.8, 41 12.4, 42.5 11.4"
            stroke="#f3dcc0"
            strokeWidth="0.9"
            fill="none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.9 }}
            exit={{ opacity: 0 }}
          />
        )}
      </AnimatePresence>
      <text
        x="35"
        y="31"
        textAnchor="middle"
        fontSize="8.5"
        fontStyle="italic"
        fill="#6b4430"
        style={{ fontFamily: "var(--font-display)" }}
      >
        {name.length > 11 ? `${name.slice(0, 10)}…` : name}
      </text>
    </svg>
  );
};

const Streams = ({ phase, brewKey }: { phase: BrewPhase; brewKey: number }) => {
  const reduceMotion = useReducedMotion();
  if (reduceMotion) return null;

  return (
    <div className="pointer-events-none absolute left-1/2 top-[244px] flex -translate-x-1/2 gap-[9px]">
      {[0, 1].map((i) => (
        <motion.span
          key={`${brewKey}-${i}`}
          className="block w-[2.5px] rounded-full bg-gradient-to-b from-[#3a1f10] via-[#6b3d22] to-[#8a5531]"
          style={{ originY: 0 }}
          initial={{ height: 0, opacity: 0 }}
          animate={
            phase === "brewing"
              ? { height: [0, 34, 34, 32], opacity: [0, 1, 1, 1] }
              : { height: 0, opacity: 0 }
          }
          transition={
            phase === "brewing"
              ? { duration: 2, delay: 0.25 + i * 0.08, times: [0, 0.25, 0.85, 1] }
              : { duration: 0.35 }
          }
        />
      ))}
    </div>
  );
};

export const CoffeeMachine = ({
  drinks,
  activeIndex,
  phase,
  brewKey,
  onSelect,
}: {
  drinks: Drink[];
  activeIndex: number;
  phase: BrewPhase;
  brewKey: number;
  onSelect: (index: number) => void;
}) => {
  const reduceMotion = useReducedMotion();
  const tiltX = useMotionValue(REST_TILT.x);
  const tiltY = useMotionValue(REST_TILT.y);
  const rotateX = useSpring(tiltX, { stiffness: 60, damping: 14 });
  const rotateY = useSpring(tiltY, { stiffness: 60, damping: 14 });
  const active = drinks[activeIndex];

  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== "mouse" || reduceMotion) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const dx = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    const dy = ((event.clientY - rect.top) / rect.height) * 2 - 1;
    tiltY.set(REST_TILT.y + dx * 14);
    tiltX.set(REST_TILT.x - dy * 7);
  };

  const resetTilt = () => {
    tiltX.set(REST_TILT.x);
    tiltY.set(REST_TILT.y);
  };

  const lcd =
    phase === "brewing"
      ? `brewing · ${active.order}`
      : `ready · for nayana`;

  return (
    <div
      className="relative flex justify-center pb-6 pt-10 [perspective:1100px]"
      onPointerMove={onPointerMove}
      onPointerLeave={resetTilt}
    >
      {/* Shadow on the counter */}
      <div
        aria-hidden
        className="absolute bottom-3 left-1/2 h-10 w-[340px] -translate-x-1/2 rounded-[50%] bg-black/60 blur-2xl"
      />

      <motion.div
        className="relative"
        style={{
          width: W,
          height: H,
          rotateX,
          rotateY,
          transformStyle: "preserve-3d",
        }}
      >
        {/* Top, with a cup-warmer grille */}
        <div
          aria-hidden
          className="absolute left-0"
          style={{
            top: (H - D) / 2,
            width: W,
            height: D,
            transform: `rotateX(90deg) translateZ(${H / 2}px)`,
            background:
              "repeating-linear-gradient(90deg, rgba(0,0,0,0.35) 0 3px, transparent 3px 9px), " +
              chromeVertical,
            borderRadius: 6,
          }}
        />
        {/* Sides */}
        {[90, -90].map((angle) => (
          <div
            key={angle}
            aria-hidden
            className="absolute top-0"
            style={{
              left: (W - D) / 2,
              width: D,
              height: H,
              transform: `rotateY(${angle}deg) translateZ(${W / 2}px)`,
              background: enamelSide,
              borderRadius: 10,
              boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.04)",
            }}
          >
            <div className="absolute inset-x-0 top-0 h-3 rounded-t-[10px]" style={{ background: chromeVertical }} />
            <div
              className="absolute inset-x-3 bottom-[58px] top-[150px] rounded-md opacity-60"
              style={{
                background:
                  "repeating-linear-gradient(180deg, rgba(0,0,0,0.6) 0 2px, transparent 2px 7px)",
              }}
            />
          </div>
        ))}

        {/* Front */}
        <div
          className="absolute inset-0 rounded-[14px]"
          style={{
            transform: `translateZ(${D / 2}px)`,
            transformStyle: "preserve-3d",
            background: enamel,
            boxShadow:
              "inset 0 1px 0 rgba(255,255,255,0.12), inset 0 -10px 30px rgba(0,0,0,0.5)",
          }}
        >
          {/* sheen */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 rounded-[14px] bg-[linear-gradient(115deg,rgba(255,255,255,0.10)_0%,transparent_28%,transparent_70%,rgba(255,255,255,0.05)_100%)]"
          />
          {/* chrome top rail */}
          <div aria-hidden className="absolute inset-x-0 top-0 h-3 rounded-t-[14px]" style={{ background: chrome }} />

          {/* Control glass: gauge + display */}
          <div
            className="absolute left-[14px] right-[14px] top-[20px] flex h-[86px] items-center gap-3 rounded-xl px-3"
            style={{
              background: "linear-gradient(180deg, #120c08 0%, #050302 100%)",
              boxShadow:
                "inset 0 2px 8px rgba(0,0,0,0.9), 0 1px 0 rgba(255,255,255,0.08)",
            }}
          >
            <Gauge phase={phase} />
            <div className="min-w-0 flex-1">
              <p className="font-display text-[13px] italic tracking-wide text-crema/80">
                nayana · café
              </p>
              <div className="mt-1.5 rounded-md border border-caramel/20 bg-[#1d1208] px-2 py-1.5 shadow-[inset_0_0_10px_rgba(0,0,0,0.8)]">
                <p
                  aria-live="polite"
                  className="truncate font-mono text-[10px] uppercase tracking-[0.12em] text-[#f0b46b] [text-shadow:0_0_6px_rgba(240,180,107,0.75)]"
                >
                  {lcd}
                </p>
                <p className="mt-0.5 font-mono text-[8px] tracking-[0.18em] text-[#f0b46b]/50">
                  {String(activeIndex + 1).padStart(2, "0")}/{String(drinks.length).padStart(2, "0")} · 93°C
                </p>
              </div>
            </div>
          </div>

          {/* Drink buttons */}
          <div
            role="tablist"
            aria-label="Choose a drink to brew a friend's letter"
            className="absolute left-[14px] right-[14px] top-[114px] grid grid-cols-5 gap-x-1 gap-y-1.5"
          >
            {drinks.map((drink, index) => {
              const selected = index === activeIndex;
              return (
                <button
                  key={drink.id}
                  type="button"
                  role="tab"
                  aria-selected={selected}
                  aria-controls="brewed-letter"
                  aria-label={`${drink.order}, a letter from ${drink.author}`}
                  onClick={() => onSelect(index)}
                  className="group flex flex-col items-center gap-[3px] rounded-md outline-none focus-visible:ring-2 focus-visible:ring-caramel"
                >
                  <span
                    className="relative flex h-[22px] w-[22px] items-center justify-center rounded-full shadow-[0_2px_3px_rgba(0,0,0,0.7)] transition-transform group-active:scale-90"
                    style={{ background: chrome }}
                  >
                    <span
                      className={`h-[12px] w-[12px] rounded-full transition ${
                        selected
                          ? "bg-[#f0b46b] shadow-[0_0_10px_3px_rgba(240,180,107,0.7)]"
                          : "bg-[#3a2a20] shadow-[inset_0_1px_2px_rgba(0,0,0,0.8)] group-hover:bg-[#5a4232]"
                      }`}
                    />
                  </span>
                  <span
                    className={`max-w-full whitespace-nowrap font-mono text-[7px] uppercase leading-tight tracking-tight ${
                      selected ? "text-[#f0b46b]" : "text-crema/45"
                    }`}
                  >
                    {shortLabel(drink.order)}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Brew cavity */}
          <div
            aria-hidden
            className="absolute left-[30px] right-[30px] top-[194px] rounded-t-[18px]"
            style={{
              height: TRAY_Y - 194,
              background: "linear-gradient(180deg, #070403 0%, #120b07 70%, #1d130c 100%)",
              boxShadow: "inset 0 12px 24px rgba(0,0,0,0.95), inset 0 -2px 0 rgba(255,255,255,0.04)",
            }}
          />

          {/* Group head + portafilter */}
          <div aria-hidden className="absolute left-1/2 top-[194px] -translate-x-1/2" style={{ transformStyle: "preserve-3d" }}>
            <div className="mx-auto h-[26px] w-[86px] rounded-b-md" style={{ background: chrome }} />
            <div
              className="relative mx-auto h-[16px] w-[64px] rounded-b-[14px]"
              style={{ background: chrome, transformStyle: "preserve-3d" }}
            >
              {/* handle sticks out toward you */}
              <div
                className="absolute left-[56px] top-[2px] h-[11px] w-[70px] rounded-r-full"
                style={{
                  background: "linear-gradient(180deg, #3b2a20 0%, #120c08 60%, #0a0705 100%)",
                  transform: "translateZ(22px) rotateY(-38deg)",
                  transformOrigin: "left center",
                  boxShadow: "0 3px 6px rgba(0,0,0,0.6)",
                }}
              />
            </div>
            <div className="mx-auto flex w-[22px] justify-between">
              <span className="block h-[6px] w-[5px] rounded-b-sm" style={{ background: chromeVertical }} />
              <span className="block h-[6px] w-[5px] rounded-b-sm" style={{ background: chromeVertical }} />
            </div>
          </div>

          <Streams phase={phase} brewKey={brewKey} />

          {/* Drip tray: top plate tilts out toward you, then the front lip */}
          <div
            aria-hidden
            className="absolute left-[22px] right-[22px]"
            style={{
              top: TRAY_Y,
              height: TRAY_DEPTH,
              transform: "rotateX(90deg)",
              transformOrigin: "top",
              background:
                "repeating-linear-gradient(90deg, #0b0705 0 4px, transparent 4px 10px), " + chrome,
              borderRadius: 3,
            }}
          />
          <div
            aria-hidden
            className="absolute left-[22px] right-[22px] h-[13px] rounded-b-md"
            style={{
              top: TRAY_Y,
              transform: `translateZ(${TRAY_DEPTH}px)`,
              background: chromeVertical,
              boxShadow: "0 6px 10px rgba(0,0,0,0.5)",
            }}
          />

          {/* Cup on the tray */}
          <div
            className="absolute left-1/2"
            style={{
              top: TRAY_Y - 54 + 2,
              marginLeft: -39,
              transform: `translateZ(${TRAY_DEPTH / 2}px)`,
            }}
          >
            <AnimatePresence>
              {phase === "served" && (
                <motion.div
                  className="absolute -top-9 left-1/2 -translate-x-1/2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <Steam className="h-9 w-9 text-crema/70" />
                </motion.div>
              )}
            </AnimatePresence>
            <Cup name={active.author} phase={phase} brewKey={brewKey} />
          </div>

          {/* Base */}
          <div aria-hidden className="absolute inset-x-0 bottom-0 h-[30px] rounded-b-[14px]" style={{ background: chrome }}>
            <p className="pt-[9px] text-center font-mono text-[7px] uppercase tracking-[0.5em] text-[#3b2a20]/70">
              brewed with love
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
