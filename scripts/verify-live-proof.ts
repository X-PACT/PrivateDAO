import fs from "fs";
import path from "path";

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

  assertContains(liveProof, "Program ID: `5AhUsbQ4mJ8Xh7QJEomuS85qGgmK9iNvFqzF669Y7Psx`", "missing live program id");
  assertContains(liveProof, "- DAO: `Gj7NgKm1MtB2CDs11pPJDcLExrkHf1styKdge1Lgx7V4`", "missing live DAO address");
  assertContains(liveProof, "- Treasury PDA: `S2J1gNCbE8E21pL3VEX4fhz2duxidSwRd7yaV9nriFW`", "missing live treasury PDA");
  assertContains(liveProof, "- Proposal PDA: `8JLRaAnwZc3BXfHKEKdiaK82MyjR1VhgGRKMydqmHxd1`", "missing live proposal PDA");

  for (const label of ["create-dao", "mint-voting", "deposit", "create-proposal", "commit", "reveal", "finalize", "execute"]) {
    assertContains(liveProof, `- \`${label}\``, `missing transaction label: ${label}`);
  }

  assertContains(liveProof, "- Proposal result: `Passed`", "missing finalized result evidence");
  assertContains(liveProof, "- `isExecuted = true`", "missing execution invariant evidence");

  const verificationAddress = config.onChainVerification.vaultAddress || config.onChainVerification.walletAddress;
  if (!verificationAddress) {
    throw new Error("devnet strategy config is missing the verification address");
  }

  if (verificationAddress !== "4Mm5YTRbJuyA8NcWM85wTnx6ZQMXNph2DSnzCCKLhsMD") {
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
