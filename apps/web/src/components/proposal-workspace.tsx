"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
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
import { buildServiceHandoffQuery } from "@/lib/service-handoff-state";
import { commandCenterReferences, getProposalById, proposalCards, proposalRegistry, type ProposalCardModel } from "@/lib/site-data";
import { useServiceHandoffSnapshot } from "@/lib/use-service-handoff-snapshot";
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
  const handoff = useServiceHandoffSnapshot("command-center");
  const [selectedId, setSelectedId] = useState("");
  const [voteModalOpen, setVoteModalOpen] = useState(false);
  const { connected } = useWallet();
  const selectedProposalId = useMemo(
    () =>
      getProposalById(selectedId)?.id ??
      getProposalById(requestedProposalId)?.id ??
      getProposalById(handoff?.proposalId)?.id ??
      proposalCards[0]?.id ??
      "",
    [handoff?.proposalId, requestedProposalId, selectedId],
  );

  useEffect(() => {
    if (!handoff?.proposalId) return;
    setSelectedId(handoff.proposalId);
  }, [handoff?.proposalId]);

  const proposal = useMemo(
    () =>
      getProposalById(selectedProposalId) ??
      getProposalById(selectedId) ??
      getProposalById(requestedProposalId) ??
      getProposalById(handoff?.proposalId) ??
      proposalCards[0],
    [handoff?.proposalId, requestedProposalId, selectedId, selectedProposalId],
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
  const hasActiveExecutionContinuity =
    handoff?.proposalId === proposal.id && Boolean(handoff.payoutIntent);
  const continuityQuery = handoff ? buildServiceHandoffQuery(handoff) : "";
  const actionHref =
    proposal.status === "Live voting"
      ? `/govern${continuityQuery ? `?${continuityQuery}` : ""}#commit-vote-action`
      : proposal.status === "Ready to reveal"
        ? `/govern${continuityQuery ? `?${continuityQuery}` : ""}#reveal-vote-action`
        : proposal.status === "Execution ready" || proposal.status === "Executed"
          ? `/govern${continuityQuery ? `?${continuityQuery}` : ""}#execute-proposal-action`
          : `/govern${continuityQuery ? `?${continuityQuery}` : ""}#proposal-review-action`;
  const actionLabel =
    proposal.status === "Live voting"
      ? "Run commit vote live"
      : proposal.status === "Ready to reveal"
        ? "Run reveal live"
        : proposal.status === "Execution ready" || proposal.status === "Executed"
          ? "Open execution action"
          : "Open live review action";

  const actions = actionMap[proposal.status];

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Proposal workspace</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="flex flex-wrap gap-3">
            {proposalRegistry.map((item) => (
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

          {handoff?.proposalReview && handoff.proposalId === proposal.id ? (
            <div className="rounded-3xl border border-cyan-300/16 bg-cyan-300/[0.08] p-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="text-[11px] uppercase tracking-[0.28em] text-cyan-100/78">Review continuity</div>
                  <div className="mt-2 text-base font-medium text-white">The active command-center proposal is carrying staged execution context.</div>
                  <div className="mt-2 text-sm leading-7 text-white/60">
                    Window, treasury boundary, execution target, and proof route are being consumed from the wallet-first handoff instead of forcing the operator to rebuild context manually.
                  </div>
                </div>
                <Link href={handoff.proposalReview.proofHref} className={cn(buttonVariants({ size: "sm", variant: "outline" }))}>
                  {handoff.proposalReview.proofLabel}
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </div>
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                <div className="rounded-2xl border border-white/8 bg-black/20 p-4 text-sm leading-7 text-white/60">
                  <div className="text-[11px] uppercase tracking-[0.22em] text-white/40">Window</div>
                  <div className="mt-2 text-white">{handoff.proposalReview.window}</div>
                </div>
                <div className="rounded-2xl border border-white/8 bg-black/20 p-4 text-sm leading-7 text-white/60">
                  <div className="text-[11px] uppercase tracking-[0.22em] text-white/40">Treasury boundary</div>
                  <div className="mt-2 text-white">{handoff.proposalReview.treasury}</div>
                </div>
                <div className="rounded-2xl border border-white/8 bg-black/20 p-4 text-sm leading-7 text-white/60">
                  <div className="text-[11px] uppercase tracking-[0.22em] text-white/40">Execution target</div>
                  <div className="mt-2 text-white">{handoff.proposalReview.executionTarget}</div>
                </div>
                <div className="rounded-2xl border border-white/8 bg-black/20 p-4 text-sm leading-7 text-white/60">
                  <div className="text-[11px] uppercase tracking-[0.22em] text-white/40">Evidence route</div>
                  <div className="mt-2 text-white">{handoff.proposalReview.evidenceRoute}</div>
                </div>
              </div>
            </div>
          ) : null}

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
              {connected ? (proposal.status === "Executed" ? "Open execution review" : "Open live vote shell") : "Connect wallet to review"}
            </Button>
            <Link href={actionHref} className={cn(buttonVariants({ variant: "secondary" }))}>
              {actionLabel}
            </Link>
            <Link
              href={proposal.status === "Execution ready" || proposal.status === "Executed" ? "/documents/live-proof-v3" : "/documents/reviewer-fast-path"}
              className={cn(buttonVariants({ variant: "outline" }))}
            >
              {proposal.status === "Execution ready" || proposal.status === "Executed" ? "Open curated execution packet" : "Open curated reviewer packet"}
            </Link>
          </div>

          <ExecutionSurfaceInline mode="proposal" snapshot={executionSnapshot} />

          <div className="grid gap-4 xl:grid-cols-2">
            {hasActiveExecutionContinuity && handoff?.payoutIntent ? (
              <>
                <div className="rounded-3xl border border-cyan-300/15 bg-cyan-400/5 p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="text-[11px] uppercase tracking-[0.28em] text-cyan-200/70">Execution continuity</div>
                      <div className="mt-1 text-sm font-medium text-white">{handoff.payoutTitle}</div>
                    </div>
                    <Badge variant="cyan">Continuity active</Badge>
                  </div>
                  <p className="mt-3 text-sm leading-7 text-white/62">
                    The active execution lane is now overriding proposal-derived analyzer copy so the operator sees the exact payload being delivered, not legacy proposal context.
                  </p>
                  <div className="mt-3 grid gap-3 rounded-[24px] border border-cyan-300/12 bg-black/20 p-4 sm:grid-cols-2">
                    <div className="text-sm leading-7 text-white/56">
                      <div className="text-[11px] uppercase tracking-[0.22em] text-cyan-200/60">Recipient / lane</div>
                      <div className="mt-1 break-all text-white/80">
                        {handoff.payoutIntent.recipient ?? handoff.payoutIntent.executionTarget}
                      </div>
                    </div>
                    <div className="text-sm leading-7 text-white/56">
                      <div className="text-[11px] uppercase tracking-[0.22em] text-cyan-200/60">Amount / asset</div>
                      <div className="mt-1 text-white/80">
                        {handoff.requestPayload?.amountDisplay ?? handoff.payoutIntent.amountDisplay}
                      </div>
                    </div>
                    <div className="text-sm leading-7 text-white/56">
                      <div className="text-[11px] uppercase tracking-[0.22em] text-cyan-200/60">Reference</div>
                      <div className="mt-1 text-white/80">
                        {handoff.requestPayload?.reference ?? handoff.payoutIntent.reference}
                      </div>
                    </div>
                    <div className="text-sm leading-7 text-white/56">
                      <div className="text-[11px] uppercase tracking-[0.22em] text-cyan-200/60">Telemetry mode</div>
                      <div className="mt-1 text-white/80">
                        {handoff.requestPayload?.telemetryMode ?? handoff.telemetryMode}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="rounded-3xl border border-emerald-300/15 bg-emerald-400/5 p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="text-[11px] uppercase tracking-[0.28em] text-emerald-200/75">Delivered execution lane</div>
                      <div className="mt-1 text-sm font-medium text-white">Command-center is reading the same treasury request payload</div>
                    </div>
                    <Badge variant={handoff.requestDelivery?.state === "delivered" ? "success" : "cyan"}>
                      {handoff.requestDelivery?.state ?? "draft"}
                    </Badge>
                  </div>
                  <p className="mt-3 text-sm leading-7 text-white/62">
                    This panel stays bound to the delivered request object, treasury route, and telemetry continuity so the active operator context does not drift back to proposal-only heuristics.
                  </p>
                  <div className="mt-3 space-y-2">
                    <div className="text-sm leading-7 text-white/56">
                      {handoff.requestDelivery?.state === "delivered"
                        ? `Delivered into command-center${handoff.requestDelivery.deliveredAt ? ` at ${handoff.requestDelivery.deliveredAt}` : ""}.`
                        : handoff.requestDelivery?.state === "staged"
                          ? "Execution request is staged and waiting for final delivery."
                          : "Execution request remains editable in services."}
                    </div>
                    <div className="text-sm leading-7 text-white/56">
                      Proof route: {handoff.requestPayload?.evidenceRoute ?? handoff.payoutIntent.evidenceRoute}
                    </div>
                    <div className="text-sm leading-7 text-white/56">
                      Execution target: {handoff.requestPayload?.executionTarget ?? handoff.payoutIntent.executionTarget}
                    </div>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-3">
                    <Button onClick={() => setVoteModalOpen(true)}>
                      Open delivered signing shell
                    </Button>
                    <Link
                      href={continuityQuery ? `/network?${continuityQuery}` : "/network"}
                      className={cn(buttonVariants({ variant: "outline" }))}
                    >
                      Open execution network logs
                    </Link>
                  </div>
                </div>
              </>
            ) : (
              <>
                <ProposalAnalyzerInline proposal={proposal} />
                <TreasuryRiskInline proposal={proposal} />
              </>
            )}
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

      <VoteModal proposal={voteModalOpen ? proposal : null} handoff={handoff?.proposalId === proposal.id ? handoff : null} onClose={() => setVoteModalOpen(false)} />
    </>
  );
}
