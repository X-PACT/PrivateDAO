import fs from "fs";
import path from "path";

type Evidence = {
  project: string;
  environment: string;
  status: string;
  summary: {
    ownerCount: number;
    ownerAssignedCount: number;
    deliveryRequirementCount: number;
    closedRequirementCount: number;
    transcriptRequirementCount: number;
    criticalRuleCount: number;
    highRuleCount: number;
  };
  owners: Array<{ role: string; scope: string; status: string }>;
  deliveryRequirements: Array<{ label: string; status: string; evidence: string }>;
  transcriptRequirements: string[];
  claimBoundary: string;
  commands: string[];
};

function main() {
  const jsonPath = path.resolve("docs/monitoring-delivery.generated.json");
  const mdPath = path.resolve("docs/monitoring-delivery.generated.md");

  if (!fs.existsSync(jsonPath) || !fs.existsSync(mdPath)) {
    throw new Error("missing monitoring delivery evidence artifacts");
  }

  const evidence = JSON.parse(fs.readFileSync(jsonPath, "utf8")) as Evidence;
  const markdown = fs.readFileSync(mdPath, "utf8");

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

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

main();
