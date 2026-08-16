const bool = (value, fallback = false) =>
  value == null ? fallback : value === "true" || value === "1";

export function getConfig(env = process.env) {
  return {
    region: env.AWS_REGION || "eu-north-1",
    domain: env.AGENT_DOMAIN || "agents.privatedao.org",
    treasury:
      env.SOLANA_TREASURY || "2BJ4ezxqV9YJXc38D9duKBkdn4su4jE1beKUHwH663sL",
    usdcMint:
      env.SOLANA_USDC_MINT || "EPjFWdd5AufSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
    pdaoMint: env.PDAO_MINT || "9isGuumtaqvJeJeyLF44fvfskk2cv5mYsopexMBfpump",
    cluster: "mainnet-beta",
    mainnetGenesisHash: "5eykt4UsFv8P8NJdTREpY1vzqKqZKvdpKuc147dw2N9d",
    rpcPrimary:
      env.AGENT_GATEWAY_SOLANA_RPC_PRIMARY ||
      "https://api.mainnet-beta.solana.com",
    rpcWsPrimary: env.AGENT_GATEWAY_SOLANA_WS_PRIMARY || "",
    rpcSecretId:
      env.AGENT_EXCHANGE_SOLANA_RPC_SECRET_ID ||
      "pdao/agent-exchange/solana-rpc",
    adminSecretId:
      env.AGENT_EXCHANGE_ADMIN_SECRET_ID || "pdao/agent-exchange/admin-smoke",
    adminSmokeToken: "",
    rpcSecondary: env.AGENT_GATEWAY_SOLANA_RPC_SECONDARY || "",
    rpcFallback:
      env.AGENT_GATEWAY_SOLANA_RPC_FALLBACK ||
      "https://api.mainnet-beta.solana.com",
    bedrockEnabled: bool(env.BEDROCK_ENABLED),
    bedrockModel: env.BEDROCK_MODEL_ID || "amazon.nova-micro-v1:0",
    telegramNotifications: bool(env.PDAO_TELEGRAM_NOTIFICATIONS_ENABLED),
    discordNotifications: bool(env.PDAO_DISCORD_NOTIFICATIONS_ENABLED),
    tablePrefix: env.AGENT_EXCHANGE_TABLE_PREFIX || "PrivateDAOAgentExchange",
    tables: {
      Quotes: env.AGENT_EXCHANGE_QUOTES_TABLE || "",
      Payments: env.AGENT_EXCHANGE_PAYMENTS_TABLE || "",
      Receipts: env.AGENT_EXCHANGE_RECEIPTS_TABLE || "",
      Registry: env.AGENT_EXCHANGE_REGISTRY_TABLE || "",
      Jobs: env.AGENT_EXCHANGE_JOBS_TABLE || "",
      Campaigns: env.AGENT_EXCHANGE_CAMPAIGNS_TABLE || "",
      Listings: env.AGENT_EXCHANGE_LISTINGS_TABLE || "",
      Agreements: env.AGENT_EXCHANGE_AGREEMENTS_TABLE || "",
      Logistics: env.AGENT_EXCHANGE_LOGISTICS_TABLE || "",
      Revenue: env.AGENT_EXCHANGE_REVENUE_TABLE || "",
    },
    allowTestStorage: bool(env.AGENT_EXCHANGE_ALLOW_TEST_STORAGE),
    maxBodyBytes: Number(env.AGENT_EXCHANGE_MAX_BODY_BYTES || 262144),
    priceMultiplier: Number(env.AGENT_EXCHANGE_PRICE_MULTIPLIER || 1),
    marketplaceFeeBps: Math.min(10000, Math.max(0, Number(env.AGENT_EXCHANGE_MARKETPLACE_FEE_BPS || 500))),
  };
}

export async function hydrateConfig(config, env = process.env) {
  if (!env.AGENT_EXCHANGE_SOLANA_RPC_SECRET_ID) return config;
  const [{ SecretsManagerClient, GetSecretValueCommand }] = await Promise.all([
    import("@aws-sdk/client-secrets-manager"),
  ]);
  const client = new SecretsManagerClient({ region: config.region });
  const result = await client.send(
    new GetSecretValueCommand({
      SecretId: env.AGENT_EXCHANGE_SOLANA_RPC_SECRET_ID,
    }),
  );
  const values = Object.fromEntries(
    (result.SecretString || "")
      .split(/\r?\n/)
      .filter((line) => line && !line.trim().startsWith("#"))
      .map((line) => {
        const i = line.indexOf("=");
        return i > 0
          ? [line.slice(0, i).trim(), line.slice(i + 1).trim()]
          : null;
      })
      .filter(Boolean),
  );
  if (values.AGENT_GATEWAY_SOLANA_RPC_PRIMARY)
    config.rpcPrimary = values.AGENT_GATEWAY_SOLANA_RPC_PRIMARY;
  if (values.AGENT_GATEWAY_SOLANA_WS_PRIMARY)
    config.rpcWsPrimary = values.AGENT_GATEWAY_SOLANA_WS_PRIMARY;
  if (env.AGENT_EXCHANGE_ADMIN_SECRET_ID) {
    const admin = await client.send(
      new GetSecretValueCommand({
        SecretId: env.AGENT_EXCHANGE_ADMIN_SECRET_ID,
      }),
    );
    config.adminSmokeToken = admin.SecretString || "";
  }
  return config;
}
