"use client";

import { startTransition, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { PublicKey } from "@solana/web3.js";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
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
import { buildCreateDaoBootstrapTransaction, buildCreateProposalTransaction } from "@/lib/dao-bootstrap";
import { buildServiceHandoffQuery } from "@/lib/service-handoff-state";
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
  const [createDaoRuntime, setCreateDaoRuntime] = useState<{
    status: "idle" | "submitting" | "success" | "error";
    message: string;
    daoAddress?: string;
    governanceMint?: string;
    signature?: string;
  }>({ status: "idle", message: "" });
  const [createProposalRuntime, setCreateProposalRuntime] = useState<{
    status: "idle" | "submitting" | "success" | "error";
    message: string;
    proposalAddress?: string;
    signature?: string;
  }>({ status: "idle", message: "" });
  const { connection } = useConnection();
  const { connected, wallet, publicKey, sendTransaction } = useWallet();
  const {
    daoName,
    daoCreated,
    liveDaoRuntime,
    proposalTitle,
    executionIntent,
    proposalCreated,
    liveProposalRuntime,
    voteChoice,
    voteCommitted,
    voteRevealed,
    proposalFinalized,
    proposalExecuted,
    logs,
    setDaoName,
    setProposalTitle,
    setVoteChoice,
    recordLog,
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

  const canCreateDao =
    connected &&
    Boolean(publicKey) &&
    !daoCreated &&
    daoName.trim().length >= 3 &&
    createDaoRuntime.status !== "submitting";
  const canCreateProposal = daoCreated && !proposalCreated && proposalTitle.trim().length >= 6;
  const canSubmitLiveProposal =
    connected &&
    Boolean(publicKey) &&
    canCreateProposal &&
    Boolean(liveDaoRuntime?.address && liveDaoRuntime.governanceMint) &&
    createProposalRuntime.status !== "submitting";
  const canCommit = proposalCreated && !voteCommitted;
  const canReveal = voteCommitted && !voteRevealed;
  const canFinalize = voteRevealed && !proposalFinalized;
  const canExecute = proposalFinalized && !proposalExecuted;
  const handoff = useServiceHandoffSnapshot("command-center");
  const appliedReviewRef = useRef<string | null>(null);
  const autoOpenReviewRef = useRef<string | null>(null);
  const stagedProposal = handoff?.proposalId ? getProposalById(handoff.proposalId) ?? null : null;
  const continuityRequestPayload = handoff?.requestPayload ?? null;
  const stagedReviewAction = resolveStagedReviewAction(stagedProposal);
  const continuityQuery = handoff ? buildServiceHandoffQuery(handoff) : "";

  const activeWalletLabel = useMemo(() => wallet?.adapter.name ?? "Connected wallet", [wallet]);
  const nextAction = useMemo<CoreGovernanceInstructionName>(() => {
    if (!daoCreated) return "initialize_dao";
    if (!proposalCreated) return "create_proposal";
    if (!voteCommitted) return "commit_vote";
    if (!voteRevealed) return "reveal_vote";
    if (!proposalFinalized) return "finalize_proposal";
    return "execute_proposal";
  }, [daoCreated, proposalCreated, voteCommitted, voteRevealed, proposalFinalized]);
  const hasPayloadDrivenExecution = Boolean(executionIntent?.requestPayload);
  const payloadDrivenRequest = executionIntent?.requestPayload ?? null;
  const activeShellAction = hasPayloadDrivenExecution ? stagedReviewAction : nextAction;
  const preparedSummary = useMemo(
    () =>
      buildPreparedActionSummary({
        action: activeShellAction,
        daoName,
        proposalTitle: payloadDrivenRequest?.purpose ?? proposalTitle,
        proposalId: payloadDrivenRequest?.requestId ?? (proposalCreated ? "Session proposal" : undefined),
        voteChoice,
      }),
    [activeShellAction, daoName, payloadDrivenRequest?.purpose, payloadDrivenRequest?.requestId, proposalCreated, proposalTitle, voteChoice],
  );
  const continuityLogs = useMemo(() => {
    if (!handoff) return [];

    const derived: Array<{ label: string; value: string }> = [];

    if (executionIntent) {
      derived.push({
        label: "Execution continuity",
        value: `${continuityRequestPayload?.requestId ?? executionIntent.payoutTitle} · ${continuityRequestPayload?.amountDisplay ?? executionIntent.amountDisplay} · ${continuityRequestPayload?.reference ?? executionIntent.reference}`,
      });
      derived.push({
        label: "Execution target",
        value: `${continuityRequestPayload?.executionTarget ?? executionIntent.executionTarget} · telemetry ${continuityRequestPayload?.telemetryMode ?? executionIntent.telemetryMode}`,
      });
    }

    if (handoff.requestDelivery) {
      derived.push({
        label: "Delivery state",
        value:
          handoff.requestDelivery.state === "delivered"
            ? `delivered · ${handoff.requestDelivery.deliveredAt ?? "timestamp pending"}`
            : handoff.requestDelivery.state === "staged"
              ? "staged · ready for governed command-center delivery"
              : "draft · request remains editable in services",
      });
    }

    return derived;
  }, [continuityRequestPayload, executionIntent, handoff]);
  const payloadActionReady =
    Boolean(stagedProposal) &&
    Boolean(executionIntent) &&
    (executionIntent?.requestDelivery?.state === "delivered" ||
      executionIntent?.requestDelivery?.state === "executed" ||
      executionIntent?.requestPayload?.state === "ready-for-delivery" ||
      executionIntent?.requestPayload?.state === "executed" ||
      canExecute);
  const payloadExecutionState =
    executionIntent?.requestDelivery?.state ?? executionIntent?.requestPayload?.state ?? "draft";

  useEffect(() => {
    if (!handoff) return;
    const continuityKey = `${handoff.proposalId}:${handoff.telemetryMode}:${handoff.source}:${handoff.payoutIntent?.reference ?? "no-payout"}:${continuityRequestPayload?.requestId ?? "no-request"}:${handoff.requestDelivery?.state ?? "draft"}`;
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
        payoutTitle: continuityRequestPayload?.payoutTitle ?? handoff.payoutTitle,
        telemetryMode: continuityRequestPayload?.telemetryMode ?? handoff.telemetryMode,
        amountDisplay: continuityRequestPayload?.amountDisplay ?? handoff.payoutIntent.amountDisplay,
        reference: continuityRequestPayload?.reference ?? handoff.payoutIntent.reference,
        purpose: continuityRequestPayload?.purpose ?? handoff.payoutIntent.purpose,
        executionTarget: continuityRequestPayload?.executionTarget ?? handoff.payoutIntent.executionTarget,
        evidenceRoute: continuityRequestPayload?.evidenceRoute ?? handoff.payoutIntent.evidenceRoute,
        requestPayload: handoff.requestPayload,
        requestDelivery: handoff.requestDelivery,
        source: handoff.source,
      });
    }
    appliedReviewRef.current = continuityKey;
  }, [continuityRequestPayload, handoff, proposalCreated, proposalTitle, setProposalTitle, stageExecutionIntent, stageReviewContext]);

  useEffect(() => {
    if (!handoff?.requestDelivery || !executionIntent || !stagedProposal) return;
    if (handoff.requestDelivery.state !== "delivered") return;

    const autoOpenKey = `${handoff.proposalId}:${handoff.requestDelivery.state}:${handoff.requestDelivery.deliveredAt ?? "pending"}`;
    if (autoOpenReviewRef.current === autoOpenKey) return;

    startTransition(() => {
      setReviewAction(stagedReviewAction);
    });
    autoOpenReviewRef.current = autoOpenKey;
  }, [executionIntent, handoff, stagedProposal, stagedReviewAction]);

  function openReview(action: CoreGovernanceInstructionName) {
    setReviewAction(action);
  }

  async function submitCreateDaoLive() {
    if (!publicKey) {
      setCreateDaoRuntime({
        status: "error",
        message: "Connect a wallet before creating the DAO on devnet.",
      });
      return;
    }

    try {
      setCreateDaoRuntime({
        status: "submitting",
        message: "Preparing DAO bootstrap transaction for wallet signature...",
      });

      const bootstrap = await buildCreateDaoBootstrapTransaction({
        authority: publicKey,
        connection,
        name: daoName.trim(),
        quorum: 51,
        revealWindowSeconds: 5,
        delaySeconds: 5,
        votingMode: "token",
      });

      setCreateDaoRuntime({
        status: "submitting",
        message: "Awaiting wallet signature for the DAO bootstrap transaction...",
        daoAddress: bootstrap.dao.toBase58(),
        governanceMint: bootstrap.governanceMint.toBase58(),
      });

      const signature = await sendTransaction(bootstrap.transaction, connection, {
        preflightCommitment: "confirmed",
        signers: [bootstrap.mintSigner],
      });

      await connection.confirmTransaction(signature, "confirmed");

      createDao({
        address: bootstrap.dao.toBase58(),
        governanceMint: bootstrap.governanceMint.toBase58(),
        signature,
      });
      recordLog(
        "DAO bootstrap submitted",
        `${daoName.trim()} · ${bootstrap.dao.toBase58()} · ${signature}`,
      );
      recordLog(
        "Governance mint provisioned",
        `${bootstrap.governanceMint.toBase58()} minted as the DAO governance token for the live devnet bootstrap.`,
      );

      setCreateDaoRuntime({
        status: "success",
        message: "DAO bootstrap submitted to devnet from the web wallet flow.",
        daoAddress: bootstrap.dao.toBase58(),
        governanceMint: bootstrap.governanceMint.toBase58(),
        signature,
      });
    } catch (error) {
      const message =
        error instanceof Error && error.message
          ? error.message
          : "Web wallet DAO bootstrap failed before confirmation.";
      setCreateDaoRuntime({
        status: "error",
        message,
      });
    }
  }

  async function submitCreateProposalLive() {
    if (!publicKey) {
      setCreateProposalRuntime({
        status: "error",
        message: "Connect a wallet before submitting the proposal on devnet.",
      });
      return;
    }
    if (!liveDaoRuntime?.address) {
      setCreateProposalRuntime({
        status: "error",
        message: "Create the DAO live first so the web flow has a real DAO address to target.",
      });
      return;
    }

    try {
      setCreateProposalRuntime({
        status: "submitting",
        message: "Preparing live proposal transaction for wallet signature...",
      });

      const proposalSubmission = await buildCreateProposalTransaction({
        proposer: publicKey,
        connection,
        daoAddress: new PublicKey(liveDaoRuntime.address),
        title: proposalTitle.trim(),
        description: `${proposalTitle.trim()} submitted from the live web governance surface.`,
        votingDurationSeconds: 3600,
      });

      setCreateProposalRuntime({
        status: "submitting",
        message: "Awaiting wallet signature for the live proposal transaction...",
        proposalAddress: proposalSubmission.proposal.toBase58(),
      });

      const signature = await sendTransaction(proposalSubmission.transaction, connection, {
        preflightCommitment: "confirmed",
      });

      await connection.confirmTransaction(signature, "confirmed");

      createProposal({
        address: proposalSubmission.proposal.toBase58(),
        signature,
      });
      recordLog(
        "Proposal submitted",
        `${proposalTitle.trim()} · ${proposalSubmission.proposal.toBase58()} · ${signature}`,
      );
      recordLog(
        "Proposal DAO lane",
        `${proposalSubmission.dao.toBase58()} · governance mint ${proposalSubmission.governanceMint.toBase58()} · proposer ATA ${proposalSubmission.proposerTokenAccount.toBase58()}`,
      );

      setCreateProposalRuntime({
        status: "success",
        message: "Proposal submitted to devnet from the web wallet flow.",
        proposalAddress: proposalSubmission.proposal.toBase58(),
        signature,
      });
    } catch (error) {
      const message =
        error instanceof Error && error.message
          ? error.message
          : "Web wallet proposal submit failed before confirmation.";
      setCreateProposalRuntime({
        status: "error",
        message,
      });
    }
  }

  async function confirmReviewAction() {
    if (!reviewAction) return;
    const activeAction = reviewAction;
    setReviewAction(null);

    if (activeAction === "initialize_dao") {
      await submitCreateDaoLive();
      return;
    }
    if (activeAction === "create_proposal") {
      await submitCreateProposalLive();
      return;
    }

    const handlers: Record<CoreGovernanceInstructionName, () => void> = {
      initialize_dao: createDao,
      create_proposal: createProposal,
      commit_vote: commitVote,
      reveal_vote: revealVote,
      finalize_proposal: finalizeProposal,
      execute_proposal: executeProposal,
    };
    handlers[activeAction]();
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
              <Badge variant="success">Live DAO / Proposal Create</Badge>
            </div>
            <p className="max-w-3xl text-sm leading-7 text-white/60">
            Wallet connection, DAO bootstrap, and proposal submit now run live from the web surface on devnet. Vote, reveal, finalize, and execute still stay in the same UI shell while deeper on-chain parity keeps expanding from the same product lane.
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
                <div className="rounded-2xl border border-white/8 bg-black/20 p-3">
                  <div className="text-[11px] uppercase tracking-[0.2em] text-white/38">Request ID</div>
                  <div className="mt-2 text-sm text-white/70">
                    {executionIntent.requestPayload?.requestId ?? executionIntent.reference}
                  </div>
                </div>
                <div className="rounded-2xl border border-white/8 bg-black/20 p-3">
                  <div className="text-[11px] uppercase tracking-[0.2em] text-white/38">Request state</div>
                  <div className="mt-2 text-sm text-white/70">
                    {executionIntent.requestPayload?.state ?? executionIntent.requestDelivery?.state ?? "draft-pending-input"}
                  </div>
                </div>
              </div>
              {handoff?.requestDelivery ? (
                <div className="mt-4 rounded-2xl border border-white/8 bg-black/20 p-4">
                  <div className="text-[11px] uppercase tracking-[0.2em] text-white/38">Delivery lane</div>
                  <div className="mt-2 text-sm text-white/70">{handoff.requestDelivery.stateDetail}</div>
                  <div className="mt-2 text-xs leading-6 text-white/52">
                    {handoff.requestDelivery.deliveredAt
                      ? `${handoff.requestDelivery.state === "executed" ? "Executed" : "Delivered"} at ${handoff.requestDelivery.deliveredAt}`
                      : `Execution route ${handoff.requestDelivery.deliveryRoute}`}
                  </div>
                </div>
              ) : null}
              {stagedProposal ? (
                <div className="mt-4 flex flex-wrap gap-3">
                  <Button size="sm" onClick={() => openReview(stagedReviewAction)}>
                    Open staged action shell
                  </Button>
                  <Link
                    href={executionIntent.requestDelivery?.deliveryRoute ?? (continuityQuery ? `/command-center?${continuityQuery}#proposal-review-action` : "/command-center#proposal-review-action")}
                    className={cn(buttonVariants({ size: "sm", variant: "outline" }), "justify-between")}
                  >
                    Open delivered lane
                    <ArrowUpRight className="h-4 w-4" />
                  </Link>
                  <Link href={executionIntent.requestDelivery?.telemetryRoute ?? (continuityQuery ? `/network?${continuityQuery}` : "/network")} className={cn(buttonVariants({ size: "sm", variant: "outline" }), "justify-between")}>
                    Follow telemetry into network
                    <ArrowUpRight className="h-4 w-4" />
                  </Link>
                  <Link href="/documents/monitoring-alert-rules" className={cn(buttonVariants({ size: "sm", variant: "outline" }), "justify-between")}>
                    Open alert rules
                    <ArrowUpRight className="h-4 w-4" />
                  </Link>
                  <Link href="/documents/real-device-runtime" className={cn(buttonVariants({ size: "sm", variant: "outline" }), "justify-between")}>
                    Open real-device runtime
                    <ArrowUpRight className="h-4 w-4" />
                  </Link>
                </div>
              ) : null}
            </div>
          ) : null}

          {hasPayloadDrivenExecution ? (
            <>
              <div className="rounded-[24px] border border-emerald-300/16 bg-emerald-300/[0.08] p-5">
                <div className="flex items-center gap-3">
                  <FolderPlus className="h-4 w-4 text-emerald-300" />
                  <div className="text-base font-medium text-white">Authoritative request object</div>
                </div>
                <div className="mt-4 space-y-2 text-sm leading-7 text-white/66">
                  <div>{payloadDrivenRequest?.requestId}</div>
                  <div>{payloadDrivenRequest?.amountDisplay}</div>
                  <div>{payloadDrivenRequest?.reference}</div>
                  <div>{payloadDrivenRequest?.requestRoute}</div>
                </div>
                <Button className="mt-4 w-full" onClick={() => openReview(stagedReviewAction)} variant="secondary">
                  Review payload-driven signing shell
                </Button>
                <div className="mt-3 flex flex-wrap gap-3">
                  <Link href="/documents/monitoring-alert-rules" className={cn(buttonVariants({ size: "sm", variant: "outline" }), "justify-between")}>
                    Open alert rules
                    <ArrowUpRight className="h-4 w-4" />
                  </Link>
                  <Link href="/documents/real-device-runtime" className={cn(buttonVariants({ size: "sm", variant: "outline" }), "justify-between")}>
                    Open real-device runtime
                    <ArrowUpRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>

              <div className="rounded-[24px] border border-cyan-300/16 bg-cyan-300/[0.08] p-5">
                <div className="flex items-center gap-3">
                  <Vote className="h-4 w-4 text-cyan-300" />
                  <div className="text-base font-medium text-white">Signing shell</div>
                </div>
                <div className="mt-4 space-y-2 text-sm leading-7 text-white/66">
                  <div>Telemetry: {payloadDrivenRequest?.telemetryMode}</div>
                  <div>Target: {payloadDrivenRequest?.executionTarget}</div>
                  <div>Lane: {payloadDrivenRequest?.lane}</div>
                  <div>Delivery: {payloadExecutionState}</div>
                </div>
                <Button className="mt-4 w-full" onClick={() => openReview(stagedReviewAction)} variant="secondary">
                  {payloadExecutionState === "executed" ? "Review submitted payload shell" : "Open signing and submit shell"}
                </Button>
                <div className="mt-3 flex flex-wrap gap-3">
                  <Link href={payloadDrivenRequest?.telemetryRoute ?? (continuityQuery ? `/network?${continuityQuery}` : "/network")} className={cn(buttonVariants({ size: "sm", variant: "outline" }), "justify-between")}>
                    Open execution telemetry
                    <ArrowUpRight className="h-4 w-4" />
                  </Link>
                  <Link href={payloadDrivenRequest?.evidenceRoute ?? "/proof"} className={cn(buttonVariants({ size: "sm", variant: "outline" }), "justify-between")}>
                    Open payout proof
                    <ArrowUpRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>

              <div className="rounded-[24px] border border-amber-300/16 bg-amber-300/8 p-5">
                <div className="flex items-center gap-3">
                  <Play className="h-4 w-4 text-amber-300" />
                  <div className="text-base font-medium text-white">Execute delivered request</div>
                </div>
                <p className="mt-4 text-sm leading-7 text-white/60">
                  The execution control now follows the delivered treasury payload directly instead of falling back to a proposal-only action path.
                </p>
                <div className="mt-4 rounded-2xl border border-white/8 bg-black/20 p-4">
                  <div className="text-[11px] uppercase tracking-[0.2em] text-white/38">Final signing packet</div>
                  <div className="mt-2 text-sm text-white/72">{payloadDrivenRequest?.requestId}</div>
                  <div className="mt-1 text-sm text-white/72">{payloadDrivenRequest?.amountDisplay}</div>
                  <div className="mt-1 text-sm text-white/72">{payloadDrivenRequest?.reference}</div>
                  <div className="mt-1 text-sm text-white/72">{payloadDrivenRequest?.deliveryRoute}</div>
                  <div className="mt-1 text-sm text-white/72">{payloadDrivenRequest?.telemetryRoute}</div>
                </div>
                <Button
                  className="mt-4 w-full"
                  disabled={!payloadActionReady}
                  onClick={() => openReview("execute_proposal")}
                  variant="outline"
                >
                  {payloadExecutionState === "executed" ? "Payload already submitted" : "Sign and submit delivered payload"}
                </Button>
                <div className="mt-3 flex flex-wrap gap-3">
                  <Link href={payloadDrivenRequest?.deliveryRoute ?? (continuityQuery ? `/command-center?${continuityQuery}#proposal-review-action` : "/command-center#proposal-review-action")} className={cn(buttonVariants({ size: "sm", variant: "secondary" }), "justify-between")}>
                    Open final signing lane
                    <ArrowUpRight className="h-4 w-4" />
                  </Link>
                  <Link href={payloadDrivenRequest?.telemetryRoute ?? (continuityQuery ? `/network?${continuityQuery}` : "/network")} className={cn(buttonVariants({ size: "sm", variant: "outline" }), "justify-between")}>
                    Open execution telemetry
                    <ArrowUpRight className="h-4 w-4" />
                  </Link>
                  <Link href="/documents/monitoring-alert-rules" className={cn(buttonVariants({ size: "sm", variant: "outline" }), "justify-between")}>
                    Open alert rules
                    <ArrowUpRight className="h-4 w-4" />
                  </Link>
                  <Link href="/documents/real-device-runtime" className={cn(buttonVariants({ size: "sm", variant: "outline" }), "justify-between")}>
                    Open real-device runtime
                    <ArrowUpRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </>
          ) : (
            <>
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
                  {createDaoRuntime.status === "submitting" ? "Awaiting wallet..." : "Create DAO on devnet"}
                </Button>
                {createDaoRuntime.message ? (
                  <div
                    className={cn(
                      "mt-4 rounded-2xl border p-4 text-sm leading-7",
                      createDaoRuntime.status === "error"
                        ? "border-rose-300/18 bg-rose-300/10 text-rose-100/84"
                        : createDaoRuntime.status === "success"
                          ? "border-emerald-300/18 bg-emerald-300/[0.08] text-emerald-100/84"
                          : "border-cyan-300/16 bg-cyan-300/[0.08] text-cyan-100/84",
                    )}
                  >
                    <div>{createDaoRuntime.message}</div>
                    {createDaoRuntime.daoAddress ? (
                      <div className="mt-2 break-all text-xs text-white/70">
                        DAO: {createDaoRuntime.daoAddress}
                      </div>
                    ) : null}
                    {createDaoRuntime.governanceMint ? (
                      <div className="mt-1 break-all text-xs text-white/70">
                        Governance mint: {createDaoRuntime.governanceMint}
                      </div>
                    ) : null}
                    {createDaoRuntime.signature ? (
                      <div className="mt-1 break-all text-xs text-white/70">
                        Signature: {createDaoRuntime.signature}
                      </div>
                    ) : null}
                  </div>
                ) : null}
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
                {!liveDaoRuntime?.address ? (
                  <p className="mt-4 text-sm leading-7 text-amber-100/70">
                    Live proposal submit unlocks after a live web DAO bootstrap so the wallet flow has a real DAO address and governance mint to target.
                  </p>
                ) : null}
                {liveDaoRuntime?.address ? (
                  <div className="mt-4 rounded-2xl border border-cyan-300/16 bg-cyan-300/[0.08] p-3 text-sm text-white/72">
                    <div className="text-[11px] uppercase tracking-[0.2em] text-cyan-100/72">Live DAO lane</div>
                    <div className="mt-2 break-all text-white">{liveDaoRuntime.address}</div>
                    <div className="mt-1 break-all text-white/62">Governance mint {liveDaoRuntime.governanceMint}</div>
                  </div>
                ) : null}
                <Button className="mt-4 w-full" disabled={!canSubmitLiveProposal} onClick={() => openReview("create_proposal")}>
                  Create Proposal
                </Button>
                {createProposalRuntime.status !== "idle" ? (
                  <div
                    className={cn(
                      "mt-4 rounded-2xl border p-3 text-sm leading-7",
                      createProposalRuntime.status === "error"
                        ? "border-rose-300/20 bg-rose-300/[0.08] text-rose-100/82"
                        : createProposalRuntime.status === "success"
                          ? "border-emerald-300/18 bg-emerald-300/[0.08] text-emerald-100/82"
                          : "border-cyan-300/18 bg-cyan-300/[0.08] text-cyan-100/82",
                    )}
                  >
                    <div>{createProposalRuntime.message}</div>
                    {createProposalRuntime.proposalAddress ? (
                      <div className="mt-2 break-all text-white/70">Proposal {createProposalRuntime.proposalAddress}</div>
                    ) : null}
                    {createProposalRuntime.signature ? (
                      <div className="mt-1 break-all text-white/60">Signature {createProposalRuntime.signature}</div>
                    ) : null}
                  </div>
                ) : liveProposalRuntime ? (
                  <div className="mt-4 rounded-2xl border border-emerald-300/18 bg-emerald-300/[0.08] p-3 text-sm leading-7 text-emerald-100/82">
                    <div>Last live proposal submit cleared from the web wallet flow.</div>
                    <div className="mt-2 break-all text-white/70">Proposal {liveProposalRuntime.address}</div>
                    <div className="mt-1 break-all text-white/60">Signature {liveProposalRuntime.signature}</div>
                  </div>
                ) : null}
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
            </>
          )}

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
                [...continuityLogs, ...logs].map((entry) => (
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
                The web wallet flow now owns live DAO bootstrap. The remaining lifecycle stages stay inside the same product lane while proposal and execution parity keep moving from staged shell behavior into live on-chain submits.
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
        requestPayload={continuityRequestPayload}
        requestDelivery={handoff?.requestDelivery ?? null}
        onClose={() => setReviewAction(null)}
        onConfirm={confirmReviewAction}
      />
    </>
  );
}
