// SPDX-License-Identifier: AGPL-3.0-or-later
import { PrivateDaoReadNode } from "./lib/read-node";

async function main() {
  const readNode = new PrivateDaoReadNode();
  const runtime = await readNode.getRuntimeSnapshot();
  const proposals = await readNode.fetchProposals();

  if (runtime.readPath !== "backend-indexer") {
    throw new Error("Read node runtime did not report backend-indexer mode");
  }

  if (!runtime.programId) {
    throw new Error("Read node runtime is missing program id");
  }

  if (!Array.isArray(proposals)) {
    throw new Error("Read node proposals payload is not an array");
  }

  console.log(`Read node verification: PASS (proposals=${proposals.length}, endpoint=${runtime.rpcEndpoint})`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
