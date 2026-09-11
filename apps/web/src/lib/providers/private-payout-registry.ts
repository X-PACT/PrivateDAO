import type { PrivatePayoutProviderId } from "@/lib/providers/private-payout-provider";
import { assertKnownPrivatePayoutProvider } from "@/lib/providers/private-payout-provider";
import { sandboxPrivatePayoutProvider } from "@/lib/providers/sandbox-private-payout-provider";
import { umbraPrivatePayoutProvider } from "@/lib/providers/umbra-provider";

export async function getPrivatePayoutProvider(provider?: PrivatePayoutProviderId | "default") {
  assertKnownPrivatePayoutProvider(provider);
  if (provider === "sandbox-testnet") return sandboxPrivatePayoutProvider;
  if (provider === "umbra") return umbraPrivatePayoutProvider;

  const status = await umbraPrivatePayoutProvider.getProviderStatus();
  if (status.configured) return umbraPrivatePayoutProvider;

  // Sandbox execution is intentionally opt-in. A missing Umbra configuration
  // must fail closed rather than silently producing a deterministic receipt.
  if (process.env.NODE_ENV !== "production" && process.env.PRIVATE_DAO_PAYOUT_MODE === "sandbox") {
    return sandboxPrivatePayoutProvider;
  }

  throw new Error("Umbra private payout provider is not configured; select sandbox-testnet explicitly for rehearsal only.");
}

export async function getPrivatePayoutProviderStatuses() {
  return Promise.all([
    umbraPrivatePayoutProvider.getProviderStatus(),
    sandboxPrivatePayoutProvider.getProviderStatus(),
  ]);
}
