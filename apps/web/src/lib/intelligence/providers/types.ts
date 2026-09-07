export type IntelligenceProviderId =
  | "qvac-local"
  | "qvac-hosted"
  | "covalent-goldrush"
  | "arkham"
  | "birdeye"
  | "helius"
  | "quicknode"
  | "disabled";

export type RiskSignal = {
  level: "info" | "low" | "medium" | "high";
  label: string;
  detail: string;
  source: IntelligenceProviderId | "private-dao-default";
};

export type TreasuryContext = {
  treasuryAddress?: string;
  assetCount?: number;
  stablecoinCount?: number;
  estimatedValueUsd?: number;
  notes: string[];
};

export type CounterpartyContext = {
  counterpartyAddress?: string;
  knownEntity?: string;
  riskLevel: "unknown" | "low" | "medium" | "high";
  notes: string[];
};

export type IntelligenceRequest = {
  proposalId?: string;
  daoId?: string;
  publicTitle?: string;
  publicDescription?: string;
  treasuryAddress?: string;
  counterpartyAddress?: string;
  includeTreasuryContext?: boolean;
  includeCounterpartyContext?: boolean;
  hiddenVoteIntent?: never;
  encryptedVoteContents?: never;
  privateVoterIdentities?: never;
  privateRoomTranscript?: never;
};

export type IntelligenceResult = {
  providerId: IntelligenceProviderId;
  providerStatus: "available" | "unavailable" | "disabled" | "degraded";
  summary: string;
  riskSignals: RiskSignal[];
  treasuryContext?: TreasuryContext;
  counterpartyContext?: CounterpartyContext;
  dataSentToProviders: string[];
};

export type IntelligenceProvider = {
  id: IntelligenceProviderId;
  label: string;
  status(): Promise<{ id: IntelligenceProviderId; label: string; status: IntelligenceResult["providerStatus"]; reason?: string }>;
  analyzeProposal(request: IntelligenceRequest): Promise<IntelligenceResult>;
  treasuryContext(request: IntelligenceRequest): Promise<TreasuryContext>;
  counterpartyRisk(request: IntelligenceRequest): Promise<CounterpartyContext>;
};

export function sanitizeIntelligenceRequest(request: IntelligenceRequest): IntelligenceRequest {
  return {
    proposalId: request.proposalId,
    daoId: request.daoId,
    publicTitle: request.publicTitle,
    publicDescription: request.publicDescription,
    treasuryAddress: request.includeTreasuryContext ? request.treasuryAddress : undefined,
    counterpartyAddress: request.includeCounterpartyContext ? request.counterpartyAddress : undefined,
    includeTreasuryContext: request.includeTreasuryContext,
    includeCounterpartyContext: request.includeCounterpartyContext,
  };
}
