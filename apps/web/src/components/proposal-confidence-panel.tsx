import { Binary, ShieldCheck } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ConfidenceScorecard } from "@/lib/confidence-engine";

type ProposalConfidencePanelProps = {
  scorecard: ConfidenceScorecard;
};

export function ProposalConfidencePanel({ scorecard }: ProposalConfidencePanelProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-4">
          <div>
            <CardTitle>Proposal confidence engine</CardTitle>
            <div className="mt-2 text-sm text-white/50">{scorecard.subtitle}</div>
          </div>
          <div className="rounded-2xl border border-emerald-300/20 bg-emerald-400/10 px-4 py-3 text-right">
            <div className="text-2xl font-semibold text-white">{scorecard.total}</div>
            <div className="text-[11px] uppercase tracking-[0.28em] text-emerald-300/80">{scorecard.band}</div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        <p className="text-sm leading-7 text-white/58">{scorecard.explanation}</p>

        <div className="grid gap-4 md:grid-cols-2">
          {scorecard.dimensions.map((dimension) => (
            <div key={dimension.title} className="rounded-3xl border border-white/8 bg-white/4 p-4">
              <div className="flex items-center justify-between gap-4">
                <div className="text-sm font-medium text-white">{dimension.title}</div>
                <div className="text-sm text-white">{dimension.score}</div>
              </div>
              <div className="mt-3 h-2 rounded-full bg-white/8">
                <div
                  className="h-2 rounded-full bg-[linear-gradient(90deg,rgba(121,40,202,0.9),rgba(0,212,255,0.9),rgba(78,242,176,0.9))]"
                  style={{ width: `${dimension.score}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-3xl border border-white/8 bg-black/20 p-5">
            <div className="flex items-center gap-3">
              <ShieldCheck className="h-4 w-4 text-emerald-300" />
              <div className="text-sm font-medium text-white">Strongest signals</div>
            </div>
            <div className="mt-3 space-y-2 text-sm leading-7 text-white/58">
              {scorecard.strongestSignals.map((signal) => (
                <div key={signal}>• {signal}</div>
              ))}
            </div>
          </div>
          <div className="rounded-3xl border border-white/8 bg-black/20 p-5">
            <div className="flex items-center gap-3">
              <Binary className="h-4 w-4 text-cyan-300" />
              <div className="text-sm font-medium text-white">Recommendations</div>
            </div>
            <div className="mt-3 space-y-2 text-sm leading-7 text-white/58">
              {scorecard.recommendations.map((recommendation) => (
                <div key={recommendation}>• {recommendation}</div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
