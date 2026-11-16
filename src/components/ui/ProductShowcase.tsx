"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type PointerEvent } from "react";
import { Tag, Truck, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Locale } from "@/lib/locales";
import { useMotionActivity } from "@/components/ui/useMotionActivity";

type ShowcaseProduct = { title: string; description: string; image: string; icon: LucideIcon; category: string };

// The observer belongs to the showcase, so an off-screen mobile image never cycles.
export function useShowcaseCycle(length: number, intervalMs = 3800) {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const { ref, animate } = useMotionActivity();
  useEffect(() => {
    if (paused || !animate || length <= 1) return;
    const id = window.setInterval(() => setActive(i => (i + 1) % length), intervalMs);
    return () => window.clearInterval(id);
  }, [paused, animate, length, intervalMs, active]);
  return { active, setActive, setPaused, ref };
}

export function ProductShowcase({ products, locale, active, onSelect, onPauseChange }: {
  products: ShowcaseProduct[];
  locale: Locale;
  active: number;
  onSelect: (index: number) => void;
  onPauseChange: (paused: boolean) => void;
}) {
  const isAr = locale === "ar";
  const current = products[active];
  const Icon = current.icon;
  const { ref, animate } = useMotionActivity();
  const stageRef = useRef<HTMLDivElement>(null);
  const handlePointer = (event: PointerEvent<HTMLDivElement>) => {
    if (!animate || event.pointerType !== "mouse") return;
    const stage = stageRef.current;
    if (!stage) return;
    const rect = stage.getBoundingClientRect();
    stage.style.setProperty("--tilt-x", `${(event.clientY - rect.top) / rect.height * -18 + 9}deg`);
    stage.style.setProperty("--tilt-y", `${(event.clientX - rect.left) / rect.width * 22 - 11}deg`);
  };
  const reset = () => {
    stageRef.current?.style.setProperty("--tilt-x", "0deg");
    stageRef.current?.style.setProperty("--tilt-y", "0deg");
  };
  return (
    <div ref={ref} className="showcase relative mx-auto w-full max-w-[480px]" data-motion={animate}
      onMouseEnter={() => onPauseChange(true)}
      onMouseLeave={() => { onPauseChange(false); reset(); }}
      onFocusCapture={() => onPauseChange(true)}
      onBlurCapture={event => { if (!event.currentTarget.contains(event.relatedTarget)) onPauseChange(false); }}>
      <span className="sr-only" aria-live="polite">{current.title}</span>
      <div className="flex flex-col items-center gap-6 lg:flex-row lg:items-center lg:gap-7">
        <div ref={stageRef} onPointerMove={handlePointer} onPointerLeave={reset}
          className="relative grid aspect-square w-full max-w-[340px] flex-1 place-items-center sm:max-w-[380px]" style={{ perspective: 1100 }}>
          <div aria-hidden="true" className="product-ring showcase-ring absolute inset-[4%]" />
          <div aria-hidden="true" className="product-ticks showcase-ticks absolute inset-[11%]" />
          <div aria-hidden="true" className="absolute inset-[16%] rounded-full" style={{ background: "radial-gradient(circle, rgba(248,162,30,0.16), transparent 70%)" }} />
          <div className="showcase-disc relative z-10 aspect-square w-[62%]">
            <div key={active} className="showcase-product absolute inset-0">
              <div className="h-full w-full rounded-full p-[3px]" style={{ background: "var(--grad-chrome)", boxShadow: "var(--shadow-elev-3)" }}>
                <div className="relative h-full w-full overflow-hidden rounded-full bg-ink-900">
                  <Image src={current.image} alt={current.title} fill sizes="(max-width: 640px) 210px, 240px" loading="lazy" className="object-cover" />
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink-950/65 via-transparent to-transparent" />
                </div>
              </div>
            </div>
          </div>
          <Chip className="end-[2%] top-[6%]"><Icon size={14} aria-hidden="true" className="text-brand-bright" />{current.title}</Chip>
          <Chip className="bottom-[12%] start-0"><Truck size={14} aria-hidden="true" className="text-brand-bright" />{isAr ? "توزيع وطني" : "Nationwide"}</Chip>
          <Chip className="bottom-[2%] end-[20%]"><Tag size={14} aria-hidden="true" className="text-brand-bright" />{current.category}</Chip>
        </div>
        <div role="group" aria-label={isAr ? "فئات المنتجات" : "Product categories"} className="flex w-full gap-2 overflow-x-auto pb-1 lg:w-44 lg:flex-col lg:overflow-visible lg:pb-0">
          {products.map((product, index) => {
            const selected = index === active;
            const ProductIcon = product.icon;
            return <button key={product.title} type="button" aria-pressed={selected} onClick={() => onSelect(index)}
              className={cn("focus-ring group relative shrink-0 overflow-hidden rounded-xl border px-3 py-2.5 text-start transition-all duration-300", selected ? "border-brand/40 bg-white/[0.06]" : "border-white/8 bg-white/[0.02] hover:border-white/15 hover:bg-white/[0.04]")}>
              <span className="flex items-center gap-2.5">
                <span className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-all duration-300", selected ? "chrome text-ink-950" : "bg-white/5 text-steel-400 group-hover:text-steel-200")}><ProductIcon size={16} aria-hidden="true" /></span>
                <span className={cn("text-xs font-bold tracking-tight whitespace-nowrap transition-colors duration-300 lg:whitespace-normal", selected ? "text-white" : "text-steel-400 group-hover:text-steel-200")}>{product.title}</span>
              </span>
              {selected && <span aria-hidden="true" className="absolute inset-x-0 bottom-0 h-[2px] bg-[image:var(--grad-brand)]" />}
            </button>;
          })}
        </div>
      </div>
    </div>
  );
}
function Chip({ children, className }: { children: React.ReactNode; className: string }) {
  return <div className={cn("showcase-chip absolute z-20", className)}><div className="flex items-center gap-2 rounded-xl border border-white/10 bg-ink-900/85 px-3 py-2 text-[11px] font-bold text-steel-200 shadow-[var(--shadow-elev-2)] backdrop-blur-md">{children}</div></div>;
}
