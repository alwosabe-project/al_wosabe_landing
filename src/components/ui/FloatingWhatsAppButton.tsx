"use client";

import { useEffect, useState } from "react";
import { MessageSquare } from "lucide-react";
import { whatsappHref } from "@/lib/utils";

export function FloatingWhatsAppButton({ locale, whatsappNumber }: { locale: "ar" | "en"; whatsappNumber: string }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > 400);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const message =
    locale === "ar"
      ? "مرحباً، أريد الاستفسار عن منتجات وخدمات الوصابي للتجارة."
      : "Hello, I would like to inquire about Al-Wosabe's trading products and services.";

  const label = locale === "ar" ? "تواصل واتساب" : "WhatsApp";

  return (
    <>
      {visible && (
        <a
          aria-label={label}
          href={whatsappHref(whatsappNumber, message)}
          target="_blank"
          rel="noopener noreferrer"
          className="focus-ring fixed bottom-6 end-6 z-[90] flex select-none items-center gap-2 rounded-full bg-emerald-800 p-3.5 text-sm font-bold text-white shadow-[var(--shadow-elev-3)] transition-all hover:bg-emerald-700 md:px-5 md:py-3"
        >
          <MessageSquare size={18} />
          <span className="hidden md:inline">{label}</span>
        </a>
      )}
    </>
  );
}
