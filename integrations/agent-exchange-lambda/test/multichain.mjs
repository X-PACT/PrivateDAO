import assert from "node:assert/strict";
import test from "node:test";
import { createServer } from "node:http";
import { executeEvmService, evmRpcUrl, evmRuntimeStats } from "../src/evm.mjs";
import { derivedTreasuryTokenAccount, mintEvidence, readRpc, solanaHealth, swapQuote, simulateSolanaTransaction, usdcTreasuryReadiness, verifyPayment } from "../src/solana.mjs";
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

test("EVM provider retries a transient response without exposing endpoint details", async () => {
  const originalFetch = global.fetch;
  let calls = 0;
  global.fetch = async (_url, options) => {
    calls += 1;
    if (calls === 1) return new Response("busy", { status: 429 });
    const request = JSON.parse(options.body);
    const result = request.method === "eth_chainId" ? "0x2105" : "0x1234";
    return new Response(JSON.stringify({ jsonrpc: "2.0", id: 1, result }), {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  };
  try {
    const result = await executeEvmService({ evmRpcUrls: { "base-mainnet": "https://rpc.example/private-key" } }, "transaction.simulate", {
      network: "base-mainnet",
      transaction: { to: "0x0000000000000000000000000000000000000001", data: "0x" },
    });
    assert.equal(result.would_broadcast, false);
    assert.equal(result.block_number, "0x1234");
    assert.equal(calls >= 4, true);
  } finally {
    global.fetch = originalFetch;
  }
});

test("production treasury token account is canonical and alternatives are rejected", async () => {
  const canonical = await derivedTreasuryTokenAccount({
    treasury: "2BJ4ezxqV9YJXc38D9duKBkdn4su4jE1beKUHwH663sL",
    usdcMint: "EPjFWdd5AufSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
  });
  assert.equal(canonical, "L2iAzRuZZrubxcfkQXqBGpPHWej9vLMbm24cDT2jqbv");
  await assert.rejects(
    () => derivedTreasuryTokenAccount({ treasury: "11111111111111111111111111111111", usdcMint: canonical }),
    /unsupported production treasury or USDC mint/,
  );
});

test("USDC payment readiness rejects an uninitialized or mismatched treasury ATA", async () => {
  const originalFetch = global.fetch;
  const originalNodeEnv = process.env.NODE_ENV;
  delete process.env.NODE_ENV;
  global.fetch = async (_url, options) => {
    const request = JSON.parse(options.body);
    const result = request.method === "getGenesisHash"
      ? "5eykt4UsFv8P8NJdTREpY1vzqKqZKvdpKuc147dw2N9d"
      : { value: null };
    return new Response(JSON.stringify({ jsonrpc: "2.0", id: 1, result }), {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  };
  try {
    const readiness = await usdcTreasuryReadiness({
      cluster: "mainnet-beta",
      treasury: "2BJ4ezxqV9YJXc38D9duKBkdn4su4jE1beKUHwH663sL",
      usdcMint: "EPjFWdd5AufSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
      rpcPrimary: "https://primary.example",
      rpcSecondary: "",
      rpcFallback: "",
      mainnetGenesisHash: "5eykt4UsFv8P8NJdTREpY1vzqKqZKvdpKuc147dw2N9d",
    });
    assert.equal(readiness.ready, false);
    assert.equal(readiness.status, "ATA_NOT_INITIALIZED");
  } finally {
    global.fetch = originalFetch;
    if (originalNodeEnv == null) delete process.env.NODE_ENV;
    else process.env.NODE_ENV = originalNodeEnv;
  }
});

test("payment verification rejects malformed signatures before contacting RPC", async () => {
  const originalFetch = global.fetch;
  let calls = 0;
  global.fetch = async () => {
    calls += 1;
    throw new Error("RPC should not be called for malformed signatures");
  };
  try {
    const result = await verifyPayment({
      cluster: "mainnet-beta",
      treasury: "2BJ4ezxqV9YJXc38D9duKBkdn4su4jE1beKUHwH663sL",
      usdcMint: "EPjFWdd5AufSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
      rpcPrimary: "https://rpc.example/primary",
    }, { signature: "not-a-real-solana-signature" }, { amountAtomic: "1" });
    assert.equal(result.ok, false);
    assert.equal(result.transient, undefined);
    assert.equal(result.reason, "invalid Solana transaction signature");
    assert.equal(calls, 0);
  } finally {
    global.fetch = originalFetch;
  }
});

test("payment verification binds a finalized transfer to the quoted payment reference and ATA", async () => {
  const originalFetch = global.fetch;
  const signature = "1".repeat(64);
  const treasuryOwner = "2BJ4ezxqV9YJXc38D9duKBkdn4su4jE1beKUHwH663sL";
  const treasuryTokenAccount = "L2iAzRuZZrubxcfkQXqBGpPHWej9vLMbm24cDT2jqbv";
  const mint = "EPjFWdd5AufSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v";
  global.fetch = async (_url, options) => {
    const request = JSON.parse(options.body);
    if (request.method === "getTransaction") {
      return {
        ok: true,
        json: async () => ({ result: {
          slot: 10,
          blockTime: 1700000000,
          transaction: { message: { instructions: [
            { program: "spl-token", parsed: { type: "transferChecked", info: { destination: treasuryTokenAccount, amount: "100", mint } } },
            { program: "spl-memo", parsed: "PDAOJOB:another-job" },
          ] } },
          meta: { err: null },
        } }),
      };
    }
    if (request.method === "getTokenAccountsByOwner") {
      return {
        ok: true,
        json: async () => ({ result: { value: [{ pubkey: treasuryTokenAccount }] } }),
      };
    }
    throw new Error(`unexpected RPC method: ${request.method}`);
  };
  try {
    const result = await verifyPayment({
      cluster: "mainnet-beta",
      treasury: treasuryOwner,
      usdcMint: mint,
      rpcPrimary: "https://rpc.example/primary",
    }, { signature }, {
      amountAtomic: "100",
      currency: "USDC",
      mint,
      treasuryOwner,
      treasuryTokenAccount,
      paymentReference: "PDAOJOB:expected-job",
    });
    assert.equal(result.ok, false);
    assert.equal(result.transient, undefined);
    assert.equal(result.reason, "payment reference does not match quote");
  } finally {
    global.fetch = originalFetch;
  }
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

test("Solana health reports the required read-only checks", async () => {
  const originalFetch = global.fetch;
  const originalNodeEnv = process.env.NODE_ENV;
  process.env.NODE_ENV = "test";
  global.fetch = async (_url, options) => {
    const request = JSON.parse(options.body);
    const result = {
      getHealth: "ok",
      getVersion: { "solana-core": "test-version" },
      getSlot: 123,
      getLatestBlockhash: { value: { blockhash: "test-blockhash" } },
    }[request.method];
    return new Response(JSON.stringify({ jsonrpc: "2.0", id: 1, result }), {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  };
  try {
    const health = await solanaHealth({
      cluster: "mainnet-beta",
      treasury: "2BJ4ezxqV9YJXc38D9duKBkdn4su4jE1beKUHwH663sL",
      usdcMint: "EPjFWdd5AufSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
      rpcPrimary: "https://alchemy.example",
      rpcSecondary: "",
      rpcFallback: "",
      mainnetGenesisHash: "5eykt4UsFv8P8NJdTREpY1vzqKqZKvdpKuc147dw2N9d",
    });
    assert.equal(health.status, "rpc_healthy");
    assert.equal(health.health, "ok");
    assert.equal(health.slot, 123);
    assert.equal(health.latest_blockhash_available, true);
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
    assert.deepEqual(calls, process.env.NODE_ENV === "test"
      ? ["simulateTransaction"]
      : ["getGenesisHash", "simulateTransaction"]);
  } finally {
    global.fetch = originalFetch;
  }
});

test("Solana token evidence remains useful when optional methods are unavailable", async () => {
  const originalFetch = global.fetch;
  const originalNodeEnv = process.env.NODE_ENV;
  process.env.NODE_ENV = "test";
  global.fetch = async (_url, options) => {
    const request = JSON.parse(options.body);
    const result = request.method === "getAccountInfo"
      ? { value: { owner: "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA", data: { parsed: { info: { mintAuthority: null, freezeAuthority: null } } } } }
      : null;
    const error = request.method === "getTokenSupply"
      ? { code: -32602, message: "unsupported token supply" }
      : request.method === "getTokenLargestAccounts"
        ? { code: 429, message: "rate limited" }
        : null;
    return new Response(JSON.stringify({ jsonrpc: "2.0", id: 1, ...(error ? { error } : { result }) }), {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  };
  try {
    const evidence = await mintEvidence({
      cluster: "mainnet-beta",
      treasury: "2BJ4ezxqV9YJXc38D9duKBkdn4su4jE1beKUHwH663sL",
      usdcMint: "EPjFWdd5AufSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
      rpcPrimary: "https://primary.example",
      rpcSecondary: "",
      rpcFallback: "",
      mainnetGenesisHash: "5eykt4UsFv8P8NJdTREpY1vzqKqZKvdpKuc147dw2N9d",
    }, "EPjFWdd5AufSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v");
    assert.equal(evidence.valid, true);
    assert.equal(evidence.supply, null);
    assert.equal(evidence.largest_accounts.length, 0);
    assert.match(evidence.evidence_gaps.token_supply, /unsupported/);
    assert.match(evidence.evidence_gaps.largest_accounts, /rate limited/);
  } finally {
    global.fetch = originalFetch;
    if (originalNodeEnv == null) delete process.env.NODE_ENV;
    else process.env.NODE_ENV = originalNodeEnv;
  }
});

test("Solana evidence exposes provider class, never authenticated RPC URLs", async () => {
  const originalFetch = global.fetch;
  const originalNodeEnv = process.env.NODE_ENV;
  process.env.NODE_ENV = "test";
  global.fetch = async (_url, options) => {
    const request = JSON.parse(options.body);
    const result = request.method === "getAccountInfo"
      ? { value: { owner: "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA", data: { parsed: { info: { mintAuthority: null, freezeAuthority: null } } } } }
      : request.method === "getTokenSupply"
        ? { value: { amount: "1", decimals: 6 } }
        : request.method === "getTokenLargestAccounts"
          ? { value: [] }
          : null;
    return new Response(JSON.stringify({ jsonrpc: "2.0", id: 1, result }), {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  };
  try {
    const evidence = await mintEvidence({
      cluster: "mainnet-beta",
      treasury: "2BJ4ezxqV9YJXc38D9duKBkdn4su4jE1beKUHwH663sL",
      usdcMint: "EPjFWdd5AufSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
      rpcPrimary: "https://solana-mainnet.g.alchemy.com/v2/test-only-key",
      rpcSecondary: "",
      rpcFallback: "",
      mainnetGenesisHash: "5eykt4UsFv8P8NJdTREpY1vzqKqZKvdpKuc147dw2N9d",
    }, "EPjFWdd5AufSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v");
    assert.equal(evidence.provider_source, "alchemy");
    assert.doesNotMatch(JSON.stringify(evidence), /test-only-key/);
  } finally {
    global.fetch = originalFetch;
    if (originalNodeEnv == null) delete process.env.NODE_ENV;
    else process.env.NODE_ENV = originalNodeEnv;
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
