"use client";

import { useLocale } from "@/components/LocaleProvider";

export function LanguageToggle() {
  const { locale, setLocale } = useLocale();

  return (
    <button
      onClick={() => setLocale(locale === "zh" ? "en" : "zh")}
      className="fixed top-4 right-6 z-50 flex items-center gap-1 rounded-full border border-[var(--border-primary)] bg-[var(--bg-tertiary)] px-1.5 py-1.5 text-sm font-medium shadow-sm hover:shadow transition-all"
      aria-label="Switch language"
    >
      <span
        className={`px-3 py-1.5 rounded-full transition-all ${
          locale === "zh"
            ? "bg-[var(--text-primary)] text-[var(--bg-primary)]"
            : "text-[var(--text-tertiary)]"
        }`}
      >
        中
      </span>
      <span
        className={`px-3 py-1.5 rounded-full transition-all ${
          locale === "en"
            ? "bg-[var(--text-primary)] text-[var(--bg-primary)]"
            : "text-[var(--text-tertiary)]"
        }`}
      >
        EN
      </span>
    </button>
  );
}
