import { digest } from "./canonical.mjs";
import { evmNetwork, executeEvmService, evmRead } from "./evm.mjs";
import { mintEvidence, readRpc, simulateSolanaTransaction } from "./solana.mjs";
import { runIntelInference } from "./intel.mjs";
import { marketData } from "./market.mjs";

const solanaAddress = /^[1-9A-HJ-NP-Za-km-z]{32,88}$/;
const evmAddress = /^0x[0-9a-fA-F]{40}$/;
const evmTx = /^0x[0-9a-fA-F]{64}$/;

function networkOf(input) {
  const network = String(input?.network || "");
  if (network === "solana-mainnet-beta" || evmNetwork(network)) return network;
  throw new Error("supported network is required");
}

function sourceFacts(network, provider, facts) {
  return {
    network,
    provider,
    evidence_confidence: "rpc-confirmed",
    facts,
  };
}

function topHolderShare(evidence) {
  const total = BigInt(evidence.supply || "0");
  if (!total || !Array.isArray(evidence.largest_accounts)) return null;
  const top = evidence.largest_accounts.slice(0, 10).reduce((sum, item) => sum + BigInt(item.amount || "0"), 0n);
  return Number((top * 10000n) / total) / 100;
}

export async function researchAsset(config, input = {}) {
  const network = networkOf(input);
  const asset = String(input.asset || input.mint || input.token || "");
  if (network === "solana-mainnet-beta") {
    if (!solanaAddress.test(asset)) throw new Error("valid Solana mint is required");
    const evidence = await mintEvidence(config, asset);
    return {
      ...sourceFacts(network, evidence.provider_source, {
        asset,
        valid: evidence.valid,
        token_program: evidence.token_program,
        decimals: evidence.decimals,
        supply: evidence.supply,
        mint_authority: evidence.mint_authority,
        freeze_authority: evidence.freeze_authority,
        largest_accounts: evidence.largest_accounts,
        observed_at: evidence.observed_at,
      }),
      signals: {
        top_10_holder_share_percent: topHolderShare(evidence),
        authorities_present: Boolean(evidence.mint_authority || evidence.freeze_authority),
      },
      interpretation: { status: "not_enabled", provider: null },
    };
  }
  if (!evmAddress.test(asset)) throw new Error("valid EVM token address is required");
  const evidence = await executeEvmService(config, "token.intelligence", { network, asset });
  return {
    ...sourceFacts(network, evidence.provider_class, {
      asset,
      contract_present: evidence.contract_present,
      bytecode_bytes: evidence.bytecode_bytes,
      name: evidence.name,
      symbol: evidence.symbol,
      decimals: evidence.decimals,
      total_supply: evidence.total_supply,
      provider_metadata: evidence.provider_metadata,
      observed_at: evidence.observed_at,
    }),
    signals: {
      contract_present: evidence.contract_present,
      standard_metadata_available: Boolean(evidence.decimals !== null && evidence.total_supply !== null),
    },
    interpretation: { status: "not_enabled", provider: null },
  };
}

export async function researchWallet(config, input = {}) {
  const network = networkOf(input);
  const address = String(input.wallet || input.address || "");
  if (network === "solana-mainnet-beta") {
    if (!solanaAddress.test(address)) throw new Error("valid Solana wallet address is required");
    const [balance, accounts, signatures] = await Promise.all([
      readRpc(config, "getBalance", [address]),
      readRpc(config, "getTokenAccountsByOwner", [address, { programId: "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA" }, { encoding: "jsonParsed" }]),
      readRpc(config, "getSignaturesForAddress", [address, { limit: 20 }]),
    ]);
    return sourceFacts(network, balance.providerClass, {
      address,
      native_balance_lamports: balance.result?.value || 0,
      token_account_count: accounts.result?.value?.length || 0,
      recent_signatures: (signatures.result || []).map((item) => ({ signature: item.signature, slot: item.slot, err: item.err || null, block_time: item.blockTime || null })),
      observed_at: new Date().toISOString(),
    });
  }
  if (!evmAddress.test(address)) throw new Error("valid EVM wallet address is required");
  const evidence = await executeEvmService(config, "wallet.intelligence", { network, address });
  return sourceFacts(network, evidence.provider_class, {
    address,
    native_balance_wei: evidence.native_balance_wei,
    transaction_count: evidence.transaction_count,
    is_contract: evidence.is_contract,
    token_balances: evidence.token_balances,
    token_balance_source: evidence.token_balance_source,
    observed_at: evidence.observed_at,
  });
}

export async function explainContract(config, input = {}) {
  const network = networkOf(input);
  const address = String(input.address || input.contract || input.asset || input.mint || "");
  if (network === "solana-mainnet-beta") {
    if (!solanaAddress.test(address)) throw new Error("valid Solana program or account is required");
    const account = await readRpc(config, "getAccountInfo", [address, { encoding: "jsonParsed" }]);
    return sourceFacts(network, account.providerClass, {
      address,
      exists: Boolean(account.result?.value),
      owner: account.result?.value?.owner || null,
      executable: Boolean(account.result?.value?.executable),
      data_encoding: account.result?.value?.data?.[1] || null,
      observed_at: new Date().toISOString(),
    });
  }
  if (!evmAddress.test(address)) throw new Error("valid EVM contract address is required");
  const code = await evmRead(config, network, "eth_getCode", [address, "latest"]);
  return sourceFacts(network, code.providerClass, {
    address,
    contract_present: code.result !== "0x",
    bytecode_bytes: Math.max(0, (code.result?.length || 2) / 2 - 1),
    observed_at: new Date().toISOString(),
  });
}

export async function explainTransaction(config, input = {}) {
  const network = networkOf(input);
  if (network === "solana-mainnet-beta" && (input.unsignedTransaction || input.serializedTransaction)) {
    const simulation = await simulateSolanaTransaction(config, {
      transaction: input.unsignedTransaction || input.serializedTransaction,
    });
    return sourceFacts(network, simulation.provider_class, {
      pre_sign: true,
      simulated: true,
      would_broadcast: false,
      error: simulation.err,
      logs: simulation.logs,
      units_consumed: simulation.units_consumed,
      observed_at: simulation.observed_at,
    });
  }
  if (network !== "solana-mainnet-beta" && input.transaction && typeof input.transaction === "object") {
    const simulation = await executeEvmService(config, "transaction.simulate", { network, transaction: input.transaction });
    return sourceFacts(network, simulation.provider_class, {
      pre_sign: true,
      simulated: true,
      would_broadcast: false,
      error: null,
      return_data: simulation.return_data,
      estimated_gas: simulation.estimated_gas,
      observed_at: simulation.observed_at,
    });
  }
  const hash = String(input.hash || input.signature || input.transaction || "");
  if (network === "solana-mainnet-beta") {
    if (!solanaAddress.test(hash)) throw new Error("valid Solana transaction signature is required");
    const tx = await readRpc(config, "getTransaction", [hash, { commitment: "finalized", maxSupportedTransactionVersion: 0, encoding: "jsonParsed" }]);
    return sourceFacts(network, tx.providerClass, {
      signature: hash,
      found: Boolean(tx.result),
      slot: tx.result?.slot || null,
      block_time: tx.result?.blockTime || null,
      error: tx.result?.meta?.err || null,
      fee_lamports: tx.result?.meta?.fee || null,
      instruction_count: tx.result?.transaction?.message?.instructions?.length || 0,
    });
  }
  if (!evmTx.test(hash)) throw new Error("valid EVM transaction hash is required");
  const [transaction, receipt] = await Promise.all([
    evmRead(config, network, "eth_getTransactionByHash", [hash]),
    evmRead(config, network, "eth_getTransactionReceipt", [hash]),
  ]);
  return sourceFacts(network, transaction.providerClass, {
    hash,
    found: Boolean(transaction.result),
    from: transaction.result?.from || null,
    to: transaction.result?.to || null,
    value: transaction.result?.value || null,
    nonce: transaction.result?.nonce || null,
    block_number: transaction.result?.blockNumber || null,
    status: receipt.result?.status || null,
    gas_used: receipt.result?.gasUsed || null,
  });
}

export async function detectAnomaly(config, input = {}) {
  const subject = input.wallet || input.address ? await researchWallet(config, input) : await researchAsset(config, input);
  const signals = [];
  const facts = subject.facts || {};
  if (facts.contract_present === false || facts.valid === false) signals.push({ id: "missing_subject", severity: "high", fact: "subject_not_found" });
  if (facts.mint_authority || facts.freeze_authority) signals.push({ id: "mutable_token_authority", severity: "medium", fact: "authority_present" });
  if (Number(subject.signals?.top_10_holder_share_percent) > 50) signals.push({ id: "concentrated_supply", severity: "medium", fact: "top_10_share_above_50_percent" });
  return {
    subject: subject.facts?.asset || subject.facts?.address,
    network: subject.network,
    facts: subject.facts,
    signals,
    model: { status: "not_enabled", provider: null },
    report_hash: digest({ subject, signals }),
  };
}

export async function researchReport(config, input = {}) {
  const subject = input.wallet || input.address
    ? await researchWallet(config, input)
    : await researchAsset(config, input);
  const anomaly = await detectAnomaly(config, input);
  const inference = await runIntelInference(config, {
    facts: subject.facts,
    signals: anomaly.signals,
    network: subject.network,
  });
  return {
    report_type: "agent-research-report",
    network: subject.network,
    generated_at: new Date().toISOString(),
    facts: subject.facts,
    signals: [...(subject.signals ? Object.entries(subject.signals).map(([id, value]) => ({ id, value, type: "signal" })) : []), ...anomaly.signals],
    inference,
    evidence_confidence: subject.evidence_confidence,
    report_hash: digest({ subject, anomaly }),
  };
}

export async function portfolioIntelligence(config, input = {}) {
  const network = networkOf(input);
  if (!Array.isArray(input.assets) || input.assets.length < 1 || input.assets.length > 10)
    throw new Error("assets must contain between 1 and 10 identifiers");
  const results = await Promise.all(input.assets.map(async (asset) => {
    try {
      return { asset, status: "complete", report: await researchAsset(config, { network, asset }) };
    } catch (error) {
      return { asset, status: "failed", error: error.message };
    }
  }));
  const completed = results.filter((item) => item.status === "complete");
  return {
    report_type: "portfolio-intelligence",
    network,
    requested_assets: results.length,
    completed_assets: completed.length,
    results,
    inference: { status: "not_configured", provider: null },
    report_hash: digest({ network, results }),
    generated_at: new Date().toISOString(),
  };
}

export async function marketSnapshot(config, input = {}) {
  const network = networkOf(input);
  const asset = String(input.asset || input.mint || input.token || "");
  const [onchain, market] = await Promise.all([
    researchAsset(config, input),
    marketData(config, network, asset),
  ]);
  return { ...onchain, market };
}
