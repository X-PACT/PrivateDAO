import {
  getExecutionSurfaceSnapshot,
  type ExecutionSurfaceSnapshot,
} from "@/lib/devnet-service-metrics";
import {
  getTreasuryReviewerTruthSnapshot,
  type TreasuryReviewerTruthContext,
} from "@/lib/treasury-reviewer-truth";
import { getReviewerTelemetryTruthSnapshot } from "@/lib/reviewer-telemetry-truth";

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
