export const locales = ["ar", "en"] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "ar";

export function isLocale(value: string): value is Locale {
  return locales.includes(value as Locale);
}

export function localeDirection(locale: Locale) {
  return locale === "ar" ? "rtl" : "ltr";
}

// Route params may already be percent-encoded in a streamed page render.
// Decode once at the boundary; callers still encode when building API URLs.
export function decodeRouteSegment(value: string): string {
  try { return decodeURIComponent(value); } catch { return value; }
}
