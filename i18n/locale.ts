import { Pathnames } from "next-intl/routing";

export const locales = ["en", "zh", "ja", "fr", "de", "ko", "es", "ru", "pt", "ar", "hi"];


export const localeNames: any = {
  en: "English",
  zh: "简体中文",
  ja: "日本語",
  fr: "Français",
  de: "Deutsch",
  ko: "한국어",
  es: "Español",
  ru: "Русский",
  pt: "Português",
  ar: "العربية",
  hi: "हिन्दी",
};

export const defaultLocale = "en";

export const localePrefix = "as-needed";

export const localeDetection =
  process.env.NEXT_PUBLIC_LOCALE_DETECTION === "true";

export const pathnames = {
  en: {
    "privacy-policy": "/privacy-policy",
    "terms-of-service": "/terms-of-service",
  },
} satisfies Pathnames<typeof locales>;
