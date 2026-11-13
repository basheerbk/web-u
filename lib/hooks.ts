"use client";

import { useSyncExternalStore } from "react";

const subscribeToResize = (callback: () => void) => {
  window.addEventListener("resize", callback);
  return () => window.removeEventListener("resize", callback);
};

export const useViewportWidth = () =>
  useSyncExternalStore(
    subscribeToResize,
    () => window.innerWidth,
    () => 1280
  );

export const useIsPortrait = () =>
  useSyncExternalStore(
    subscribeToResize,
    () => window.innerHeight > window.innerWidth,
    () => false
  );

const subscribeToPointer = (callback: () => void) => {
  const query = window.matchMedia("(pointer: coarse)");
  query.addEventListener("change", callback);
  return () => query.removeEventListener("change", callback);
};

export const useIsTouch = () =>
  useSyncExternalStore(
    subscribeToPointer,
    () => window.matchMedia("(pointer: coarse)").matches,
    () => false
  );