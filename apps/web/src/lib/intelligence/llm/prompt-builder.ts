import type { LLMAnalysisInput, LLMPrivacyMode } from "@/lib/intelligence/llm/types";

export function buildSafeProposalPrompt(input: LLMAnalysisInput) {
  const privacyMode: LLMPrivacyMode = input.privacyMode ?? "public-metadata-only";
  const includePrivateContext = privacyMode === "full-context-user-approved" && input.privateContextApproved === true;
  const lines = [
    "Analyze this DAO proposal before signing.",
    `Title: ${input.publicTitle ?? "Untitled proposal"}`,
    `Description: ${input.publicDescription ?? "No public description provided."}`,
  ];

  if (input.treasuryContext?.length) {
    lines.push(`Treasury context: ${input.treasuryContext.join(" | ")}`);
  }
  if (input.riskSignals?.length) {
    lines.push(`Risk signals: ${input.riskSignals.join(" | ")}`);
  }
  if (input.historicalPublicOutcomes?.length) {
    lines.push(`Historical public outcomes after reveal: ${input.historicalPublicOutcomes.join(" | ")}`);
  }
  if (includePrivateContext && input.privateRoomTranscript) {
    lines.push(`User-approved private room context: ${input.privateRoomTranscript}`);
  }

  lines.push("Never infer or reveal hidden vote intent, live vote counts, voter identities, or encrypted vote contents.");

  return {
    prompt: lines.join("\n"),
    privacyMode,
    sensitiveDataExcluded:
      !lines.join("\n").includes(input.hiddenVoteIntent ?? "__never__") &&
      !lines.join("\n").includes(input.encryptedVoteContents ?? "__never__") &&
      !(input.privateVoterIdentities ?? []).some((identity) => lines.join("\n").includes(identity)),
  };
}
