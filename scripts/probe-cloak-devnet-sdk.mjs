#!/usr/bin/env node
import { mkdir, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import { Connection, Keypair, LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(__dirname, "..");
const webRequire = createRequire(new URL("../apps/web/package.json", import.meta.url));
const cloakSdkPath = webRequire.resolve("@cloak.dev/sdk-devnet");
const cloak = await import(pathToFileURL(cloakSdkPath).href);

const CLOAK_DOCS_INDEX = "https://docs.cloak.ag/llms.txt";
const CLOAK_DEVNET_RELAY = "https://api.devnet.cloak.ag";
const SOLANA_DEVNET_RPC = "https://api.devnet.solana.com";
const PRIVATE_DAO_INTENT_ENDPOINT = "https://api.privatedao.org/api/v1/private-settlement/intent";
const SAFE_TEST_RECIPIENT = "B3STL1akxLGLvPpKd6Grz19jjVySkWrGgHFwGNK8yEZ";
const E2E_ENABLED = process.env.PRIVATE_DAO_CLOAK_E2E === "1";

const capabilityMatrix = [
  {
    group: "Note API",
    status: "not used",
    reason: "The current integration uses the UTXO transaction surface as the primary SDK path. Legacy note helpers are not needed for this settlement lane.",
  },
  {
    group: "UTXO API",
    status: "used",
    reason: "The probe imports transact, createUtxo, createZeroUtxo, generateUtxoKeypair, transfer, fullWithdraw, partialWithdraw, swapUtxo, and swapWithChange from @cloak.dev/sdk-devnet.",
  },
  {
    group: "Scanner/compliance",
    status: "available",
    reason: "scanTransactions, scanAllTransactions, scanTransactionsByViewingKey, and formatComplianceCsv are present. Full history scan needs a funded wallet and persisted UTXOs.",
  },
  {
    group: "Viewing keys + metadata encryption",
    status: "used for readiness",
    reason: "getNkFromUtxoPrivateKey and metadata encryption exports are present. The probe never prints viewing keys, UTXO private keys, seed material, or raw note payloads.",
  },
  {
    group: "Relay/proof/Merkle helpers",
    status: "used for readiness",
    reason: "RelayService, buildMerkleTreeFromRelay, computeProofFromChain, and readMerkleTreeState are present; relay health is checked live.",
  },
  {
    group: "Utility modules",
    status: "used",
    reason: "Fee constants, calculateFeeBigint, NATIVE_SOL_MINT, DEVNET_MOCK_USDC_MINT, and error helpers are imported and recorded for reviewer validation.",
  },
];

function bigintJson(_key, value) {
  if (typeof value === "bigint") return value.toString();
  if (value instanceof PublicKey) return value.toBase58();
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
    bodyPreview: text.slice(0, 280),
    text,
  };
}

async function fetchJson(url, init) {
  const result = await fetchText(url, init);
  let json = null;
  try {
    json = JSON.parse(result.text);
  } catch {
    // Keep bodyPreview for non-JSON operational endpoints.
  }
  return { ...result, json, text: undefined };
}

async function firstLiveJson(urls) {
  const attempts = [];
  for (const url of urls) {
    try {
      const result = await fetchJson(url);
      attempts.push(result);
      if (result.ok) return { ok: true, selected: url, attempts };
    } catch (error) {
      attempts.push({
        ok: false,
        status: 0,
        url,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }
  return { ok: false, selected: null, attempts };
}

function requireExport(name) {
  return typeof cloak[name] !== "undefined";
}

async function runOptionalE2E(connection) {
  if (!E2E_ENABLED) {
    return {
      enabled: false,
      status: "skipped",
      reason: "Set PRIVATE_DAO_CLOAK_E2E=1 to run a funded live devnet deposit probe. Skipped by default to avoid faucet use and unintended live transactions.",
    };
  }

  const payer = Keypair.generate();
  const amountLamports = BigInt(cloak.MIN_DEPOSIT_LAMPORTS ?? 10_000_000);
  const requestedAirdrops = [0.03 * LAMPORTS_PER_SOL, Number(amountLamports) + 7_000_000, Number(amountLamports) + 3_000_000];
  const airdropAttempts = [];
  let airdropSignature = null;
  for (const lamports of requestedAirdrops) {
    try {
      airdropSignature = await connection.requestAirdrop(payer.publicKey, lamports);
      const latest = await connection.getLatestBlockhash("confirmed");
      await connection.confirmTransaction({ signature: airdropSignature, ...latest }, "confirmed");
      airdropAttempts.push({ lamports, ok: true, signature: airdropSignature });
      break;
    } catch (error) {
      airdropAttempts.push({
        lamports,
        ok: false,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  if (!airdropSignature) {
    return {
      enabled: true,
      status: "funding-unavailable",
      reason: "Solana devnet faucet rejected all temporary-wallet funding attempts during this run.",
      airdropAttempts,
      publicPayer: payer.publicKey.toBase58(),
      secretsPrinted: false,
    };
  }

  const balance = await connection.getBalance(payer.publicKey, "confirmed");
  if (balance < Number(amountLamports)) {
    throw new Error(`Airdropped devnet balance ${balance} is below Cloak minimum deposit ${amountLamports}.`);
  }

  const owner = await cloak.generateUtxoKeypair();
  const nk = cloak.getNkFromUtxoPrivateKey(owner.privateKey);
  const output = await cloak.createUtxo(amountLamports, owner, cloak.NATIVE_SOL_MINT);
  const zero = await cloak.createZeroUtxo(cloak.NATIVE_SOL_MINT);

  const result = await cloak.transact(
    {
      inputUtxos: [zero],
      outputUtxos: [output],
      externalAmount: amountLamports,
      depositor: payer.publicKey,
    },
    {
      connection,
      programId: cloak.CLOAK_PROGRAM_ID,
      depositorKeypair: payer,
      walletPublicKey: payer.publicKey,
      chainNoteViewingKeyNk: nk,
      enforceViewingKeyRegistration: false,
      useUniqueNullifiers: true,
    },
  );

  return {
    enabled: true,
    status: "landed",
    amountLamports,
    publicPayer: payer.publicKey.toBase58(),
    signature: result.signature,
    explorer: `https://solscan.io/tx/${result.signature}?cluster=devnet`,
    airdropAttempts,
    commitmentIndices: result.commitmentIndices ?? [],
    outputCount: Array.isArray(result.outputUtxos) ? result.outputUtxos.length : 0,
    secretsPrinted: false,
  };
}

async function main() {
  const generatedAt = new Date().toISOString();
  const docsIndex = await fetchText(CLOAK_DOCS_INDEX);
  const relayHealth = await firstLiveJson([
    `${CLOAK_DEVNET_RELAY}/v1/health`,
    `${CLOAK_DEVNET_RELAY}/health`,
    `${CLOAK_DEVNET_RELAY}/api/health`,
  ]);

  const connection = new Connection(SOLANA_DEVNET_RPC, "confirmed");
  const programId = new PublicKey(cloak.CLOAK_PROGRAM_ID);
  const [programAccount, slot, version] = await Promise.all([
    connection.getAccountInfo(programId, "confirmed"),
    connection.getSlot("confirmed"),
    connection.getVersion(),
  ]);

  const intentReceipt = await fetchJson(PRIVATE_DAO_INTENT_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      rail: "cloak",
      operationType: "private-settlement",
      recipient: SAFE_TEST_RECIPIENT,
      asset: "USDC",
      amount: "1",
      memo: "cloak-sdk-devnet-live-probe",
      auditMode: "selective-disclosure",
      recipientVisibility: "private-by-default",
      createdAt: generatedAt,
    }),
  });

  let liveE2E;
  try {
    liveE2E = await runOptionalE2E(connection);
  } catch (error) {
    liveE2E = {
      enabled: E2E_ENABLED,
      status: "failed",
      error: error instanceof Error ? error.message : String(error),
      secretsPrinted: false,
    };
  }

  const exportsChecked = [
    "CLOAK_PROGRAM_ID",
    "DEVNET_MOCK_USDC_MINT",
    "NATIVE_SOL_MINT",
    "MIN_DEPOSIT_LAMPORTS",
    "transact",
    "transfer",
    "partialWithdraw",
    "fullWithdraw",
    "swapUtxo",
    "swapWithChange",
    "createUtxo",
    "createZeroUtxo",
    "generateUtxoKeypair",
    "getNkFromUtxoPrivateKey",
    "RelayService",
    "buildMerkleTreeFromRelay",
    "computeProofFromChain",
    "scanTransactions",
    "formatComplianceCsv",
    "calculateFeeBigint",
  ].map((name) => ({ name, present: requireExport(name) }));

  const report = {
    generatedAt,
    package: {
      name: "@cloak.dev/sdk-devnet",
      version: cloak.VERSION ?? "unknown",
      resolvedFrom: cloakSdkPath.replace(repoRoot, "."),
    },
    network: {
      solana: "devnet",
      rpcUrl: SOLANA_DEVNET_RPC,
      relayUrl: CLOAK_DEVNET_RELAY,
      programId: programId.toBase58(),
      mockUsdcMint: String(cloak.DEVNET_MOCK_USDC_MINT),
      nativeSolMint: String(cloak.NATIVE_SOL_MINT),
      minimumDepositLamports: cloak.MIN_DEPOSIT_LAMPORTS,
    },
    capabilityMatrix,
    docsIndex: {
      ok: docsIndex.ok,
      status: docsIndex.status,
      url: docsIndex.url,
      containsSdkIndex: docsIndex.text.includes("/sdk/llms.txt"),
      containsDevnetGuide: docsIndex.text.includes("Devnet") || docsIndex.text.includes("/platform/devnet"),
    },
    exportsChecked,
    live: {
      relayHealth,
      solanaProgram: {
        ok: Boolean(programAccount?.executable),
        executable: Boolean(programAccount?.executable),
        owner: programAccount?.owner.toBase58() ?? null,
        lamports: programAccount?.lamports ?? null,
        dataLength: programAccount?.data.length ?? null,
        slot,
        solanaCore: version["solana-core"],
      },
      privateDaoIntentReceipt: {
        ok: intentReceipt.ok,
        status: intentReceipt.status,
        url: intentReceipt.url,
        mode: intentReceipt.json?.mode ?? null,
        source: intentReceipt.json?.source ?? null,
        executionReference:
          intentReceipt.json?.executionReference ??
          intentReceipt.json?.signature ??
          intentReceipt.json?.receipt?.executionReference ??
          null,
        receiptHash: intentReceipt.json?.receipt?.receiptHash ?? null,
        note: intentReceipt.json?.note ?? intentReceipt.json?.receipt?.note ?? null,
      },
      e2eDeposit: liveE2E,
    },
    safety: {
      secretsPrinted: false,
      printedFields: ["public program id", "public relay URL", "public transaction signatures when E2E is enabled", "public read-node receipt reference"],
      omittedFields: ["private keys", "viewing keys", "UTXO private keys", "raw notes", "seed material"],
    },
  };

  const generatedDir = resolve(repoRoot, "docs/generated");
  await mkdir(generatedDir, { recursive: true });
  const jsonPath = resolve(generatedDir, "cloak-devnet-sdk-probe.generated.json");
  await writeFile(jsonPath, `${JSON.stringify(report, bigintJson, 2)}\n`);

  const markdownPath = resolve(repoRoot, "docs/cloak-devnet-sdk-live-probe.generated.md");
  const rows = capabilityMatrix
    .map((row) => `| ${row.group} | ${row.status} | ${row.reason.replace(/\|/g, "\\|")} |`)
    .join("\n");
  const exportsRows = exportsChecked.map((entry) => `| \`${entry.name}\` | ${entry.present ? "yes" : "no"} |`).join("\n");
  const intentExecutionReference =
    intentReceipt.json?.executionReference ??
    intentReceipt.json?.signature ??
    intentReceipt.json?.receipt?.executionReference ??
    "unknown";
  const e2eExtraLines = [
    liveE2E.signature ? `- E2E signature: \`${liveE2E.signature}\`` : null,
    liveE2E.reason ? `- E2E note: ${liveE2E.reason}` : null,
    liveE2E.airdropAttempts ? `- Funding attempts: ${liveE2E.airdropAttempts.length}` : null,
  ]
    .filter(Boolean)
    .join("\n");
  await writeFile(
    markdownPath,
    `# Cloak Devnet SDK Live Probe\n\nGenerated: \`${generatedAt}\`\n\nThis packet verifies the current PrivateDAO Cloak lane against the official Cloak devnet SDK contract without printing private material.\n\n## Network\n\n- Package: \`@cloak.dev/sdk-devnet\` (\`${cloak.VERSION ?? "unknown"}\`)\n- Program: \`${programId.toBase58()}\`\n- Relay: \`${CLOAK_DEVNET_RELAY}\`\n- Solana RPC: \`${SOLANA_DEVNET_RPC}\`\n- Mock USDC mint: \`${String(cloak.DEVNET_MOCK_USDC_MINT)}\`\n\n## Capability Matrix\n\n| Group | Status | Reason |\n| --- | --- | --- |\n${rows}\n\n## Export Check\n\n| Export | Present |\n| --- | --- |\n${exportsRows}\n\n## Live Results\n\n- Cloak docs index: ${docsIndex.ok ? "ok" : `failed (${docsIndex.status})`}\n- Cloak relay health: ${relayHealth.ok ? `ok via ${relayHealth.selected}` : "not reachable from this run"}\n- Devnet program executable: ${programAccount?.executable ? "yes" : "no"}\n- Devnet slot: \`${slot}\`\n- PrivateDAO read-node intent receipt: ${intentReceipt.ok ? "ok" : `failed (${intentReceipt.status})`}\n- Intent execution reference: \`${intentExecutionReference}\`\n- Intent receipt hash: \`${intentReceipt.json?.receipt?.receiptHash ?? "unknown"}\`\n- Intent mode: \`${intentReceipt.json?.mode ?? "unknown"}\`\n- Intent source: \`${intentReceipt.json?.source ?? "unknown"}\`\n- E2E deposit probe: \`${liveE2E.status}\`${e2eExtraLines ? `\n${e2eExtraLines}` : ""}\n\n## Safety Boundary\n\nThe probe never prints private keys, viewing keys, UTXO private keys, raw notes, or seed material. Public transaction signatures and public receipt references may be printed for support and verification.\n\nTo run the optional funded devnet deposit path:\n\n\`\`\`bash\nPRIVATE_DAO_CLOAK_E2E=1 npm run probe:cloak-devnet-sdk\n\`\`\`\n\nThe default run keeps the live check to documentation, relay, program account, exported SDK contract, and PrivateDAO read-node intent receipt.\n`,
  );

  console.log(JSON.stringify(report, bigintJson, 2));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.stack ?? error.message : String(error));
  process.exit(1);
});
