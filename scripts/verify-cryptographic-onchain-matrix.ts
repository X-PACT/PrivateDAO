import fs from "fs";
import path from "path";

const MATRIX = path.resolve("docs/cryptographic-onchain-matrix-2026-05-25.md");
const LIVE_PROOF = path.resolve("docs/test-wallet-live-proof-v3.generated.json");
const PRIVACY_GUIDE = path.resolve("docs/privacy-and-encryption-proof-guide.md");
const ZK_MATRIX = path.resolve("docs/zk-capability-matrix.md");

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

function assertIncludes(haystack: string, needle: string) {
  assert(haystack.includes(needle), `cryptographic on-chain matrix missing ${needle}`);
}

function main() {
  const matrix = fs.readFileSync(MATRIX, "utf8");
  const privacyGuide = fs.readFileSync(PRIVACY_GUIDE, "utf8");
  const zkMatrix = fs.readFileSync(ZK_MATRIX, "utf8");
  const liveProof = JSON.parse(fs.readFileSync(LIVE_PROOF, "utf8"));

  assert(liveProof.cluster === "testnet", "V3 live proof must remain Testnet scoped");
  assert(liveProof.anchorVersion === "1.0.1", "V3 live proof must remain Anchor 1.0.1 scoped");
  assert(
    liveProof.programId === "EP9xE8MJZ6FfyEwLqns6HDdUZBknEa7WGYs1Jzsecuva",
    "V3 live proof program ID drifted from the current Testnet program",
  );
  assert(liveProof.settlementV3?.invariants?.evidenceConsumed === true, "settlement evidence must be consumed");
  assert(
    BigInt(liveProof.settlementV3?.invariants?.recipientTokenAfterAmount ?? "0") >
      BigInt(liveProof.settlementV3?.invariants?.recipientTokenBeforeAmount ?? "0"),
    "recipient token balance must increase in V3 proof",
  );

  for (const required of [
    "Cryptographic On-Chain Matrix",
    "EP9xE8MJZ6FfyEwLqns6HDdUZBknEa7WGYs1Jzsecuva",
    "Anchor `1.0.1`",
    "Squads proposal index `3`",
    "2026-05-27T02:25:39Z",
    "TimeLockNotReleased / 6021",
    "HXcaUbT7Q8euufUbDKuhoRkSSYQPwUwmhw69TdePV6uY",
    "4g7SaVf6yXNouGCvxqDnSsQGD7yuPgJr9fLCSWhd3BaN1uQJgZy5LQ8iZZhMozSy83X8CBKjXfsjZTgdiZVq6fqB",
    "5H7Afyqdh5yPekkZJ5UM2j3HNB2bRvU8aVv8XoqeAW1j",
    "zwqNsA3kNP1mgcaS6zNdR92LLdssFULXfsRdkMK3UxraKLM6wYDoPaWCwV3J9PqApK5xJJH8TpxsGyCRcdEah67",
    liveProof.settlementV3.transactions.configureRefheEnvelope,
    liveProof.settlementV3.transactions.settleRefheEnvelope,
    liveProof.settlementV3.transactions.configureMagicBlockPrivatePaymentCorridor,
    liveProof.settlementV3.transactions.settleMagicBlockPrivatePaymentCorridor,
    liveProof.settlementV3.transactions.executeV3,
    liveProof.settlementV3.refheEnvelope,
    liveProof.settlementV3.magicblockCorridor,
    "60000000 -> 10000000",
    "0 -> 50000000",
    "No funded IKA dWallet DKG or final 2PC-MPC signature is claimed in this run",
    "RPC tokens and stream secrets stay out of repository and public docs",
  ]) {
    assertIncludes(matrix, required);
  }

  assert(
    !matrix.includes("private key") && !matrix.includes("a15cf3772672a4ecb986d52659a108a3e6efe160"),
    "matrix must not expose key material or private RPC token fragments",
  );

  for (const required of [
    "docs/cryptographic-onchain-matrix-2026-05-25.md",
    "Solana Testnet under Anchor `1.0.1`",
    liveProof.programId,
    liveProof.settlementV3.transactions.executeV3,
    "funded IKA dWallet DKG or final 2PC-MPC signing",
  ]) {
    assertIncludes(privacyGuide, required);
  }

  for (const required of [
    "Standalone on-chain verifier",
    "Program-integrated verifier path",
    "proposal index `3`",
    "2026-05-27T02:25:39Z",
    "npm run verify:cryptographic-onchain-matrix",
  ]) {
    assertIncludes(zkMatrix, required);
  }

  console.log("Cryptographic on-chain matrix verification: PASS");
}

main();
