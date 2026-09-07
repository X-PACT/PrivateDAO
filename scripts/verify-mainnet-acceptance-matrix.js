"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
function main() {
    const jsonPath = path_1.default.resolve("docs/mainnet-acceptance-matrix.generated.json");
    const mdPath = path_1.default.resolve("docs/mainnet-acceptance-matrix.generated.md");
    if (!fs_1.default.existsSync(jsonPath) || !fs_1.default.existsSync(mdPath)) {
        throw new Error("missing mainnet acceptance matrix artifacts");
    }
    const matrix = JSON.parse(fs_1.default.readFileSync(jsonPath, "utf8"));
    const markdown = fs_1.default.readFileSync(mdPath, "utf8");
    assert(matrix.project === "PrivateDAO", "acceptance matrix project mismatch");
    assert(matrix.programId === "5AhUsbQ4mJ8Xh7QJEomuS85qGgmK9iNvFqzF669Y7Psx", "acceptance matrix program mismatch");
    assert(matrix.verificationWallet === "4Mm5YTRbJuyA8NcWM85wTnx6ZQMXNph2DSnzCCKLhsMD", "acceptance matrix verification wallet mismatch");
    assert(matrix.summary.acceptedInRepo >= 5, "acceptance matrix accepted count is unexpectedly low");
    assert(matrix.summary.pendingExternal >= 2, "acceptance matrix pending count is unexpectedly low");
    assert(matrix.rows.some((row) => row.layer === "governance-lifecycle" && row.status === "accepted-in-repo"), "acceptance matrix missing governance lifecycle row");
    assert(matrix.rows.some((row) => row.layer === "external-audit" && row.status === "pending-external"), "acceptance matrix missing external audit row");
    assert(matrix.rows.some((row) => row.layer === "real-device-wallet-qa" && row.status === "pending-external"), "acceptance matrix missing real-device QA row");
    assert(matrix.rows.some((row) => row.layer === "strategy-engine-and-live-performance" && row.status === "not-in-repo"), "acceptance matrix missing strategy boundary row");
    for (const token of [
        "# Mainnet Acceptance Matrix",
        "acceptance decision",
        "governance-lifecycle",
        "external-audit",
        "real-device-wallet-qa",
        "docs/external-readiness-intake.md",
        "docs/runtime/real-device.generated.md",
        "docs/operational-evidence.generated.md",
        "docs/runtime-evidence.generated.md",
        "docs/release-drill.generated.md",
    ]) {
        assert(markdown.includes(token), `acceptance matrix markdown is missing: ${token}`);
    }
    console.log("Mainnet acceptance matrix verification: PASS");
}
function assert(condition, message) {
    if (!condition) {
        throw new Error(message);
    }
}
main();
