import type { CounterpartyContext, IntelligenceProvider, IntelligenceRequest, IntelligenceResult, TreasuryContext } from "@/lib/intelligence/providers/types";
import { sanitizeIntelligenceRequest } from "@/lib/intelligence/providers/types";

function getGoldRushConfig() {
  return {
    enabled: process.env.GOLDRUSH_ENABLED !== "false",
    apiBaseUrl: process.env.GOLDRUSH_API_BASE_URL?.trim() || "https://api.covalenthq.com/v1",
    apiKey: process.env.GOLDRUSH_API_KEY?.trim(),
  };
}

export const goldRushProvider: IntelligenceProvider = {
  id: "covalent-goldrush",
  label: "Covalent GoldRush",

  async status() {
    const config = getGoldRushConfig();
    if (!config.enabled) return { id: "covalent-goldrush" as const, label: this.label, status: "disabled" as const, reason: "GOLDRUSH_ENABLED is false." };
    if (!config.apiKey) return { id: "covalent-goldrush" as const, label: this.label, status: "unavailable" as const, reason: "Missing GOLDRUSH_API_KEY." };
    return { id: "covalent-goldrush" as const, label: this.label, status: "available" as const };
  },

  async analyzeProposal(request: IntelligenceRequest): Promise<IntelligenceResult> {
    const status = await this.status();
    const safeRequest = sanitizeIntelligenceRequest(request);
    return {
      providerId: "covalent-goldrush",
      providerStatus: status.status,
      summary:
        status.status === "available"
          ? "GoldRush is configured for normalized wallet and treasury context before signing."
          : status.reason ?? "GoldRush is optional and unavailable.",
      riskSignals: [
        {
          level: status.status === "available" ? "low" : "info",
          label: "GoldRush provider",
          detail: status.status === "available" ? "Provider can enrich treasury context." : "PrivateDAO default intelligence remains active without external keys.",
          source: "covalent-goldrush",
        },
      ],
      treasuryContext: await this.treasuryContext(safeRequest),
      counterpartyContext: await this.counterpartyRisk(safeRequest),
      dataSentToProviders: status.status === "available" ? ["treasury address", "counterparty address if enabled"] : [],
    };
  },

  async treasuryContext(request: IntelligenceRequest): Promise<TreasuryContext> {
    return { treasuryAddress: request.treasuryAddress, notes: ["GoldRush treasury context normalizes holdings into PrivateDAO's common schema."] };
  },

  async counterpartyRisk(request: IntelligenceRequest): Promise<CounterpartyContext> {
    return { counterpartyAddress: request.counterpartyAddress, riskLevel: "unknown", notes: ["GoldRush counterparty risk is optional and isolated from vote state."] };
  },
};
