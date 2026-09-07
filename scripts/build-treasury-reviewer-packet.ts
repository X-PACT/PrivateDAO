import fs from "fs";
import path from "path";

type CanonicalCustodyProof = {
  status: string;
  productionMainnetClaimAllowed: boolean;
  network: string;
  summary: string;
  multisig: {
    address: string | null;
    threshold: string;
  };
  pendingItems: string[];
  blocker: {
    id: string;
    severity: string;
    status: string;
    nextAction: string;
    evidence: string[];
  };
};

type EcosystemFocusAlignment = {
  focusAreas: Array<{
    slug: string;
    title: string;
    fit: "strong" | "moderate" | "selective";
    whatWorksNow: string;
    whyItMatters: string;
    exactGap: string;
    bestRoutes: string[];
  }>;
};

type LaunchTrustPacket = {
  decision: string;
  requiredExternalInputs: string[];
  linkedDocs: string[];
  commands: string[];
};

type TreasuryAsset = {
  symbol: "SOL" | "USDC" | "USDG";
  name: string;
  network: string;
  receiveAddress: string;
  mint?: string;
  decimals?: number;
  note: string;
};

const DEFAULT_TESTNET_TREASURY = "AZUroiNeGAjNdD84eEHnAKHHFwqAFmkjr2g1eoF7Ek5c";

function readJson<T>(relativePath: string): T {
  return JSON.parse(fs.readFileSync(path.resolve(relativePath), "utf8")) as T;
}

function envValue(value?: string) {
  return value?.trim() ? value.trim() : undefined;
}

function resolveReceiveAddress(symbol: TreasuryAsset["symbol"]) {
  if (symbol === "SOL") {
    return (
      envValue(process.env.NEXT_PUBLIC_TREASURY_SOL_RECEIVE_ADDRESS) ??
      envValue(process.env.NEXT_PUBLIC_TREASURY_RECEIVE_ADDRESS) ??
      DEFAULT_TESTNET_TREASURY
    );
  }

  if (symbol === "USDC") {
    return (
      envValue(process.env.NEXT_PUBLIC_TREASURY_USDC_RECEIVE_ADDRESS) ??
      envValue(process.env.NEXT_PUBLIC_TREASURY_RECEIVE_ADDRESS) ??
      DEFAULT_TESTNET_TREASURY
    );
  }

  return (
    envValue(process.env.NEXT_PUBLIC_TREASURY_USDG_RECEIVE_ADDRESS) ??
    envValue(process.env.NEXT_PUBLIC_TREASURY_RECEIVE_ADDRESS) ??
    DEFAULT_TESTNET_TREASURY
  );
}

function getTreasuryReceiveConfig() {
  const network = envValue(process.env.NEXT_PUBLIC_TREASURY_NETWORK) ?? "Solana Testnet";

  const assets: TreasuryAsset[] = [
    {
      symbol: "SOL",
      name: "Native SOL",
      network,
      receiveAddress: resolveReceiveAddress("SOL"),
      decimals: 9,
      note: "Use this rail for treasury top-ups, operator funding, and governed SOL transfers on Testnet.",
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
    treasuryAddress:
      envValue(process.env.NEXT_PUBLIC_TREASURY_RECEIVE_ADDRESS) ?? DEFAULT_TESTNET_TREASURY,
    assets,
  };
}

function buildExplorerHref(address: string, network: string) {
  const normalized = network.toLowerCase();
  const cluster = normalized.includes("testnet")
    ? "?cluster=testnet"
    : normalized.includes("devnet")
      ? "?cluster=devnet"
      : "";
  return `https://solscan.io/account/${address}${cluster}`;
}

function main() {
  const custody = readJson<CanonicalCustodyProof>("docs/canonical-custody-proof.generated.json");
  const ecosystem = readJson<EcosystemFocusAlignment>("docs/ecosystem-focus-alignment.generated.json");
  const launchTrust = readJson<LaunchTrustPacket>("docs/launch-trust-packet.generated.json");
  const treasury = getTreasuryReceiveConfig();

  const alignment = ecosystem.focusAreas.filter((item) =>
    ["payments", "dao-tooling", "developer-tooling"].includes(item.slug),
  );

  const packet = {
    project: "PrivateDAO",
    generatedAt: new Date().toISOString(),
    reviewerIntent:
      "Explain the treasury intake and payout posture as a reviewer-grade infrastructure surface, with strict sender discipline, public rails, proof links, commercial fit, and exact blocker visibility.",
    treasuryNetwork: treasury.network,
    treasuryAddress: treasury.treasuryAddress,
    custodyStatus: custody.status,
    productionMainnetClaimAllowed: custody.productionMainnetClaimAllowed,
    exactBlocker: custody.blocker,
    trustDecision: launchTrust.decision,
    strictSenderChecklist: [
      "Confirm whether the request is treasury top-up, pilot funding, vendor payout, or contributor payout before selecting a rail.",
      "Copy the exact public receive address and explorer link for the chosen asset rail instead of reusing a previous address.",
      "Attach a reference string that includes payer, purpose, amount, and settlement context so the packet can be matched later.",
      "Open reviewer truth surfaces before implying production-safe settlement or custody posture to a buyer, sender, or judge.",
      "Treat the current rails as public Testnet treasury intake until authority-transfer evidence closes the production custody blocker.",
    ],
    referenceLinkedRails: treasury.assets.map((asset) => ({
      symbol: asset.symbol,
      name: asset.name,
      receiveAddress: asset.receiveAddress,
      explorerUrl: buildExplorerHref(asset.receiveAddress, treasury.network),
      mint: asset.mint ?? null,
      decimals: asset.decimals ?? null,
      note: asset.note,
    })),
    reviewerTruthLinks: [
      "docs/canonical-custody-proof.generated.md",
      "docs/custody-proof-reviewer-packet.generated.md",
      "docs/launch-trust-packet.generated.md",
      "docs/reviewer-telemetry-packet.generated.md",
      "docs/mainnet-blockers.md",
      "docs/ecosystem-focus-alignment.generated.md",
    ],
    commercialPaymentsAlignment: alignment.map((item) => ({
      slug: item.slug,
      title: item.title,
      fit: item.fit,
      whatWorksNow: item.whatWorksNow,
      exactGap: item.exactGap,
      bestRoutes: item.bestRoutes,
    })),
    exactPendingItems: custody.pendingItems,
    currentTruth: {
      summary: custody.summary,
      threshold: custody.multisig.threshold,
      multisigAddress: custody.multisig.address,
    },
    liveRoutes: [
      "https://privatedao.org/services/",
      "https://privatedao.org/custody/",
      "https://privatedao.org/documents/treasury-reviewer-packet/",
      "https://privatedao.org/documents/canonical-custody-proof/",
    ],
    canonicalCommands: [
      "npm run build:treasury-reviewer-packet",
      "npm run verify:treasury-reviewer-packet",
      "npm run apply:custody-evidence-intake",
    ],
  };

  fs.writeFileSync(
    path.resolve("docs/treasury-reviewer-packet.generated.json"),
    `${JSON.stringify(packet, null, 2)}\n`,
  );
  fs.writeFileSync(
    path.resolve("docs/treasury-reviewer-packet.generated.md"),
    buildMarkdown(packet),
  );

  console.log("Wrote treasury reviewer packet");
}

function buildMarkdown(payload: {
  project: string;
  generatedAt: string;
  reviewerIntent: string;
  treasuryNetwork: string;
  treasuryAddress: string;
  custodyStatus: string;
  productionMainnetClaimAllowed: boolean;
  trustDecision: string;
  exactBlocker: {
    id: string;
    severity: string;
    status: string;
    nextAction: string;
    evidence: string[];
  };
  strictSenderChecklist: string[];
  referenceLinkedRails: Array<{
    symbol: string;
    name: string;
    receiveAddress: string;
    explorerUrl: string;
    mint: string | null;
    decimals: number | null;
    note: string;
  }>;
  reviewerTruthLinks: string[];
  commercialPaymentsAlignment: Array<{
    slug: string;
    title: string;
    fit: string;
    whatWorksNow: string;
    exactGap: string;
    bestRoutes: string[];
  }>;
  exactPendingItems: string[];
  currentTruth: {
    summary: string;
    threshold: string;
    multisigAddress: string | null;
  };
  liveRoutes: string[];
  canonicalCommands: string[];
}) {
  const checklist = payload.strictSenderChecklist.map((item) => `- ${item}`).join("\n");
  const rails = payload.referenceLinkedRails
    .map(
      (rail) =>
        `### ${rail.symbol}\n- name: ${rail.name}\n- receive address: ${rail.receiveAddress}\n- explorer: ${rail.explorerUrl}\n- mint: ${rail.mint ?? "configured publicly at deployment"}\n- decimals: ${rail.decimals ?? "n/a"}\n- note: ${rail.note}`,
    )
    .join("\n\n");
  const truthLinks = payload.reviewerTruthLinks.map((item) => `- ${item}`).join("\n");
  const alignment = payload.commercialPaymentsAlignment
    .map(
      (item) =>
        `## ${item.title}\n- fit: ${item.fit}\n- what works now: ${item.whatWorksNow}\n- exact gap: ${item.exactGap}\n- best routes: ${item.bestRoutes.join(", ")}`,
    )
    .join("\n\n");
  const pending = payload.exactPendingItems.map((item) => `- ${item}`).join("\n");
  const routes = payload.liveRoutes.map((item) => `- ${item}`).join("\n");
  const commands = payload.canonicalCommands.map((item) => `- \`${item}\``).join("\n");
  const blockerEvidence = payload.exactBlocker.evidence.map((item) => `- ${item}`).join("\n");

  return `# Treasury Reviewer Packet

Generated: ${payload.generatedAt}

${payload.reviewerIntent}

## Current Treasury Truth

- treasury network: ${payload.treasuryNetwork}
- treasury address: ${payload.treasuryAddress}
- custody status: ${payload.custodyStatus}
- production mainnet claim allowed: ${payload.productionMainnetClaimAllowed}
- trust decision: ${payload.trustDecision}
- threshold: ${payload.currentTruth.threshold}
- multisig address: ${payload.currentTruth.multisigAddress ?? "pending"}

${payload.currentTruth.summary}

## Strict Sender Checklist

${checklist}

## Reference-Linked Rails

${rails}

## Reviewer Truth Links

${truthLinks}

## Commercial + Payments Focus Alignment

${alignment}

## Exact Mainnet Blocker

- id: ${payload.exactBlocker.id}
- severity: ${payload.exactBlocker.severity}
- status: ${payload.exactBlocker.status}
- next action: ${payload.exactBlocker.nextAction}

### Blocker Evidence

${blockerEvidence}

## Exact Pending Items

${pending}

## Live Routes

${routes}

## Canonical Commands

${commands}
`;
}

main();
