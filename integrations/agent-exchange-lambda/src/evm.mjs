const EVM_NETWORKS = Object.freeze({
  "ethereum-mainnet": { chainId: "0x1", label: "Ethereum Mainnet", alchemySlug: "eth-mainnet", env: "PDAO_EVM_ETHEREUM_MAINNET_RPC_URL" },
  "base-mainnet": { chainId: "0x2105", label: "Base Mainnet", alchemySlug: "base-mainnet", env: "PDAO_EVM_BASE_MAINNET_RPC_URL" },
  "arbitrum-mainnet": { chainId: "0xa4b1", label: "Arbitrum One", alchemySlug: "arb-mainnet", env: "PDAO_EVM_ARBITRUM_MAINNET_RPC_URL" },
});

const hexAddress = /^0x[0-9a-fA-F]{40}$/;
const hexData = /^0x(?:[0-9a-fA-F]{2})*$/;

export function evmNetwork(id) {
  return EVM_NETWORKS[id] || null;
}

export function evmNetworks() {
  return Object.entries(EVM_NETWORKS).map(([id, value]) => ({ id, ...value }));
}

export function evmRpcUrl(config, network) {
  const definition = evmNetwork(network);
  if (!definition) throw new Error(`unsupported EVM network: ${network}`);
  const explicit = config.evmRpcUrls?.[network];
  if (explicit) return explicit;
  if (config.alchemyApiKey) return `https://${definition.alchemySlug}.g.alchemy.com/v2/${config.alchemyApiKey}`;
  throw new Error(`RPC is not configured for ${network}`);
}

async function rpcCall(url, method, params = []) {
  const response = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }),
    signal: AbortSignal.timeout(10000),
  });
  if (!response.ok) throw new Error(`EVM RPC HTTP ${response.status}`);
  const body = await response.json();
  if (body.error) throw new Error(`EVM RPC ${body.error.code}: ${body.error.message}`);
  return body.result;
}

async function read(config, network, method, params = []) {
  const definition = evmNetwork(network);
  const url = evmRpcUrl(config, network);
  const chainId = await rpcCall(url, "eth_chainId");
  if (chainId.toLowerCase() !== definition.chainId) throw new Error(`chain ID mismatch for ${network}`);
  return { result: await rpcCall(url, method, params), chainId, providerClass: config.evmRpcUrls?.[network] ? "configured-rpc" : "alchemy" };
}

function decodeUint(result) {
  return result && result !== "0x" ? BigInt(result).toString() : null;
}

function decodeString(result) {
  if (!result || result === "0x") return null;
  try {
    const bytes = result.slice(2);
    if (bytes.length < 128) return null;
    const offset = Number.parseInt(bytes.slice(0, 64), 16) * 2;
    const length = Number.parseInt(bytes.slice(offset, offset + 64), 16) * 2;
    return Buffer.from(bytes.slice(offset + 64, offset + 64 + length), "hex").toString("utf8").replace(/\0+$/, "");
  } catch { return null; }
}

async function tokenCalls(config, network, asset) {
  if (!hexAddress.test(asset)) throw new Error("valid EVM token address is required");
  const [code, decimals, supply, name, symbol] = await Promise.all([
    read(config, network, "eth_getCode", [asset, "latest"]),
    read(config, network, "eth_call", [{ to: asset, data: "0x313ce567" }, "latest"]),
    read(config, network, "eth_call", [{ to: asset, data: "0x18160ddd" }, "latest"]),
    read(config, network, "eth_call", [{ to: asset, data: "0x06fdde03" }, "latest"]),
    read(config, network, "eth_call", [{ to: asset, data: "0x95d89b41" }, "latest"]),
  ]);
  return {
    network,
    asset,
    contract_present: code.result !== "0x",
    bytecode_bytes: Math.max(0, (code.result?.length || 2) / 2 - 1),
    decimals: decodeUint(decimals.result),
    total_supply: decodeUint(supply.result),
    name: decodeString(name.result),
    symbol: decodeString(symbol.result),
    evidence_confidence: "rpc-confirmed",
    provider_class: code.providerClass,
    observed_at: new Date().toISOString(),
  };
}

export async function executeEvmService(config, serviceId, input = {}) {
  const network = String(input.network || "");
  const definition = evmNetwork(network);
  if (!definition) throw new Error("supported EVM network is required");
  const asset = input.asset || input.token || input.contract;
  if (["token.intelligence", "risk.score", "market.snapshot"].includes(serviceId)) {
    const evidence = await tokenCalls(config, network, asset);
    if (serviceId === "risk.score") {
      const factors = {
        contract_present: evidence.contract_present,
        standard_metadata_available: Boolean(evidence.decimals && evidence.total_supply),
        evidence_confidence: evidence.evidence_confidence,
      };
      return { ...evidence, factors, methodology: "deterministic-evm-observations-v1", score: factors.contract_present ? 0 : null, score_status: factors.contract_present ? "limited-signal" : "insufficient-evidence" };
    }
    return evidence;
  }
  if (serviceId === "wallet.intelligence") {
    const address = input.wallet || input.address;
    if (!hexAddress.test(address || "")) throw new Error("valid EVM wallet address is required");
    const [balance, nonce, code] = await Promise.all([
      read(config, network, "eth_getBalance", [address, "latest"]),
      read(config, network, "eth_getTransactionCount", [address, "latest"]),
      read(config, network, "eth_getCode", [address, "latest"]),
    ]);
    return { network, address, native_balance_wei: decodeUint(balance.result), transaction_count: Number.parseInt(nonce.result, 16), is_contract: code.result !== "0x", evidence_confidence: "rpc-confirmed", provider_class: balance.providerClass, observed_at: new Date().toISOString() };
  }
  if (serviceId === "transaction.simulate") {
    const tx = input.transaction || input;
    if (tx.to && !hexAddress.test(tx.to)) throw new Error("valid EVM transaction.to is required");
    if (tx.from && !hexAddress.test(tx.from)) throw new Error("valid EVM transaction.from is required");
    if (tx.data && !hexData.test(tx.data)) throw new Error("transaction.data must be hex");
    const call = { ...(tx.from ? { from: tx.from } : {}), ...(tx.to ? { to: tx.to } : {}), ...(tx.data ? { data: tx.data } : {}), ...(tx.value ? { value: tx.value } : {}) };
    const [result, gas] = await Promise.all([
      read(config, network, "eth_call", [call, "latest"]),
      read(config, network, "eth_estimateGas", [call]),
    ]);
    return { network, simulated: true, would_broadcast: false, return_data: result.result, estimated_gas: gas.result, evidence_confidence: "rpc-confirmed", provider_class: result.providerClass, observed_at: new Date().toISOString() };
  }
  throw new Error(`service ${serviceId} is not implemented for EVM`);
}

export async function evmHealth(config, network) {
  const definition = evmNetwork(network);
  if (!definition) throw new Error(`unsupported EVM network: ${network}`);
  const started = Date.now();
  const [chain, block, gas] = await Promise.all([
    read(config, network, "eth_chainId"),
    read(config, network, "eth_blockNumber"),
    read(config, network, "eth_gasPrice"),
  ]);
  return { network, label: definition.label, chain_id: chain.result, block_number: block.result, gas_price_wei: decodeUint(gas.result), latency_ms: Date.now() - started, provider: chain.providerClass, status: "rpc_healthy", observed_at: new Date().toISOString() };
}
