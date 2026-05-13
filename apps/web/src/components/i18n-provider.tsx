"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

import {
  defaultLocale,
  getLocaleDefinition,
  isSupportedLocale,
  localeExplicitStorageKey,
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

function resolveExplicitBrowserLocale(): SupportedLocale {
  if (typeof window === "undefined") return defaultLocale;

  try {
    const searchLocale = new URLSearchParams(window.location.search).get("lang");
    if (searchLocale && isSupportedLocale(searchLocale)) {
      window.localStorage.setItem(localeStorageKey, searchLocale);
      window.localStorage.setItem(localeExplicitStorageKey, "1");
      return searchLocale;
    }

    const hasExplicitSelection = window.localStorage.getItem(localeExplicitStorageKey) === "1";
    if (!hasExplicitSelection) {
      window.localStorage.removeItem(localeStorageKey);
      return defaultLocale;
    }

    return resolveLocale(window.localStorage.getItem(localeStorageKey));
  } catch {
    return defaultLocale;
  }
}

export function I18nProvider({ children }: I18nProviderProps) {
  const [locale, setLocaleState] = useState<SupportedLocale>(() => {
    return resolveExplicitBrowserLocale();
  });

  useEffect(() => {
    applyLocaleToDocument(locale);
  }, [locale]);

  const setLocale = (nextLocale: SupportedLocale) => {
    setLocaleState(nextLocale);
    applyLocaleToDocument(nextLocale);
    try {
      window.localStorage.setItem(localeStorageKey, nextLocale);
      window.localStorage.setItem(localeExplicitStorageKey, "1");
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
