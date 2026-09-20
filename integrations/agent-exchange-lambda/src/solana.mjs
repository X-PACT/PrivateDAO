const rpcCall = async (url, method, params = []) => {
  const response = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }),
    signal: AbortSignal.timeout(10000),
  });
  if (!response.ok) throw new Error(`Solana RPC HTTP ${response.status}`);
  const body = await response.json();
  if (body.error)
    throw new Error(`Solana RPC ${body.error.code}: ${body.error.message}`);
  return body.result;
};

const mainnetAttestation = new Map();
const forbiddenNetwork = /(devnet|testnet|localhost|127\.0\.0\.1)/i;
const solanaSignaturePattern = /^[1-9A-HJ-NP-Za-km-z]{64,128}$/;
const memoProgramId = "MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr";

function paymentReferenceMatches(instructions, expectedReference) {
  if (!expectedReference) return true;
  return instructions.some((instruction) => {
    if (instruction.program === "spl-memo")
      return String(instruction.parsed || instruction.data || "") === expectedReference;
    if (instruction.programId === memoProgramId)
      return String(instruction.data || "") === expectedReference;
    return false;
  });
}

export function assertMainnetConfig(config) {
  if (config.cluster !== "mainnet-beta")
    throw new Error("Agent Exchange requires Solana mainnet-beta");
  if (config.treasury !== "2BJ4ezxqV9YJXc38D9duKBkdn4su4jE1beKUHwH663sL")
    throw new Error("production treasury mismatch");
  if (config.usdcMint !== "EPjFWdd5AufSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v")
    throw new Error("production USDC mint mismatch");
  for (const url of [
    config.rpcPrimary,
    config.rpcSecondary,
    config.rpcFallback,
  ].filter(Boolean)) {
    if (!/^https:\/\//i.test(url) || forbiddenNetwork.test(url))
      throw new Error("non-mainnet Solana RPC rejected");
  }
}

async function attestMainnetRpc(url, config) {
  if (process.env.NODE_ENV === "test") return;
  if (mainnetAttestation.get(url) === config.mainnetGenesisHash) return;
  const genesis = await rpcCall(url, "getGenesisHash");
  if (genesis !== config.mainnetGenesisHash)
    throw new Error("Solana RPC is not mainnet-beta");
  mainnetAttestation.set(url, genesis);
}

export function rpcUrls(config) {
  return [config.rpcPrimary, config.rpcSecondary, config.rpcFallback]
    .filter(Boolean)
    .filter((url, i, all) => all.indexOf(url) === i);
}

function providerClassForUrl(url) {
  return url.includes(".g.alchemy.com/")
    ? "alchemy"
    : url.includes("api.mainnet-beta.solana.com")
      ? "public-fallback"
      : "configured-rpc";
}

export async function treasuryTokenAccount(config) {
  return derivedTreasuryTokenAccount(config);
}

export async function derivedTreasuryTokenAccount(config) {
  if (
    config.treasury === "2BJ4ezxqV9YJXc38D9duKBkdn4su4jE1beKUHwH663sL" &&
    config.usdcMint === "EPjFWdd5AufSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"
  )
    return "L2iAzRuZZrubxcfkQXqBGpPHWej9vLMbm24cDT2jqbv";
  throw new Error("unsupported production treasury or USDC mint");
}

export async function readRpc(config, method, params = []) {
  assertMainnetConfig(config);
  let last;
  for (const url of rpcUrls(config)) {
    try {
      await attestMainnetRpc(url, config);
      return { providerClass: providerClassForUrl(url), result: await rpcCall(url, method, params) };
    } catch (error) {
      last = error;
    }
  }
  throw last || new Error("no Solana RPC configured");
}

export async function verifyPayment(config, payment, quote) {
  if (!payment?.signature || !quote)
    return { ok: false, reason: "signature and quote are required" };
  if (typeof payment.signature !== "string" || !solanaSignaturePattern.test(payment.signature))
    return { ok: false, reason: "invalid Solana transaction signature" };
  let tx;
  try {
    ({ result: tx } = await readRpc(config, "getTransaction", [
      payment.signature,
      {
        commitment: "finalized",
        maxSupportedTransactionVersion: 0,
        encoding: "jsonParsed",
      },
    ]));
  } catch (error) {
    return {
      ok: false,
      transient: true,
      reason: "payment is submitted; finality verification is temporarily retrying",
      providerError: error?.message || "rpc unavailable",
    };
  }
  if (!tx)
    return {
      ok: false,
      transient: true,
      reason: "transaction is not finalized or was not found",
    };
  const instructions = tx.transaction?.message?.instructions || [];
  if (!paymentReferenceMatches(instructions, quote.paymentReference))
    return { ok: false, reason: "payment reference does not match quote" };
  const expected = Number(quote.amountAtomic);
  let tokenAccounts = [];
  if (quote.currency === "USDC") {
    const treasuryOwner = quote.treasuryOwner || quote.recipient;
    if (!treasuryOwner)
      return { ok: false, reason: "quote treasury owner is missing" };
    if (!quote.treasuryTokenAccount)
      return { ok: false, reason: "quote treasury token account is missing" };
    const accounts = await readRpc(config, "getTokenAccountsByOwner", [
      treasuryOwner,
      { mint: quote.mint },
      { encoding: "jsonParsed" },
    ]);
    tokenAccounts = (accounts.result?.value || []).map(
      (account) => account.pubkey,
    );
  }
  const match = instructions.some((instruction) => {
    const info = instruction.parsed?.info;
    if (!info) return false;
    if (quote.currency === "SOL")
      return (
        instruction.program === "system" &&
        info.destination === quote.recipient &&
        Number(info.lamports) === expected
      );
    return (
      instruction.program === "spl-token" &&
      ["transfer", "transferChecked"].includes(instruction.parsed?.type) &&
      info.destination === quote.treasuryTokenAccount &&
      tokenAccounts.includes(info.destination) &&
      Number(info.amount ?? info.tokenAmount?.amount) === expected &&
      (!quote.mint || info.mint === quote.mint)
    );
  });
  return {
    ok: match && tx.meta?.err == null,
    slot: tx.slot,
    blockTime: tx.blockTime,
    cluster: "mainnet-beta",
    reason: match
      ? tx.meta?.err
        ? "transaction failed"
        : "confirmed"
      : "payment instruction does not match quote",
  };
}

export async function networkStats(config) {
  const { providerClass, result } = await readRpc(config, "getEpochInfo");
  return {
    providerClass,
    cluster: "mainnet-beta",
    epoch: result.epoch,
    slotIndex: result.slotIndex,
    absoluteSlot: result.absoluteSlot,
  };
}

export async function solanaHealth(config) {
  const started = Date.now();
  const [health, version, slot, blockhash] = await Promise.all([
    readRpc(config, "getHealth"),
    readRpc(config, "getVersion"),
    readRpc(config, "getSlot", [{ commitment: "finalized" }]),
    readRpc(config, "getLatestBlockhash", [{ commitment: "finalized" }]),
  ]);
  return {
    network: "solana-mainnet-beta",
    cluster: "mainnet-beta",
    health: health.result,
    solana_version: version.result || null,
    slot: slot.result || null,
    latest_blockhash_available: Boolean(blockhash.result?.value?.blockhash),
    latency_ms: Date.now() - started,
    provider: health.providerClass,
    status: "rpc_healthy",
    observed_at: new Date().toISOString(),
  };
}

export async function mintEvidence(config, mint) {
  if (!/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(mint || ""))
    throw new Error("valid Solana mint is required");
  const account = await readRpc(config, "getAccountInfo", [mint, { encoding: "jsonParsed" }]);
  const optionalRead = async (method, params) => {
    try {
      return { ...(await readRpc(config, method, params)), available: true, error: null };
    } catch (error) {
      return { result: null, url: null, available: false, error: error.message };
    }
  };
  const [supply, largest] = await Promise.all([
    optionalRead("getTokenSupply", [mint]),
    optionalRead("getTokenLargestAccounts", [mint]),
  ]);
  return {
    mint,
    chain: "solana",
    cluster: "mainnet-beta",
    valid: Boolean(account.result?.value),
    token_program: account.result?.value?.owner || null,
    decimals: supply.result?.value?.decimals ?? null,
    supply: supply.result?.value?.amount || null,
    mint_authority:
      account.result?.value?.data?.parsed?.info?.mintAuthority || null,
    freeze_authority:
      account.result?.value?.data?.parsed?.info?.freezeAuthority || null,
    largest_accounts: largest.result?.value || [],
    provider_source: account.providerClass,
    evidence_gaps: {
      token_supply: supply.available ? null : supply.error,
      largest_accounts: largest.available ? null : largest.error,
    },
    observed_at: new Date().toISOString(),
    evidence_confidence: account.result?.value ? "rpc-confirmed" : "not-found",
  };
}

export async function swapQuote(config, input = {}) {
  assertMainnetConfig(config);
  const inputMint = input.inputMint || input.input_mint;
  const outputMint = input.outputMint || input.output_mint;
  const amount = String(input.amount || "");
  if (!/^[1-9][0-9]*$/.test(amount)) throw new Error("positive base-unit amount is required");
  if (![inputMint, outputMint].every((value) => /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(value || "")))
    throw new Error("valid Solana inputMint and outputMint are required");
  const url = new URL(config.jupiterQuoteUrl);
  url.searchParams.set("inputMint", inputMint);
  url.searchParams.set("outputMint", outputMint);
  url.searchParams.set("amount", amount);
  url.searchParams.set("slippageBps", String(Math.min(5000, Math.max(1, Number(input.slippageBps || 50)))));
  const response = await fetch(url, {
    headers: config.jupiterApiKey ? { "x-api-key": config.jupiterApiKey } : {},
    signal: AbortSignal.timeout(10000),
  });
  if (!response.ok) throw new Error(`Jupiter quote HTTP ${response.status}`);
  const quote = await response.json();
  if (quote.error) throw new Error(String(quote.error));
  return {
    network: "solana-mainnet-beta",
    provider: "Jupiter quote API",
    quote_only: true,
    execution: "disabled",
    input_mint: inputMint,
    output_mint: outputMint,
    input_amount: amount,
    expected_output_amount: quote.outAmount || null,
    slippage_bps: quote.slippageBps ?? null,
    route_plan: Array.isArray(quote.routePlan) ? quote.routePlan.map((route) => ({ swap: route.swap, percent: route.percent })) : [],
    context_slot: quote.contextSlot || null,
    time_taken_ms: quote.timeTaken ? Math.round(Number(quote.timeTaken) * 1000) : null,
    observed_at: new Date().toISOString(),
  };
}

export async function simulateSolanaTransaction(config, input = {}) {
  const serialized = String(input.transaction || input.serializedTransaction || "");
  if (!serialized || serialized.length > 1024 * 1024 || !/^[A-Za-z0-9+/]+={0,2}$/.test(serialized))
    throw new Error("base64 serialized Solana transaction is required");
  const { result, providerClass } = await readRpc(config, "simulateTransaction", [
    serialized,
    {
      encoding: "base64",
      sigVerify: false,
      replaceRecentBlockhash: true,
      commitment: "confirmed",
    },
  ]);
  return {
    network: "solana-mainnet-beta",
    simulated: true,
    would_broadcast: false,
    err: result?.value?.err || null,
    logs: Array.isArray(result?.value?.logs) ? result.value.logs : [],
    units_consumed: result?.value?.unitsConsumed ?? null,
    return_data: result?.value?.returnData || null,
    provider_class: providerClass,
    evidence_confidence: "rpc-confirmed",
    observed_at: new Date().toISOString(),
  };
}
