"use client";

import { Languages } from "lucide-react";

import { useI18n, useSupportedLocales } from "@/components/i18n-provider";
import { cn } from "@/lib/utils";

export function LanguageSwitcher({ compact = false }: { compact?: boolean }) {
  const { selectedLocale, setLocale, copy } = useI18n();
  const locales = useSupportedLocales();

  return (
    <label className={cn("inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 py-2 text-xs text-white/72", compact ? "px-2" : "px-3")}>
      <Languages className="h-4 w-4 text-cyan-200" />
      <span className={compact ? "sr-only" : "hidden sm:inline"}>{copy.chrome.language}</span>
      <select
        aria-label={copy.chrome.language}
        className={cn("bg-transparent text-xs text-white outline-none", compact && "max-w-[3.25rem]")}
        value={selectedLocale}
        onChange={(event) => setLocale(event.target.value as typeof selectedLocale)}
      >
        {locales.map((item) => (
          <option key={item.code} value={item.code} className="bg-[#050816] text-white">
            {item.code === selectedLocale ? item.nativeLabel : item.label}
          </option>
        ))}
      </select>
    </label>
  );
}
