"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const crypto_1 = __importDefault(require("crypto"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const ENTRIES = [
    { circuit: "private_dao_vote_overlay", layer: "vote" },
    { circuit: "private_dao_delegation_overlay", layer: "delegation" },
    { circuit: "private_dao_tally_overlay", layer: "tally" },
];
function main() {
    const registry = {
        project: "PrivateDAO",
        zkStackVersion: 1,
        provingSystem: "groth16",
        ptau: buildArtifact("zk/setup/pot12_final.ptau"),
        entryCount: ENTRIES.length,
        entries: ENTRIES.map(buildEntry),
    };
    const outPath = path_1.default.resolve("docs/zk-registry.generated.json");
    fs_1.default.writeFileSync(outPath, JSON.stringify(registry, null, 2) + "\n");
    console.log(`Wrote zk registry: ${path_1.default.relative(process.cwd(), outPath)}`);
}
function buildEntry({ circuit, layer }) {
    const publicSignalsPath = `zk/proofs/${circuit}.public.json`;
    const publicSignals = JSON.parse(fs_1.default.readFileSync(path_1.default.resolve(publicSignalsPath), "utf8"));
    const source = `zk/circuits/${circuit}.circom`;
    const sampleInput = `zk/inputs/${circuit}.sample.json`;
    const proof = `zk/proofs/${circuit}.proof.json`;
    const verificationKey = `zk/setup/${circuit}_vkey.json`;
    const provingKey = `zk/setup/${circuit}_final.zkey`;
    const r1cs = `zk/build/${circuit}.r1cs`;
    const wasm = `zk/build/${circuit}_js/${circuit}.wasm`;
    const witness = `zk/proofs/${circuit}.wtns`;
    return {
        circuit,
        layer,
        source,
        sampleInput,
        proof,
        publicSignals: publicSignalsPath,
        verificationKey,
        provingKey,
        r1cs,
        wasm,
        witness,
        publicSignalCount: publicSignals.length,
        commands: {
            build: `npm run zk:build:${layer}`,
            prove: `npm run zk:prove:${layer}`,
            verify: `npm run zk:verify:${layer}`,
        },
        artifacts: {
            source: buildArtifact(source),
            sampleInput: buildArtifact(sampleInput),
            proof: buildArtifact(proof),
            publicSignals: buildArtifact(publicSignalsPath),
            verificationKey: buildArtifact(verificationKey),
            provingKey: buildArtifact(provingKey),
            r1cs: buildArtifact(r1cs),
            wasm: buildArtifact(wasm),
            witness: buildArtifact(witness),
        },
    };
}
function buildArtifact(relativePath) {
    const absolutePath = path_1.default.resolve(relativePath);
    const body = fs_1.default.readFileSync(absolutePath);
    return {
        path: relativePath,
        sha256: crypto_1.default.createHash("sha256").update(body).digest("hex"),
        bytes: body.byteLength,
    };
}
main();
