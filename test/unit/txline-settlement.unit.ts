import { assert } from "chai";

import {
  buildSimulatedTxlineMatches,
  buildTxlineSettlementMemoPayload,
  buildTxlineSettlementProofPackage,
  txlineSettlementPolicyVersion,
  verifyTxlineSettlementProofPackage,
  type TxlineSettlementGroth16Proof,
} from "../../apps/web/src/lib/txline-settlement";

const groth16Proof: TxlineSettlementGroth16Proof = {
  provingSystem: "groth16",
  circuit: "private_dao_blind_policy_overlay",
  verificationMode: "groth16-snarkjs",
  verified: true,
  publicSignals: ["1", "2", "3", "1"],
  proof: { pi_a: ["1", "2", "1"], pi_b: [["1", "2"], ["3", "4"], ["1", "0"]], pi_c: ["1", "2", "1"] },
  verificationKey: { protocol: "groth16", curve: "bn128" },
  proofHash: "a".repeat(64),
  publicSignalsHash: "b".repeat(64),
  verificationKeyHash: "c".repeat(64),
};

function buildPackage(overrides: Record<string, unknown> = {}) {
  const match = buildSimulatedTxlineMatches(new Date("2026-06-26T00:00:00.000Z"))[0];
  return buildTxlineSettlementProofPackage({
    proofId: "txline-settlement-test",
    nonce: "nonce-123",
    match,
    marketId: "worldcup-market-test",
    providerMode: "simulated-txline-provider",
    issuedAt: "2026-06-26T00:00:00.000Z",
    expiresAt: "2099-06-26T00:00:00.000Z",
    settlementPolicyCommitment: "d".repeat(64),
    inputCommitment: "e".repeat(64),
    groth16Proof,
    policyVersion: txlineSettlementPolicyVersion,
    ...overrides,
  });
}

describe("txline match settlement", () => {
  it("simulated provider has a final match for demo", () => {
    const matches = buildSimulatedTxlineMatches(new Date("2026-06-26T00:00:00.000Z"));
    assert.equal(matches[0].rawSource, "simulated-txline-provider");
    assert.equal(matches[0].status, "final");
  });

  it("resolve valid final match proof verifies", () => {
    const proofPackage = buildPackage();
    const verification = verifyTxlineSettlementProofPackage(proofPackage);
    assert.equal(verification.ok, true);
  });

  it("rejects unsupported non-final match status", () => {
    const match = { ...buildSimulatedTxlineMatches()[1], status: "live" as const };
    assert.throws(() =>
      buildTxlineSettlementProofPackage({
        proofId: "txline-live",
        nonce: "nonce-live",
        match,
        marketId: "worldcup-live",
        providerMode: "simulated-txline-provider",
        issuedAt: "2026-06-26T00:00:00.000Z",
        expiresAt: "2099-06-26T00:00:00.000Z",
        settlementPolicyCommitment: "d".repeat(64),
        inputCommitment: "e".repeat(64),
        groth16Proof,
      }),
    /final/);
  });

  it("tamper mismatch returns 422-style mismatch status", () => {
    const proofPackage = buildPackage();
    const tampered = { ...proofPackage, marketId: "tampered-market" };
    const verification = verifyTxlineSettlementProofPackage(tampered);
    assert.equal(verification.ok, false);
    assert.equal(verification.status, "mismatch");
    assert.notEqual(verification.originalHash, verification.recomputedHash);
  });

  it("expired proof fails", () => {
    const proofPackage = buildPackage({ expiresAt: "2020-01-01T00:00:00.000Z" });
    const verification = verifyTxlineSettlementProofPackage(proofPackage);
    assert.equal(verification.ok, false);
    assert.equal(verification.status, "expired-proof");
  });

  it("builds on-chain memo receipt payload with hashes only", () => {
    const proofPackage = buildPackage();
    const memo = buildTxlineSettlementMemoPayload(proofPackage);
    assert.match(memo, /^PDAO-TXL1\|/);
    assert.include(memo, proofPackage.txlineSnapshotHash);
    assert.include(memo, proofPackage.originalProofHash);
    assert.notInclude(memo, proofPackage.matchSummary.label);
  });
});
