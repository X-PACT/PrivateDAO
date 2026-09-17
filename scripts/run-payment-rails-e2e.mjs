import { readFile, writeFile, mkdir, rename, rmdir } from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import { randomBytes } from "node:crypto";
import assert from "node:assert/strict";
import { createPublicClient, createWalletClient, http, keccak256, parseEther } from "viem";
import { privateKeyToAccount, generatePrivateKey } from "viem/accounts";
import { sepolia, baseSepolia, tempoModerato } from "viem/chains";
import { createClient as createTempoClient } from "viem/tempo";
import { buildTempoPaymentBatch, reconcileTempoPayments, buildBaseTestnetDeposit, baseDepositDestinationHash, reconcileBaseDeposit, TEMPO_PAYMENT_TOKEN } from "../packages/privatedao-runtime/src/payment-rails.ts";

const rail = process.argv[2];
if (!["tempo", "base-bridge"].includes(rail)) throw new Error("Choose tempo or base-bridge");
if (process.env.PDAO_TESTNET_PAYMENTS_EXECUTE !== "1") throw new Error("Explicit testnet execution flag required");
const key = process.env.PDAO_EVM_DEPLOYER_PRIVATE_KEY?.replace(/^0x/, "");
if (!/^[a-fA-F0-9]{64}$/.test(key || "")) throw new Error("Testnet signing key required");
const account = privateKeyToAccount(`0x${key}`);
const directory = path.join(os.homedir(), ".privatedao-secrets/payment-rail-runs");
await mkdir(directory, { recursive: true, mode: 0o700 });
const journalPath = path.join(directory, `${rail}.json`);
const lockPath = `${journalPath}.lock`;
await mkdir(lockPath, { mode: 0o700 });
const stringify = (value) => JSON.stringify(value, (_, item) => typeof item === "bigint" ? item.toString() : item, 2);
let journal;
async function save() {
  await writeFile(`${journalPath}.tmp`, stringify(journal), { mode: 0o600 });
  await rename(`${journalPath}.tmp`, journalPath);
}
try {
  try { journal = JSON.parse(await readFile(journalPath, "utf8")); }
  catch (error) { if (error.code !== "ENOENT") throw error; }
  if (journal && journal.sender !== account.address) throw new Error("Journal wallet mismatch");
  if (!journal) {
    journal = { schema: "privatedao.payment-rail-run.v1", rail, sender: account.address, createdAt: new Date().toISOString(), reference: `0x${randomBytes(32).toString("hex")}` };
    if (rail === "tempo") journal.recipientKeys = Array.from({ length: 3 }, () => generatePrivateKey());
    await save();
  }
  const transport = (url) => http(url, { timeout: 20000, retryCount: 1 });
  const source = rail === "tempo"
    ? createTempoClient({ account, chain: tempoModerato.extend({ feeToken: TEMPO_PAYMENT_TOKEN }), transport: transport("https://rpc.moderato.tempo.xyz") })
    : createPublicClient({ chain: sepolia, transport: transport("https://ethereum-sepolia-rpc.publicnode.com") });
  const signer = rail === "tempo" ? source : createWalletClient({ account, chain: sepolia, transport: transport("https://ethereum-sepolia-rpc.publicnode.com") });
  const chainId = await source.getChainId();
  assert.equal(chainId, rail === "tempo" ? 42431 : 11155111);
  const destination = rail === "base-bridge" ? createPublicClient({ chain: baseSepolia, transport: transport("https://sepolia.base.org") }) : null;
  if (destination) assert.equal(await destination.getChainId(), 84532);
  const batch = rail === "tempo" ? buildTempoPaymentBatch({ chainId, sender: account.address, batchReference: journal.reference, maxTotal: 3n, lines: journal.recipientKeys.map((recipientKey, index) => ({ reference: keccak256(`0x${(index + 1).toString(16).padStart(64, "0")}${journal.reference.slice(2)}`), recipient: privateKeyToAccount(recipientKey).address, amount: 1n })) }) : null;
  const deposit = rail === "base-bridge" ? buildBaseTestnetDeposit({ sourceChainId: chainId, destinationChainId: 84532, recipient: account.address, amount: parseEther("0.001"), maxAmount: parseEther("0.001") }) : null;
  if (process.argv.includes("--retry-reverted") && journal.sourceHash) {
    const previous = await source.getTransactionReceipt({ hash: journal.sourceHash });
    assert.equal(previous.status, "reverted", "Retry requires a confirmed revert; pending or successful deposits must not be repeated");
    journal.failedAttempts = [...(journal.failedAttempts || []), { hash: journal.sourceHash, block: previous.blockNumber.toString(), status: "reverted" }];
    delete journal.signedTransaction;
    delete journal.sourceHash;
    journal.state = "retry_confirmed_revert";
    await save();
  }
  if (!journal.signedTransaction) {
    if (deposit) {
      assert.notEqual(await source.getCode({ address: deposit.to }), "0x");
      const code = await destination.getCode({ address: account.address });
      assert.ok(!code || code === "0x", "Bridge recipient must be an EOA");
    }
    const request = await signer.prepareTransactionRequest(batch
      ? { account, calls: batch.calls, feeToken: TEMPO_PAYMENT_TOKEN }
      : { account, to: deposit.to, data: deposit.data, value: deposit.value });
    if (deposit) {
      // Portal resource metering changes across blocks; bound a gas margin before signing.
      request.gas = request.gas * 3n / 2n + 20000n;
      const maximumFee = request.gas * (request.maxFeePerGas ?? request.gasPrice);
      assert.ok(maximumFee <= parseEther("0.001"), "Bridge gas exceeds test budget");
      assert.ok(await source.getBalance({ address: account.address }) >= deposit.value + maximumFee, "Insufficient source balance");
    }
    journal.signedTransaction = await signer.signTransaction(request);
    journal.sourceHash = keccak256(journal.signedTransaction);
    journal.state = "signed";
    await save();
  }
  // Resume by transaction hash; never rebuild or re-sign an uncertain transaction.
  let receipt;
  try { receipt = await source.getTransactionReceipt({ hash: journal.sourceHash }); }
  catch (error) { if (error.name !== "TransactionReceiptNotFoundError") throw error; }
  if (!receipt) {
    try { await source.sendRawTransaction({ serializedTransaction: journal.signedTransaction }); }
    catch { console.log("Broadcast uncertain; tracking the persisted hash without creating a new payment"); }
    receipt = await source.waitForTransactionReceipt({ hash: journal.sourceHash, timeout: 180000 });
  }
  assert.equal(receipt.status, "success");
  journal.state = "source_confirmed";
  await save();
  let evidence;
  if (batch) evidence = reconcileTempoPayments(batch, chainId, receipt);
  else {
    const transaction = await source.getTransaction({ hash: journal.sourceHash });
    assert.equal(transaction.to?.toLowerCase(), deposit.to.toLowerCase());
    assert.equal(transaction.from.toLowerCase(), account.address.toLowerCase());
    assert.equal(transaction.input, deposit.data);
    assert.equal(transaction.value, deposit.value);
    journal.destinationHash = baseDepositDestinationHash(receipt);
    await save();
    console.log(JSON.stringify({ state: "source_confirmed", sourceHash: journal.sourceHash, destinationHash: journal.destinationHash }));
    const received = await destination.waitForTransactionReceipt({ hash: journal.destinationHash, timeout: 600000 });
    assert.equal(received.status, "success");
    const destinationTx = await destination.getTransaction({ hash: journal.destinationHash });
    assert.equal(destinationTx.to?.toLowerCase(), account.address.toLowerCase());
    assert.equal(destinationTx.value, deposit.value);
    evidence = reconcileBaseDeposit({ deposit, sender: account.address, sourceChainId: chainId, destinationChainId: await destination.getChainId(), sourceReceipt: receipt, destinationReceipt: received, sourceTransaction: transaction, destinationTransaction: destinationTx });
  }
  const publicEvidence = { schema: "privatedao.payment-rail-evidence.v1", internalTest: true, environment: "testnet", rail, verifiedAt: new Date().toISOString(), failedAttempts: journal.failedAttempts || [], ...evidence };
  await writeFile(`packages/evm-verification/deployments/payment-rail-${rail}.json`, stringify(publicEvidence));
  journal.state = "complete";
  await save();
  console.log(stringify(publicEvidence));
} catch (error) {
  // RPC errors can contain serialized requests; print only the error class.
  console.error(JSON.stringify({ rail, state: journal?.state || "preflight", error: error.name }));
  process.exitCode = 1;
} finally {
  await rmdir(lockPath);
}
