import { readFile, writeFile, mkdir } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { createPublicClient, createWalletClient, encodeFunctionData, http, parseAbi, parseEther, formatEther } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { sepolia } from "viem/chains";

const inbox = "0xaAe29B0366299461418F5324a79Afc425BE5ae21";
const recipient = "0x1c3D6757651B617D7e5c08aE6F7a7F65eEafD75F";
const amount = parseEther(process.env.PDAO_ARBITRUM_BRIDGE_AMOUNT || "0.005");
const sourceRpc = process.env.PDAO_EVM_ETHEREUM_SEPOLIA_RPC_URL || "https://ethereum-sepolia-rpc.publicnode.com";
const destinationRpc = process.env.PDAO_EVM_ARBITRUM_SEPOLIA_RPC_URL || "https://sepolia-rollup.arbitrum.io/rpc";
const rawKey = process.env.PDAO_EVM_DEPLOYER_PRIVATE_KEY?.replace(/^0x/, "");
if (!/^[a-fA-F0-9]{64}$/.test(rawKey || "")) throw new Error("testnet signer is required");
const account = privateKeyToAccount(`0x${rawKey}`);
if (account.address.toLowerCase() !== recipient.toLowerCase()) throw new Error("bridge recipient does not match signer");

const source = createPublicClient({ chain: sepolia, transport: http(sourceRpc, { timeout: 30_000 }) });
const destination = createPublicClient({ chain: { id: 421614, name: "Arbitrum Sepolia", nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 }, rpcUrls: { default: { http: [destinationRpc] } } }, transport: http(destinationRpc, { timeout: 30_000 }) });
const wallet = createWalletClient({ account, chain: sepolia, transport: http(sourceRpc, { timeout: 30_000 }) });
const abi = parseAbi(["function depositEth() payable"]);
const journalDir = path.join(os.homedir(), ".privatedao-secret-vault");
const journalPath = path.join(journalDir, "arbitrum-sepolia-bridge-e2e.json");
await mkdir(journalDir, { recursive: true, mode: 0o700 });
let journal;
try { journal = JSON.parse(await readFile(journalPath, "utf8")); } catch (error) { if (error.code !== "ENOENT") throw error; }
if (journal && journal.sender.toLowerCase() !== account.address.toLowerCase()) throw new Error("bridge journal signer mismatch");
const before = await destination.getBalance({ address: account.address });
let sourceHash = journal?.sourceHash;
if (!sourceHash) {
  const chainId = await source.getChainId();
  if (chainId !== 11155111) throw new Error(`unexpected source chain ${chainId}`);
  if ((await source.getCode({ address: inbox })) === "0x") throw new Error("official Arbitrum Sepolia inbox has no code");
  const request = await wallet.prepareTransactionRequest({ account, to: inbox, data: encodeFunctionData({ abi, functionName: "depositEth" }), value: amount });
  await source.simulateContract({ account, address: inbox, abi, functionName: "depositEth", value: amount });
  const balance = await source.getBalance({ address: account.address });
  if (balance < amount + (request.gas ?? 0n) * (request.maxFeePerGas ?? request.gasPrice ?? 0n)) throw new Error("insufficient Sepolia ETH for bridge");
  sourceHash = await wallet.writeContract({ account, address: inbox, abi, functionName: "depositEth", value: amount, gas: request.gas });
  journal = { schema: "privatedao.arbitrum-bridge-e2e.v1", sender: account.address, recipient: account.address, amountWei: amount.toString(), sourceHash, createdAt: new Date().toISOString() };
  await writeFile(journalPath, `${JSON.stringify(journal, null, 2)}\n`, { mode: 0o600 });
}
const sourceReceipt = await source.waitForTransactionReceipt({ hash: sourceHash, timeout: 180_000 });
if (sourceReceipt.status !== "success") throw new Error("Arbitrum bridge source receipt reverted");
const deadline = Date.now() + 12 * 60 * 1000;
let after = before;
while (Date.now() < deadline) {
  after = await destination.getBalance({ address: account.address });
  if (after >= before + amount) break;
  await new Promise((resolve) => setTimeout(resolve, 10_000));
}
if (after < before + amount) throw new Error("Arbitrum Sepolia destination balance was not credited before timeout");
journal.destinationBalanceBefore = before.toString();
journal.destinationBalanceAfter = after.toString();
journal.sourceBlock = sourceReceipt.blockNumber.toString();
journal.state = "destination_confirmed";
await writeFile(journalPath, `${JSON.stringify(journal, null, 2)}\n`, { mode: 0o600 });
console.log(JSON.stringify({ state: journal.state, sourceHash, sourceBlock: journal.sourceBlock, amountWei: amount.toString(), destinationBalanceBefore: formatEther(before), destinationBalanceAfter: formatEther(after), inbox }));
