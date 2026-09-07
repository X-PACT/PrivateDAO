"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
function main() {
    const submission = readJson("docs/submission-registry.json");
    const proof = readJson("docs/proof-registry.json");
    if (submission.programId !== proof.programId) {
        throw new Error("submission/proof registry program id mismatch");
    }
    if (submission.verificationWallet !== proof.verificationWallet) {
        throw new Error("submission/proof registry verification wallet mismatch");
    }
    for (const pkg of ["strategy", "security", "proof", "operations"]) {
        const entries = submission.packages[pkg];
        if (!entries || entries.length === 0) {
            throw new Error(`submission registry package '${pkg}' is empty`);
        }
        for (const entry of entries) {
            if (!fs_1.default.existsSync(path_1.default.resolve(entry))) {
                throw new Error(`submission registry references missing file: ${entry}`);
            }
        }
    }
    if (submission.status.governanceLifecycle !== "verified") {
        throw new Error("submission registry governanceLifecycle status is unexpected");
    }
    console.log("Registry consistency verification: PASS");
}
function readJson(relativePath) {
    return JSON.parse(fs_1.default.readFileSync(path_1.default.resolve(relativePath), "utf8"));
}
main();
