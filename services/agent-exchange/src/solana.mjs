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

export async function treasuryTokenAccount(config) {
  try {
    const { result } = await readRpc(config, "getTokenAccountsByOwner", [
      config.treasury,
      { mint: config.usdcMint },
      { encoding: "jsonParsed" },
    ]);
    return (
      result?.value?.[0]?.pubkey || (await derivedTreasuryTokenAccount(config))
    );
  } catch {
    return derivedTreasuryTokenAccount(config);
  }
}

export async function derivedTreasuryTokenAccount(config) {
  if (
    config.treasury === "2BJ4ezxqV9YJXc38D9duKBkdn4su4jE1beKUHwH663sL" &&
    config.usdcMint === "EPjFWdd5AufSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"
  )
    return "5RyKShQxSkbUJ9vA2MZ1Qf2TKgnwhhS3m7mj2ZZaVh6t";
  const { PublicKey } = await import("@solana/web3.js");
  const owner = new PublicKey(config.treasury);
  const mint = new PublicKey(config.usdcMint);
  const tokenProgram = new PublicKey(
    "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
  );
  const associatedProgram = new PublicKey(
    "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL",
  );
  return PublicKey.findProgramAddressSync(
    [owner.toBuffer(), tokenProgram.toBuffer(), mint.toBuffer()],
    associatedProgram,
  )[0].toBase58();
}

export async function readRpc(config, method, params = []) {
  assertMainnetConfig(config);
  let last;
  for (const url of rpcUrls(config)) {
    try {
      await attestMainnetRpc(url, config);
      return { url, result: await rpcCall(url, method, params) };
    } catch (error) {
      last = error;
    }
  }
  throw last || new Error("no Solana RPC configured");
}

export async function verifyPayment(config, payment, quote) {
  if (!payment?.signature || !quote)
    return { ok: false, reason: "signature and quote are required" };
  const { result: tx } = await readRpc(config, "getTransaction", [
    payment.signature,
    {
      commitment: "finalized",
      maxSupportedTransactionVersion: 0,
      encoding: "jsonParsed",
    },
  ]);
  if (!tx)
    return {
      ok: false,
      reason: "transaction is not finalized or was not found",
    };
  const instructions = tx.transaction?.message?.instructions || [];
  const expected = Number(quote.amountAtomic);
  let tokenAccounts = [];
  if (quote.currency === "USDC") {
    const accounts = await readRpc(config, "getTokenAccountsByOwner", [
      quote.recipient,
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
  const { url, result } = await readRpc(config, "getEpochInfo");
  return {
    providerClass: url.includes("api.mainnet-beta.solana.com")
      ? "public-fallback"
      : "quicknode",
    cluster: "mainnet-beta",
    epoch: result.epoch,
    slotIndex: result.slotIndex,
    absoluteSlot: result.absoluteSlot,
  };
}

export async function mintEvidence(config, mint) {
  if (!/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(mint || ""))
    throw new Error("valid Solana mint is required");
  const [account, supply, largest] = await Promise.all([
    readRpc(config, "getAccountInfo", [mint, { encoding: "jsonParsed" }]),
    readRpc(config, "getTokenSupply", [mint]),
    readRpc(config, "getTokenLargestAccounts", [mint]),
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
    provider_source: account.url,
    observed_at: new Date().toISOString(),
    evidence_confidence: account.result?.value ? "rpc-confirmed" : "not-found",
  };
}
