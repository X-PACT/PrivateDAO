"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

import {
  defaultLocale,
  getLocaleDefinition,
  localizedCopy,
  localeStorageKey,
  resolveLocale,
  supportedLocales,
  type SupportedLocale,
} from "@/lib/i18n";

type I18nContextValue = {
  locale: SupportedLocale;
  setLocale: (locale: SupportedLocale) => void;
  direction: "ltr" | "rtl";
  copy: (typeof localizedCopy)[SupportedLocale];
};

const I18nContext = createContext<I18nContextValue | null>(null);

type I18nProviderProps = {
  children: ReactNode;
};

function applyLocaleToDocument(locale: SupportedLocale) {
  if (typeof document === "undefined") {
    return;
  }

  const definition = getLocaleDefinition(locale);
  document.documentElement.lang = locale;
  document.documentElement.dir = definition.dir;
  document.body.dir = definition.dir;
}

export function I18nProvider({ children }: I18nProviderProps) {
  const [locale, setLocaleState] = useState<SupportedLocale>(defaultLocale);

  useEffect(() => {
    try {
      const storedLocale = window.localStorage.getItem(localeStorageKey);
      const nextLocale = resolveLocale(storedLocale);
      setLocaleState(nextLocale);
      applyLocaleToDocument(nextLocale);
    } catch {
      applyLocaleToDocument(defaultLocale);
    }
  }, []);

  const setLocale = (nextLocale: SupportedLocale) => {
    setLocaleState(nextLocale);
    applyLocaleToDocument(nextLocale);
    try {
      window.localStorage.setItem(localeStorageKey, nextLocale);
    } catch {
      // ignore storage failure
    }
  };

  const value = useMemo<I18nContextValue>(() => {
    const definition = getLocaleDefinition(locale);
    return {
      locale,
      setLocale,
      direction: definition.dir,
      copy: localizedCopy[locale],
    };
  }, [locale]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const context = useContext(I18nContext);

  if (!context) {
    throw new Error("useI18n must be used inside I18nProvider");
  }

  return context;
}

export function useSupportedLocales() {
  return supportedLocales;
}
