import fs from "fs";
import path from "path";

type AlertRules = {
  schemaVersion: number;
  project: string;
  environment: string;
  claimBoundary: string;
  rules: AlertRule[];
};

type AlertRule = {
  id: string;
  category: string;
  severity: string;
  signal: string;
  condition: string;
  action: string;
  runbook: string;
  status: string;
};

const REQUIRED_RULES = [
  "rpc-slot-staleness",
  "blockhash-failure-spike",
  "unexpected-proposal-creation",
  "failed-finalize-spike",
  "strict-proof-failure",
  "settlement-evidence-failure",
  "treasury-balance-change",
  "upgrade-authority-activity",
];

function main(): void {
  const jsonPath = path.resolve("docs/monitoring-alert-rules.json");
  const markdownPath = path.resolve("docs/monitoring-alert-rules.md");
  assertFile(jsonPath);
  assertFile(markdownPath);

  const ruleset = readJson<AlertRules>(jsonPath);
  const markdown = fs.readFileSync(markdownPath, "utf8");

  assert(ruleset.schemaVersion === 1, "unexpected monitoring alert rules schema version");
  assert(ruleset.project === "PrivateDAO", "alert rules must be bound to PrivateDAO");
  assert(ruleset.environment === "mainnet-candidate", "alert rules must target the mainnet candidate");
  assert(ruleset.claimBoundary.includes("pending external setup"), "alert rules must preserve the honest external setup boundary");
  assert(ruleset.rules.length >= REQUIRED_RULES.length, "missing alert rules");

  const ids = new Set<string>();
  for (const rule of ruleset.rules) {
    assertNonEmpty(rule.id, "rule id");
    assert(!ids.has(rule.id), `duplicate alert rule id: ${rule.id}`);
    ids.add(rule.id);

    assertNonEmpty(rule.category, `${rule.id} category`);
    assertNonEmpty(rule.severity, `${rule.id} severity`);
    assertNonEmpty(rule.signal, `${rule.id} signal`);
    assertNonEmpty(rule.condition, `${rule.id} condition`);
    assertNonEmpty(rule.action, `${rule.id} action`);
    assertNonEmpty(rule.runbook, `${rule.id} runbook`);
    assert(rule.status === "defined", `${rule.id} must be explicitly defined`);
    assertFile(path.resolve(rule.runbook));
    assert(markdown.includes(rule.id), `monitoring-alert-rules.md missing ${rule.id}`);
  }

  for (const id of REQUIRED_RULES) {
    assert(ids.has(id), `missing required alert rule: ${id}`);
  }

  assert(markdown.includes("live delivery still requires external monitoring setup"), "monitoring markdown must preserve external setup boundary");
  console.log(`Monitoring alert rule verification: PASS (${ruleset.rules.length} rules)`);
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
