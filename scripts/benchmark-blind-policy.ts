// SPDX-License-Identifier: AGPL-3.0-or-later
import { performance } from "perf_hooks";
import { createRequire } from "module";
import path from "path";
import { createHash } from "crypto";
import { readFileSync } from "fs";

import {
  buildDemoBlindPolicyProofPackage,
  computeBlindPolicyProofHash,
  verifyBlindPolicyProofPackage,
  type BlindPolicyGroth16Proof,
} from "../apps/web/src/lib/blind-policy-proof";

const requireFromRoot = createRequire(path.resolve(process.cwd(), "package.json"));

function readJson<T>(relativePath: string): T {
  return requireFromRoot(path.resolve(process.cwd(), relativePath)) as T;
}

function hashFile(relativePath: string): string {
  return createHash("sha256").update(readFileSync(path.resolve(process.cwd(), relativePath))).digest("hex");
}

async function main() {
  const runs = Number(process.env.PRIVATE_DAO_BENCHMARK_RUNS || 25);
  const snarkjs = requireFromRoot("snarkjs") as {
    groth16: {
      verify: (vkey: unknown, publicSignals: unknown, proof: unknown) => Promise<boolean>;
    };
  };
  const proofPath = "zk/proofs/private_dao_blind_policy_overlay.proof.json";
  const publicSignalsPath = "zk/proofs/private_dao_blind_policy_overlay.public.json";
  const verificationKeyPath = "zk/setup/private_dao_blind_policy_overlay_vkey.json";
  const verificationKey = readJson(verificationKeyPath);
  const groth16Proof: BlindPolicyGroth16Proof = {
    provingSystem: "groth16",
    circuit: "private_dao_blind_policy_overlay",
    proof: readJson(proofPath),
    publicSignals: readJson(publicSignalsPath),
    verificationKey,
    verificationMode: "groth16-snarkjs",
    verified: true,
    proofHash: hashFile(proofPath),
    publicSignalsHash: hashFile(publicSignalsPath),
    verificationKeyHash: hashFile(verificationKeyPath),
  };

  const packageStart = performance.now();
  const proofPackage = buildDemoBlindPolicyProofPackage(groth16Proof);
  const packageMs = performance.now() - packageStart;

  const hashDurations: number[] = [];
  const localVerifyDurations: number[] = [];
  const groth16Durations: number[] = [];

  for (let index = 0; index < runs; index += 1) {
    const hashStart = performance.now();
    computeBlindPolicyProofHash(proofPackage);
    hashDurations.push(performance.now() - hashStart);

    const localVerifyStart = performance.now();
    verifyBlindPolicyProofPackage(proofPackage);
    localVerifyDurations.push(performance.now() - localVerifyStart);

    const groth16Start = performance.now();
    const verified = await snarkjs.groth16.verify(verificationKey, groth16Proof.publicSignals, groth16Proof.proof);
    groth16Durations.push(performance.now() - groth16Start);
    if (!verified) throw new Error("Groth16 fixture verification failed.");
  }

  const summarize = (values: number[]) => {
    const sorted = [...values].sort((a, b) => a - b);
    const avg = values.reduce((sum, value) => sum + value, 0) / values.length;
    const p95 = sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * 0.95))];
    return {
      avgMs: Number(avg.toFixed(2)),
      p95Ms: Number(p95.toFixed(2)),
      maxMs: Number(sorted[sorted.length - 1].toFixed(2)),
    };
  };

  const groth16 = summarize(groth16Durations);
  const maxProofsPerSecond = groth16.avgMs > 0 ? Number((1000 / groth16.avgMs).toFixed(2)) : null;

  console.log(
    JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        runs,
        environment: {
          node: process.version,
          platform: process.platform,
          arch: process.arch,
        },
        proofPackageBuild: {
          ms: Number(packageMs.toFixed(2)),
          note: "Builds the public proof package from the existing Groth16 fixture and policy commitments.",
        },
        proofHashRecompute: summarize(hashDurations),
        localReceiptVerification: summarize(localVerifyDurations),
        groth16Verification: groth16,
        maxProofsPerSecondEstimate: maxProofsPerSecond,
        truthBoundary:
          "This benchmark measures package creation, hash recomputation, local receipt verification, and Groth16 verification over the checked-in proof fixture. It does not benchmark full witness generation.",
      },
      null,
      2,
    ),
  );
  process.exit(0);
}

void main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
