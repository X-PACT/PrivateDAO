import type { CounterpartyContext, IntelligenceProvider, IntelligenceRequest, IntelligenceResult, TreasuryContext } from "@/lib/intelligence/providers/types";
import { sanitizeIntelligenceRequest } from "@/lib/intelligence/providers/types";

function getArkhamConfig() {
  return {
    enabled: process.env.ARKHAM_ENABLED === "true",
    apiBaseUrl: process.env.ARKHAM_API_BASE_URL?.trim(),
    apiKey: process.env.ARKHAM_API_KEY?.trim(),
  };
}

export const arkhamProvider: IntelligenceProvider = {
  id: "arkham",
  label: "Arkham optional intelligence",

  async status() {
    const config = getArkhamConfig();
    if (!config.enabled) return { id: "arkham" as const, label: this.label, status: "disabled" as const, reason: "ARKHAM_ENABLED is not true." };
    if (!config.apiBaseUrl || !config.apiKey) return { id: "arkham" as const, label: this.label, status: "unavailable" as const, reason: "Missing Arkham base URL or API key." };
    return { id: "arkham" as const, label: this.label, status: "available" as const };
  },

  async analyzeProposal(request: IntelligenceRequest): Promise<IntelligenceResult> {
    const status = await this.status();
    const safeRequest = sanitizeIntelligenceRequest(request);
    if (status.status !== "available") {
      return {
        providerId: "arkham",
        providerStatus: status.status,
        summary: status.reason ?? "Arkham is optional and unavailable.",
        riskSignals: [],
        dataSentToProviders: [],
      };
    }

    return {
      providerId: "arkham",
      providerStatus: "available",
      summary: "Arkham provider is configured. PrivateDAO only sends approved public metadata and selected addresses.",
      riskSignals: [
        {
          level: "info",
          label: "Provider boundary",
          detail: "Private vote intent and private room notes are excluded unless a future explicit approval adds public metadata only.",
          source: "arkham",
        },
      ],
      treasuryContext: await this.treasuryContext(safeRequest),
      counterpartyContext: await this.counterpartyRisk(safeRequest),
      dataSentToProviders: ["proposal public metadata", ...(safeRequest.counterpartyAddress ? ["counterparty address"] : [])],
    };
  },

  async treasuryContext(request: IntelligenceRequest): Promise<TreasuryContext> {
    return { treasuryAddress: request.treasuryAddress, notes: ["Arkham treasury context is optional and isolated from hidden vote data."] };
  },

  async counterpartyRisk(request: IntelligenceRequest): Promise<CounterpartyContext> {
    return { counterpartyAddress: request.counterpartyAddress, riskLevel: "unknown", notes: ["Arkham counterparty context is provider-optional."] };
  },
};
