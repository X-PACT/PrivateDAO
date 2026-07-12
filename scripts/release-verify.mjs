import { spawn } from "node:child_process";

const timeoutMs = Number(process.env.PRIVADAO_RELEASE_SUITE_TIMEOUT_MS || 180_000);
const suites = [
  ["unit", ["npm", "run", "test:unit:ts"]],
  ["zk", ["npm", "run", "private-engine:preflight"]],
  ["zk-plugins", ["npm", "run", "private-engine:test:plugins"]],
  ["zk-adversarial", ["npm", "run", "private-engine:test:adversarial"]],
  ["solana", ["npm", "run", "test:core"]],
  ["commercial", ["node", "scripts/test-commercial-lifecycle.mjs"]],
  ["security-rbac", ["node", "scripts/test-private-engine-rbac.mjs"]],
  ["security-commercial-preflight", ["node", "scripts/security-commercial-preflight.mjs"]],
  ["security-audit", ["npm", "audit", "--omit=dev", "--audit-level=high"]],
];

function runSuite(name, command) {
  return new Promise((resolve) => {
    const child = spawn(command[0], command.slice(1), { cwd: process.cwd(), env: process.env, stdio: ["ignore", "pipe", "pipe"] });
    let output = "";
    child.stdout.on("data", (chunk) => { output += chunk.toString(); });
    child.stderr.on("data", (chunk) => { output += chunk.toString(); });
    const timer = setTimeout(() => { child.kill("SIGTERM"); resolve({ name, ok: false, code: null, timedOut: true, output: output.slice(-3000) }); }, timeoutMs);
    child.on("exit", (code, signal) => { clearTimeout(timer); resolve({ name, ok: code === 0, code, signal, timedOut: false, output: output.slice(-3000) }); });
  });
}

const results = [];
for (const [name, command] of suites) {
  process.stdout.write(`[release-verify] ${name} ... `);
  const result = await runSuite(name, command);
  results.push(result);
  console.log(result.ok ? "PASS" : result.timedOut ? "TIMEOUT" : "FAIL");
  if (!result.ok) console.log(result.output);
}

const failed = results.filter((result) => !result.ok);
console.log(JSON.stringify({ schema: "privatedao.release-verify.v1", timeoutMs, ok: failed.length === 0, suites: results.map(({ name, ok, code, timedOut }) => ({ name, ok, code, timedOut })) }, null, 2));
if (failed.length) process.exit(1);
