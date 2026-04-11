"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useWallet } from "@solana/wallet-adapter-react";
import { ArrowUpRight, CheckCircle2, Clock3, LockKeyhole, WalletMinimal } from "lucide-react";

import { ProposalConfidencePanel } from "@/components/proposal-confidence-panel";
import { ProposalAnalyzerInline } from "@/components/proposal-analyzer-inline";
import { TreasuryRiskInline } from "@/components/treasury-risk-inline";
import { ExecutionSurfaceInline } from "@/components/execution-surface-inline";
import { VoteModal } from "@/components/vote-modal";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buildProposalConfidenceScorecard } from "@/lib/confidence-engine";
import type { ExecutionSurfaceSnapshot } from "@/lib/devnet-service-metrics";
import { commandCenterReferences, getProposalById, proposalCards, type ProposalCardModel } from "@/lib/site-data";
import { cn } from "@/lib/utils";

const actionMap: Record<ProposalCardModel["status"], { commit: string; reveal: string; execute: string }> = {
  "Live voting": {
    commit: "Ready to commit",
    reveal: "Reveal opens after commit window closes",
    execute: "Execution blocked until vote and evidence path complete",
  },
  "Ready to reveal": {
    commit: "Commit phase complete",
    reveal: "Reveal can proceed",
    execute: "Execution blocked until reveal and finalize complete",
  },
  Timelocked: {
    commit: "Voting complete",
    reveal: "Reveal complete",
    execute: "Timelock still active",
  },
  "Execution ready": {
    commit: "Voting complete",
    reveal: "Reveal complete",
    execute: "Treasury path is ready",
  },
  "Evidence gated": {
    commit: "Voting complete",
    reveal: "Reveal complete",
    execute: "Settlement evidence still required",
  },
  Executed: {
    commit: "Commit trail already recorded on devnet",
    reveal: "Reveal trail already recorded on devnet",
    execute: "Treasury motion already executed on devnet",
  },
};

type ProposalWorkspaceProps = {
  executionSnapshot: ExecutionSurfaceSnapshot;
};

export function ProposalWorkspace({ executionSnapshot }: ProposalWorkspaceProps) {
  const searchParams = useSearchParams();
  const requestedProposalId = searchParams.get("proposal");
  const [selectedId, setSelectedId] = useState(() => getProposalById(requestedProposalId)?.id ?? proposalCards[0]?.id ?? "");
  const [voteModalOpen, setVoteModalOpen] = useState(false);
  const { connected } = useWallet();

  const proposal = useMemo(
    () => getProposalById(selectedId) ?? getProposalById(requestedProposalId) ?? proposalCards[0],
    [requestedProposalId, selectedId],
  );
  const scorecard = useMemo(
    () =>
      buildProposalConfidenceScorecard({
        title: proposal.title,
        type: proposal.type,
        status: proposal.status,
        privacy: proposal.privacy,
        tech: proposal.tech,
        summary: proposal.summary,
      }),
    [proposal],
  );

  const actions = actionMap[proposal.status];

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Proposal workspace</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="flex flex-wrap gap-3">
            {proposalCards.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setSelectedId(item.id)}
                className={`rounded-full border px-4 py-2 text-sm transition ${
                  item.id === proposal.id
                    ? "border-cyan-300/35 bg-cyan-300/12 text-cyan-100"
                    : "border-white/10 bg-white/4 text-white/65 hover:bg-white/6 hover:text-white"
                }`}
              >
                {item.id}
              </button>
            ))}
          </div>

          <div className="rounded-3xl border border-white/8 bg-white/4 p-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="text-[11px] uppercase tracking-[0.28em] text-white/40">{proposal.type}</div>
                <div className="mt-2 text-xl font-medium text-white">{proposal.title}</div>
                <p className="mt-3 max-w-3xl text-sm leading-7 text-white/58">{proposal.summary}</p>
              </div>
              <Badge variant={proposal.status === "Execution ready" || proposal.status === "Executed" ? "success" : proposal.status === "Evidence gated" ? "warning" : "cyan"}>
                {proposal.status}
              </Badge>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-3xl border border-white/8 bg-black/20 p-4">
              <div className="flex items-center gap-3">
                <WalletMinimal className="h-4 w-4 text-cyan-300" />
                <div className="text-sm font-medium text-white">Commit</div>
              </div>
              <div className="mt-3 text-sm leading-7 text-white/58">{actions.commit}</div>
            </div>
            <div className="rounded-3xl border border-white/8 bg-black/20 p-4">
              <div className="flex items-center gap-3">
                <LockKeyhole className="h-4 w-4 text-fuchsia-300" />
                <div className="text-sm font-medium text-white">Reveal</div>
              </div>
              <div className="mt-3 text-sm leading-7 text-white/58">{actions.reveal}</div>
            </div>
            <div className="rounded-3xl border border-white/8 bg-black/20 p-4">
              <div className="flex items-center gap-3">
                {proposal.status === "Execution ready" || proposal.status === "Executed" ? <CheckCircle2 className="h-4 w-4 text-emerald-300" /> : <Clock3 className="h-4 w-4 text-white/60" />}
                <div className="text-sm font-medium text-white">Execute treasury</div>
              </div>
              <div className="mt-3 text-sm leading-7 text-white/58">{actions.execute}</div>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button onClick={() => setVoteModalOpen(true)}>
              {connected ? (proposal.status === "Executed" ? "Open execution review" : "Open vote modal") : "Connect wallet to review"}
            </Button>
            <Button variant="secondary" disabled={!connected || proposal.status === "Live voting" || proposal.status === "Executed"}>
              {proposal.status === "Executed" ? "Reveal complete" : "Review reveal state"}
            </Button>
            <Link
              href={proposal.status === "Execution ready" || proposal.status === "Executed" ? "/documents/live-proof-v3" : "/documents/reviewer-fast-path"}
              className={cn(buttonVariants({ variant: "outline" }))}
            >
              {proposal.status === "Execution ready" || proposal.status === "Executed" ? "Open curated execution packet" : "Open curated reviewer packet"}
            </Link>
          </div>

          <ExecutionSurfaceInline mode="proposal" snapshot={executionSnapshot} />

          <div className="grid gap-4 xl:grid-cols-2">
            <ProposalAnalyzerInline proposal={proposal} />
            <TreasuryRiskInline proposal={proposal} />
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            {commandCenterReferences.map((reference) => {
              const isInternal = reference.href.startsWith("/");
              const content = (
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-sm font-medium text-white">{reference.title}</div>
                    <div className="mt-2 text-sm leading-7 text-white/56">{reference.description}</div>
                  </div>
                  <ArrowUpRight className="mt-1 h-4 w-4 text-cyan-300 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </div>
              );

              if (isInternal) {
                return (
                  <Link
                    key={reference.title}
                    href={reference.href}
                    className="group rounded-3xl border border-white/8 bg-white/4 p-4 transition hover:border-cyan-300/30 hover:bg-white/6"
                  >
                    {content}
                  </Link>
                );
              }

              return (
                <a
                key={reference.title}
                href={reference.href}
                rel="noreferrer"
                target="_blank"
                className="group rounded-3xl border border-white/8 bg-white/4 p-4 transition hover:border-cyan-300/30 hover:bg-white/6"
              >
                  {content}
                </a>
              );
            })}
          </div>

          <ProposalConfidencePanel scorecard={scorecard} />
        </CardContent>
      </Card>

      <VoteModal proposal={voteModalOpen ? proposal : null} onClose={() => setVoteModalOpen(false)} />
    </>
  );
}
