import { NextResponse } from "next/server";

import type { PrivatePayoutIntent } from "@/lib/providers/private-payout-provider";
import { getPrivatePayoutProvider } from "@/lib/providers/private-payout-registry";
import { assertUmbraDevnetAsset, buildPayrollReceipt, choosePrivacyPolicy } from "@/lib/providers/umbra-payroll-workflow";

// Keep the route compatible with the repository's static export contract.
// A server-mode deployment can still execute this handler with runtime env.
export const dynamic = "force-static";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const action = body.action === "execute" ? "execute" : "prepare";
    const provider = await getPrivatePayoutProvider("umbra");

    if (action === "prepare") {
      const manifestCommitment = String(body.manifestCommitment ?? "").trim();
      const recipientHash = String(body.recipientHash ?? "").trim();
      const recipientCount = Number(body.recipientCount ?? 0);
      const totalAmount = String(body.totalAmount ?? "").trim();
      if (!/^[a-f0-9]{64}$/.test(manifestCommitment)) throw new Error("manifestCommitment must be a SHA-256 hex string.");
      if (!/^[a-f0-9]{64}$/.test(recipientHash)) throw new Error("recipientHash must be a SHA-256 hex string.");
      if (!Number.isInteger(recipientCount) || recipientCount < 1 || recipientCount > 500) throw new Error("recipientCount must be between 1 and 500.");
      if (!/^\d+(\.\d+)?$/.test(totalAmount) || Number(totalAmount) <= 0) throw new Error("totalAmount must be positive.");
      const asset = String(body.asset ?? "WSOL") as Parameters<typeof assertUmbraDevnetAsset>[0];
      assertUmbraDevnetAsset(asset);
      const batchId = String(body.batchId ?? crypto.randomUUID());
      const policy = choosePrivacyPolicy({
        recipientCount,
        sensitive: body.sensitive !== false,
        requiresAudit: body.requiresAudit === true,
        unlinkabilityRequired: body.unlinkabilityRequired === true,
      });
      const intent = await provider.prepareIntent({
        provider: "umbra",
        daoId: String(body.daoId ?? "privatedao-payroll"),
        proposalId: String(body.proposalId ?? `payroll:${batchId}`),
        operationType: "payroll",
        payoutMode: "private-payout",
        asset,
        amount: totalAmount,
        recipientAddress: recipientHash,
        recipientMetadata: { recipientCount, manifestCommitment, privacyBoundary: "recipient-addresses-remain-in-browser" },
        privacyMode: policy.tier === "selective-disclosure" ? "selective-disclosure" : "proof-only",
        publicOutcome: "Umbra payroll batch prepared; recipient data remains hashed.",
        manifestCommitment,
        privacyTier: policy.tier,
        batchId,
      });
      return NextResponse.json({ ok: true, stage: "encrypted", network: "devnet", policy, manifestCommitment, intent });
    }

    const intent = body.intent as PrivatePayoutIntent | undefined;
    if (!intent) throw new Error("intent is required.");
    if (intent.provider !== "umbra" || intent.network !== "devnet") {
      throw new Error("Only the configured Umbra Devnet test lane is accepted.");
    }
    const validation = await provider.validateIntent(intent);
    if (!validation.ok) throw new Error(validation.error);
    const execution = await provider.executeTestnet(intent);
    const policy = choosePrivacyPolicy({
      recipientCount: 1,
      sensitive: true,
      requiresAudit: intent.privacyTier === "selective-disclosure",
      unlinkabilityRequired: intent.privacyTier === "anonymous",
    });
    const receipt = await provider.buildReceipt(intent, execution);
    const reconciliation = buildPayrollReceipt({
      batchId: intent.batchId ?? intent.intentHash,
      manifestCommitment: intent.manifestCommitment ?? intent.metadataHash,
      policy,
      executionId: execution.executionId,
      lifecycle: execution.status === "confirmed" ? "reconciled" : "settlement-submitted",
      network: intent.network,
    });
    return NextResponse.json({ ok: true, stage: reconciliation.lifecycle, execution, receipt, reconciliation });
  } catch (error) {
    return NextResponse.json({ ok: false, stage: "failed", error: error instanceof Error ? error.message : "Umbra payroll workflow failed." }, { status: 400 });
  }
}
