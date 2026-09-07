import type {
  PrivatePayoutExecutionResult,
  PrivatePayoutIntent,
  PrivatePayoutIntentInput,
  PrivatePayoutProvider,
  PrivatePayoutReceipt,
} from "@/lib/providers/private-payout-provider";
import { hashPrivatePayoutIntent, validatePrivatePayoutIntentShape } from "@/lib/providers/private-payout-utils";
import { UMBRA_DEVNET, assertUmbraDevnetAsset } from "@/lib/providers/umbra-payroll-workflow";

function getUmbraConfig() {
  const enabled = process.env.UMBRA_PROVIDER_ENABLED === "true";
  const apiBaseUrl = process.env.UMBRA_API_BASE_URL?.trim();
  const apiKey = process.env.UMBRA_API_KEY?.trim();
  const network = process.env.UMBRA_NETWORK?.trim() || "devnet";
  const receiptMode = process.env.UMBRA_RECEIPT_MODE?.trim() || "proof-only";

  return {
    enabled,
    apiBaseUrl,
    apiKey,
    network,
    receiptMode,
    configured: Boolean(enabled && apiBaseUrl && apiKey && network === "devnet"),
  };
}

export const umbraPrivatePayoutProvider: PrivatePayoutProvider = {
  id: "umbra",

  async prepareIntent(input: PrivatePayoutIntentInput): Promise<PrivatePayoutIntent> {
    const config = getUmbraConfig();
    if (config.network === "devnet") assertUmbraDevnetAsset(input.asset);
    const hashes = hashPrivatePayoutIntent(input, "umbra", config.network);
    return {
      provider: "umbra",
      network: config.network,
      daoId: input.daoId,
      proposalId: input.proposalId,
      operationType: input.operationType,
      payoutMode: input.payoutMode ?? "private-payout",
      asset: input.asset,
      amount: input.amount,
      recipientHash: hashes.recipientHash,
      metadataHash: hashes.metadataHash,
      intentHash: hashes.intentHash,
      privacyMode: input.privacyMode ?? "proof-only",
      publicOutcome: input.publicOutcome ?? "prepared confidential payout",
      createdAt: new Date().toISOString(),
      sandbox: !config.configured,
      manifestCommitment: input.manifestCommitment,
      privacyTier: input.privacyTier,
      batchId: input.batchId,
    };
  },

  async validateIntent(intent: PrivatePayoutIntent) {
    const error = validatePrivatePayoutIntentShape(intent);
    if (error) return { ok: false, error };
    const config = getUmbraConfig();
    if (!config.enabled) return { ok: false, error: "Umbra provider is disabled." };
    if (!config.apiBaseUrl || !config.apiKey) return { ok: false, error: "Umbra provider is missing API base URL or API key." };
    return { ok: true };
  },

  async executeTestnet(intent: PrivatePayoutIntent): Promise<PrivatePayoutExecutionResult> {
    const config = getUmbraConfig();
    if (!config.configured) {
      throw new Error("Umbra provider is not configured.");
    }
    if (config.network !== UMBRA_DEVNET.network) {
      throw new Error("Umbra Mainnet is intentionally disabled in this release. Configure the Devnet test lane first.");
    }
    assertUmbraDevnetAsset(intent.asset);

    const response = await fetch(`${config.apiBaseUrl!.replace(/\/+$/, "")}/private-payout/testnet`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${config.apiKey}`,
      },
      cache: "no-store",
      body: JSON.stringify({
        intentHash: intent.intentHash,
        daoId: intent.daoId,
        proposalId: intent.proposalId,
        operationType: intent.operationType,
        payoutMode: intent.payoutMode,
        asset: intent.asset,
        amount: intent.amount,
        recipientHash: intent.recipientHash,
        metadataHash: intent.metadataHash,
        privacyMode: intent.privacyMode,
        network: intent.network,
        receiptMode: config.receiptMode,
        batchId: intent.batchId,
        manifestCommitment: intent.manifestCommitment,
        privacyTier: intent.privacyTier,
      }),
    });

    const raw = (await response.json().catch(() => null)) as Record<string, unknown> | null;
    if (!response.ok) {
      throw new Error(typeof raw?.error === "string" ? raw.error : `Umbra provider responded ${response.status}.`);
    }

    return {
      executionId: typeof raw?.executionId === "string" ? raw.executionId : `umbra-${intent.intentHash.slice(0, 24)}`,
      status: "submitted",
      proofUrl: typeof raw?.proofUrl === "string" ? raw.proofUrl : `/proof/?privatePayout=${intent.intentHash}`,
      explorerUrl: typeof raw?.explorerUrl === "string" ? raw.explorerUrl : undefined,
      raw,
    };
  },

  async buildReceipt(intent: PrivatePayoutIntent, executionResult: PrivatePayoutExecutionResult): Promise<PrivatePayoutReceipt> {
    return {
      provider: "umbra",
      network: intent.network,
      intentHash: intent.intentHash,
      proposalId: intent.proposalId,
      daoId: intent.daoId,
      timestamp: new Date().toISOString(),
      privacyMode: intent.privacyMode,
      publicOutcome: intent.publicOutcome,
      labels: [
        intent.payoutMode === "public-payout" ? "Recipient visible in execution review" : "Recipient hidden during coordination",
        "Execution proof public after completion",
      ],
      proofUrl: executionResult.proofUrl,
      explorerUrl: executionResult.explorerUrl,
      sandbox: intent.sandbox,
      lifecycle: executionResult.status === "confirmed" ? "reconciled" : "submitted",
      batchId: intent.batchId,
      manifestCommitment: intent.manifestCommitment,
      privacyTier: intent.privacyTier,
    };
  },

  async getProviderStatus() {
    const config = getUmbraConfig();
    return {
      provider: "umbra",
      enabled: config.enabled,
      configured: config.configured,
      network: config.network,
      sandbox: !config.configured,
      receiptMode: config.receiptMode,
      reason: config.configured
        ? "Umbra Devnet provider is configured for the end-to-end test lane. Mainnet is disabled by policy."
        : "Umbra provider is optional. Missing env falls back to sandbox without claiming real settlement.",
    };
  },
};
