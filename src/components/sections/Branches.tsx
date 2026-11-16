"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { MapPin, Phone, X } from "lucide-react";
import { branches } from "@/data/site";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import type { Locale } from "@/lib/locales";
import { phoneHref } from "@/lib/utils";

export function Branches({ locale, heading }: { locale: Locale; heading: ReactNode }) {
  const [selectedBranch, setSelectedBranch] = useState<(typeof branches)[0] | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!selectedBranch) return;
    const previous = document.activeElement;
    const dialog = dialogRef.current;
    const focusable = () => dialog?.querySelectorAll<HTMLElement>('button, a[href]');
    focusable()?.[0]?.focus();
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSelectedBranch(null);
      if (event.key !== "Tab") return;
      const nodes = focusable();
      if (!nodes?.length) return;
      const first = nodes[0], last = nodes[nodes.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    document.addEventListener("keydown", handleKey);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = overflow;
      if (previous instanceof HTMLElement) previous.focus();
    };
  }, [selectedBranch]);

  return (
    <section id="branches" className="bg-sand-50 py-20 sm:py-28">
      <Container>
        {heading}
        <div className="mt-14 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-2 xl:grid-cols-3">
          {branches.map((branch, index) => (
            <Reveal key={branch.city.en} delay={index * 0.04}>
              <button
                onClick={() => setSelectedBranch(branch)}
                className="card-rise focus-ring group flex w-full items-center justify-between rounded-2xl border border-steel-200 bg-paper p-4 text-start shadow-[var(--shadow-elev-1)] hover:border-brand/40 md:p-6"
              >
                <div className="flex items-center gap-3 overflow-hidden md:gap-4">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[image:var(--grad-dark)] text-brand-bright shadow-[var(--shadow-elev-1)] transition-all duration-300 group-hover:bg-[image:var(--grad-brand)] group-hover:text-ink-950 md:h-12 md:w-12">
                    <MapPin className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <div className="overflow-hidden">
                    <h3 className="truncate text-base font-bold text-ink-900 transition-colors group-hover:text-brand-deep md:text-lg">
                      {branch.city[locale]}
                    </h3>
                    <span className="mt-0.5 block truncate text-[11px] text-graphite-500">
                      {locale === "ar" ? "اضغط للتواصل" : "Click to connect"}
                    </span>
                  </div>
                </div>
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-steel-100 text-brand-deep transition-all duration-300 group-hover:bg-brand group-hover:text-ink-950">
                  <Phone className="h-4 w-4" />
                </span>
              </button>
            </Reveal>
          ))}
        </div>
      </Container>

        {selectedBranch && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div

              onClick={() => setSelectedBranch(null)}
              className="absolute inset-0 bg-ink-950/70 backdrop-blur-md"
            />
            <div
              ref={dialogRef}
              role="dialog"
              aria-modal="true"
              aria-labelledby="branch-dialog-title"

              className="branch-dialog relative z-10 w-full max-w-md overflow-hidden rounded-2xl border border-white/10 bg-ink-900 p-6 text-white shadow-[var(--shadow-elev-3)]"
            >
              <div className="absolute inset-x-0 top-0 h-1 bg-[image:var(--grad-brand)]" />
              <button
                onClick={() => setSelectedBranch(null)}
                className="focus-ring absolute top-4 end-4 flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-steel-300 transition-all hover:bg-white/10 hover:text-white"
                aria-label={locale === "ar" ? "إغلاق" : "Close"}
              >
                <X size={18} />
              </button>

              <div className="mb-6 flex items-center gap-3.5 text-start">
                <span className="chrome flex h-12 w-12 items-center justify-center rounded-xl text-ink-950">
                  <MapPin size={22} />
                </span>
                <div>
                  <h3 id="branch-dialog-title" className="font-display text-xl font-extrabold">{selectedBranch.city[locale]}</h3>
                  <p className="mt-0.5 text-xs font-semibold uppercase tracking-wider text-brand-bright">
                    {locale === "ar" ? "أرقام التواصل والفرع" : "Branch Contact Numbers"}
                  </p>
                </div>
              </div>

              <div className="max-h-[300px] space-y-3 overflow-y-auto pe-1">
                {selectedBranch.phones.map((phone) => (
                  <a
                    key={phone}
                    href={phoneHref(phone)}
                    className="group flex items-center justify-between gap-4 rounded-xl border border-white/8 bg-white/5 px-4 py-3.5 text-sm font-bold text-white transition-all duration-300 hover:border-brand/50 hover:bg-brand/10 hover:text-brand-bright"
                  >
                    <span dir="ltr">{phone}</span>
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-steel-300 transition-colors duration-300 group-hover:bg-brand group-hover:text-ink-950">
                      <Phone size={14} />
                    </span>
                  </a>
                ))}
              </div>

              <div className="mt-6 border-t border-white/8 pt-4 text-center">
                <p className="text-xs text-steel-400">
                  {locale === "ar" ? "جميع الأرقام قابلة للضغط للاتصال المباشر" : "All numbers are clickable for direct calls"}
                </p>
              </div>
            </div>
          </div>
        )}
    </section>
  );
}
