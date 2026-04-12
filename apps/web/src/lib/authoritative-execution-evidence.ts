import type { ExecutionSurfaceSnapshot } from "@/lib/devnet-service-metrics";
import type {
  JudgeLogEntry,
  JudgeRuntimeLogsSnapshot,
} from "@/lib/judge-runtime-logs";
import type { ServiceHandoffState } from "@/lib/service-handoff-state";

export type AuthoritativeExecutionTimelineEntry = {
  label: string;
  detail: string;
  status: string;
};

export type RuntimeMonitoringTimelineEntry = {
  label: string;
  detail: string;
  status: string;
  routeHref?: string;
  routeLabel?: string;
};

type AuthoritativeExecutionEvidence = {
  requestSummary: string;
  requestRouteSummary: string[];
  executionTimeline: AuthoritativeExecutionTimelineEntry[];
  monitoringTimeline: RuntimeMonitoringTimelineEntry[];
};

function pickEntry(
  entries: JudgeLogEntry[],
  preferredLabel: string,
) {
  return entries.find((entry) => entry.label === preferredLabel) ?? entries.at(-1);
}

function formatLogEntry(
  entry: JudgeLogEntry | undefined,
  fallback: string,
) {
  if (!entry) return fallback;
  return `${entry.label} · ${entry.signature}`;
}

export function buildAuthoritativeExecutionEvidence(
  handoff: ServiceHandoffState,
  runtimeSnapshot: JudgeRuntimeLogsSnapshot,
  executionSnapshot?: ExecutionSurfaceSnapshot,
): AuthoritativeExecutionEvidence | null {
  if (!handoff.requestPayload || !handoff.payoutIntent) return null;

  const payload = handoff.requestPayload;
  const delivery = handoff.requestDelivery;
  const governanceExecute = pickEntry(runtimeSnapshot.governance.entries, "execute");
  const confidentialSettle = pickEntry(
    runtimeSnapshot.confidential.entries,
    "magicblock-settle",
  );
  const strongestAlert =
    executionSnapshot?.incidentAlerts.find((alert) => alert.status !== "Healthy") ??
    executionSnapshot?.incidentAlerts[0];

  return {
    requestSummary: `${payload.requestId} · ${payload.amountDisplay} · ${payload.reference}`,
    requestRouteSummary: [
      payload.requestRoute,
      payload.deliveryRoute,
      payload.telemetryRoute,
    ],
    executionTimeline: [
      {
        label: "Request prepared",
        detail: `${payload.requestId} · ${payload.amountDisplay}`,
        status: payload.state,
      },
      {
        label: "Command delivery",
        detail:
          delivery?.state === "delivered"
            ? `delivered · ${delivery.deliveredAt ?? "timestamp pending"}`
            : delivery?.state ?? "draft",
        status: payload.payoutTitle,
      },
      {
        label: "Governance execution evidence",
        detail: formatLogEntry(
          governanceExecute,
          runtimeSnapshot.governance.verificationStatus,
        ),
        status: runtimeSnapshot.governance.proposal,
      },
      {
        label: "Confidential settlement evidence",
        detail: formatLogEntry(
          confidentialSettle,
          runtimeSnapshot.confidential.verificationStatus,
        ),
        status: runtimeSnapshot.confidential.proposal,
      },
    ],
    monitoringTimeline: [
      {
        label: "Evidence freshness",
        detail: runtimeSnapshot.freshness,
        status: "time-bound proof",
      },
      {
        label: "Real-device coverage",
        detail: runtimeSnapshot.runtime.walletCoverage,
        status: "runtime capture",
        routeHref: "/documents/real-device-runtime",
        routeLabel: "Open real-device runtime",
      },
      {
        label: "Transaction capture",
        detail: runtimeSnapshot.runtime.txSuccessRate,
        status: "telemetry continuity",
      },
      {
        label: "Adversarial discipline",
        detail: runtimeSnapshot.runtime.adversarialSummary,
        status: "reviewer visible",
      },
      {
        label: "V3 governance hardening",
        detail: `${runtimeSnapshot.v3Hardening.mode} · ${runtimeSnapshot.v3Hardening.governanceProposal}`,
        status: runtimeSnapshot.v3Hardening.governanceExecuted ? "executed" : "tracked",
      },
      {
        label: "Settlement evidence continuity",
        detail: `${runtimeSnapshot.v3Hardening.settlementProposal} · evidence ${runtimeSnapshot.v3Hardening.settlementEvidenceConsumed ? "consumed" : "pending"}`,
        status: "confidential lane",
      },
      {
        label: strongestAlert?.title ?? "Monitoring posture",
        detail:
          strongestAlert?.summary ??
          "Monitoring evidence remains attached to runtime and reviewer routes.",
        status: strongestAlert?.status ?? "Healthy",
        routeHref: strongestAlert?.routeHref ?? "/documents/monitoring-alert-rules",
        routeLabel: strongestAlert?.routeLabel ?? "Open alert rules",
      },
    ],
  };
}
