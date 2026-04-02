import fs from "fs";
import path from "path";
import { loadProofRegistry } from "./lib/proof-registry";

const LIVE_PROOF = path.resolve("docs/live-proof.md");
const DEVNET_CONFIG = path.resolve("docs/ranger-strategy-config.devnet.json");

type StrategyConfig = {
  onChainVerification: {
    walletAddress?: string;
    vaultAddress?: string;
    buildWindowVerified: boolean;
  };
};

function main() {
  const liveProof = fs.readFileSync(LIVE_PROOF, "utf8");
  const config = JSON.parse(fs.readFileSync(DEVNET_CONFIG, "utf8")) as StrategyConfig;
  const registry = loadProofRegistry();

  assertContains(liveProof, `Program ID: \`${registry.programId}\``, "missing live program id");
  assertContains(liveProof, `- DAO: \`${registry.dao}\``, "missing live DAO address");
  assertContains(liveProof, `- Governance mint: \`${registry.governanceMint}\``, "missing live governance mint");
  assertContains(liveProof, `- Treasury PDA: \`${registry.treasury}\``, "missing live treasury PDA");
  assertContains(liveProof, `- Proposal PDA: \`${registry.proposal}\``, "missing live proposal PDA");

  for (const label of Object.keys(registry.transactions)) {
    assertContains(liveProof, `- \`${label}\``, `missing transaction label: ${label}`);
  }

  assertContains(liveProof, "- Proposal result: `Passed`", "missing finalized result evidence");
  assertContains(liveProof, "- `isExecuted = true`", "missing execution invariant evidence");

  const verificationAddress = config.onChainVerification.vaultAddress || config.onChainVerification.walletAddress;
  if (!verificationAddress) {
    throw new Error("devnet strategy config is missing the verification address");
  }

  if (verificationAddress !== registry.verificationWallet) {
    throw new Error(`unexpected verification address in devnet config: ${verificationAddress}`);
  }

  console.log("Live proof verification: PASS");
}

function assertContains(body: string, fragment: string, message: string) {
  if (!body.includes(fragment)) {
    throw new Error(message);
  }
}

main();
