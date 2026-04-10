type TreasuryAsset = {
  symbol: "SOL" | "USDC" | "USDG";
  name: string;
  network: string;
  receiveAddress: string;
  mint?: string;
  decimals?: number;
  note: string;
};

const DEFAULT_DEVNET_TREASURY = "AZUroiNeGAjNdD84eEHnAKHHFwqAFmkjr2g1eoF7Ek5c";

function envValue(value?: string) {
  return value?.trim() ? value.trim() : undefined;
}

function resolveReceiveAddress(symbol: TreasuryAsset["symbol"]) {
  if (symbol === "SOL") {
    return (
      envValue(process.env.NEXT_PUBLIC_TREASURY_SOL_RECEIVE_ADDRESS) ??
      envValue(process.env.NEXT_PUBLIC_TREASURY_RECEIVE_ADDRESS) ??
      DEFAULT_DEVNET_TREASURY
    );
  }

  if (symbol === "USDC") {
    return (
      envValue(process.env.NEXT_PUBLIC_TREASURY_USDC_RECEIVE_ADDRESS) ??
      envValue(process.env.NEXT_PUBLIC_TREASURY_RECEIVE_ADDRESS) ??
      DEFAULT_DEVNET_TREASURY
    );
  }

  return (
    envValue(process.env.NEXT_PUBLIC_TREASURY_USDG_RECEIVE_ADDRESS) ??
    envValue(process.env.NEXT_PUBLIC_TREASURY_RECEIVE_ADDRESS) ??
    DEFAULT_DEVNET_TREASURY
  );
}

export function getTreasuryReceiveConfig() {
  const network = envValue(process.env.NEXT_PUBLIC_TREASURY_NETWORK) ?? "Solana Devnet";

  const assets: TreasuryAsset[] = [
    {
      symbol: "SOL",
      name: "Native SOL",
      network,
      receiveAddress: resolveReceiveAddress("SOL"),
      decimals: 9,
      note: "Use this rail for treasury top-ups, operator funding, and governed SOL transfers on Devnet.",
    },
    {
      symbol: "USDC",
      name: "USDC",
      network,
      receiveAddress: resolveReceiveAddress("USDC"),
      mint: envValue(process.env.NEXT_PUBLIC_TREASURY_USDC_MINT),
      decimals: 6,
      note: "Use this rail for governed payouts, vendor settlement, and stable-value treasury requests when USDC is the active stable asset.",
    },
    {
      symbol: "USDG",
      name: "USDG",
      network,
      receiveAddress: resolveReceiveAddress("USDG"),
      mint: envValue(process.env.NEXT_PUBLIC_TREASURY_USDG_MINT),
      decimals: 6,
      note: "Use this rail for alternative stable settlement when the team or customer operates with USDG-compatible treasury flows.",
    },
  ];

  return {
    network,
    treasuryAddress: envValue(process.env.NEXT_PUBLIC_TREASURY_RECEIVE_ADDRESS) ?? DEFAULT_DEVNET_TREASURY,
    assets,
    securityNote:
      "Only public receive addresses belong in the frontend. Keep signer keypairs, treasury seed material, and operator secrets outside the app and out of source control.",
  };
}
