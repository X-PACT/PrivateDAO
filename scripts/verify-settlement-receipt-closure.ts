import fs from "fs";
import path from "path";

type Evidence = {
  project: string;
  status: string;
  summary: {
    requirementCount: number;
    closedRequirementCount: number;
    supportingArtifactCount: number;
  };
  closureRequirements: Array<{ label: string; status: string; evidence: string }>;
  supportingArtifacts: string[];
  commands: string[];
};

function main() {
  const jsonPath = path.resolve("docs/settlement-receipt-closure.generated.json");
  const mdPath = path.resolve("docs/settlement-receipt-closure.generated.md");

  if (!fs.existsSync(jsonPath) || !fs.existsSync(mdPath)) {
    throw new Error("missing settlement receipt closure artifacts");
  }

  const evidence = JSON.parse(fs.readFileSync(jsonPath, "utf8")) as Evidence;
  const markdown = fs.readFileSync(mdPath, "utf8");

  assert(evidence.project === "PrivateDAO", "settlement receipt closure project mismatch");
  assert(evidence.summary.requirementCount >= 1, "settlement receipt closure missing requirements");
  assert(evidence.summary.supportingArtifactCount >= 1, "settlement receipt closure missing supporting artifacts");
  assert(evidence.commands.includes("npm run build:settlement-receipt-closure"), "settlement receipt closure missing build command");
  assert(evidence.commands.includes("npm run verify:settlement-receipt-closure"), "settlement receipt closure missing verify command");
  assert(markdown.includes("# Settlement Receipt Closure Evidence"), "settlement receipt closure markdown missing title");

  console.log("Settlement receipt closure evidence verification: PASS");
}

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

main();
