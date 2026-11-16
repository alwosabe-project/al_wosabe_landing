"use client";

import { useState, type ReactNode } from "react";
import dynamic from "next/dynamic";
import { MapPin } from "lucide-react";
import { branches } from "@/data/site";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import type { Locale } from "@/lib/locales";
import { cn } from "@/lib/utils";

// A separate chunk, with server-rendered map markup retained.
const AnimatedRouteMap = dynamic(() => import("@/components/ui/AnimatedRouteMap").then(m => m.AnimatedRouteMap));

export function Distribution({ locale, heading }: { locale: Locale; heading: ReactNode }) {
  const [hoveredCity, setHoveredCity] = useState<string | null>(null);

  return (
    <section id="distribution" className="relative overflow-hidden bg-ink-950 py-20 text-on-dark sm:py-28">
      <div className="ambient-dark pointer-events-none absolute inset-0" />
      <div className="blueprint-grid pointer-events-none absolute inset-0 opacity-60" />

      <Container className="relative grid gap-14 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <Reveal>
          {heading}
          <div className="mt-9 grid grid-cols-4 gap-2 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-3">
            {branches.map((branch) => {
              const active = hoveredCity === branch.city.en;
              return (
                <button
                  key={branch.city.en}
                  type="button"
                  onMouseEnter={() => setHoveredCity(branch.city.en)}
                  onMouseLeave={() => setHoveredCity(null)}
                  onClick={() => setHoveredCity(branch.city.en)}
                  className={cn(
                    "focus-ring flex flex-col items-center justify-center gap-1 rounded-lg border p-2 text-center text-[10px] font-bold transition-all duration-300 sm:flex-row sm:gap-2 sm:text-xs md:text-sm",
                    active
                      ? "border-brand bg-brand/15 text-white"
                      : "border-white/8 bg-white/[0.04] text-steel-400 hover:border-brand/30 hover:bg-white/[0.07] hover:text-steel-100",
                  )}
                >
                  <MapPin
                    size={12}
                    aria-hidden="true"
                    className={cn("shrink-0 transition-all duration-300", active ? "scale-110 text-brand-bright" : "text-brand")}
                  />
                  <span className="max-w-full truncate">{branch.city[locale]}</span>
                </button>
              );
            })}
          </div>
        </Reveal>

        <Reveal direction="left">
          <AnimatedRouteMap locale={locale} hoveredCity={hoveredCity} setHoveredCity={setHoveredCity} />
        </Reveal>
      </Container>
    </section>
  );
}
