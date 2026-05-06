"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
function readJson(relativePath) {
    return JSON.parse(fs_1.default.readFileSync(path_1.default.resolve(relativePath), "utf8"));
}
function main() {
    const snapshot = readJson("docs/read-node/snapshot.generated.json");
    const ops = readJson("docs/read-node/ops.generated.json");
    const telemetry = readJson("docs/reviewer-telemetry-packet.generated.json");
    const payload = {
        project: "PrivateDAO",
        generatedAt: new Date().toISOString(),
        activationState: "Indexed governance reads and runtime evidence are live in the product, but same-domain backend serving is still pending a dedicated host and reverse proxy outside GitHub Pages.",
        exactBoundary: "Do not claim `/api/v1` as live on the current public site until the read node is hosted behind a real domain or subdomain with health, metrics, and reverse-proxy evidence.",
        deploymentTarget: {
            frontendHost: "https://app.privatedao.xyz/",
            readApiPath: ops.deployment.readApiPath,
            healthPath: "/healthz",
            metricsPath: "/api/v1/metrics",
            sameDomainRecommended: ops.deployment.sameDomainRecommended,
        },
        publicProof: {
            indexedProposalCount: snapshot.counts.proposals,
            uniqueDaos: snapshot.counts.uniqueDaos,
            confidentialPayouts: snapshot.counts.confidentialPayouts,
            refheSettled: snapshot.overview.refheSettled,
            magicblockSettled: snapshot.overview.magicblockSettled,
            telemetryGeneratedAt: telemetry.generatedAt,
        },
        routeBindingStrategy: [
            "Serve the static frontend from a dedicated application host instead of GitHub Pages-only origin.",
            "Reverse-proxy `/api/v1/*` to the read-node process while keeping writes wallet-signed on the client.",
            "Expose `/healthz` and `/api/v1/metrics` publicly for reviewer and operator verification.",
            "Keep all existing reviewer packets and `/documents/*` routes bound to the same truth sources after host cutover.",
        ],
        uiFallbackPolicy: [
            "Until backend cutover is live, keep read-node evidence available through in-app packets and snapshots.",
            "Use static reviewer telemetry, diagnostics, and proof routes as the public truth surfaces on GitHub Pages.",
            "Do not hide the backend hosting gap from buyers, judges, or operators.",
            "After cutover, keep the static routes readable as fallback documentation rather than the primary service rail.",
        ],
        buyerPath: [
            "/services",
            "/documents/reviewer-telemetry-packet",
            "/documents/read-node-backend-cutover",
        ],
        operatorPath: [
            "/command-center",
            "/documents/read-node-ops",
            "/documents/read-node-backend-cutover",
        ],
        judgePath: [
            "/proof/?judge=1",
            "/documents/read-node-snapshot",
            "/documents/read-node-backend-cutover",
        ],
        linkedDocs: [
            "docs/read-node/indexer.md",
            "docs/read-node/snapshot.generated.md",
            "docs/read-node/ops.generated.md",
            "docs/read-node/same-domain-deploy.md",
            "docs/reviewer-telemetry-packet.generated.md",
        ],
        liveRoutes: [
            "https://privatedao.org/services/",
            "https://privatedao.org/command-center/",
            "https://privatedao.org/proof/?judge=1",
            "https://privatedao.org/documents/read-node-snapshot/",
        ],
        commands: [
            "npm run start:read-node",
            "npm run build:read-node-backend-cutover",
            "npm run verify:read-node-backend-cutover",
            "npm run verify:read-node-snapshot",
            "npm run verify:reviewer-telemetry-packet",
        ],
    };
    const markdown = `# Read-Node Backend Cutover Packet

- Generated at: \`${payload.generatedAt}\`
- Activation state: ${payload.activationState}
- Exact boundary: ${payload.exactBoundary}

## Deployment Target

- frontend host: \`${payload.deploymentTarget.frontendHost}\`
- read API path: \`${payload.deploymentTarget.readApiPath}\`
- health path: \`${payload.deploymentTarget.healthPath}\`
- metrics path: \`${payload.deploymentTarget.metricsPath}\`
- same-domain recommended: \`${payload.deploymentTarget.sameDomainRecommended}\`

## Public Proof

- indexed proposals: \`${payload.publicProof.indexedProposalCount}\`
- unique DAOs: \`${payload.publicProof.uniqueDaos}\`
- confidential payouts: \`${payload.publicProof.confidentialPayouts}\`
- REFHE settled: \`${payload.publicProof.refheSettled}\`
- MagicBlock settled: \`${payload.publicProof.magicblockSettled}\`
- telemetry packet generated at: \`${payload.publicProof.telemetryGeneratedAt}\`

## Route Binding Strategy

${payload.routeBindingStrategy.map((item) => `- ${item}`).join("\n")}

## UI Fallback Policy

${payload.uiFallbackPolicy.map((item) => `- ${item}`).join("\n")}

## Buyer Path

${payload.buyerPath.map((item) => `- \`${item}\``).join("\n")}

## Operator Path

${payload.operatorPath.map((item) => `- \`${item}\``).join("\n")}

## Judge Path

${payload.judgePath.map((item) => `- \`${item}\``).join("\n")}

## Linked Docs

${payload.linkedDocs.map((item) => `- \`${item}\``).join("\n")}

## Live Routes

${payload.liveRoutes.map((item) => `- ${item}`).join("\n")}

## Commands

${payload.commands.map((item) => `- \`${item}\``).join("\n")}
`;
    fs_1.default.writeFileSync(path_1.default.resolve("docs/read-node/backend-cutover-packet.generated.json"), `${JSON.stringify(payload, null, 2)}\n`);
    fs_1.default.writeFileSync(path_1.default.resolve("docs/read-node/backend-cutover-packet.generated.md"), `${markdown}\n`);
}
main();
