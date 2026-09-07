import { buildSafeProposalPrompt } from "@/lib/intelligence/llm/prompt-builder";
import type { LLMAnalysisInput, LLMAnalysisResult, LLMProvider } from "@/lib/intelligence/llm/types";

function fallbackResult(providerId: LLMProvider["id"], label: string, input: LLMAnalysisInput): LLMAnalysisResult {
  const safe = buildSafeProposalPrompt(input);
  return {
    providerId,
    summary: `${label}: proposal context is ready for review before signing. No hidden voting data was included.`,
    privacyMode: safe.privacyMode,
    sensitiveDataExcluded: safe.sensitiveDataExcluded,
    promptPreview: safe.prompt,
  };
}

export function getLLMProvider(providerId?: LLMProvider["id"]): LLMProvider {
  const id = providerId ?? "qvac-local";
  const labelById: Record<LLMProvider["id"], string> = {
    "qvac-local": "QVAC local",
    "qvac-hosted": "QVAC hosted",
    "custom-openai-compatible": "Custom OpenAI-compatible",
    "custom-ollama-compatible": "Custom Ollama-compatible",
    disabled: "Disabled",
  };
  const modeById: Record<LLMProvider["id"], LLMProvider["mode"]> = {
    "qvac-local": "local",
    "qvac-hosted": "hosted",
    "custom-openai-compatible": "custom",
    "custom-ollama-compatible": "custom",
    disabled: "disabled",
  };

  return {
    id,
    label: labelById[id],
    mode: modeById[id],
    async analyzeProposal(input) {
      return fallbackResult(id, labelById[id], input);
    },
    async summarizeRisk(input) {
      return fallbackResult(id, labelById[id], input);
    },
    async compareHistoricalContext(input) {
      return fallbackResult(id, labelById[id], input);
    },
    async status() {
      if (id === "disabled") return { ok: false, mode: "disabled", reason: "LLM provider disabled." };
      return { ok: true, mode: modeById[id] };
    },
  };
}
