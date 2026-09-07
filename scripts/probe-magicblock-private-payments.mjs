#!/usr/bin/env node
import { mkdir, writeFile } from "node:fs/promises";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(__dirname, "..");

const MAGICBLOCK_DOCS_INDEX = "https://docs.magicblock.gg/llms.txt";
const MAGICBLOCK_STATUS = "https://status.magicblock.app/api/services";
const MAGICBLOCK_PAYMENTS = "https://payments.magicblock.app";
const PRIVATE_DAO_HEALTH = "https://api.privatedao.org/api/v1/magicblock/health";
const PRIVATE_DAO_CHALLENGE = "https://api.privatedao.org/api/v1/magicblock/challenge";
const SAFE_TEST_WALLET = "B3STL1akxLGLvPpKd6Grz19jjVySkWrGgHFwGNK8yEZ";
const DEVNET_USDC = "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU";

const capabilityMatrix = [
  {
    group: "Private Payments health",
    status: "used",
    reason: "The probe checks https://payments.magicblock.app/health and the PrivateDAO read-node health proxy.",
  },
  {
    group: "Challenge/login",
    status: "used for readiness",
    reason: "The probe requests a challenge for a public test wallet. It does not sign or print bearer tokens.",
  },
  {
    group: "Private balance",
    status: "auth-bound",
    reason: "Private balance reads require a bearer token from the wallet-signed challenge/login flow.",
  },
  {
    group: "Unsigned transaction builders",
    status: "available",
    reason: "Deposit, transfer, and withdraw builders are wired in repo code; live signing/submission remains wallet-side.",
  },
  {
    group: "Ephemeral Rollup regions",
    status: "used",
    reason: "The probe reads the MagicBlock status API and records live devnet services for reviewer evidence.",
  },
  {
    group: "MagicBlock Dev Skill",
    status: "installed",
    reason: "The skill is installed under ~/.codex/skills/magicblock and was used to align the challenge/login and bearer-token boundary.",
  },
];

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
    // Keep bodyPreview in the JSON report for non-JSON endpoints.
  }
  return { ...result, json, text: undefined };
}

function summarizeDevnetStatus(payload) {
  const devnetRegions = payload?.environments?.devnet?.regions;
  if (!devnetRegions || typeof devnetRegions !== "object") return [];
  return Object.entries(devnetRegions).flatMap(([region, regionData]) =>
    Object.entries(regionData?.servers || {}).map(([server, serverData]) => {
      const liveStatus = serverData?.live_status || {};
      return {
        region,
        server,
        name: serverData?.displayName || server,
        live: Object.values(liveStatus).some(Boolean),
        services: Object.fromEntries(Object.entries(liveStatus).map(([name, live]) => [name, Boolean(live)])),
      };
    }),
  );
}

async function main() {
  const generatedAt = new Date().toISOString();
  const [docsIndex, status, paymentsHealth, privateDaoHealth, directChallenge, privateDaoChallenge, mintStatus] = await Promise.all([
    fetchText(MAGICBLOCK_DOCS_INDEX),
    fetchJson(MAGICBLOCK_STATUS),
    fetchJson(`${MAGICBLOCK_PAYMENTS}/health`),
    fetchJson(PRIVATE_DAO_HEALTH),
    fetchJson(`${MAGICBLOCK_PAYMENTS}/v1/spl/challenge?pubkey=${SAFE_TEST_WALLET}&cluster=devnet`),
    fetchJson(`${PRIVATE_DAO_CHALLENGE}?pubkey=${SAFE_TEST_WALLET}&refresh=1`),
    fetchJson(`${MAGICBLOCK_PAYMENTS}/v1/spl/is-mint-initialized?mint=${DEVNET_USDC}&cluster=devnet`),
  ]);

  const report = {
    generatedAt,
    api: {
      payments: MAGICBLOCK_PAYMENTS,
      docsIndex: MAGICBLOCK_DOCS_INDEX,
      status: MAGICBLOCK_STATUS,
      privateDaoHealth: PRIVATE_DAO_HEALTH,
      privateDaoChallenge: PRIVATE_DAO_CHALLENGE,
    },
    capabilityMatrix,
    docsIndex: {
      ok: docsIndex.ok,
      status: docsIndex.status,
      containsPrivatePayments: docsIndex.text.includes("Private Payments"),
      containsChallengeLogin: docsIndex.text.includes("challenge") && docsIndex.text.includes("login"),
    },
    live: {
      paymentsHealth: {
        ok: paymentsHealth.ok,
        status: paymentsHealth.status,
        payload: paymentsHealth.json,
      },
      privateDaoHealth: {
        ok: privateDaoHealth.ok,
        status: privateDaoHealth.status,
        payload: privateDaoHealth.json,
      },
      directChallenge: {
        ok: directChallenge.ok,
        status: directChallenge.status,
        payloadShape: directChallenge.json
          ? {
              hasChallenge: typeof directChallenge.json.challenge === "string",
              hasMessage: typeof directChallenge.json.message === "string",
              keys: Object.keys(directChallenge.json).sort(),
            }
          : null,
      },
      privateDaoChallenge: {
        ok: privateDaoChallenge.ok,
        status: privateDaoChallenge.status,
        note: privateDaoChallenge.ok
          ? "PrivateDAO challenge proxy is live."
          : "PrivateDAO challenge proxy is implemented in this repo and will be live after the read-node deployment is refreshed.",
      },
      mintInitialization: {
        ok: mintStatus.ok,
        status: mintStatus.status,
        mint: DEVNET_USDC,
        payload: mintStatus.json,
      },
      devnetStatus: summarizeDevnetStatus(status.json),
    },
    safety: {
      secretsPrinted: false,
      omittedFields: ["wallet signatures", "bearer tokens", "private balances", "private keys"],
      boundary:
        "The probe verifies public health, status, and challenge readiness. Private balance reads and transaction submission require a wallet-signed login token and user-side transaction signing.",
    },
  };

  await mkdir(resolve(repoRoot, "docs/generated"), { recursive: true });
  await writeFile(
    resolve(repoRoot, "docs/generated/magicblock-private-payments-probe.generated.json"),
    `${JSON.stringify(report, null, 2)}\n`,
  );

  const rows = capabilityMatrix
    .map((row) => `| ${row.group} | ${row.status} | ${row.reason.replace(/\|/g, "\\|")} |`)
    .join("\n");
  const statusRows = report.live.devnetStatus
    .map((entry) => `| ${entry.server} | ${entry.live ? "yes" : "no"} | ${Object.entries(entry.services).map(([name, live]) => `${name}:${live ? "live" : "off"}`).join(", ")} |`)
    .join("\n");
  await writeFile(
    resolve(repoRoot, "docs/magicblock/private-payments-live-probe.generated.md"),
    `# MagicBlock Private Payments Live Probe\n\nGenerated: \`${generatedAt}\`\n\nThis packet verifies the MagicBlock Private Payments lane used by PrivateDAO without printing signatures, bearer tokens, private balances, or private keys.\n\n## Capability Matrix\n\n| Group | Status | Reason |\n| --- | --- | --- |\n${rows}\n\n## Live Results\n\n- MagicBlock docs index: ${docsIndex.ok ? "ok" : `failed (${docsIndex.status})`}\n- Payments API health: ${paymentsHealth.ok ? "ok" : `failed (${paymentsHealth.status})`}\n- PrivateDAO read-node MagicBlock health: ${privateDaoHealth.ok ? "ok" : `failed (${privateDaoHealth.status})`}\n- Direct challenge readiness: ${directChallenge.ok ? "ok" : `failed (${directChallenge.status})`}\n- PrivateDAO challenge proxy: ${privateDaoChallenge.ok ? "ok" : `pending deploy (${privateDaoChallenge.status})`}\n- Devnet USDC mint initialization check: ${mintStatus.ok ? "ok" : `failed (${mintStatus.status})`}\n\n## Devnet Region Status\n\n| Region | Live | Services |\n| --- | --- | --- |\n${statusRows || "| unavailable | no | status API did not return devnet rows |"}\n\n## Auth Boundary\n\nMagicBlock private balances require the challenge -> wallet signature -> login bearer-token flow. PrivateDAO exposes challenge initiation through \`/api/v1/magicblock/challenge?pubkey=<wallet>\`, but does not fetch private balances without \`Authorization: Bearer <token>\`.\n\nThe Payments API returns unsigned transactions for deposit, transfer, and withdraw flows. The user wallet must sign and submit them to the returned target connection.\n`,
  );

  console.log(JSON.stringify(report, null, 2));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.stack ?? error.message : String(error));
  process.exit(1);
});
