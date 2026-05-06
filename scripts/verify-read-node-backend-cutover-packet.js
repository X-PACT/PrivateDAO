"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
function assert(condition, message) {
    if (!condition)
        throw new Error(message);
}
function main() {
    const jsonPath = path_1.default.resolve("docs/read-node/backend-cutover-packet.generated.json");
    const mdPath = path_1.default.resolve("docs/read-node/backend-cutover-packet.generated.md");
    assert(fs_1.default.existsSync(jsonPath), "missing read-node backend cutover packet json");
    assert(fs_1.default.existsSync(mdPath), "missing read-node backend cutover packet markdown");
    const packet = JSON.parse(fs_1.default.readFileSync(jsonPath, "utf8"));
    const markdown = fs_1.default.readFileSync(mdPath, "utf8");
    assert(packet.project === "PrivateDAO", "cutover packet project mismatch");
    assert(packet.deploymentTarget.frontendHost === "https://app.privatedao.xyz/", "cutover packet frontend host drifted");
    assert(packet.deploymentTarget.readApiPath === "/api/v1", "cutover packet read API path drifted");
    assert(packet.deploymentTarget.healthPath === "/healthz", "cutover packet health path drifted");
    assert(packet.deploymentTarget.metricsPath === "/api/v1/metrics", "cutover packet metrics path drifted");
    assert(packet.deploymentTarget.sameDomainRecommended === true, "cutover packet same-domain flag drifted");
    assert(packet.publicProof.indexedProposalCount > 0, "cutover packet missing indexed proposals");
    assert(packet.publicProof.uniqueDaos > 0, "cutover packet missing unique DAOs");
    assert(packet.routeBindingStrategy.length >= 4, "cutover packet binding strategy too short");
    assert(packet.uiFallbackPolicy.length >= 4, "cutover packet fallback policy too short");
    assert(packet.buyerPath.includes("/services"), "cutover packet buyer path missing services");
    assert(packet.operatorPath.includes("/command-center"), "cutover packet operator path missing command-center");
    assert(packet.judgePath.includes("/proof/?judge=1"), "cutover packet judge path missing proof");
    assert(packet.linkedDocs.includes("docs/read-node/same-domain-deploy.md"), "cutover packet missing same-domain deploy doc");
    assert(packet.linkedDocs.includes("docs/reviewer-telemetry-packet.generated.md"), "cutover packet missing telemetry packet doc");
    assert(packet.commands.includes("npm run start:read-node"), "cutover packet missing read-node start command");
    assert(packet.commands.includes("npm run verify:read-node-backend-cutover"), "cutover packet missing verify command");
    for (const token of [
        "# Read-Node Backend Cutover Packet",
        "## Deployment Target",
        "## Public Proof",
        "## Route Binding Strategy",
        "## UI Fallback Policy",
        "## Buyer Path",
        "## Operator Path",
        "## Judge Path",
    ]) {
        assert(markdown.includes(token), `cutover packet markdown missing: ${token}`);
    }
    console.log("Read-node backend cutover packet verification: PASS");
}
main();
