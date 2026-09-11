import assert from "node:assert/strict";
import {
  ZCASH_NETWORK_CONFIGS,
  ZcashAdapterError,
  ZcashNetworkAdapter,
} from "../packages/privatedao-runtime/src/index.ts";

const config = ZCASH_NETWORK_CONFIGS[0];
assert.equal(config.network, "zcash-testnet");
assert.equal(config.environment, "testnet");
assert.equal(config.nativeAsset, "TAZ");
assert.equal(config.mainnetEnabled, false);

let mode = "ok";
const transport = {
  async health() {
    if (mode === "timeout") throw new Error("RPC request timed out");
    return { ok: true, network: "zcash-testnet", latencyMs: 5 };
  },
  async prepare(intent) {
    return { executionId: intent.context.requestId, intent, unsignedPayload: { raw: "unsigned-zcash-transaction" }, requiredSigners: [], state: "awaiting_signature" };
  },
  async submit(execution) { return { executionId: execution.executionId, signatures: ["zcash-testnet-txid"] }; },
  async status(executionId) { return { executionId, state: "confirmed" }; },
  async receipt(executionId) {
    if (mode === "malformed-receipt") return { executionId, requestId: executionId, capability: "verification.record.create", network: "zcash-testnet", state: "confirmed", signatures: [], createdAt: new Date().toISOString() };
    return { executionId, requestId: executionId, capability: "verification.record.create", network: "zcash-testnet", state: "confirmed", signatures: ["zcash-testnet-txid"], createdAt: new Date().toISOString(), environment: "testnet", asset: "TAZ" };
  },
  async estimateFee(intent) { return { network: intent.context.network, atomicAmount: "10000", asset: "TAZ" }; },
};

const adapter = new ZcashNetworkAdapter({
  id: "zcash-testnet-foundation",
  config,
  capabilities: ["verification.record.create"],
  transport,
});
const intent = {
  context: { requestId: "zcash-foundation-1", idempotencyKey: "zcash-foundation-1", product: "record-verification", capability: "verification.record.create", network: "zcash-testnet" },
  payload: {},
  accounts: [],
};
const prepared = await adapter.prepare(intent);
assert.equal(prepared.state, "awaiting_signature");
assert.equal((await adapter.submit(prepared, prepared.unsignedPayload)).signatures[0], "zcash-testnet-txid");
assert.equal((await adapter.status(prepared.executionId)).state, "confirmed");
assert.equal((await adapter.receipt(prepared.executionId)).network, "zcash-testnet");
assert.equal((await adapter.estimateFee(intent)).asset, "TAZ");
assert.match(adapter.explorerUrl("zcash-testnet-txid"), /explorer\.testnet\.z\.cash\/tx\//);

await assert.rejects(() => adapter.prepare({ ...intent, context: { ...intent.context, network: "ethereum-sepolia" } }), (error) => error instanceof ZcashAdapterError && error.code === "NETWORK_MISMATCH");
mode = "timeout";
await assert.rejects(() => adapter.health(), (error) => error instanceof ZcashAdapterError && error.code === "RPC_TIMEOUT");
mode = "malformed-receipt";
await assert.rejects(() => adapter.receipt(prepared.executionId), (error) => error instanceof ZcashAdapterError && error.code === "MALFORMED_RECEIPT");
assert.throws(() => new ZcashNetworkAdapter({ id: "zcash-mainnet-disabled", config: { ...config, network: "zcash-mainnet", environment: "mainnet", nativeAsset: "ZEC" }, capabilities: ["verification.record.create"], transport }), /Unknown PrivateDAO network|Mainnet execution is disabled/);

console.log("[zcash-foundation] native UTXO adapter, network isolation, timeout, receipt, fee, and Mainnet gate checks passed");
