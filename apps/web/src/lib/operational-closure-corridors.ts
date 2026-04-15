import fs from "node:fs";
import path from "node:path";

type MonitoringAlertRulesJson = {
  environment: string;
  claimBoundary: string;
  rules: Array<{
    id: string;
    category: string;
    severity: "critical" | "high" | "medium" | "low";
    status: string;
  }>;
};

type MainnetBlockersJson = {
  summary: string;
  blockers: Array<{
    id: string;
    category: string;
    severity: "critical" | "high" | "medium" | "low";
    status: string;
    owner: string;
    nextAction: string;
    evidence: string[];
  }>;
};

export type MonitoringDeliveryClosureSnapshot = {
  environment: string;
  claimBoundary: string;
  ruleCount: number;
  criticalCount: number;
  highCount: number;
  blockerStatus: string;
  blockerOwner: string;
  blockerNextAction: string;
  deliveryRequirements: string[];
  evidencePaths: string[];
};

export type SettlementReceiptClosureSnapshot = {
  blockerStatus: string;
  blockerOwner: string;
  blockerNextAction: string;
  severity: string;
  currentTruth: string[];
  requiredClosure: string[];
  evidencePaths: string[];
};

function readJson<T>(relativePath: string): T {
  const filePath = path.resolve(process.cwd(), "..", "..", relativePath);
  return JSON.parse(fs.readFileSync(filePath, "utf8")) as T;
}

export function getMonitoringDeliveryClosureSnapshot(): MonitoringDeliveryClosureSnapshot {
  const monitoring = readJson<MonitoringAlertRulesJson>("docs/monitoring-alert-rules.json");
  const blockers = readJson<MainnetBlockersJson>("docs/mainnet-blockers.json");
  const blocker = blockers.blockers.find((item) => item.id === "production-monitoring-alerts");

  if (!blocker) {
    throw new Error("Missing production-monitoring-alerts blocker");
  }

  return {
    environment: monitoring.environment,
    claimBoundary: monitoring.claimBoundary,
    ruleCount: monitoring.rules.length,
    criticalCount: monitoring.rules.filter((rule) => rule.severity === "critical").length,
    highCount: monitoring.rules.filter((rule) => rule.severity === "high").length,
    blockerStatus: blocker.status,
    blockerOwner: blocker.owner,
    blockerNextAction: blocker.nextAction,
    deliveryRequirements: [
      "alert destination ownership",
      "primary and fallback RPC probe configuration",
      "proposal lifecycle monitor",
      "treasury balance monitor",
      "strict proof and settlement evidence monitor",
      "authority activity monitor",
      "test alert transcript",
    ],
    evidencePaths: blocker.evidence,
  };
}

export function getSettlementReceiptClosureSnapshot(): SettlementReceiptClosureSnapshot {
  const blockers = readJson<MainnetBlockersJson>("docs/mainnet-blockers.json");
  const blocker = blockers.blockers.find((item) => item.id === "magicblock-refhe-source-receipts");

  if (!blocker) {
    throw new Error("Missing magicblock-refhe-source-receipts blocker");
  }

  return {
    blockerStatus: blocker.status,
    blockerOwner: blocker.owner,
    blockerNextAction: blocker.nextAction,
    severity: blocker.severity,
    currentTruth: [
      "Devnet confidential payout rehearsal exists inside the governed treasury corridor.",
      "Settlement evidence and execution hardening are already part of the product and security surfaces.",
      "Reviewer-safe payout evidence exists, but it is not yet a source-verifiable receipt closure.",
    ],
    requiredClosure: [
      "canonical settlement hash or verifier-grade source proof",
      "receipt publication linked to the governed payout object",
      "clear residual-trust model when source receipts are unavailable",
      "reviewer-visible evidence path that survives mainnet scrutiny",
    ],
    evidencePaths: blocker.evidence,
  };
}
