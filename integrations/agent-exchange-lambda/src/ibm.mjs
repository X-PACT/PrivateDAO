export function ibmProviderStatus(config) {
  return {
    provider: "ibm-watsonx",
    status: config.ibmApiKey && config.ibmUrl && config.ibmProjectId ? "configured" : "not_configured",
    model: config.ibmModel,
    endpoint_exposed: false,
    credentials_exposed: false,
  };
}

export async function runWatsonxInference(config, payload) {
  const status = ibmProviderStatus(config);
  if (status.status !== "configured")
    return { ...status, result: null, note: "IBM watsonx is not configured." };
  const response = await fetch(`${config.ibmUrl.replace(/\/$/, "")}/ml/v1/text/generation?version=2024-05-31`, {
    method: "POST",
    headers: { authorization: `Bearer ${config.ibmApiKey}`, "content-type": "application/json" },
    body: JSON.stringify({
      model_id: config.ibmModel,
      project_id: config.ibmProjectId,
      input: JSON.stringify(payload),
      parameters: { max_new_tokens: 512, temperature: 0 },
    }),
    signal: AbortSignal.timeout(10000),
  });
  if (!response.ok) throw new Error(`IBM watsonx HTTP ${response.status}`);
  const body = await response.json();
  return {
    ...status,
    status: "completed",
    result: body.results || body,
    observed_at: new Date().toISOString(),
  };
}
