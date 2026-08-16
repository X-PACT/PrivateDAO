import { randomUUID } from "node:crypto";
import { getConfig, hydrateConfig } from "./config.mjs";
import { digest, receiptId } from "./canonical.mjs";
import { SERVICES, serviceById } from "./catalog.mjs";
import { createStore, MemoryStore } from "./storage.mjs";
import {
  mintEvidence,
  networkStats,
  readRpc,
  treasuryTokenAccount,
  verifyPayment,
} from "./solana.mjs";

const config = getConfig();
let storePromise;
let configPromise;
const store = () => (storePromise ||= createStore(config));
const runtimeConfig = () => (configPromise ||= hydrateConfig(config));
const now = () => new Date().toISOString();
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
    description: "Machine-native verification, evidence and agent services.",
    provider: { organization: "PrivateDAO", url: "https://privatedao.org" },
    version: "1.2.0",
    url: `https://${config.domain}`,
    documentationUrl: `https://${config.domain}/llms-full.txt`,
    capabilities: { streaming: false, pushNotifications: false },
    authentication: { schemes: ["none", "solana-payment"] },
    networks: ["solana:mainnet-beta"],
    protocols: {
      a2a: `https://${config.domain}/a2a`,
      mcp: `https://${config.domain}/mcp`,
      openapi: `https://${config.domain}/openapi.json`,
    },
    skills: [
      ...SERVICES.map((s) => ({
        id: s.id,
        name: s.title,
        description: `${s.access} service`,
        inputModes: ["application/json"],
        outputModes: ["application/json"],
        pricing: { access: s.access, amount: s.price, currency: s.currency },
      })),
      {
        id: "registry.search",
        name: "Search agents",
        inputModes: ["application/json"],
        outputModes: ["application/json"],
      },
    ],
  };
}
function openapi() {
  return {
    openapi: "3.1.0",
    info: { title: "PrivateDAO Agent Exchange", version: "1.2.0" },
    servers: [{ url: `https://${config.domain}` }],
    paths: {
      "/api/health": { get: { operationId: "health" } },
      "/api/services": { get: { operationId: "services" } },
      "/api/pricing": { get: { operationId: "pricing" } },
      "/api/jobs": { post: { operationId: "createJob" } },
      "/api/jobs/{jobId}": { get: { operationId: "jobStatus" } },
      "/api/jobs/{jobId}/payment": { post: { operationId: "submitPayment" } },
      "/api/receipts/{receiptId}": { get: { operationId: "getReceipt" } },
      "/api/registry/register": { post: { operationId: "registerAgent" } },
      "/api/registry/search": { get: { operationId: "searchAgents" } },
      "/api/discovery": { get: { operationId: "discovery" } },
      "/api/marketplace/listings": {
        get: { operationId: "searchListings" },
        post: { operationId: "publishListing" },
      },
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
    },
  };
}
function llms() {
  const free = SERVICES.filter((service) => !service.price).map((service) => service.id).join(", ");
  const paid = SERVICES.filter((service) => service.price).map((service) => service.id).join(", ");
  return `# PrivateDAO Agent Exchange\nFree: ${free}\nPaid: ${paid}\nPayment: finalized Solana mainnet USDC transaction, quote first.\nAgent Card: https://${config.domain}/.well-known/agent-card.json\nMCP: https://${config.domain}/mcp\nOpenAPI: https://${config.domain}/openapi.json\n`;
}
const collectionFor = (name) =>
  ({
    listings: "Listings",
    agreements: "Agreements",
    logistics: "Logistics",
    revenue: "Revenue",
  })[name] || name;
async function listListings(query = {}) {
  const all = await (await store()).list(collectionFor("listings"));
  const firstParty = SERVICES.map((service) => ({
    id: `pdao_${service.id}`,
    agentId: "pdao-first-party",
    provider: "PrivateDAO",
    service: service.id,
    description: service.title,
    capabilities: [service.id],
    protocols: ["HTTP", "A2A", "MCP"],
    chains: ["solana:mainnet-beta"],
    price: service.price,
    asset: service.currency,
    verificationLevel: "TRANSACTION_VERIFIED",
    status: "active",
    firstParty: true,
  }));
  return [...firstParty, ...all].filter(
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
  const listing = {
    id: body.listingId || `listing_${randomUUID()}`,
    agentId: agent.id,
    service: body.service,
    description: body.description || "",
    endpoint: agent.url,
    capabilities: body.capabilities || [body.service],
    protocols: body.protocols || agent.protocols || ["HTTP"],
    chains: body.chains || ["solana:mainnet-beta"],
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
  return entries.reduce(
    (summary, item) => ({
      jobs: summary.jobs + 1,
      grossAmount: summary.grossAmount + Number(item.grossAmount || 0),
      protocolFee: summary.protocolFee + Number(item.protocolFee || 0),
      asset: item.asset || summary.asset,
    }),
    { jobs: 0, grossAmount: 0, protocolFee: 0, asset: "USDC" },
  );
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
    },
    status,
    status === 402 ? { "www-authenticate": "Solana" } : {},
  );
}

async function makeQuote(serviceId, jobId, admin = false) {
  const service = serviceById(serviceId);
  if (!service) throw new Error("unknown service");
  const amount = admin
    ? 0.01
    : Number((service.price * config.priceMultiplier).toFixed(6));
  let ata = null;
  if (service.price) {
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
      ata = "5RyKShQxSkbUJ9vA2MZ1Qf2TKgnwhhS3m7mj2ZZaVh6t";
  }
  const expiresAt = new Date(Date.now() + (admin ? 3600000 : 300000));
  const quote = {
    quote_id: `q_${randomUUID()}`,
    job_id: jobId,
    service_id: serviceId,
    amount,
    amountAtomic: Math.round(amount * 1e6),
    currency: "USDC",
    network: "solana-mainnet-beta",
    mint: config.usdcMint,
    treasuryOwner: config.treasury,
    treasuryTokenAccount: ata,
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
  if (id === "verify.basic" || id === "verify.deep") {
    if (input?.mint) {
      const evidence = await mintEvidence(config, input.mint);
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
    const evidence = await mintEvidence(config, input?.mint);
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
        .filter((x) => x.status === "verified")
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
  if (id === "intelligence.synthesize")
    return {
      synthesis: {
        summary:
          "Evidence was deterministically organized for downstream review.",
        evidence_digest: digest(input?.evidence || input),
        ai_provider: "deterministic-fallback",
      },
      machine_readable: true,
    };
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

async function createJob(serviceId, input, admin = false) {
  const service = serviceById(serviceId);
  if (!service) throw new Error("unknown service");
  const job = {
    id: `job_${randomUUID()}`,
    service_id: serviceId,
    input_hash: digest(input),
    status: service.price ? "awaiting_payment" : "running",
    created_at: now(),
    expires_at: new Date(Date.now() + 900000).toISOString(),
  };
  await (await store()).put("Jobs", job.id, job, true);
  if (service.price) {
    const quote = await makeQuote(serviceId, job.id, admin);
    const intent = {
      jobId: job.id,
      status: "awaiting_payment",
      network: quote.network,
      asset: "USDC",
      mint: quote.mint,
      amount: quote.amount.toFixed(6),
      amountBaseUnits: String(quote.amountAtomic),
      decimals: 6,
      treasuryOwner: quote.treasuryOwner,
      treasuryTokenAccount: quote.treasuryTokenAccount,
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
  const result = await executeService(serviceId, input);
  return await completeJob(job, result, null);
}

async function completeJob(job, result, payment) {
  const payload = {
    job_id: job.id,
    service: job.service_id,
    input_hash: job.input_hash,
    result_hash: digest(result),
    created_at: job.created_at,
    completed_at: now(),
  };
  const receipt = {
    receipt_id: receiptId(payload),
    ...payload,
    evidence_hash: digest(result),
    payment_signature: payment?.signature || null,
    asset: payment?.currency || null,
    amount: payment?.amount || 0,
    treasury: config.treasury,
    network: "solana-mainnet-beta",
    status: "VERIFIED",
  };
  await (await store()).put("Receipts", receipt.receipt_id, receipt, true);
  await recordRevenue(job, payment);
  job.status = "completed";
  job.result = result;
  job.receipt_id = receipt.receipt_id;
  job.completed_at = receipt.completed_at;
  await (await store()).put("Jobs", job.id, job);
  return { job_id: job.id, status: job.status, result, receipt };
}

async function submitPayment(jobId, body) {
  const job = await (await store()).get("Jobs", jobId);
  if (!job)
    throw Object.assign(new Error("job not found"), { statusCode: 404 });
  if (job.status !== "awaiting_payment")
    throw new Error("job is not awaiting payment");
  const quotes = await (await store()).list("Quotes");
  const quote = quotes.find((x) => x.job_id === jobId);
  if (!quote || new Date(quote.expires_at) < new Date())
    throw new Error("quote expired");
  const payment = await verifyPayment(
    config,
    { signature: body.signature },
    quote,
  );
  if (!payment.ok)
    throw Object.assign(new Error(payment.reason), {
      statusCode: 402,
      payment_intent: {
        jobId,
        quoteId: quote.quote_id,
        status: "awaiting_payment",
      },
    });
  await (
    await store()
  ).put(
    "Payments",
    `payment_${body.signature}`,
    {
      id: `payment_${body.signature}`,
      signature: body.signature,
      job_id: jobId,
      consumed_at: now(),
    },
    true,
  );
  const result = await executeService(job.service_id, body.input || {});
  return completeJob(job, result, {
    signature: body.signature,
    currency: quote.currency,
    amount: quote.amount,
  });
}

async function register(body) {
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

async function invokeAgent(body) {
  const agent = await (await store()).get("Registry", body.agentId);
  if (!agent || agent.status !== "verified")
    throw new Error("verified agent required");
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
  await runtimeConfig();
  const method = methodOf(e),
    path = pathOf(e),
    body = method === "GET" ? {} : parseBody(e);
  if (method === "OPTIONS") return json({}, 204);
  if (method === "GET" && ["/", "/api/health"].includes(path)) {
    const stats =
      process.env.NODE_ENV === "test" ? null : await networkStats(config);
    return json({
      status: "ok",
      service: "pdao-agent-exchange",
      version: "1.2.0",
      network: "solana-mainnet-beta",
      rpcMode: config.rpcPrimary.includes("api.mainnet-beta")
        ? "public-fallback"
        : "quicknode-primary",
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
  )
    return json(card());
  if (method === "GET" && path === "/openapi.json") return json(openapi());
  if (method === "GET" && ["/llms.txt", "/llms-full.txt"].includes(path))
    return text(llms());
  if (method === "GET" && path === "/llms.json")
    return json({
      name: "PrivateDAO Agent Exchange",
      services: SERVICES,
      discovery: `https://${config.domain}/.well-known/agent-card.json`,
    });
  if (method === "GET" && path === "/api/services")
    return json({
      services: SERVICES,
      payment: {
        network: "solana-mainnet-beta",
        treasury: config.treasury,
        usdc_mint: config.usdcMint,
      },
    });
  if (method === "GET" && path === "/api/pricing")
    return json({
      network: "solana:mainnet-beta",
      currency: "USDC",
      services: SERVICES.map((service) => ({
        id: service.id,
        price: service.price,
        currency: service.currency,
        access: service.access,
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
  const payment = path.match(/^\/api\/jobs\/([^/]+)\/payment$/);
  if (method === "POST" && payment)
    return json(await submitPayment(payment[1], body));
  if (method === "GET" && path === "/api/network/stats")
    return json(await networkStats(config));
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
      ),
    );
  }
  if (method === "POST" && path === "/api/jobs")
    return json(await createJob(body.service_id, body.input || {}, false));
  if (method === "POST" && path === "/api/tasks")
    return json(await createJob(body.service_id, body.input || {}, false));
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
  if (method === "POST" && path === "/api/agents/invoke")
    return json(await invokeAgent(body));
  if (method === "POST" && path === "/a2a") {
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
        serverInfo: { name: "pdao-agent-exchange", version: "1.1.0" },
        capabilities: { tools: {} },
      },
    });
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
    inputSchema: { type: "object", additionalProperties: false },
  }));
  if (request.method === "tools/list")
    return json({ jsonrpc: "2.0", id, result: { tools } });
  if (request.method === "tools/call") {
    const name = request.params?.name,
      a = request.params?.arguments || {};
    let result;
    if (name === "pdao_services") result = { services: SERVICES };
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
    else throw new Error("unknown MCP tool");
    return json({
      jsonrpc: "2.0",
      id,
      result: {
        content: [{ type: "text", text: JSON.stringify(result) }],
        structuredContent: result,
      },
    });
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
    return await handle(event);
  } catch (error) {
    return errorResponse(error);
  }
}
export function resetForTests() {
  storePromise = Promise.resolve(new MemoryStore());
  configPromise = Promise.resolve(config);
}
