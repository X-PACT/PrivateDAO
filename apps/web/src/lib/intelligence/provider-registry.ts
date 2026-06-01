import { arkhamProvider } from "@/lib/intelligence/providers/arkham-provider";
import { defaultIntelligenceProvider } from "@/lib/intelligence/providers/default-provider";
import { goldRushProvider } from "@/lib/intelligence/providers/goldrush-provider";
import type { IntelligenceProvider, IntelligenceProviderId } from "@/lib/intelligence/providers/types";

const disabledProvider: IntelligenceProvider = {
  id: "disabled",
  label: "Disabled provider",
  async status() {
    return { id: "disabled", label: "Disabled provider", status: "disabled" };
  },
  async analyzeProposal() {
    return {
      providerId: "disabled",
      providerStatus: "disabled",
      summary: "Provider disabled.",
      riskSignals: [],
      dataSentToProviders: [],
    };
  },
  async treasuryContext() {
    return { notes: ["Provider disabled."] };
  },
  async counterpartyRisk() {
    return { riskLevel: "unknown", notes: ["Provider disabled."] };
  },
};

const placeholder = (id: IntelligenceProviderId, label: string): IntelligenceProvider => ({
  ...disabledProvider,
  id,
  label,
  async status() {
    return { id, label, status: "unavailable", reason: `${label} adapter boundary is registered and optional.` };
  },
});

export const intelligenceProviderRegistry: Record<IntelligenceProviderId, IntelligenceProvider> = {
  "qvac-local": defaultIntelligenceProvider,
  "qvac-hosted": placeholder("qvac-hosted", "QVAC hosted"),
  "covalent-goldrush": goldRushProvider,
  arkham: arkhamProvider,
  birdeye: placeholder("birdeye", "Birdeye"),
  helius: placeholder("helius", "Helius"),
  quicknode: placeholder("quicknode", "QuickNode"),
  disabled: disabledProvider,
};

export function getIntelligenceProvider(providerId?: IntelligenceProviderId) {
  return intelligenceProviderRegistry[providerId ?? "qvac-local"] ?? defaultIntelligenceProvider;
}

export async function getIntelligenceProviderStatuses() {
  return Promise.all(Object.values(intelligenceProviderRegistry).map((provider) => provider.status()));
}
