import { NETWORK_MATRIX } from "../packages/privatedao-runtime/src/networks.ts";

const endpoints = {
  "ethereum-sepolia": "https://ethereum-sepolia.publicnode.com",
  "arbitrum-sepolia": "https://sepolia-rollup.arbitrum.io/rpc",
  "bnb-testnet": "https://data-seed-prebsc-1-s1.bnbchain.org:8545",
  "base-sepolia": "https://sepolia.base.org",
  "robinhood-testnet": "https://rpc.testnet.chain.robinhood.com",
  "tempo-testnet": "https://rpc.moderato.tempo.xyz",
};

const timeoutMs = Number(process.env.PDAO_RPC_PROBE_TIMEOUT_MS || 10_000);

async function probe(network, url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  const started = Date.now();
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "eth_chainId", params: [] }),
      signal: controller.signal,
    });
    const body = await response.json();
    const chainId = typeof body.result === "string" ? Number.parseInt(body.result, 16) : null;
    const expected = Number(network.chainId);
    return {
      network: network.id,
      environment: network.environment,
      urlHost: new URL(url).host,
      httpStatus: response.status,
      expectedChainId: expected,
      observedChainId: chainId,
      latencyMs: Date.now() - started,
      status: response.ok && chainId === expected ? "healthy" : "mismatch",
    };
  } catch (error) {
    return {
      network: network.id,
      environment: network.environment,
      urlHost: new URL(url).host,
      expectedChainId: Number(network.chainId),
      observedChainId: null,
      latencyMs: Date.now() - started,
      status: error?.name === "AbortError" ? "timeout" : "unreachable",
    };
  } finally {
    clearTimeout(timer);
  }
}

const results = [];
for (const [id, url] of Object.entries(endpoints)) {
  const network = NETWORK_MATRIX.find((entry) => entry.id === id);
  if (!network || network.family !== "evm" || network.environment !== "testnet") throw new Error(`Invalid probe network: ${id}`);
  results.push(await probe(network, url));
}

const failed = results.filter((entry) => entry.status !== "healthy");
console.log(JSON.stringify({ schema: "privatedao.evm-rpc-readiness.v1", readOnly: true, bridgeFree: true, results }, null, 2));
if (failed.length > 0) process.exit(1);
