const bool = (value, fallback = false) => value == null ? fallback : value === "true" || value === "1";

export function getConfig(env = process.env) {
  return {
    region: env.AWS_REGION || "eu-north-1",
    domain: env.AGENT_DOMAIN || "agents.privatedao.org",
    treasury: env.SOLANA_TREASURY || "2BJ4ezxqV9YJXc38D9duKBkdn4su4jE1beKUHwH663sL",
    usdcMint: env.SOLANA_USDC_MINT || "EPjFWdd5AufSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
    pdaoMint: env.PDAO_MINT || "9isGuumtaqvJeJeyLF44fvfskk2cv5mYsopexMBfpump",
    rpcPrimary: env.AGENT_GATEWAY_SOLANA_RPC_PRIMARY || "https://api.mainnet-beta.solana.com",
    rpcSecondary: env.AGENT_GATEWAY_SOLANA_RPC_SECONDARY || "",
    rpcFallback: env.AGENT_GATEWAY_SOLANA_RPC_FALLBACK || "https://api.mainnet-beta.solana.com",
    bedrockEnabled: bool(env.BEDROCK_ENABLED),
    bedrockModel: env.BEDROCK_MODEL_ID || "amazon.nova-micro-v1:0",
    tablePrefix: env.AGENT_EXCHANGE_TABLE_PREFIX || "PrivateDAOAgentExchange",
    tables: {
      Quotes: env.AGENT_EXCHANGE_QUOTES_TABLE || "",
      Payments: env.AGENT_EXCHANGE_PAYMENTS_TABLE || "",
      Receipts: env.AGENT_EXCHANGE_RECEIPTS_TABLE || "",
      Registry: env.AGENT_EXCHANGE_REGISTRY_TABLE || ""
    },
    allowTestStorage: bool(env.AGENT_EXCHANGE_ALLOW_TEST_STORAGE),
    maxBodyBytes: Number(env.AGENT_EXCHANGE_MAX_BODY_BYTES || 262144),
    priceMultiplier: Number(env.AGENT_EXCHANGE_PRICE_MULTIPLIER || 1)
  };
}
