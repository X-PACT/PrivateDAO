import {
  getExecutionSurfaceSnapshot,
  type ExecutionSurfaceSnapshot,
} from "@/lib/devnet-service-metrics";
import { getReadNodeActivationSnapshot } from "@/lib/read-node-activation";
import { getReadNodeHostReadinessSnapshot } from "@/lib/read-node-host-readiness";
import {
  getTreasuryReviewerTruthSnapshot,
  type TreasuryReviewerTruthContext,
} from "@/lib/treasury-reviewer-truth";
import { getReviewerTelemetryTruthSnapshot } from "@/lib/reviewer-telemetry-truth";
import { proposalRegistry } from "@/lib/site-data";

export type WalletFirstServiceActionContext = "start" | "services" | "command-center";

export type WalletFirstServiceAction = {
  slug: "proposal-review" | "payout-route-selection" | "telemetry-inspection";
  title: string;
  summary: string;
  state: string;
  stateDetail: string;
  primaryHref: string;
  primaryLabel: string;
  proofHref: string;
  proofLabel: string;
};

export type ProposalReviewOption = {
  id: string;
  title: string;
  status: string;
  window: string;
  treasury: string;
  summary: string;
  proposalAccount: string | null;
  executionTarget: string;
  evidenceRoute: string;
  amount: number | null;
  amountDisplay: string;
  mintSymbol: string | null;
  mintAddress: string | null;
  recipient: string | null;
  primaryHref: string;
  primaryLabel: string;
  proofHref: string;
  proofLabel: string;
};

export type PayoutRouteOption = {
  slug: "pilot-funding" | "treasury-top-up" | "vendor-payout" | "contributor-payout";
  title: string;
  summary: string;
  routeFocus: string;
  defaultLane: "buyer" | "operator" | "support";
  defaultAssetSymbol: "SOL" | "USDC" | "USDG";
  state: string;
  stateDetail: string;
  primaryHref: string;
  primaryLabel: string;
  proofHref: string;
  proofLabel: string;
};

export type TelemetryInspectorMode = {
  slug: "packet" | "snapshot" | "backend";
  title: string;
  summary: string;
  state: string;
  stateDetail: string;
  primaryHref: string;
  primaryLabel: string;
  proofHref: string;
  proofLabel: string;
};

export type WalletFirstServiceWorkbenchData = {
  actions: WalletFirstServiceAction[];
  proposals: ProposalReviewOption[];
  payouts: PayoutRouteOption[];
  telemetryModes: TelemetryInspectorMode[];
};

function getTreasuryContext(context: WalletFirstServiceActionContext): TreasuryReviewerTruthContext {
  if (context === "services") return "services";
  if (context === "command-center") return "command-center";
  return "dashboard";
}

function getProposalReviewAction(context: WalletFirstServiceActionContext, execution: ExecutionSurfaceSnapshot): WalletFirstServiceAction {
  const localPrimary =
    context === "command-center"
      ? {
          primaryHref: "#proposal-review-action",
          primaryLabel: "Open proposal review lane",
        }
      : {
          primaryHref: "/command-center#proposal-review-action",
          primaryLabel: "Open command-center review lane",
        };

  return {
    slug: "proposal-review",
    title: "Proposal review",
    summary:
      "Stage proposal review from a wallet-signed route, keep the execution boundary explicit, and keep runtime proof one action away.",
    state: execution.proposalFlow.value,
    stateDetail: execution.proposalFlow.detail,
    primaryHref: localPrimary.primaryHref,
    primaryLabel: localPrimary.primaryLabel,
    proofHref: "/proof#judge-runtime-logs",
    proofLabel: "Open runtime proof",
  };
}

function getPayoutRouteAction(context: WalletFirstServiceActionContext): WalletFirstServiceAction {
  const treasury = getTreasuryReviewerTruthSnapshot(getTreasuryContext(context));
  const localPrimary =
    context === "services"
      ? {
          primaryHref: "#payout-route-selection",
          primaryLabel: "Open payout route selection",
        }
      : {
          primaryHref: "/services#payout-route-selection",
          primaryLabel: "Open services payout lane",
        };

  return {
    slug: "payout-route-selection",
    title: "Payout route selection",
    summary:
      "Choose the governed payout corridor from the UI first, then keep treasury packet, custody proof, and the exact blocker in the same decision path.",
    state: treasury.paymentsReadiness,
    stateDetail: `${treasury.exactBlocker} · ${treasury.exactBlockerSummary}`,
    primaryHref: localPrimary.primaryHref,
    primaryLabel: localPrimary.primaryLabel,
    proofHref: treasury.reviewerPacketHref,
    proofLabel: treasury.reviewerPacketLabel,
  };
}

function getTelemetryInspectionAction(context: WalletFirstServiceActionContext): WalletFirstServiceAction {
  const telemetry = getReviewerTelemetryTruthSnapshot();
  const localPrimary =
    context === "services"
      ? {
          primaryHref: "#telemetry-inspection",
          primaryLabel: "Open telemetry inspection",
        }
      : {
          primaryHref: "/analytics#telemetry-inspection",
          primaryLabel: "Open analytics telemetry lane",
        };

  if (context === "command-center") {
    return {
      slug: "telemetry-inspection",
      title: "Telemetry inspection",
      summary:
        "Inspect freshness, indexed proposal coverage, and finalized counts from a reviewer-safe UI lane before deeper diagnostics or backend cutover work.",
      state: telemetry.indexedProposalCount,
      stateDetail: `${telemetry.governanceFinalized} governance finalized · ${telemetry.confidentialFinalized} confidential finalized · ${telemetry.freshnessLabel}`,
      primaryHref: "/analytics#telemetry-inspection",
      primaryLabel: "Open analytics telemetry lane",
      proofHref: telemetry.packetHref,
      proofLabel: telemetry.packetLabel,
    };
  }

  return {
    slug: "telemetry-inspection",
    title: "Telemetry inspection",
    summary:
      "Inspect freshness, indexed proposal coverage, and finalized counts from a reviewer-safe UI lane before deeper diagnostics or backend cutover work.",
    state: telemetry.indexedProposalCount,
    stateDetail: `${telemetry.governanceFinalized} governance finalized · ${telemetry.confidentialFinalized} confidential finalized · ${telemetry.freshnessLabel}`,
    primaryHref: localPrimary.primaryHref,
    primaryLabel: localPrimary.primaryLabel,
    proofHref: telemetry.packetHref,
    proofLabel: telemetry.packetLabel,
  };
}

export function getWalletFirstServiceActions(
  context: WalletFirstServiceActionContext,
): WalletFirstServiceAction[] {
  const execution = getExecutionSurfaceSnapshot();

  return [
    getProposalReviewAction(context, execution),
    getPayoutRouteAction(context),
    getTelemetryInspectionAction(context),
  ];
}

function getProposalReviewOptions(): ProposalReviewOption[] {
  return proposalRegistry.map((proposal) => ({
    id: proposal.id,
    title: proposal.title,
    status: proposal.status,
    window: proposal.window,
    treasury: proposal.treasury,
    summary: proposal.summary,
    proposalAccount: proposal.execution.proposalAccount ?? null,
    executionTarget: proposal.execution.executionTarget,
    evidenceRoute: proposal.execution.txContext.evidenceRoute,
    amount: proposal.execution.amount,
    amountDisplay: proposal.execution.amountDisplay,
    mintSymbol: proposal.execution.mintSymbol,
    mintAddress: proposal.execution.mintAddress,
    recipient: proposal.execution.recipient,
    primaryHref: `/command-center?proposal=${proposal.id}#proposal-review-action`,
    primaryLabel: "Open review lane with this proposal",
    proofHref:
      proposal.status === "Execution ready" || proposal.status === "Executed"
        ? "/documents/live-proof-v3"
        : "/proof#judge-runtime-logs",
    proofLabel:
      proposal.status === "Execution ready" || proposal.status === "Executed"
        ? "Open execution packet"
        : "Open runtime proof",
  }));
}

function getPayoutRouteOptions(
  context: WalletFirstServiceActionContext,
): PayoutRouteOption[] {
  const treasury = getTreasuryReviewerTruthSnapshot(getTreasuryContext(context));

  return [
    {
      slug: "pilot-funding",
      title: "Pilot funding",
      summary:
        "Use the buyer-safe pilot corridor when the story is startup traction, reviewer trust, and fastest commercial onboarding.",
      routeFocus: "Buyer-safe pilot corridor",
      defaultLane: "buyer",
      defaultAssetSymbol: "SOL",
      state: treasury.paymentsReadiness,
      stateDetail: treasury.exactBlockerSummary,
      primaryHref: "/engage?profile=pilot-funding",
      primaryLabel: "Open pilot funding path",
      proofHref: treasury.reviewerPacketHref,
      proofLabel: treasury.reviewerPacketLabel,
    },
    {
      slug: "treasury-top-up",
      title: "Treasury top-up",
      summary:
        "Use the treasury top-up route when the motion is capitalization, runway, or governance-approved funding for live service operations.",
      routeFocus: "Treasury capitalization corridor",
      defaultLane: "buyer",
      defaultAssetSymbol: "SOL",
      state: treasury.paymentsReadiness,
      stateDetail: treasury.exactBlockerSummary,
      primaryHref: "/engage?profile=treasury-top-up",
      primaryLabel: "Open treasury top-up path",
      proofHref: "/services#treasury-reviewer-grade",
      proofLabel: "Open services treasury rail",
    },
    {
      slug: "vendor-payout",
      title: "Vendor payout",
      summary:
        "Use the governed vendor route when the action needs execution visibility, payout discipline, and command-shell traceability.",
      routeFocus: "Operator-visible payout corridor",
      defaultLane: "operator",
      defaultAssetSymbol: "USDC",
      state: treasury.paymentsReadiness,
      stateDetail: treasury.exactBlockerSummary,
      primaryHref: "/engage?profile=vendor-payout",
      primaryLabel: "Open vendor payout path",
      proofHref: "/command-center",
      proofLabel: "Open command-center payout path",
    },
    {
      slug: "contributor-payout",
      title: "Contributor payout",
      summary:
        "Use the contributor route when the payment needs governance context, role discipline, and the same proof continuity as vendor actions.",
      routeFocus: "Governed contributor payout corridor",
      defaultLane: "operator",
      defaultAssetSymbol: "USDC",
      state: treasury.paymentsReadiness,
      stateDetail: treasury.exactBlockerSummary,
      primaryHref: "/engage?profile=contributor-payout",
      primaryLabel: "Open contributor payout path",
      proofHref: "/command-center",
      proofLabel: "Open command-center payout path",
    },
  ];
}

function getTelemetryInspectorModes(
  context: WalletFirstServiceActionContext,
): TelemetryInspectorMode[] {
  const telemetry = getReviewerTelemetryTruthSnapshot();
  const activation = getReadNodeActivationSnapshot(
    context === "services" ? "services" : context === "command-center" ? "command-center" : "proof",
  );
  const host = getReadNodeHostReadinessSnapshot(
    context === "services" ? "services" : context === "command-center" ? "command-center" : "proof",
  );

  return [
    {
      slug: "packet",
      title: "Reviewer packet",
      summary:
        "Stay on the reviewer-safe packet when the goal is freshness, finalized counts, and exported proof with minimal operator context switching.",
      state: telemetry.freshnessLabel,
      stateDetail: `${telemetry.indexedProposalCount} · ${telemetry.governanceFinalized} governance finalized · ${telemetry.confidentialFinalized} confidential finalized`,
      primaryHref: telemetry.packetHref,
      primaryLabel: telemetry.packetLabel,
      proofHref: "/analytics#telemetry-inspection",
      proofLabel: "Open analytics telemetry lane",
    },
    {
      slug: "snapshot",
      title: "Read-node snapshot",
      summary:
        "Switch to snapshot mode when the reviewer or operator needs indexed coverage, confidential coverage, and the current read path in one place.",
      state: activation.activationState,
      stateDetail: `${activation.indexedProposalCount} · ${activation.confidentialCoverage} · ${activation.readPath}`,
      primaryHref: activation.snapshotHref,
      primaryLabel: activation.snapshotLabel,
      proofHref: activation.opsHref,
      proofLabel: activation.opsLabel,
    },
    {
      slug: "backend",
      title: "Backend path",
      summary:
        "Use backend mode when the conversation shifts from packet review to actual hosted service cutover, public health endpoints, and fallback policy.",
      state: host.readinessState,
      stateDetail: `${host.deploymentTarget} · ${host.publicHealthPath} · ${host.publicMetricsPath}`,
      primaryHref: host.deployHref,
      primaryLabel: host.deployLabel,
      proofHref: host.packetHref,
      proofLabel: host.packetLabel,
    },
  ];
}

export function getWalletFirstServiceWorkbenchData(
  context: WalletFirstServiceActionContext,
): WalletFirstServiceWorkbenchData {
  return {
    actions: getWalletFirstServiceActions(context),
    proposals: getProposalReviewOptions(),
    payouts: getPayoutRouteOptions(context),
    telemetryModes: getTelemetryInspectorModes(context),
  };
}
