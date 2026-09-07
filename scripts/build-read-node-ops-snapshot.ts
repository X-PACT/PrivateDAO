// SPDX-License-Identifier: AGPL-3.0-or-later
import fs from "fs";
import path from "path";
import { PrivateDaoReadNode } from "./lib/read-node";

async function main() {
  const readNode = new PrivateDaoReadNode();
  const [runtime, proposals] = await Promise.all([
    readNode.getRuntimeSnapshot(false),
    readNode.fetchProposals({ force: false }),
  ]);
  const profiles = readNode.getLoadProfiles();
  const overview = {
    generatedAt: new Date().toISOString(),
    proposals: proposals.length,
    uniqueDaos: new Set(proposals.map((proposal) => proposal.dao)).size,
    zkEnforced: proposals.filter((proposal) => proposal.zkMode === "ZkEnforced").length,
    confidentialPayouts: proposals.filter((proposal) => Boolean(proposal.confidentialPayoutPlan)).length,
    magicblockConfigured: proposals.filter((proposal) => Boolean(proposal.magicblockCorridor)).length,
    magicblockSettled: proposals.filter((proposal) => proposal.magicblockCorridor?.status === "Settled").length,
    refheConfigured: proposals.filter((proposal) => Boolean(proposal.refheEnvelope)).length,
    refheSettled: proposals.filter((proposal) => proposal.refheEnvelope?.status === "Settled").length,
    refheWithVerifier: proposals.filter((proposal) => Boolean(proposal.refheEnvelope?.verifierProgram)).length,
    executableConfidential: proposals.filter(
      (proposal) => Boolean(proposal.confidentialPayoutPlan) && proposal.phase === "Executable",
    ).length,
  };

  const payload = {
    generatedAt: new Date().toISOString(),
    readPath: "backend-indexer",
    runtime,
    overview,
    profiles,
    deployment: {
      sameDomainRecommended: true,
      guide: "docs/read-node/same-domain-deploy.md",
      readApiPath: "/api/v1",
    },
    operatorChecks: [
      "curl /healthz",
      "curl /api/v1/runtime",
      "curl /api/v1/ops/overview",
      "curl /api/v1/ops/snapshot",
      "curl /api/v1/devnet/profiles",
      "curl /api/v1/metrics",
    ],
  };

  const jsonPath = path.resolve("docs/read-node/ops.generated.json");
  const mdPath = path.resolve("docs/read-node/ops.generated.md");
  fs.writeFileSync(jsonPath, JSON.stringify(payload, null, 2) + "\n");
  fs.writeFileSync(
    mdPath,
    `# Read Node Ops Snapshot

- Generated at: \`${payload.generatedAt}\`
- Read path: \`${payload.readPath}\`
- RPC endpoint: \`${runtime.rpcEndpoint}\`
- RPC pool size: \`${runtime.rpcPoolSize}\`
- Program ID: \`${runtime.programId}\`
- Same-domain recommended: \`${payload.deployment.sameDomainRecommended}\`
- Read API path: \`${payload.deployment.readApiPath}\`

## Backend Coverage

- proposals: \`${overview.proposals}\`
- unique DAOs: \`${overview.uniqueDaos}\`
- zk-enforced proposals: \`${overview.zkEnforced}\`
- confidential payout proposals: \`${overview.confidentialPayouts}\`
- REFHE configured: \`${overview.refheConfigured}\`
- REFHE settled: \`${overview.refheSettled}\`
- REFHE with verifier binding: \`${overview.refheWithVerifier}\`
- executable confidential proposals: \`${overview.executableConfidential}\`

## Supported Devnet Profiles

${profiles.map((profile) => `- \`${profile.name}\` | wallets=\`${profile.walletCount}\` | waves=\`${profile.waveCount}\` | wave-size=\`${profile.waveSize}\` | negative=\`${profile.negativeScenarios.join(", ")}\``).join("\n")}

## Operator Checks

${payload.operatorChecks.map((check) => `- \`${check}\``).join("\n")}

## Deployment Guide

- \`${payload.deployment.guide}\`
`,
  );

  console.log(`Wrote read-node ops snapshot: ${path.relative(process.cwd(), jsonPath)}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
