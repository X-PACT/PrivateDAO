import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { dirname, resolve } from "node:path";

const root = resolve(process.cwd());
const output = resolve(process.env.PRIVATEDAO_ENGINE_MANIFEST || "services/private-engine/release/manifest.json");
const files = [
  "zk/circuits/private_dao_blind_policy_overlay.circom",
  "zk/build/private_dao_blind_policy_overlay.r1cs",
  "zk/build/private_dao_blind_policy_overlay_js/private_dao_blind_policy_overlay.wasm",
  "zk/setup/private_dao_blind_policy_overlay_final.zkey",
  "zk/setup/private_dao_blind_policy_overlay_vkey.json",
  "zk/circuits/private_dao_blind_kyc.circom",
  "zk/build/private_dao_blind_kyc.r1cs",
  "zk/build/private_dao_blind_kyc_js/private_dao_blind_kyc.wasm",
  "zk/setup/private_dao_blind_kyc_final.zkey",
  "zk/setup/private_dao_blind_kyc_vkey.json",
  "zk/circuits/private_dao_blind_aml.circom",
  "zk/build/private_dao_blind_aml.r1cs",
  "zk/build/private_dao_blind_aml_js/private_dao_blind_aml.wasm",
  "zk/setup/private_dao_blind_aml_final.zkey",
  "zk/setup/private_dao_blind_aml_vkey.json",
  "zk/circuits/private_dao_blind_employment.circom",
  "zk/build/private_dao_blind_employment.r1cs",
  "zk/build/private_dao_blind_employment_js/private_dao_blind_employment.wasm",
  "zk/setup/private_dao_blind_employment_final.zkey",
  "zk/setup/private_dao_blind_employment_vkey.json",
  "zk/circuits/private_dao_blind_payroll.circom",
  "zk/build/private_dao_blind_payroll.r1cs",
  "zk/build/private_dao_blind_payroll_js/private_dao_blind_payroll.wasm",
  "zk/setup/private_dao_blind_payroll_final.zkey",
  "zk/setup/private_dao_blind_payroll_vkey.json",
  "zk/circuits/private_dao_blind_underwriting.circom",
  "zk/build/private_dao_blind_underwriting.r1cs",
  "zk/build/private_dao_blind_underwriting_js/private_dao_blind_underwriting.wasm",
  "zk/setup/private_dao_blind_underwriting_final.zkey",
  "zk/setup/private_dao_blind_underwriting_vkey.json",
  "zk/circuits/private_dao_vote_overlay.circom",
  "zk/build/private_dao_vote_overlay.r1cs",
  "zk/build/private_dao_vote_overlay_js/private_dao_vote_overlay.wasm",
  "zk/setup/private_dao_vote_overlay_final.zkey",
  "zk/setup/private_dao_vote_overlay_vkey.json",
  "services/private-engine/src/server.mjs",
  "services/private-engine/src/proof.mjs",
  "services/private-engine/src/license.mjs",
  "services/private-engine/src/db.mjs",
  "services/private-engine/src/plugins.mjs",
];

const artifacts = [];
for (const relativePath of files) {
  const path = resolve(root, relativePath);
  if (!existsSync(path)) throw new Error(`Required release artifact is missing: ${relativePath}`);
  const digest = createHash("sha256").update(await readFile(path)).digest("hex");
  artifacts.push({ path: relativePath, sha256: digest });
}

const manifest = {
  schema: "privatedao.private-engine-release.v1",
  generatedAt: new Date().toISOString(),
  engineVersion: "0.1.0",
  proofSystem: "Circom + snarkjs Groth16",
  pluginRegistry: "services/private-engine/src/plugins.mjs",
  deploymentModes: ["docker", "docker-compose", "self-hosted", "air-gapped"],
  artifacts,
  privateDataBoundary: "Private inputs and witness files remain inside the customer deployment.",
  licenseBoundary: "Only signed license metadata may be synchronized with the PrivateDAO control plane.",
};
await mkdir(dirname(output), { recursive: true });
await writeFile(output, JSON.stringify(manifest, null, 2));
console.log(JSON.stringify({ output, artifactCount: artifacts.length, engineVersion: manifest.engineVersion }, null, 2));
