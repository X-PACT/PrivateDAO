import type { PrivatePayoutProviderId } from "@/lib/providers/private-payout-provider";
import { assertKnownPrivatePayoutProvider } from "@/lib/providers/private-payout-provider";
import { mockPrivatePayoutProvider } from "@/lib/providers/mock-private-payout-provider";
import { umbraPrivatePayoutProvider } from "@/lib/providers/umbra-provider";

export async function getPrivatePayoutProvider(provider?: PrivatePayoutProviderId | "default") {
  assertKnownPrivatePayoutProvider(provider);
  if (provider === "mock-testnet") return mockPrivatePayoutProvider;
  if (provider === "umbra") return umbraPrivatePayoutProvider;

  const status = await umbraPrivatePayoutProvider.getProviderStatus();
  return status.configured ? umbraPrivatePayoutProvider : mockPrivatePayoutProvider;
}

export async function getPrivatePayoutProviderStatuses() {
  return Promise.all([
    umbraPrivatePayoutProvider.getProviderStatus(),
    mockPrivatePayoutProvider.getProviderStatus(),
  ]);
}
