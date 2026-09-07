import type { CounterpartyContext, IntelligenceProvider, IntelligenceRequest, IntelligenceResult, TreasuryContext } from "@/lib/intelligence/providers/types";
import { sanitizeIntelligenceRequest } from "@/lib/intelligence/providers/types";

export const defaultIntelligenceProvider: IntelligenceProvider = {
  id: "qvac-local",
  label: "PrivateDAO default intelligence",

  async status() {
    return { id: "qvac-local", label: this.label, status: "available" };
  },

  async analyzeProposal(request: IntelligenceRequest): Promise<IntelligenceResult> {
    const safeRequest = sanitizeIntelligenceRequest(request);
    return {
      providerId: "qvac-local",
      providerStatus: "available",
      summary:
        "PrivateDAO helps members understand treasury context, counterparty risk, and historical evidence before voting without revealing vote intent during the voting period.",
      riskSignals: [
        {
          level: safeRequest.treasuryAddress ? "low" : "info",
          label: "Treasury context",
          detail: safeRequest.treasuryAddress ? "Treasury address was included for pre-vote context." : "No treasury address was shared.",
          source: "private-dao-default",
        },
        {
          level: "info",
          label: "Voting privacy boundary",
          detail: "Hidden vote intent, live counts, voter identities, and momentum are not part of the intelligence request.",
          source: "private-dao-default",
        },
      ],
      treasuryContext: await this.treasuryContext(safeRequest),
      counterpartyContext: await this.counterpartyRisk(safeRequest),
      dataSentToProviders: ["proposal public metadata", ...(safeRequest.treasuryAddress ? ["treasury address"] : []), ...(safeRequest.counterpartyAddress ? ["counterparty address"] : [])],
    };
  },

  async treasuryContext(request: IntelligenceRequest): Promise<TreasuryContext> {
    return {
      treasuryAddress: request.treasuryAddress,
      notes: request.treasuryAddress
        ? ["Default safe intelligence can frame treasury review before signing."]
        : ["Treasury analysis is available when the operator chooses to share a treasury address."],
    };
  },

  async counterpartyRisk(request: IntelligenceRequest): Promise<CounterpartyContext> {
    return {
      counterpartyAddress: request.counterpartyAddress,
      riskLevel: request.counterpartyAddress ? "unknown" : "unknown",
      notes: request.counterpartyAddress
        ? ["Counterparty was included for optional risk context."]
        : ["No counterparty address was shared."],
    };
  },
};
