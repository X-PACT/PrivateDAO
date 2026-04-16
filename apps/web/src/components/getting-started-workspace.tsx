"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Wallet } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ExecutionSurfaceSnapshot } from "@/lib/devnet-service-metrics";
import { buyerJourneySteps, gettingStartedActions, walletChoices } from "@/lib/site-data";
import { cn } from "@/lib/utils";

type GettingStartedWorkspaceProps = {
  executionSnapshot: ExecutionSurfaceSnapshot;
};

export function GettingStartedWorkspace({ executionSnapshot }: GettingStartedWorkspaceProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const firstSessionSummary = {
    daoCount: executionSnapshot.proposalFlow.value,
    walletCoverage: executionSnapshot.walletReadiness.value,
    proofFreshness: executionSnapshot.proofFreshness.value,
  };

  return (
    <div className="space-y-6">
      <Card className="border-white/10 bg-[linear-gradient(135deg,rgba(20,241,149,0.09),rgba(153,69,255,0.11),rgba(0,194,255,0.08))]">
        <CardContent className="grid gap-8 p-6 lg:grid-cols-[1.1fr_0.9fr] lg:p-8">
          <div className="space-y-5">
            <Badge variant="success">Built for a normal user first run</Badge>
            <div className="space-y-3">
              <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                Connect a wallet, create a DAO, submit a proposal, vote, and execute from one guided path.
              </h2>
              <p className="max-w-2xl text-base leading-8 text-white/62 sm:text-lg">
                This route keeps the first run narrow: connect a Devnet wallet, open govern, and use live state after each real wallet action lands. The goal is not to read about PrivateDAO only, but to experience its privacy, cryptography, and speed yourself in one product path.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link className={buttonVariants({ size: "lg" })} href="/govern">
                Open the governance flow
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link className={buttonVariants({ size: "lg", variant: "secondary" })} href="/live">
                See live state and logs
              </Link>
              <Link className={buttonVariants({ size: "lg", variant: "outline" })} href="/story">
                Watch the product story
              </Link>
            </div>
          </div>

          <div className="grid gap-4">
            {gettingStartedActions.slice(0, 3).map((action, index) => (
              <Link
                key={action.title}
                href={action.href}
                className="rounded-[26px] border border-white/10 bg-black/20 p-5 transition hover:border-cyan-300/25 hover:bg-white/[0.05]"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-sm font-semibold text-cyan-100">
                    0{index + 1}
                  </div>
                  <div className="text-base font-medium text-white">{action.title}</div>
                </div>
                <p className="mt-3 text-sm leading-7 text-white/58">{action.detail}</p>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="border-white/10 bg-white/[0.03]">
        <CardContent className="space-y-4 p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="text-base font-medium text-white">Need wallet guidance or session detail?</div>
              <p className="mt-2 text-sm leading-7 text-white/58">
                Keep the first run simple by going straight to <strong className="text-white">Govern</strong>. Open the details below only if you need wallet recommendations or a preview of the live session data.
              </p>
            </div>
            <button
              type="button"
              className={cn(buttonVariants({ size: "sm", variant: "outline" }), "shrink-0")}
              onClick={() => setShowAdvanced((current) => !current)}
            >
              {showAdvanced ? "Hide details" : "Show wallet and session detail"}
            </button>
          </div>

          {showAdvanced ? (
            <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
              <Card>
                <CardHeader>
                  <CardTitle>Recommended wallet path</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {walletChoices.map((wallet) => (
                    <div key={wallet.name} className="rounded-[24px] border border-white/8 bg-white/[0.04] p-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-black/20 text-cyan-100">
                          <Wallet className="h-4 w-4" />
                        </div>
                        <div className="text-base font-medium text-white">{wallet.name}</div>
                      </div>
                      <p className="mt-3 text-sm leading-7 text-white/58">{wallet.fit}</p>
                    </div>
                  ))}
                  <div className="rounded-[24px] border border-emerald-300/18 bg-emerald-300/8 p-4 text-sm leading-7 text-white/68">
                    Connect Wallet stays in the top-right shell position and auto-reconnects when possible, so users can return to real Devnet testing instead of redoing wallet setup every visit.
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>What the first successful session looks like</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {buyerJourneySteps.slice(0, 3).map((step) => (
                    <div key={step.title} className="rounded-[26px] border border-white/8 bg-white/[0.04] p-5">
                      <div className="flex items-center gap-3">
                        <CheckCircle2 className="h-4 w-4 text-emerald-300" />
                        <div className="text-base font-medium text-white">{step.title}</div>
                      </div>
                      <p className="mt-3 text-sm leading-7 text-white/58">{step.description}</p>
                      <div className="mt-4 rounded-2xl border border-white/8 bg-black/20 px-4 py-3 text-sm text-white/68">
                        {step.outcome}
                      </div>
                    </div>
                  ))}
                  <div className="rounded-[26px] border border-cyan-300/16 bg-cyan-300/[0.08] p-5 text-sm leading-7 text-white/68">
                    The product already tracks live governance health in the background so a connected visitor can confirm the runtime result directly:
                    <div className="mt-3 grid gap-3 sm:grid-cols-3">
                      <div className="rounded-2xl border border-white/8 bg-black/20 px-4 py-3">
                        <div className="text-[11px] uppercase tracking-[0.18em] text-white/40">Proposal flow</div>
                        <div className="mt-2 text-white">{firstSessionSummary.daoCount}</div>
                      </div>
                      <div className="rounded-2xl border border-white/8 bg-black/20 px-4 py-3">
                        <div className="text-[11px] uppercase tracking-[0.18em] text-white/40">Wallet readiness</div>
                        <div className="mt-2 text-white">{firstSessionSummary.walletCoverage}</div>
                      </div>
                      <div className="rounded-2xl border border-white/8 bg-black/20 px-4 py-3">
                        <div className="text-[11px] uppercase tracking-[0.18em] text-white/40">Proof freshness</div>
                        <div className="mt-2 text-white">{firstSessionSummary.proofFreshness}</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : null}
        </CardContent>
      </Card>

      <div className="flex flex-wrap gap-3">
        <Link className={cn(buttonVariants({ size: "lg" }))} href="/govern">
          Continue to govern
        </Link>
        <Link className={cn(buttonVariants({ size: "lg", variant: "secondary" }))} href="/live">
          Open live state
        </Link>
        <Link className={cn(buttonVariants({ size: "lg", variant: "outline" }))} href="/trust">
          Open trust only if needed
        </Link>
      </div>
    </div>
  );
}
