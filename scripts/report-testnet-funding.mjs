import fs from "node:fs";

const wallet = process.env.PDAO_EVM_TEST_WALLET ?? process.argv[2];
if (!wallet || !/^0x[0-9a-fA-F]{40}$/.test(wallet)) {
  throw new Error("Set PDAO_EVM_TEST_WALLET to a public EVM address; no private key is accepted");
}

const networks = [
  { id: "ethereum-sepolia", chainId: 11155111, asset: "ETH", rpcEnv: "PDAO_EVM_ETHEREUM_SEPOLIA_RPC_URL", rpc: "https://ethereum-sepolia-rpc.publicnode.com" },
  { id: "base-sepolia", chainId: 84532, asset: "ETH", rpcEnv: "PDAO_EVM_BASE_SEPOLIA_RPC_URL", rpc: "https://sepolia.base.org" },
  { id: "arbitrum-sepolia", chainId: 421614, asset: "ETH", rpcEnv: "PDAO_EVM_ARBITRUM_SEPOLIA_RPC_URL", rpc: "https://sepolia-rollup.arbitrum.io/rpc" },
  { id: "bnb-testnet", chainId: 97, asset: "tBNB", rpcEnv: "PDAO_EVM_BNB_TESTNET_RPC_URL", rpc: "https://bsc-testnet-dataseed.bnbchain.org" },
  { id: "robinhood-testnet", chainId: 46630, asset: "ETH", rpcEnv: "PDAO_EVM_ROBINHOOD_TESTNET_RPC_URL", rpc: "https://rpc.testnet.chain.robinhood.com" },
  { id: "hyperliquid-testnet", chainId: 998, asset: "HYPE", rpcEnv: "PDAO_EVM_HYPERLIQUID_TESTNET_RPC_URL", rpc: "https://rpc.hyperliquid-testnet.xyz/evm" },
];

const minimumWei = 10_000_000_000_000_000n;
const weiToDecimal = (value) => {
  const whole = value / 1_000_000_000_000_000_000n;
  const fraction = (value % 1_000_000_000_000_000_000n).toString().padStart(18, "0").replace(/0+$/, "");
  return fraction ? `${whole}.${fraction}` : `${whole}`;
};

async function rpc(url, method, params) {
  const response = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }),
  });
  const body = await response.json();
  if (!response.ok || body.error) throw new Error(body.error?.message ?? `HTTP ${response.status}`);
  return body.result;
}

const results = [];
for (const network of networks) {
  const rpcUrl = process.env[network.rpcEnv] ?? network.rpc;
  try {
    const chainId = Number.parseInt(await rpc(rpcUrl, "eth_chainId", []), 16);
    const rawBalance = BigInt(await rpc(rpcUrl, "eth_getBalance", [wallet, "latest"]));
    results.push({
      network: network.id,
      expectedChainId: network.chainId,
      observedChainId: chainId,
      asset: network.asset,
      balance: weiToDecimal(rawBalance),
      rawWei: rawBalance.toString(),
      rpc: "reachable",
      status: chainId !== network.chainId ? "chain_mismatch" : rawBalance >= minimumWei ? "funded" : "underfunded",
    });
  } catch (error) {
    results.push({
      network: network.id,
      expectedChainId: network.chainId,
      asset: network.asset,
      rpc: "unreachable_or_error",
      status: "unknown",
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

const snapshot = {
  generatedAt: new Date().toISOString(),
  wallet,
  mode: "read-only",
  signing: false,
  transfers: false,
  minimumNativeAsset: "0.01",
  networks: results,
};

const output = process.env.PDAO_FUNDING_SNAPSHOT_PATH;
if (output) fs.writeFileSync(output, `${JSON.stringify(snapshot, null, 2)}\n`, { mode: 0o600 });
console.log(JSON.stringify(snapshot, null, 2));
