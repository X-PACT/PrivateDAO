export type LLMProviderMode = "local" | "hosted" | "custom" | "disabled";
export type LLMPrivacyMode = "local-only" | "public-metadata-only" | "full-context-user-approved";

export type LLMAnalysisInput = {
  publicTitle?: string;
  publicDescription?: string;
  treasuryContext?: string[];
  riskSignals?: string[];
  historicalPublicOutcomes?: string[];
  privateRoomTranscript?: string;
  privateContextApproved?: boolean;
  hiddenVoteIntent?: string;
  encryptedVoteContents?: string;
  privateVoterIdentities?: string[];
  privacyMode?: LLMPrivacyMode;
};

export type LLMAnalysisResult = {
  providerId: string;
  summary: string;
  privacyMode: LLMPrivacyMode;
  sensitiveDataExcluded: boolean;
  promptPreview: string;
};

export type LLMProvider = {
  id: "qvac-local" | "qvac-hosted" | "custom-openai-compatible" | "custom-ollama-compatible" | "disabled";
  label: string;
  mode: LLMProviderMode;
  analyzeProposal(input: LLMAnalysisInput): Promise<LLMAnalysisResult>;
  summarizeRisk(input: LLMAnalysisInput): Promise<LLMAnalysisResult>;
  compareHistoricalContext(input: LLMAnalysisInput): Promise<LLMAnalysisResult>;
  status(): Promise<{ ok: boolean; mode: LLMProviderMode; reason?: string }>;
};
