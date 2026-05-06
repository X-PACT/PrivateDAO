"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const os_1 = __importDefault(require("os"));
const path_1 = __importDefault(require("path"));
const child_process_1 = require("child_process");
const CIRCUITS = [
    "private_dao_vote_overlay",
    "private_dao_delegation_overlay",
    "private_dao_tally_overlay",
];
function main() {
    for (const circuit of CIRCUITS) {
        assertTamperedPublicSignalsFail(circuit);
        assertTamperedProofFail(circuit);
    }
    console.log("ZK negative verification: PASS");
}
function assertTamperedPublicSignalsFail(circuit) {
    const verificationKey = path_1.default.resolve(`zk/setup/${circuit}_vkey.json`);
    const publicSignalsPath = path_1.default.resolve(`zk/proofs/${circuit}.public.json`);
    const proofPath = path_1.default.resolve(`zk/proofs/${circuit}.proof.json`);
    const tampered = JSON.parse(fs_1.default.readFileSync(publicSignalsPath, "utf8"));
    tampered[0] = (BigInt(tampered[0]) + 1n).toString();
    const tmpDir = fs_1.default.mkdtempSync(path_1.default.join(os_1.default.tmpdir(), `${circuit}-tamper-`));
    const tamperedPath = path_1.default.join(tmpDir, `${circuit}.public.tampered.json`);
    fs_1.default.writeFileSync(tamperedPath, JSON.stringify(tampered, null, 2) + "\n");
    try {
        (0, child_process_1.execFileSync)("npx", ["snarkjs", "groth16", "verify", verificationKey, tamperedPath, proofPath], {
            stdio: "pipe",
        });
        throw new Error(`tampered public signals unexpectedly verified for ${circuit}`);
    }
    catch (error) {
        const combined = `${error.stdout || ""}${error.stderr || ""}`;
        if (combined.includes("OK!")) {
            throw new Error(`tampered public signals unexpectedly verified for ${circuit}`);
        }
    }
    finally {
        fs_1.default.rmSync(tmpDir, { recursive: true, force: true });
    }
}
function assertTamperedProofFail(circuit) {
    const verificationKey = path_1.default.resolve(`zk/setup/${circuit}_vkey.json`);
    const publicSignalsPath = path_1.default.resolve(`zk/proofs/${circuit}.public.json`);
    const proofPath = path_1.default.resolve(`zk/proofs/${circuit}.proof.json`);
    const proof = JSON.parse(fs_1.default.readFileSync(proofPath, "utf8"));
    proof.pi_a[0] = (BigInt(proof.pi_a[0]) + 1n).toString();
    const tmpDir = fs_1.default.mkdtempSync(path_1.default.join(os_1.default.tmpdir(), `${circuit}-proof-tamper-`));
    const tamperedProofPath = path_1.default.join(tmpDir, `${circuit}.proof.tampered.json`);
    fs_1.default.writeFileSync(tamperedProofPath, JSON.stringify(proof, null, 2) + "\n");
    try {
        (0, child_process_1.execFileSync)("npx", ["snarkjs", "groth16", "verify", verificationKey, publicSignalsPath, tamperedProofPath], {
            stdio: "pipe",
        });
        throw new Error(`tampered proof unexpectedly verified for ${circuit}`);
    }
    catch (error) {
        const combined = `${error.stdout || ""}${error.stderr || ""}`;
        if (combined.includes("OK!")) {
            throw new Error(`tampered proof unexpectedly verified for ${circuit}`);
        }
    }
    finally {
        fs_1.default.rmSync(tmpDir, { recursive: true, force: true });
    }
}
main();
