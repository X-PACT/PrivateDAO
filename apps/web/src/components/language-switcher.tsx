"use client";

import { Languages } from "lucide-react";

import { useI18n, useSupportedLocales } from "@/components/i18n-provider";

export function LanguageSwitcher() {
  const { locale, setLocale, copy } = useI18n();
  const locales = useSupportedLocales();

  return (
    <label className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/72">
      <Languages className="h-4 w-4 text-cyan-200" />
      <span className="hidden sm:inline">{copy.chrome.language}</span>
      <select
        aria-label={copy.chrome.language}
        className="bg-transparent text-xs text-white outline-none"
        value={locale}
        onChange={(event) => setLocale(event.target.value as typeof locale)}
      >
        {locales.map((item) => (
          <option key={item.code} value={item.code} className="bg-[#050816] text-white">
            {item.nativeLabel}
          </option>
        ))}
      </select>
    </label>
  );
}
