"use client";

import { createContext, useContext, useState, useEffect, useCallback, startTransition } from "react";
import { useRouter } from "next/navigation";
import type { Locale } from "@/lib/i18n";
import { DEFAULT_LOCALE, LOCALE_COOKIE } from "@/lib/i18n";

interface LocaleContextValue {
  locale: Locale;
  setLocale: (l: Locale) => void;
}

const LocaleContext = createContext<LocaleContextValue>({
  locale: DEFAULT_LOCALE,
  setLocale: () => {},
});

export function useLocale() {
  return useContext(LocaleContext);
}

export function LocaleProvider({
  initial,
  children,
}: {
  initial: Locale;
  children: React.ReactNode;
}) {
  const [locale, setLocaleState] = useState<Locale>(initial);
  const router = useRouter();

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l);
    localStorage.setItem(LOCALE_COOKIE, l);
    // Set cookie so server components can read it on next navigation
    document.cookie = `${LOCALE_COOKIE}=${l};path=/;max-age=31536000;SameSite=Lax`;
    // Soft-refresh so route transitions can animate instead of hard reloading.
    startTransition(() => {
      router.refresh();
    });
  }, [router]);

  useEffect(() => {
    // Sync from localStorage on mount (in case cookie and localStorage diverge)
    const stored = localStorage.getItem(LOCALE_COOKIE) as Locale | null;
    if (stored && stored !== locale) {
      setLocaleState(stored);
    }
  }, []);

  return (
    <LocaleContext.Provider value={{ locale, setLocale }}>
      {children}
    </LocaleContext.Provider>
  );
}
