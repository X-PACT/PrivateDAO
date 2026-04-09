import fs from "fs";
import path from "path";

type Packet = {
  project: string;
  status: string;
  bountyEngine: {
    walletExecutionLayer: string;
    routingRequirement: string;
    currentRepoClaim: string;
  };
  currentLiveProof: {
    governanceExecuted: boolean;
    settlementExecuted: boolean;
    settlementEvidenceConsumed: boolean;
  };
  scopedPolicyExamples: string[];
  requiredNextSteps: string[];
  links: Record<string, string>;
  honestBoundary: {
    zerionForkImplementedInRepo: boolean;
    zerionApiExecutionClaimed: boolean;
    bountySubmissionClaimedComplete: boolean;
  };
};

function main() {
  const jsonPath = path.resolve("docs/zerion-autonomous-executor.generated.json");
  const mdPath = path.resolve("docs/zerion-autonomous-executor.generated.md");
  if (!fs.existsSync(jsonPath) || !fs.existsSync(mdPath)) {
    throw new Error("missing Zerion autonomous executor packet artifacts");
  }

  const packet = JSON.parse(fs.readFileSync(jsonPath, "utf8")) as Packet;
  const markdown = fs.readFileSync(mdPath, "utf8");

  assert(packet.project === "PrivateDAO Autonomous Executor", "autonomous executor packet project mismatch");
  assert(packet.status === "track-adaptation-ready", "autonomous executor packet status mismatch");
  assert(packet.bountyEngine.walletExecutionLayer.includes("Zerion CLI fork"), "wallet execution layer must reference Zerion CLI fork");
  assert(packet.bountyEngine.routingRequirement.includes("Zerion API"), "routing requirement must mention Zerion API");
  assert(packet.currentLiveProof.governanceExecuted === true, "governance proof must show executed flow");
  assert(packet.currentLiveProof.settlementExecuted === true, "settlement proof must show executed flow");
  assert(packet.currentLiveProof.settlementEvidenceConsumed === true, "settlement proof must show consumed evidence");
  assert(packet.scopedPolicyExamples.includes("25 USDC spend cap"), "policy examples must include spend cap");
  assert(packet.requiredNextSteps.includes("fork zeriontech/zerion-ai"), "next steps must include Zerion fork");
  assert(packet.links.canonicalSpec === "docs/zerion-autonomous-executor.md", "canonical spec link mismatch");
  assert(packet.honestBoundary.zerionForkImplementedInRepo === false, "packet must preserve honest boundary for Zerion fork");
  assert(packet.honestBoundary.zerionApiExecutionClaimed === false, "packet must preserve honest boundary for Zerion API execution");
  assert(packet.honestBoundary.bountySubmissionClaimedComplete === false, "packet must preserve honest boundary for bounty completion");

  for (const token of [
    "# Zerion Autonomous Executor Packet",
    "PrivateDAO Autonomous Executor",
    "Zerion CLI fork",
    "Zerion API",
    "25 USDC spend cap",
    "fork zeriontech/zerion-ai",
  ]) {
    assert(markdown.includes(token), `autonomous executor markdown is missing: ${token}`);
  }

  console.log("Zerion autonomous executor verification: PASS");
}

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

main();
