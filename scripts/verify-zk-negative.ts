import fs from "fs";
import os from "os";
import path from "path";
import { execFileSync } from "child_process";

const CIRCUITS = [
  "private_dao_vote_overlay",
  "private_dao_delegation_overlay",
  "private_dao_tally_overlay",
] as const;

function main() {
  for (const circuit of CIRCUITS) {
    assertTamperedPublicSignalsFail(circuit);
  }

  console.log("ZK negative verification: PASS");
}

function assertTamperedPublicSignalsFail(circuit: (typeof CIRCUITS)[number]) {
  const verificationKey = path.resolve(`zk/setup/${circuit}_vkey.json`);
  const publicSignalsPath = path.resolve(`zk/proofs/${circuit}.public.json`);
  const proofPath = path.resolve(`zk/proofs/${circuit}.proof.json`);
  const tampered = JSON.parse(fs.readFileSync(publicSignalsPath, "utf8")) as string[];
  tampered[0] = (BigInt(tampered[0]) + 1n).toString();

  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), `${circuit}-tamper-`));
  const tamperedPath = path.join(tmpDir, `${circuit}.public.tampered.json`);
  fs.writeFileSync(tamperedPath, JSON.stringify(tampered, null, 2) + "\n");

  try {
    execFileSync("npx", ["snarkjs", "groth16", "verify", verificationKey, tamperedPath, proofPath], {
      stdio: "pipe",
    });
    throw new Error(`tampered public signals unexpectedly verified for ${circuit}`);
  } catch (error: any) {
    const combined = `${error.stdout || ""}${error.stderr || ""}`;
    if (combined.includes("OK!")) {
      throw new Error(`tampered public signals unexpectedly verified for ${circuit}`);
    }
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
}

main();
