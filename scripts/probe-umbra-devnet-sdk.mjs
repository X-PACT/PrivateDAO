#!/usr/bin/env node
import { mkdir, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(__dirname, "..");
const webRequire = createRequire(new URL("../apps/web/package.json", import.meta.url));
const umbra = webRequire("@umbra-privacy/sdk");
const umbraSdkPath = webRequire.resolve("@umbra-privacy/sdk");

const UMBRA_DOCS_INDEX = "https://sdk.umbraprivacy.com/llms.txt";
const UMBRA_DEVNET_RELAYER = "https://relayer.api-devnet.umbraprivacy.com";
const PRIVATE_DAO_INTENT_ENDPOINT = "https://api.privatedao.org/api/v1/private-settlement/intent";
const SAFE_TEST_RECIPIENT = "B3STL1akxLGLvPpKd6Grz19jjVySkWrGgHFwGNK8yEZ";

const capabilityMatrix = [
  {
    group: "Client setup",
    status: "used for readiness",
    reason: "getUmbraClient is checked as the browser/client entrypoint; live wallet prompts are intentionally not triggered by this probe.",
  },
  {
    group: "Registration",
    status: "available",
    reason: "getUserRegistrationFunction and getUserAccountQuerierFunction are checked so the UI can require account setup before private flows.",
  },
  {
    group: "Encrypted balances",
    status: "available",
    reason: "Direct deposit and withdraw factories are checked for wallet-signed private-balance flows.",
  },
  {
    group: "UTXO mixer",
    status: "available",
    reason: "Receiver-claimable UTXO creation and claimable UTXO scanning exports are checked; real claims require ZK proof data and UTXO slot data.",
  },
  {
    group: "Relayer",
    status: "used",
    reason: "The devnet relayer health, address, supported mints, and claim lifecycle are fetched live.",
  },
  {
    group: "Compliance",
    status: "available",
    reason: "Compliance grant and viewing-key exports are checked without deriving or printing private key material.",
  },
];

function jsonReplacer(_key, value) {
  if (typeof value === "bigint") return value.toString();
  if (value instanceof Uint8Array) return `[Uint8Array:${value.length}]`;
  return value;
}

async function fetchText(url, init) {
  const startedAt = Date.now();
  const response = await fetch(url, init);
  const text = await response.text();
  return {
    ok: response.ok,
    status: response.status,
    url,
    elapsedMs: Date.now() - startedAt,
    bodyPreview: text.slice(0, 300),
    text,
  };
}

async function fetchJson(url, init) {
  const result = await fetchText(url, init);
  let json = null;
  try {
    json = JSON.parse(result.text);
  } catch {
    // The markdown report keeps bodyPreview for non-JSON responses.
  }
  return { ...result, json, text: undefined };
}

function hasExport(name) {
  return typeof umbra[name] !== "undefined";
}

async function main() {
  const generatedAt = new Date().toISOString();
  const docsIndex = await fetchText(UMBRA_DOCS_INDEX);
  const health = await fetchJson(`${UMBRA_DEVNET_RELAYER}/v1/health`);

  let relayerInfo = null;
  let relayerError = null;
  try {
    const relayer = umbra.getUmbraRelayer({ apiEndpoint: UMBRA_DEVNET_RELAYER });
    const [address, supportedMints] = await Promise.all([
      relayer.getRelayerAddress(),
      relayer.getSupportedMints(),
    ]);
    relayerInfo = {
      endpoint: UMBRA_DEVNET_RELAYER,
      address: String(address),
      supportedMints: supportedMints.mints.map(String),
      supportedMintCount: Number(supportedMints.count),
    };
  } catch (error) {
    relayerError = error instanceof Error ? error.message : String(error);
  }

  const intentReceipt = await fetchJson(PRIVATE_DAO_INTENT_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      rail: "umbra",
      operationType: "payment-link-claim",
      recipient: SAFE_TEST_RECIPIENT,
      asset: "USDC",
      amount: "1",
      memo: "umbra-sdk-devnet-live-probe",
      auditMode: "confidential-payout",
      recipientVisibility: "recipient-private",
      createdAt: generatedAt,
    }),
  });

  const exportsChecked = [
    "getUmbraClient",
    "getUmbraRelayer",
    "getUserRegistrationFunction",
    "getUserAccountQuerierFunction",
    "getPublicBalanceToEncryptedBalanceDirectDepositorFunction",
    "getEncryptedBalanceToPublicBalanceDirectWithdrawerFunction",
    "getPublicBalanceToReceiverClaimableUtxoCreatorFunction",
    "getClaimableUtxoScannerFunction",
    "getComplianceGrantIssuerFunction",
    "getComplianceGrantRevokerFunction",
    "getUserComplianceGrantQuerierFunction",
    "getMasterViewingKeyDeriver",
    "getMonthlyViewingKeyDeriver",
    "getUmbraRelayer",
    "pollClaimUntilTerminal",
  ].map((name) => ({ name, present: hasExport(name) }));

  const report = {
    generatedAt,
    package: {
      name: "@umbra-privacy/sdk",
      version: webRequire("@umbra-privacy/sdk/package.json").version,
      resolvedFrom: umbraSdkPath.replace(repoRoot, "."),
    },
    network: {
      solana: "devnet",
      relayerUrl: UMBRA_DEVNET_RELAYER,
      indexerEndpoint: "https://utxo-indexer.api-devnet.umbraprivacy.com",
    },
    capabilityMatrix,
    docsIndex: {
      ok: docsIndex.ok,
      status: docsIndex.status,
      url: docsIndex.url,
      containsRelayer: docsIndex.text.includes("Relayer"),
      containsCompliance: docsIndex.text.includes("Compliance"),
    },
    exportsChecked,
    live: {
      relayerHealth: {
        ok: health.ok,
        status: health.status,
        url: health.url,
        payload: health.json,
      },
      relayerInfo,
      relayerError,
      privateDaoIntentReceipt: {
        ok: intentReceipt.ok,
        status: intentReceipt.status,
        url: intentReceipt.url,
        mode: intentReceipt.json?.mode ?? null,
        source: intentReceipt.json?.source ?? null,
        executionReference:
          intentReceipt.json?.executionReference ??
          intentReceipt.json?.receipt?.executionReference ??
          intentReceipt.json?.signature ??
          null,
        receiptHash: intentReceipt.json?.receipt?.receiptHash ?? null,
        claimLifecycle: intentReceipt.json?.receipt?.claimLifecycle ?? [],
        note: intentReceipt.json?.note ?? intentReceipt.json?.receipt?.note ?? null,
      },
    },
    safety: {
      secretsPrinted: false,
      omittedFields: ["private keys", "master seed", "viewing keys", "UTXO secrets", "raw proof account data", "bearer tokens"],
      boundary:
        "This probe verifies SDK exports, relayer readiness, and PrivateDAO intent receipts. Full claim submission remains client-side because it requires wallet signatures, SDK-generated ZK proof account data, and UTXO slot data.",
    },
  };

  await mkdir(resolve(repoRoot, "docs/generated"), { recursive: true });
  await writeFile(
    resolve(repoRoot, "docs/generated/umbra-devnet-sdk-probe.generated.json"),
    `${JSON.stringify(report, jsonReplacer, 2)}\n`,
  );

  const rows = capabilityMatrix
    .map((row) => `| ${row.group} | ${row.status} | ${row.reason.replace(/\|/g, "\\|")} |`)
    .join("\n");
  const exportsRows = exportsChecked.map((entry) => `| \`${entry.name}\` | ${entry.present ? "yes" : "no"} |`).join("\n");
  const executionReference = report.live.privateDaoIntentReceipt.executionReference || "unknown";
  await writeFile(
    resolve(repoRoot, "docs/umbra-devnet-sdk-live-probe.generated.md"),
    `# Umbra Devnet SDK Live Probe\n\nGenerated: \`${generatedAt}\`\n\nThis packet verifies the PrivateDAO Umbra lane against the installed \`@umbra-privacy/sdk\`, the public devnet relayer, and the live PrivateDAO read-node intent endpoint without printing secret material.\n\n## Network\n\n- Package: \`@umbra-privacy/sdk\` (\`${report.package.version}\`)\n- Devnet relayer: \`${UMBRA_DEVNET_RELAYER}\`\n- Devnet indexer: \`https://utxo-indexer.api-devnet.umbraprivacy.com\`\n\n## Capability Matrix\n\n| Group | Status | Reason |\n| --- | --- | --- |\n${rows}\n\n## Export Check\n\n| Export | Present |\n| --- | --- |\n${exportsRows}\n\n## Live Results\n\n- Umbra docs index: ${docsIndex.ok ? "ok" : `failed (${docsIndex.status})`}\n- Devnet relayer health: ${health.ok ? "ok" : `failed (${health.status})`}\n- Relayer address: \`${relayerInfo?.address ?? "unavailable"}\`\n- Supported mint count: \`${relayerInfo?.supportedMintCount ?? 0}\`\n- PrivateDAO read-node intent receipt: ${intentReceipt.ok ? "ok" : `failed (${intentReceipt.status})`}\n- Intent execution reference: \`${executionReference}\`\n- Intent receipt hash: \`${report.live.privateDaoIntentReceipt.receiptHash ?? "unknown"}\`\n- Intent mode: \`${report.live.privateDaoIntentReceipt.mode ?? "unknown"}\`\n- Claim lifecycle path: \`${(report.live.privateDaoIntentReceipt.claimLifecycle || []).join(" -> ") || "not returned"}\`\n\n## Safety Boundary\n\nNo private keys, master seed, viewing keys, UTXO secrets, raw proof account data, or bearer tokens are printed. Full claim execution is still a wallet-side SDK action because the relayer requires proof account data and UTXO slot data generated from the user's private context.\n`,
  );

  console.log(JSON.stringify(report, jsonReplacer, 2));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.stack ?? error.message : String(error));
  process.exit(1);
});
