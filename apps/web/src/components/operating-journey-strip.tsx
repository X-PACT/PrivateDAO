import Link from "next/link";

import { cn } from "@/lib/utils";
import type { JudgeRuntimeLogsSnapshot } from "@/lib/judge-runtime-logs";

type OperatingJourneyStripProps = {
  snapshot: JudgeRuntimeLogsSnapshot;
  title?: string;
  description?: string;
};

export function OperatingJourneyStrip({
  snapshot,
  title = "Operating journey",
  description = "A readable status view of the wallet-first product cycle: connect, review, sign, then verify from the same Testnet operating surface.",
}: OperatingJourneyStripProps) {
  return (
    <section className="rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(9,15,28,0.96),rgba(6,9,18,0.98))] p-5 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="text-[11px] uppercase tracking-[0.28em] text-cyan-200/74">Operating journey</div>
          <div className="mt-2 text-2xl font-semibold text-white">{title}</div>
        </div>
        <div className="rounded-2xl border border-cyan-300/18 bg-cyan-300/[0.08] px-3 py-2 text-right">
          <div className="text-[11px] uppercase tracking-[0.2em] text-cyan-100/70">Freshness</div>
          <div className="mt-1 text-sm font-medium text-white">{snapshot.freshness}</div>
        </div>
      </div>
      <p className="mt-3 max-w-4xl text-sm leading-7 text-white/62">{description}</p>
      <div className="mt-5 grid gap-3 lg:grid-cols-4">
        {snapshot.operatingJourney.map((entry) => (
          <div key={entry.label} className="rounded-3xl border border-white/10 bg-white/4 p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="text-sm font-medium text-white">{entry.label}</div>
              <div
                className={cn(
                  "rounded-full border px-2 py-1 text-[10px] uppercase tracking-[0.18em]",
                  entry.status === "verified"
                    ? "border-emerald-300/22 bg-emerald-300/[0.12] text-emerald-100"
                    : entry.status === "partial"
                      ? "border-amber-300/22 bg-amber-300/[0.12] text-amber-100"
                      : "border-white/10 bg-white/[0.05] text-white/60",
                )}
              >
                {entry.status === "verified" ? "Verified" : entry.status === "partial" ? "Scaling" : "Pending"}
              </div>
            </div>
            <div className="mt-3 text-sm leading-7 text-white/60">{entry.detail}</div>
          </div>
        ))}
      </div>
      <div className="mt-5 rounded-3xl border border-cyan-300/16 bg-cyan-300/[0.08] p-4">
        <div className="text-[11px] uppercase tracking-[0.22em] text-cyan-100/72">Next step</div>
        <div className="mt-2 text-base font-medium text-white">{snapshot.nextStep.label}</div>
        <div className="mt-2 text-sm leading-7 text-white/62">{snapshot.nextStep.detail}</div>
        <Link
          href={snapshot.nextStep.href}
          className="mt-4 inline-flex rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-white transition hover:border-cyan-300/24 hover:text-cyan-100"
        >
          Open next route
        </Link>
      </div>
    </section>
  );
}
