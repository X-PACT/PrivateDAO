import assert from "node:assert/strict";
import {
  DeploymentRegistry,
  EVM_NETWORK_CONFIGS,
  EvmAdapterError,
  EvmNetworkAdapter,
} from "../packages/privatedao-runtime/src/index.ts";

const config = EVM_NETWORK_CONFIGS.find((entry) => entry.network === "ethereum-sepolia");
assert.ok(config);
assert.equal(config.environment, "testnet");
assert.equal(config.chainId, "11155111");
assert.ok(EVM_NETWORK_CONFIGS.every((entry) => entry.mainnetEnabled === false));
assert.equal(EVM_NETWORK_CONFIGS.filter((entry) => entry.environment === "mainnet").length, 6);

let mode = "ok";
const transport = {
  async health() {
    if (mode === "timeout") throw new Error("RPC request timed out");
    return { ok: true, chainId: "11155111", latencyMs: 4 };
  },
  async prepare(intent) {
    return { executionId: intent.context.requestId, intent, unsignedPayload: { to: "0xabc" }, requiredSigners: [], state: "prepared" };
  },
  async submit(execution) { return { executionId: execution.executionId, signatures: ["0xreceipt"] }; },
  async status(executionId) { return { executionId, state: "confirmed" }; },
  async receipt(executionId) {
    if (mode === "malformed-receipt") return { executionId, requestId: executionId, capability: "verification.record.create", network: "ethereum-sepolia", state: "confirmed", signatures: [], createdAt: new Date().toISOString() };
    return { executionId, requestId: executionId, capability: "verification.record.create", network: "ethereum-sepolia", chainId: "11155111", state: "confirmed", signatures: ["0xreceipt"], createdAt: new Date().toISOString() };
  },
  async estimateFee(intent) { return { network: intent.context.network, atomicAmount: "21000", asset: "ETH" }; },
};

const adapter = new EvmNetworkAdapter({
  id: "evm-ethereum-sepolia-test",
  config,
  capabilities: ["verification.record.create"],
  transport,
});

const intent = {
  context: { requestId: "evm-foundation-1", idempotencyKey: "evm-foundation-1", product: "record-verification", capability: "verification.record.create", network: "ethereum-sepolia" },
  payload: {},
  accounts: [],
};
const prepared = await adapter.prepare(intent);
assert.equal(prepared.state, "prepared");
assert.equal((await adapter.submit(prepared, prepared.unsignedPayload)).signatures.length, 1);
assert.equal((await adapter.status(prepared.executionId)).state, "confirmed");
assert.equal((await adapter.receipt(prepared.executionId)).chainId, "11155111");
assert.equal((await adapter.estimateFee(intent)).asset, "ETH");
assert.equal((await adapter.health()).chainId, "11155111");

await assert.rejects(() => adapter.prepare({ ...intent, context: { ...intent.context, network: "base-sepolia" } }), (error) => error instanceof EvmAdapterError && error.code === "NETWORK_MISMATCH");
mode = "timeout";
await assert.rejects(() => adapter.health(), (error) => error instanceof EvmAdapterError && error.code === "RPC_TIMEOUT");
mode = "malformed-receipt";
await assert.rejects(() => adapter.receipt(prepared.executionId), (error) => error instanceof EvmAdapterError && error.code === "MALFORMED_RECEIPT");
assert.throws(() => new EvmNetworkAdapter({ id: "mainnet-disabled", config: EVM_NETWORK_CONFIGS.find((entry) => entry.network === "ethereum-mainnet"), capabilities: ["verification.record.create"], transport }), /Mainnet execution is disabled/);

const deployments = new DeploymentRegistry();
deployments.register({ product: "record-verification", network: "ethereum-sepolia", environment: "testnet", chainId: "11155111", explorerVerified: false, buildReference: "test", status: "testnet" });
assert.throws(() => deployments.register({ product: "record-verification", network: "ethereum-mainnet", environment: "mainnet", chainId: "1", explorerVerified: false, buildReference: "test", status: "mainnet_live" }), /explicit release gate/);
assert.throws(() => deployments.register({ product: "record-verification", network: "ethereum-sepolia", environment: "testnet", chainId: "11155111", explorerVerified: false, buildReference: "test", status: "testnet" }), /already registered/);

console.log("[evm-foundation] config, lifecycle, wrong-chain, RPC timeout, receipt, deployment, and Mainnet gate checks passed");
