"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const child_process_1 = require("child_process");
function main() {
    const jsonPath = path_1.default.resolve("docs/devnet-rehearsal-multisig.json");
    const markdownPath = path_1.default.resolve("docs/devnet-rehearsal-multisig.md");
    const payload = JSON.parse(fs_1.default.readFileSync(jsonPath, "utf8"));
    const markdown = fs_1.default.readFileSync(markdownPath, "utf8");
    if (payload.schemaVersion !== 1)
        throw new Error("unexpected devnet rehearsal schemaVersion");
    if (payload.project !== "PrivateDAO")
        throw new Error("unexpected project in devnet rehearsal multisig");
    if (payload.network !== "devnet")
        throw new Error("devnet rehearsal multisig must target devnet");
    if (payload.status !== "created")
        throw new Error("devnet rehearsal multisig status must be created");
    if (payload.multisig.requiredThreshold !== 2)
        throw new Error("rehearsal threshold must be 2");
    if (payload.multisig.requiredSignerCount !== 3)
        throw new Error("rehearsal signer count must be 3");
    if (payload.signers.length !== 3)
        throw new Error("rehearsal signer set must contain 3 signers");
    const displayRaw = (0, child_process_1.execFileSync)("spl-token", ["--program-2022", "--url", "devnet", "display", payload.multisig.address, "--output", "json-compact"], { encoding: "utf8" });
    const display = JSON.parse(displayRaw);
    if (display.address !== payload.multisig.address)
        throw new Error("multisig address mismatch");
    if (!display.isInitialized)
        throw new Error("multisig is not initialized");
    if (display.numRequiredSigners !== payload.multisig.requiredThreshold)
        throw new Error("required signer threshold mismatch");
    if (display.numValidSigners !== payload.multisig.requiredSignerCount)
        throw new Error("valid signer count mismatch");
    const expectedSigners = payload.signers.map((signer) => signer.publicKey).sort();
    const actualSigners = [...display.signers].sort();
    if (JSON.stringify(expectedSigners) !== JSON.stringify(actualSigners)) {
        throw new Error("multisig signer set mismatch");
    }
    const normalizedMarkdown = markdown.replace(/\r\n/g, "\n");
    if (!normalizedMarkdown.includes(payload.multisig.address))
        throw new Error("markdown missing multisig address");
    if (!normalizedMarkdown.includes(payload.multisig.creationSignature))
        throw new Error("markdown missing creation signature");
    if (!normalizedMarkdown.includes("2-of-3"))
        throw new Error("markdown missing threshold wording");
    if (!normalizedMarkdown.includes("does not close mainnet custody"))
        throw new Error("markdown missing production boundary");
    console.log(`Devnet rehearsal multisig verification: PASS (${payload.multisig.address}, ${payload.multisig.requiredThreshold}-of-${payload.multisig.requiredSignerCount})`);
}
main();
