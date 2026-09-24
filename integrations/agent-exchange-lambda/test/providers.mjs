import assert from "node:assert/strict";
import test from "node:test";
import { getConfig } from "../src/config.mjs";
import { githubProviderStatus, repositoryEvidence } from "../src/github.mjs";
import { ibmProviderStatus, runWatsonxInference } from "../src/ibm.mjs";
import { mongoProviderStatus, persistEvidence } from "../src/mongodb.mjs";
import { assertPublicHttps } from "../src/url-safety.mjs";

test("provider status is safe when optional providers are not configured", async () => {
  const config = getConfig({});
  assert.equal(ibmProviderStatus(config).status, "not_configured");
  assert.equal((await runWatsonxInference(config, {})).result, null);
  assert.equal(mongoProviderStatus(config).status, "not_configured");
  assert.equal((await persistEvidence(config, { job_id: "job_test" })).persisted, false);
  assert.equal(githubProviderStatus(config).status, "public-read-only");
});

test("GitHub evidence includes provenance without credentials", async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async (url) => new Response(JSON.stringify({
    html_url: "https://github.com/example/repo",
    full_name: "example/repo",
    default_branch: "main",
    license: { spdx_id: "MIT" },
  }), { status: 200, headers: { "content-type": "application/json" } });
  try {
    const evidence = await repositoryEvidence(getConfig({}), { repository: "https://github.com/example/repo" });
    assert.equal(evidence.provider, "github");
    assert.equal(evidence.default_branch, "main");
    assert.equal("authorization" in evidence, false);
  } finally { globalThis.fetch = originalFetch; }
});

test("MCP URL safety rejects private literals before network access", async () => {
  await assert.rejects(() => assertPublicHttps("https://127.0.0.1/mcp"), /private or loopback/);
  await assert.rejects(() => assertPublicHttps("https://10.0.0.8/mcp"), /private or loopback/);
  await assert.rejects(() => assertPublicHttps("https://localhost/mcp"), /private or loopback/);
  await assert.rejects(() => assertPublicHttps("http://example.com/mcp"), /public HTTPS/);
});
