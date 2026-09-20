import assert from "node:assert/strict";
import test from "node:test";
import { createServer } from "node:http";
import { executeEvmService, evmRpcUrl, evmRuntimeStats } from "../src/evm.mjs";
import { readRpc, swapQuote, simulateSolanaTransaction } from "../src/solana.mjs";
import { getConfig } from "../src/config.mjs";
import { enforceRateLimit, resetRuntimeControls } from "../src/runtime-controls.mjs";
import { researchAsset, researchReport, explainTransaction, portfolioIntelligence } from "../src/intelligence.mjs";
import { marketData } from "../src/market.mjs";

test("EVM services are read-only and use the configured provider", async () => {
  const server = createServer(async (request, response) => {
    let body = "";
    for await (const chunk of request) body += chunk;
    const { method } = JSON.parse(body);
    const result = {
      eth_chainId: "0x1",
      eth_getCode: "0x6000",
      eth_call: "0x" + "0".repeat(64),
      eth_getBalance: "0x64",
      eth_getTransactionCount: "0x2",
      eth_estimateGas: "0x5208",
    }[method];
    response.setHeader("content-type", "application/json");
    response.end(JSON.stringify({ jsonrpc: "2.0", id: 1, result }));
  });
  await new Promise((resolve) => server.listen(0, resolve));
  const port = server.address().port;
  const config = { evmRpcUrls: { "ethereum-mainnet": `http://127.0.0.1:${port}` } };
  const token = await executeEvmService(config, "token.intelligence", {
    network: "ethereum-mainnet",
    asset: "0x0000000000000000000000000000000000000001",
  });
  const simulation = await executeEvmService(config, "transaction.simulate", {
    network: "ethereum-mainnet",
    transaction: { to: "0x0000000000000000000000000000000000000001", data: "0x" },
  });
  await executeEvmService(config, "token.intelligence", {
    network: "ethereum-mainnet",
    asset: "0x0000000000000000000000000000000000000001",
  });
  assert.equal(token.contract_present, true);
  assert.equal(simulation.would_broadcast, false);
  assert.equal(simulation.estimated_gas, "0x5208");
  assert.ok(evmRuntimeStats().cache_hits > 0);
  const research = await researchAsset(config, {
    network: "ethereum-mainnet",
    asset: "0x0000000000000000000000000000000000000001",
  });
  assert.equal(research.evidence_confidence, "rpc-confirmed");
  const report = await researchReport(config, {
    network: "ethereum-mainnet",
    asset: "0x0000000000000000000000000000000000000001",
  });
  assert.equal(report.inference.status, "not_configured");
  assert.match(report.report_hash, /^[a-f0-9]{64}$/);
  const explained = await explainTransaction(config, {
    network: "ethereum-mainnet",
    transaction: { to: "0x0000000000000000000000000000000000000001", data: "0x" },
  });
  assert.equal(explained.facts.pre_sign, true);
  assert.equal(explained.facts.would_broadcast, false);
  const portfolio = await portfolioIntelligence(config, {
    network: "ethereum-mainnet",
    assets: ["0x0000000000000000000000000000000000000001", "invalid"],
  });
  assert.equal(portfolio.requested_assets, 2);
  assert.equal(portfolio.completed_assets, 1);
  server.close();
});

test("Alchemy URLs are constructed without exposing the key in results", () => {
  const url = evmRpcUrl({ alchemyApiKey: "test-only-key", evmRpcUrls: {} }, "base-mainnet");
  assert.equal(url, "https://base-mainnet.g.alchemy.com/v2/test-only-key");
  assert.equal(getConfig({ ALCHEMY_API_KEY: "test-only-key" }).rpcSecondary, "https://solana-mainnet.g.alchemy.com/v2/test-only-key");
});

test("Solana reads fall back from a rate-limited primary provider", async () => {
  const originalFetch = global.fetch;
  const originalNodeEnv = process.env.NODE_ENV;
  process.env.NODE_ENV = "test";
  const seen = [];
  global.fetch = async (url, options) => {
    seen.push(url);
    if (url.includes("primary")) return new Response("rate limited", { status: 429 });
    const request = JSON.parse(options.body);
    return new Response(JSON.stringify({ jsonrpc: "2.0", id: 1, result: request.method === "getBalance" ? { value: 7 } : null }), {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  };
  try {
    const result = await readRpc({
      cluster: "mainnet-beta",
      treasury: "2BJ4ezxqV9YJXc38D9duKBkdn4su4jE1beKUHwH663sL",
      usdcMint: "EPjFWdd5AufSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
      rpcPrimary: "https://primary.example",
      rpcSecondary: "https://secondary.example",
      rpcFallback: "https://fallback.example",
      mainnetGenesisHash: "5eykt4UsFv8P8NJdTREpY1vzqKqZKvdpKuc147dw2N9d",
    }, "getBalance", ["2BJ4ezxqV9YJXc38D9duKBkdn4su4jE1beKUHwH663sL"]);
    assert.equal(result.result.value, 7);
    assert.deepEqual(seen, ["https://primary.example", "https://secondary.example"]);
  } finally {
    global.fetch = originalFetch;
    if (originalNodeEnv == null) delete process.env.NODE_ENV;
    else process.env.NODE_ENV = originalNodeEnv;
  }
});

test("Jupiter quote path never broadcasts", async () => {
  const originalFetch = global.fetch;
  global.fetch = async () => new Response(JSON.stringify({
    outAmount: "900000",
    slippageBps: 50,
    contextSlot: 10,
    routePlan: [],
  }), { status: 200, headers: { "content-type": "application/json" } });
  try {
    const result = await swapQuote({
      cluster: "mainnet-beta",
      treasury: "2BJ4ezxqV9YJXc38D9duKBkdn4su4jE1beKUHwH663sL",
      usdcMint: "EPjFWdd5AufSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
      rpcPrimary: "https://api.mainnet-beta.solana.com",
      rpcSecondary: "",
      rpcFallback: "https://api.mainnet-beta.solana.com",
      mainnetGenesisHash: "5eykt4UsFv8P8NJdTREpY1vzqKqZKvdpKuc147dw2N9d",
      jupiterQuoteUrl: "https://quote.invalid/v6/quote",
      jupiterApiKey: "",
    }, {
      inputMint: "So11111111111111111111111111111111111111112",
      outputMint: "EPjFWdd5AufSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
      amount: "1000000",
    });
    assert.equal(result.quote_only, true);
    assert.equal(result.execution, "disabled");
  } finally {
    global.fetch = originalFetch;
  }
});

test("runtime controls enforce bounded request rates", () => {
  resetRuntimeControls();
  enforceRateLimit("test-agent", 2, 60000);
  enforceRateLimit("test-agent", 2, 60000);
  assert.throws(() => enforceRateLimit("test-agent", 2, 60000), /rate limit exceeded/);
  resetRuntimeControls();
});

test("Solana simulation is RPC-backed and never broadcasts", async () => {
  const originalFetch = global.fetch;
  const calls = [];
  global.fetch = async (_url, options) => {
    const request = JSON.parse(options.body);
    calls.push(request.method);
    const result = request.method === "getGenesisHash"
      ? "5eykt4UsFv8P8NJdTREpY1vzqKqZKvdpKuc147dw2N9d"
      : request.method === "simulateTransaction"
        ? { value: { err: null, logs: ["Program ok"], unitsConsumed: 1200 } }
        : null;
    return new Response(JSON.stringify({ jsonrpc: "2.0", id: 1, result }), {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  };
  try {
    const result = await simulateSolanaTransaction({
      cluster: "mainnet-beta",
      treasury: "2BJ4ezxqV9YJXc38D9duKBkdn4su4jE1beKUHwH663sL",
      usdcMint: "EPjFWdd5AufSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
      rpcPrimary: "https://rpc.example",
      rpcSecondary: "",
      rpcFallback: "https://rpc.example",
      mainnetGenesisHash: "5eykt4UsFv8P8NJdTREpY1vzqKqZKvdpKuc147dw2N9d",
    }, { transaction: "AA==" });
    assert.equal(result.would_broadcast, false);
    assert.equal(result.units_consumed, 1200);
    assert.deepEqual(calls, ["getGenesisHash", "simulateTransaction"]);
  } finally {
    global.fetch = originalFetch;
  }
});

test("market data uses a chain-filtered sourced pair", async () => {
  const originalFetch = global.fetch;
  global.fetch = async () => new Response(JSON.stringify({
    pairs: [
      { chainId: "ethereum", pairAddress: "0xpair", dexId: "testdex", priceUsd: "1.25", liquidity: { usd: 1000 }, volume: { h24: 42 }, baseToken: { symbol: "TEST" }, quoteToken: { symbol: "USDC" } },
      { chainId: "base", pairAddress: "0xother", liquidity: { usd: 999999 } },
    ],
  }), { status: 200, headers: { "content-type": "application/json" } });
  try {
    const result = await marketData({ marketDataUrl: "https://market.example/latest/dex" }, "ethereum-mainnet", "0x0000000000000000000000000000000000000001");
    assert.equal(result.status, "source_confirmed");
    assert.equal(result.pair_address, "0xpair");
    assert.equal(result.price_usd, "1.25");
    const cached = await marketData({ marketDataUrl: "https://market.example/latest/dex" }, "ethereum-mainnet", "0x0000000000000000000000000000000000000001");
    assert.equal(cached.cache, "hit");
  } finally {
    global.fetch = originalFetch;
  }
});
