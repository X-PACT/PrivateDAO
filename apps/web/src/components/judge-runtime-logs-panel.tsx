import Link from "next/link";
import { ExternalLink, FileText, ShieldCheck, TerminalSquare } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getJudgeRuntimeLogsSnapshot } from "@/lib/judge-runtime-logs";

export function JudgeRuntimeLogsPanel() {
  const snapshot = getJudgeRuntimeLogsSnapshot();

  return (
    <Card className="border-cyan-400/20 bg-cyan-500/5">
      <CardHeader className="gap-3">
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="text-[11px] uppercase tracking-[0.28em] text-cyan-200/75">Judge runtime logs</div>
            <CardTitle className="mt-2 text-2xl text-white">Real Devnet execution logs, not summary-only proof</CardTitle>
          </div>
          <div className="rounded-2xl border border-cyan-300/20 bg-black/25 px-3 py-2 text-right">
            <div className="text-[11px] uppercase tracking-[0.28em] text-cyan-200/70">Freshness</div>
            <div className="mt-1 text-sm font-medium text-white">{snapshot.freshness}</div>
          </div>
        </div>
        <p className="max-w-4xl text-sm leading-7 text-white/62">
          The judge route now exposes real proposal and settlement signatures from the indexed Frontier evidence and
          the dedicated V3 hardening proof. This keeps the review surface tied to actual Devnet execution instead of
          packet summaries alone.
        </p>
      </CardHeader>
      <CardContent className="grid gap-6">
        <div className="grid gap-4 xl:grid-cols-2">
          <div className="rounded-3xl border border-white/10 bg-white/4 p-5">
            <div className="flex items-center gap-3 text-white">
              <TerminalSquare className="h-4 w-4 text-cyan-300" />
              <div className="text-lg font-medium">Governance path logs</div>
            </div>
            <div className="mt-2 text-sm leading-7 text-white/58">
              Proposal <span className="text-white">{snapshot.governance.proposal}</span> · {snapshot.governance.verificationStatus}
            </div>
            <div className="mt-4 grid gap-3">
              {snapshot.governance.entries.map((entry) => (
                <div key={entry.label} className="rounded-2xl border border-white/8 bg-black/20 p-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-sm font-medium text-white">{entry.label}</div>
                    <div className="text-xs text-cyan-200/80">{entry.status}</div>
                  </div>
                  <div className="mt-2 break-all text-xs leading-6 text-white/55">{entry.signature}</div>
                  {entry.slot ? <div className="mt-1 text-[11px] uppercase tracking-[0.22em] text-white/35">slot {entry.slot}</div> : null}
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/4 p-5">
            <div className="flex items-center gap-3 text-white">
              <ShieldCheck className="h-4 w-4 text-emerald-300" />
              <div className="text-lg font-medium">Confidential payout logs</div>
            </div>
            <div className="mt-2 text-sm leading-7 text-white/58">
              Proposal <span className="text-white">{snapshot.confidential.proposal}</span> · {snapshot.confidential.verificationStatus}
            </div>
            <div className="mt-4 grid gap-3">
              {snapshot.confidential.entries.map((entry) => (
                <div key={entry.label} className="rounded-2xl border border-white/8 bg-black/20 p-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-sm font-medium text-white">{entry.label}</div>
                    <div className="text-xs text-emerald-200/80">{entry.status}</div>
                  </div>
                  <div className="mt-2 break-all text-xs leading-6 text-white/55">{entry.signature}</div>
                  {entry.slot ? <div className="mt-1 text-[11px] uppercase tracking-[0.22em] text-white/35">slot {entry.slot}</div> : null}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-3xl border border-white/10 bg-white/4 p-5">
            <div className="flex items-center gap-3 text-white">
              <FileText className="h-4 w-4 text-fuchsia-300" />
              <div className="text-lg font-medium">V3 hardening proof capture</div>
            </div>
            <div className="mt-3 text-sm leading-7 text-white/58">
              {snapshot.v3Hardening.mode} · governance executed:{" "}
              <span className="text-white">{snapshot.v3Hardening.governanceExecuted ? "yes" : "no"}</span> · settlement evidence consumed:{" "}
              <span className="text-white">{snapshot.v3Hardening.settlementEvidenceConsumed ? "yes" : "no"}</span>
            </div>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <div className="rounded-2xl border border-white/8 bg-black/20 p-4">
                <div className="text-sm font-medium text-white">Governance V3 tx capture</div>
                <div className="mt-2 text-xs leading-6 text-white/52">{snapshot.v3Hardening.governanceProposal}</div>
                <div className="mt-3 grid gap-2">
                  {snapshot.v3Hardening.governanceEntries.slice(0, 5).map((entry) => (
                    <div key={entry.label} className="text-xs text-white/65">
                      <span className="text-white">{entry.label}</span> · {entry.signature}
                    </div>
                  ))}
                </div>
              </div>
              <div className="rounded-2xl border border-white/8 bg-black/20 p-4">
                <div className="text-sm font-medium text-white">Settlement V3 tx capture</div>
                <div className="mt-2 text-xs leading-6 text-white/52">{snapshot.v3Hardening.settlementProposal}</div>
                <div className="mt-3 grid gap-2">
                  {snapshot.v3Hardening.settlementEntries.slice(0, 5).map((entry) => (
                    <div key={entry.label} className="text-xs text-white/65">
                      <span className="text-white">{entry.label}</span> · {entry.signature}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/4 p-5">
            <div className="text-lg font-medium text-white">Runtime reality</div>
            <div className="mt-4 grid gap-3">
              <div className="rounded-2xl border border-white/8 bg-black/20 p-3 text-sm text-white/70">
                <div className="text-[11px] uppercase tracking-[0.22em] text-white/40">Real-device coverage</div>
                <div className="mt-1 text-white">{snapshot.runtime.walletCoverage}</div>
              </div>
              <div className="rounded-2xl border border-white/8 bg-black/20 p-3 text-sm text-white/70">
                <div className="text-[11px] uppercase tracking-[0.22em] text-white/40">Captured tx outcomes</div>
                <div className="mt-1 text-white">{snapshot.runtime.txSuccessRate}</div>
              </div>
              <div className="rounded-2xl border border-white/8 bg-black/20 p-3 text-sm text-white/70">
                <div className="text-[11px] uppercase tracking-[0.22em] text-white/40">Adversarial discipline</div>
                <div className="mt-1 text-white">{snapshot.runtime.adversarialSummary}</div>
              </div>
            </div>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link className={cn(buttonVariants({ size: "sm" }), "justify-between")} href="/documents/frontier-integrations">
                Open integration packet
                <ExternalLink className="ml-2 h-4 w-4" />
              </Link>
              <Link className={cn(buttonVariants({ size: "sm", variant: "secondary" }), "justify-between")} href="/documents/live-proof-v3">
                Open V3 proof
                <ExternalLink className="ml-2 h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
