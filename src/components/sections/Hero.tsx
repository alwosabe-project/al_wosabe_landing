"use client";

import { ArrowUpRight, Package } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { ProductShowcase, useShowcaseCycle } from "@/components/ui/ProductShowcase";
import type { content } from "@/data/site";
import type { Locale } from "@/lib/locales";
import type { Category, Product } from "@/lib/api";

export function Hero({ locale, years, categories, featured, hero, branchCount }: { locale: Locale; years: number; categories: Category[]; featured: Product[]; hero: typeof content[Locale]["hero"]; branchCount: number }) {
  const isAr = locale === "ar";
  const source = featured.length ? featured : categories;
  const showcaseProducts = source.length ? source.map((item) => {
    const isProduct = "shortDescription" in item;
    return { title: item.name, description: isProduct ? item.shortDescription : item.description, image: (isProduct ? item.mainImage?.url : item.image?.url) || "/images/hero/hero-warehouse.webp", icon: Package, category: isProduct ? item.primaryCategory?.name || (isAr ? "منتج" : "Product") : (isAr ? "فئة" : "Category") };
  }) : [{ title: isAr ? "حلول المركبات" : "Vehicle solutions", description: hero.description, image: "/images/hero/hero-warehouse.webp", icon: Package, category: isAr ? "الوصابي" : "Al-Wosabe" }];
  const { active, setActive, setPaused, ref } = useShowcaseCycle(showcaseProducts.length);
  const activeTitle = showcaseProducts[active].title;

  const credentials: [string, string][] = isAr
    ? [
        ["1986", "سنة التأسيس"],
        [`${years}+`, "عامًا من الخبرة"],
        [`${branchCount}`, "فروع رئيسية"],
        ["50K+", "عميل وتاجر"],
      ]
    : [
        ["1986", "Established"],
        [`${years}+`, "Years"],
        [`${branchCount}`, "Branches"],
        ["50K+", "Clients"],
      ];

  return (
    <section
      id="home"
      className="relative flex min-h-[760px] items-center overflow-hidden bg-ink-950 pt-28 text-on-dark md:min-h-screen"
    >
      {/* Single quiet ambient layer + faint engineering grid */}
      <div className="ambient-dark pointer-events-none absolute inset-0 z-0" />
      <div className="blueprint-grid pointer-events-none absolute inset-0 z-0 opacity-70" />

      <Container className="relative z-10 grid min-h-[calc(100vh-7rem)] items-center gap-12 py-16 lg:grid-cols-[1.02fr_0.98fr] lg:gap-10">
        {/* Copy column */}
        <div className="flex w-full min-w-0 flex-col items-center text-center lg:items-start lg:text-start">
          <div>
            <span className="mb-6 inline-flex items-center gap-2.5 rounded-full border border-white/10 bg-white/[0.04] py-1.5 ps-2.5 pe-4 text-xs font-bold uppercase tracking-[0.18em] text-steel-300 backdrop-blur">
              <span className="h-1.5 w-1.5 rounded-full bg-brand" />
              {hero.eyebrow}
            </span>
          </div>

          <h1 className="font-display w-full text-center text-[2.6rem] font-extrabold leading-[1.06] tracking-tight text-white sm:text-6xl lg:text-start lg:text-[4.25rem] xl:text-[4.75rem]">
            {isAr ? "الوصابي" : "Al-Wosabe"}{" "}
            <span className="text-gradient">
              {isAr ? "للتجارة" : "for Trading"}
            </span>
          </h1>

          {/* Kinetic line synced to the product showcase */}
          <div className="w-full">
            <p className="mt-6 flex w-full flex-wrap items-center justify-center gap-x-2.5 gap-y-1 text-lg font-bold text-steel-300 sm:text-xl lg:justify-start">
              <span>{isAr ? "نوفّر لكل مركبة" : "Everything your vehicle needs"}</span>
              <span aria-hidden="true" className="text-steel-500">—</span>
              <span className="relative inline-flex min-h-[1.5em] max-w-full items-center">

                  <span
                    key={active}
                    className="text-gradient font-extrabold"
                  >
                    {activeTitle}
                  </span>

              </span>
            </p>
          </div>

          <div className="flex w-full justify-center lg:justify-start">
            <p className="mt-4 max-w-xl text-base leading-[1.9] text-steel-400">{hero.description}</p>
          </div>

          <div className="flex w-full justify-center lg:justify-start">
            <div className="mt-9 flex w-full max-w-md flex-row gap-3 sm:w-auto sm:max-w-none">
              <Button href="#quote" className="flex-1 sm:flex-none">
                {hero.primary}
                <ArrowUpRight aria-hidden="true" size={18} className="rtl:-scale-x-100" />
              </Button>
              <Button href="#products" variant="secondary" className="flex-1 sm:flex-none">
                {hero.secondary}
              </Button>
            </div>
          </div>

          {/* Credential strip */}
          <div className="w-full">
            <div className="mt-12 flex w-full items-stretch justify-center gap-0 lg:justify-start">
              {credentials.map(([value, label], i) => (
                <div key={label} className="flex items-stretch">
                  {i > 0 && <span className="mx-4 w-px self-stretch bg-white/10 sm:mx-6" aria-hidden="true" />}
                  <div className="text-center lg:text-start">
                    <div className="font-display text-2xl font-extrabold tabular-nums text-white sm:text-3xl">
                      {value}
                    </div>
                    <div className="mt-1 text-[11px] font-bold uppercase tracking-wider text-steel-400">
                      {label}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Kinetic product showcase */}
        <div ref={ref} className="w-full min-w-0 max-lg:order-2">
          <ProductShowcase
            products={showcaseProducts}
            locale={locale}
            active={active}
            onSelect={setActive}
            onPauseChange={setPaused}
          />
        </div>
      </Container>

      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 z-[2] h-28 w-full bg-no-repeat"
        style={{
          backgroundImage: "url('/images/graphics/industrial_divider.webp')",
          backgroundSize: "100% 100%",
        }}
      />
    </section>
  );
}
