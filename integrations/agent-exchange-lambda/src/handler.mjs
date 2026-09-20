import { randomUUID } from "node:crypto";
import { getConfig, hydrateConfig } from "./config.mjs";
import { digest, receiptId } from "./canonical.mjs";
import { SERVICES, serviceById } from "./catalog.mjs";
import { LIVE_NETWORKS, NETWORK_CAPABILITIES, networkCapability } from "./network-capabilities.mjs";
import { createStore, MemoryStore } from "./storage.mjs";
import {
  mintEvidence,
  networkStats,
  solanaHealth,
  readRpc,
  swapQuote,
  simulateSolanaTransaction,
  treasuryTokenAccount,
  verifyPayment,
} from "./solana.mjs";
import { evmNetwork, evmHealth, executeEvmService, evmRuntimeStats } from "./evm.mjs";
import { enforceRateLimit, rateLimitKey, resetRuntimeControls } from "./runtime-controls.mjs";
import {
  researchAsset,
  researchWallet,
  explainContract,
  explainTransaction,
  detectAnomaly,
  researchReport,
  portfolioIntelligence,
  marketSnapshot,
} from "./intelligence.mjs";
import { runIntelInference } from "./intel.mjs";

const config = getConfig();
let storePromise;
let configPromise;
const store = () => (storePromise ||= createStore(config));
const runtimeConfig = () => (configPromise ||= hydrateConfig(config));
const now = () => new Date().toISOString();
function trackFunnel(event, details = {}) {
  if (details.synthetic) return;
  const item = {
    id: `evt_${randomUUID()}`,
    event,
    service: details.service || null,
    source: details.source || "direct",
    agent: details.agent ? digest({ agent: details.agent }).slice(0, 20) : null,
    network: details.network || details.targetNetwork || "solana-mainnet-beta",
    outcome: details.outcome || null,
    durationMs: Number.isFinite(details.durationMs) ? details.durationMs : null,
    providerCalls: Number.isFinite(details.providerCalls) ? details.providerCalls : null,
    cacheHits: Number.isFinite(details.cacheHits) ? details.cacheHits : null,
    cacheMisses: Number.isFinite(details.cacheMisses) ? details.cacheMisses : null,
    createdAt: now(),
  };
  void store()
    .then((storage) => storage.put("Telemetry", item.id, item))
    .catch(() => {});
}
const json = (body, status = 200, headers = {}) => ({
  statusCode: status,
  headers: {
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store",
    "access-control-allow-origin": "*",
    ...headers,
  },
  body: JSON.stringify(body),
});
const text = (body, status = 200) => ({
  statusCode: status,
  headers: {
    "content-type": "text/plain; charset=utf-8",
    "access-control-allow-origin": "*",
  },
  body,
});
const pathOf = (e) =>
  e.rawPath || e.requestContext?.http?.path || e.path || "/";
const methodOf = (e) => e.requestContext?.http?.method || e.httpMethod || "GET";
function requestMetadata(e) {
  const headers = e.headers || {};
  return {
    source: e.queryStringParameters?.source || headers["x-pdao-source"] || "direct",
    agent: headers["x-pdao-agent-id"] || null,
    synthetic: headers["x-pdao-synthetic"] === "true",
  };
}
function parseBody(e) {
  const raw = e.body
    ? e.isBase64Encoded
      ? Buffer.from(e.body, "base64").toString()
      : e.body
    : "{}";
  if (Buffer.byteLength(raw) > config.maxBodyBytes)
    throw new Error("request body too large");
  return JSON.parse(raw);
}
function card() {
  return {
    name: "PrivateDAO Agent Exchange",
    description: "Machine-native PrivateDAO services for verification, evidence and agent workflows. Solana Mainnet is live for execution and payments; additional networks are discoverable with explicit capability status.",
    provider: { organization: "PrivateDAO", url: "https://privatedao.org" },
    version: "1.4.0",
    protocolVersion: "0.3.0",
    url: `https://${config.domain}/a2a`,
    documentationUrl: `https://${config.domain}/llms-full.txt`,
    capabilities: { streaming: false, pushNotifications: false },
    authentication: { schemes: ["none", "solana-payment"] },
    networks: [...LIVE_NETWORKS],
    networkCapabilities: NETWORK_CAPABILITIES,
    defaultInputModes: ["text/plain", "application/json"],
    defaultOutputModes: ["application/json"],
    protocols: {
      a2a: `https://${config.domain}/a2a`,
      mcp: `https://${config.domain}/mcp`,
      openapi: `https://${config.domain}/openapi.json`,
    },
    serviceCatalog: `https://${config.domain}/api/services`,
    pricing: `https://${config.domain}/api/pricing`,
    workflow: {
      discovery: `GET https://${config.domain}/.well-known/agent-card.json`,
      freeTest: {
        service: "verify.basic",
        createJob: `POST https://${config.domain}/api/jobs`,
        exampleBody: { service_id: "verify.basic", input: { record: { mint: "<SOLANA_MINT>" } } },
        result: "The response includes result and receipt; verify the receipt with the receipt URL.",
      },
      paid: {
        createJob: `POST https://${config.domain}/api/jobs`,
        paymentRequiredStatus: 402,
        paymentIntent: `GET https://${config.domain}/api/jobs/{jobId}/payment-intent`,
        payment: "Send the exact quoted USDC amount on Solana Mainnet to the quoted treasury token account, then submit the finalized transaction signature.",
        submitPaymentProof: `POST https://${config.domain}/api/jobs/{jobId}/payment`,
        jobStatus: `GET https://${config.domain}/api/jobs/{jobId}`,
      },
      receipts: `GET https://${config.domain}/api/receipts/{receiptId}`,
    },
    payment: {
      network: "solana-mainnet-beta",
      asset: "USDC",
      quoteFirst: true,
      finalizedTransactionRequired: true,
      custody: "receive-only treasury; the paying agent signs its own transaction",
    },
    skills: [
      ...SERVICES.map((s) => ({
        ...serviceManifest(s),
        id: s.id,
        name: s.title,
        description: `${s.access} service`,
        inputModes: ["application/json"],
        outputModes: ["application/json"],
        pricing: { access: s.access, amount: s.price, currency: s.currency, free: s.access === "free" },
        supportedNetworks: s.supportedNetworks || ["solana-mainnet-beta"],
      })),
      {
        id: "registry.search",
        name: "Search agents",
        description: "Find verified agent capabilities and service providers.",
        inputModes: ["application/json"],
        outputModes: ["application/json"],
      },
    ],
  };
}
function openapi() {
  return {
    openapi: "3.1.0",
    info: { title: "PrivateDAO Agent Exchange", version: "1.4.0" },
    servers: [{ url: `https://${config.domain}` }],
    paths: {
      "/api/health": { get: { operationId: "health" } },
      "/api/services": { get: { operationId: "services" } },
      "/api/pricing": { get: { operationId: "pricing" } },
      "/api/jobs": { post: { operationId: "createJob" } },
      "/api/jobs/{jobId}": { get: { operationId: "jobStatus" } },
      "/api/jobs/{jobId}/payment": { post: { operationId: "submitPayment" } },
      "/api/receipts/{receiptId}": { get: { operationId: "getReceipt" } },
      "/api/network/health": { get: { operationId: "networkHealth" } },
      "/api/registry/register": { post: { operationId: "registerAgent" } },
      "/api/registry/search": { get: { operationId: "searchAgents" } },
      "/api/discovery": { get: { operationId: "discovery" } },
      "/api/acquisition": { get: { operationId: "acquisition" } },
      "/api/referrals": { post: { operationId: "createReferral" } },
      "/api/marketplace/listings": {
        get: { operationId: "searchListings" },
        post: { operationId: "publishListing" },
      },
      "/api/marketplace/partners": { get: { operationId: "featuredPartners" } },
      "/api/partnerships/{partnershipId}/payment-intent": { get: { operationId: "partnershipPaymentIntent" } },
      "/api/partnerships/{partnershipId}/payment-transaction": { post: { operationId: "partnershipPaymentTransaction" } },
      "/api/partnerships/{partnershipId}/payment": { post: { operationId: "submitPartnershipPayment" } },
      "/api/admin/partnerships": { post: { operationId: "createPartnership" } },
      "/api/admin/partnerships/{partnershipId}": { patch: { operationId: "updatePartnership" } },
      "/api/logistics/request": { post: { operationId: "requestLogistics" } },
      "/api/logistics/capabilities": {
        get: { operationId: "logisticsCapabilities" },
      },
      "/api/agreements": { post: { operationId: "createAgreement" } },
      "/api/agreements/{agreementId}": { get: { operationId: "getAgreement" } },
      "/api/agreements/{agreementId}/accept": {
        post: { operationId: "acceptAgreement" },
      },
      "/api/revenue": { get: { operationId: "revenueSummary" } },
      "/api/treasury/status": { get: { operationId: "treasuryStatus" } },
      "/receipts/{receiptId}": { get: { operationId: "humanReceipt" } },
      "/verify/receipt/{receiptId}": { get: { operationId: "verifyHumanReceipt" } },
      "/partners": { get: { operationId: "featuredPartnersPage" } },
      "/marketplace/partners": { get: { operationId: "featuredPartnersPage" } },
      "/agents/{agentId}": { get: { operationId: "agentProfile" } },
      "/jobs/{jobId}": { get: { operationId: "humanJobReceipt" } },
      ...Object.fromEntries(SERVICES.map((service) => [servicePath(service.id), { get: { operationId: `service_${service.id.replaceAll(".", "_")}` } }])),
    },
  };
}
function llms() {
  const free = SERVICES.filter((service) => !service.price).map((service) => service.id).join(", ");
  const paid = SERVICES.filter((service) => service.price).map((service) => service.id).join(", ");
  return `# PrivateDAO Agent Exchange\nPurpose: machine-native Solana Mainnet services with read-only multi-chain intelligence for Ethereum Mainnet, Base Mainnet and Arbitrum One.\nFree: ${free}\nPaid: ${paid}\nFlow: discover -> POST /api/jobs -> run verify.basic free or receive HTTP 402 -> read payment_intent -> pay the exact finalized Solana Mainnet USDC quote -> POST /api/jobs/{jobId}/payment with the transaction signature -> GET /api/jobs/{jobId} -> GET /api/receipts/{receiptId}.\nTarget network is independent from the existing Solana payment network. New EVM services are read-only and never broadcast transactions.\nPrices: GET https://${config.domain}/api/pricing\nServices: GET https://${config.domain}/api/services\nPayment: finalized Solana mainnet USDC transaction, quote first; agents sign their own transactions.\nAgent Card: https://${config.domain}/.well-known/agent-card.json\nA2A: https://${config.domain}/a2a\nMCP: https://${config.domain}/mcp\nOpenAPI: https://${config.domain}/openapi.json\nReceipts: GET https://${config.domain}/api/receipts/{receiptId}\n`;
}
function acquisition() {
  const services = SERVICES.map((service) => ({
    ...service,
    free: service.access === "free",
    status: capabilityStatus(service.id),
    publicUrl: `https://${config.domain}${servicePath(service.id)}`,
    paymentAssets: service.price ? ["USDC"] : [],
    receipt: `https://${config.domain}/api/receipts/{receiptId}`,
  }));
  return {
    network: "solana:mainnet-beta",
    networkCapabilities: NETWORK_CAPABILITIES,
    canonical: `https://${config.domain}`,
    freeEntry: "verify.basic",
    services,
    payment: {
      assets: ["USDC"],
      finalizedOnly: true,
      quoteFirst: true,
      custody: "receive-only treasury; agents sign their own transactions",
    },
    discovery: {
      agentCard: `https://${config.domain}/.well-known/agent-card.json`,
      mcp: `https://${config.domain}/mcp`,
      a2a: `https://${config.domain}/a2a`,
      openapi: `https://${config.domain}/openapi.json`,
      developerGuide: `https://${config.domain}/connect`,
      solanaAgentRegistryRegistration: `https://${config.domain}/agent-registry/register`,
    },
    sdk: {
      typescript: "https://github.com/X-PACT/PrivateDAO/tree/codex/agent-exchange-acquisition/sdk/agent-exchange/typescript",
      python: "https://github.com/X-PACT/PrivateDAO/tree/codex/agent-exchange-acquisition/sdk/agent-exchange/python",
      examples: `https://${config.domain}/connect`,
    },
    receipts: {
      verification: `https://${config.domain}/api/receipts/{receiptId}`,
      public: true,
    },
    referrals: {
      supported: true,
      attribution: "discovery-to-activation-to-paid-conversion",
      rewards: "disabled-until-explicit-provider-policy",
      endpoint: `https://${config.domain}/api/referrals`,
    },
    integrations: [
      { id: "mcp-official-registry", protocol: "MCP", status: "published-active", url: "https://registry.modelcontextprotocol.io/v0.1/servers?search=io.github.X-PACT%2Fpdao-agent-exchange" },
      { id: "a2a-registry", protocol: "A2A", status: "registered-recheck-pending", url: "https://a2aregistry.org/api/agents/6ebd2b6c-2cef-4421-8f28-6896ca3bf307", note: "Registry cache must recheck the updated card; no duplicate entry is created." },
      { id: "solana-agent-registry", protocol: "A2A", status: "submission-ready", auth: "manual or registry-specific" },
      { id: "8004scan", protocol: "agent-discovery", status: "submission-ready", auth: "directory policy applies" },
      { id: "github-action", protocol: "GitHub Actions", status: "source-ready", url: "https://github.com/X-PACT/PrivateDAO/tree/codex/agent-exchange-acquisition/integrations/pdao-token-verification-action" },
    ],
    policy: "opt-in distribution; no fabricated activity or unsolicited messaging",
  };
}
function createReferral(body) {
  const source = String(body.agentId || body.agent_id || body.source || "").trim();
  if (!source || source.length > 200) throw new Error("agentId is required");
  const code = `ref_${digest({ source }).slice(0, 24)}`;
  trackFunnel("referral_created", { source: code, agent: source });
  return {
    referralId: code,
    discoveryUrl: `https://${config.domain}/api/acquisition?ref=${encodeURIComponent(code)}`,
    attribution: "discovery-to-activation-to-paid-conversion",
    rewards: "disabled-until-explicit-provider-policy",
  };
}
function recommendedNextServices(serviceId, result) {
  if (serviceId === "verify.basic") {
    const uncertain = result?.evidence_confidence === "not-found" || result?.valid === false;
    return [{
      service: uncertain ? "verify.deep" : "risk.score",
      reason: uncertain ? "Basic evidence is incomplete; deep checks add bounded transaction and authority evidence." : "Authority and holder evidence can be converted into a machine-readable risk assessment.",
      price: uncertain ? 0.25 : 0.02,
      currency: "USDC",
      expected_additional_value: uncertain ? "deeper evidence and recent activity" : "deterministic authority-risk factors",
    }];
  }
  if (serviceId === "risk.score" && result?.factors?.mint_authority_present)
    return [{ service: "verify.deep", reason: "The result contains an authority flag; deep verification can add recent activity evidence.", price: 0.25, currency: "USDC", expected_additional_value: "recent activity and expanded checks" }];
  if (serviceId === "receipt.verify") return [];
  return [];
}
function connectPage() {
  const lines = [
    "<!doctype html><html lang=\"en\"><head><meta charset=\"utf-8\"><meta name=\"viewport\" content=\"width=device-width,initial-scale=1\"><link rel=\"icon\" href=\"data:,\"><title>Connect an Agent | PrivateDAO</title>",
    "<style>:root{--ink:#081b33;--muted:#52657c;--line:#dbe5f0;--blue:#1769e0;--pale:#f5f9ff}*{box-sizing:border-box}body{font-family:Inter,ui-sans-serif,system-ui,-apple-system,sans-serif;max-width:1040px;margin:0 auto;padding:28px 24px 64px;background:#fff;color:var(--ink);line-height:1.55}a{color:var(--blue);font-weight:700}h1{font-size:clamp(2.8rem,7vw,5.4rem);letter-spacing:-.055em;line-height:.98;max-width:760px;margin:16px 0 20px}.lead{color:var(--muted);font-size:1.14rem;max-width:700px}.muted{color:var(--muted)}.top{display:flex;align-items:center;justify-content:space-between;gap:18px;margin-bottom:72px}.brand{color:var(--ink);text-decoration:none;font-weight:800}.nav{display:flex;gap:18px;font-size:.9rem}.nav a{color:var(--muted)}.eyebrow{color:var(--blue);font-size:.75rem;font-weight:800;letter-spacing:.12em;text-transform:uppercase}.flow{display:flex;flex-wrap:wrap;gap:8px;margin:24px 0 38px}.flow span{border:1px solid var(--line);border-radius:999px;padding:9px 13px;background:var(--pale);font-size:.9rem;font-weight:700}.section{border-top:1px solid var(--line);padding-top:24px;margin-top:36px}.section h2{font-size:1.3rem}.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:14px}.grid section{border:1px solid var(--line);border-radius:16px;padding:18px;background:#fff;box-shadow:0 10px 28px rgba(14,42,78,.05)}.grid section b{color:var(--blue)}pre{overflow:auto;background:#f5f9ff;border:1px solid var(--line);border-radius:14px;padding:16px;color:#102745;font-size:13px}footer{border-top:1px solid var(--line);margin-top:42px;padding-top:18px;font-size:.9rem}@media(max-width:700px){body{padding:20px 16px 44px}.top{margin-bottom:48px}.nav{gap:10px;font-size:.78rem}h1{font-size:clamp(3rem,15vw,5rem)}} </style></head><body>",
    "<header class=\"top\"><a class=\"brand\" href=\"/marketplace\">PrivateDAO Agent Exchange</a><nav class=\"nav\"><a href=\"/marketplace\">Marketplace</a><a href=\"/.well-known/agent-card.json\">Agent Card</a></nav></header><div class=\"eyebrow\">Developer access</div><h1>Connect your agent.<br><span>Verify the result.</span></h1><p class=\"lead\">Discover PrivateDAO services, run a free check, pay only when a paid result is useful, and receive a verifiable receipt.</p>",
    "<div class=\"flow\"><span>Discover</span><span>Create job</span><span>Pay</span><span>Get result</span><span>Verify receipt</span></div>",
    `<section class="section"><h2>Fastest onboarding</h2><p class="muted">Copy the machine endpoint you need, then run the free verification example below. No dashboard or account is required.</p><div class="grid"><section><b>Agent Card</b><p><button class="copy" data-copy="https://${config.domain}/.well-known/agent-card.json">Copy endpoint</button></p></section><section><b>OpenAPI</b><p><button class="copy" data-copy="https://${config.domain}/openapi.json">Copy endpoint</button></p></section><section><b>MCP</b><p><button class="copy" data-copy='{"mcpServers":{"privatedao-agents":{"url":"https://${config.domain}/mcp"}}}'>Copy MCP config</button></p></section></div><script>document.querySelectorAll(".copy").forEach(function(button){button.addEventListener("click",async function(){try{await navigator.clipboard.writeText(button.dataset.copy);const old=button.textContent;button.textContent="Copied";setTimeout(function(){button.textContent=old},1400)}catch(_){button.textContent="Select and copy manually"}})});</script></section>`,
    "<section class=\"section\"><h2>Fastest start: curl</h2><pre>curl https://agents.privatedao.org/.well-known/agent-card.json\ncurl https://agents.privatedao.org/api/services\ncurl -X POST https://agents.privatedao.org/api/jobs -H 'content-type: application/json' -d '{\"service_id\":\"verify.basic\",\"input\":{\"mint\":\"YOUR_SOLANA_MINT\"}}'</pre></section>",
    "<h2>TypeScript</h2><pre>import { PrivateDAOAgentExchange } from \"@privatedao/agent-exchange\";\nconst pdao = new PrivateDAOAgentExchange();\nawait pdao.discover();\nconst job = await pdao.verifyBasic({ mint: \"YOUR_SOLANA_MINT\" });\nconsole.log(job);</pre>",
    "<h2>Python</h2><pre>from privatedao_agent_exchange import PrivateDAOAgentExchange\npdao = PrivateDAOAgentExchange()\npdao.discover()\njob = pdao.verify_basic({\"mint\": \"YOUR_SOLANA_MINT\"})\nprint(job)</pre>",
    "<h2>Paid flow</h2><p class=\"muted\">Create a paid job, read the payment intent, send the exact finalized Solana payment with its reference, submit the signature, poll the job, then retrieve the receipt. No account or dashboard is required.</p>",
    "<div class=\"grid\"><section><b>Free entry</b><p>verify.basic<br>receipt.verify</p></section><section><b>Paid intelligence</b><p>verify.deep<br>token.intelligence<br>risk.score<br>wallet.intelligence</p></section><section><b>Agent logistics</b><p>agent.match<br>/api/logistics/request<br>/api/marketplace/listings</p></section></div>",
    "<p class=\"muted\">Production network: Solana Mainnet. <a href=\"/marketplace\">Browse services</a> · <a href=\"/.well-known/agent-card.json\">Agent Card</a> · <a href=\"/openapi.json\">OpenAPI</a> · <a href=\"/mcp\">MCP</a></p></body></html>",
  ];
  return injectLanguageWidget(lines.join(""));
}
function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
function servicePath(serviceId) {
  return `/services/${encodeURIComponent(serviceId.replaceAll(".", "-"))}`;
}
function capabilityStatus(serviceId) {
  // Only the free verification path has a recorded production smoke result.
  // Other catalog entries remain implementation-level until an execution
  // record proves their production path independently.
  if (serviceId === "verify.basic") return "Mainnet Live";
  const service = serviceById(serviceId);
  if (service?.supportedNetworks?.some((network) => network !== "solana-mainnet-beta")) return "Mainnet Read-only";
  return "Implementation";
}
function serviceExample(service) {
  if (service.id === "transaction.simulate") return { network: "ethereum-mainnet", transaction: { to: "0x0000000000000000000000000000000000000000", data: "0x" } };
  if (service.id === "swap.quote") return { network: "solana-mainnet-beta", inputMint: "So11111111111111111111111111111111111111112", outputMint: "EPjFWdd5AufSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v", amount: "1000000", slippageBps: 50 };
  if (service.input.includes("token identifier")) return { network: "ethereum-mainnet", asset: "0x0000000000000000000000000000000000000000" };
  if (service.input.includes("mint")) return { network: "solana-mainnet-beta", mint: "YOUR_SOLANA_MINT" };
  if (service.input.includes("wallet")) return { network: "solana-mainnet-beta", wallet: "YOUR_SOLANA_WALLET" };
  if (service.input.includes("program")) return { program: "YOUR_SOLANA_PROGRAM" };
  if (service.input.includes("receipt")) return { receipt: {}, expected_hash: "OPTIONAL_RECEIPT_HASH" };
  if (service.input.includes("capabilities")) return { capabilities: ["verification"] };
  if (service.input.includes("Agent Card")) return { campaignId: "YOUR_CAMPAIGN_ID", destination: "https://example.com/agent" };
  if (service.input.includes("structured")) return { evidence: { claim: "example" } };
  return { record: { claim: "example" } };
}
function serviceManifest(service) {
  const inputSchema = {
    type: "object",
    additionalProperties: true,
    properties: {
      network: { type: "string", enum: service.supportedNetworks || ["solana-mainnet-beta"] },
      asset: { type: "string" },
      wallet: { type: "string" },
      amount: { type: "string" },
      transaction: { type: "object" },
    },
  };
  return {
    ...service,
    free: service.access === "free",
    status: capabilityStatus(service.id),
    public_url: `https://${config.domain}${servicePath(service.id)}`,
    payment_network: "solana-mainnet-beta",
    supported_target_networks: service.supportedNetworks || ["solana-mainnet-beta"],
    input_schema: inputSchema,
    output_schema: { type: "object", description: service.output },
    estimated_completion_behavior: service.access === "free" ? "immediate_read_only" : "payment_required_then_read_only_execution",
  };
}
function validateServiceInput(serviceId, input = {}) {
  const service = serviceById(serviceId);
  if (!service) throw new Error("unknown service");
  if (serviceId === "intelligence.synthesize" && !config.intelInferenceUrl) {
    throw Object.assign(new Error("Intel inference provider is not configured"), { statusCode: 503 });
  }
  const network = input.network == null ? "" : String(input.network);
  if (service.supportedNetworks?.length && !service.supportedNetworks.includes(network))
    throw new Error(`${serviceId} is not supported on ${network || "this network"}`);
  const solana = /^[1-9A-HJ-NP-Za-km-z]{32,88}$/;
  const evm = /^0x[0-9a-fA-F]{40}$/;
  const isEvm = ["ethereum-mainnet", "base-mainnet", "arbitrum-mainnet"].includes(network);
  const subject = input.asset || input.mint || input.token || input.contract || input.program || input.address || input.wallet;
  const addressValid = isEvm ? evm.test(String(subject || "")) : solana.test(String(subject || ""));
  if (["token.intelligence", "risk.score", "market.snapshot", "research.asset", "contract.explain"].includes(serviceId) && !addressValid)
    throw new Error(isEvm ? "valid EVM asset address is required" : "valid Solana asset address is required");
  if (["wallet.intelligence", "research.wallet"].includes(serviceId))
    if (!(isEvm ? evm.test(String(input.wallet || input.address || "")) : solana.test(String(input.wallet || input.address || ""))))
      throw new Error(isEvm ? "valid EVM wallet address is required" : "valid Solana wallet address is required");
  if (["anomaly.detect", "agent.research.report"].includes(serviceId) && !addressValid)
    throw new Error("valid asset or wallet subject is required");
  if (serviceId === "portfolio.intelligence") {
    if (!Array.isArray(input.assets) || input.assets.length < 1 || input.assets.length > 10)
      throw new Error("assets must contain between 1 and 10 identifiers");
    if (input.assets.some((asset) => !(isEvm ? evm.test(String(asset)) : solana.test(String(asset)))))
      throw new Error(isEvm ? "all portfolio assets must be valid EVM addresses" : "all portfolio assets must be valid Solana addresses");
  }
  if (["transaction.simulate", "transaction.explain"].includes(serviceId) && !input.transaction && !input.unsignedTransaction && !input.serializedTransaction && !input.hash && !input.signature)
    throw new Error("transaction data or transaction hash is required");
}
function languageWidget() {
  return `<label id="pdao-language-picker" title="Change language" aria-label="Change language"><span aria-hidden="true">🌐</span><select aria-label="Language"><option value="en">English</option><option value="ar">العربية</option><option value="ru">Русский</option><option value="uk">Українська</option><option value="pl">Polski</option><option value="hi">हिन्दी</option><option value="ko">한국어</option><option value="es">Español</option><option value="it">Italiano</option></select></label><style>#pdao-language-picker{position:fixed;right:18px;bottom:18px;z-index:20;display:inline-flex;align-items:center;gap:6px;border:1px solid #dbe5ef;border-radius:999px;background:#fff;color:#071a32;padding:8px 11px;box-shadow:0 8px 24px rgba(7,26,50,.12);font:700 12px system-ui}#pdao-language-picker select{border:0;background:transparent;color:#071a32;font:700 12px system-ui;outline:none;cursor:pointer}#pdao-language-picker:hover{border-color:#1769e0;color:#1769e0}</style><script>(function(){const picker=document.querySelector("#pdao-language-picker select");if(!picker)return;const pairs={"Marketplace":"السوق","Build":"التكامل","Agent Card":"بطاقة الوكيل","Connect an agent":"اربط وكيلًا","Browse capabilities":"استعرض القدرات","Explore services":"استعرض الخدمات","Try verification":"جرّب التحقق","PrivateDAO Agents":"وكلاء PrivateDAO","OpenAPI":"OpenAPI","MCP":"MCP","A2A":"A2A"};const query=new URLSearchParams(location.search);const initial=query.get("lang");if(initial&&["en","ar","ru","uk","pl","hi","ko","es","it"].includes(initial))picker.value=initial;function translate(arabic){document.documentElement.lang=arabic?"ar":"en";document.documentElement.dir=arabic?"rtl":"ltr";document.querySelectorAll("body *").forEach(function(el){if(el.tagName==="SCRIPT"||el.tagName==="STYLE"||el.children.length||el.childNodes.length!==1)return;const node=el.firstChild;if(node.nodeType!==3)return;const value=node.nodeValue.trim();if(!value)return;if(!el.dataset.pdaoEn)el.dataset.pdaoEn=value;node.nodeValue=arabic?(pairs[value]||value):el.dataset.pdaoEn;});}picker.addEventListener("change",function(){const locale=picker.value;try{localStorage.setItem("privatedao.locale",locale);localStorage.setItem("privatedao.locale.explicit","1");}catch(error){}if(locale==="ar"||locale==="en"){translate(locale==="ar");return;}location.href="https://privatedao.org/?lang="+encodeURIComponent(locale);});})();</script>`;
}
function injectLanguageWidget(html) {
  return html
    .replaceAll('href="/"', 'href="https://privatedao.org/?lang=en"')
    .replace("</body>", `${languageWidget()}</body>`);
}
function serviceDetailPage(service) {
  const status = capabilityStatus(service.id);
  const example = JSON.stringify({ service_id: service.id, input: serviceExample(service) }, null, 2);
  const supported = service.supportedNetworks?.length ? service.supportedNetworks.join(", ") : status === "Mainnet Live" ? "solana-mainnet-beta" : "Solana Mainnet path";
  return injectLanguageWidget(`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHtml(service.title)} | PrivateDAO Agents</title><meta name="description" content="${escapeHtml(service.output)} through the PrivateDAO Agent Exchange."><link rel="canonical" href="https://${config.domain}${servicePath(service.id)}"><meta property="og:title" content="${escapeHtml(service.title)} | PrivateDAO Agents"><meta property="og:description" content="${escapeHtml(service.output)} through the PrivateDAO Agent Exchange."><meta property="og:url" content="https://${config.domain}${servicePath(service.id)}"><style>:root{--ink:#071a32;--muted:#52657b;--line:#dbe5ef;--blue:#1769e0;--pale:#f5f9ff}*{box-sizing:border-box}body{margin:0;background:#fff;color:var(--ink);font-family:Inter,system-ui,sans-serif;line-height:1.55}main{max-width:1000px;margin:auto;padding:26px 24px 72px}header{display:flex;justify-content:space-between;gap:20px;padding-bottom:70px}.brand,a{color:var(--blue);font-weight:750;text-decoration:none}.brand{color:var(--ink);font-weight:850}.nav{display:flex;gap:18px;color:var(--muted);font-size:.9rem}.nav a{color:var(--muted)}.eyebrow{color:var(--blue);font-size:.72rem;font-weight:800;letter-spacing:.12em;text-transform:uppercase}h1{font-size:clamp(2.7rem,7vw,5.8rem);line-height:.95;letter-spacing:-.06em;max-width:760px;margin:14px 0 18px}.lead{max-width:700px;color:var(--muted);font-size:1.15rem}.meta{display:flex;flex-wrap:wrap;gap:9px;margin:26px 0}.pill{border:1px solid var(--line);border-radius:999px;padding:8px 12px;background:var(--pale);font-size:.86rem;font-weight:700}.live{color:#087f5b}.grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px;margin-top:42px}.panel{border:1px solid var(--line);border-radius:16px;padding:20px;box-shadow:0 10px 25px rgba(14,42,78,.05)}.panel h2{margin-top:0;font-size:1.2rem}.muted{color:var(--muted)}pre{overflow:auto;background:#f5f9ff;border:1px solid var(--line);border-radius:12px;padding:14px;font-size:12px}.button{display:inline-flex;background:var(--ink);color:#fff;border-radius:999px;padding:12px 18px;margin-top:18px}@media(max-width:700px){main{padding:20px 16px 56px}header{padding-bottom:45px}.nav{gap:10px;font-size:.78rem}.grid{grid-template-columns:1fr}h1{font-size:clamp(3rem,15vw,5.4rem)}}</style></head><body><main><header><a class="brand" href="/">PrivateDAO Agents</a><nav class="nav"><a href="/marketplace">Marketplace</a><a href="/connect">Build</a><a href="/.well-known/agent-card.json">Agent Card</a></nav></header><p class="eyebrow">Service capability</p><h1>${escapeHtml(service.title)}</h1><p class="lead">${escapeHtml(service.output)}. Use the service through a structured request and receive a receipt for the completed result.</p><div class="meta"><span class="pill ${status === "Mainnet Live" ? "live" : ""}">${escapeHtml(status)}</span><span class="pill">${escapeHtml(service.access === "free" ? "Free" : `${service.price} ${service.currency}`)}</span><span class="pill">${escapeHtml(supported)}</span></div><div class="grid"><section class="panel"><h2>What you provide</h2><p>${escapeHtml(service.input)}</p><h2>What happens</h2><p class="muted">PrivateDAO validates the request, runs the capability within its execution boundary, and returns a machine-readable result with a receipt when completed.</p></section><section class="panel"><h2>What you receive</h2><p>${escapeHtml(service.output)}</p><p class="muted">No claim is made beyond the evidence available for this capability and network.</p></section></div><section class="panel" style="margin-top:14px"><h2>API example</h2><pre>${escapeHtml(`curl -X POST https://${config.domain}/api/jobs -H 'content-type: application/json' -d '${example.replaceAll("'", "\\'")}'`)}</pre><a class="button" href="/connect#${escapeHtml(service.id)}">Run this service <span aria-hidden="true">→</span></a></section></main></body></html>`);
}
function publicReceiptPage(receipt, verified = false) {
  const rows = [
    ["Receipt ID", receipt.receipt_id],
    ["Service", receipt.service],
    ["Status", receipt.status],
    ["Created", receipt.created_at],
    ["Completed", receipt.completed_at],
    ["Network", receipt.network],
    ["Receipt digest", receipt.receipt_id],
    ["Evidence hash", receipt.evidence_hash],
    ...(receipt.payment_signature ? [["Payment reference", receipt.payment_signature]] : []),
  ].filter(([, value]) => value != null);
  const details = rows.map(([label, value]) => `<div class="row"><dt>${escapeHtml(label)}</dt><dd>${escapeHtml(value)}</dd></div>`).join("");
  return injectLanguageWidget(`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${verified ? "Verified receipt" : "Receipt"} | PrivateDAO Agents</title><meta name="description" content="Publicly inspectable PrivateDAO Agent Exchange receipt."><link rel="canonical" href="https://${config.domain}/verify/receipt/${encodeURIComponent(receipt.receipt_id)}"><style>:root{--ink:#071a32;--muted:#52657b;--line:#dbe5ef;--blue:#1769e0;--pale:#f5f9ff;--green:#087f5b}*{box-sizing:border-box}body{margin:0;background:#fff;color:var(--ink);font-family:Inter,system-ui,sans-serif;line-height:1.55}main{max-width:860px;margin:auto;padding:28px 24px 72px}header{display:flex;justify-content:space-between;padding-bottom:76px}.brand{color:var(--ink);font-weight:850;text-decoration:none}.nav{display:flex;gap:18px}.nav a,a{color:var(--blue);font-weight:750;text-decoration:none}.eyebrow{color:var(--blue);font-size:.72rem;font-weight:800;letter-spacing:.12em;text-transform:uppercase}h1{font-size:clamp(2.7rem,7vw,5.5rem);line-height:.95;letter-spacing:-.06em;margin:14px 0}.verified{display:inline-flex;border:1px solid #a9decf;border-radius:999px;background:#effbf7;color:var(--green);padding:8px 13px;font-weight:800}.panel{margin-top:32px;border:1px solid var(--line);border-radius:16px;padding:20px;box-shadow:0 10px 25px rgba(14,42,78,.05)}dl{margin:0}.row{display:grid;grid-template-columns:180px 1fr;gap:20px;border-bottom:1px solid var(--line);padding:13px 0}.row:last-child{border-bottom:0}.row dt{font-weight:750;color:var(--muted)}.row dd{margin:0;overflow-wrap:anywhere;font-family:ui-monospace,monospace;font-size:.84rem}.actions{display:flex;gap:14px;flex-wrap:wrap;margin-top:22px}.button{display:inline-flex;background:var(--ink);color:#fff;border-radius:999px;padding:12px 18px}.muted{color:var(--muted)}@media(max-width:650px){main{padding:20px 16px 56px}header{padding-bottom:45px}.nav{gap:10px;font-size:.8rem}.row{grid-template-columns:1fr;gap:4px}}</style></head><body><main><header><a class="brand" href="/">PrivateDAO Agents</a><nav class="nav"><a href="/marketplace">Marketplace</a><a href="/connect">Build</a></nav></header><p class="eyebrow">Public evidence</p><h1>${verified ? "Receipt verified." : "Job receipt."}</h1><span class="verified">✓ ${escapeHtml(receipt.status || "VERIFIED")}</span><section class="panel"><dl>${details}</dl></section><p class="muted">This page exposes receipt metadata and hashes only. It does not expose submitted inputs, private witnesses, secrets or confidential workflow data.</p><div class="actions"><a class="button" href="/verify/receipt/${encodeURIComponent(receipt.receipt_id)}">Verify receipt</a><a href="/api/receipts/${encodeURIComponent(receipt.receipt_id)}">View machine receipt</a></div></main></body></html>`);
}
function marketplacePage() {
  const cards = SERVICES.map((service) => {
    const price = service.access === "free" ? "Free to try" : `${service.price} ${service.currency}`;
    return `<article class="card"><div class="tag">${escapeHtml(service.access)}</div><h2>${escapeHtml(service.title)}</h2><p>${escapeHtml(service.output)}.</p><dl><div><dt>Input</dt><dd>${escapeHtml(service.input)}</dd></div><div><dt>Price</dt><dd>${escapeHtml(price)}</dd></div></dl><a class="action" href="${servicePath(service.id)}">View service <span aria-hidden="true">→</span></a></article>`;
  }).join("");
  return injectLanguageWidget(`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="icon" href="data:,"><title>Agent Marketplace | PrivateDAO</title><meta name="description" content="Discover PrivateDAO services for verification, evidence and agent workflows."><style>
:root{color-scheme:light;--ink:#081b33;--muted:#52657c;--line:#dbe5f0;--blue:#1769e0;--pale:#f5f9ff}*{box-sizing:border-box}body{margin:0;font-family:Inter,ui-sans-serif,system-ui,-apple-system,sans-serif;color:var(--ink);background:#fff;line-height:1.5}main{max-width:1180px;margin:0 auto;padding:28px 24px 72px}header{display:flex;align-items:center;justify-content:space-between;gap:20px;padding-bottom:76px}header a{color:var(--ink);text-decoration:none;font-weight:700}.brand{display:flex;align-items:center;gap:10px}.mark{width:28px;height:28px;border:2px solid var(--blue);border-radius:9px;display:grid;place-items:center;color:var(--blue);font-weight:900}.nav{display:flex;gap:18px;color:var(--muted);font-size:.93rem}.nav a{color:var(--muted)}.eyebrow{color:var(--blue);font-size:.76rem;font-weight:800;letter-spacing:.12em;text-transform:uppercase}h1{font-size:clamp(2.8rem,7vw,5.8rem);line-height:.98;letter-spacing:-.055em;max-width:820px;margin:16px 0 22px}h1 span{color:var(--blue)}.intro{max-width:660px;color:var(--muted);font-size:1.15rem}.hero{display:flex;justify-content:space-between;gap:40px;align-items:end;margin-bottom:62px}.hero-copy{flex:1}.hero-note{max-width:280px;border-left:3px solid var(--blue);padding:6px 0 6px 18px;color:var(--muted)}.actions{display:flex;gap:12px;flex-wrap:wrap;margin-top:28px}.button,.action{display:inline-flex;align-items:center;justify-content:space-between;gap:14px;border-radius:999px;padding:12px 18px;text-decoration:none;font-weight:750}.button{background:var(--ink);color:#fff}.button.alt{background:var(--pale);color:var(--ink);border:1px solid var(--line)}.section-head{display:flex;justify-content:space-between;align-items:end;gap:20px;margin:0 0 18px}.section-head p{color:var(--muted);margin:0}.grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px}.card{border:1px solid var(--line);border-radius:18px;padding:22px;background:#fff;min-height:260px;display:flex;flex-direction:column;box-shadow:0 10px 30px rgba(14,42,78,.05)}.card:hover{border-color:#9ebeea;box-shadow:0 16px 34px rgba(14,42,78,.1)}.tag{color:var(--blue);font-size:.72rem;font-weight:800;letter-spacing:.1em;text-transform:uppercase}.card h2{font-size:1.24rem;margin:10px 0 8px}.card p{color:var(--muted);margin:0 0 18px}.card dl{border-top:1px solid var(--line);margin:0;padding-top:12px;display:grid;gap:8px;color:var(--muted);font-size:.88rem}.card dl div{display:flex;justify-content:space-between;gap:12px}.card dt{font-weight:700}.card dd{margin:0;text-align:right}.action{margin-top:auto;padding:10px 0 0;color:var(--blue)}footer{border-top:1px solid var(--line);margin-top:58px;padding-top:20px;color:var(--muted);font-size:.9rem;display:flex;justify-content:space-between;gap:20px}footer a{color:var(--blue)}@media(max-width:760px){main{padding:20px 16px 48px}header{padding-bottom:48px}.nav{gap:10px;font-size:.8rem}.hero{display:block}.hero-note{margin-top:28px}.grid{grid-template-columns:1fr}h1{font-size:clamp(3rem,16vw,5rem)}footer{display:block}footer p{margin:6px 0}}
</style></head><body><main><header><a class="brand" href="/"><span class="mark">P</span><span>PrivateDAO</span></a><nav class="nav" aria-label="Primary"><a href="/connect">Build with agents</a><a href="/.well-known/agent-card.json">Agent Card</a><a href="https://privatedao.org/?lang=en" rel="noreferrer">PrivateDAO</a></nav></header><section class="hero"><div class="hero-copy"><div class="eyebrow">PrivateDAO Agent Exchange</div><h1>Services for agents.<br><span>Evidence for decisions.</span></h1><p class="intro">Discover machine-native services for verification, intelligence and agent workflows. Start with a free check, then pay only for the result you need.</p><div class="actions"><a class="button" href="/connect">Connect an agent <span aria-hidden="true">→</span></a><a class="button alt" href="/api/services">View service API <span aria-hidden="true">↗</span></a></div></div><p class="hero-note">Solana Mainnet execution<br>Finalized receipts<br>Quote-first payments</p></section><section><div class="section-head"><div><div class="eyebrow">Service catalog</div><h2>Choose a capability</h2></div><p>Every completed job returns a verifiable receipt.</p></div><div class="grid">${cards}</div></section><footer><span>PrivateDAO Agent Exchange</span><span><a href="/openapi.json">OpenAPI</a> · <a href="/mcp">MCP</a> · <a href="/a2a">A2A</a></span></footer></main></body></html>`);
}
function agentHomePage() {
  const free = SERVICES.filter((service) => service.access === "free");
  const paid = SERVICES.filter((service) => service.access === "paid");
  const serviceCards = [
    {
      eyebrow: "Start here",
      title: "Verify an answer",
      copy: "Run a free evidence check and receive a receipt that can be inspected independently.",
      services: free.map((service) => service.title).join(" · "),
      href: "/connect",
      label: "Try verification",
    },
    {
      eyebrow: "Intelligence",
      title: "Investigate with evidence",
      copy: "Use bounded intelligence services when an agent needs more context before making a decision.",
      services: paid.filter((service) => service.id !== "agent.match" && service.id !== "sponsored.discovery" && service.id !== "intelligence.synthesize").slice(0, 6).map((service) => service.title).join(" · "),
      href: "/marketplace",
      label: "Explore services",
    },
    {
      eyebrow: "Agent workflows",
      title: "Find and coordinate providers",
      copy: "Discover capabilities, match agents, and keep the resulting workflow tied to evidence.",
      services: paid.filter((service) => ["agent.match", "sponsored.discovery", "intelligence.synthesize"].includes(service.id)).map((service) => service.title).join(" · "),
      href: "/connect",
      label: "Connect an agent",
    },
  ];
  const cards = serviceCards.map((card) => `<article class="product"><p class="eyebrow">${escapeHtml(card.eyebrow)}</p><h2>${escapeHtml(card.title)}</h2><p>${escapeHtml(card.copy)}</p><p class="service-list">${escapeHtml(card.services)}</p><a href="${card.href}" class="text-link">${escapeHtml(card.label)} <span aria-hidden="true">→</span></a></article>`).join("");
  const structuredData = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "PrivateDAO Agent Exchange",
    url: `https://${config.domain}/`,
    publisher: { "@type": "Organization", name: "PrivateDAO", url: "https://privatedao.org" },
  }).replaceAll("<", "\\u003c");
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>PrivateDAO Agents | Evidence for decisions</title><meta name="description" content="PrivateDAO Agents connects autonomous systems to verification, intelligence and workflow services with evidence-bound results."><link rel="canonical" href="https://${config.domain}/"><meta property="og:type" content="website"><meta property="og:site_name" content="PrivateDAO"><meta property="og:title" content="PrivateDAO Agents | Evidence for decisions"><meta property="og:description" content="Discover agent services for verification, intelligence and coordinated workflows."><meta property="og:url" content="https://${config.domain}/"><meta name="twitter:card" content="summary"><meta name="twitter:title" content="PrivateDAO Agents"><meta name="twitter:description" content="Evidence-bound services for autonomous systems."><script type="application/ld+json">${structuredData}</script><style>
:root{color-scheme:light;--ink:#071a32;--muted:#52657b;--line:#dbe5ef;--blue:#1769e0;--blue-dark:#0b3f99;--pale:#f5f9ff;--green:#087f5b}*{box-sizing:border-box}body{margin:0;background:#fff;color:var(--ink);font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;line-height:1.55}main{max-width:1180px;margin:0 auto;padding:26px 24px 72px}header{display:flex;align-items:center;justify-content:space-between;gap:24px;padding-bottom:88px}.brand{display:flex;align-items:center;gap:10px;color:var(--ink);font-weight:800;text-decoration:none}.mark{display:grid;place-items:center;width:30px;height:30px;border:2px solid var(--blue);border-radius:9px;color:var(--blue);font-weight:900}.nav{display:flex;gap:20px;font-size:.92rem}.nav a{color:var(--muted);text-decoration:none}.nav a:hover,.text-link:hover{color:var(--blue-dark)}.eyebrow{margin:0;color:var(--blue);font-size:.72rem;font-weight:800;letter-spacing:.12em;text-transform:uppercase}.hero{display:grid;grid-template-columns:minmax(0,1fr) 280px;align-items:end;gap:48px;margin-bottom:86px}.hero h1{max-width:820px;margin:14px 0 22px;font-size:clamp(3.2rem,8vw,7.4rem);line-height:.92;letter-spacing:-.06em}.hero h1 span{color:var(--blue)}.lead{max-width:680px;margin:0;color:var(--muted);font-size:1.18rem}.note{border-left:3px solid var(--blue);padding:8px 0 8px 18px;color:var(--muted);font-size:.95rem}.actions{display:flex;flex-wrap:wrap;gap:12px;margin-top:30px}.button{display:inline-flex;gap:14px;align-items:center;border-radius:999px;padding:12px 18px;background:var(--ink);color:#fff;text-decoration:none;font-weight:750}.button.secondary{border:1px solid var(--line);background:var(--pale);color:var(--ink)}.section{border-top:1px solid var(--line);padding-top:26px}.section-head{display:flex;justify-content:space-between;align-items:end;gap:24px;margin-bottom:18px}.section-head h2{margin:6px 0 0;font-size:clamp(1.8rem,3vw,2.6rem);letter-spacing:-.04em}.section-head p{max-width:340px;margin:0;color:var(--muted)}.grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px}.product{display:flex;flex-direction:column;min-height:270px;padding:24px;border:1px solid var(--line);border-radius:18px;background:#fff;box-shadow:0 12px 30px rgba(14,42,78,.05)}.product h2{margin:10px 0 8px;font-size:1.35rem}.product>p:not(.eyebrow):not(.service-list){margin:0;color:var(--muted)}.service-list{margin:20px 0;color:var(--green);font-size:.85rem;font-weight:700}.text-link{display:inline-flex;gap:10px;margin-top:auto;color:var(--blue);font-weight:800;text-decoration:none}.how{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-top:16px}.step{padding:16px;border:1px solid var(--line);border-radius:14px;background:var(--pale)}.step strong{display:block;margin-bottom:6px}.step span{color:var(--muted);font-size:.9rem}footer{display:flex;justify-content:space-between;gap:20px;margin-top:70px;padding-top:20px;border-top:1px solid var(--line);color:var(--muted);font-size:.9rem}footer a{color:var(--blue);text-decoration:none}@media(max-width:760px){main{padding:20px 16px 50px}header{padding-bottom:54px}.nav{gap:11px;font-size:.78rem}.hero{display:block;margin-bottom:62px}.note{margin-top:30px}.hero h1{font-size:clamp(3.2rem,16vw,5.5rem)}.grid,.how{grid-template-columns:1fr}.section-head{display:block}.section-head p{margin-top:8px}footer{display:block}footer p{margin:6px 0}}
</style></head><body><main><header><a class="brand" href="/"><span class="mark">P</span><span>PrivateDAO Agents</span></a><nav class="nav" aria-label="Primary"><a href="/marketplace">Marketplace</a><a href="/connect">Build</a><a href="/.well-known/agent-card.json">Agent Card</a></nav></header><section class="hero"><div><p class="eyebrow">PrivateDAO Agent Exchange</p><h1>Evidence for<br><span>better decisions.</span></h1><p class="lead">Connect autonomous systems to practical services for verification, intelligence and coordinated workflows. Start with a free check, then pay only when a deeper result is useful.</p><div class="actions"><a class="button" href="/connect">Connect an agent <span aria-hidden="true">→</span></a><a class="button secondary" href="/marketplace">Browse capabilities</a></div></div><p class="note">Machine-native services<br>Solana Mainnet execution<br>Verifiable receipts</p></section><section class="section"><div class="section-head"><div><p class="eyebrow">What agents can do</p><h2>Choose the capability.</h2></div><p>Each completed job returns a receipt. The machine interfaces remain available for direct integration.</p></div><div class="grid">${cards}</div></section><section class="section" style="margin-top:64px"><div class="section-head"><div><p class="eyebrow">A clear path from request to evidence</p><h2>Simple for people. Precise for machines.</h2></div><p>PrivateDAO separates the human entry point from the protocols that agents use underneath.</p></div><div class="how"><div class="step"><strong>1. Discover</strong><span>Read the Agent Card or service catalog.</span></div><div class="step"><strong>2. Request</strong><span>Send a structured job to the service.</span></div><div class="step"><strong>3. Receive</strong><span>Get the result and its receipt.</span></div><div class="step"><strong>4. Verify</strong><span>Inspect the evidence independently.</span></div></div></section><footer><span>PrivateDAO Agents · part of the PrivateDAO ecosystem</span><span><a href="/openapi.json">OpenAPI</a> · <a href="/mcp">MCP</a> · <a href="/a2a">A2A</a></span></footer></main></body></html>`;
}
function paymentPage(jobId) {
  const safeJobId = JSON.stringify(jobId);
  return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>PrivateDAO payment</title><style>body{font-family:system-ui;max-width:560px;margin:48px auto;padding:24px;background:#080b12;color:#f4f7fb}button{padding:14px 18px;border:0;border-radius:10px;background:#14f195;color:#061016;font-weight:700;cursor:pointer}pre{white-space:pre-wrap;color:#b8c4d4}</style></head><body><h1>PrivateDAO payment</h1><p>Connect Phantom to pay securely on Solana Mainnet.</p><button id="pay">Connect Phantom and pay</button><pre id="status">Ready</pre><script type="module">
const jobId=${safeJobId},status=document.getElementById("status"),button=document.getElementById("pay");
async function run(){try{const {PublicKey,Transaction,TransactionInstruction,SystemProgram}=await import("https://esm.sh/@solana/web3.js@1.98.4"),spl=await import("https://esm.sh/@solana/spl-token@0.4.14");if(!window.solana?.isPhantom)throw new Error("Phantom wallet was not detected");const wallet=await window.solana.connect(),payer=new PublicKey(wallet.publicKey.toString()),query=new URLSearchParams(location.search),sourceHint=query.get("sourceTokenAccount"),expectedPayer=query.get("payer");if(expectedPayer&&payer.toBase58()!==expectedPayer)throw new Error("Switch Phantom to the wallet that owns the USDC source account");const built=await (await fetch("/api/jobs/"+encodeURIComponent(jobId)+"/payment-transaction",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({payer:payer.toString(),sourceTokenAccount:sourceHint||undefined})})).json();if(!built.recentBlockhash)throw new Error(built.message||"payment transaction unavailable");const memoProgram=new PublicKey("MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr"),tx=new Transaction();if(built.currency==="SOL"){tx.add(SystemProgram.transfer({fromPubkey:payer,toPubkey:new PublicKey(built.treasuryOwner),lamports:Number(built.amountBaseUnits)}));}else{if(!built.sourceTokenAccount)throw new Error(built.message||"A funded USDC token account is required");const mint=new PublicKey(built.mint),source=new PublicKey(built.sourceTokenAccount),destination=new PublicKey(built.treasuryTokenAccount),treasuryOwner=new PublicKey(built.treasuryOwner);tx.add(spl.createAssociatedTokenAccountIdempotentInstruction(payer,destination,treasuryOwner,mint,spl.TOKEN_PROGRAM_ID,spl.ASSOCIATED_TOKEN_PROGRAM_ID),spl.createTransferCheckedInstruction(source,mint,destination,payer,BigInt(built.amountBaseUnits),6,[],spl.TOKEN_PROGRAM_ID));}tx.add(new TransactionInstruction({programId:memoProgram,keys:[{pubkey:payer,isSigner:true,isWritable:false}],data:new TextEncoder().encode(built.paymentReference)}));tx.feePayer=payer;tx.recentBlockhash=built.recentBlockhash;const sent=await window.solana.signAndSendTransaction(tx);status.textContent="Transaction sent. Waiting for finality...";let result;for(let i=0;i<20;i++){result=await (await fetch("/api/jobs/"+encodeURIComponent(jobId)+"/payment",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({signature:sent.signature})})).json();if(result.receipt||result.status==="completed")break;await new Promise(r=>setTimeout(r,3000));}status.textContent=JSON.stringify({...result,signature:sent.signature},null,2);}catch(error){status.textContent=error.message||String(error);}}button.onclick=run;
</script></body></html>`;
}

function partnershipPaymentPage(id) {
  const safeId = JSON.stringify(id);
  return [
    "<!doctype html><html lang=\"en\"><head><meta charset=\"utf-8\"><meta name=\"viewport\" content=\"width=device-width,initial-scale=1\"><title>Featured Partner payment | PrivateDAO</title><style>body{font-family:system-ui,sans-serif;max-width:620px;margin:42px auto;padding:24px;color:#081b33}button{padding:13px 18px;border:0;border-radius:10px;background:#1769e0;color:#fff;font-weight:800;cursor:pointer}pre{white-space:pre-wrap;background:#f5f9ff;padding:16px;border-radius:12px}</style></head><body><p><a href=\"/partners\">← Featured Partners</a></p><h1>Become a Featured Partner</h1><p>This is a real Solana Mainnet USDC payment. MCP verification and technical access are independent of sponsorship.</p><button id=\"pay\">Connect wallet and pay $100 USDC</button><pre id=\"status\">Ready</pre><script>",
    "const campaignId=" + safeId + ",status=document.getElementById(\"status\"),button=document.getElementById(\"pay\");",
    "async function run(){try{const intent=await (await fetch(\"/api/partnerships/\"+encodeURIComponent(campaignId)+\"/payment-intent\")).json();if(intent.status===\"paid\"){status.textContent=\"This campaign is already paid.\";return;}const web3=await import(\"https://esm.sh/@solana/web3.js@1.98.4\"),spl=await import(\"https://esm.sh/@solana/spl-token@0.4.14\");if(!window.solana)throw new Error(\"A Solana wallet was not detected\");const wallet=await window.solana.connect(),payer=new web3.PublicKey(wallet.publicKey.toString());const built=await (await fetch(\"/api/partnerships/\"+encodeURIComponent(campaignId)+\"/payment-transaction\",{method:\"POST\",headers:{\"content-type\":\"application/json\"},body:JSON.stringify({payer:payer.toBase58()})})).json();if(!built.recentBlockhash)throw new Error(built.message||\"payment transaction unavailable\");const mint=new web3.PublicKey(built.mint),source=new web3.PublicKey(built.sourceTokenAccount),destination=new web3.PublicKey(built.treasuryTokenAccount),owner=new web3.PublicKey(built.treasuryOwner),tx=new web3.Transaction();tx.add(spl.createAssociatedTokenAccountIdempotentInstruction(payer,destination,owner,mint,spl.TOKEN_PROGRAM_ID,spl.ASSOCIATED_TOKEN_PROGRAM_ID),spl.createTransferCheckedInstruction(source,mint,destination,payer,BigInt(built.amountBaseUnits),6,[],spl.TOKEN_PROGRAM_ID),new web3.TransactionInstruction({programId:new web3.PublicKey(\"MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr\"),keys:[{pubkey:payer,isSigner:true,isWritable:false}],data:new TextEncoder().encode(built.paymentReference)}));tx.feePayer=payer;tx.recentBlockhash=built.recentBlockhash;const sent=await window.solana.signAndSendTransaction(tx);status.textContent=\"Payment submitted. Waiting for finality...\";let result;for(let i=0;i<20;i++){result=await (await fetch(\"/api/partnerships/\"+encodeURIComponent(campaignId)+\"/payment\",{method:\"POST\",headers:{\"content-type\":\"application/json\"},body:JSON.stringify({signature:sent.signature,quoteId:intent.quoteId})})).json();if(result.campaign||result.status===\"paid\")break;await new Promise(function(resolve){setTimeout(resolve,3000)});}status.textContent=JSON.stringify(Object.assign({},result,{signature:sent.signature}),null,2);}catch(error){status.textContent=error.message||String(error);}}button.onclick=run;</script></body></html>",
  ].join("");
}
function registryRegistrationPage() {
  const nonce = randomUUID().replaceAll("-", "");
  return { nonce, body: `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>8004 Agent Registration | PrivateDAO</title><style>body{font-family:system-ui,sans-serif;max-width:900px;margin:0 auto;padding:28px 18px;background:#071018;color:#eef5f7;line-height:1.5}h1{line-height:1.1}.muted{color:#a9bbc2}button{border:0;border-radius:8px;padding:12px 16px;background:#14f195;color:#061016;font-weight:700;cursor:pointer;margin:6px 6px 6px 0}button:disabled{opacity:.45;cursor:not-allowed}pre{white-space:pre-wrap;overflow:auto;background:#02070a;border:1px solid #29424b;border-radius:8px;padding:14px;font-size:13px}.warning{border-left:3px solid #f5c451;padding:10px 14px;background:#17202a}a{color:#7de2c0}</style></head><body><p class="muted">PrivateDAO Agent Exchange · 8004 Solana Agent Registry</p><h1>Review registration before signing</h1><p class="muted">This page builds a fresh Mainnet transaction only after you request it. Phantom remains the only owner signer. The Asset signer is generated in browser memory and is never sent to PrivateDAO or persisted.</p><p class="warning">The Asset secret is intentionally memory-only. Reloading this page loses it. Do not use this page as a key backup or for later asset management.</p><p><button id="build">Connect wallet and build fresh transaction</button><button id="sign" disabled>Review and sign in Phantom</button></p><pre id="status">Ready. No transaction exists yet.</pre><pre id="details">Build the transaction to display program, accounts, instructions, cost, and expiry.</pre><p class="muted"><a href="/.well-known/agent-card.json">Agent Card</a> · <a href="https://8004.qnt.sh/" rel="noreferrer">8004 registry</a></p><script nonce="${nonce}">
const OWNER="2BJ4ezxqV9YJXc38D9duKBkdn4su4jE1beKUHwH663sL", URI="https://agents.privatedao.org/.well-known/agent-card.json", PROGRAM="8oo4dC4JvBLwy5tGgiH3WwK4B9PWxL9Z4XjA2jzkQMbQ", RPC="https://api.mainnet-beta.solana.com", COMPUTE="ComputeBudget111111111111111111111111111111";
const status=document.getElementById("status"),details=document.getElementById("details"),buildButton=document.getElementById("build"),signButton=document.getElementById("sign");
let state=null;
const show=(el,value)=>el.textContent=typeof value==="string"?value:JSON.stringify(value,null,2);
function keyMeta(key){return {address:key.pubkey.toBase58(),signer:key.isSigner,writable:key.isWritable};}
function assertTransaction(tx,owner,asset){
  if(tx.instructions.length!==2)throw new Error("Unexpected instruction count; refusing to sign");
  const compute=tx.instructions[0], register=tx.instructions[1];
  if(compute.programId.toBase58()!==COMPUTE||compute.data.toString("hex")!=="02801a0600")throw new Error("Unexpected compute-budget instruction");
  if(register.programId.toBase58()!==PROGRAM)throw new Error("Unexpected registry program");
  if(register.keys.length!==8)throw new Error("Unexpected register account layout");
  if(register.keys[3].pubkey.toBase58()!==asset.publicKey.toBase58()||!register.keys[3].isSigner||!register.keys[3].isWritable)throw new Error("Asset signer metadata mismatch");
  if(register.keys[5].pubkey.toBase58()!==owner.toBase58()||!register.keys[5].isSigner||!register.keys[5].isWritable)throw new Error("Owner signer metadata mismatch");
  if(register.data.length<9||register.data[register.data.length-1]!==0)throw new Error("ATOM is not disabled in register_with_options");
  const forbidden=["TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA","TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb","AToMw53aiPQ8j7iHVb4fGt6nzUNxUhcPc3tbPBZuzVVb"];
  if(register.keys.some(k=>forbidden.includes(k.pubkey.toBase58())))throw new Error("Forbidden token/delegation account in registration");
  return {compute:{programId:compute.programId.toBase58(),dataHex:compute.data.toString("hex"),accounts:compute.keys.map(keyMeta)},register:{programId:register.programId.toBase58(),dataHex:register.data.toString("hex"),accounts:register.keys.map(keyMeta)}};
}
async function build(){
  try{
    signButton.disabled=true; show(status,"Checking the live Agent Card and connecting Phantom...");
    const cardResponse=await fetch(URI,{cache:"no-store"}); if(!cardResponse.ok)throw new Error("Agent Card is not reachable: HTTP "+cardResponse.status); const liveCard=await cardResponse.json(); if(liveCard.name!=="PrivateDAO Agent Exchange")throw new Error("Unexpected Agent Card identity");
    const provider=window.phantom?.solana||window.solana;
    if(!provider)throw new Error("Open this page inside Phantom Browser or a browser with Phantom installed");
    const wallet=await provider.connect({onlyIfTrusted:false}); if(wallet.publicKey.toBase58()!==OWNER)throw new Error("Connect the required owner wallet: "+OWNER);
    const [{SolanaSDK},{Connection,PublicKey,Keypair,Transaction}]=await Promise.all([import("https://cdn.jsdelivr.net/npm/8004-solana@0.8.3/+esm"),import("https://cdn.jsdelivr.net/npm/@solana/web3.js@1.98.4/+esm")]);
    const connection=new Connection(RPC,"confirmed"),owner=new PublicKey(OWNER),asset=Keypair.generate(),sdk=new SolanaSDK({cluster:"mainnet-beta",rpcUrl:RPC});
    const prepared=await sdk.registerAgent(URI,{skipSend:true,signer:owner,feePayer:owner,assetPubkey:asset.publicKey,atomEnabled:false});
    const encoded=String(prepared.transaction||"").trim().replace(/-/g,"+").replace(/_/g,"/").replaceAll(" ",""); if(!encoded)throw new Error("8004 SDK returned an empty transaction"); const padded=encoded+"=".repeat((4-encoded.length%4)%4); const bytes=Uint8Array.from(atob(padded),c=>c.charCodeAt(0)),tx=Transaction.from(bytes),check=assertTransaction(tx,owner,asset),fee=await connection.getFeeForMessage(tx.compileMessage(),"confirmed");
    state={connection,owner,asset,tx,prepared,check,agentPda:tx.instructions[1].keys[2].pubkey.toBase58()};
    show(details,{programId:PROGRAM,network:"solana-mainnet-beta",purpose:"Create one on-chain 8004 Agent identity pointing at the PrivateDAO Agent Card",owner:OWNER,assetPublicKey:asset.publicKey.toBase58(),agentPda:state.agentPda,agentUri:URI,instructions:[check.compute,check.register],requiredSigners:tx.signatures.map(s=>({publicKey:s.publicKey.toBase58(),signaturePresent:Boolean(s.signature)})),estimatedNetworkFeeLamports:fee.value,officialRegistrationEstimate:"approximately 0.009 SOL including registry rent",blockhash:prepared.blockhash,lastValidBlockHeight:prepared.lastValidBlockHeight,"NO TOKEN TRANSFER":"YES","NO DELEGATION":"YES","NO APPROVAL":"YES","NO AUTHORITY TRANSFER":"YES","NO SWAP":"YES","NO UNRELATED INSTRUCTION":"YES"});
    show(status,"Fresh transaction ready. Review every field above before pressing the Phantom button."); signButton.disabled=false;
  }catch(error){show(status,error.message||String(error));}
}
async function sign(){
  try{if(!state)throw new Error("Build a fresh transaction first"); const provider=window.phantom?.solana||window.solana; if(!provider)throw new Error("Phantom provider is unavailable; reopen this page inside Phantom Browser"); signButton.disabled=true; state.tx.partialSign(state.asset); assertTransaction(state.tx,state.owner,state.asset); const signed=await provider.signTransaction(state.tx); const signature=await state.connection.sendRawTransaction(signed.serialize(),{skipPreflight:false,maxRetries:3}); show(status,"Submitted. Waiting for Finalized...\\n"+signature); const result=await state.connection.confirmTransaction({signature,blockhash:state.prepared.blockhash,lastValidBlockHeight:state.prepared.lastValidBlockHeight},"finalized"); if(result.value.err)throw new Error("Registration failed: "+JSON.stringify(result.value.err)); const agentInfo=await state.connection.getAccountInfo(state.asset.publicKey,"finalized"),pdaInfo=await state.connection.getAccountInfo(new (await import("https://cdn.jsdelivr.net/npm/@solana/web3.js@1.98.4/+esm")).PublicKey(state.agentPda),"finalized"); if(!agentInfo||!pdaInfo)throw new Error("Finalized transaction did not expose the expected Agent identity accounts"); show(details,{status:"FINALIZED",signature,explorer:"https://explorer.solana.com/tx/"+signature+"?cluster=mainnet-beta",assetPublicKey:state.asset.publicKey.toBase58(),agentPda:state.agentPda,agentUri:URI}); show(status,"Registration finalized. The Agent identity is now public on Solana Mainnet.");
  }catch(error){show(status,error.message||String(error));signButton.disabled=false;}
}
buildButton.onclick=build; signButton.onclick=sign;
</script></body></html>` };
}

async function buildPaymentTransaction(jobId, payerText, sourceTokenAccountText = "") {
  if (!/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(payerText || "")) throw new Error("valid payer wallet is required");
  const job = await (await store()).get("Jobs", jobId);
  const quote = (await (await store()).list("Quotes")).find((item) => item.job_id === jobId);
  if (!job || !quote) throw Object.assign(new Error("invoice not found"), { statusCode: 404 });
  if (job.status !== "awaiting_payment") throw new Error("job is not awaiting payment");
  if (new Date(quote.expires_at) < new Date()) throw new Error("invoice expired");
  if (quote.currency === "SOL") {
    const latest = await readRpc(config, "getLatestBlockhash", [{ commitment: "finalized" }]);
    return { payer: payerText, currency: "SOL", treasuryOwner: quote.treasuryOwner, amountBaseUnits: String(quote.amountAtomic), paymentReference: quote.paymentReference, recentBlockhash: latest.result.value.blockhash, lastValidBlockHeight: latest.result.value.lastValidBlockHeight, expiresAt: quote.expires_at };
  }
  let source = null;
  if (sourceTokenAccountText) {
    if (!/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(sourceTokenAccountText))
      throw Object.assign(new Error("valid source token account is required"), { statusCode: 400 });
    source = { pubkey: sourceTokenAccountText };
  }
  try {
    if (source) {
      const latest = await readRpc(config, "getLatestBlockhash", [{ commitment: "finalized" }]);
  return { payer: payerText, sourceTokenAccount: source.pubkey, mint: quote.mint, treasuryOwner: quote.treasuryOwner, treasuryTokenAccount: quote.treasuryTokenAccount, amountBaseUnits: String(quote.amountAtomic), paymentReference: quote.paymentReference, recentBlockhash: latest.result.value.blockhash, lastValidBlockHeight: latest.result.value.lastValidBlockHeight, expiresAt: quote.expires_at };
    }
    const accounts = await readRpc(config, "getTokenAccountsByOwner", [
      payerText,
      { mint: quote.mint },
      { encoding: "jsonParsed" },
    ]);
    source = (accounts.result?.value || []).find(
      (item) =>
        Number(item.account?.data?.parsed?.info?.tokenAmount?.amount || 0) >=
        Number(quote.amountAtomic),
    );
  } catch {
    try {
      const accounts = await readRpc(config, "getTokenAccountsByOwner", [
        payerText,
        { programId: "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA" },
        { encoding: "jsonParsed" },
      ]);
      source = (accounts.result?.value || []).find(
        (item) =>
          item.account?.data?.parsed?.info?.mint === quote.mint &&
          Number(item.account?.data?.parsed?.info?.tokenAmount?.amount || 0) >=
            Number(quote.amountAtomic),
      );
    } catch {
      throw Object.assign(
        new Error("USDC account lookup is temporarily unavailable; retry shortly"),
        { statusCode: 503 },
      );
    }
  }
  if (!source)
    throw Object.assign(
      new Error("payer wallet has no funded Solana USDC token account"),
      { statusCode: 402 },
    );
  const latest = await readRpc(config, "getLatestBlockhash", [{ commitment: "finalized" }]);
  return { payer: payerText, sourceTokenAccount: source?.pubkey || null, mint: quote.mint, treasuryTokenAccount: quote.treasuryTokenAccount, amountBaseUnits: String(quote.amountAtomic), paymentReference: quote.paymentReference, recentBlockhash: latest.result.value.blockhash, lastValidBlockHeight: latest.result.value.lastValidBlockHeight, expiresAt: quote.expires_at };
}
const collectionFor = (name) =>
  ({
    listings: "Listings",
    agreements: "Agreements",
    logistics: "Logistics",
    revenue: "Revenue",
  })[name] || name;
function adminTokenAuthorized(event) {
  const token = event.headers?.["x-pdao-admin-smoke"] || event.headers?.["X-Pdao-Admin-Smoke"] || event.headers?.["X-PDAO-Admin-Smoke"];
  return Boolean(config.adminSmokeToken && token === config.adminSmokeToken);
}
function partnershipDates(campaign) {
  const start = Date.parse(campaign.start_at || campaign.start || "");
  const end = Date.parse(campaign.end_at || campaign.expiry || "");
  return { start, end };
}
function isActivePartnership(campaign, at = Date.now()) {
  const { start, end } = partnershipDates(campaign);
  return campaign.type === "featured_partner" && ["active", "scheduled"].includes(campaign.campaign_status) && campaign.payment_status === "paid" && Number.isFinite(start) && Number.isFinite(end) && start <= at && at < end;
}
async function activePartnerships() {
  return (await (await store()).list("Campaigns")).filter((campaign) => isActivePartnership(campaign));
}
async function createPartnership(body) {
  const agentId = String(body.agentId || "").trim();
  if (!agentId) throw Object.assign(new Error("agentId is required"), { statusCode: 400 });
  const agent = await (await store()).get("Registry", agentId);
  if (!agent) throw Object.assign(new Error("registered agent not found"), { statusCode: 404 });
  const price = Number(body.priceUsd);
  if (!Number.isFinite(price) || price < 100) throw Object.assign(new Error("Featured Partner price must be at least 100 USD"), { statusCode: 400 });
  const startAt = new Date(body.startAt || body.start || "");
  const endAt = new Date(body.endAt || body.end || body.expiry || "");
  if (!Number.isFinite(startAt.getTime()) || !Number.isFinite(endAt.getTime()) || endAt <= startAt) throw Object.assign(new Error("valid startAt and endAt are required"), { statusCode: 400 });
  const paymentStatus = ["pending", "failed", "refunded"].includes(body.paymentStatus) ? body.paymentStatus : "pending";
  const campaign = {
    id: `campaign_${randomUUID()}`,
    type: "featured_partner",
    package: "Featured Partner",
    agentId,
    agentName: agent.name,
    price_usd: price,
    payment_status: paymentStatus,
    campaign_status: "draft",
    start_at: startAt.toISOString(),
    end_at: endAt.toISOString(),
    deliverables: Array.isArray(body.deliverables) ? body.deliverables.map(String).slice(0, 20) : [],
    deliverables_completed: Boolean(body.deliverablesCompleted),
    disclosure: "Featured Partner / Sponsored",
    payment_url: `https://${config.domain}/partners/REPLACE_AFTER_CREATE/pay`,
    created_at: now(),
    updated_at: now(),
  };
  campaign.payment_url = `https://${config.domain}/partners/${encodeURIComponent(campaign.id)}/pay`;
  await (await store()).put("Campaigns", campaign.id, campaign, true);
  return campaign;
}
async function updatePartnership(id, body) {
  const current = await (await store()).get("Campaigns", id);
  if (!current || current.type !== "featured_partner") throw Object.assign(new Error("partnership not found"), { statusCode: 404 });
  const next = { ...current };
  if (body.priceUsd !== undefined) {
    const price = Number(body.priceUsd);
    if (!Number.isFinite(price) || price < 100) throw Object.assign(new Error("Featured Partner price must be at least 100 USD"), { statusCode: 400 });
    next.price_usd = price;
  }
  if (body.paymentStatus !== undefined) {
    if (!["pending", "failed", "refunded"].includes(body.paymentStatus)) throw Object.assign(new Error("paid status requires a verified on-chain payment"), { statusCode: 400 });
    next.payment_status = body.paymentStatus;
  }
  if (body.startAt || body.endAt) {
    const startAt = new Date(body.startAt || next.start_at);
    const endAt = new Date(body.endAt || next.end_at);
    if (!Number.isFinite(startAt.getTime()) || !Number.isFinite(endAt.getTime()) || endAt <= startAt) throw Object.assign(new Error("invalid campaign dates"), { statusCode: 400 });
    next.start_at = startAt.toISOString();
    next.end_at = endAt.toISOString();
  }
  if (body.deliverables !== undefined) next.deliverables = Array.isArray(body.deliverables) ? body.deliverables.map(String).slice(0, 20) : [];
  if (body.deliverablesCompleted !== undefined) next.deliverables_completed = Boolean(body.deliverablesCompleted);
  if (body.active !== undefined) next.campaign_status = body.active && next.payment_status === "paid" ? "active" : "paused";
  next.updated_at = now();
  await (await store()).put("Campaigns", id, next);
  return next;
}
async function partnershipQuote(campaign) {
  const storage = await store();
  const existing = (await storage.list("Quotes")).find((quote) => quote.partnership_id === campaign.id && Date.parse(quote.expires_at) > Date.now());
  if (existing) return existing;
  const expiresAt = new Date(Date.now() + 30 * 60 * 1000);
  const quote = {
    quote_id: `pq_${randomUUID()}`,
    payment_type: "featured_partnership",
    partnership_id: campaign.id,
    amount: Number(campaign.price_usd),
    amountAtomic: Math.round(Number(campaign.price_usd) * 1e6),
    currency: "USDC",
    network: "solana-mainnet-beta",
    target_network: "agent-marketplace",
    mint: config.usdcMint,
    treasuryOwner: config.treasury,
    treasuryTokenAccount: await treasuryTokenAccount(config),
    recipient: config.treasury,
    paymentReference: `PDAO_PARTNER:${campaign.id}`,
    expires_at: expiresAt.toISOString(),
    created_at: now(),
  };
  await storage.put("Quotes", quote.quote_id, quote, true);
  return quote;
}
async function partnershipPaymentIntent(id) {
  const campaign = await (await store()).get("Campaigns", id);
  if (!campaign || campaign.type !== "featured_partner") throw Object.assign(new Error("partnership not found"), { statusCode: 404 });
  if (campaign.payment_status === "paid") return { campaignId: id, status: "paid", campaign };
  const quote = await partnershipQuote(campaign);
  return { campaignId: id, paymentType: "featured_partnership", status: "awaiting_payment", amount: quote.amount.toFixed(6), amountBaseUnits: String(quote.amountAtomic), currency: quote.currency, network: quote.network, mint: quote.mint, treasuryOwner: quote.treasuryOwner, treasuryTokenAccount: quote.treasuryTokenAccount, paymentReference: quote.paymentReference, quoteId: quote.quote_id, expiresAt: quote.expires_at, paymentUrl: `https://${config.domain}/partners/${encodeURIComponent(id)}/pay` };
}
async function buildPartnershipPaymentTransaction(id, payerText, sourceTokenAccountText = "") {
  if (!/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(payerText || "")) throw Object.assign(new Error("valid payer wallet is required"), { statusCode: 400 });
  const campaign = await (await store()).get("Campaigns", id);
  if (!campaign || campaign.type !== "featured_partner") throw Object.assign(new Error("partnership not found"), { statusCode: 404 });
  const quote = await partnershipQuote(campaign);
  if (new Date(quote.expires_at) < new Date()) throw new Error("partnership payment quote expired");
  let source = sourceTokenAccountText ? { pubkey: sourceTokenAccountText } : null;
  if (source && !/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(source.pubkey)) throw Object.assign(new Error("valid source token account is required"), { statusCode: 400 });
  if (!source) {
    const accounts = await readRpc(config, "getTokenAccountsByOwner", [payerText, { mint: quote.mint }, { encoding: "jsonParsed" }]);
    source = (accounts.result?.value || []).find((item) => Number(item.account?.data?.parsed?.info?.tokenAmount?.amount || 0) >= quote.amountAtomic);
  }
  if (!source) throw Object.assign(new Error("payer wallet has no funded Solana USDC token account"), { statusCode: 402 });
  const latest = await readRpc(config, "getLatestBlockhash", [{ commitment: "finalized" }]);
  return { payer: payerText, sourceTokenAccount: source.pubkey, mint: quote.mint, treasuryOwner: quote.treasuryOwner, treasuryTokenAccount: quote.treasuryTokenAccount, amountBaseUnits: String(quote.amountAtomic), paymentReference: quote.paymentReference, recentBlockhash: latest.result.value.blockhash, lastValidBlockHeight: latest.result.value.lastValidBlockHeight, expiresAt: quote.expires_at };
}
async function submitPartnershipPayment(id, body) {
  const storage = await store();
  const campaign = await storage.get("Campaigns", id);
  if (!campaign || campaign.type !== "featured_partner") throw Object.assign(new Error("partnership not found"), { statusCode: 404 });
  if (campaign.payment_status === "paid") return { status: "paid", campaign };
  if (!body.signature || !body.quoteId) throw Object.assign(new Error("signature and quoteId are required"), { statusCode: 400 });
  const quote = (await storage.list("Quotes")).find((item) => item.partnership_id === id && item.quote_id === body.quoteId && Date.parse(item.expires_at) > Date.now());
  if (!quote) throw Object.assign(new Error("partnership payment quote not found"), { statusCode: 404 });
  const payment = await verifyPayment(config, { signature: body.signature }, quote);
  if (payment.transient) return { status: "verifying", signature: body.signature, message: payment.reason, retryAfterSeconds: 3 };
  if (!payment.ok) throw Object.assign(new Error(payment.reason), { statusCode: 402 });
  const transaction = await readRpc(config, "getTransaction", [body.signature, { commitment: "finalized", maxSupportedTransactionVersion: 0, encoding: "jsonParsed" }]);
  const instructions = transaction.result?.transaction?.message?.instructions || [];
  const memoFound = instructions.some((instruction) => instruction.program === "spl-memo" && String(instruction.parsed || "").includes(quote.paymentReference));
  if (!memoFound) throw Object.assign(new Error("payment reference does not match this partnership campaign"), { statusCode: 402 });
  const transfer = instructions.find((instruction) => instruction.program === "spl-token" && ["transfer", "transferChecked"].includes(instruction.parsed?.type) && Number(instruction.parsed?.info?.amount ?? instruction.parsed?.info?.tokenAmount?.amount) === Number(quote.amountAtomic));
  const payerWallet = transfer?.parsed?.info?.authority || transfer?.parsed?.info?.owner || null;
  const expiresAt = Date.parse(quote.expires_at);
  const paidAt = payment.blockTime ? payment.blockTime * 1000 : NaN;
  if (!Number.isFinite(paidAt) || paidAt > expiresAt) throw Object.assign(new Error("partnership payment quote expired"), { statusCode: 402 });
  const paymentId = `payment_${body.signature}`;
  const existing = await storage.get("Payments", paymentId);
  if (existing && existing.partnership_id !== id) throw Object.assign(new Error("payment signature was already used"), { statusCode: 402 });
  if (!existing) await storage.put("Payments", paymentId, { id: paymentId, signature: body.signature, payment_type: "featured_partnership", partnership_id: id, payer_wallet: payerWallet, amount: quote.amount, asset: quote.currency, network: quote.network, consumed_at: now() }, true);
  const next = { ...campaign, payment_status: "paid", campaign_status: new Date(campaign.start_at) <= new Date() ? "active" : "scheduled", payment_signature: body.signature, payer_wallet: payerWallet, paid_amount: quote.amount, paid_at: now(), payment_network: quote.network, payment_asset: quote.currency, updated_at: now() };
  await storage.put("Campaigns", id, next);
  return { status: next.campaign_status, campaign: next, payment: { signature: body.signature, block_time: payment.blockTime, network: quote.network, asset: quote.currency } };
}
async function partnersPage() {
  const campaigns = await activePartnerships();
  const cards = await Promise.all(campaigns.map(async (campaign) => {
    const agent = await (await store()).get("Registry", campaign.agentId);
    const technical = agent?.status === "connected" ? "MCP Connected" : agent?.status === "verified" ? "E2E Verified" : "Technical status unavailable";
    return `<article><p class="eyebrow">Featured Partner</p><h2><a href="/agents/${encodeURIComponent(campaign.agentId)}">${escapeHtml(campaign.agentName)}</a></h2><p>${escapeHtml(technical)} · Sponsored placement</p><p>Capabilities: ${escapeHtml((agent?.allowed_tools || agent?.capabilities || []).slice(0, 12).join(", ") || "Discovered capabilities")}</p><small>Campaign: ${escapeHtml(campaign.start_at)} → ${escapeHtml(campaign.end_at)}</small></article>`;
  })).then((items) => items.join("") || "<p>No active Featured Partners at this time.</p>");
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Featured Partners | PrivateDAO Agent Exchange</title><meta name="description" content="Active sponsored Featured Partners in the PrivateDAO Agent Marketplace."><style>body{font-family:system-ui,sans-serif;max-width:980px;margin:0 auto;padding:32px 20px;color:#081b33}a{color:#1769e0}.eyebrow{color:#1769e0;font-weight:800;letter-spacing:.12em;text-transform:uppercase;font-size:.75rem}header{display:flex;justify-content:space-between;margin-bottom:80px}section{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:16px}article{border:1px solid #dbe5f0;border-radius:16px;padding:22px}small{color:#52657c}@media(max-width:600px){header{margin-bottom:48px}}</style></head><body><header><strong><a href="/marketplace">PrivateDAO Agent Exchange</a></strong><nav><a href="/marketplace">Marketplace</a> · <a href="/connect">Build</a></nav></header><p class="eyebrow">Sponsored partnerships</p><h1>Featured Partners</h1><p>Paid promotion is disclosed separately from technical integration. Payment never creates MCP verification or execution access.</p><section>${cards}</section></body></html>`;
}
async function agentProfilePage(id) {
  const agent = await (await store()).get("Registry", id);
  if (!agent) return null;
  const campaigns = (await activePartnerships()).filter((campaign) => campaign.agentId === id);
  const pendingCampaign = (await (await store()).list("Campaigns")).find((campaign) => campaign.type === "featured_partner" && campaign.agentId === id && ["pending", "draft", "failed"].includes(campaign.payment_status));
  const technical = agent.status === "connected" ? "MCP Connected" : agent.status === "verified" ? "E2E Verified" : "Unavailable";
  const commercial = campaigns.length ? "Featured Partner / Sponsored" : "Standard Listing";
  const tools = (agent.allowed_tools || agent.capabilities || []).slice(0, 24).map((tool) => `<li>${escapeHtml(tool)}</li>`).join("") || "<li>No safe tools currently enabled</li>";
  const checkout = pendingCampaign ? `<p><a href="/partners/${encodeURIComponent(pendingCampaign.id)}/pay"><strong>Become a Featured Partner · $100 USDC</strong></a></p>` : "";
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHtml(agent.name)} | PrivateDAO Agent Marketplace</title><meta name="description" content="Technical and commercial status for ${escapeHtml(agent.name)} in the PrivateDAO Agent Marketplace."><style>body{font-family:system-ui,sans-serif;max-width:900px;margin:0 auto;padding:32px 20px;color:#081b33}a{color:#1769e0}.eyebrow{color:#1769e0;font-weight:800;letter-spacing:.12em;text-transform:uppercase;font-size:.75rem}.grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px;margin-top:28px}.panel{border:1px solid #dbe5f0;border-radius:16px;padding:22px}.status{font-size:1.2rem;font-weight:800}.muted{color:#52657c}li{margin:6px 0}@media(max-width:650px){.grid{grid-template-columns:1fr}}</style></head><body><p><a href="/marketplace">← Agent Marketplace</a></p><p class="eyebrow">Agent profile</p><h1>${escapeHtml(agent.name)}</h1><div class="grid"><section class="panel"><p class="eyebrow">Technical status</p><p class="status">${escapeHtml(technical)}</p><p class="muted">Protocol: ${escapeHtml(agent.protocol || "MCP")} · Capabilities discovered: ${escapeHtml(String((agent.capabilities || []).length))}</p><h2>Safe capabilities</h2><ul>${tools}</ul></section><section class="panel"><p class="eyebrow">Commercial status</p><p class="status">${escapeHtml(commercial)}</p><p class="muted">Paid promotion never creates MCP verification, permissions, or execution access.</p>${campaigns.length ? `<p>Campaign window: ${escapeHtml(campaigns[0].start_at)} → ${escapeHtml(campaigns[0].end_at)}</p>` : "<p>Free standard listing. No sponsored placement is active.</p>"}${checkout}</section></div></body></html>`;
}
async function listListings(query = {}) {
  const all = await (await store()).list(collectionFor("listings"));
  const partnerships = await activePartnerships();
  const external = (await (await store()).list("Registry"))
    .filter((agent) => agent.protocol === "MCP" && ["connected", "unavailable"].includes(agent.status))
    .map((agent) => ({
      id: `external_${agent.id}`,
      agentId: agent.id,
      provider: agent.name,
      service: "external-mcp",
      description: `${agent.name} external MCP server`,
      capabilities: agent.allowed_tools || [],
      protocols: ["MCP"],
      chains: agent.networks || [],
      price: null,
      asset: null,
      verificationLevel: agent.status === "connected" ? "MCP_HANDSHAKE_VERIFIED" : "MCP_HANDSHAKE_FAILED",
      status: agent.status === "connected" ? "active" : "unavailable",
      external: true,
      lastSuccessfulConnection: agent.last_successful_connection,
      unavailableReason: agent.unavailable_reason || null,
      technicalStatus: agent.status === "connected" ? "MCP Connected" : agent.status === "verified" ? "E2E Verified" : "Unavailable",
      commercialStatus: partnerships.some((campaign) => campaign.agentId === agent.id) ? "Featured Partner / Sponsored" : "Standard Listing",
    }));
  const firstParty = SERVICES.map((service) => ({
    id: `pdao_${service.id}`,
    agentId: "pdao-first-party",
    provider: "PrivateDAO",
    service: service.id,
    description: service.title,
    capabilities: [service.id],
    protocols: ["HTTP", "A2A", "MCP"],
    chains: [...LIVE_NETWORKS],
    networkCapabilities: NETWORK_CAPABILITIES,
    price: service.price,
    asset: service.currency,
    verificationLevel: "TRANSACTION_VERIFIED",
    status: "active",
    firstParty: true,
  }));
  return [...firstParty, ...external, ...all].filter(
    (x) =>
      x.status !== "paused" &&
      (!query.capability ||
        (x.capabilities || []).includes(query.capability)) &&
      (!query.protocol || (x.protocols || []).includes(query.protocol)) &&
      (!query.chain || (x.chains || []).includes(query.chain)),
  );
}
async function publishListing(body) {
  if (!body.agentId || !body.service || !body.endpoint)
    throw new Error("agentId, service and endpoint are required");
  const agent = await (await store()).get("Registry", body.agentId);
  if (!agent || agent.status !== "verified")
    throw new Error("verified agent required");
  const chains = Array.isArray(body.chains) && body.chains.length
    ? body.chains.filter((id) => networkCapability(id))
    : ["solana:mainnet-beta"];
  if (!chains.length) throw new Error("at least one supported network is required");
  const listing = {
    id: body.listingId || `listing_${randomUUID()}`,
    agentId: agent.id,
    service: body.service,
    description: body.description || "",
    endpoint: agent.url,
    capabilities: body.capabilities || [body.service],
    protocols: body.protocols || agent.protocols || ["HTTP"],
    chains,
    networkCapabilities: chains.map((id) => networkCapability(id)),
    price: Number(body.price || 0),
    asset: body.asset || "USDC",
    schema: body.schema || {},
    provenance: body.provenance || "provider-declared",
    status: "active",
    createdAt: now(),
    updatedAt: now(),
  };
  await (await store()).put("Listings", listing.id, listing, true);
  return listing;
}
async function requestLogistics(body) {
  if (!body.capability) throw new Error("capability is required");
  const candidates = (await listListings(body))
    .sort((a, b) => Number(a.price) - Number(b.price))
    .slice(0, 10);
  const firstParty = serviceById(body.capability)
    ? [
        {
          provider: "PrivateDAO",
          service: body.capability,
          price: serviceById(body.capability).price,
          asset: "USDC",
          chains: ["solana:mainnet-beta"],
          verified: true,
        },
      ]
    : [];
  const request = {
    id: `log_${randomUUID()}`,
    capability: body.capability,
    requirements: body.requirements || {},
    maxPrice: body.maxPrice ?? null,
    asset: body.asset || "USDC",
    deadline: body.deadline || null,
    preferredProtocols: body.preferredProtocols || [],
    candidates: [...firstParty, ...candidates],
    network: "solana:mainnet-beta",
    status: "quoted",
    createdAt: now(),
  };
  await (await store()).put("Logistics", request.id, request, true);
  return request;
}
async function createAgreement(body) {
  for (const field of ["buyerAgent", "providerAgent", "service", "price"])
    if (body[field] == null) throw new Error(`${field} is required`);
  const agreement = {
    id: `agr_${randomUUID()}`,
    agreementId: `agr_${randomUUID()}`,
    buyerAgent: body.buyerAgent,
    providerAgent: body.providerAgent,
    service: body.service,
    inputCommitment: digest(body.input || {}),
    price: Number(body.price),
    asset: body.asset || "USDC",
    protocolFee: Number(
      ((Number(body.price) * config.marketplaceFeeBps) / 10000).toFixed(6),
    ),
    providerAmount: Number(
      (Number(body.price) - (Number(body.price) * config.marketplaceFeeBps) / 10000).toFixed(6),
    ),
    deadline: body.deadline || null,
    deliveryRequirements: body.deliveryRequirements || {},
    status: "proposed",
    createdAt: now(),
  };
  await (await store()).put("Agreements", agreement.id, agreement, true);
  return agreement;
}
async function getAgreement(id) {
  return (await store()).get("Agreements", id);
}
async function acceptAgreement(id, body) {
  const agreement = await getAgreement(id);
  if (!agreement)
    throw Object.assign(new Error("agreement not found"), { statusCode: 404 });
  if (agreement.status !== "proposed" && agreement.status !== "quoted")
    throw new Error("agreement cannot be accepted in its current state");
  if (body.buyerAgent && body.buyerAgent !== agreement.buyerAgent)
    throw new Error("buyer agent mismatch");
  agreement.status = agreement.price > 0 ? "awaiting_payment" : "accepted";
  agreement.acceptedAt = now();
  await (await store()).put("Agreements", id, agreement);
  return agreement;
}
async function revenueSummary() {
  const entries = await (await store()).list("Revenue");
  const summary = entries.reduce(
    (value, item) => {
      const asset = item.asset || "UNKNOWN";
      const bucket = value.byAsset[asset] || { grossAmount: 0, protocolFee: 0, jobs: 0 };
      bucket.grossAmount += Number(item.grossAmount || 0);
      bucket.protocolFee += Number(item.protocolFee || 0);
      bucket.jobs += 1;
      value.byAsset[asset] = bucket;
      value.jobs += 1;
      value.grossAmount += Number(item.grossAmount || 0);
      value.protocolFee += Number(item.protocolFee || 0);
      return value;
    },
    { jobs: 0, grossAmount: 0, protocolFee: 0, byAsset: {} },
  );
  const assets = Object.keys(summary.byAsset);
  return { ...summary, asset: assets.length === 1 ? assets[0] : "MULTI" };
}
async function telemetrySummary() {
  const events = await (await store()).list("Telemetry");
  const byEvent = {};
  const byService = {};
  for (const event of events) {
    byEvent[event.event] = (byEvent[event.event] || 0) + 1;
    if (event.service) byService[event.service] = (byService[event.service] || 0) + 1;
  }
  return {
    network: "solana-mainnet-beta",
    totalEvents: events.length,
    byEvent,
    byService,
    providerRuntime: evmRuntimeStats(),
    lastEventAt: events.map((event) => event.createdAt).sort().at(-1) || null,
  };
}
async function treasuryStatus() {
  const ata = await treasuryTokenAccount(config);
  const [native, token, activity] = await Promise.all([
    readRpc(config, "getBalance", [config.treasury]),
    readRpc(config, "getTokenAccountBalance", [ata]).catch(() => ({
      result: { value: null },
    })),
    readRpc(config, "getSignaturesForAddress", [ata, { limit: 10 }]),
  ]);
  return {
    network: "solana:mainnet-beta",
    owner: config.treasury,
    usdcMint: config.usdcMint,
    usdcAta: ata,
    solLamports: native.result?.value || 0,
    usdc: token.result?.value || null,
    usdcStatus: token.result?.value ? "ready" : "ATA_NOT_INITIALIZED",
    recentSignatures: (activity.result || []).map((item) => ({
      signature: item.signature,
      slot: item.slot,
      status: item.err ? "failed" : "confirmed",
      blockTime: item.blockTime || null,
    })),
    notifications: {
      telegram: config.telegramNotifications ? "configured" : "disabled",
      discord: config.discordNotifications ? "configured" : "disabled",
      custody: "receive-only",
    },
    observedAt: now(),
  };
}
async function recordRevenue(job, payment) {
  const grossAmount = Number(payment?.amount || 0);
  const protocolFee = Number(
    ((grossAmount * config.marketplaceFeeBps) / 10000).toFixed(6),
  );
  await (
    await store()
  ).put(
    "Revenue",
    `rev_${job.id}`,
    {
      id: `rev_${job.id}`,
      jobId: job.id,
      service: job.service_id,
      grossAmount,
      providerAmount: grossAmount - protocolFee,
      protocolFee,
      feeBps: config.marketplaceFeeBps,
      asset: payment?.currency || "USDC",
      paymentSignature: payment?.signature || null,
      timestamp: now(),
    },
    true,
  );
}
function errorResponse(error) {
  const status = error.statusCode || 400;
  return json(
    {
      error: status === 402 ? "payment_required" : "request_failed",
      message: error.message,
      ...(error.payment_intent ? { payment_intent: error.payment_intent } : {}),
      ...(error.quote ? { quote: error.quote } : {}),
      ...(error.retryAfterSeconds ? { retry_after_seconds: error.retryAfterSeconds } : {}),
    },
    status,
    {
      ...(status === 402 ? { "www-authenticate": "Solana" } : {}),
      ...(error.retryAfterSeconds ? { "retry-after": String(error.retryAfterSeconds) } : {}),
    },
  );
}

async function makeQuote(serviceId, jobId, admin = false, currency = "USDC", targetNetwork = null) {
  const service = serviceById(serviceId);
  if (!service) throw new Error("unknown service");
  const amount = admin && currency === "SOL"
    ? 0.0001
    : admin
      ? 0.01
    : Number((service.price * config.priceMultiplier).toFixed(6));
  let ata = null;
  if (service.price && currency === "USDC") {
    try {
      ata = await treasuryTokenAccount(config);
    } catch {
      ata = null;
    }
    if (
      !ata &&
      config.treasury === "2BJ4ezxqV9YJXc38D9duKBkdn4su4jE1beKUHwH663sL" &&
      config.usdcMint === "EPjFWdd5AufSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"
    )
      ata = "L2iAzRuZZrubxcfkQXqBGpPHWej9vLMbm24cDT2jqbv";
  }
  const expiresAt = new Date(Date.now() + (admin ? 3600000 : 300000));
  const quote = {
    quote_id: `q_${randomUUID()}`,
    job_id: jobId,
    service_id: serviceId,
    amount,
    amountAtomic: Math.round(amount * (currency === "SOL" ? 1e9 : 1e6)),
    currency,
    network: "solana-mainnet-beta",
    target_network: targetNetwork || "solana-mainnet-beta",
    mint: config.usdcMint,
    treasuryOwner: config.treasury,
    treasuryTokenAccount: ata,
    recipient: config.treasury,
    paymentReference: `PDAOJOB:${jobId}`,
    expires_at: expiresAt.toISOString(),
    expires_at_utc: expiresAt.toISOString(),
    expires_at_epoch_ms: expiresAt.getTime(),
    payment_required: Boolean(service.price),
    ata_required: !ata,
  };
  await (await store()).put("Quotes", quote.quote_id, quote, true);
  return quote;
}

async function executeService(id, input) {
  const requestedNetwork = String(input?.network || "");
  const service = serviceById(id);
  if (["research.asset", "research.wallet", "contract.explain", "transaction.explain", "anomaly.detect", "agent.research.report", "portfolio.intelligence", "market.snapshot"].includes(id)) {
    if (!service?.supportedNetworks?.includes(requestedNetwork))
      throw new Error(`${id} is not supported on ${requestedNetwork || "this network"}`);
    if (id === "research.asset") return researchAsset(config, input);
    if (id === "research.wallet") return researchWallet(config, input);
    if (id === "contract.explain") return explainContract(config, input);
    if (id === "transaction.explain") return explainTransaction(config, input);
    if (id === "anomaly.detect") return detectAnomaly(config, input);
    if (id === "agent.research.report") return researchReport(config, input);
    if (id === "market.snapshot") return marketSnapshot(config, input);
    return portfolioIntelligence(config, input);
  }
  if (requestedNetwork && evmNetwork(requestedNetwork)) {
    if (!service?.supportedNetworks?.includes(requestedNetwork))
      throw new Error(`${id} is not supported on ${requestedNetwork}`);
    return executeEvmService(config, id, input);
  }
  if (requestedNetwork && requestedNetwork !== "solana-mainnet-beta")
    throw new Error(`unsupported target network: ${requestedNetwork}`);
  if (id === "swap.quote") return swapQuote(config, input);
  if (id === "transaction.simulate") return simulateSolanaTransaction(config, input);
  if (id === "verify.basic" || id === "verify.deep") {
    const mint = input?.mint || input?.asset;
    if (mint) {
      const evidence = await mintEvidence(config, mint);
      if (id === "verify.deep") {
        const sigs = await readRpc(config, "getSignaturesForAddress", [
          input.mint,
          { limit: 50 },
        ]);
        evidence.recent_activity = sigs.result;
        evidence.risk_flags = [];
      }
      return evidence;
    }
    if (!input?.record || typeof input.record !== "object")
      throw new Error("mint or record is required");
    const inputHash = digest(input.record);
    return {
      verification_status:
        input.expected_digest && input.expected_digest !== inputHash
          ? "INVALID"
          : "VERIFIED",
      input_hash: inputHash,
      canonicalization: "privatedao-agent-v1",
      checks: [
        {
          name: "canonical_digest",
          passed: !input.expected_digest || input.expected_digest === inputHash,
        },
      ],
    };
  }
  if (id === "forensics.trace") {
    const address = input?.wallet || input?.address;
    if (!/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address || ""))
      throw new Error("valid Solana wallet is required");
    const result = await readRpc(config, "getSignaturesForAddress", [
      address,
      { limit: Math.min(Number(input.limit || 20), 100) },
    ]);
    return {
      address,
      evidence_confidence: "rpc-confirmed",
      signatures: result.result.map((x) => ({
        signature: x.signature,
        slot: x.slot,
        err: x.err,
        block_time: x.blockTime,
      })),
    };
  }
  if (
    [
      "token.intelligence",
      "risk.score",
      "launch.check",
      "market.snapshot",
    ].includes(id)
  ) {
    const evidence = await mintEvidence(config, input?.mint || input?.asset);
    const authorityRisk = [
      evidence.mint_authority,
      evidence.freeze_authority,
    ].filter(Boolean).length;
    if (id === "risk.score")
      return {
        mint: evidence.mint,
        cluster: evidence.cluster,
        score: Math.max(0, 100 - authorityRisk * 25),
        factors: {
          mint_authority_present: Boolean(evidence.mint_authority),
          freeze_authority_present: Boolean(evidence.freeze_authority),
          evidence_confidence: evidence.evidence_confidence,
        },
        methodology: "deterministic-authority-v1",
      };
    if (id === "market.snapshot")
      return {
        mint: evidence.mint,
        cluster: evidence.cluster,
        supply: evidence.supply,
        decimals: evidence.decimals,
        largest_accounts: evidence.largest_accounts,
        observed_at: evidence.observed_at,
        provider: evidence.provider_source,
      };
    if (id === "launch.check")
      return {
        mint: evidence.mint,
        cluster: evidence.cluster,
        valid: evidence.valid,
        authority_flags: {
          mint_authority_present: Boolean(evidence.mint_authority),
          freeze_authority_present: Boolean(evidence.freeze_authority),
        },
        evidence_confidence: evidence.evidence_confidence,
        observed_at: evidence.observed_at,
      };
    return {
      ...evidence,
      service: id,
      holder_snapshot: evidence.largest_accounts,
      metadata_status: evidence.valid ? "on-chain-account-found" : "not-found",
    };
  }
  if (id === "wallet.intelligence") {
    const address = input?.wallet || input?.address;
    if (!/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address || ""))
      throw new Error("valid Solana wallet is required");
    const result = await readRpc(config, "getSignaturesForAddress", [
      address,
      { limit: Math.min(Number(input.limit || 25), 100) },
    ]);
    return {
      address,
      cluster: "mainnet-beta",
      observed_signatures: result.result.length,
      recent_activity: result.result.map((x) => ({
        signature: x.signature,
        slot: x.slot,
        blockTime: x.blockTime || null,
        error: x.err || null,
      })),
      evidence_confidence: "rpc-confirmed",
    };
  }
  if (id === "contract.inspect") {
    const address = input?.program || input?.address;
    if (!/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address || ""))
      throw new Error("valid Solana program is required");
    const result = await readRpc(config, "getAccountInfo", [
      address,
      { encoding: "base64" },
    ]);
    return {
      address,
      cluster: "mainnet-beta",
      exists: Boolean(result.result?.value),
      owner: result.result?.value?.owner || null,
      executable: result.result?.value?.executable || false,
      lamports: result.result?.value?.lamports || 0,
      evidence_confidence: "rpc-confirmed",
    };
  }
  if (id === "decision.context")
    return {
      cluster: "mainnet-beta",
      evidence_digest: digest(input?.evidence || input),
      checks: [
        {
          name: "structured_input",
          passed: Boolean(input && typeof input === "object"),
        },
      ],
      methodology: "deterministic-context-v1",
    };
  if (id === "receipt.verify") {
    const actual = digest(input?.receipt || {});
    return {
      verification_status:
        input?.expected_hash && input.expected_hash !== actual
          ? "INVALID"
          : "VERIFIED",
      receipt_digest: actual,
      cluster: "mainnet-beta",
    };
  }
  if (id === "agent.match") {
    const all = await (await store()).list("Registry");
    const wanted = new Set(input?.capabilities || []);
    return {
      matches: all
        .filter((x) => ["verified", "connected"].includes(x.status))
        .map((x) => ({
          ...x,
          match_score:
            (x.capabilities || []).filter((c) => wanted.has(c)).length /
            Math.max(wanted.size, 1),
        }))
        .sort((a, b) => b.match_score - a.match_score)
        .slice(0, 20),
    };
  }
  if (id === "intelligence.synthesize") {
    const inference = await runIntelInference(config, {
      evidence: input?.evidence || input,
      requested_output: input?.requested_output || "structured synthesis",
    });
    return {
      status: inference.status,
      provider: inference.provider,
      model: inference.model,
      result: inference.result,
      evidence_digest: digest(input?.evidence || input),
      machine_readable: true,
      ...(inference.note ? { note: inference.note } : {}),
    };
  }
  if (id === "game.tool") {
    const world = String(input?.world || "dao").slice(0, 40);
    const tool = String(input?.tool || "privacy-lens").slice(0, 60);
    const allowedTools = new Set(["privacy-lens", "verification-scanner", "hoverboard"]);
    if (!allowedTools.has(tool)) throw new Error("unknown game tool");
    return {
      entitlement: `pdao.game.${world}.${tool}`,
      world,
      tool,
      delivery: "accountless receipt-bound entitlement",
      network: "solana-mainnet-beta",
      note: "This entitlement unlocks an optional cosmetic or gameplay convenience; it does not guarantee profit or token value.",
    };
  }
  if (id === "sponsored.discovery") {
    if (!input?.campaignId || !input?.destination)
      throw new Error("campaignId and destination are required");
    const campaign = {
      id: input.campaignId,
      subject: input.subject || input.name,
      destination: input.destination,
      targetCapabilities: input.targetCapabilities || [],
      targetChains: input.targetChains || ["solana"],
      tags: input.tags || [],
      start: input.start || now(),
      expiry: input.expiry,
      price: 5,
      sponsored: true,
      disclosure: "sponsored",
    };
    await (await store()).put("Campaigns", campaign.id, campaign, true);
    return { campaign };
  }
  throw new Error("service implementation unavailable");
}

async function executeMeasuredService(id, input) {
  const before = evmRuntimeStats();
  const result = await executeService(id, input);
  const after = evmRuntimeStats();
  return {
    result,
    telemetry: {
      providerCalls: Math.max(0, after.calls - before.calls),
      cacheHits: Math.max(0, after.cache_hits - before.cache_hits),
      cacheMisses: Math.max(0, after.cache_misses - before.cache_misses),
    },
  };
}

async function createJob(serviceId, input, admin = false, currency = "USDC", metadata = {}) {
  const service = serviceById(serviceId);
  if (!service) throw new Error("unknown service");
  validateServiceInput(serviceId, input);
  const persistForPaymentRetry = Boolean(service.price && [
    "token.intelligence",
    "risk.score",
    "wallet.intelligence",
    "market.snapshot",
    "transaction.simulate",
    "research.asset",
    "research.wallet",
    "contract.explain",
    "transaction.explain",
    "anomaly.detect",
    "agent.research.report",
    "portfolio.intelligence",
  ].includes(serviceId));
  const job = {
    id: `job_${randomUUID()}`,
    service_id: serviceId,
    input_hash: digest(input),
    status: service.price ? "awaiting_payment" : "running",
    created_at: now(),
    expires_at: new Date(Date.now() + 900000).toISOString(),
    ...(persistForPaymentRetry ? { execution_input: input } : {}),
  };
  await (await store()).put("Jobs", job.id, job, true);
  trackFunnel("job_created", { service: serviceId, ...metadata });
  if (service.price) {
    const quote = await makeQuote(serviceId, job.id, admin, currency, input?.network || null);
    const intent = {
      jobId: job.id,
      status: "awaiting_payment",
      network: quote.network,
      target_network: quote.target_network,
      asset: quote.currency,
      mint: quote.mint,
      amount: quote.amount.toFixed(6),
      amountBaseUnits: String(quote.amountAtomic),
      decimals: quote.currency === "SOL" ? 9 : 6,
      treasuryOwner: quote.treasuryOwner,
      treasuryTokenAccount: quote.treasuryTokenAccount,
      treasuryOwner: quote.treasuryOwner,
      recipient: quote.recipient,
      paymentReference: quote.paymentReference,
      expiresAt: quote.expires_at,
      expiresAtUtc: quote.expires_at_utc,
      expiresAtEpochMs: quote.expires_at_epoch_ms,
      submitSignatureUrl: `https://${config.domain}/api/jobs/${job.id}/payment`,
      statusUrl: `https://${config.domain}/api/jobs/${job.id}`,
      quoteId: quote.quote_id,
      ataRequired: quote.ata_required,
    };
    const e = new Error("payment required");
    e.statusCode = 402;
    e.payment_intent = intent;
    throw e;
  }
  job.execution_started_at = now();
  await (await store()).put("Jobs", job.id, job);
  const execution = await executeMeasuredService(serviceId, input);
  return await completeJob(job, execution.result, null, execution.telemetry);
}

async function completeJob(job, result, payment, telemetry = {}) {
  if (job.status === "completed" && job.receipt_id) {
    const existingReceipt = await (await store()).get(
      "Receipts",
      job.receipt_id,
    );
    return {
      job_id: job.id,
      status: "completed",
      result: job.result,
      receipt: existingReceipt,
    };
  }
  const recommendations = job.service_id === "verify.basic" || job.service_id === "risk.score"
    ? recommendedNextServices(job.service_id, result)
    : [];
  const enrichedResult = recommendations.length
    ? { ...result, recommended_next_services: recommendations }
    : result;
  const executionMs = Date.now() - Date.parse(job.execution_started_at || job.created_at);
  trackFunnel("service_completed", {
    service: job.service_id,
    targetNetwork: job.execution_input?.network || enrichedResult?.network,
    outcome: "success",
    durationMs: Number.isFinite(executionMs) ? executionMs : null,
    providerCalls: Number.isFinite(telemetry.providerCalls)
      ? telemetry.providerCalls
      : Number.isFinite(enrichedResult?.provider_calls) ? enrichedResult.provider_calls : null,
    cacheHits: telemetry.cacheHits,
    cacheMisses: telemetry.cacheMisses,
  });
  const payload = {
    job_id: job.id,
    service: job.service_id,
    input_hash: job.input_hash,
    result_hash: digest(enrichedResult),
    created_at: job.created_at,
    completed_at: now(),
  };
  const receipt = {
    receipt_id: receiptId(payload),
    ...payload,
    evidence_hash: digest(enrichedResult),
    payment_signature: payment?.signature || null,
    asset: payment?.currency || null,
    amount: payment?.amount || 0,
    treasury: config.treasury,
    network: "solana-mainnet-beta",
    payment_network: "solana-mainnet-beta",
    target_network: job.execution_input?.network || enrichedResult?.network || "solana-mainnet-beta",
    status: "VERIFIED",
  };
  receipt.public_url = `https://${config.domain}/receipts/${encodeURIComponent(receipt.receipt_id)}`;
  receipt.verification_url = `https://${config.domain}/verify/receipt/${encodeURIComponent(receipt.receipt_id)}`;
  receipt.job_url = `https://${config.domain}/jobs/${encodeURIComponent(job.id)}`;
  await (await store()).put("Receipts", receipt.receipt_id, receipt, true);
  await recordRevenue(job, payment);
  job.status = "completed";
  job.result = enrichedResult;
  job.receipt_id = receipt.receipt_id;
  job.completed_at = receipt.completed_at;
  await (await store()).put("Jobs", job.id, job);
  return { job_id: job.id, status: job.status, result: enrichedResult, receipt };
}

async function submitPayment(jobId, body) {
  const storage = await store();
  const job = await storage.get("Jobs", jobId);
  if (!job)
    throw Object.assign(new Error("job not found"), { statusCode: 404 });
  if (job.status === "completed" && job.receipt_id) {
    return completeJob(job, job.result, null);
  }
  if (job.status !== "awaiting_payment")
    throw new Error("job is not awaiting payment");
  const quotes = await storage.list("Quotes");
  const quote = quotes.find((x) => x.job_id === jobId);
  if (!quote)
    throw new Error("quote expired");
  const payment = await verifyPayment(
    config,
    { signature: body.signature },
    quote,
  );
  if (payment.transient)
    return {
      status: "verifying",
      message: payment.reason,
      signature: body.signature,
      retryAfterSeconds: 3,
    };
  if (!payment.ok)
    throw Object.assign(new Error(payment.reason), {
      statusCode: 402,
      payment_intent: {
        jobId,
        quoteId: quote.quote_id,
        status: "awaiting_payment",
      },
    });
  const expiresAt = Date.parse(quote.expires_at);
  const paidAt = payment.blockTime ? payment.blockTime * 1000 : NaN;
  if (!Number.isFinite(expiresAt) || !Number.isFinite(paidAt) || paidAt > expiresAt)
    throw new Error("quote expired before the on-chain payment");

  const paymentId = `payment_${body.signature}`;
  const existingPayment = await storage.get("Payments", paymentId);
  if (existingPayment && existingPayment.job_id !== jobId)
    throw Object.assign(new Error("payment signature was already used"), {
      statusCode: 402,
    });
  if (!existingPayment) {
    await storage.put(
      "Payments",
      paymentId,
      {
        id: paymentId,
        signature: body.signature,
        job_id: jobId,
        consumed_at: now(),
      },
      true,
    );
  }

  const currentJob = await storage.get("Jobs", jobId);
  if (currentJob?.status === "completed" && currentJob.receipt_id)
    return completeJob(currentJob, currentJob.result, null);
  if (existingPayment) {
    const claimedAt = Date.parse(existingPayment.consumed_at || "");
    if (Number.isFinite(claimedAt) && Date.now() - claimedAt < 30000)
      return {
        job_id: jobId,
        status: "processing",
        message: "payment accepted; job execution is already in progress",
        retryAfterSeconds: 3,
      };
    // Recover a payment claim left behind by a crashed invocation. The
    // signature remains bound to this job, so no second payment is accepted.
  }
  job.execution_started_at = now();
  await storage.put("Jobs", job.id, job);
  const execution = await executeMeasuredService(job.service_id, body.input || job.execution_input || {});
  return completeJob(job, execution.result, {
    signature: body.signature,
    currency: quote.currency,
    amount: quote.amount,
  }, execution.telemetry);
}

async function register(body) {
  if (body.mcpUrl || body.mcp_url || String(body.protocol || "").toUpperCase() === "MCP")
    return registerMcp(body);
  const url = new URL(body.agentCardUrl || body.agent_card_url);
  if (
    url.protocol !== "https:" ||
    /^(localhost|127\.|10\.|192\.168\.|169\.254\.|0\.0\.0\.0)$/.test(
      url.hostname,
    )
  )
    throw new Error("public HTTPS Agent Card required");
  const response = await fetch(url, {
    redirect: "manual",
    signal: AbortSignal.timeout(5000),
    headers: { accept: "application/json" },
  });
  if (!response.ok || response.status >= 300)
    throw new Error("Agent Card endpoint verification failed");
  const remote = await response.json();
  if (!remote.name || !remote.url) throw new Error("invalid Agent Card");
  const agent = {
    id: `agent_${digest({ url: url.href }).slice(0, 24)}`,
    name: body.name || remote.name,
    url: body.endpoint || remote.url,
    agent_card_url: url.href,
    capabilities: body.capabilities || remote.skills?.map((s) => s.id) || [],
    acceptedAssets: body.acceptedAssets || ["USDC"],
    pricing: body.pricing || {},
    protocols: body.protocols || ["A2A", "HTTP"],
    networks: body.networks || remote.networks || ["solana:mainnet-beta"],
    tags: body.tags || [],
    status: "verified",
    verified_at: now(),
  };
  await (await store()).put("Registry", agent.id, agent);
  return agent;
}

const MCP_TIMEOUT_MS = 8000;
const MCP_RISKY_TOOL_PATTERN = /(?:build|burn|sign|send|transfer|withdraw|mint|swap|write|delete|destroy|execute|submit|approve|govern|vote|publish|deploy|close|cancel)/i;

function assertPublicHttps(urlText) {
  const url = new URL(urlText);
  if (url.protocol !== "https:" || url.username || url.password)
    throw new Error("external MCP endpoint must be public HTTPS without embedded credentials");
  const host = url.hostname.toLowerCase();
  if (host === "localhost" || host.endsWith(".localhost") || host.endsWith(".local") || host === "0.0.0.0" || host === "127.0.0.1" || host === "::1" || /^(10|192\.168|169\.254)\./.test(host))
    throw new Error("private or loopback MCP endpoint is not allowed");
  return url;
}

async function mcpHttp(url, request, sessionId = null) {
  const headers = {
    "content-type": "application/json",
    accept: "application/json, text/event-stream",
    "MCP-Protocol-Version": "2025-06-18",
    "user-agent": "PrivateDAO-Agent-Exchange/1.0 (+https://privatedao.org)",
  };
  if (sessionId) headers["Mcp-Session-Id"] = sessionId;
  const response = await fetch(url, {
    method: "POST",
    redirect: "manual",
    signal: AbortSignal.timeout(MCP_TIMEOUT_MS),
    headers,
    body: JSON.stringify(request),
  });
  const text = await response.text();
  let payload;
  try { payload = JSON.parse(text); }
  catch {
    const error = new Error(`MCP endpoint returned non-JSON HTTP ${response.status}`);
    error.statusCode = 502;
    error.upstreamStatus = response.status;
    throw error;
  }
  if (!response.ok) {
    const error = new Error(`MCP endpoint returned HTTP ${response.status}`);
    error.statusCode = 502;
    error.upstreamStatus = response.status;
    throw error;
  }
  if (payload.error) throw new Error(`MCP ${payload.error.code || "error"}: ${payload.error.message || "request failed"}`);
  return { payload, sessionId: response.headers.get("mcp-session-id") || sessionId };
}

function mcpToolSummary(tool) {
  return {
    name: String(tool?.name || "").slice(0, 120),
    title: tool?.title ? String(tool.title).slice(0, 200) : null,
    description: tool?.description ? String(tool.description).slice(0, 1000) : "",
    inputSchema: tool?.inputSchema && typeof tool.inputSchema === "object" ? tool.inputSchema : { type: "object" },
  };
}

async function discoverMcp(mcpUrl) {
  const url = assertPublicHttps(mcpUrl);
  const initialized = await mcpHttp(url.href, {
    jsonrpc: "2.0",
    id: 1,
    method: "initialize",
    params: {
      protocolVersion: "2025-06-18",
      capabilities: {},
      clientInfo: { name: "PrivateDAO-Agent-Exchange", version: "1.0.0" },
    },
  });
  const init = initialized.payload.result;
  if (!init?.protocolVersion || !init?.serverInfo?.name)
    throw new Error("MCP initialize response is incomplete");
  const sessionId = initialized.sessionId;
  const toolsResponse = await mcpHttp(url.href, { jsonrpc: "2.0", id: 2, method: "tools/list", params: {} }, sessionId);
  const tools = Array.isArray(toolsResponse.payload.result?.tools)
    ? toolsResponse.payload.result.tools.map(mcpToolSummary).filter((tool) => tool.name)
    : [];
  const optional = async (method, id) => {
    try {
      const response = await mcpHttp(url.href, { jsonrpc: "2.0", id, method, params: {} }, toolsResponse.sessionId);
      return response.payload.result || {};
    } catch (error) {
      return { unsupported: true, reason: error.message };
    }
  };
  const resources = await optional("resources/list", 3);
  const prompts = await optional("prompts/list", 4);
  return {
    url: url.href,
    protocolVersion: init.protocolVersion,
    serverInfo: { name: String(init.serverInfo.name).slice(0, 200), version: String(init.serverInfo.version || "").slice(0, 80) },
    capabilities: init.capabilities || {},
    tools,
    resourcesSupported: !resources.unsupported,
    promptsSupported: !prompts.unsupported,
    sessionId: toolsResponse.sessionId,
  };
}

function defaultMcpAllowlist(tools) {
  return tools.filter((tool) => !MCP_RISKY_TOOL_PATTERN.test(tool.name)).map((tool) => tool.name);
}

async function registerMcp(body) {
  const endpoint = body.mcpUrl || body.mcp_url || body.endpoint;
  if (!endpoint) throw new Error("mcpUrl is required");
  let discovery;
  try {
    discovery = await discoverMcp(endpoint);
  } catch (error) {
    if (!body.persistUnavailable) throw error;
    const url = assertPublicHttps(endpoint);
    const id = `agent_${digest({ protocol: "MCP", url: url.href }).slice(0, 24)}`;
    const match = /HTTP (\d{3})/.exec(error.message);
    const reason = match ? `HTTP_${match[1]}` : /timeout/i.test(error.message) ? "TIMEOUT" : "MCP_CHECK_FAILED";
    const unavailable = {
      id,
      name: body.name || "External MCP Agent",
      url: url.href,
      endpoint: url.href,
      protocol: "MCP",
      protocols: ["MCP"],
      transport: "streamable-http",
      capabilities: [],
      allowed_tools: [],
      tools: [],
      mcp: { resourcesSupported: false, promptsSupported: false },
      acceptedAssets: [],
      pricing: body.pricing || {},
      networks: body.networks || [],
      tags: body.tags || ["external", "mcp"],
      status: "unavailable",
      health: "unavailable",
      unavailable_reason: reason,
      last_successful_connection: null,
      verified_at: null,
      side_effect_policy: "execution disabled until MCP handshake succeeds",
      updated_at: now(),
    };
    await (await store()).put("Registry", id, unavailable);
    return unavailable;
  }
  const requested = Array.isArray(body.allowedTools) ? body.allowedTools.map(String) : null;
  const discoveredNames = new Set(discovery.tools.map((tool) => tool.name));
  const allowedTools = (requested || defaultMcpAllowlist(discovery.tools)).filter((name) => discoveredNames.has(name) && !MCP_RISKY_TOOL_PATTERN.test(name));
  const id = `agent_${digest({ protocol: "MCP", url: discovery.url }).slice(0, 24)}`;
  const agent = {
    id,
    name: body.name || discovery.serverInfo.name,
    url: discovery.url,
    endpoint: discovery.url,
    protocol: "MCP",
    protocols: ["MCP"],
    transport: "streamable-http",
    capabilities: discovery.tools.map((tool) => tool.name),
    allowed_tools: allowedTools,
    tools: discovery.tools,
    mcp: {
      protocolVersion: discovery.protocolVersion,
      serverInfo: discovery.serverInfo,
      capabilities: discovery.capabilities,
      resourcesSupported: discovery.resourcesSupported,
      promptsSupported: discovery.promptsSupported,
    },
    acceptedAssets: [],
    pricing: body.pricing || {},
    networks: body.networks || [],
    tags: body.tags || ["external", "mcp"],
    status: "connected",
    health: "connected",
    last_successful_connection: now(),
    verified_at: now(),
    side_effect_policy: "read-only allowlist; financial, signing and destructive tools blocked",
  };
  await (await store()).put("Registry", id, agent);
  return agent;
}

async function invokeMcpAgent(agent, tool, args = {}) {
  const discovery = await discoverMcp(agent.endpoint);
  if (!tool || typeof tool !== "string") throw Object.assign(new Error("MCP tool is required"), { statusCode: 400 });
  if (!agent.allowed_tools?.includes(tool))
    throw Object.assign(new Error("MCP tool is not allowlisted for this agent"), { statusCode: 403 });
  if (!discovery.tools.some((item) => item.name === tool) || MCP_RISKY_TOOL_PATTERN.test(tool))
    throw Object.assign(new Error("MCP tool is not available as a safe discovered tool"), { statusCode: 403 });
  if (!args || typeof args !== "object" || Array.isArray(args) || JSON.stringify(args).length > 32768)
    throw Object.assign(new Error("MCP tool arguments must be a bounded JSON object"), { statusCode: 400 });
  const response = await mcpHttp(agent.endpoint, {
    jsonrpc: "2.0",
    id: randomUUID(),
    method: "tools/call",
    params: { name: tool, arguments: args },
  }, discovery.sessionId || null);
  return {
    agent_id: agent.id,
    agent_name: agent.name,
    protocol: "MCP",
    tool,
    status: response.payload.result?.isError ? "error" : "completed",
    result: response.payload.result || null,
    evidence: { provider_url: agent.endpoint, observed_at: now(), handshake: "verified" },
  };
}

async function invokeAgent(body) {
  const agent = await (await store()).get("Registry", body.agentId);
  if (!agent || !["verified", "connected"].includes(agent.status))
    throw new Error("verified agent required");
  if (agent.protocol === "MCP" || agent.transport === "streamable-http")
    return invokeMcpAgent(agent, body.tool, body.arguments || body.payload || {});
  const response = await fetch(agent.url, {
    method: "POST",
    redirect: "manual",
    signal: AbortSignal.timeout(10000),
    headers: { "content-type": "application/json", accept: "application/json" },
    body: JSON.stringify(body.payload || {}),
  });
  if (!response.ok)
    throw new Error(`provider returned HTTP ${response.status}`);
  return {
    agent_id: agent.id,
    status: "completed",
    result: await response.json(),
    evidence: { provider_url: agent.url, observed_at: now() },
  };
}

async function handle(e) {
  const routePath = pathOf(e);
  if (routePath.startsWith("/api/") || routePath === "/a2a" || routePath === "/mcp")
    enforceRateLimit(rateLimitKey(e), config.rateLimitPerMinute);
  await runtimeConfig();
  const requestMethod = methodOf(e),
    method = requestMethod === "HEAD" ? "GET" : requestMethod,
    path = pathOf(e),
    body = method === "GET" ? {} : parseBody(e);
  if (method === "OPTIONS") return json({}, 204);
  if (method === "GET" && ["/connect", "/developers"].includes(path)) {
    trackFunnel("developer_page_view");
    return { statusCode: 200, headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" }, body: connectPage() };
  }
  if (method === "GET" && path === "/marketplace") {
    trackFunnel("marketplace_view");
    const campaigns = await activePartnerships();
    const featuredNames = campaigns.map((campaign) => `<a href="/partners"><strong>${escapeHtml(campaign.agentName)}</strong><span>Featured Partner · Sponsored</span></a>`).join("");
    const featured = campaigns.length ? `<section class="featured-partners" aria-label="Featured Partners"><div><p class="eyebrow">Sponsored partnerships</p><h2>Featured Partners</h2><p>Paid promotion is disclosed separately from technical MCP status.</p></div><div class="featured-list">${featuredNames}</div></section>` : "";
    const page = marketplacePage();
    return { statusCode: 200, headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" }, body: page.replace("<footer>", `${featured}<footer>`) };
  }
  if (method === "GET" && (path === "/partners" || path === "/marketplace/partners"))
    return { statusCode: 200, headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" }, body: await partnersPage() };
  const partnershipPayPage = path.match(/^\/partners\/([^/]+)\/pay$/);
  if (method === "GET" && partnershipPayPage) {
    const campaign = await (await store()).get("Campaigns", decodeURIComponent(partnershipPayPage[1]));
    if (!campaign || campaign.type !== "featured_partner") return json({ error: "partnership_not_found" }, 404);
    return { statusCode: 200, headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" }, body: partnershipPaymentPage(decodeURIComponent(partnershipPayPage[1])) };
  }
  const agentProfile = path.match(/^\/agents\/([^/]+)$/);
  if (method === "GET" && agentProfile) {
    const page = await agentProfilePage(decodeURIComponent(agentProfile[1]));
    return page ? { statusCode: 200, headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" }, body: page } : json({ error: "not_found" }, 404);
  }
  const servicePage = path.match(/^\/services\/([^/]+)$/);
  if (method === "GET" && servicePage) {
    const serviceId = decodeURIComponent(servicePage[1]).replaceAll("-", ".");
    const service = serviceById(serviceId);
    if (!service) return json({ error: "not_found" }, 404);
    trackFunnel("service_detail_view", { service: service.id });
    return { statusCode: 200, headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" }, body: serviceDetailPage(service) };
  }
  const humanReceipt = path.match(/^\/(receipts|verify\/receipt)\/([^/]+)$/);
  if (method === "GET" && humanReceipt) {
    const receipt = await (await store()).get("Receipts", decodeURIComponent(humanReceipt[2]));
    if (!receipt) return json({ error: "not_found" }, 404);
    return { statusCode: 200, headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" }, body: publicReceiptPage(receipt, humanReceipt[1] === "verify/receipt") };
  }
  const humanJob = path.match(/^\/jobs\/([^/]+)$/);
  if (method === "GET" && humanJob) {
    const job = await (await store()).get("Jobs", decodeURIComponent(humanJob[1]));
    if (!job) return json({ error: "not_found" }, 404);
    if (!job.receipt_id) return json({ job_id: job.id, status: job.status, message: "receipt is not available yet" }, 202);
    const receipt = await (await store()).get("Receipts", job.receipt_id);
    if (!receipt) return json({ error: "receipt_not_found" }, 404);
    return { statusCode: 200, headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" }, body: publicReceiptPage(receipt) };
  }
  if (method === "GET" && ["/agent-registry/register", "/register/8004"].includes(path)) {
    const page = registryRegistrationPage();
    return { statusCode: 200, headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store", "content-security-policy": `default-src 'self'; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline' 'nonce-${page.nonce}' https://esm.sh https://cdn.jsdelivr.net; connect-src 'self' https://agents.privatedao.org https://api.mainnet-beta.solana.com; frame-ancestors 'none'` }, body: injectLanguageWidget(page.body) };
  }
  if (method === "GET" && path === "/") {
    trackFunnel("human_home_view");
    return { statusCode: 200, headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" }, body: injectLanguageWidget(agentHomePage()) };
  }
  if (method === "GET" && path === "/api/health") {
    const stats =
      process.env.NODE_ENV === "test" ? null : await networkStats(config);
    return json({
      status: "ok",
      service: "pdao-agent-exchange",
      version: "1.4.0",
      network: "solana-mainnet-beta",
      rpcMode: stats?.providerClass || (config.rpcPrimary.includes("api.mainnet-beta")
        ? "public-fallback"
        : "configured-primary"),
      paymentVerification: "finalized-usdc",
      a2a: "active",
      mcp: "active",
      registry: "active",
      marketplace: "active",
      logistics: "active",
      treasury: config.treasury,
      usdcMint: config.usdcMint,
      cluster: config.cluster,
      mainnetGenesisHash: config.mainnetGenesisHash,
      rpcAttestation: stats ? "mainnet-verified" : "test-runtime",
      timestamp: now(),
    });
  }
  if (
    method === "GET" &&
    [
      "/.well-known/agent-card.json",
      "/.well-known/agent.json",
      "/agent.json",
    ].includes(path)
  ) {
    trackFunnel("agent_card_view");
    return json(card());
  }
  if (method === "GET" && path === "/openapi.json") {
    trackFunnel("openapi_view");
    return json(openapi());
  }
  if (method === "GET" && ["/llms.txt", "/llms-full.txt"].includes(path))
    return text(llms());
  if (method === "GET" && path === "/robots.txt")
    return text(`User-agent: *\nAllow: /\nAllow: /marketplace\nAllow: /partners\nAllow: /marketplace/partners\nAllow: /connect\nAllow: /.well-known/\nAllow: /api/acquisition\nAllow: /api/services\nAllow: /api/pricing\nAllow: /api/discovery\nAllow: /api/logistics/capabilities\nDisallow: /api/admin/\nDisallow: /api/revenue\nDisallow: /api/treasury/\nSitemap: https://${config.domain}/sitemap.xml\n`);
  if (method === "GET" && path === "/favicon.ico")
    return { statusCode: 200, headers: { "content-type": "image/svg+xml", "cache-control": "public, max-age=86400" }, body: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="16" fill="#071a32"/><path d="M18 47V17h17c9 0 15 5 15 13s-6 13-15 13H27v4zm9-12h8c4 0 6-2 6-5s-2-5-6-5h-8z" fill="#fff"/><path d="M18 17h9v30h-9z" fill="#1769e0"/></svg>` };
  if (method === "GET" && path === "/sitemap.xml")
    return { statusCode: 200, headers: { "content-type": "application/xml; charset=utf-8", "cache-control": "public, max-age=3600" }, body: `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>https://${config.domain}/</loc></url><url><loc>https://${config.domain}/marketplace</loc></url><url><loc>https://${config.domain}/partners</loc></url><url><loc>https://${config.domain}/marketplace/partners</loc></url><url><loc>https://${config.domain}/connect</loc></url><url><loc>https://${config.domain}/.well-known/agent-card.json</loc></url><url><loc>https://${config.domain}/openapi.json</loc></url>${SERVICES.map((service) => `<url><loc>https://${config.domain}${servicePath(service.id)}</loc></url>`).join("")}</urlset>` };
  if (method === "GET" && path === "/llms.json")
    return json({
      name: "PrivateDAO Agent Exchange",
      services: SERVICES,
      discovery: `https://${config.domain}/.well-known/agent-card.json`,
    });
  if (method === "GET" && path === "/api/services") {
    trackFunnel("service_catalog_view");
    return json({
      services: SERVICES.map(serviceManifest),
      payment: {
        network: "solana-mainnet-beta",
        treasury: config.treasury,
        usdc_mint: config.usdcMint,
      },
    });
  }
  if (method === "GET" && path === "/api/pricing")
    return json({
      network: "solana:mainnet-beta",
      currency: "USDC",
      services: SERVICES.map((service) => ({
        id: service.id,
        price: service.price,
        currency: service.currency,
        access: service.access,
        free: service.access === "free",
      })),
    });
  if (method === "GET" && path === "/api/logistics/capabilities")
    return json({
      network: "solana:mainnet-beta",
      capabilities: [
        "service-discovery",
        "provider-matching",
        "structured-agreements",
        "mainnet-evidence",
        "walletless-receipts",
      ],
      protocols: ["HTTP", "A2A", "MCP"],
    });
  const receipt = path.match(/^\/api\/receipts\/([^/]+)$/);
  if (method === "GET" && receipt) {
    const item = await (await store()).get("Receipts", receipt[1]);
    return item ? json(item) : json({ error: "not_found" }, 404);
  }
  const job = path.match(/^\/api\/jobs\/([^/]+)$/);
  if (method === "GET" && job) {
    const item = await (await store()).get("Jobs", job[1]);
    return item ? json(item) : json({ error: "not_found" }, 404);
  }
  const paymentIntent = path.match(/^\/api\/jobs\/([^/]+)\/payment-intent$/);
  if (method === "GET" && paymentIntent) {
    const item = await (await store()).get("Jobs", paymentIntent[1]);
    const quote = (await (await store()).list("Quotes")).find((x) => x.job_id === paymentIntent[1]);
    if (!item || !quote) return json({ error: "not_found" }, 404);
    return json({ jobId: item.id, status: item.status, paymentIntent: { jobId: item.id, amount: quote.amount.toFixed(6), amountBaseUnits: String(quote.amountAtomic), mint: quote.mint, network: quote.network, target_network: quote.target_network || item.execution_input?.network || "solana-mainnet-beta", treasuryOwner: quote.treasuryOwner, treasuryTokenAccount: quote.treasuryTokenAccount, paymentReference: quote.paymentReference, expiresAtUtc: quote.expires_at_utc || quote.expires_at, expiresAtEpochMs: quote.expires_at_epoch_ms || Date.parse(quote.expires_at) } });
  }
  const payment = path.match(/^\/api\/jobs\/([^/]+)\/payment$/);
  if (method === "POST" && payment)
    return json(await submitPayment(payment[1], body));
  const paymentTransaction = path.match(/^\/api\/jobs\/([^/]+)\/payment-transaction$/);
  if (method === "POST" && paymentTransaction)
    return json(await buildPaymentTransaction(paymentTransaction[1], body.payer, body.sourceTokenAccount));
  if (method === "GET" && path === "/api/network/stats")
    return json(await networkStats(config));
  if (method === "GET" && path === "/api/network/health") {
    const requested = String(e.queryStringParameters?.network || "").trim();
    const networks = requested ? [requested] : ["solana-mainnet-beta", "ethereum-mainnet", "base-mainnet", "arbitrum-mainnet"];
    const results = await Promise.all(networks.map(async (network) => {
      try {
        return network === "solana-mainnet-beta"
          ? await solanaHealth(config)
          : await evmHealth(config, network);
      }
      catch (error) { return { network, status: "rpc_unhealthy", reason: error.message }; }
    }));
    return json({ results, read_only: true, note: "RPC health does not imply service execution or payment readiness." });
  }
  if (method === "GET" && path === "/api/acquisition") {
    const referral = e.queryStringParameters?.ref || null;
    trackFunnel("acquisition_manifest_view", { source: referral || "direct" });
    return json(acquisition());
  }
  if (method === "POST" && path === "/api/referrals")
    return json(createReferral(body), 201);
  if (method === "GET" && path === "/api/admin/telemetry") {
    const token = e.headers?.["x-pdao-admin-smoke"] || e.headers?.["X-Pdao-Admin-Smoke"];
    if (!config.adminSmokeToken || token !== config.adminSmokeToken)
      return json({ error: "not_found" }, 404);
    return json(await telemetrySummary());
  }
  if (method === "GET" && path === "/api/discovery")
    return json({
      organic: await (await store()).list("Registry"),
      sponsored: [
        {
          id: "pdao-house-discovery",
          sponsored: true,
          disclosure: "PrivateDAO-owned sponsored placement",
          subject: "PDAO utility token",
          destination: `https://pump.fun/coin/${config.pdaoMint}`,
          mint: config.pdaoMint,
          targetChains: ["solana:mainnet-beta"],
          targetCapabilities: ["agent-services", "verification", "logistics"],
          housePlacement: true,
        },
        ...(await (await store()).list("Campaigns")),
      ],
    });
  if (method === "GET" && path === "/api/marketplace/listings")
    return json({
      listings: await listListings(e.queryStringParameters || {}),
    });
  if (method === "GET" && path === "/api/marketplace/partners")
    return json({ partners: await activePartnerships() });
  if (method === "POST" && path === "/api/admin/partnerships") {
    if (!adminTokenAuthorized(e)) return json({ error: "not_found" }, 404);
    return json(await createPartnership(body), 201);
  }
  const partnership = path.match(/^\/api\/admin\/partnerships\/([^/]+)$/);
  if (method === "PATCH" && partnership) {
    if (!adminTokenAuthorized(e)) return json({ error: "not_found" }, 404);
    return json(await updatePartnership(partnership[1], body));
  }
  const partnershipPaymentIntentRoute = path.match(/^\/api\/partnerships\/([^/]+)\/payment-intent$/);
  if (method === "GET" && partnershipPaymentIntentRoute)
    return json(await partnershipPaymentIntent(decodeURIComponent(partnershipPaymentIntentRoute[1])));
  const partnershipPaymentTransactionRoute = path.match(/^\/api\/partnerships\/([^/]+)\/payment-transaction$/);
  if (method === "POST" && partnershipPaymentTransactionRoute)
    return json(await buildPartnershipPaymentTransaction(decodeURIComponent(partnershipPaymentTransactionRoute[1]), body.payer, body.sourceTokenAccount));
  const partnershipPaymentRoute = path.match(/^\/api\/partnerships\/([^/]+)\/payment$/);
  if (method === "POST" && partnershipPaymentRoute)
    return json(await submitPartnershipPayment(decodeURIComponent(partnershipPaymentRoute[1]), body));
  if (method === "POST" && path === "/api/marketplace/listings")
    return json(await publishListing(body), 201);
  if (method === "POST" && path === "/api/logistics/request")
    return json(await requestLogistics(body), 201);
  if (method === "POST" && path === "/api/agreements")
    return json(await createAgreement(body), 201);
  const agreement = path.match(/^\/api\/agreements\/([^/]+)$/);
  if (method === "GET" && agreement) {
    const item = await getAgreement(agreement[1]);
    return item ? json(item) : json({ error: "not_found" }, 404);
  }
  const acceptance = path.match(/^\/api\/agreements\/([^/]+)\/accept$/);
  if (method === "POST" && acceptance)
    return json(await acceptAgreement(acceptance[1], body));
  if (method === "GET" && path === "/api/revenue")
    return json(await revenueSummary());
  if (method === "GET" && path === "/api/treasury/status")
    return json(await treasuryStatus());
  const payPage = path.match(/^\/pay\/([^/]+)$/);
  if (method === "GET" && payPage) return { statusCode: 200, headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" }, body: injectLanguageWidget(paymentPage(decodeURIComponent(payPage[1]))) };
  if (method === "GET" && (path === "/mcp" || path === "/a2a"))
    return json(card());
  if (method === "POST" && path === "/api/admin/smoke-invoice") {
    const token =
      e.headers?.["x-pdao-admin-smoke"] || e.headers?.["X-PDAO-Admin-Smoke"];
    if (!config.adminSmokeToken || token !== config.adminSmokeToken)
      return json({ error: "not_found" }, 404);
    return json(
      await createJob(
        "verify.deep",
        body.input || { mint: config.pdaoMint },
        true,
        body.currency || "USDC",
      ),
    );
  }
  if (method === "POST" && path === "/api/jobs")
    return json(await createJob(body.service_id, body.input || {}, false, "USDC", requestMetadata(e)));
  if (method === "POST" && path === "/api/tasks")
    return json(await createJob(body.service_id, body.input || {}, false, "USDC", requestMetadata(e)));
  if (method === "POST" && path === "/api/payments/quote")
    return json(
      await makeQuote(body.service_id, body.job_id || `job_${randomUUID()}`),
    );
  if (method === "POST" && path === "/api/registry/register")
    return json(await register(body), 201);
  if (method === "GET" && path === "/api/registry/search") {
    const q = String(e.queryStringParameters?.q || "").toLowerCase();
    const all = await (await store()).list("Registry");
    return json({
      agents: all.filter(
        (x) => !q || JSON.stringify(x).toLowerCase().includes(q),
      ),
    });
  }
  const agent = path.match(/^\/api\/registry\/agents\/([^/]+)$/);
  if (method === "GET" && agent) {
    const item = await (await store()).get("Registry", agent[1]);
    return item ? json(item) : json({ error: "not_found" }, 404);
  }
  const agentRefresh = path.match(/^\/api\/registry\/agents\/([^/]+)\/refresh$/);
  if (method === "POST" && agentRefresh) {
    const item = await (await store()).get("Registry", agentRefresh[1]);
    if (!item || item.protocol !== "MCP") return json({ error: "mcp_agent_not_found" }, 404);
    try {
      return json(await registerMcp({
        name: item.name,
        mcpUrl: item.endpoint,
        allowedTools: item.allowed_tools,
        tags: item.tags,
      }));
    } catch (error) {
      const unavailable = await registerMcp({
        name: item.name,
        mcpUrl: item.endpoint,
        allowedTools: [],
        tags: item.tags,
        persistUnavailable: true,
      });
      return json(unavailable, unavailable.status === "connected" ? 200 : (error.statusCode || 503));
    }
  }
  if (method === "POST" && path === "/api/agents/invoke")
    return json(await invokeAgent(body));
  if (method === "POST" && path === "/a2a") {
    if (body.method === "message/send" || body.method === "SendMessage") {
      const params = body.params || {};
      const message = params.message || {};
      const textPart = (message.parts || []).find((part) => part.text)?.text || "";
      const serviceId = message.metadata?.service_id || params.metadata?.service_id;
      if (!serviceId) {
        return json({
          jsonrpc: "2.0",
          id: body.id ?? null,
          result: {
            id: randomUUID(),
            status: { state: "completed" },
            artifacts: [{ parts: [{ type: "data", data: { service: "discovery", query: textPart, services: SERVICES } }] }],
          },
        });
      }
      try {
        const result = await createJob(serviceId, message.metadata?.input || {}, false);
        return json({ jsonrpc: "2.0", id: body.id ?? null, result: { id: result.job_id, status: { state: "completed" }, artifacts: [{ parts: [{ type: "data", data: result.result }] }], receipt: result.receipt } });
      } catch (error) {
        return json({ jsonrpc: "2.0", id: body.id ?? null, error: { code: -32000, message: error.message } }, error.statusCode || 500);
      }
    }
    const result = await createJob(
      body.service || body.service_id,
      body.input || body.payload || {},
      false,
    );
    return json({
      id: result.job_id,
      status: { state: "completed" },
      artifacts: [{ parts: [{ type: "data", data: result.result }] }],
      receipt: result.receipt,
    });
  }
  if (method === "POST" && path === "/mcp") return await mcp(body);
  return json({ error: "not_found" }, 404);
}

async function mcp(request) {
  const id = request.id;
  if (request.method === "initialize")
    return json({
      jsonrpc: "2.0",
      id,
      result: {
        protocolVersion: "2025-03-26",
        serverInfo: { name: "pdao-agent-exchange", version: "1.4.0" },
        capabilities: { tools: {} },
      },
    });
  const schemas = {
    register_agent: {
      type: "object",
      additionalProperties: false,
      properties: {
        name: { type: "string", maxLength: 200 },
        protocol: { type: "string", enum: ["MCP"] },
        mcpUrl: { type: "string", format: "uri", description: "Public HTTPS MCP endpoint" },
        allowedTools: { type: "array", items: { type: "string", maxLength: 120 }, maxItems: 64 },
        tags: { type: "array", items: { type: "string", maxLength: 64 }, maxItems: 16 },
        persistUnavailable: { type: "boolean", description: "Persist Unavailable after a failed health check; never marks it connected" },
      },
      required: ["mcpUrl"],
    },
  };
  const tools = [
    "pdao_services",
    "verify_basic",
    "create_paid_job",
    "submit_payment",
    "job_status",
    "get_receipt",
    "search_agents",
    "register_agent",
    "agent_match",
    "logistics_request",
    "network_stats",
  ].map((name) => ({
    name,
    description: `PrivateDAO ${name}`,
    inputSchema: schemas[name] || { type: "object", additionalProperties: false },
  }));
  if (request.method === "tools/list")
    return json({ jsonrpc: "2.0", id, result: { tools } });
  if (request.method === "tools/call") {
    const name = request.params?.name,
      a = request.params?.arguments || {};
    try {
      let result;
      if (name === "pdao_services") result = { services: SERVICES.map(serviceManifest) };
      else if (name === "verify_basic")
        result = await executeService("verify.basic", a);
      else if (name === "create_paid_job") {
        try {
          result = await createJob(a.service_id, a.input || {}, false);
        } catch (error) {
          if (error.statusCode === 402)
            result = {
              status: "awaiting_payment",
              payment_intent: error.payment_intent,
            };
          else throw error;
        }
      } else if (name === "job_status")
        result = await (await store()).get("Jobs", a.job_id);
      else if (name === "get_receipt")
        result = await (await store()).get("Receipts", a.receipt_id);
      else if (name === "search_agents")
        result = { agents: await (await store()).list("Registry") };
      else if (name === "agent_match")
        result = await executeService("agent.match", a);
      else if (name === "logistics_request") result = await requestLogistics(a);
      else if (name === "network_stats") result = await networkStats(config);
      else if (name === "register_agent") result = await register(a);
      else if (name === "submit_payment")
        result = {
          status: "use_http_payment_endpoint",
          required: ["job_id", "signature"],
        };
      else throw Object.assign(new Error("unknown MCP tool"), { statusCode: 400 });
      return json({
        jsonrpc: "2.0",
        id,
        result: {
          content: [{ type: "text", text: JSON.stringify(result) }],
          structuredContent: result,
        },
      });
    } catch (error) {
      return json({
        jsonrpc: "2.0",
        id,
        error: { code: error.statusCode === 502 ? -32002 : -32000, message: error.message },
      }, error.statusCode || 400);
    }
  }
  return json(
    {
      jsonrpc: "2.0",
      id,
      error: { code: -32601, message: "method not found" },
    },
    400,
  );
}

export async function handler(event) {
  try {
    const response = await handle(event);
    if (methodOf(event) !== "HEAD") return response;
    const headers = { ...(response.headers || {}) };
    delete headers["content-length"];
    delete headers["Content-Length"];
    return { ...response, headers, body: "" };
  } catch (error) {
    console.error(JSON.stringify({
      event: "request_failed",
      requestId: event?.requestContext?.requestId || event?.requestContext?.http?.requestId || null,
      method: methodOf(event),
      path: pathOf(event),
      status: error.statusCode || 400,
      error: error.name || "Error",
      message: String(error.message || "request failed").slice(0, 240),
      upstreamStatus: error.upstreamStatus || null,
    }));
    return errorResponse(error);
  }
}
export function resetForTests() {
  storePromise = Promise.resolve(new MemoryStore());
  configPromise = Promise.resolve(config);
  resetRuntimeControls();
}
