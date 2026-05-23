import fs from "fs";
import path from "path";

const DOC = path.resolve("docs/testnet-encrypted-integrations-activation-2026-05-23.md");
const LIVE_PROOF = path.resolve("docs/test-wallet-live-proof-v3.generated.json");

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

function main() {
  const doc = fs.readFileSync(DOC, "utf8");
  const proof = JSON.parse(fs.readFileSync(LIVE_PROOF, "utf8"));

  assert(proof.cluster === "testnet", "live proof must be Testnet-scoped");
  assert(proof.anchorVersion === "1.0.1", "live proof must record Anchor 1.0.1");
  assert(proof.programId === "EP9xE8MJZ6FfyEwLqns6HDdUZBknEa7WGYs1Jzsecuva", "unexpected Testnet program ID");
  assert(Boolean(proof.settlementV3?.transactions?.configureRefheEnvelope), "missing REFHE configure tx");
  assert(Boolean(proof.settlementV3?.transactions?.settleRefheEnvelope), "missing REFHE settle tx");
  assert(Boolean(proof.settlementV3?.transactions?.configureMagicBlockPrivatePaymentCorridor), "missing MagicBlock configure tx");
  assert(Boolean(proof.settlementV3?.transactions?.settleMagicBlockPrivatePaymentCorridor), "missing MagicBlock settle tx");
  assert(Boolean(proof.settlementV3?.transactions?.executeV3), "missing V3 execute tx");
  assert(proof.settlementV3?.invariants?.evidenceConsumed === true, "settlement evidence must be consumed");
  assert(
    BigInt(proof.settlementV3?.invariants?.recipientTokenAfterAmount ?? "0") >
      BigInt(proof.settlementV3?.invariants?.recipientTokenBeforeAmount ?? "0"),
    "recipient token balance must increase",
  );

  for (const required of [
    "Testnet Encrypted Integrations Activation",
    proof.programId,
    proof.settlementV3.refheEnvelope,
    proof.settlementV3.magicblockCorridor,
    proof.settlementV3.settlementEvidence,
    proof.settlementV3.transactions.configureRefheEnvelope,
    proof.settlementV3.transactions.settleRefheEnvelope,
    proof.settlementV3.transactions.configureMagicBlockPrivatePaymentCorridor,
    proof.settlementV3.transactions.settleMagicBlockPrivatePaymentCorridor,
    proof.settlementV3.transactions.executeV3,
    "ika-sui-network-read-complete-ready-for-dwallet-execution",
    "approval-route-prepared-for-dwallet-execution",
    "This packet does not claim that a funded IKA dWallet DKG",
  ]) {
    assert(doc.includes(required), `activation document missing ${required}`);
  }

  console.log("Encrypted integrations activation verification: PASS");
}

main();
