"use client";

import { ShieldAlert } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { analyzeTreasuryProposalCard } from "@/lib/operational-intelligence";
import type { ProposalCardModel } from "@/lib/site-data";

type TreasuryRiskInlineProps = {
  proposal: ProposalCardModel;
  compact?: boolean;
};

export function TreasuryRiskInline({ proposal, compact = false }: TreasuryRiskInlineProps) {
  const analysis = analyzeTreasuryProposalCard(proposal);
  const context = proposal.execution;

  return (
    <div className="rounded-3xl border border-amber-300/15 bg-amber-400/5 p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl border border-amber-300/20 bg-amber-300/10 p-2">
            <ShieldAlert className="h-4 w-4 text-amber-200" />
          </div>
          <div>
            <div className="text-[11px] uppercase tracking-[0.28em] text-amber-200/75">Treasury Review AI</div>
            <div className="mt-1 text-sm font-medium text-white">{analysis.headline}</div>
          </div>
        </div>
        <Badge variant={analysis.scoreValue >= 7 ? "warning" : analysis.scoreValue >= 4.5 ? "cyan" : "success"}>
          {analysis.scoreLabel}
        </Badge>
      </div>

      <p className="mt-3 text-sm leading-7 text-white/62">{analysis.summary}</p>

      <div className="mt-3 grid gap-3 rounded-[24px] border border-amber-300/12 bg-black/20 p-4 sm:grid-cols-2">
        <div className="text-sm leading-7 text-white/56">
          <div className="text-[11px] uppercase tracking-[0.22em] text-amber-200/60">Treasury destination</div>
          <div className="mt-1 break-all text-white/80">{context.recipient ?? context.recipientLabel}</div>
        </div>
        <div className="text-sm leading-7 text-white/56">
          <div className="text-[11px] uppercase tracking-[0.22em] text-amber-200/60">Baseline motion</div>
          <div className="mt-1 text-white/80">
            {context.baselineAmount !== null ? `${context.baselineAmount} ${context.mintSymbol ?? "asset"}` : "Pending exact baseline in current evidence packet"}
          </div>
        </div>
        {!compact ? (
          <>
            <div className="text-sm leading-7 text-white/56">
              <div className="text-[11px] uppercase tracking-[0.22em] text-amber-200/60">Current motion</div>
              <div className="mt-1 text-white/80">{context.amountDisplay}</div>
            </div>
            <div className="text-sm leading-7 text-white/56">
              <div className="text-[11px] uppercase tracking-[0.22em] text-amber-200/60">Execution target</div>
              <div className="mt-1 text-white/80">{context.executionTarget}</div>
            </div>
          </>
        ) : null}
      </div>

      <div className="mt-3 space-y-2">
        {(compact ? analysis.bullets.slice(0, 2) : analysis.bullets).map((bullet) => (
          <div key={bullet} className="text-sm leading-7 text-white/56">
            {bullet}
          </div>
        ))}
      </div>

      {!compact ? <div className="mt-3 text-xs leading-6 text-white/40">{analysis.sourceSummary}</div> : null}
    </div>
  );
}
