"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
function main() {
    const jsonPath = path_1.default.resolve("docs/mainnet-proof-package.generated.json");
    const mdPath = path_1.default.resolve("docs/mainnet-proof-package.generated.md");
    if (!fs_1.default.existsSync(jsonPath) || !fs_1.default.existsSync(mdPath)) {
        throw new Error("missing mainnet proof package artifacts");
    }
    const pkg = JSON.parse(fs_1.default.readFileSync(jsonPath, "utf8"));
    const markdown = fs_1.default.readFileSync(mdPath, "utf8");
    assert(pkg.project === "PrivateDAO", "mainnet proof package project mismatch");
    assert(pkg.readinessAnchor.programId === "5AhUsbQ4mJ8Xh7QJEomuS85qGgmK9iNvFqzF669Y7Psx", "mainnet proof package program mismatch");
    assert(pkg.readinessAnchor.verificationWallet === "4Mm5YTRbJuyA8NcWM85wTnx6ZQMXNph2DSnzCCKLhsMD", "mainnet proof package verification wallet mismatch");
    assert(pkg.coreArtifacts.includes("docs/mainnet-acceptance-matrix.generated.md"), "mainnet proof package missing acceptance matrix");
    assert(pkg.coreArtifacts.includes("docs/external-readiness-intake.md"), "mainnet proof package missing external readiness intake");
    assert(pkg.coreArtifacts.includes("docs/operational-evidence.generated.md"), "mainnet proof package missing operational evidence");
    assert(pkg.coreArtifacts.includes("docs/runtime/real-device.generated.md"), "mainnet proof package missing real-device runtime evidence");
    assert(pkg.commands.includes("npm run verify:mainnet-proof-package"), "mainnet proof package missing self verification command");
    assert(pkg.summary.acceptedInRepo >= 5, "mainnet proof package accepted count is unexpectedly low");
    for (const token of [
        "# Mainnet Proof Package",
        "docs/mainnet-readiness.generated.md",
        "docs/mainnet-acceptance-matrix.generated.md",
        "docs/release-drill.generated.md",
        "docs/operational-evidence.generated.md",
        "docs/runtime-evidence.generated.md",
        "docs/runtime/real-device.generated.md",
        "docs/external-readiness-intake.md",
        "npm run verify:mainnet-proof-package",
    ]) {
        assert(markdown.includes(token), `mainnet proof package markdown is missing: ${token}`);
    }
    console.log("Mainnet proof package verification: PASS");
}
function assert(condition, message) {
    if (!condition) {
        throw new Error(message);
    }
}
main();
