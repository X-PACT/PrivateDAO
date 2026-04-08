import fs from "fs";
import path from "path";

type MainnetBlockerRegister = {
  schemaVersion: number;
  project: string;
  decision: string;
  productionMainnetClaimAllowed: boolean;
  summary: string;
  blockers: Blocker[];
};

type Blocker = {
  id: string;
  category: string;
  severity: string;
  status: string;
  requiredBefore: string;
  owner: string;
  nextAction: string;
  evidence: string[];
  completionEvidence?: string[];
};

const REQUIRED_IDS = [
  "external-audit-completion",
  "upgrade-authority-multisig",
  "production-monitoring-alerts",
  "real-device-wallet-runtime",
  "magicblock-refhe-source-receipts",
  "mainnet-cutover-ceremony",
];

const OPEN_STATUSES = new Set([
  "pending-external",
  "pending-runtime-captures",
  "pending-integration",
]);

function main(): void {
  const registerPath = path.resolve("docs/mainnet-blockers.json");
  const markdownPath = path.resolve("docs/mainnet-blockers.md");
  assertFile(registerPath);
  assertFile(markdownPath);

  const register = readJson<MainnetBlockerRegister>(registerPath);
  const markdown = fs.readFileSync(markdownPath, "utf8");

  assert(register.schemaVersion === 1, "unexpected mainnet blocker schema version");
  assert(register.project === "PrivateDAO", "mainnet blocker register must be bound to PrivateDAO");
  assert(register.decision === "blocked-external-steps", "mainnet decision must remain explicit while blockers are open");
  assert(register.productionMainnetClaimAllowed === false, "production mainnet claim must be disabled while blockers are open");
  assert(register.summary.includes("real-funds mainnet"), "register summary must name the real-funds mainnet boundary");
  assert(Array.isArray(register.blockers) && register.blockers.length >= REQUIRED_IDS.length, "missing mainnet blockers");

  const ids = new Set<string>();
  let openCount = 0;

  for (const blocker of register.blockers) {
    assertNonEmpty(blocker.id, "blocker id");
    assert(!ids.has(blocker.id), `duplicate blocker id: ${blocker.id}`);
    ids.add(blocker.id);

    assertNonEmpty(blocker.category, `${blocker.id} category`);
    assertNonEmpty(blocker.severity, `${blocker.id} severity`);
    assertNonEmpty(blocker.status, `${blocker.id} status`);
    assertNonEmpty(blocker.requiredBefore, `${blocker.id} requiredBefore`);
    assertNonEmpty(blocker.owner, `${blocker.id} owner`);
    assertNonEmpty(blocker.nextAction, `${blocker.id} nextAction`);
    assert(blocker.requiredBefore === "mainnet-real-funds", `${blocker.id} must block real-funds mainnet`);
    assert(blocker.evidence.length > 0, `${blocker.id} needs evidence pointers`);

    if (OPEN_STATUSES.has(blocker.status)) {
      openCount += 1;
    }

    if (blocker.status === "complete") {
      assert(
        Boolean(blocker.completionEvidence?.length),
        `${blocker.id} cannot be complete without completionEvidence`,
      );
    }

    for (const evidencePath of blocker.evidence) {
      assertNonEmpty(evidencePath, `${blocker.id} evidence path`);
      if (evidencePath.startsWith("docs/") || evidencePath === "README.md") {
        assertFile(path.resolve(evidencePath));
      }
      assert(
        markdown.includes(blocker.id) && markdown.includes(evidencePath),
        `mainnet-blockers.md must reference ${blocker.id} and evidence path ${evidencePath}`,
      );
    }
  }

  for (const id of REQUIRED_IDS) {
    assert(ids.has(id), `missing required blocker: ${id}`);
    assert(markdown.includes(id), `mainnet-blockers.md missing blocker: ${id}`);
  }

  assert(openCount > 0, "register should not silently claim mainnet production clearance");
  assert(markdown.includes("blocked-external-steps"), "mainnet-blockers.md must include the current decision");
  assert(markdown.includes("not cleared for real-funds mainnet production"), "mainnet-blockers.md must include the honest boundary");

  console.log(`Mainnet blocker register verification: PASS (${openCount} open blockers)`);
}

function readJson<T>(relativePath: string): T {
  return JSON.parse(fs.readFileSync(path.resolve(relativePath), "utf8")) as T;
}

function assertFile(filePath: string): void {
  if (!fs.existsSync(filePath)) {
    throw new Error(`missing required file: ${path.relative(process.cwd(), filePath)}`);
  }
}

function assertNonEmpty(value: string, label: string): void {
  assert(typeof value === "string" && value.trim().length > 0, `missing ${label}`);
}

function assert(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

main();
