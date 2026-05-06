"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
function main() {
    const jsonPath = path_1.default.resolve("docs/monitoring-delivery.generated.json");
    const mdPath = path_1.default.resolve("docs/monitoring-delivery.generated.md");
    if (!fs_1.default.existsSync(jsonPath) || !fs_1.default.existsSync(mdPath)) {
        throw new Error("missing monitoring delivery evidence artifacts");
    }
    const evidence = JSON.parse(fs_1.default.readFileSync(jsonPath, "utf8"));
    const markdown = fs_1.default.readFileSync(mdPath, "utf8");
    assert(evidence.project === "PrivateDAO", "monitoring delivery evidence project mismatch");
    assert(evidence.environment === "mainnet-candidate", "monitoring delivery evidence environment mismatch");
    assert(evidence.summary.ownerCount >= 1, "monitoring delivery evidence missing owners");
    assert(evidence.summary.deliveryRequirementCount >= 1, "monitoring delivery evidence missing delivery requirements");
    assert(evidence.summary.transcriptRequirementCount >= 1, "monitoring delivery evidence missing transcript requirements");
    assert(evidence.commands.includes("npm run build:monitoring-delivery"), "monitoring delivery evidence missing build command");
    assert(evidence.commands.includes("npm run verify:monitoring-delivery"), "monitoring delivery evidence missing verify command");
    assert(markdown.includes("# Monitoring Delivery Evidence"), "monitoring delivery markdown missing title");
    assert(markdown.includes("Claim Boundary"), "monitoring delivery markdown missing claim boundary");
    console.log("Monitoring delivery evidence verification: PASS");
}
function assert(condition, message) {
    if (!condition)
        throw new Error(message);
}
main();
