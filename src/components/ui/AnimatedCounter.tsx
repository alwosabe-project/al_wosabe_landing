"use client";

import { useEffect, useRef, useState } from "react";

export function AnimatedCounter({
  value,
  suffix = "",
  className,
}: {
  value: number;
  suffix?: string;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);

  const [display, setDisplay] = useState(value);

  useEffect(() => {
    const element = ref.current;
    if (!element || !window.matchMedia("(min-width: 1024px) and (prefers-reduced-motion: no-preference)").matches) return;
    let timer: number | undefined;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      observer.disconnect();
      let frame = 0;
      timer = window.setInterval(() => {
        frame += 1;
        setDisplay(Math.round(value * (1 - Math.pow(1 - frame / 42, 3))));
        if (frame >= 42) window.clearInterval(timer);
      }, 20);
    }, { rootMargin: "-80px" });
    observer.observe(element);
    return () => { observer.disconnect(); window.clearInterval(timer); };
  }, [value]);

  return (
    <span
      ref={ref}
      className={className}
      dir="ltr"
      style={{ display: "inline-flex", direction: "ltr", unicodeBidi: "isolate" }}
    >
      <span style={{ fontVariantNumeric: "tabular-nums" }}>{display}</span>
      {suffix}
    </span>
  );
}
