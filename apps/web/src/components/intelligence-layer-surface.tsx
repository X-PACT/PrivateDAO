"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, BrainCircuit, Coins, Gamepad2, Network, ScrollText, ShieldAlert } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  analyzeGamingGovernance,
  analyzeProposalRisk,
  analyzeRpcHealth,
  analyzeTreasuryRisk,
  intelligenceFeatures,
  summarizeVotingDiscussion,
  type IntelligenceFeatureId,
} from "@/lib/operational-intelligence";
import { cn } from "@/lib/utils";

const featureIcons = {
  "proposal-analyzer": ShieldAlert,
  "treasury-risk-ai": Coins,
  "voting-summary": ScrollText,
  "rpc-analyzer": Network,
  "gaming-ai": Gamepad2,
} satisfies Record<IntelligenceFeatureId, typeof ShieldAlert>;

export function IntelligenceLayerSurface() {
  const [activeFeature, setActiveFeature] = useState<IntelligenceFeatureId>("proposal-analyzer");
  const [proposalTitle, setProposalTitle] = useState("Treasury payout for pilot operator cohort");
  const [proposalSummary, setProposalSummary] = useState(
    "Send 420 SOL to a new operator wallet to fund a pilot launch before the next review window.",
  );
  const [proposalAmount, setProposalAmount] = useState("420");
  const [proposalRecipient, setProposalRecipient] = useState("PilotOpsWalletxxxxxxxxxxxxxxxxxxxxxxxxxxxx");
  const [proposalMint, setProposalMint] = useState("SOL");
  const [proposalTimelock, setProposalTimelock] = useState("8");
  const [proposalHistory, setProposalHistory] = useState("0");

  const [treasuryAmount, setTreasuryAmount] = useState("280");
  const [treasuryNormalAmount, setTreasuryNormalAmount] = useState("70");
  const [treasuryAttempts, setTreasuryAttempts] = useState("2");
  const [treasuryNewRecipient, setTreasuryNewRecipient] = useState("yes");
  const [treasuryDelay, setTreasuryDelay] = useState("12");

  const [discussion, setDiscussion] = useState(
    "Support the proposal because the operator team is ready. Main concern is treasury exposure and whether the recipient has been verified. We should keep proof and timelock visible before execute.",
  );

  const [rpcLatency, setRpcLatency] = useState("185");
  const [rpcSuccessRate, setRpcSuccessRate] = useState("99.2");
  const [rpcErrorRate, setRpcErrorRate] = useState("0.8");
  const [rpcRetryPressure, setRpcRetryPressure] = useState("6");

  const [gamingProposal, setGamingProposal] = useState(
    "Launch a weekend tournament and increase clan reward payouts for the top three guilds.",
  );
  const [gamingRewardChange, setGamingRewardChange] = useState("12");
  const [gamingPayoutCount, setGamingPayoutCount] = useState("36");
  const [gamingClanCount, setGamingClanCount] = useState("8");

  const proposalAnalysis = useMemo(
    () =>
      analyzeProposalRisk({
        title: proposalTitle,
        summary: proposalSummary,
        amount: Number(proposalAmount) || 0,
        recipient: proposalRecipient,
        mint: proposalMint,
        timelockHours: Number(proposalTimelock) || 0,
        historicalUseCount: Number(proposalHistory) || 0,
      }),
    [proposalTitle, proposalSummary, proposalAmount, proposalRecipient, proposalMint, proposalTimelock, proposalHistory],
  );

  const treasuryAnalysis = useMemo(
    () =>
      analyzeTreasuryRisk({
        amount: Number(treasuryAmount) || 0,
        normalAmount: Number(treasuryNormalAmount) || 0,
        repeatedAttempts: Number(treasuryAttempts) || 0,
        newRecipient: treasuryNewRecipient === "yes",
        executionDelayHours: Number(treasuryDelay) || 0,
      }),
    [treasuryAmount, treasuryNormalAmount, treasuryAttempts, treasuryNewRecipient, treasuryDelay],
  );

  const votingAnalysis = useMemo(() => summarizeVotingDiscussion({ discussion }), [discussion]);

  const rpcAnalysis = useMemo(
    () =>
      analyzeRpcHealth({
        latencyMs: Number(rpcLatency) || 0,
        successRatePct: Number(rpcSuccessRate) || 0,
        errorRatePct: Number(rpcErrorRate) || 0,
        retryPressurePct: Number(rpcRetryPressure) || 0,
      }),
    [rpcLatency, rpcSuccessRate, rpcErrorRate, rpcRetryPressure],
  );

  const gamingAnalysis = useMemo(
    () =>
      analyzeGamingGovernance({
        proposal: gamingProposal,
        rewardChangePct: Number(gamingRewardChange) || 0,
        payoutCount: Number(gamingPayoutCount) || 0,
        clanCount: Number(gamingClanCount) || 0,
      }),
    [gamingProposal, gamingRewardChange, gamingPayoutCount, gamingClanCount],
  );

  const currentAnalysis =
    activeFeature === "proposal-analyzer"
      ? proposalAnalysis
      : activeFeature === "treasury-risk-ai"
        ? treasuryAnalysis
        : activeFeature === "voting-summary"
          ? votingAnalysis
          : activeFeature === "rpc-analyzer"
            ? rpcAnalysis
            : gamingAnalysis;

  return (
    <div className="space-y-6">
      <Card className="border-white/10 bg-[linear-gradient(180deg,rgba(10,16,32,0.94),rgba(7,11,23,0.98))]">
        <CardHeader className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-cyan-300/20 bg-cyan-300/10 text-cyan-100">
              <BrainCircuit className="h-5 w-5" />
            </div>
            <CardTitle>Security + Intelligence layer</CardTitle>
          </div>
          <p className="max-w-3xl text-sm leading-7 text-white/62">
            This is where AI belongs in PrivateDAO: proposal review, treasury execution review, voting compression, RPC interpretation, and gaming-governance assistance. It is decision support, not a shallow chatbot.
          </p>
          <div className="flex flex-wrap gap-3">
            <Badge variant="cyan">Operational intelligence</Badge>
            <Badge variant="success">User-facing analysis</Badge>
            <Badge variant="warning">Hugging Face free-ready path</Badge>
          </div>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>How to use this route</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3 text-sm leading-7 text-white/60">
          <div className="rounded-2xl border border-white/8 bg-white/[0.04] p-4">
            Open it before signing when you want a plain-language explanation of proposal or treasury risk.
          </div>
          <div className="rounded-2xl border border-white/8 bg-white/[0.04] p-4">
            Use the RPC analyzer when the product feels slow and you want the data path explained without digging through logs first.
          </div>
          <div className="rounded-2xl border border-white/8 bg-white/[0.04] p-4">
            Use the gaming path when governance and reward decisions need to stay fair, fast, and understandable to non-experts.
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {intelligenceFeatures.map((feature) => {
          const Icon = featureIcons[feature.id];
          const active = activeFeature === feature.id;
          return (
            <button
              key={feature.id}
              type="button"
              onClick={() => setActiveFeature(feature.id)}
              className={cn(
                "rounded-3xl border p-5 text-left transition",
                active
                  ? "border-cyan-300/24 bg-cyan-300/[0.09] text-white"
                  : "border-white/10 bg-white/[0.03] text-white/68 hover:border-white/16 hover:bg-white/[0.05]",
              )}
            >
              <div className="flex items-center justify-between gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-black/20 text-cyan-100">
                  <Icon className="h-5 w-5" />
                </div>
                <div className="text-xs font-medium tracking-[0.24em] text-cyan-100/72">{feature.posture}</div>
              </div>
              <div className="mt-4 text-base font-medium text-white">{feature.title}</div>
              <p className="mt-3 text-sm leading-7 text-white/58">{feature.summary}</p>
            </button>
          );
        })}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <Card id={activeFeature} className="border-white/10 bg-white/[0.03]">
          <CardHeader>
            <CardTitle>
              {intelligenceFeatures.find((feature) => feature.id === activeFeature)?.title}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            {activeFeature === "proposal-analyzer" ? (
              <>
                <div className="grid gap-4 md:grid-cols-2">
                  <label className="space-y-2 text-sm text-white/70">
                    <div>Proposal title</div>
                    <input value={proposalTitle} onChange={(event) => setProposalTitle(event.target.value)} className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none" />
                  </label>
                  <label className="space-y-2 text-sm text-white/70">
                    <div>Recipient</div>
                    <input value={proposalRecipient} onChange={(event) => setProposalRecipient(event.target.value)} className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none" />
                  </label>
                </div>
                <label className="space-y-2 text-sm text-white/70">
                  <div>Proposal summary</div>
                  <textarea value={proposalSummary} onChange={(event) => setProposalSummary(event.target.value)} rows={5} className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none" />
                </label>
                <div className="grid gap-4 md:grid-cols-4">
                  <label className="space-y-2 text-sm text-white/70">
                    <div>Amount</div>
                    <input value={proposalAmount} onChange={(event) => setProposalAmount(event.target.value)} className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none" />
                  </label>
                  <label className="space-y-2 text-sm text-white/70">
                    <div>Mint</div>
                    <input value={proposalMint} onChange={(event) => setProposalMint(event.target.value)} className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none" />
                  </label>
                  <label className="space-y-2 text-sm text-white/70">
                    <div>Timelock hours</div>
                    <input value={proposalTimelock} onChange={(event) => setProposalTimelock(event.target.value)} className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none" />
                  </label>
                  <label className="space-y-2 text-sm text-white/70">
                    <div>Recipient history count</div>
                    <input value={proposalHistory} onChange={(event) => setProposalHistory(event.target.value)} className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none" />
                  </label>
                </div>
              </>
            ) : null}

            {activeFeature === "treasury-risk-ai" ? (
              <div className="grid gap-4 md:grid-cols-2">
                <label className="space-y-2 text-sm text-white/70">
                  <div>Payout amount</div>
                  <input value={treasuryAmount} onChange={(event) => setTreasuryAmount(event.target.value)} className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none" />
                </label>
                <label className="space-y-2 text-sm text-white/70">
                  <div>Normal treasury motion</div>
                  <input value={treasuryNormalAmount} onChange={(event) => setTreasuryNormalAmount(event.target.value)} className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none" />
                </label>
                <label className="space-y-2 text-sm text-white/70">
                  <div>Repeated attempts</div>
                  <input value={treasuryAttempts} onChange={(event) => setTreasuryAttempts(event.target.value)} className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none" />
                </label>
                <label className="space-y-2 text-sm text-white/70">
                  <div>Execution delay hours</div>
                  <input value={treasuryDelay} onChange={(event) => setTreasuryDelay(event.target.value)} className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none" />
                </label>
                <label className="space-y-2 text-sm text-white/70 md:col-span-2">
                  <div>Is this a new recipient?</div>
                  <select value={treasuryNewRecipient} onChange={(event) => setTreasuryNewRecipient(event.target.value)} className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none">
                    <option value="yes">Yes</option>
                    <option value="no">No</option>
                  </select>
                </label>
              </div>
            ) : null}

            {activeFeature === "voting-summary" ? (
              <label className="space-y-2 text-sm text-white/70">
                <div>Discussion thread</div>
                <textarea value={discussion} onChange={(event) => setDiscussion(event.target.value)} rows={10} className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none" />
              </label>
            ) : null}

            {activeFeature === "rpc-analyzer" ? (
              <div className="grid gap-4 md:grid-cols-2">
                <label className="space-y-2 text-sm text-white/70">
                  <div>Latency ms</div>
                  <input value={rpcLatency} onChange={(event) => setRpcLatency(event.target.value)} className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none" />
                </label>
                <label className="space-y-2 text-sm text-white/70">
                  <div>Success rate %</div>
                  <input value={rpcSuccessRate} onChange={(event) => setRpcSuccessRate(event.target.value)} className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none" />
                </label>
                <label className="space-y-2 text-sm text-white/70">
                  <div>Error rate %</div>
                  <input value={rpcErrorRate} onChange={(event) => setRpcErrorRate(event.target.value)} className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none" />
                </label>
                <label className="space-y-2 text-sm text-white/70">
                  <div>Retry pressure %</div>
                  <input value={rpcRetryPressure} onChange={(event) => setRpcRetryPressure(event.target.value)} className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none" />
                </label>
              </div>
            ) : null}

            {activeFeature === "gaming-ai" ? (
              <>
                <label className="space-y-2 text-sm text-white/70">
                  <div>Game governance proposal</div>
                  <textarea value={gamingProposal} onChange={(event) => setGamingProposal(event.target.value)} rows={6} className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none" />
                </label>
                <div className="grid gap-4 md:grid-cols-3">
                  <label className="space-y-2 text-sm text-white/70">
                    <div>Reward change %</div>
                    <input value={gamingRewardChange} onChange={(event) => setGamingRewardChange(event.target.value)} className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none" />
                  </label>
                  <label className="space-y-2 text-sm text-white/70">
                    <div>Payout count</div>
                    <input value={gamingPayoutCount} onChange={(event) => setGamingPayoutCount(event.target.value)} className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none" />
                  </label>
                  <label className="space-y-2 text-sm text-white/70">
                    <div>Clan count</div>
                    <input value={gamingClanCount} onChange={(event) => setGamingClanCount(event.target.value)} className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none" />
                  </label>
                </div>
              </>
            ) : null}
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-[#07101d]/88">
          <CardHeader>
            <div className="flex items-center justify-between gap-4">
              <CardTitle>{currentAnalysis.headline}</CardTitle>
              <Badge variant={currentAnalysis.scoreValue >= 8 ? "success" : currentAnalysis.scoreValue >= 6 ? "warning" : "violet"}>
                {currentAnalysis.scoreLabel}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-5 text-sm leading-7 text-white/62">
            <div className="rounded-3xl border border-cyan-300/16 bg-cyan-300/[0.08] p-5">
              <div className="text-[11px] uppercase tracking-[0.28em] text-cyan-100/72">Intelligence output</div>
              <p className="mt-3 text-base text-white">{currentAnalysis.summary}</p>
            </div>

            <div className="rounded-3xl border border-emerald-300/16 bg-emerald-300/[0.08] p-5 text-sm leading-7 text-white/70">
              The point of this output is not to replace human judgment. It is to compress hard governance, treasury, RPC, and gaming context into something a signer can actually understand before acting.
            </div>

            <div className="grid gap-3">
              {currentAnalysis.bullets.map((bullet) => (
                <div key={bullet} className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
                  {bullet}
                </div>
              ))}
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/4 p-5">
              <div className="text-[11px] uppercase tracking-[0.28em] text-emerald-200/72">Hugging Face free posture</div>
              <p className="mt-3">
                This layer is built to help users now with browser-side intelligence and clear governance heuristics. If you later want a free open-model path, the same UX can be connected to a Hugging Face-hosted summarization or classification adapter without changing the product surface.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link href="/security" className={cn(buttonVariants({ size: "sm" }))}>
                Open security route
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/assistant" className={cn(buttonVariants({ size: "sm", variant: "secondary" }))}>
                Open assistant
              </Link>
              <Link href="/security" className={cn(buttonVariants({ size: "sm", variant: "outline" }))}>
                Privacy route
              </Link>
              <Link href="/services" className={cn(buttonVariants({ size: "sm", variant: "outline" }))}>
                RPC route
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
