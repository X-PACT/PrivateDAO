import assert from "node:assert/strict";
import { buildNativeCapabilityRegistry } from "../packages/privatedao-runtime/src/index.ts";

const entries = buildNativeCapabilityRegistry();
const verified = entries.filter((entry) => entry.status === "testnet_verified");
const liveAgents = entries.filter((entry) => entry.status === "mainnet_live" && entry.product === "agent");
const verifiedPayroll = entries.filter((entry) => entry.status === "devnet_verified");

assert.equal(entries.length, 192, "unexpected native capability matrix size");
assert.equal(verified.length, 14, "only the six verification and eight organizational testnet evidence rows should be verified");
assert.equal(liveAgents.length, 2, "the two live Agent Exchange rows must be runtime-verified");
assert.equal(verifiedPayroll.length, 3, "only the three Payroll Devnet evidence rows should be verified");
for (const entry of verifiedPayroll) {
  assert.equal(entry.product, "payroll");
  assert.equal(entry.network, "solana-devnet");
  assert.equal(entry.evidence, "devnet-e2e");
  assert.equal(entry.supportsExecution, true);
  assert.equal(entry.supportsReceipt, true);
  assert.equal(entry.supportsMainnet, false);
  assert.equal(entry.lastVerifiedCommit, "adcb3ae");
}
for (const entry of liveAgents) {
  assert.equal(entry.product, "agent");
  assert.equal(entry.network, "solana-mainnet-beta");
  assert.equal(entry.evidence, "runtime-only");
  assert.equal(entry.supportsExecution, true);
  assert.equal(entry.supportsMainnet, true);
  assert.equal(entry.lastVerifiedCommit, null);
  assert.ok(entry.lastVerifiedTimestamp);
}
for (const entry of verified) {
  assert.equal(entry.evidence, "testnet-e2e");
  assert.equal(entry.supportsExecution, true);
  assert.equal(entry.supportsReceipt, true);
  assert.equal(entry.supportsMainnet, false);
  assert.ok(entry.lastVerifiedCommit);
  assert.ok(entry.lastVerifiedTimestamp);
}
for (const entry of verified.filter((candidate) => candidate.network === "tempo-testnet" && candidate.provider === "evm-tempo-testnet")) {
  assert.ok(["blind-verification", "record-verification"].includes(entry.product));
  assert.equal(entry.provider, "evm-tempo-testnet");
  assert.equal(entry.chainId, "42431");
  assert.equal(entry.supportsMainnet, false);
  assert.equal(entry.lastVerifiedCommit, "7b4d430");
}
assert.equal(verified.filter((entry) => entry.network === "tempo-testnet" && entry.provider === "evm-tempo-testnet").length, 3, "Tempo must have three verified verification rows");
assert.equal(verified.filter((entry) => entry.provider === "evm-ethereum-sepolia-organizational").length, 4, "Ethereum organizational evidence must cover treasury, governance, and auction lanes");
assert.equal(verified.filter((entry) => entry.provider === "evm-tempo-testnet-organizational").length, 4, "Tempo organizational evidence must cover treasury, governance, and auction lanes");
assert.equal(entries.find((entry) => entry.network === "tempo-testnet" && entry.product === "treasury")?.nativeAsset, "USD", "Tempo native asset must match the EVM adapter configuration");

assert.equal(entries.some((entry) => entry.network === "wormhole-integration"), false, "bridge network must not be present");
console.log(`[native-capability-registry] rows=${entries.length} verified=${verified.length} bridge-free=true`);
