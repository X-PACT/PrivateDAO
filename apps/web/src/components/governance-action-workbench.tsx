"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useWallet } from "@solana/wallet-adapter-react";
import { Activity, CheckCircle2, ChevronRight, FilePlus2, Flag, FolderPlus, ListChecks, Play, ShieldCheck, Vote, Wallet } from "lucide-react";

import { ActionReviewModal } from "@/components/action-review-modal";
import { useGovernanceSession } from "@/components/governance-session";
import { OnchainParityPanel } from "@/components/onchain-parity-panel";
import { WalletConnectButton } from "@/components/wallet-connect-button";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buildPreparedActionSummary } from "@/lib/onchain-parity";
import type { CoreGovernanceInstructionName } from "@/lib/onchain-parity.generated";
import { cn } from "@/lib/utils";

const voteChoices = ["Approve", "Reject", "Abstain"] as const;

export function GovernanceActionWorkbench() {
  const [reviewAction, setReviewAction] = useState<CoreGovernanceInstructionName | null>(null);
  const { connected, wallet } = useWallet();
  const {
    daoName,
    daoCreated,
    proposalTitle,
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
      <Card className="border-white/10 bg-[linear-gradient(180deg,rgba(10,16,32,0.94),rgba(7,11,23,0.98))]">
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
        proposalTitle={proposalTitle}
        proposalId={proposalCreated ? "Session proposal" : undefined}
        voteChoice={voteChoice}
        onClose={() => setReviewAction(null)}
        onConfirm={confirmReviewAction}
      />
    </>
  );
}
