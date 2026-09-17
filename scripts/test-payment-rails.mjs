import assert from "node:assert/strict";
import { concat, toHex, encodeAbiParameters, encodeEventTopics, decodeFunctionData, parseAbi } from "viem";
import { Abis } from "viem/tempo";
import { buildTempoPaymentBatch, reconcileTempoPayments, buildBaseTestnetDeposit, baseDepositDestinationHash, reconcileBaseDeposit, BASE_DEPOSIT_PORTAL } from "../packages/privatedao-runtime/src/payment-rails.ts";

const sender = `0x${"11".repeat(20)}`;
const recipient = `0x${"22".repeat(20)}`;
const reference = `0x${"33".repeat(32)}`;
const input = { chainId: 42431, sender, batchReference: reference, lines: [{ reference, recipient, amount: 10n }], maxTotal: 10n };
const batch = buildTempoPaymentBatch(input);
const payment = batch.payments[0];
const log = {
  address: batch.token,
  topics: encodeEventTopics({ abi: Abis.tip20, eventName: "TransferWithMemo", args: { from: sender, to: recipient, memo: payment.memo } }),
  data: encodeAbiParameters([{ type: "uint256" }], [10n]),
};
const receipt = { status: "success", from: sender, transactionHash: reference, blockNumber: 1n, logs: [log] };
assert.equal(reconcileTempoPayments(batch, 42431, receipt).count, 1);
assert.equal(decodeFunctionData({ abi: Abis.tip20, data: batch.calls[0].data }).functionName, "transferWithMemo");
for (const change of [{ chainId: 4217 }, { maxTotal: 9n }, { lines: [] }, { lines: [input.lines[0], input.lines[0]] }, { lines: [{ ...input.lines[0], amount: 0n }] }, { lines: [{ ...input.lines[0], reference: "employee-name" }] }]) {
  assert.throws(() => buildTempoPaymentBatch({ ...input, ...change }));
}
for (const change of [{ status: "reverted" }, { from: recipient }, { logs: [] }, { logs: [log, log] }, { logs: [{ ...log, address: recipient }] }, { logs: [{ ...log, data: encodeAbiParameters([{ type: "uint256" }], [11n]) }] }]) {
  assert.throws(() => reconcileTempoPayments(batch, 42431, { ...receipt, ...change }));
}
assert.throws(() => reconcileTempoPayments(batch, 1, receipt));
const changed = buildTempoPaymentBatch({ ...input, lines: [{ ...input.lines[0], amount: 9n }] });
assert.notEqual(changed.payments[0].memo, payment.memo);
const bridge = buildBaseTestnetDeposit({ sourceChainId: 11155111, destinationChainId: 84532, recipient, amount: 1n, maxAmount: 1n });
assert.equal(bridge.to, BASE_DEPOSIT_PORTAL);
assert.equal(bridge.value, 1n);
const decoded = decodeFunctionData({ abi: parseAbi(["function depositTransaction(address,uint256,uint64,bool,bytes) payable"]), data: bridge.data });
assert.deepEqual(decoded.args, [recipient, 1n, 100000n, false, "0x"]);
assert.throws(() => buildBaseTestnetDeposit({ sourceChainId: 1, destinationChainId: 8453, recipient, amount: 1n, maxAmount: 1n }));
assert.throws(() => baseDepositDestinationHash({ ...receipt, to: BASE_DEPOSIT_PORTAL }));
const depositLog = {
  address: BASE_DEPOSIT_PORTAL, blockHash: reference, logIndex: 0,
  topics: encodeEventTopics({ abi: parseAbi(["event TransactionDeposited(address indexed from,address indexed to,uint256 indexed version,bytes opaqueData)"]), eventName: "TransactionDeposited", args: { from: sender, to: recipient, version: 0n } }),
  data: encodeAbiParameters([{ type: "bytes" }], [concat([toHex(1n, { size: 32 }), toHex(1n, { size: 32 }), toHex(100000n, { size: 8 }), "0x00"])]),
};
const sourceReceipt = { ...receipt, to: BASE_DEPOSIT_PORTAL, logs: [depositLog] };
const destinationHash = baseDepositDestinationHash(sourceReceipt);
const bridgeInput = { deposit: bridge, sender, sourceChainId: 11155111, destinationChainId: 84532,
  sourceReceipt, destinationReceipt: { ...receipt, transactionHash: destinationHash },
  sourceTransaction: { hash: reference, from: sender, to: bridge.to, input: bridge.data, value: 1n },
  destinationTransaction: { hash: destinationHash, to: recipient, value: 1n },
};
assert.equal(reconcileBaseDeposit(bridgeInput).state, "destination_confirmed");
for (const change of [{ destinationChainId: 8453 }, { destinationReceipt: { ...bridgeInput.destinationReceipt, status: "reverted" } }, { destinationReceipt: { ...bridgeInput.destinationReceipt, transactionHash: reference } }, { destinationTransaction: { ...bridgeInput.destinationTransaction, value: 2n } }, { destinationTransaction: { ...bridgeInput.destinationTransaction, to: sender } }, { sourceTransaction: { ...bridgeInput.sourceTransaction, input: "0x" } }]) {
  assert.throws(() => reconcileBaseDeposit({ ...bridgeInput, ...change }));
}
console.log("Payment rails: batch encoding, domain binding, budget, duplicate, wrong-chain, altered/missing receipt and mainnet rejection PASS");
