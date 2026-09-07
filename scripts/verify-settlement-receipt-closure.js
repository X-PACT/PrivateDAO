"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
function main() {
    const jsonPath = path_1.default.resolve("docs/settlement-receipt-closure.generated.json");
    const mdPath = path_1.default.resolve("docs/settlement-receipt-closure.generated.md");
    if (!fs_1.default.existsSync(jsonPath) || !fs_1.default.existsSync(mdPath)) {
        throw new Error("missing settlement receipt closure artifacts");
    }
    const evidence = JSON.parse(fs_1.default.readFileSync(jsonPath, "utf8"));
    const markdown = fs_1.default.readFileSync(mdPath, "utf8");
    assert(evidence.project === "PrivateDAO", "settlement receipt closure project mismatch");
    assert(evidence.summary.requirementCount >= 1, "settlement receipt closure missing requirements");
    assert(evidence.summary.supportingArtifactCount >= 1, "settlement receipt closure missing supporting artifacts");
    assert(evidence.commands.includes("npm run build:settlement-receipt-closure"), "settlement receipt closure missing build command");
    assert(evidence.commands.includes("npm run verify:settlement-receipt-closure"), "settlement receipt closure missing verify command");
    assert(markdown.includes("# Settlement Receipt Closure Evidence"), "settlement receipt closure markdown missing title");
    console.log("Settlement receipt closure evidence verification: PASS");
}
function assert(condition, message) {
    if (!condition)
        throw new Error(message);
}
main();
