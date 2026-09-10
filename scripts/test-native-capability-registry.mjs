import assert from "node:assert/strict";
import { buildNativeCapabilityRegistry } from "../packages/privatedao-runtime/src/index.ts";

const entries = buildNativeCapabilityRegistry();
const verified = entries.filter((entry) => entry.status === "testnet_verified");
const liveAgents = entries.filter((entry) => entry.status === "mainnet_live");
const verifiedPayroll = entries.filter((entry) => entry.status === "devnet_verified");

assert.equal(entries.length, 192, "unexpected native capability matrix size");
assert.equal(verified.length, 6, "only the three Sepolia and three Tempo evidence rows should be verified");
assert.equal(liveAgents.length, 2, "only the two live Agent Exchange rows should be mainnet live");
assert.equal(verifiedPayroll.length, 3, "only the three Payroll Devnet evidence rows should be verified");
for (const entry of verifiedPayroll) {
  assert.equal(entry.product, "payroll");
  assert.equal(entry.network, "solana-devnet");
  assert.equal(entry.evidence, "devnet-e2e");
  assert.equal(entry.supportsExecution, true);
  assert.equal(entry.supportsReceipt, true);
  assert.equal(entry.supportsMainnet, false);
  assert.equal(entry.lastVerifiedCommit, "9479374");
}
for (const entry of liveAgents) {
  assert.equal(entry.product, "agent");
  assert.equal(entry.network, "solana-mainnet-beta");
  assert.equal(entry.evidence, "runtime-only");
  assert.equal(entry.supportsMainnet, true);
}
for (const entry of verified) {
  assert.equal(entry.evidence, "testnet-e2e");
  assert.equal(entry.supportsExecution, true);
  assert.equal(entry.supportsReceipt, true);
  assert.equal(entry.supportsMainnet, false);
  assert.ok(entry.lastVerifiedCommit);
  assert.ok(entry.lastVerifiedTimestamp);
}
for (const entry of verified.filter((candidate) => candidate.network === "tempo-testnet")) {
  assert.ok(["blind-verification", "record-verification"].includes(entry.product));
  assert.equal(entry.provider, "evm-tempo-testnet");
  assert.equal(entry.chainId, "42431");
  assert.equal(entry.supportsMainnet, false);
  assert.equal(entry.lastVerifiedCommit, "01c868c");
}
assert.equal(verified.filter((entry) => entry.network === "tempo-testnet").length, 3, "Tempo must have three verified verification rows");

assert.equal(entries.some((entry) => entry.network === "wormhole-integration"), false, "bridge network must not be present");
console.log(`[native-capability-registry] rows=${entries.length} verified=${verified.length} bridge-free=true`);
