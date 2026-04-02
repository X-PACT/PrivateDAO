import fs from "fs";
import path from "path";

const README = path.resolve("README.md");
const LIVE_PROOF = path.resolve("docs/live-proof.md");
const MANIFEST = path.resolve("docs/devnet-release-manifest.md");
const DEVNET_CONFIG = path.resolve("docs/ranger-strategy-config.devnet.json");
const BUNDLE = path.resolve("docs/ranger-submission-bundle.generated.md");

const EXPECTED = {
  programId: "5AhUsbQ4mJ8Xh7QJEomuS85qGgmK9iNvFqzF669Y7Psx",
  deployTx: "5wGTXjAhp4jBvU4Uu6FbMVziZkrxN7B9boh98XGfueSLTtZVsAvFtiNzPLfZsKpggJUkCgu1yAXjR4bd4T2w9aU1",
  verificationWallet: "4Mm5YTRbJuyA8NcWM85wTnx6ZQMXNph2DSnzCCKLhsMD",
  dao: "Gj7NgKm1MtB2CDs11pPJDcLExrkHf1styKdge1Lgx7V4",
  treasury: "S2J1gNCbE8E21pL3VEX4fhz2duxidSwRd7yaV9nriFW",
  proposal: "8JLRaAnwZc3BXfHKEKdiaK82MyjR1VhgGRKMydqmHxd1",
};

type StrategyConfig = {
  onChainVerification: {
    walletAddress?: string;
    vaultAddress?: string;
  };
};

function main() {
  const readme = fs.readFileSync(README, "utf8");
  const liveProof = fs.readFileSync(LIVE_PROOF, "utf8");
  const manifest = fs.readFileSync(MANIFEST, "utf8");
  const bundle = fs.readFileSync(BUNDLE, "utf8");
  const config = JSON.parse(fs.readFileSync(DEVNET_CONFIG, "utf8")) as StrategyConfig;

  for (const value of Object.values(EXPECTED)) {
    assertContains(manifest, value, `manifest missing expected value: ${value}`);
  }

  assertContains(readme, EXPECTED.programId, "README missing canonical program id");
  assertContains(liveProof, EXPECTED.programId, "live proof missing canonical program id");
  assertContains(liveProof, EXPECTED.deployTx, "live proof missing canonical deploy transaction");
  assertContains(liveProof, EXPECTED.dao, "live proof missing canonical DAO");
  assertContains(liveProof, EXPECTED.treasury, "live proof missing canonical treasury PDA");
  assertContains(liveProof, EXPECTED.proposal, "live proof missing canonical proposal PDA");
  assertContains(bundle, EXPECTED.verificationWallet, "generated bundle missing verification wallet");

  const verificationAddress = config.onChainVerification.vaultAddress || config.onChainVerification.walletAddress;
  if (verificationAddress !== EXPECTED.verificationWallet) {
    throw new Error(`unexpected verification wallet in devnet config: ${verificationAddress}`);
  }

  console.log("Release manifest verification: PASS");
}

function assertContains(body: string, fragment: string, message: string) {
  if (!body.includes(fragment)) {
    throw new Error(message);
  }
}

main();
