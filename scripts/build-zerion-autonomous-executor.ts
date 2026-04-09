import fs from "fs";
import path from "path";

type ProofV3 = {
  generatedAt: string;
  programId: string;
  governanceV3: {
    dao: string;
    proposal: string;
    transactions: Record<string, string>;
    invariants: {
      status: string;
      isExecuted: boolean;
    };
  };
  settlementV3: {
    dao: string;
    proposal: string;
    transactions: Record<string, string>;
    invariants: {
      status: string;
      isExecuted: boolean;
      evidenceStatus: string;
      evidenceConsumed: boolean;
    };
  };
};

const PROOF_V3_PATH = path.resolve("docs/test-wallet-live-proof-v3.generated.json");
const OUTPUT_JSON = path.resolve("docs/zerion-autonomous-executor.generated.json");
const OUTPUT_MD = path.resolve("docs/zerion-autonomous-executor.generated.md");

function main() {
  const liveProof = JSON.parse(fs.readFileSync(PROOF_V3_PATH, "utf8")) as ProofV3;

  const payload = {
    project: "PrivateDAO Autonomous Executor",
    generatedAt: new Date().toISOString(),
    status: "track-adaptation-ready",
    bountyEngine: {
      walletExecutionLayer: "Zerion CLI fork (pending implementation)",
      routingRequirement: "All swaps must route through the Zerion API",
      currentRepoClaim: "governance-and-policy-layer-ready",
    },
    submissionFlow: [
      "Create DAO",
      "Submit proposal",
      "Private vote",
      "Execute treasury",
    ],
    interfaces: [
      "PrivateDAO web app",
      "Zerion CLI fork",
      "Telegram/Discord/web wrapper (optional)",
    ],
    currentLiveProof: {
      programId: liveProof.programId,
      governanceV3Dao: liveProof.governanceV3.dao,
      governanceV3Proposal: liveProof.governanceV3.proposal,
      governanceExecuteTx: liveProof.governanceV3.transactions.execute,
      governanceExecuted: liveProof.governanceV3.invariants.isExecuted,
      settlementV3Dao: liveProof.settlementV3.dao,
      settlementV3Proposal: liveProof.settlementV3.proposal,
      settlementExecuteTx: liveProof.settlementV3.transactions.executeV3,
      settlementExecuted: liveProof.settlementV3.invariants.isExecuted,
      settlementEvidenceStatus: liveProof.settlementV3.invariants.evidenceStatus,
      settlementEvidenceConsumed: liveProof.settlementV3.invariants.evidenceConsumed,
    },
    scopedPolicyExamples: [
      "Base-only swap execution",
      "25 USDC spend cap",
      "30-minute execution expiry",
      "swap-only allowlist",
      "single execution per approved proposal",
    ],
    bountyCompliance: [
      {
        requirement: "Fork Zerion CLI",
        currentStatus: "pending implementation",
        repoTruth: "Canonical adaptation spec and packet exist; live fork is not claimed complete in this repo.",
      },
      {
        requirement: "Autonomous agent surface",
        currentStatus: "governance-and-policy layer ready",
        repoTruth: "PrivateDAO already supplies private approval, scoped policy, and execution-readiness surfaces.",
      },
      {
        requirement: "At least one scoped policy",
        currentStatus: "ready",
        repoTruth: "Chain lock, spend cap, expiry, allowlist, and single-execution scope are already modeled in the product surface.",
      },
      {
        requirement: "At least one real onchain transaction",
        currentStatus: "ready on PrivateDAO side",
        repoTruth: "Live V3 Devnet proof already shows real treasury execution and consumed settlement evidence.",
      },
      {
        requirement: "Zerion-routed execution",
        currentStatus: "pending implementation",
        repoTruth: "Must be completed in the Zerion fork and then anchored back into the reviewer packet.",
      },
      {
        requirement: "Demo quality",
        currentStatus: "ready to adapt",
        repoTruth: "Pitch deck, demo brief, and frontend section already carry the Autonomous Executor narrative.",
      },
    ],
    technologyMapping: {
      zk: "private vote integrity and review-strengthening layer",
      refhe: "encrypted strategy and confidential evaluation layer",
      magicblock: "runtime and settlement evidence layer for Solana-side operations",
      rpcFast: "proposal monitoring, diagnostics, and reviewer-visible read reliability",
    },
    requiredNextSteps: [
      "fork zeriontech/zerion-ai",
      "build proposal-to-execution bridge",
      "map proposal policy snapshot into Zerion-scoped policy",
      "execute one real Zerion-routed transaction",
      "record Zerion execution receipt back into the reviewer packet",
    ],
    links: {
      canonicalSpec: "docs/zerion-autonomous-executor.md",
      pitchDeck: "docs/investor-pitch-deck.md",
      demoBrief: "docs/demo-video.md",
      liveProofV3: "docs/test-wallet-live-proof-v3.generated.md",
      frontierIntegrations: "docs/frontier-integrations.generated.md",
    },
    honestBoundary: {
      zerionForkImplementedInRepo: false,
      zerionApiExecutionClaimed: false,
      bountySubmissionClaimedComplete: false,
      currentTruth: "PrivateDAO already proves the governance, privacy, policy, and runtime-evidence layers required to act as the governance brain for a Zerion-routed autonomous executor.",
    },
  };

  fs.writeFileSync(OUTPUT_JSON, JSON.stringify(payload, null, 2) + "\n");
  fs.writeFileSync(OUTPUT_MD, buildMarkdown(payload));
  console.log(`Wrote ${path.relative(process.cwd(), OUTPUT_MD)}`);
}

function buildMarkdown(payload: {
  project: string;
  generatedAt: string;
  status: string;
  bountyEngine: {
    walletExecutionLayer: string;
    routingRequirement: string;
    currentRepoClaim: string;
  };
  submissionFlow: string[];
  interfaces: string[];
  currentLiveProof: {
    programId: string;
    governanceV3Dao: string;
    governanceV3Proposal: string;
    governanceExecuteTx: string;
    governanceExecuted: boolean;
    settlementV3Dao: string;
    settlementV3Proposal: string;
    settlementExecuteTx: string;
    settlementExecuted: boolean;
    settlementEvidenceStatus: string;
    settlementEvidenceConsumed: boolean;
  };
  scopedPolicyExamples: string[];
  bountyCompliance: Array<{
    requirement: string;
    currentStatus: string;
    repoTruth: string;
  }>;
  technologyMapping: Record<string, string>;
  requiredNextSteps: string[];
  links: Record<string, string>;
  honestBoundary: {
    zerionForkImplementedInRepo: boolean;
    zerionApiExecutionClaimed: boolean;
    bountySubmissionClaimedComplete: boolean;
    currentTruth: string;
  };
}) {
  return `# Zerion Autonomous Executor Packet

## Overview

- project: \`${payload.project}\`
- generated at: \`${payload.generatedAt}\`
- status: \`${payload.status}\`
- wallet execution layer: \`${payload.bountyEngine.walletExecutionLayer}\`
- routing requirement: \`${payload.bountyEngine.routingRequirement}\`
- current repo claim: \`${payload.bountyEngine.currentRepoClaim}\`

## Submission flow

${payload.submissionFlow.map((entry, index) => `${index + 1}. ${entry}`).join("\n")}

## Interfaces

${payload.interfaces.map((entry) => `- ${entry}`).join("\n")}

## Current live proof from this repository

- program id: \`${payload.currentLiveProof.programId}\`
- governance V3 DAO: \`${payload.currentLiveProof.governanceV3Dao}\`
- governance V3 proposal: \`${payload.currentLiveProof.governanceV3Proposal}\`
- governance execute tx: \`${payload.currentLiveProof.governanceExecuteTx}\`
- governance executed: \`${payload.currentLiveProof.governanceExecuted}\`
- settlement V3 DAO: \`${payload.currentLiveProof.settlementV3Dao}\`
- settlement V3 proposal: \`${payload.currentLiveProof.settlementV3Proposal}\`
- settlement execute tx: \`${payload.currentLiveProof.settlementExecuteTx}\`
- settlement executed: \`${payload.currentLiveProof.settlementExecuted}\`
- settlement evidence status: \`${payload.currentLiveProof.settlementEvidenceStatus}\`
- settlement evidence consumed: \`${payload.currentLiveProof.settlementEvidenceConsumed}\`

## Scoped policy examples

${payload.scopedPolicyExamples.map((entry) => `- ${entry}`).join("\n")}

## Bounty compliance matrix

${payload.bountyCompliance.map((entry) => `- ${entry.requirement}: \`${entry.currentStatus}\` — ${entry.repoTruth}`).join("\n")}

## Technology mapping

${Object.entries(payload.technologyMapping).map(([key, value]) => `- \`${key}\`: ${value}`).join("\n")}

## Required next steps

${payload.requiredNextSteps.map((entry, index) => `${index + 1}. ${entry}`).join("\n")}

## Canonical links

${Object.entries(payload.links).map(([key, value]) => `- \`${key}\`: \`${value}\``).join("\n")}

## Honest boundary

- Zerion fork implemented in this repo: \`${payload.honestBoundary.zerionForkImplementedInRepo}\`
- Zerion API execution claimed: \`${payload.honestBoundary.zerionApiExecutionClaimed}\`
- bounty submission claimed complete: \`${payload.honestBoundary.bountySubmissionClaimedComplete}\`

${payload.honestBoundary.currentTruth}
`;
}

main();
