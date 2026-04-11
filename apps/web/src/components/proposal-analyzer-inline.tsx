"use client";

import { BrainCircuit } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import type { ProposalCardModel } from "@/lib/site-data";
import { analyzeProposalCard } from "@/lib/operational-intelligence";

type ProposalAnalyzerInlineProps = {
  proposal: ProposalCardModel;
  compact?: boolean;
};

export function ProposalAnalyzerInline({ proposal, compact = false }: ProposalAnalyzerInlineProps) {
  const analysis = analyzeProposalCard(proposal);

  return (
    <div className="rounded-3xl border border-cyan-300/15 bg-cyan-400/5 p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl border border-cyan-300/20 bg-cyan-300/10 p-2">
            <BrainCircuit className="h-4 w-4 text-cyan-200" />
          </div>
          <div>
            <div className="text-[11px] uppercase tracking-[0.28em] text-cyan-200/70">AI Proposal Analyzer</div>
            <div className="mt-1 text-sm font-medium text-white">{analysis.headline}</div>
          </div>
        </div>
        <Badge variant={analysis.scoreValue >= 7 ? "warning" : analysis.scoreValue >= 4.5 ? "cyan" : "success"}>
          {analysis.scoreLabel}
        </Badge>
      </div>

      <p className="mt-3 text-sm leading-7 text-white/62">{analysis.summary}</p>

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
