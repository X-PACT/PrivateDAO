import { createHash } from "crypto";
import type { PrivatePayoutReceipt } from "./private-payout-provider";

export const UMBRA_DEVNET = { network: "devnet", programId: "DSuKkyqGVGgo4QtPABfxKJKygUDACbUhirnuv63mEpAJ", relayer: "https://relayer.api-devnet.umbraprivacy.com", supportedAssets: ["WSOL"] as const };
export type PrivacyTier = "confidential" | "anonymous" | "selective-disclosure";
export type PayrollLifecycle = "prepared" | "encrypted" | "settlement-submitted" | "reconciled" | "failed";

export function choosePrivacyPolicy(input: { recipientCount: number; sensitive: boolean; requiresAudit: boolean; unlinkabilityRequired: boolean }) {
  const tier: PrivacyTier = input.unlinkabilityRequired ? "anonymous" : input.requiresAudit ? "selective-disclosure" : "confidential";
  return { tier, recipientCount: input.recipientCount, auditScope: input.requiresAudit ? "aggregates-and-policy" : "claims-only", sensitive: input.sensitive };
}
export function assertUmbraDevnetAsset(asset: string): asserts asset is "WSOL" { if (asset !== "WSOL") throw new Error("Umbra Devnet currently supports WSOL only. Mainnet is disabled until separately approved."); }
export function hashPayrollManifest(value: unknown) { return createHash("sha256").update(JSON.stringify(value)).digest("hex"); }

export function buildPayrollReceipt(input: { batchId: string; manifestCommitment: string; policy: ReturnType<typeof choosePrivacyPolicy>; executionId: string; lifecycle: PayrollLifecycle; network: string; verificationReceiptId?: string }): Omit<PrivatePayoutReceipt, "lifecycle"> & { lifecycle: PayrollLifecycle; verificationReceiptId?: string; programId: string; executionId: string } {
  return { provider: "umbra", network: input.network, intentHash: input.manifestCommitment, proposalId: "payroll:" + input.batchId, daoId: "privatedao-payroll", timestamp: new Date().toISOString(), privacyMode: input.policy.tier === "selective-disclosure" ? "selective-disclosure" : "proof-only", publicOutcome: "Payroll settlement reconciled without exposing employee-level data.", labels: ["Employee data excluded", "Policy-bound payroll", "Umbra settlement lane"], proofUrl: input.verificationReceiptId ? "/verify/record?receiptId=" + encodeURIComponent(input.verificationReceiptId) : undefined, explorerUrl: undefined, sandbox: input.network !== "mainnet-beta", lifecycle: input.lifecycle, batchId: input.batchId, manifestCommitment: input.manifestCommitment, privacyTier: input.policy.tier, executionId: input.executionId, verificationReceiptId: input.verificationReceiptId, programId: UMBRA_DEVNET.programId };
}
