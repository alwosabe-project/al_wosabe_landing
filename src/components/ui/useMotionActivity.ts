"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";

const query = "(min-width: 1024px) and (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)";
const subscribeMedia = (listener: () => void) => {
  const media = window.matchMedia(query);
  media.addEventListener("change", listener);
  return () => media.removeEventListener("change", listener);
};
const desktopMotion = () => window.matchMedia(query).matches;
const subscribeVisibility = (listener: () => void) => {
  document.addEventListener("visibilitychange", listener);
  return () => document.removeEventListener("visibilitychange", listener);
};
const pageVisible = () => document.visibilityState === "visible";
const serverFalse = () => false;

export function useMotionActivity<T extends Element = HTMLDivElement>() {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting));
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  const desktop = useSyncExternalStore(subscribeMedia, desktopMotion, serverFalse);
  const visible = useSyncExternalStore(subscribeVisibility, pageVisible, serverFalse);
  return { ref, animate: desktop && inView && visible };
}
