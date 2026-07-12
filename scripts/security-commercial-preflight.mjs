import { existsSync, readFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { join } from "node:path";

const root = process.cwd();
const failures = [];
const required = [
  "security/BLIND-VERIFICATION-SECURITY-TEST-PACKAGE.md",
  "services/private-engine/Dockerfile",
  "docker-compose.onprem.yml",
  "services/private-engine/src/license.mjs",
  "services/private-engine/src/proof.mjs",
  "scripts/test-private-engine-adversarial.mjs",
  "scripts/test-private-engine-rbac.mjs",
  "scripts/test-commercial-lifecycle.mjs",
];
for (const file of required) if (!existsSync(join(root, file))) failures.push(`missing:${file}`);

const envExample = readFileSync(join(root, ".env.example"), "utf8");
if (!envExample.includes("PD_PAYMENT_MODE=PDAO_ONLY")) failures.push("payment-mode-not-pdao-only");
if (!envExample.includes("PRIVADAO_LICENSE_SIGNER_PROVIDER=aws-kms")) failures.push("license-signer-not-kms");
if (!envExample.includes("ECC_NIST_EDWARDS25519") && !envExample.includes("ED25519")) failures.push("ed25519-kms-spec-not-documented");

const forbiddenTracked = /(^|\/)(\.env|.*\.pem|secure-wallet-backups|private-inputs)(\/|$)/i;
const trackedFiles = execFileSync("git", ["ls-files"], { cwd: root, encoding: "utf8" }).split("\n").filter(Boolean);
for (const file of trackedFiles) if (forbiddenTracked.test(file)) failures.push(`sensitive-file-tracked:${file}`);

console.log(JSON.stringify({ schema: "privatedao.commercial-security-preflight.v1", ok: failures.length === 0, failures }, null, 2));
if (failures.length) process.exit(1);
