// SPDX-License-Identifier: AGPL-3.0-or-later
import fs from "fs";
import path from "path";

function main() {
  const json = JSON.parse(fs.readFileSync(path.resolve("docs/read-node-snapshot.generated.json"), "utf8"));
  const markdown = fs.readFileSync(path.resolve("docs/read-node-snapshot.generated.md"), "utf8");

  if (json.readPath !== "backend-indexer") {
    throw new Error("read-node snapshot path mismatch");
  }

  if (!json.runtime?.programId) {
    throw new Error("read-node snapshot missing runtime program id");
  }

  if (typeof json.counts?.proposals !== "number") {
    throw new Error("read-node snapshot missing proposal counts");
  }

  if (!markdown.includes("# Read Node Snapshot")) {
    throw new Error("read-node markdown snapshot heading mismatch");
  }

  if (!markdown.includes("Confidential payout proposals")) {
    throw new Error("read-node markdown snapshot missing confidential payout coverage");
  }

  console.log("Read-node snapshot verification: PASS");
}

main();
