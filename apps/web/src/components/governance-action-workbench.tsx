"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useWallet } from "@solana/wallet-adapter-react";
import { Activity, ArrowUpRight, CheckCircle2, ChevronRight, FilePlus2, Flag, FolderPlus, ListChecks, Play, ShieldCheck, Vote, Wallet } from "lucide-react";

import { ActionReviewModal } from "@/components/action-review-modal";
import { useGovernanceSession } from "@/components/governance-session";
import { OnchainParityPanel } from "@/components/onchain-parity-panel";
import { WalletConnectButton } from "@/components/wallet-connect-button";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buildPreparedActionSummary } from "@/lib/onchain-parity";
import type { CoreGovernanceInstructionName } from "@/lib/onchain-parity.generated";
import { getProposalById, type ProposalCardModel } from "@/lib/site-data";
import { useServiceHandoffSnapshot } from "@/lib/use-service-handoff-snapshot";
import { cn } from "@/lib/utils";

const voteChoices = ["Approve", "Reject", "Abstain"] as const;

function resolveStagedReviewAction(proposal: ProposalCardModel | null): CoreGovernanceInstructionName {
  if (!proposal) return "commit_vote";

  if (proposal.status === "Ready to reveal") {
    return "reveal_vote";
  }

  if (proposal.status === "Live voting") {
    return "commit_vote";
  }

  return "execute_proposal";
}

export function GovernanceActionWorkbench() {
  const [reviewAction, setReviewAction] = useState<CoreGovernanceInstructionName | null>(null);
  const { connected, wallet } = useWallet();
  const {
    daoName,
    daoCreated,
    proposalTitle,
    executionIntent,
    proposalCreated,
    voteChoice,
    voteCommitted,
    voteRevealed,
    proposalFinalized,
    proposalExecuted,
    logs,
    setDaoName,
    setProposalTitle,
    setVoteChoice,
    stageReviewContext,
    stageExecutionIntent,
    createDao,
    createProposal,
    commitVote,
    revealVote,
    finalizeProposal,
    executeProposal,
    resetSession,
  } = useGovernanceSession();

  const canCreateDao = connected && !daoCreated && daoName.trim().length >= 3;
  const canCreateProposal = daoCreated && !proposalCreated && proposalTitle.trim().length >= 6;
  const canCommit = proposalCreated && !voteCommitted;
  const canReveal = voteCommitted && !voteRevealed;
  const canFinalize = voteRevealed && !proposalFinalized;
  const canExecute = proposalFinalized && !proposalExecuted;
  const handoff = useServiceHandoffSnapshot("command-center");
  const appliedReviewRef = useRef<string | null>(null);
  const stagedProposal = handoff?.proposalId ? getProposalById(handoff.proposalId) ?? null : null;
  const stagedReviewAction = resolveStagedReviewAction(stagedProposal);

  const activeWalletLabel = useMemo(() => wallet?.adapter.name ?? "Connected wallet", [wallet]);
  const nextAction = useMemo<CoreGovernanceInstructionName>(() => {
    if (!daoCreated) return "initialize_dao";
    if (!proposalCreated) return "create_proposal";
    if (!voteCommitted) return "commit_vote";
    if (!voteRevealed) return "reveal_vote";
    if (!proposalFinalized) return "finalize_proposal";
    return "execute_proposal";
  }, [daoCreated, proposalCreated, voteCommitted, voteRevealed, proposalFinalized]);
  const preparedSummary = useMemo(
    () =>
      buildPreparedActionSummary({
        action: nextAction,
        daoName,
        proposalTitle,
        proposalId: proposalCreated ? "Session proposal" : undefined,
        voteChoice,
      }),
    [daoName, nextAction, proposalCreated, proposalTitle, voteChoice],
  );

  useEffect(() => {
    if (!handoff) return;
    const continuityKey = `${handoff.proposalId}:${handoff.telemetryMode}:${handoff.source}:${handoff.payoutIntent?.reference ?? "no-payout"}`;
    if (appliedReviewRef.current === continuityKey) return;

    if (!proposalCreated && proposalTitle !== handoff.proposalTitle) {
      setProposalTitle(handoff.proposalTitle);
    }

    stageReviewContext({
      proposalId: handoff.proposalId,
      proposalTitle: handoff.proposalTitle,
      proposalStatus: handoff.proposalStatus,
      telemetryMode: handoff.telemetryMode,
      source: handoff.source,
    });
    if (handoff.payoutIntent) {
      stageExecutionIntent({
        proposalId: handoff.proposalId,
        payoutProfile: handoff.payoutProfile,
        payoutTitle: handoff.payoutTitle,
        telemetryMode: handoff.telemetryMode,
        amountDisplay: handoff.payoutIntent.amountDisplay,
        reference: handoff.payoutIntent.reference,
        purpose: handoff.payoutIntent.purpose,
        executionTarget: handoff.payoutIntent.executionTarget,
        evidenceRoute: handoff.payoutIntent.evidenceRoute,
        source: handoff.source,
      });
    }
    appliedReviewRef.current = continuityKey;
  }, [handoff, proposalCreated, proposalTitle, setProposalTitle, stageExecutionIntent, stageReviewContext]);

  function openReview(action: CoreGovernanceInstructionName) {
    setReviewAction(action);
  }

  function confirmReviewAction() {
    if (!reviewAction) return;
    const handlers: Record<CoreGovernanceInstructionName, () => void> = {
      initialize_dao: createDao,
      create_proposal: createProposal,
      commit_vote: commitVote,
      reveal_vote: revealVote,
      finalize_proposal: finalizeProposal,
      execute_proposal: executeProposal,
    };
    handlers[reviewAction]();
    setReviewAction(null);
  }

  return (
    <>
      <Card id="proposal-review-action" className="border-white/10 bg-[linear-gradient(180deg,rgba(10,16,32,0.94),rgba(7,11,23,0.98))]">
        <CardHeader className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="text-[11px] uppercase tracking-[0.28em] text-cyan-200/72">Web app workflow</div>
              <CardTitle className="mt-2">All normal-user operations run from the UI</CardTitle>
            </div>
            <Badge variant="success">UI Full</Badge>
          </div>
          <p className="max-w-3xl text-sm leading-7 text-white/60">
            Wallet connection, DAO creation, proposal creation, commit, reveal, finalize, execute, logs, and diagnostics live here in the product surface. CLI-only operations stay out of the user flow.
          </p>
        </CardHeader>
        <CardContent className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-[24px] border border-white/10 bg-white/[0.03] p-5 md:col-span-2">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-black/20 text-cyan-200">
                  <Wallet className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-base font-medium text-white">Connect Wallet</div>
                  <div className="mt-1 text-sm text-white/52">
                    {connected ? `${activeWalletLabel} is active in the product shell.` : "Connect a supported wallet to start the governance flow."}
                  </div>
                </div>
              </div>
              <WalletConnectButton />
            </div>
          </div>

          {handoff?.proposalReview ? (
            <div className="rounded-[24px] border border-cyan-300/16 bg-cyan-300/[0.08] p-5 md:col-span-2">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="text-[11px] uppercase tracking-[0.24em] text-cyan-100/80">Execution continuity</div>
                  <div className="mt-2 text-base font-medium text-white">
                    {handoff.proposalId} · {handoff.proposalTitle}
                  </div>
                  <div className="mt-2 text-sm leading-7 text-white/62">
                    The selected proposal is staged directly into the command shell with execution target, treasury boundary, and proof route already attached.
                  </div>
                </div>
                <Link href={handoff.proposalReview.proofHref} className={cn(buttonVariants({ size: "sm", variant: "outline" }), "justify-between")}>
                  {handoff.proposalReview.proofLabel}
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </div>
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                <div className="rounded-2xl border border-white/8 bg-black/20 p-3">
                  <div className="text-[11px] uppercase tracking-[0.2em] text-white/38">Execution target</div>
                  <div className="mt-2 text-sm text-white/70">{handoff.proposalReview.executionTarget}</div>
                </div>
                <div className="rounded-2xl border border-white/8 bg-black/20 p-3">
                  <div className="text-[11px] uppercase tracking-[0.2em] text-white/38">Treasury boundary</div>
                  <div className="mt-2 text-sm text-white/70">{handoff.proposalReview.treasury}</div>
                </div>
                <div className="rounded-2xl border border-white/8 bg-black/20 p-3">
                  <div className="text-[11px] uppercase tracking-[0.2em] text-white/38">Window</div>
                  <div className="mt-2 text-sm text-white/70">{handoff.proposalReview.window}</div>
                </div>
                <div className="rounded-2xl border border-white/8 bg-black/20 p-3">
                  <div className="text-[11px] uppercase tracking-[0.2em] text-white/38">Evidence route</div>
                  <div className="mt-2 text-sm text-white/70">{handoff.proposalReview.evidenceRoute}</div>
                </div>
              </div>
            </div>
          ) : null}

          {executionIntent ? (
            <div className="rounded-[24px] border border-emerald-300/18 bg-emerald-300/[0.08] p-5 md:col-span-2">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="text-[11px] uppercase tracking-[0.24em] text-emerald-100/80">Execution request loaded</div>
                  <div className="mt-2 text-base font-medium text-white">
                    {executionIntent.payoutTitle} · {executionIntent.amountDisplay}
                  </div>
                  <div className="mt-2 text-sm leading-7 text-white/62">
                    {executionIntent.reference} · {executionIntent.purpose}
                  </div>
                </div>
                <Link href={executionIntent.evidenceRoute} className={cn(buttonVariants({ size: "sm", variant: "outline" }), "justify-between")}>
                  Open payout proof
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </div>
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                <div className="rounded-2xl border border-white/8 bg-black/20 p-3">
                  <div className="text-[11px] uppercase tracking-[0.2em] text-white/38">Payout profile</div>
                  <div className="mt-2 text-sm text-white/70">{executionIntent.payoutProfile}</div>
                </div>
                <div className="rounded-2xl border border-white/8 bg-black/20 p-3">
                  <div className="text-[11px] uppercase tracking-[0.2em] text-white/38">Telemetry mode</div>
                  <div className="mt-2 text-sm text-white/70">{executionIntent.telemetryMode}</div>
                </div>
                <div className="rounded-2xl border border-white/8 bg-black/20 p-3">
                  <div className="text-[11px] uppercase tracking-[0.2em] text-white/38">Purpose</div>
                  <div className="mt-2 text-sm text-white/70">{executionIntent.purpose}</div>
                </div>
                <div className="rounded-2xl border border-white/8 bg-black/20 p-3">
                  <div className="text-[11px] uppercase tracking-[0.2em] text-white/38">Execution target</div>
                  <div className="mt-2 text-sm text-white/70">{executionIntent.executionTarget}</div>
                </div>
              </div>
              {stagedProposal ? (
                <div className="mt-4 flex flex-wrap gap-3">
                  <Button size="sm" onClick={() => openReview(stagedReviewAction)}>
                    Open staged action shell
                  </Button>
                  <Link href={`/network?proposal=${handoff?.proposalId}&profile=${handoff?.payoutProfile}&telemetryMode=${handoff?.telemetryMode}&handoff=1`} className={cn(buttonVariants({ size: "sm", variant: "outline" }), "justify-between")}>
                    Follow telemetry into network
                    <ArrowUpRight className="h-4 w-4" />
                  </Link>
                </div>
              ) : null}
            </div>
          ) : null}

          <div className="rounded-[24px] border border-white/10 bg-white/[0.03] p-5">
            <div className="flex items-center gap-3">
              <FolderPlus className="h-4 w-4 text-emerald-300" />
              <div className="text-base font-medium text-white">Create DAO</div>
            </div>
            <input
              value={daoName}
              onChange={(event) => setDaoName(event.target.value)}
              className="mt-4 h-11 w-full rounded-2xl border border-white/10 bg-black/20 px-4 text-sm text-white outline-none placeholder:text-white/28"
              placeholder="DAO name"
            />
            <Button className="mt-4 w-full" disabled={!canCreateDao} onClick={() => openReview("initialize_dao")}>
              Create DAO
            </Button>
          </div>

          <div className="rounded-[24px] border border-white/10 bg-white/[0.03] p-5">
            <div className="flex items-center gap-3">
              <FilePlus2 className="h-4 w-4 text-cyan-300" />
              <div className="text-base font-medium text-white">Create Proposal</div>
            </div>
            <input
              value={proposalTitle}
              onChange={(event) => setProposalTitle(event.target.value)}
              className="mt-4 h-11 w-full rounded-2xl border border-white/10 bg-black/20 px-4 text-sm text-white outline-none placeholder:text-white/28"
              placeholder="Proposal title"
            />
            <Button className="mt-4 w-full" disabled={!canCreateProposal} onClick={() => openReview("create_proposal")}>
              Create Proposal
            </Button>
          </div>

          <div className="rounded-[24px] border border-white/10 bg-white/[0.03] p-5">
            <div className="flex items-center gap-3">
              <Vote className="h-4 w-4 text-fuchsia-300" />
              <div className="text-base font-medium text-white">Commit Vote</div>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {voteChoices.map((choice) => (
                <button
                  key={choice}
                  type="button"
                  onClick={() => setVoteChoice(choice)}
                  className={cn(
                    "rounded-full border px-3 py-1.5 text-xs uppercase tracking-[0.16em] transition",
                    voteChoice === choice
                      ? "border-cyan-300/30 bg-cyan-300/10 text-cyan-100"
                      : "border-white/10 bg-black/20 text-white/60",
                  )}
                >
                  {choice}
                </button>
              ))}
            </div>
            <Button className="mt-4 w-full" disabled={!canCommit} onClick={() => openReview("commit_vote")}>
              Commit Vote
            </Button>
          </div>

          <div className="rounded-[24px] border border-white/10 bg-white/[0.03] p-5">
            <div className="flex items-center gap-3">
              <ShieldCheck className="h-4 w-4 text-emerald-300" />
              <div className="text-base font-medium text-white">Reveal Vote</div>
            </div>
            <p className="mt-4 text-sm leading-7 text-white/56">
              Reveal stays inside the same product rail instead of dropping the user into scripts or terminal-only steps.
            </p>
            <Button className="mt-4 w-full" disabled={!canReveal} onClick={() => openReview("reveal_vote")} variant="secondary">
              Reveal Vote
            </Button>
          </div>

          <div className="rounded-[24px] border border-white/10 bg-white/[0.03] p-5">
            <div className="flex items-center gap-3">
              <Flag className="h-4 w-4 text-cyan-300" />
              <div className="text-base font-medium text-white">Finalize Proposal</div>
            </div>
            <p className="mt-4 text-sm leading-7 text-white/56">
              Finalize is explicit in the UI because the on-chain flow has a real finalize boundary before execution unlocks.
            </p>
            <Button className="mt-4 w-full" disabled={!canFinalize} onClick={() => openReview("finalize_proposal")} variant="secondary">
              Finalize Proposal
            </Button>
          </div>

          <div className="rounded-[24px] border border-white/10 bg-white/[0.03] p-5">
            <div className="flex items-center gap-3">
              <Play className="h-4 w-4 text-amber-300" />
              <div className="text-base font-medium text-white">Execute Proposal</div>
            </div>
            <p className="mt-4 text-sm leading-7 text-white/56">
              Execution only unlocks after the flow reaches the right boundary, keeping the UI honest and operational.
            </p>
            <Button className="mt-4 w-full" disabled={!canExecute} onClick={() => openReview("execute_proposal")} variant="outline">
              Execute Proposal
            </Button>
          </div>

          <div className="rounded-[24px] border border-white/10 bg-white/[0.03] p-5 md:col-span-2">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <ListChecks className="h-4 w-4 text-cyan-300" />
                <div className="text-base font-medium text-white">View Logs</div>
              </div>
              <Link href="/dashboard" className={cn(buttonVariants({ size: "sm", variant: "secondary" }))}>
                Open full dashboard
              </Link>
            </div>
            <div className="mt-4 grid gap-3">
              {logs.length > 0 ? (
                logs.map((entry) => (
                  <div key={`${entry.label}-${entry.value}`} className="rounded-2xl border border-white/8 bg-black/20 p-4">
                    <div className="text-sm font-medium text-white">{entry.label}</div>
                    <div className="mt-2 text-sm leading-7 text-white/56">{entry.value}</div>
                  </div>
                ))
              ) : (
                <div className="rounded-2xl border border-dashed border-white/10 bg-black/20 p-4 text-sm leading-7 text-white/48">
                  Logs appear here as the wallet, DAO, proposal, vote, reveal, and execute actions move through the UI.
                </div>
              )}
            </div>
          </div>
          </div>

          <div className="space-y-4">
            <OnchainParityPanel action={nextAction} preparedSummary={preparedSummary} compact />

            <div className="rounded-[28px] border border-white/10 bg-white/[0.03] p-5">
            <div className="flex items-center gap-3">
              <Activity className="h-4 w-4 text-cyan-300" />
              <div className="text-base font-medium text-white">Diagnostics</div>
            </div>
            <p className="mt-3 text-sm leading-7 text-white/58">
              Diagnostics remain in the web app too. Runtime evidence, proof freshness, wallet coverage, and execution health stay visible without leaving the product surface.
            </p>
            <div className="mt-4 flex flex-col gap-3">
              <Button
                variant="ghost"
                className="justify-between rounded-2xl text-white/72"
                onClick={resetSession}
              >
                Reset session
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Link href="/diagnostics" className={cn(buttonVariants({ size: "sm" }), "justify-between")}>
                Open diagnostics
                <ChevronRight className="h-4 w-4" />
              </Link>
              <Link href="/proof" className={cn(buttonVariants({ size: "sm", variant: "secondary" }), "justify-between")}>
                Open proof
                <ChevronRight className="h-4 w-4" />
              </Link>
              <Link href="/services" className={cn(buttonVariants({ size: "sm", variant: "outline" }), "justify-between")}>
                Open services
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
            </div>

            <div className="rounded-[28px] border border-emerald-300/18 bg-emerald-300/8 p-5">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-4 w-4 text-emerald-200" />
                <div className="text-base font-medium text-white">Workflow boundary</div>
              </div>
              <p className="mt-3 text-sm leading-7 text-white/60">
                Normal users never need the terminal for these core governance operations. Advanced debugging, migrations, batch recovery, and stress tooling remain in the repo by design.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <ActionReviewModal
        action={reviewAction}
        daoName={daoName}
        proposalTitle={stagedProposal?.title ?? proposalTitle}
        proposalId={stagedProposal?.id ?? (proposalCreated ? "Session proposal" : undefined)}
        voteChoice={voteChoice}
        proposal={stagedProposal ?? undefined}
        executionIntent={executionIntent}
        onClose={() => setReviewAction(null)}
        onConfirm={confirmReviewAction}
      />
    </>
  );
}
