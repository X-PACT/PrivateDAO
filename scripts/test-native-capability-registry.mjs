import assert from "node:assert/strict";
import { buildNativeCapabilityRegistry } from "../packages/privatedao-runtime/src/index.ts";

const entries = buildNativeCapabilityRegistry();
const verified = entries.filter((entry) => entry.status === "testnet_verified");

assert.equal(entries.length, 192, "unexpected native capability matrix size");
assert.equal(verified.length, 3, "only the three Sepolia evidence rows should be verified");
for (const entry of verified) {
  assert.equal(entry.network, "ethereum-sepolia");
  assert.equal(entry.evidence, "testnet-e2e");
  assert.equal(entry.supportsExecution, true);
  assert.equal(entry.supportsReceipt, true);
  assert.equal(entry.supportsMainnet, false);
  assert.ok(entry.lastVerifiedCommit);
  assert.ok(entry.lastVerifiedTimestamp);
}

assert.equal(entries.some((entry) => entry.network === "wormhole-integration"), false, "bridge network must not be present");
console.log(`[native-capability-registry] rows=${entries.length} verified=${verified.length} bridge-free=true`);
