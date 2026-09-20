export function intelProviderStatus(config) {
  return {
    provider: "intel-openvino",
    status: config.intelInferenceUrl ? "configured" : "not_configured",
    model: config.intelOpenvinoModel || null,
    endpoint_exposed: false,
  };
}

export async function runIntelInference(config, payload) {
  const status = intelProviderStatus(config);
  if (!config.intelInferenceUrl)
    return { ...status, result: null, note: "No OpenVINO inference endpoint is configured." };
  const started = Date.now();
  const response = await fetch(config.intelInferenceUrl, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ model: config.intelOpenvinoModel || null, input: payload }),
    signal: AbortSignal.timeout(10000),
  });
  if (!response.ok) throw new Error(`Intel inference HTTP ${response.status}`);
  const result = await response.json();
  return {
    ...status,
    status: "completed",
    latency_ms: Date.now() - started,
    result,
  };
}
