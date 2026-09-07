import { assert } from "chai";
import { createHash } from "crypto";
import fs from "fs";
import path from "path";

import {
  buildBlindPolicyProofPackage,
  buildDemoBlindPolicyProofPackage,
  computeBlindPolicyProofHash,
  defaultBlindPolicyRules,
  type BlindPolicyGroth16Proof,
  type BlindPolicyProofPackage,
  sampleBlindPolicyInputs,
  verifyBlindPolicyProofPackage,
} from "../../apps/web/src/lib/blind-policy-proof";

function sha256File(relativePath: string) {
  return createHash("sha256").update(fs.readFileSync(path.resolve(relativePath))).digest("hex");
}

function readJson(relativePath: string) {
  return JSON.parse(fs.readFileSync(path.resolve(relativePath), "utf8")) as unknown;
}

function readGroth16ProofFixture(): BlindPolicyGroth16Proof {
  const proofPath = "zk/proofs/private_dao_blind_policy_overlay.proof.json";
  const publicSignalsPath = "zk/proofs/private_dao_blind_policy_overlay.public.json";
  const verificationKeyPath = "zk/setup/private_dao_blind_policy_overlay_vkey.json";
  return {
    provingSystem: "groth16",
    circuit: "private_dao_blind_policy_overlay",
    verificationMode: "groth16-snarkjs",
    verified: true,
    publicSignals: readJson(publicSignalsPath) as string[],
    proof: readJson(proofPath),
    verificationKey: readJson(verificationKeyPath),
    proofHash: sha256File(proofPath),
    publicSignalsHash: sha256File(publicSignalsPath),
    verificationKeyHash: sha256File(verificationKeyPath),
  };
}

function resignProofPackage(proofPackage: BlindPolicyProofPackage): BlindPolicyProofPackage {
  const unsigned = { ...proofPackage, originalProofHash: "" };
  return {
    ...proofPackage,
    originalProofHash: computeBlindPolicyProofHash(unsigned),
  };
}

describe("blind policy proof verifier", () => {
  it("sample Groth16 proof verifies with snarkjs", async () => {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const snarkjs = require("snarkjs") as {
      groth16: {
        verify: (verificationKey: unknown, publicSignals: unknown, proof: unknown) => Promise<boolean>;
      };
    };
    const verified = await snarkjs.groth16.verify(
      readJson("zk/setup/private_dao_blind_policy_overlay_vkey.json"),
      readJson("zk/proofs/private_dao_blind_policy_overlay.public.json"),
      readJson("zk/proofs/private_dao_blind_policy_overlay.proof.json"),
    );

    assert.equal(verified, true);
  });

  it("same blind policy proof package recomputes the same hash", () => {
    const proofPackage = buildDemoBlindPolicyProofPackage(readGroth16ProofFixture());
    const recomputedHash = computeBlindPolicyProofHash(proofPackage);

    assert.equal(recomputedHash, proofPackage.originalProofHash);
  });

  it("demo blind policy proof verifies successfully", () => {
    const proofPackage = buildDemoBlindPolicyProofPackage(readGroth16ProofFixture());
    const verification = verifyBlindPolicyProofPackage(proofPackage);

    assert.equal(verification.ok, true);
    assert.equal(verification.status, "verified");
    assert.equal(verification.match, true);
  });

  it("proof package exposes verifier material without exposing private inputs", () => {
    const proofPackage = buildDemoBlindPolicyProofPackage(readGroth16ProofFixture());

    assert.isString(proofPackage.nonce);
    assert.isString(proofPackage.issuedAt);
    assert.isString(proofPackage.expiresAt);
    assert.equal(proofPackage.circuitId, "private_dao_blind_policy_overlay");
    assert.equal(proofPackage.circuitVersion, "groth16-v1");
    assert.equal(proofPackage.policyVersion, defaultBlindPolicyRules.policyVersion);
    assert.equal(proofPackage.verificationKeyHash, proofPackage.groth16Proof.verificationKeyHash);
    assert.equal(proofPackage.verifierInputs.provingSystem, "groth16");
    assert.equal(proofPackage.verifierInputs.verificationCommand, "snarkjs groth16 verify");
    assert.isString(proofPackage.groth16Proof.verificationKeyHash);
    assert.isObject(proofPackage.groth16Proof.verificationKey);
    assert.isArray(proofPackage.groth16Proof.publicSignals);
    assert.isObject(proofPackage.groth16Proof.proof);
    assert.equal(proofPackage.providerLanes.find((lane) => lane.id === "zk-policy-proof")?.evidenceClass, "groth16-verified");
    assert.equal(proofPackage.providerLanes.find((lane) => lane.id === "refhe-encrypted-evaluation")?.status, "committed");
    assert.equal(proofPackage.providerLanes.find((lane) => lane.id === "ika-encrypt-2pc-boundary")?.status, "committed");
  });

  it("modified policySatisfied fails verification", () => {
    const proofPackage = buildDemoBlindPolicyProofPackage(readGroth16ProofFixture());
    const verification = verifyBlindPolicyProofPackage({
      ...proofPackage,
      policySatisfied: false,
    });

    assert.equal(verification.ok, false);
    assert.equal(verification.status, "invalid-proof-package");
  });

  it("modified public check fails verification", () => {
    const proofPackage = buildDemoBlindPolicyProofPackage(readGroth16ProofFixture());
    const verification = verifyBlindPolicyProofPackage({
      ...proofPackage,
      publicChecks: proofPackage.publicChecks.map((check) =>
        check.id === "capacity" ? { ...check, label: "Changed capacity check" } : check,
      ),
    });

    assert.equal(verification.ok, false);
    assert.equal(verification.status, "mismatch");
    assert.notEqual(verification.originalHash, verification.recomputedHash);
  });

  it("tampered receipt fails with mismatch", () => {
    const proofPackage = buildDemoBlindPolicyProofPackage(readGroth16ProofFixture());
    const verification = verifyBlindPolicyProofPackage({
      ...proofPackage,
      decision: "Changed decision",
    });

    assert.equal(verification.ok, false);
    assert.equal(verification.status, "mismatch");
    assert.equal(verification.match, false);
    assert.notEqual(verification.originalHash, verification.recomputedHash);
  });

  it("expired proof fails verification", () => {
    const proofPackage = buildBlindPolicyProofPackage({
      proofId: "expired-proof",
      issuedAt: "2020-01-01T00:00:00.000Z",
      expiresAt: "2020-01-02T00:00:00.000Z",
      privateInputs: sampleBlindPolicyInputs,
      groth16Proof: readGroth16ProofFixture(),
    });
    const verification = verifyBlindPolicyProofPackage(proofPackage);

    assert.equal(verification.ok, false);
    assert.equal(verification.status, "expired-proof");
  });

  it("unsupported circuitVersion fails verification", () => {
    const proofPackage = buildDemoBlindPolicyProofPackage(readGroth16ProofFixture());
    const unsupported = resignProofPackage({
      ...proofPackage,
      circuitVersion: "groth16-v999" as "groth16-v1",
    });
    const verification = verifyBlindPolicyProofPackage(unsupported);

    assert.equal(verification.ok, false);
    assert.equal(verification.status, "unsupported-circuit-version");
  });

  it("policyCommitment changes when policyVersion changes", () => {
    const proof = readGroth16ProofFixture();
    const v1 = buildBlindPolicyProofPackage({
      privateInputs: sampleBlindPolicyInputs,
      rules: { policyVersion: "2026-06-25.private-credit-capacity.v1" },
      groth16Proof: proof,
    });
    const v2 = buildBlindPolicyProofPackage({
      privateInputs: sampleBlindPolicyInputs,
      rules: { policyVersion: "2026-06-25.private-credit-capacity.v2" },
      groth16Proof: proof,
    });

    assert.notEqual(v1.policyCommitment, v2.policyCommitment);
    assert.notEqual(v1.originalProofHash, v2.originalProofHash);
  });

  it("modified provider lane fails verification", () => {
    const proofPackage = buildDemoBlindPolicyProofPackage(readGroth16ProofFixture());
    const verification = verifyBlindPolicyProofPackage({
      ...proofPackage,
      providerLanes: proofPackage.providerLanes.map((lane) =>
        lane.id === "zk-policy-proof" ? { ...lane, publicCommitment: "f".repeat(64) } : lane,
      ),
    });

    assert.equal(verification.ok, false);
    assert.equal(verification.status, "mismatch");
  });

  it("missing originalProofHash fails safely", () => {
    const proofPackage = buildDemoBlindPolicyProofPackage(readGroth16ProofFixture());
    const verification = verifyBlindPolicyProofPackage({
      ...proofPackage,
      originalProofHash: "",
    });

    assert.equal(verification.ok, false);
    assert.equal(verification.status, "missing-original-proof-hash");
    assert.equal(verification.match, false);
  });

  it("unsatisfied policy does not issue proof", () => {
    assert.throws(
      () =>
        buildBlindPolicyProofPackage({
          privateInputs: {
            ...sampleBlindPolicyInputs,
            membershipVerified: false,
          },
          groth16Proof: readGroth16ProofFixture(),
        }),
      /Policy proof was not issued|Membership is not verified/,
    );
  });

  it("zero private records do not issue proof", () => {
    assert.throws(
      () =>
        buildBlindPolicyProofPackage({
          privateInputs: {
            ...sampleBlindPolicyInputs,
            records: [],
          },
          groth16Proof: readGroth16ProofFixture(),
        }),
      /At least one private record is required/,
    );
  });

  it("private policy inputs are not exposed in the public proof package", () => {
    const proofPackage = buildDemoBlindPolicyProofPackage(readGroth16ProofFixture());
    const serialized = JSON.stringify(proofPackage).toLowerCase();

    assert.notInclude(serialized, sampleBlindPolicyInputs.subjectId.toLowerCase());
    assert.notInclude(serialized, "customer-redacted");
    assert.notInclude(serialized, "amountusd");
    assert.notInclude(serialized, "liabilitiesusd");
    assert.notInclude(serialized, "risk_score");
    assert.notInclude(serialized, "minaverageamountusd");
    assert.notInclude(serialized, "maxliabilitybps");
  });
});
