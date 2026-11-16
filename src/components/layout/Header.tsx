"use client";

import { CartLink } from '@/components/catalog/QuoteCart';
import Image from "next/image";
import Link from "next/link";
import { Globe, Menu, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { quoteCta, navigation } from "@/data/site";
import type { Locale } from "@/lib/locales";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";

export function Header({ locale, alternatePaths }: { locale: Locale; alternatePaths?: Record<string, string> }) {
  const menuButton = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState<string>("home");
  const otherLocale = locale === "ar" ? "en" : "ar";
  const cta = quoteCta[locale];
  const links = navigation[locale];

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 30);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const sectionIds = links.map(([_, id]) => id);

    const handleIntersection = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
        }
      });
    };

    const observer = new IntersectionObserver(handleIntersection, {
      rootMargin: "-30% 0px -50% 0px",
      threshold: 0.1,
    });

    sectionIds.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    const handleScroll = () => {
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 50) {
        const lastId = sectionIds[sectionIds.length - 1];
        if (lastId) {
          setActiveSection(lastId);
        }
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", handleScroll);
    };
  }, [links]);

  return (
    <header
      onKeyDown={(event) => { if (event.key === "Escape") { setOpen(false); menuButton.current?.focus(); } }}
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-500",
        scrolled
          ? "border-b border-white/[0.07] bg-ink-950/95 shadow-[0_4px_30px_rgba(0,0,0,0.35)] backdrop-blur-2xl"
          : "border-b border-white/[0.06] bg-ink-950/55 backdrop-blur-xl",
      )}
    >
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between gap-4 px-5 sm:px-6 lg:px-8">
        <Link
          href={`/${locale}#home`}
          className="focus-ring group flex items-center"
          aria-label={locale === "ar" ? "الوصابي للتجارة" : "Al-Wosabe for Trading"}
        >
          <Image
            src="/logo/logo-white.webp"
            alt=""
            width={220}
            height={55}
            sizes="(max-width: 640px) 110px, (max-width: 1280px) 147px, 162px"
            priority
            className="h-8 w-auto max-w-[110px] object-contain transition-opacity duration-300 group-hover:opacity-90 sm:h-10 sm:max-w-none xl:h-11"
          />
        </Link>

        <nav className="hidden items-center gap-0.5 xl:flex" aria-label="Main navigation">
          <Link href={`/${locale}/products`} className="animated-underline focus-ring rounded-md px-3.5 py-2 text-sm font-bold text-steel-200 hover:text-white">{locale === "ar" ? "الكتالوج" : "Catalog"}</Link>
          <Link href={`/${locale}/blog`} className="animated-underline focus-ring rounded-md px-3.5 py-2 text-sm font-bold text-steel-200 hover:text-white">{locale === "ar" ? "المدونة" : "Blog"}</Link>
          <Link href={`/${locale}/completed-tenders`} className="animated-underline focus-ring rounded-md px-3.5 py-2 text-sm font-bold text-steel-200 hover:text-white">{locale === "ar" ? "المناقصات المنفذة" : "Completed Tenders"}</Link>
          {links.filter(([, id]) => !['products', 'quote'].includes(id)).map(([label, id]) => {
            const isActive = activeSection === id;
            return (
              <a
                key={id}
                href={`/${locale}#${id}`}
                className={cn(
                  "animated-underline focus-ring relative rounded-md px-3.5 py-2 text-sm font-bold transition-colors duration-300",
                  isActive ? "active text-brand-bright" : "text-steel-200 hover:text-white",
                )}
              >
                {label}
              </a>
            );
          })}
        </nav>

        <div className="hidden items-center gap-2.5 xl:flex"><CartLink locale={locale} />
          <Link
            href={alternatePaths?.[otherLocale] || `/${otherLocale}`}
            className="focus-ring group flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-white transition-all duration-300 hover:border-brand/50 hover:bg-brand/10"
            aria-label={locale === "ar" ? "تغيير اللغة إلى الإنجليزية" : "Switch language to English"}
          >
            <Globe className="h-5 w-5 text-steel-300 transition-transform duration-500 group-hover:rotate-12 group-hover:text-brand-bright" />
          </Link>
          <Button href={`/${locale}/quote-cart`} className="min-h-11 px-4 py-2">
            {cta}
          </Button>
        </div>

        <div className="flex items-center gap-3 xl:hidden"><CartLink locale={locale} />
          <Link
            href={alternatePaths?.[otherLocale] || `/${otherLocale}`}
            className="focus-ring group flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-white transition-all duration-300 hover:border-brand/50 hover:bg-brand/10"
            aria-label={locale === "ar" ? "تغيير اللغة إلى الإنجليزية" : "Switch language to English"}
          >
            <Globe className="h-5 w-5 text-steel-300 transition-transform duration-500 group-hover:rotate-12 group-hover:text-brand-bright" />
          </Link>

          <button
            ref={menuButton}
            type="button"
            className="focus-ring inline-flex h-11 w-11 items-center justify-center rounded-md border border-white/10 text-white transition-all duration-300 hover:border-brand/50 hover:bg-brand/10 hover:text-brand-bright"
            aria-label={locale === "ar" ? (open ? "إغلاق القائمة" : "فتح القائمة") : (open ? "Close menu" : "Open menu")}
            aria-controls="mobile-navigation"
            aria-expanded={open}
            onClick={() => setOpen((value) => !value)}
          >
            {open ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
          </button>
        </div>
      </div>

      <div
        id="mobile-navigation"
        inert={!open}
        onKeyDown={(event) => { if (event.key === "Escape") setOpen(false); }}
        className={cn(
          "grid border-t border-white/[0.07] bg-ink-950/97 backdrop-blur-2xl transition-[grid-template-rows] duration-300 xl:hidden",
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
        )}
      >
        <div className="overflow-hidden">
          <nav className="grid gap-1 px-5 py-5" aria-label="Mobile navigation">
            <Link href={`/${locale}/products`} onClick={() => setOpen(false)} className="focus-ring rounded-md px-3 py-3 text-base font-bold text-steel-200 hover:bg-brand/10 hover:text-white">{locale === "ar" ? "الكتالوج" : "Catalog"}</Link>
            <Link href={`/${locale}/blog`} onClick={() => setOpen(false)} className="focus-ring rounded-md px-3 py-3 text-base font-bold text-steel-200 hover:bg-brand/10 hover:text-white">{locale === "ar" ? "المدونة" : "Blog"}</Link>
            <Link href={`/${locale}/completed-tenders`} onClick={() => setOpen(false)} className="focus-ring rounded-md px-3 py-3 text-base font-bold text-steel-200 hover:bg-brand/10 hover:text-white">{locale === "ar" ? "المناقصات المنفذة" : "Completed Tenders"}</Link>
            {links.map(([label, id]) => {
              const isActive = activeSection === id;
              return (
                <a
                  key={id}
                  href={`/${locale}#${id}`}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "focus-ring rounded-md px-3 py-3 text-base font-bold transition-colors duration-300 hover:bg-brand/10",
                    isActive ? "text-brand-bright" : "text-steel-200 hover:text-white",
                  )}
                >
                  {label}
                </a>
              );
            })}
            <div className="mt-3">
              <a
                href={`/${locale}/quote-cart`}
                onClick={() => setOpen(false)}
                className="focus-ring flex min-h-12 items-center justify-center rounded-lg bg-[image:var(--grad-brand)] text-sm font-bold text-ink-950 shadow-[var(--shadow-elev-2)] transition-all duration-300 hover:brightness-[1.04]"
              >
                {cta}
              </a>
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
}
