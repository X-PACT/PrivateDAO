"use client";

import { startTransition, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { Activity, ArrowUpRight, ChevronRight, FilePlus2, Flag, FolderPlus, ListChecks, Play, ShieldCheck, Vote, Wallet } from "lucide-react";

import { ActionReviewModal } from "@/components/action-review-modal";
import { useGovernanceSession } from "@/components/governance-session";
import { OnchainParityPanel } from "@/components/onchain-parity-panel";
import { WalletConnectButton } from "@/components/wallet-connect-button";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buildPreparedActionSummary } from "@/lib/onchain-parity";
import type { CoreGovernanceInstructionName } from "@/lib/onchain-parity.generated";
import {
  buildCommitVoteTransaction,
  buildCreateDaoBootstrapTransaction,
  buildCreateProposalTransaction,
  buildExecuteProposalTransaction,
  buildFinalizeProposalTransaction,
  buildRevealVoteTransaction,
  awaitLiveSignatureOnCluster,
  computeProposalCommitment,
  fetchGovernanceHolderSnapshot,
  fetchProposalAccountDetails,
} from "@/lib/dao-bootstrap";
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

function toHex(bytes: Uint8Array) {
  return Array.from(bytes, (value) => value.toString(16).padStart(2, "0")).join("");
}

function randomSalt32() {
  const salt = new Uint8Array(32);
  crypto.getRandomValues(salt);
  return salt;
}

function formatRuntimeWindow(unixSeconds: number) {
  return new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    month: "short",
    day: "2-digit",
    year: "numeric",
    hour12: false,
    timeZone: "Africa/Cairo",
  }).format(new Date(unixSeconds * 1000));
}

function formatRemainingSeconds(seconds: number) {
  if (seconds <= 0) return "0s";
  const minutes = Math.floor(seconds / 60);
  const remainder = seconds % 60;
  if (minutes <= 0) return `${remainder}s`;
  if (minutes < 60) return `${minutes}m ${remainder}s`;
  const hours = Math.floor(minutes / 60);
  const minuteRemainder = minutes % 60;
  return `${hours}h ${minuteRemainder}m`;
}

function getActionAnchorId(action: CoreGovernanceInstructionName) {
  switch (action) {
    case "create_proposal":
      return "proposal-review-action";
    case "commit_vote":
      return "commit-vote-action";
    case "reveal_vote":
      return "reveal-vote-action";
    case "finalize_proposal":
      return "finalize-proposal-action";
    case "execute_proposal":
      return "execute-proposal-action";
    default:
      return "govern-current-step";
  }
}

function parseSolAmountToLamports(value: string) {
  const normalized = value.trim();
  if (!normalized) {
    throw new Error("Treasury amount is required when a treasury recipient is set.");
  }
  if (!/^\d+(\.\d{1,9})?$/.test(normalized)) {
    throw new Error("Treasury amount must be a positive SOL value with up to 9 decimals.");
  }

  const [wholePart, fractionalPart = ""] = normalized.split(".");
  const wholeLamports = BigInt(wholePart) * BigInt(LAMPORTS_PER_SOL);
  const paddedFraction = (fractionalPart + "000000000").slice(0, 9);
  const fractionalLamports = BigInt(paddedFraction);
  const amountLamports = wholeLamports + fractionalLamports;

  if (amountLamports <= BigInt(0)) {
    throw new Error("Treasury amount must be greater than zero.");
  }

  return amountLamports;
}

function parseRawTokenAmount(value: string) {
  const normalized = value.trim();
  if (!/^\d+$/.test(normalized)) {
    throw new Error("Token amount must be a positive whole number of raw units.");
  }

  const amount = BigInt(normalized);
  if (amount <= BigInt(0)) {
    throw new Error("Token amount must be greater than zero.");
  }

  return amount;
}

function describeWalletActionError(error: unknown, fallback: string) {
  if (error instanceof Error) {
    const message = error.message?.trim();
    const name = error.name?.trim() ?? "";
    const combined = `${name} ${message}`.trim();

    if (combined.includes("WalletSendTransactionError")) {
      return "The wallet did not complete proposal submission. Re-open the wallet popup and approve the pending transaction, or reconnect the wallet and try once.";
    }

    if (combined.includes("WalletSignTransactionError")) {
      return "The wallet did not sign the transaction. Re-open the wallet popup and complete the signature once.";
    }

    if (combined.includes("WalletConnectionError")) {
      return "The wallet connection was rejected or lost. Reconnect the wallet, then retry the action once.";
    }

    if (message) {
      return message;
    }
  }

  return fallback;
}

export function GovernanceActionWorkbench() {
  const [reviewAction, setReviewAction] = useState<CoreGovernanceInstructionName | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [createDaoRuntime, setCreateDaoRuntime] = useState<{
    status: "idle" | "submitting" | "success" | "error";
    message: string;
    daoAddress?: string;
    authority?: string;
    governanceMint?: string;
    signature?: string;
  }>({ status: "idle", message: "" });
  const [createProposalRuntime, setCreateProposalRuntime] = useState<{
    status: "idle" | "submitting" | "success" | "error";
    message: string;
    proposalAddress?: string;
    signature?: string;
  }>({ status: "idle", message: "" });
  const [commitVoteRuntime, setCommitVoteRuntime] = useState<{
    status: "idle" | "submitting" | "success" | "error";
    message: string;
    commitmentHex?: string;
    saltHex?: string;
    signature?: string;
  }>({ status: "idle", message: "" });
  const [revealVoteRuntime, setRevealVoteRuntime] = useState<{
    status: "idle" | "submitting" | "success" | "error";
    message: string;
    signature?: string;
  }>({ status: "idle", message: "" });
  const [finalizeRuntime, setFinalizeRuntime] = useState<{
    status: "idle" | "submitting" | "success" | "error";
    message: string;
    signature?: string;
  }>({ status: "idle", message: "" });
  const [executeRuntime, setExecuteRuntime] = useState<{
    status: "idle" | "submitting" | "success" | "error";
    message: string;
    signature?: string;
  }>({ status: "idle", message: "" });
  const [proposalTreasuryMode, setProposalTreasuryMode] = useState<"standard" | "sol" | "token">("standard");
  const [proposalTreasuryRecipient, setProposalTreasuryRecipient] = useState("");
  const [proposalTreasuryAmountSol, setProposalTreasuryAmountSol] = useState("");
  const [proposalTreasuryTokenMint, setProposalTreasuryTokenMint] = useState("");
  const [liveProposalWindow, setLiveProposalWindow] = useState<{
    votingEnd: number;
    revealEnd: number;
    status: string;
  } | null>(null);
  const [nowSeconds, setNowSeconds] = useState(() => Math.floor(Date.now() / 1000));
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
    liveVoteRuntime,
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
  const liveDaoWalletMismatch = Boolean(
    publicKey &&
      liveDaoRuntime?.authority &&
      liveDaoRuntime.authority !== publicKey.toBase58(),
  );
  const activeLiveDaoRuntime = liveDaoWalletMismatch ? null : liveDaoRuntime;
  const activeLiveProposalAddress = liveDaoWalletMismatch ? null : liveProposalRuntime?.address;
  const hasLiveDaoLane = Boolean(activeLiveDaoRuntime?.address && activeLiveDaoRuntime.governanceMint);
  const effectiveDaoCreated = !liveDaoWalletMismatch && (daoCreated || hasLiveDaoLane);
  const effectiveProposalCreated = !liveDaoWalletMismatch && (proposalCreated || Boolean(activeLiveProposalAddress));
  const effectiveVoteCommitted =
    !liveDaoWalletMismatch && (voteCommitted || Boolean(liveVoteRuntime?.commitSignature && activeLiveProposalAddress));
  const effectiveVoteRevealed =
    !liveDaoWalletMismatch && (voteRevealed || Boolean(liveVoteRuntime?.revealSignature && activeLiveProposalAddress));
  const effectiveProposalFinalized =
    !liveDaoWalletMismatch &&
    (proposalFinalized || Boolean(liveVoteRuntime?.finalizeSignature && activeLiveProposalAddress));
  const effectiveProposalExecuted =
    !liveDaoWalletMismatch &&
    (proposalExecuted || Boolean(liveVoteRuntime?.executeSignature && activeLiveProposalAddress));

  const canCreateDao =
    connected &&
    Boolean(publicKey) &&
    !effectiveDaoCreated &&
    daoName.trim().length >= 3 &&
    createDaoRuntime.status !== "submitting";
  const canCreateProposal = effectiveDaoCreated && !effectiveProposalCreated && proposalTitle.trim().length >= 6;
  const proposalTreasuryDraft = useMemo(() => {
    const recipient = proposalTreasuryRecipient.trim();
    const amount = proposalTreasuryAmountSol.trim();
    const tokenMint = proposalTreasuryTokenMint.trim();

    if (proposalTreasuryMode === "standard") {
      return { action: null, error: null as string | null };
    }

    if (!recipient || !amount) {
      return {
        action: null,
        error: "Enter both treasury recipient and amount for a treasury motion, or switch back to Standard.",
      };
    }

    try {
      if (proposalTreasuryMode === "token") {
        if (!tokenMint) {
          return {
            action: null,
            error: "Token treasury motions require a token mint address.",
          };
        }
        return {
          action: {
            actionType: "SendToken" as const,
            amountLamports: parseRawTokenAmount(amount),
            recipient: new PublicKey(recipient),
            tokenMint: new PublicKey(tokenMint),
          },
          error: null as string | null,
        };
      }

      return {
        action: {
          actionType: "SendSol" as const,
          amountLamports: parseSolAmountToLamports(amount),
          recipient: new PublicKey(recipient),
        },
        error: null as string | null,
      };
    } catch (error) {
      return {
        action: null,
        error:
          error instanceof Error && error.message
            ? error.message
            : "Treasury action inputs are invalid.",
      };
    }
  }, [proposalTreasuryAmountSol, proposalTreasuryMode, proposalTreasuryRecipient, proposalTreasuryTokenMint]);
  const canSubmitLiveProposal =
    connected &&
    Boolean(publicKey) &&
    canCreateProposal &&
    Boolean(activeLiveDaoRuntime?.address && activeLiveDaoRuntime.governanceMint) &&
    !proposalTreasuryDraft.error &&
    createProposalRuntime.status !== "submitting";
  const canExecute = effectiveProposalFinalized && !effectiveProposalExecuted;
  const handoff = useServiceHandoffSnapshot("command-center");
  const appliedReviewRef = useRef<string | null>(null);
  const autoOpenReviewRef = useRef<string | null>(null);
  const stagedProposal = handoff?.proposalId ? getProposalById(handoff.proposalId) ?? null : null;
  const continuityRequestPayload = handoff?.requestPayload ?? null;
  const stagedReviewAction = resolveStagedReviewAction(stagedProposal);
  const continuityQuery = handoff ? buildServiceHandoffQuery(handoff) : "";
  const nextAction = useMemo<CoreGovernanceInstructionName>(() => {
    if (!effectiveDaoCreated) return "initialize_dao";
    if (!effectiveProposalCreated) return "create_proposal";
    if (!effectiveVoteCommitted) return "commit_vote";
    if (!effectiveVoteRevealed) return "reveal_vote";
    if (!effectiveProposalFinalized) return "finalize_proposal";
    return "execute_proposal";
  }, [
    effectiveDaoCreated,
    effectiveProposalCreated,
    effectiveVoteCommitted,
    effectiveVoteRevealed,
    effectiveProposalFinalized,
  ]);

  const activeWalletLabel = useMemo(() => wallet?.adapter.name ?? "Connected wallet", [wallet]);
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
              ? "staged · ready for govern delivery"
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
  const hasLiveCommitLane = Boolean(hasLiveDaoLane && activeLiveProposalAddress);
  const revealWindowOpen = Boolean(
    effectiveVoteCommitted &&
      liveProposalWindow &&
      nowSeconds >= liveProposalWindow.votingEnd &&
      nowSeconds < liveProposalWindow.revealEnd,
  );
  const canCommitLive =
    connected &&
    Boolean(publicKey) &&
    hasLiveCommitLane &&
    effectiveProposalCreated &&
    !effectiveVoteCommitted &&
    commitVoteRuntime.status !== "submitting";
  const canRevealLive =
    connected &&
    Boolean(publicKey) &&
    Boolean(liveVoteRuntime?.saltHex && activeLiveProposalAddress) &&
    effectiveVoteCommitted &&
    revealWindowOpen &&
    !effectiveVoteRevealed &&
    revealVoteRuntime.status !== "submitting";
  const canFinalizeLive =
    connected &&
    Boolean(publicKey) &&
    hasLiveCommitLane &&
    effectiveVoteRevealed &&
    Boolean(liveProposalWindow && nowSeconds >= liveProposalWindow.revealEnd) &&
    !effectiveProposalFinalized &&
    finalizeRuntime.status !== "submitting";
  const canExecuteLive =
    connected &&
    Boolean(publicKey) &&
    hasLiveCommitLane &&
    canExecute &&
    executeRuntime.status !== "submitting";

  useEffect(() => {
    const interval = window.setInterval(() => {
      setNowSeconds(Math.floor(Date.now() / 1000));
    }, 1000);

    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadLiveProposalWindow() {
      if (!activeLiveProposalAddress) {
        setLiveProposalWindow(null);
        return;
      }

      try {
        const proposal = await fetchProposalAccountDetails(connection, new PublicKey(activeLiveProposalAddress));
        if (cancelled) return;
        setLiveProposalWindow({
          votingEnd: proposal.votingEnd,
          revealEnd: proposal.revealEnd,
          status: proposal.status,
        });
      } catch {
        if (cancelled) return;
        setLiveProposalWindow(null);
      }
    }

    void loadLiveProposalWindow();
    return () => {
      cancelled = true;
    };
  }, [
    activeLiveProposalAddress,
    commitVoteRuntime.status,
    connection,
    effectiveVoteCommitted,
    effectiveVoteRevealed,
    finalizeRuntime.status,
    revealVoteRuntime.status,
  ]);

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

  function handleResetSession() {
    resetSession();
    setReviewAction(null);
    setCreateDaoRuntime({ status: "idle", message: "" });
    setCreateProposalRuntime({ status: "idle", message: "" });
    setCommitVoteRuntime({ status: "idle", message: "" });
    setRevealVoteRuntime({ status: "idle", message: "" });
    setFinalizeRuntime({ status: "idle", message: "" });
    setExecuteRuntime({ status: "idle", message: "" });
    setProposalTreasuryMode("standard");
    setProposalTreasuryRecipient("");
    setProposalTreasuryAmountSol("");
    setProposalTreasuryTokenMint("");
    appliedReviewRef.current = null;
    autoOpenReviewRef.current = null;
  }

  const currentStep = useMemo(() => {
    if (!connected || !publicKey) {
      return {
        number: "01",
        title: "Connect a wallet",
        description: "Start by connecting a supported wallet. The rest of the flow stays hidden behind this single step.",
        action: null as CoreGovernanceInstructionName | null,
      };
    }
    if (!effectiveDaoCreated) {
      return {
        number: "02",
        title: "Create your DAO",
        description: "Create the DAO first. Once it lands, proposal creation unlocks automatically on the same surface.",
        action: "initialize_dao" as const,
      };
    }
    if (!effectiveProposalCreated) {
      return {
        number: "03",
        title: "Create a proposal",
        description: "You already have a live DAO. The next step is a single proposal create from the same wallet lane.",
        action: "create_proposal" as const,
      };
    }
    if (!effectiveVoteCommitted) {
      return {
        number: "04",
        title: "Commit your vote",
        description: "Proposal is live. Commit a vote first, then reveal it after the commit window closes.",
        action: "commit_vote" as const,
      };
    }
    if (!effectiveVoteRevealed) {
      return {
        number: "05",
        title: "Reveal your vote",
        description: "The commit is stored. Reveal the vote from the same proposal lane when the reveal window opens.",
        action: "reveal_vote" as const,
      };
    }
    if (!effectiveProposalFinalized) {
      return {
        number: "06",
        title: "Finalize the proposal",
        description: "Finalize the result to lock the on-chain outcome before execution.",
        action: "finalize_proposal" as const,
      };
    }
    if (!effectiveProposalExecuted) {
      return {
        number: "07",
        title: "Execute the result",
        description: "Execution is the last user step. Run it only after finalize clears and the timelock is over.",
        action: "execute_proposal" as const,
      };
    }
    return {
      number: "08",
      title: "Lifecycle complete",
      description: "This DAO lane already completed the standard governance flow. You can reset the session and start the next run.",
      action: null as CoreGovernanceInstructionName | null,
    };
  }, [
    connected,
    publicKey,
    effectiveDaoCreated,
    effectiveProposalCreated,
    effectiveProposalExecuted,
    effectiveProposalFinalized,
    effectiveVoteCommitted,
    effectiveVoteRevealed,
  ]);
  const showDaoCard =
    !hasPayloadDrivenExecution &&
    (!effectiveDaoCreated || currentStep.action === "initialize_dao" || createDaoRuntime.status !== "idle");
  const showProposalCard =
    !hasPayloadDrivenExecution &&
    effectiveDaoCreated &&
    (!effectiveProposalCreated || currentStep.action === "create_proposal" || createProposalRuntime.status !== "idle");
  const showCommitCard =
    !hasPayloadDrivenExecution &&
    effectiveProposalCreated &&
    (!effectiveVoteCommitted || currentStep.action === "commit_vote" || commitVoteRuntime.status !== "idle");
  const showRevealCard =
    !hasPayloadDrivenExecution &&
    effectiveVoteCommitted &&
    (!effectiveVoteRevealed || currentStep.action === "reveal_vote" || revealVoteRuntime.status !== "idle");
  const showFinalizeCard =
    !hasPayloadDrivenExecution &&
    effectiveVoteRevealed &&
    (!effectiveProposalFinalized || currentStep.action === "finalize_proposal" || finalizeRuntime.status !== "idle");
  const showExecuteCard =
    !hasPayloadDrivenExecution &&
    effectiveProposalFinalized &&
    (!effectiveProposalExecuted || currentStep.action === "execute_proposal" || executeRuntime.status !== "idle" || effectiveProposalExecuted);
  const activeActionAnchorId = getActionAnchorId(currentStep.action);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const supportedHashes = new Set([
      "#proposal-review-action",
      "#commit-vote-action",
      "#reveal-vote-action",
      "#finalize-proposal-action",
      "#execute-proposal-action",
    ]);
    const requestedHash = window.location.hash;
    if (!supportedHashes.has(requestedHash)) return;

    let attempts = 0;
    let timeoutId: number | undefined;

    const resolveTargetId = () => {
      if (requestedHash === "#proposal-review-action") {
        return activeActionAnchorId;
      }
      return requestedHash.slice(1);
    };

    const scrollToAction = () => {
      const target = document.getElementById(resolveTargetId()) ?? document.getElementById("govern-current-step");
      if (target) {
        target.scrollIntoView({ block: "start" });
        return;
      }

      if (attempts >= 8) return;
      attempts += 1;
      timeoutId = window.setTimeout(scrollToAction, 120);
    };

    timeoutId = window.setTimeout(scrollToAction, 80);

    return () => {
      if (timeoutId) {
        window.clearTimeout(timeoutId);
      }
    };
  }, [activeActionAnchorId, showCommitCard, showExecuteCard, showFinalizeCard, showProposalCard, showRevealCard]);

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
        authority: publicKey.toBase58(),
        governanceMint: bootstrap.governanceMint.toBase58(),
      });

      const signature = await sendTransaction(bootstrap.transaction, connection, {
        preflightCommitment: "confirmed",
        signers: [bootstrap.mintSigner],
      });

      await awaitLiveSignatureOnCluster({ connection, signature });

      createDao({
        address: bootstrap.dao.toBase58(),
        authority: publicKey.toBase58(),
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
        authority: publicKey.toBase58(),
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
    if (!activeLiveDaoRuntime?.address) {
      setCreateProposalRuntime({
        status: "error",
        message: liveDaoWalletMismatch
          ? "The current wallet does not own the live DAO in this session. Reset the session and bootstrap a fresh DAO from this wallet."
          : "Create the DAO live first so the web flow has a real DAO address to target.",
      });
      return;
    }
    if (activeLiveDaoRuntime.authority && activeLiveDaoRuntime.authority !== publicKey.toBase58()) {
      setCreateProposalRuntime({
        status: "error",
        message:
          "This live DAO was created by another wallet. Reconnect the creator wallet or reset the session and bootstrap a new DAO from the current wallet first.",
      });
      return;
    }
    if (proposalTreasuryDraft.error) {
      setCreateProposalRuntime({
        status: "error",
        message: proposalTreasuryDraft.error,
      });
      return;
    }

    try {
      setCreateProposalRuntime({
        status: "submitting",
        message: proposalTreasuryDraft.action
          ? "Preparing live treasury proposal transaction for wallet signature..."
          : "Preparing live proposal transaction for wallet signature...",
      });

      const governanceHolder = await fetchGovernanceHolderSnapshot({
        connection,
        daoAddress: new PublicKey(activeLiveDaoRuntime.address),
        holder: publicKey,
      });
      if (governanceHolder.rawAmount <= BigInt(0)) {
        throw new Error(
          "The connected wallet does not hold governance tokens for this DAO. Reconnect the wallet that created the DAO, or reset the session and bootstrap a new DAO from this wallet.",
        );
      }

      const proposalSubmission = await buildCreateProposalTransaction({
        proposer: publicKey,
        connection,
        daoAddress: new PublicKey(activeLiveDaoRuntime.address),
        title: proposalTitle.trim(),
        description: `${proposalTitle.trim()} submitted from the live web governance surface.`,
        treasuryAction: proposalTreasuryDraft.action,
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

      await awaitLiveSignatureOnCluster({ connection, signature });

      createProposal({
        address: proposalSubmission.proposal.toBase58(),
        signature,
      });
      recordLog(
        "Proposal submitted",
        `${proposalTitle.trim()} · ${proposalSubmission.proposal.toBase58()} · ${signature}`,
      );
      if (proposalTreasuryDraft.action) {
        recordLog(
          "Treasury action attached",
          proposalTreasuryDraft.action.actionType === "SendToken"
            ? `${proposalTreasuryAmountSol.trim()} raw units of ${proposalTreasuryTokenMint.trim()} -> ${proposalTreasuryRecipient.trim()}`
            : `${proposalTreasuryAmountSol.trim()} SOL -> ${proposalTreasuryRecipient.trim()}`,
        );
      }
      recordLog(
        "Proposal DAO lane",
        `${proposalSubmission.dao.toBase58()} · governance mint ${proposalSubmission.governanceMint.toBase58()} · proposer ATA ${proposalSubmission.proposerTokenAccount.toBase58()}`,
      );

      setCreateProposalRuntime({
        status: "success",
        message: proposalTreasuryDraft.action
          ? "Treasury proposal submitted to devnet from the web wallet flow."
          : "Proposal submitted to devnet from the web wallet flow.",
        proposalAddress: proposalSubmission.proposal.toBase58(),
        signature,
      });
    } catch (error) {
      const message = describeWalletActionError(
        error,
        "Web wallet proposal submit failed before confirmation.",
      );
      setCreateProposalRuntime({
        status: "error",
        message,
      });
      recordLog("Proposal submit failed", message);
    }
  }

  async function submitCommitVoteLive() {
    if (!publicKey || !activeLiveDaoRuntime?.address || !activeLiveProposalAddress) {
      setCommitVoteRuntime({
        status: "error",
        message: liveDaoWalletMismatch
          ? "The current wallet does not own the live DAO in this session. Reset the session and bootstrap a fresh DAO from this wallet."
          : "Create the DAO and proposal live first so commit has a real devnet lane to target.",
      });
      return;
    }

    try {
      setCommitVoteRuntime({
        status: "submitting",
        message: "Preparing commit transaction and sealing a fresh 32-byte reveal salt...",
      });

      const governanceHolder = await fetchGovernanceHolderSnapshot({
        connection,
        daoAddress: new PublicKey(activeLiveDaoRuntime.address),
        holder: publicKey,
      });
      if (governanceHolder.rawAmount <= BigInt(0)) {
        throw new Error(
          "The connected wallet does not hold governance tokens for this DAO. Reconnect the governance holder wallet before committing a vote.",
        );
      }

      const proposalAddress = new PublicKey(activeLiveProposalAddress);
      const proposalDetails = await fetchProposalAccountDetails(connection, proposalAddress);
      const nowTs = Math.floor(Date.now() / 1000);
      if (nowTs >= proposalDetails.votingEnd) {
        throw new Error("Voting window already closed for the live proposal. Commit is no longer allowed.");
      }

      const salt = randomSalt32();
      const vote = voteChoice === "Approve";
      const commitment = await computeProposalCommitment(vote, salt, proposalAddress, publicKey);
      const commitSubmission = await buildCommitVoteTransaction({
        commitment,
        connection,
        daoAddress: new PublicKey(activeLiveDaoRuntime.address),
        proposalAddress,
        voter: publicKey,
      });

      setCommitVoteRuntime({
        status: "submitting",
        message: "Awaiting wallet signature for the live commit transaction...",
        commitmentHex: toHex(commitment),
        saltHex: toHex(salt),
      });

      const signature = await sendTransaction(commitSubmission.transaction, connection, {
        preflightCommitment: "confirmed",
      });

      await awaitLiveSignatureOnCluster({ connection, signature });

      commitVote({
        commitmentHex: toHex(commitment),
        commitSignature: signature,
        proposalAddress: proposalAddress.toBase58(),
        saltHex: toHex(salt),
        voteChoice,
      });
      recordLog("Vote commitment submitted", `${proposalAddress.toBase58()} · ${voteChoice} · ${signature}`);

      setCommitVoteRuntime({
        status: "success",
        message: "Commit submitted live on devnet. Preserve the reveal salt before moving to reveal.",
        commitmentHex: toHex(commitment),
        saltHex: toHex(salt),
        signature,
      });
    } catch (error) {
      setCommitVoteRuntime({
        status: "error",
        message: describeWalletActionError(error, "Commit vote failed before confirmation."),
      });
    }
  }

  async function submitRevealVoteLive() {
    if (!publicKey || !liveVoteRuntime?.saltHex || !activeLiveProposalAddress) {
      setRevealVoteRuntime({
        status: "error",
        message: "Commit live first so reveal has the stored salt and proposal address.",
      });
      return;
    }

    try {
      setRevealVoteRuntime({
        status: "submitting",
        message: "Preparing live reveal transaction from the stored commitment preimage...",
      });

      const proposalAddress = new PublicKey(activeLiveProposalAddress);
      const proposalDetails = await fetchProposalAccountDetails(connection, proposalAddress);
      const nowTs = Math.floor(Date.now() / 1000);
      if (nowTs < proposalDetails.votingEnd) {
        throw new Error("Voting is still open. Reveal starts only after the commit window closes.");
      }
      if (nowTs >= proposalDetails.revealEnd) {
        throw new Error("Reveal window already closed for this live proposal.");
      }

      const saltBytes = Uint8Array.from(Buffer.from(liveVoteRuntime.saltHex, "hex"));
      const revealSubmission = await buildRevealVoteTransaction({
        connection,
        proposalAddress,
        salt: saltBytes,
        vote: liveVoteRuntime.voteChoice === "Approve",
        voter: publicKey,
      });

      setRevealVoteRuntime({
        status: "submitting",
        message: "Awaiting wallet signature for the live reveal transaction...",
      });

      const signature = await sendTransaction(revealSubmission.transaction, connection, {
        preflightCommitment: "confirmed",
      });

      await awaitLiveSignatureOnCluster({ connection, signature });

      revealVote({
        proposalAddress: proposalAddress.toBase58(),
        revealSignature: signature,
        saltHex: liveVoteRuntime.saltHex,
        voteChoice: liveVoteRuntime.voteChoice,
      });
      recordLog("Vote reveal submitted", `${proposalAddress.toBase58()} · ${liveVoteRuntime.voteChoice} · ${signature}`);

      setRevealVoteRuntime({
        status: "success",
        message: "Reveal submitted live on devnet from the stored vote preimage.",
        signature,
      });
    } catch (error) {
      setRevealVoteRuntime({
        status: "error",
        message: describeWalletActionError(error, "Reveal vote failed before confirmation."),
      });
    }
  }

  async function submitFinalizeProposalLive() {
    if (!publicKey || !activeLiveDaoRuntime?.address || !activeLiveProposalAddress) {
      setFinalizeRuntime({
        status: "error",
        message: liveDaoWalletMismatch
          ? "The current wallet does not own the live DAO in this session. Reset the session and bootstrap a fresh DAO from this wallet."
          : "Create and track a live proposal first so finalize has a real DAO/proposal lane to target.",
      });
      return;
    }

    try {
      setFinalizeRuntime({
        status: "submitting",
        message: "Preparing live finalize transaction for the current proposal lane...",
      });

      const proposalAddress = new PublicKey(activeLiveProposalAddress);
      const proposalDetails = await fetchProposalAccountDetails(connection, proposalAddress);
      const nowTs = Math.floor(Date.now() / 1000);
      if (nowTs < proposalDetails.revealEnd) {
        throw new Error("Reveal window is still open. Finalize becomes valid only after reveal_end.");
      }

      const finalizeSubmission = await buildFinalizeProposalTransaction({
        connection,
        daoAddress: new PublicKey(activeLiveDaoRuntime.address),
        finalizer: publicKey,
        proposalAddress,
      });

      setFinalizeRuntime({
        status: "submitting",
        message: "Awaiting wallet signature for the live finalize transaction...",
      });

      const signature = await sendTransaction(finalizeSubmission.transaction, connection, {
        preflightCommitment: "confirmed",
      });

      await awaitLiveSignatureOnCluster({ connection, signature });

      finalizeProposal(signature);
      recordLog("Proposal finalized live", `${proposalAddress.toBase58()} · ${signature}`);

      setFinalizeRuntime({
        status: "success",
        message: "Finalize submitted live on devnet for the current proposal lane.",
        signature,
      });
    } catch (error) {
      setFinalizeRuntime({
        status: "error",
        message: describeWalletActionError(error, "Finalize proposal failed before confirmation."),
      });
    }
  }

  async function submitExecuteProposalLive() {
    if (!publicKey || !activeLiveDaoRuntime?.address || !activeLiveProposalAddress) {
      setExecuteRuntime({
        status: "error",
        message: liveDaoWalletMismatch
          ? "The current wallet does not own the live DAO in this session. Reset the session and bootstrap a fresh DAO from this wallet."
          : "Create, finalize, and keep a live DAO/proposal lane first so execute has a real target.",
      });
      return;
    }

    try {
      setExecuteRuntime({
        status: "submitting",
        message: "Preparing execute transaction for the current live proposal lane...",
      });

      const proposalAddress = new PublicKey(activeLiveProposalAddress);
      const proposalDetails = await fetchProposalAccountDetails(connection, proposalAddress);
      const nowTs = Math.floor(Date.now() / 1000);

      if (proposalDetails.status !== "Passed") {
        throw new Error("Only passed proposals can execute. Finalize the live proposal first and re-check its outcome.");
      }
      if (proposalDetails.isExecuted) {
        throw new Error("This live proposal is already executed on devnet.");
      }
      if (nowTs < proposalDetails.executionUnlocksAt) {
        throw new Error("Execution timelock is still active for this live proposal.");
      }
      if (
        proposalDetails.treasuryAction &&
        proposalDetails.treasuryAction.actionType !== "SendSol" &&
        proposalDetails.treasuryAction.actionType !== "SendToken"
      ) {
        throw new Error(
          "The current web live execute lane supports standard proposals plus SendSol and SendToken treasury motions. Custom treasury actions still require the richer payout path.",
        );
      }

      const executeSubmission = await buildExecuteProposalTransaction({
        connection,
        daoAddress: new PublicKey(activeLiveDaoRuntime.address),
        executor: publicKey,
        proposalAddress,
        treasuryRecipient: proposalDetails.treasuryAction
          ? new PublicKey(proposalDetails.treasuryAction.recipient)
          : publicKey,
        treasuryTokenMint:
          proposalDetails.treasuryAction?.actionType === "SendToken" && proposalDetails.treasuryAction.tokenMint
            ? new PublicKey(proposalDetails.treasuryAction.tokenMint)
            : null,
      });

      setExecuteRuntime({
        status: "submitting",
        message: "Awaiting wallet signature for the execute transaction...",
      });

      const signature = await sendTransaction(executeSubmission.transaction, connection, {
        preflightCommitment: "confirmed",
      });

      await awaitLiveSignatureOnCluster({ connection, signature });

      executeProposal(signature);
      recordLog("Proposal executed live", `${proposalAddress.toBase58()} · ${signature}`);

      setExecuteRuntime({
        status: "success",
        message:
          proposalDetails.treasuryAction?.actionType === "SendToken"
            ? `Token treasury execute submitted live on devnet. ${proposalDetails.treasuryAction.amountLamports.toString()} raw units of ${proposalDetails.treasuryAction.tokenMint} will settle to ${proposalDetails.treasuryAction.recipient}.`
            : proposalDetails.treasuryAction
              ? `Treasury execute submitted live on devnet. ${proposalDetails.treasuryAction.amountSol} SOL will settle to ${proposalDetails.treasuryAction.recipient}.`
          : "Standard execute submitted live on devnet. This current web proposal lane carries no treasury action, so execute closes the lifecycle without moving treasury funds.",
        signature,
      });
    } catch (error) {
      setExecuteRuntime({
        status: "error",
        message: describeWalletActionError(error, "Execute proposal failed before confirmation."),
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
    if (activeAction === "commit_vote") {
      await submitCommitVoteLive();
      return;
    }
    if (activeAction === "reveal_vote") {
      await submitRevealVoteLive();
      return;
    }
    if (activeAction === "finalize_proposal") {
      await submitFinalizeProposalLive();
      return;
    }
    if (activeAction === "execute_proposal" && !hasPayloadDrivenExecution) {
      await submitExecuteProposalLive();
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
      <Card className="border-white/10 bg-[linear-gradient(180deg,rgba(10,16,32,0.94),rgba(7,11,23,0.98))]">
        <CardHeader className="space-y-3 pb-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="text-[11px] uppercase tracking-[0.28em] text-cyan-200/72">Guided Devnet flow</div>
              <CardTitle className="mt-2 text-2xl sm:text-3xl">Run the whole governance cycle without leaving the product</CardTitle>
            </div>
            <Badge variant="success">User-first wallet lane</Badge>
          </div>
          <p className="max-w-2xl text-sm leading-7 text-white/56">
            Start with the next action only. Advanced diagnostics and payload continuity stay behind the advanced toggle.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
          <div
            id="govern-current-step"
            className="scroll-mt-28 rounded-[28px] border border-cyan-300/16 bg-[linear-gradient(180deg,rgba(11,24,41,0.92),rgba(7,14,25,0.98))] p-5 md:col-span-2"
          >
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="max-w-2xl">
                <div className="text-[11px] uppercase tracking-[0.24em] text-cyan-100/76">Do this now · step {currentStep.number}</div>
                <div className="mt-2 text-xl font-semibold text-white sm:text-2xl">{currentStep.title}</div>
                <p className="mt-2 text-sm leading-7 text-white/58">{currentStep.description}</p>
              </div>
              {currentStep.action ? (
                <Button
                  size="lg"
                  className="min-w-[220px] justify-between"
                  onClick={() => currentStep.action && openReview(currentStep.action)}
                  disabled={
                    (currentStep.action === "initialize_dao" && !canCreateDao) ||
                    (currentStep.action === "create_proposal" && !canSubmitLiveProposal) ||
                    (currentStep.action === "commit_vote" && !canCommitLive) ||
                    (currentStep.action === "reveal_vote" && !canRevealLive) ||
                    (currentStep.action === "finalize_proposal" && !canFinalizeLive) ||
                    (currentStep.action === "execute_proposal" && !canExecuteLive)
                  }
                >
                  {currentStep.title}
                  <ChevronRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button size="lg" variant="secondary" onClick={handleResetSession}>
                  Start a new run
                </Button>
              )}
            </div>
            <div className="mt-4 flex flex-wrap gap-3">
              <Button
                variant="ghost"
                className="justify-between rounded-2xl text-white/72"
                onClick={handleResetSession}
              >
                Reset this run
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button
                variant="secondary"
                className="justify-between rounded-2xl"
                onClick={() => setShowAdvanced((current) => !current)}
              >
                {showAdvanced ? "Hide advanced" : "Show advanced"}
                <ChevronRight className={cn("h-4 w-4 transition", showAdvanced ? "rotate-90" : "")} />
              </Button>
            </div>
            {showAdvanced ? (
              <div className="mt-4 flex flex-wrap gap-2">
                {[
                  { label: "Connect", done: connected },
                  { label: "DAO", done: effectiveDaoCreated },
                  { label: "Proposal", done: effectiveProposalCreated },
                  { label: "Commit", done: effectiveVoteCommitted },
                  { label: "Reveal", done: effectiveVoteRevealed },
                  { label: "Finalize", done: effectiveProposalFinalized },
                  { label: "Execute", done: effectiveProposalExecuted },
                ].map(({ label, done }, index) => (
                  <div
                    key={label}
                    className={cn(
                      "rounded-full border px-3 py-1.5 text-xs uppercase tracking-[0.16em]",
                      done
                        ? "border-emerald-300/22 bg-emerald-300/[0.12] text-emerald-100"
                        : index === 0 && !connected
                          ? "border-cyan-300/24 bg-cyan-300/[0.12] text-cyan-100"
                          : "border-white/10 bg-black/20 text-white/46",
                    )}
                  >
                    {label}
                  </div>
                ))}
              </div>
            ) : null}
          </div>
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

          {hasPayloadDrivenExecution ? (
            <div className="rounded-[24px] border border-amber-300/18 bg-amber-300/[0.08] p-5 md:col-span-2">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="max-w-3xl">
                  <div className="text-[11px] uppercase tracking-[0.24em] text-amber-100/80">Service continuity lane detected</div>
                  <div className="mt-2 text-base font-medium text-white">You are viewing a governed service payload, not just the normal proposal form.</div>
                  <div className="mt-2 text-sm leading-7 text-white/64">
                    If you want the normal DAO proposal flow, switch back to a clean govern run. If you want to inspect the governed service request, open advanced and use the payload controls there.
                  </div>
                </div>
                <div className="flex flex-wrap gap-3">
                  <Button size="sm" onClick={handleResetSession}>
                    Return to normal govern flow
                  </Button>
                  <Button size="sm" variant="secondary" onClick={() => setShowAdvanced(true)}>
                    Inspect payload lane
                  </Button>
                </div>
              </div>
            </div>
          ) : null}

          {showAdvanced && handoff?.proposalReview ? (
            <div className="rounded-[24px] border border-cyan-300/16 bg-cyan-300/[0.08] p-5 md:col-span-2">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="text-[11px] uppercase tracking-[0.24em] text-cyan-100/80">Execution continuity</div>
                  <div className="mt-2 text-base font-medium text-white">
                    {handoff.proposalId} · {handoff.proposalTitle}
                  </div>
                  <div className="mt-2 text-sm leading-7 text-white/62">
                    The selected proposal is staged directly into the govern flow with execution target, treasury boundary, and proof route already attached.
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

          {showAdvanced && executionIntent ? (
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
                    href={executionIntent.requestDelivery?.deliveryRoute ?? (continuityQuery ? `/govern?${continuityQuery}#proposal-review-action` : "/govern#proposal-review-action")}
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

          {showDaoCard ? (
          <div className="rounded-[24px] border border-white/10 bg-white/[0.03] p-5 md:col-span-2">
            <div className="flex items-center gap-3">
              <FolderPlus className="h-4 w-4 text-emerald-300" />
              <div className="text-base font-medium text-white">Step 1 · Create DAO</div>
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
                {createDaoRuntime.authority ? (
                  <div className="mt-1 break-all text-xs text-white/55">
                    Wallet: {createDaoRuntime.authority}
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
          ) : null}

          {showProposalCard ? (
          <div id="proposal-review-action" className="scroll-mt-28 rounded-[24px] border border-white/10 bg-white/[0.03] p-5 md:col-span-2">
            <div className="flex items-center gap-3">
              <FilePlus2 className="h-4 w-4 text-cyan-300" />
              <div className="text-base font-medium text-white">Step 2 · Create Proposal</div>
            </div>
            <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
              <div>
                <input
                  value={proposalTitle}
                  onChange={(event) => setProposalTitle(event.target.value)}
                  className="h-11 w-full rounded-2xl border border-white/10 bg-black/20 px-4 text-sm text-white outline-none placeholder:text-white/28"
                  placeholder="Proposal title"
                />
                <div className="mt-3 flex flex-wrap gap-2">
                  {[
                    ["standard", "Standard"],
                    ["sol", "Send SOL"],
                    ["token", "Send Token"],
                  ].map(([mode, label]) => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => setProposalTreasuryMode(mode as "standard" | "sol" | "token")}
                      className={cn(
                        "rounded-full border px-3 py-1.5 text-xs uppercase tracking-[0.16em] transition",
                        proposalTreasuryMode === mode
                          ? "border-cyan-300/30 bg-cyan-300/10 text-cyan-100"
                          : "border-white/10 bg-black/20 text-white/60",
                      )}
                    >
                      {label}
                    </button>
                  ))}
                </div>
                {proposalTreasuryMode !== "standard" ? (
                  <>
                    <input
                      value={proposalTreasuryRecipient}
                      onChange={(event) => setProposalTreasuryRecipient(event.target.value)}
                      className="mt-3 h-11 w-full rounded-2xl border border-white/10 bg-black/20 px-4 text-sm text-white outline-none placeholder:text-white/28"
                      placeholder="Treasury recipient wallet"
                    />
                    <input
                      value={proposalTreasuryAmountSol}
                      onChange={(event) => setProposalTreasuryAmountSol(event.target.value)}
                      className="mt-3 h-11 w-full rounded-2xl border border-white/10 bg-black/20 px-4 text-sm text-white outline-none placeholder:text-white/28"
                      placeholder={
                        proposalTreasuryMode === "token"
                          ? "Token amount in raw units"
                          : "Treasury amount in SOL"
                      }
                    />
                    {proposalTreasuryMode === "token" ? (
                      <input
                        value={proposalTreasuryTokenMint}
                        onChange={(event) => setProposalTreasuryTokenMint(event.target.value)}
                        className="mt-3 h-11 w-full rounded-2xl border border-white/10 bg-black/20 px-4 text-sm text-white outline-none placeholder:text-white/28"
                        placeholder="Token mint"
                      />
                    ) : null}
                  </>
                ) : null}
                <p className="mt-3 text-sm leading-7 text-white/58">
                  {proposalTreasuryMode === "standard"
                    ? "Standard proposals carry no treasury movement. Switch to Send SOL or Send Token only when you want a treasury action."
                    : proposalTreasuryMode === "token"
                      ? "SendToken proposals use a recipient wallet plus token mint. Amount is currently entered in raw token units."
                      : "SendSol proposals move SOL from the treasury to the specified recipient when executed."}
                </p>
                {proposalTreasuryDraft.error ? (
                  <div className="mt-3 rounded-2xl border border-rose-300/20 bg-rose-300/[0.08] p-3 text-sm leading-7 text-rose-100/82">
                    {proposalTreasuryDraft.error}
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
                ) : liveDaoWalletMismatch ? (
                  <div className="mt-4 rounded-2xl border border-amber-300/20 bg-amber-300/[0.08] p-3 text-sm leading-7 text-amber-100/82">
                    <div>This session is carrying a DAO created by another wallet.</div>
                    <div className="mt-2 text-white/72">Reset once, then bootstrap a DAO from the currently connected wallet.</div>
                    <Button className="mt-3" onClick={handleResetSession} size="sm" variant="secondary">
                      Reset to current wallet
                    </Button>
                  </div>
                ) : liveProposalRuntime ? (
                  <div className="mt-4 rounded-2xl border border-emerald-300/18 bg-emerald-300/[0.08] p-3 text-sm leading-7 text-emerald-100/82">
                    <div>Last live proposal submit cleared from the web wallet flow.</div>
                    <div className="mt-2 break-all text-white/70">Proposal {liveProposalRuntime.address}</div>
                    <div className="mt-1 break-all text-white/60">Signature {liveProposalRuntime.signature}</div>
                  </div>
                ) : null}
              </div>

              <div className="space-y-3">
                <div className="rounded-[22px] border border-cyan-300/16 bg-cyan-300/[0.08] p-4 text-sm text-white/72">
                  <div className="text-[11px] uppercase tracking-[0.2em] text-cyan-100/72">Live DAO lane</div>
                  {activeLiveDaoRuntime?.address ? (
                    <>
                      <div className="mt-2 break-all text-white">{activeLiveDaoRuntime.address}</div>
                      <div className="mt-1 break-all text-white/62">Governance mint {activeLiveDaoRuntime.governanceMint}</div>
                      {activeLiveDaoRuntime.authority ? (
                        <div className="mt-1 break-all text-white/52">Creator wallet {activeLiveDaoRuntime.authority}</div>
                      ) : null}
                    </>
                  ) : liveDaoWalletMismatch && liveDaoRuntime?.address ? (
                    <>
                      <div className="mt-2 text-amber-100">Live DAO belongs to another wallet.</div>
                      <div className="mt-2 break-all text-white/72">{liveDaoRuntime.address}</div>
                      {liveDaoRuntime.authority ? (
                        <div className="mt-1 break-all text-white/52">Creator wallet {liveDaoRuntime.authority}</div>
                      ) : null}
                    </>
                  ) : (
                    <div className="mt-2 text-white/62">Create the DAO first so proposal submit can target a real on-chain lane.</div>
                  )}
                </div>

                <div className="rounded-[22px] border border-white/10 bg-black/20 p-4 text-sm leading-7 text-white/62">
                  <div className="text-[11px] uppercase tracking-[0.2em] text-white/38">Proposal mode</div>
                  <div className="mt-2 text-white">
                    {proposalTreasuryMode === "standard"
                      ? "Standard governance proposal"
                      : proposalTreasuryMode === "token"
                        ? "Treasury motion · Send token"
                        : "Treasury motion · Send SOL"}
                  </div>
                  {proposalTreasuryDraft.action ? (
                    <div className="mt-2 text-white/62">
                      {proposalTreasuryDraft.action.actionType === "SendToken"
                        ? `${proposalTreasuryAmountSol.trim()} raw units of ${proposalTreasuryTokenMint.trim()} to ${proposalTreasuryRecipient.trim()}`
                        : `${proposalTreasuryAmountSol.trim()} SOL to ${proposalTreasuryRecipient.trim()}`}
                    </div>
                  ) : (
                    <div className="mt-2 text-white/52">
                      Keep this as Standard if you only want a normal governance proposal.
                    </div>
                  )}
                </div>

                <div className="rounded-[22px] border border-white/10 bg-black/20 p-4 text-sm leading-7 text-white/62">
                  <div className="text-[11px] uppercase tracking-[0.2em] text-white/38">Before you click</div>
                  <div className="mt-2 text-white/62">
                    Use the same connected wallet that created the live DAO. The review modal will appear first, then Solflare opens for signature.
                  </div>
                </div>
              </div>
            </div>
          </div>
          ) : null}

          {showAdvanced && hasPayloadDrivenExecution ? (
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
                  <Link href={payloadDrivenRequest?.deliveryRoute ?? (continuityQuery ? `/govern?${continuityQuery}#proposal-review-action` : "/govern#proposal-review-action")} className={cn(buttonVariants({ size: "sm", variant: "secondary" }), "justify-between")}>
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
          ) : null}

          {showCommitCard ? (
          <div id="commit-vote-action" className="scroll-mt-28 rounded-[24px] border border-white/10 bg-white/[0.03] p-5 md:col-span-2">
                <div className="flex items-center gap-3">
                  <Vote className="h-4 w-4 text-fuchsia-300" />
                  <div className="text-base font-medium text-white">Step 3 · Commit Vote</div>
                </div>
                {!hasLiveCommitLane ? (
                  <p className="mt-4 text-sm leading-7 text-amber-100/70">
                    Live commit unlocks only after a live DAO bootstrap and live proposal submit. The web surface will not fake a commit lane without a real devnet proposal address.
                  </p>
                ) : (
                  <div className="mt-4 rounded-2xl border border-fuchsia-300/18 bg-fuchsia-300/[0.08] p-3 text-sm text-white/72">
                    <div className="text-[11px] uppercase tracking-[0.2em] text-fuchsia-100/72">Live proposal lane</div>
                    <div className="mt-2 break-all text-white">{activeLiveProposalAddress}</div>
                    <div className="mt-1 text-white/62">Vote choice {voteChoice}</div>
                  </div>
                )}
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
                <Button className="mt-4 w-full" disabled={!canCommitLive} onClick={() => openReview("commit_vote")}>
                  {commitVoteRuntime.status === "submitting" ? "Awaiting wallet..." : "Commit Vote"}
                </Button>
                {commitVoteRuntime.status !== "idle" ? (
                  <div
                    className={cn(
                      "mt-4 rounded-2xl border p-3 text-sm leading-7",
                      commitVoteRuntime.status === "error"
                        ? "border-rose-300/20 bg-rose-300/[0.08] text-rose-100/82"
                        : commitVoteRuntime.status === "success"
                          ? "border-emerald-300/18 bg-emerald-300/[0.08] text-emerald-100/82"
                          : "border-fuchsia-300/18 bg-fuchsia-300/[0.08] text-fuchsia-100/82",
                    )}
                  >
                    <div>{commitVoteRuntime.message}</div>
                    {commitVoteRuntime.commitmentHex ? (
                      <div className="mt-2 break-all text-white/70">Commitment {commitVoteRuntime.commitmentHex}</div>
                    ) : null}
                    {commitVoteRuntime.saltHex ? (
                      <div className="mt-1 break-all text-white/60">Reveal salt {commitVoteRuntime.saltHex}</div>
                    ) : null}
                    {commitVoteRuntime.signature ? (
                      <div className="mt-1 break-all text-white/60">Signature {commitVoteRuntime.signature}</div>
                    ) : null}
                  </div>
                ) : liveVoteRuntime ? (
                  <div className="mt-4 rounded-2xl border border-emerald-300/18 bg-emerald-300/[0.08] p-3 text-sm leading-7 text-emerald-100/82">
                    <div>Last live commit is preserved in the session for the reveal lane.</div>
                    <div className="mt-2 break-all text-white/70">Commitment {liveVoteRuntime.commitmentHex}</div>
                    <div className="mt-1 break-all text-white/60">Salt {liveVoteRuntime.saltHex}</div>
                    {liveVoteRuntime.commitSignature ? (
                      <div className="mt-1 break-all text-white/60">Signature {liveVoteRuntime.commitSignature}</div>
                    ) : null}
                  </div>
                ) : null}
              </div>
          ) : null}

          {showRevealCard ? (
          <div id="reveal-vote-action" className="scroll-mt-28 rounded-[24px] border border-white/10 bg-white/[0.03] p-5 md:col-span-2">
                <div className="flex items-center gap-3">
                  <ShieldCheck className="h-4 w-4 text-emerald-300" />
                  <div className="text-base font-medium text-white">Step 4 · Reveal Vote</div>
                </div>
                {!liveVoteRuntime?.saltHex ? (
                  <p className="mt-4 text-sm leading-7 text-amber-100/70">
                    Reveal uses the stored live commit salt. Until a live commit succeeds, reveal stays locked instead of pretending it can proceed.
                  </p>
                ) : (
                  <div className="mt-4 rounded-2xl border border-emerald-300/18 bg-emerald-300/[0.08] p-3 text-sm text-white/72">
                    <div className="text-[11px] uppercase tracking-[0.2em] text-emerald-100/72">Stored reveal preimage</div>
                    <div className="mt-2 break-all text-white">Proposal {liveVoteRuntime.proposalAddress}</div>
                    <div className="mt-1 break-all text-white/62">Salt {liveVoteRuntime.saltHex}</div>
                    {liveProposalWindow ? (
                      <>
                        <div className="mt-2 text-white/72">
                          Reveal opens at {formatRuntimeWindow(liveProposalWindow.votingEnd)}
                        </div>
                        <div className="mt-1 text-white/62">
                          {nowSeconds < liveProposalWindow.votingEnd
                            ? `Commit window still open · ${formatRemainingSeconds(liveProposalWindow.votingEnd - nowSeconds)} remaining`
                            : nowSeconds >= liveProposalWindow.revealEnd
                              ? "Reveal window already closed"
                              : `Reveal window live until ${formatRuntimeWindow(liveProposalWindow.revealEnd)}`}
                        </div>
                      </>
                    ) : null}
                  </div>
                )}
                <Button className="mt-4 w-full" disabled={!canRevealLive} onClick={() => openReview("reveal_vote")} variant="secondary">
                  {revealVoteRuntime.status === "submitting" ? "Awaiting wallet..." : "Reveal Vote"}
                </Button>
                {revealVoteRuntime.status !== "idle" ? (
                  <div
                    className={cn(
                      "mt-4 rounded-2xl border p-3 text-sm leading-7",
                      revealVoteRuntime.status === "error"
                        ? "border-rose-300/20 bg-rose-300/[0.08] text-rose-100/82"
                        : revealVoteRuntime.status === "success"
                          ? "border-emerald-300/18 bg-emerald-300/[0.08] text-emerald-100/82"
                          : "border-cyan-300/18 bg-cyan-300/[0.08] text-cyan-100/82",
                    )}
                  >
                    <div>{revealVoteRuntime.message}</div>
                    {revealVoteRuntime.signature ? (
                      <div className="mt-2 break-all text-white/60">Signature {revealVoteRuntime.signature}</div>
                    ) : null}
                  </div>
                ) : liveVoteRuntime?.revealSignature ? (
                  <div className="mt-4 rounded-2xl border border-emerald-300/18 bg-emerald-300/[0.08] p-3 text-sm leading-7 text-emerald-100/82">
                    <div>Last live reveal cleared from this same web lane.</div>
                    <div className="mt-2 break-all text-white/60">Signature {liveVoteRuntime.revealSignature}</div>
                  </div>
                ) : null}
              </div>
          ) : null}

          {showFinalizeCard ? (
          <div id="finalize-proposal-action" className="scroll-mt-28 rounded-[24px] border border-white/10 bg-white/[0.03] p-5 md:col-span-2">
                <div className="flex items-center gap-3">
                  <Flag className="h-4 w-4 text-cyan-300" />
                  <div className="text-base font-medium text-white">Step 5 · Finalize Proposal</div>
                </div>
                {!hasLiveCommitLane ? (
                  <p className="mt-4 text-sm leading-7 text-amber-100/70">
                    Finalize needs the same live DAO and proposal lane used by commit and reveal. It stays blocked until the web flow has a real on-chain proposal to close.
                  </p>
                ) : (
                  <div className="mt-4 rounded-2xl border border-cyan-300/16 bg-cyan-300/[0.08] p-3 text-sm text-white/72">
                    <div className="text-[11px] uppercase tracking-[0.2em] text-cyan-100/72">Finalize lane</div>
                    <div className="mt-2 break-all text-white">DAO {liveDaoRuntime?.address}</div>
                    <div className="mt-1 break-all text-white/62">Proposal {activeLiveProposalAddress}</div>
                  </div>
                )}
                <Button className="mt-4 w-full" disabled={!canFinalizeLive} onClick={() => openReview("finalize_proposal")} variant="secondary">
                  {finalizeRuntime.status === "submitting" ? "Awaiting wallet..." : "Finalize Proposal"}
                </Button>
                {finalizeRuntime.status !== "idle" ? (
                  <div
                    className={cn(
                      "mt-4 rounded-2xl border p-3 text-sm leading-7",
                      finalizeRuntime.status === "error"
                        ? "border-rose-300/20 bg-rose-300/[0.08] text-rose-100/82"
                        : finalizeRuntime.status === "success"
                          ? "border-emerald-300/18 bg-emerald-300/[0.08] text-emerald-100/82"
                          : "border-cyan-300/18 bg-cyan-300/[0.08] text-cyan-100/82",
                    )}
                  >
                    <div>{finalizeRuntime.message}</div>
                    {finalizeRuntime.signature ? (
                      <div className="mt-2 break-all text-white/60">Signature {finalizeRuntime.signature}</div>
                    ) : null}
                  </div>
                ) : liveVoteRuntime?.finalizeSignature ? (
                  <div className="mt-4 rounded-2xl border border-emerald-300/18 bg-emerald-300/[0.08] p-3 text-sm leading-7 text-emerald-100/82">
                    <div>Last live finalize cleared from the current proposal lane.</div>
                    <div className="mt-2 break-all text-white/60">Signature {liveVoteRuntime.finalizeSignature}</div>
                  </div>
                ) : null}
              </div>
          ) : null}

          {showExecuteCard ? (
          <div id="execute-proposal-action" className="scroll-mt-28 rounded-[24px] border border-white/10 bg-white/[0.03] p-5 md:col-span-2">
                <div className="flex items-center gap-3">
                  <Play className="h-4 w-4 text-amber-300" />
                  <div className="text-base font-medium text-white">Step 6 · Execute Proposal</div>
                </div>
                {!hasLiveCommitLane ? (
                  <p className="mt-4 text-sm leading-7 text-amber-100/70">
                    Execute unlocks only after the same live DAO/proposal lane reaches finalize. Without that lane, the web surface will not imply that execute can proceed.
                  </p>
                ) : (
                  <div className="mt-4 rounded-2xl border border-amber-300/18 bg-amber-300/[0.08] p-3 text-sm text-white/72">
                    <div className="text-[11px] uppercase tracking-[0.2em] text-amber-100/72">Execute boundary</div>
                    <div className="mt-2 text-white">
                      This current web lane executes standard proposals plus the current live SendSol and SendToken treasury motions. Custom treasury actions still stay on the richer payout path.
                    </div>
                    <div className="mt-1 break-all text-white/62">Proposal {activeLiveProposalAddress}</div>
                  </div>
                )}
                <Button className="mt-4 w-full" disabled={!canExecuteLive} onClick={() => openReview("execute_proposal")} variant="outline">
                  {executeRuntime.status === "submitting" ? "Awaiting wallet..." : "Execute Proposal"}
                </Button>
                {executeRuntime.status !== "idle" ? (
                  <div
                    className={cn(
                      "mt-4 rounded-2xl border p-3 text-sm leading-7",
                      executeRuntime.status === "error"
                        ? "border-rose-300/20 bg-rose-300/[0.08] text-rose-100/82"
                        : executeRuntime.status === "success"
                          ? "border-emerald-300/18 bg-emerald-300/[0.08] text-emerald-100/82"
                          : "border-amber-300/18 bg-amber-300/[0.08] text-amber-100/82",
                    )}
                  >
                    <div>{executeRuntime.message}</div>
                    {executeRuntime.signature ? (
                      <div className="mt-2 break-all text-white/60">Signature {executeRuntime.signature}</div>
                    ) : null}
                  </div>
                ) : liveVoteRuntime?.executeSignature ? (
                  <div className="mt-4 rounded-2xl border border-emerald-300/18 bg-emerald-300/[0.08] p-3 text-sm leading-7 text-emerald-100/82">
                    <div>Last live execute cleared from the current web lane.</div>
                    <div className="mt-2 break-all text-white/60">Signature {liveVoteRuntime.executeSignature}</div>
                  </div>
                ) : null}
              </div>
          ) : null}

          <details className="rounded-[24px] border border-white/10 bg-white/[0.03] p-5 md:col-span-2">
            <summary className="flex cursor-pointer list-none flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <ListChecks className="h-4 w-4 text-cyan-300" />
                <div>
                  <div className="text-base font-medium text-white">Advanced details and logs</div>
                  <div className="mt-1 text-sm text-white/48">Open this only if you want runtime messages, signatures, and diagnostics.</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Link href="/live" className={cn(buttonVariants({ size: "sm", variant: "secondary" }))}>
                  Open activity view
                </Link>
                <ChevronRight className="h-4 w-4 text-white/52" />
              </div>
            </summary>
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
                  Logs appear here after wallet, DAO, proposal, vote, reveal, and execute actions move through the UI.
                </div>
              )}
            </div>
          </details>

          {showAdvanced ? (
            <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
              <OnchainParityPanel action={nextAction} preparedSummary={preparedSummary} compact />

              <div className="rounded-[28px] border border-white/10 bg-white/[0.03] p-5">
                <div className="flex items-center gap-3">
                  <Activity className="h-4 w-4 text-cyan-300" />
                  <div className="text-base font-medium text-white">Advanced routes</div>
                </div>
                <p className="mt-3 text-sm leading-7 text-white/58">
                  Runtime evidence, proof freshness, wallet coverage, and execution health remain available here for operators and reviewers.
                </p>
                <div className="mt-4 flex flex-col gap-3">
                  <Link href="/diagnostics" className={cn(buttonVariants({ size: "sm" }), "justify-between")}>
                    Open diagnostics
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                  <Link href="/proof" className={cn(buttonVariants({ size: "sm", variant: "secondary" }), "justify-between")}>
                    Open proof
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                  <Link href="/services" className={cn(buttonVariants({ size: "sm", variant: "outline" }), "justify-between")}>
                    Open API and pricing
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </div>
          ) : null}
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
