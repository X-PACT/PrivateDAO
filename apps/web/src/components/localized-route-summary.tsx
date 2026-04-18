"use client";

import Link from "next/link";

import { useI18n } from "@/components/i18n-provider";
import { getRouteSummaryHref } from "@/lib/i18n";

type LocalizedRouteSummaryProps = {
  routeKey: "start" | "services" | "products" | "learn" | "judge" | "proof";
};

export function LocalizedRouteSummary({ routeKey }: LocalizedRouteSummaryProps) {
  const { copy } = useI18n();
  const summary = copy.routeSummaries[routeKey];

  return (
    <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-6">
      <div className="text-[11px] uppercase tracking-[0.24em] text-white/42">{summary.label}</div>
      <h2 className="mt-3 text-2xl font-semibold text-white">{summary.title}</h2>
      <p className="mt-3 max-w-3xl text-sm leading-7 text-white/64">{summary.body}</p>
      <div className="mt-5">
        <Link
          href={getRouteSummaryHref(routeKey)}
          className="text-sm font-medium text-cyan-200 underline underline-offset-4"
        >
          {summary.title}
        </Link>
      </div>
    </div>
  );
}
