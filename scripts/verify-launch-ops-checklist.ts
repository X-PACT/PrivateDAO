import fs from "fs";
import path from "path";

type LaunchOpsChecklist = {
  schemaVersion: number;
  project: string;
  decision: string;
  productionMainnetClaimAllowed: boolean;
  items: LaunchOpsItem[];
};

type LaunchOpsItem = {
  id: string;
  category: string;
  status: string;
  requiredBefore: string;
  evidence: string[];
};

const REQUIRED_ITEMS = [
  "create-production-multisig",
  "transfer-program-upgrade-authority",
  "configure-production-timelock",
  "backup-and-recovery-procedures",
  "monitoring-setup",
  "alerting-rules",
  "operator-runbooks",
  "emergency-procedures",
  "real-device-testing",
  "wallet-integration",
  "end-to-end-flows",
];

const ALLOWED_STATUSES = new Set([
  "pending-external",
  "pending-runtime-captures",
  "repo-documented",
  "repo-defined",
  "devnet-proven",
]);

function main(): void {
  const jsonPath = path.resolve("docs/launch-ops-checklist.json");
  const markdownPath = path.resolve("docs/launch-ops-checklist.md");
  assertFile(jsonPath);
  assertFile(markdownPath);

  const checklist = readJson<LaunchOpsChecklist>(jsonPath);
  const markdown = fs.readFileSync(markdownPath, "utf8");

  assert(checklist.schemaVersion === 1, "unexpected launch ops schema version");
  assert(checklist.project === "PrivateDAO", "launch ops checklist must be bound to PrivateDAO");
  assert(checklist.decision === "blocked-external-steps", "launch ops decision must preserve the current mainnet boundary");
  assert(checklist.productionMainnetClaimAllowed === false, "production mainnet claim must remain disabled");
  assert(checklist.items.length >= REQUIRED_ITEMS.length, "missing launch ops items");

  const ids = new Set<string>();
  for (const item of checklist.items) {
    assertNonEmpty(item.id, "item id");
    assert(!ids.has(item.id), `duplicate launch ops item: ${item.id}`);
    ids.add(item.id);

    assertNonEmpty(item.category, `${item.id} category`);
    assert(ALLOWED_STATUSES.has(item.status), `${item.id} has unsupported status: ${item.status}`);
    assert(item.requiredBefore === "mainnet-real-funds", `${item.id} must block real-funds mainnet`);
    assert(item.evidence.length > 0, `${item.id} needs evidence paths`);
    assert(markdown.includes(item.id), `launch-ops-checklist.md missing ${item.id}`);

    for (const evidencePath of item.evidence) {
      assertFile(path.resolve(evidencePath));
      assert(markdown.includes(evidencePath), `launch-ops-checklist.md missing evidence path ${evidencePath}`);
    }
  }

  for (const id of REQUIRED_ITEMS) {
    assert(ids.has(id), `missing required launch ops item: ${id}`);
  }

  assert(markdown.includes("Production mainnet claim allowed: `false`"), "launch ops markdown must preserve the no-production-claim boundary");
  console.log(`Launch ops checklist verification: PASS (${checklist.items.length} items)`);
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
