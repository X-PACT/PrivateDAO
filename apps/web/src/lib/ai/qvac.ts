export type QvacCapabilityState = {
  webGpu: boolean;
  webGl: boolean;
  wasm: boolean;
  workers: boolean;
  language: string;
  platform: string;
  sdk: "loaded" | "not-installed" | "unavailable";
};

export type QvacRuntime = {
  sdkState: QvacCapabilityState["sdk"];
  capabilities: string[];
};

export type QvacLocalBriefInput = {
  operationType: string;
  amount: string;
  asset: string;
  riskNotes: string;
  privacyMode: string;
};

export type QvacLocalBrief = {
  provider: "qvac-fabric-transformers" | "deterministic-local-fallback";
  model: string;
  summary: string;
  operationType: string;
  riskNotes: string[];
  privacyModeRecommendation: string;
  counterpartyCheckResult: string;
  rawText?: string;
};

export type QvacModelProgress = {
  status: string;
  file?: string;
  progress?: number;
};

const QVAC_FABRIC_MODEL = "qvac/fabric-llm-finetune";

export async function detectQvacCapabilityState(): Promise<QvacCapabilityState> {
  const nav = typeof navigator !== "undefined" ? navigator : null;
  const windowRef = typeof window !== "undefined" ? window : null;

  const webGpu = Boolean((nav as Navigator & { gpu?: unknown } | null)?.gpu);
  const webGl = Boolean(windowRef?.document?.createElement("canvas").getContext("webgl"));
  const wasm = typeof WebAssembly !== "undefined";
  const workers = typeof Worker !== "undefined";

  return {
    webGpu,
    webGl,
    wasm,
    workers,
    language: nav?.language ?? "unknown",
    platform: nav?.platform ?? "unknown",
    sdk: await detectQvacSdkState(),
  };
}

export async function detectQvacSdkState(): Promise<QvacCapabilityState["sdk"]> {
  if (typeof window === "undefined") return "unavailable";

  try {
    const importer = new Function("return import('@qvac/sdk')") as () => Promise<unknown>;
    const loaded = await importer();
    return loaded && typeof loaded === "object" ? "loaded" : "unavailable";
  } catch {
    return "not-installed";
  }
}

export async function loadQvacRuntime(): Promise<QvacRuntime> {
  const sdkState = await detectQvacSdkState();
  return {
    sdkState,
    capabilities:
      sdkState === "loaded"
        ? ["local-llm", "embeddings", "translation", "speech", "ocr", "transformers-fallback"]
        : ["qvac-fabric-transformers", "device-capability-check", "privacy-preserving-pre-sign-review"],
  };
}

function parseGeneratedBrief(rawText: string, input: QvacLocalBriefInput): Omit<QvacLocalBrief, "provider" | "model" | "rawText"> {
  const generated = rawText.replace(/\s+/g, " ").trim();
  const lowerGenerated = generated.toLowerCase();
  const amountNumber = Number(input.amount);
  const riskNotes = [
    ...(Number.isFinite(amountNumber) && amountNumber >= 10_000
      ? ["High amount: require policy-limit confirmation before signing."]
      : []),
    ...(input.riskNotes.toLowerCase().includes("new recipient") || lowerGenerated.includes("new recipient")
      ? ["New recipient: run counterparty trust review and require scoped viewing key evidence."]
      : []),
    ...(lowerGenerated.includes("public") && input.privacyMode.toLowerCase() !== "public"
      ? ["Model mentioned public exposure: keep the action shielded unless reviewers explicitly need public disclosure."]
      : []),
  ];

  return {
    summary:
      generated ||
      `Local QVAC brief prepared for ${input.operationType || "operation"} using ${input.privacyMode || "private"} execution.`,
    operationType: input.operationType || "unspecified",
    riskNotes: riskNotes.length > 0 ? riskNotes : ["No elevated local alert detected by the on-device brief."],
    privacyModeRecommendation:
      input.privacyMode.toLowerCase().includes("public")
        ? "Use public mode only when recipient and amount visibility is intentional."
        : "Use shielded/private mode with a scoped viewing key for audit.",
    counterpartyCheckResult:
      input.riskNotes.toLowerCase().includes("new recipient") || lowerGenerated.includes("new recipient")
        ? "Counterparty check required before settlement."
        : "Counterparty risk is normal for this local input.",
  };
}

export async function generateQvacFabricBrief(
  input: QvacLocalBriefInput,
  onProgress?: (progress: QvacModelProgress) => void,
): Promise<QvacLocalBrief> {
  if (typeof window === "undefined") {
    return buildQvacOperationalBrief(input);
  }

  try {
    const transformers = (await import("@xenova/transformers")) as {
      pipeline: (
        task: "text-generation",
        model: string,
        options?: {
          progress_callback?: (progress: QvacModelProgress) => void;
        },
      ) => Promise<(prompt: string, options?: { max_new_tokens?: number; temperature?: number; do_sample?: boolean }) => Promise<unknown>>;
      env?: {
        allowLocalModels?: boolean;
        useBrowserCache?: boolean;
      };
    };

    if (transformers.env) {
      transformers.env.allowLocalModels = true;
      transformers.env.useBrowserCache = true;
    }

    onProgress?.({ status: "loading-model", file: QVAC_FABRIC_MODEL, progress: 0 });
    const generator = await transformers.pipeline("text-generation", QVAC_FABRIC_MODEL, {
      progress_callback: onProgress,
    });

    const prompt = [
      "PrivateDAO local sovereign AI brief.",
      `Operation type: ${input.operationType}`,
      `Amount: ${input.amount} ${input.asset}`,
      `Privacy mode: ${input.privacyMode}`,
      `Risk notes: ${input.riskNotes}`,
      "Return a concise execution brief with risk notes, privacy recommendation, and counterparty check.",
    ].join("\n");

    onProgress?.({ status: "running-local-inference", file: QVAC_FABRIC_MODEL, progress: 100 });
    const result = await generator(prompt, {
      max_new_tokens: 96,
      temperature: 0.2,
      do_sample: false,
    });
    const first = Array.isArray(result) ? result[0] : result;
    const rawText =
      first && typeof first === "object" && "generated_text" in first && typeof first.generated_text === "string"
        ? first.generated_text.replace(prompt, "").trim()
        : JSON.stringify(result);

    return {
      provider: "qvac-fabric-transformers",
      model: QVAC_FABRIC_MODEL,
      rawText,
      ...parseGeneratedBrief(rawText, input),
    };
  } catch {
    return buildQvacOperationalBrief(input);
  }
}

export function buildQvacOperationalBrief(input: QvacLocalBriefInput): QvacLocalBrief {
  const lines = [
    `Operation: ${input.operationType || "unspecified"}`,
    `Amount: ${input.amount || "unspecified"} ${input.asset || ""}`.trim(),
    `Privacy mode: ${input.privacyMode || "private"}`,
    `Risk notes: ${input.riskNotes || "No extra risk notes provided."}`,
  ];

  const alerts: string[] = [];
  const parsedAmount = Number(input.amount);
  if (Number.isFinite(parsedAmount) && parsedAmount >= 10000) {
    alerts.push("High amount operation: require explicit proposal-policy confirmation before signing.");
  }
  if ((input.riskNotes || "").toLowerCase().includes("new recipient")) {
    alerts.push("New recipient signal detected: run counterparty check before settlement.");
  }
  if ((input.privacyMode || "").toLowerCase().includes("public")) {
    alerts.push("Public execution mode detected: confirm that sensitive recipients and amounts are intentionally visible.");
  }

  return {
    provider: "deterministic-local-fallback",
    model: QVAC_FABRIC_MODEL,
    summary: lines.join(" | "),
    operationType: input.operationType || "unspecified",
    riskNotes: alerts.length > 0 ? alerts : ["No elevated local alert. Continue with review -> sign -> verify path."],
    privacyModeRecommendation:
      (input.privacyMode || "").toLowerCase().includes("public")
        ? "Use public mode only when visibility is intentional."
        : "Use shielded/private mode with scoped viewing-key audit evidence.",
    counterpartyCheckResult:
      (input.riskNotes || "").toLowerCase().includes("new recipient")
        ? "New recipient detected: run counterparty trust review before settlement."
        : "Counterparty check can proceed with normal policy review.",
  };
}
