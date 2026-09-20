import assert from "node:assert/strict";
import test from "node:test";
import { createServer } from "node:http";
import { executeEvmService, evmRpcUrl } from "../src/evm.mjs";
import { swapQuote } from "../src/solana.mjs";
import { enforceRateLimit, resetRuntimeControls } from "../src/runtime-controls.mjs";

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
  assert.equal(token.contract_present, true);
  assert.equal(simulation.would_broadcast, false);
  assert.equal(simulation.estimated_gas, "0x5208");
  server.close();
});

test("Alchemy URLs are constructed without exposing the key in results", () => {
  const url = evmRpcUrl({ alchemyApiKey: "test-only-key", evmRpcUrls: {} }, "base-mainnet");
  assert.equal(url, "https://base-mainnet.g.alchemy.com/v2/test-only-key");
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
