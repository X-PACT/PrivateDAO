import Link from "next/link";
import { ArrowUpRight, Binary, Layers3, ShieldCheck, Sparkles } from "lucide-react";

import {
  confidenceDimensions,
  confidenceEnginePrinciples,
  confidenceProfiles,
} from "@/lib/confidence-engine";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const dimensionIcons = [Sparkles, ShieldCheck, Layers3, Binary];

export function ConfidenceEngineSurface() {
  return (
    <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
      <Card>
        <CardHeader>
          <CardTitle>Cryptographic confidence engine</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-3xl border border-white/8 bg-white/4 p-5 text-sm leading-7 text-white/60">
            PrivateDAO now exposes a deterministic scoring model for proposal patterns that use ZK, REFHE, MagicBlock,
            and Fast RPC together. It does not pretend to be a formal proof of security. It is a truth-aligned
            explanation layer for why one governance path is stronger, more private, or more reviewer-complete than
            another.
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {confidenceDimensions.map((dimension, index) => {
              const Icon = dimensionIcons[index] ?? ShieldCheck;
              return (
                <div key={dimension.title} className="rounded-3xl border border-white/8 bg-black/20 p-5">
                  <div className="flex items-center gap-3">
                    <div className="rounded-2xl border border-white/8 bg-black/30 p-3 text-cyan-200">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-white">{dimension.title}</div>
                      <div className="text-[11px] uppercase tracking-[0.28em] text-cyan-300/75">
                        Weight {dimension.weight}%
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 space-y-2 text-sm leading-7 text-white/56">
                    {dimension.factors.map((factor) => (
                      <div key={factor}>• {factor}</div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="rounded-3xl border border-white/8 bg-black/20 p-5">
            <div className="text-[11px] uppercase tracking-[0.28em] text-fuchsia-300/75">Principles</div>
            <div className="mt-3 space-y-2 text-sm leading-7 text-white/58">
              {confidenceEnginePrinciples.map((principle) => (
                <div key={principle}>• {principle}</div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Scenario scorecards</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            {confidenceProfiles.map((profile) => (
              <div key={profile.title} className="rounded-3xl border border-white/8 bg-white/4 p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-base font-medium text-white">{profile.title}</div>
                    <div className="mt-1 text-sm text-white/45">{profile.subtitle}</div>
                  </div>
                  <div className="rounded-2xl border border-emerald-300/20 bg-emerald-400/10 px-3 py-2 text-right">
                    <div className="text-lg font-semibold text-white">{profile.total}</div>
                    <div className="text-[11px] uppercase tracking-[0.24em] text-emerald-300/80">{profile.band}</div>
                  </div>
                </div>
                <p className="mt-3 text-sm leading-7 text-white/58">{profile.explanation}</p>
                <div className="mt-4 space-y-3">
                  {profile.dimensions.map((dimension) => (
                    <div key={dimension.title}>
                      <div className="flex items-center justify-between gap-4 text-sm">
                        <span className="text-white/72">{dimension.title}</span>
                        <span className="text-white">{dimension.score}</span>
                      </div>
                      <div className="mt-2 h-2 rounded-full bg-white/8">
                        <div
                          className="h-2 rounded-full bg-[linear-gradient(90deg,rgba(121,40,202,0.9),rgba(0,212,255,0.9),rgba(78,242,176,0.9))]"
                          style={{ width: `${dimension.score}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  <div className="rounded-2xl border border-white/8 bg-black/20 p-4 text-sm leading-7 text-white/56">
                    <span className="text-white/78">Strongest signals:</span> {profile.strongestSignals.join(", ")}
                  </div>
                  <div className="rounded-2xl border border-white/8 bg-black/20 p-4 text-sm leading-7 text-white/56">
                    <span className="text-white/78">Still missing:</span> {profile.missingSignals.join(", ")}
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Link
          href="/documents/cryptographic-confidence-engine"
          className="group block rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(12,16,30,0.92),rgba(8,10,22,0.96))] p-6 shadow-[0_20px_80px_rgba(0,0,0,0.28)] transition hover:border-cyan-300/25 hover:bg-white/6"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-base font-medium text-white">Open the canonical engine spec</div>
              <p className="mt-3 text-sm leading-7 text-white/58">
                Formula, weights, factor-by-factor meaning, and explicit non-claims for the PrivateDAO cryptographic
                confidence engine.
              </p>
            </div>
            <ArrowUpRight className="mt-1 h-4 w-4 text-cyan-300 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </div>
        </Link>
      </div>
    </div>
  );
}
