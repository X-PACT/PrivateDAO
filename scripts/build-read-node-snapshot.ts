// SPDX-License-Identifier: AGPL-3.0-or-later
import fs from "fs";
import path from "path";
import { PrivateDaoReadNode } from "./lib/read-node";

async function main() {
  const readNode = new PrivateDaoReadNode();
  const [runtime, proposals] = await Promise.all([
    readNode.getRuntimeSnapshot(true),
    readNode.fetchProposals({ force: true }),
  ]);

  const counts = {
    proposals: proposals.length,
    executed: proposals.filter((proposal) => proposal.phase === "Executed").length,
    executable: proposals.filter((proposal) => proposal.phase === "Executable").length,
    timelocked: proposals.filter((proposal) => proposal.phase === "Timelocked").length,
    zkEnforced: proposals.filter((proposal) => proposal.zkMode === "ZkEnforced").length,
    confidentialPayouts: proposals.filter((proposal) => Boolean(proposal.confidentialPayoutPlan)).length,
    uniqueDaos: new Set(proposals.map((proposal) => proposal.dao)).size,
  };

  const payload = {
    generatedAt: new Date().toISOString(),
    readPath: "backend-indexer",
    runtime,
    cache: readNode.cacheStats(),
    counts,
    sample: proposals.slice(0, 5).map((proposal) => ({
      pubkey: proposal.pubkey,
      title: proposal.title,
      phase: proposal.phase,
      zkMode: proposal.zkMode,
      confidentialPayout: Boolean(proposal.confidentialPayoutPlan),
      dao: proposal.dao,
    })),
  };

  const jsonPath = path.resolve("docs/read-node-snapshot.generated.json");
  const mdPath = path.resolve("docs/read-node-snapshot.generated.md");

  fs.writeFileSync(jsonPath, JSON.stringify(payload, null, 2) + "\n");
  fs.writeFileSync(
    mdPath,
    `# Read Node Snapshot

- Generated at: \`${payload.generatedAt}\`
- Read path: \`${payload.readPath}\`
- RPC endpoint: \`${runtime.rpcEndpoint}\`
- RPC pool size: \`${runtime.rpcPoolSize}\`
- Cache entries: \`${payload.cache.entryCount}\`
- Cache TTL ms: \`${payload.cache.ttlMs}\`
- Program ID: \`${runtime.programId}\`
- Slot: \`${runtime.slot}\`
- Solana core: \`${runtime.solanaCore}\`
- Feature set: \`${runtime.featureSet}\`

## Proposal Coverage

- Proposals indexed: \`${counts.proposals}\`
- Unique DAOs: \`${counts.uniqueDaos}\`
- Executed proposals: \`${counts.executed}\`
- Executable proposals: \`${counts.executable}\`
- Timelocked proposals: \`${counts.timelocked}\`
- ZK-enforced proposals: \`${counts.zkEnforced}\`
- Confidential payout proposals: \`${counts.confidentialPayouts}\`

## Sample

${payload.sample.map((proposal) => `- \`${proposal.title}\` | phase=\`${proposal.phase}\` | zk=\`${proposal.zkMode}\` | payout=\`${proposal.confidentialPayout}\` | dao=\`${proposal.dao}\``).join("\n")}
`,
  );

  console.log(`Wrote read-node snapshot: ${path.relative(process.cwd(), jsonPath)}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
