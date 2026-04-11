import fs from "fs";
import path from "path";

type Packet = {
  project: string;
  deploymentTarget: {
    frontendHost: string;
    readApiPath: string;
    healthPath: string;
    metricsPath: string;
    sameDomainRecommended: boolean;
  };
  publicProof: {
    indexedProposalCount: number;
    uniqueDaos: number;
  };
  routeBindingStrategy: string[];
  uiFallbackPolicy: string[];
  buyerPath: string[];
  operatorPath: string[];
  judgePath: string[];
  linkedDocs: string[];
  liveRoutes: string[];
  commands: string[];
};

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

function main() {
  const jsonPath = path.resolve("docs/read-node/backend-cutover-packet.generated.json");
  const mdPath = path.resolve("docs/read-node/backend-cutover-packet.generated.md");

  assert(fs.existsSync(jsonPath), "missing read-node backend cutover packet json");
  assert(fs.existsSync(mdPath), "missing read-node backend cutover packet markdown");

  const packet = JSON.parse(fs.readFileSync(jsonPath, "utf8")) as Packet;
  const markdown = fs.readFileSync(mdPath, "utf8");

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
