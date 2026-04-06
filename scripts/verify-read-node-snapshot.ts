// SPDX-License-Identifier: AGPL-3.0-or-later
import fs from "fs";
import path from "path";

function main() {
  const json = JSON.parse(fs.readFileSync(path.resolve("docs/read-node/snapshot.generated.json"), "utf8"));
  const markdown = fs.readFileSync(path.resolve("docs/read-node/snapshot.generated.md"), "utf8");

  if (json.readPath !== "backend-indexer") {
    throw new Error("read-node snapshot path mismatch");
  }

  if (!json.runtime?.programId) {
    throw new Error("read-node snapshot missing runtime program id");
  }

  if (typeof json.counts?.proposals !== "number") {
    throw new Error("read-node snapshot missing proposal counts");
  }

  if (typeof json.overview?.refheConfigured !== "number") {
    throw new Error("read-node snapshot missing REFHE overview");
  }

  const profile350 = Array.isArray(json.profiles) ? json.profiles.find((profile: any) => profile.name === "350") : null;
  if (!profile350 || profile350.waveCount !== 7 || profile350.waveSize !== 50) {
    throw new Error("read-node snapshot missing 350-wave profile");
  }

  if (!markdown.includes("# Read Node Snapshot")) {
    throw new Error("read-node markdown snapshot heading mismatch");
  }

  if (!markdown.includes("Confidential payout proposals")) {
    throw new Error("read-node markdown snapshot missing confidential payout coverage");
  }

  if (!markdown.includes("REFHE-configured proposals")) {
    throw new Error("read-node markdown snapshot missing REFHE coverage");
  }

  if (!markdown.includes("Devnet Load Profiles")) {
    throw new Error("read-node markdown snapshot missing devnet load profile section");
  }

  console.log("Read-node snapshot verification: PASS");
}

main();
