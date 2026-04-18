import fs from "fs";
import path from "path";

type CanonicalProofPacket = {
  project: string;
  status: string;
  productionMainnetClaimAllowed: boolean;
  network: string;
  multisig: {
    threshold: string;
    implementation: string | null;
  };
  observedReadouts: Array<{
    id: string;
    cluster: string;
    status: string;
    address: string;
  }>;
  pendingItems: string[];
  rawSources: Array<{ label: string; href: string }>;
};

function main() {
  const jsonPath = path.resolve("docs/canonical-custody-proof.generated.json");
  const mdPath = path.resolve("docs/canonical-custody-proof.generated.md");

  if (!fs.existsSync(jsonPath) || !fs.existsSync(mdPath)) {
    throw new Error("missing canonical custody proof artifacts");
  }

  const packet = JSON.parse(fs.readFileSync(jsonPath, "utf8")) as CanonicalProofPacket;
  const markdown = fs.readFileSync(mdPath, "utf8");

  assert(packet.project === "PrivateDAO", "canonical custody proof project mismatch");
  assert(packet.status === "pending-external", "canonical custody proof must preserve pending-external until real custody evidence exists");
  assert(packet.productionMainnetClaimAllowed === false, "canonical custody proof must not allow production mainnet claims");
  assert(packet.network === "mainnet-beta", "canonical custody proof must target mainnet-beta");
  assert(packet.multisig.threshold === "2-of-3", "canonical custody proof threshold mismatch");
  assert(
    packet.multisig.implementation === "pending-selection" || packet.multisig.implementation === "Squads Protocol",
    "canonical custody proof implementation boundary drifted",
  );
  assert(packet.pendingItems.includes("multisig public address"), "canonical custody proof must keep multisig address pending");
  assert(packet.pendingItems.includes("program upgrade authority transfer signature"), "canonical custody proof must keep upgrade transfer pending");
  assert(packet.pendingItems.includes("program upgrade authority post-transfer readout reference"), "canonical custody proof must require readout reference");

  const devnetProgram = packet.observedReadouts.find((entry) => entry.id === "devnet-program");
  const mainnetProgram = packet.observedReadouts.find((entry) => entry.id === "mainnet-program");
  assert(devnetProgram?.cluster === "devnet" && devnetProgram.status === "observed", "canonical custody proof missing observed devnet program readout");
  assert(mainnetProgram?.cluster === "mainnet-beta", "canonical custody proof missing target-network program readout");

  assert(
    packet.rawSources.some((entry) => entry.href.endsWith("/docs/canonical-custody-proof.generated.md")),
    "canonical custody proof missing self source link",
  );

  for (const token of [
    "# Canonical Custody Proof",
    "Observed Chain Readouts",
    "Current deployed program readout",
    "Target network program readout",
    "Exact Pending Items",
    "Exact Blocker",
    "multisig public address",
  ]) {
    assert(markdown.includes(token), `canonical custody proof markdown is missing: ${token}`);
  }

  console.log("Canonical custody proof verification: PASS");
}

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

main();
