import { createPrivateKey, createPublicKey, generateKeyPairSync, sign } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";

function stableStringify(value) {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(",")}]`;
  return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${stableStringify(value[key])}`).join(",")}}`;
}

const positional = [];
const flags = {};
for (const arg of process.argv.slice(2)) {
  if (arg.startsWith("--")) {
    const [key, value = "true"] = arg.slice(2).split("=", 2);
    flags[key] = value;
  } else positional.push(arg);
}
const organizationId = flags.org || flags.organization || positional[0] || "customer-organization";
const plan = flags.plan || positional[1] || "ENTERPRISE";
const licenseDays = flags.days || flags.licenseDays || positional[2] || "31";
const installationId = flags.installationId || positional[3] || "";
const seatLimit = flags.seats || flags.seatLimit || positional[4] || "50";
const organizationLimit = flags.organizations || flags.organizationLimit || positional[5] || "1";
if (!Number.isFinite(Number(licenseDays)) || Number(licenseDays) <= 0) throw new Error("license days must be a positive number");
const outputDir = resolve(process.env.PRIVATEDAO_LICENSE_OUTPUT_DIR || "services/private-engine/data");
const privateKeyPath = resolve(process.env.PRIVATEDAO_LICENSE_SIGNING_KEY || `${outputDir}/license-signing-private.pem`);
const publicKeyPath = resolve(process.env.PRIVATEDAO_LICENSE_PUBLIC_KEY || `${outputDir}/license-public.pem`);
const licensePath = resolve(process.env.PRIVATEDAO_LICENSE_FILE || `${outputDir}/license.json`);
await mkdir(dirname(privateKeyPath), { recursive: true });

let privateKey;
let publicKey;
try {
  privateKey = createPrivateKey(await readFile(privateKeyPath));
  publicKey = createPublicKey(privateKey);
} catch {
  const generated = generateKeyPairSync("ed25519");
  privateKey = generated.privateKey;
  publicKey = generated.publicKey;
  await writeFile(privateKeyPath, privateKey.export({ format: "pem", type: "pkcs8" }), { mode: 0o600 });
  await writeFile(publicKeyPath, publicKey.export({ format: "pem", type: "spki" }));
}

const now = new Date();
const expiresAt = new Date(now.getTime() + Number(licenseDays) * 24 * 60 * 60 * 1000);
const offlineGraceUntil = new Date(expiresAt.getTime() + 14 * 24 * 60 * 60 * 1000);
const payload = {
  licenseId: `lic_${Date.now().toString(36)}`,
  organizationId,
  plan,
  status: "active",
  issuedAt: now.toISOString(),
  expiresAt: expiresAt.toISOString(),
  offlineGraceUntil: offlineGraceUntil.toISOString(),
  engineVersion: "0.1.0",
  features: ["blind-policy-groth16", "local-witness", "local-verification", "local-receipts"],
  seatLimit: Math.max(1, Number(seatLimit) || 1),
  organizationLimit: Math.max(1, Number(organizationLimit) || 1),
  keyId: process.env.PRIVADAO_LICENSE_SIGNING_KEY_ID || "primary",
};
if (installationId) payload.installationId = installationId;
const signature = sign(null, Buffer.from(stableStringify(payload)), privateKey).toString("base64");
await writeFile(licensePath, JSON.stringify({ schema: "privatedao.enterprise-license.v1", algorithm: "ed25519", keyId: payload.keyId, payload, signature }, null, 2));
console.log(JSON.stringify({ licensePath, publicKeyPath, organizationId, plan, expiresAt: payload.expiresAt, offlineGraceUntil: payload.offlineGraceUntil }, null, 2));
