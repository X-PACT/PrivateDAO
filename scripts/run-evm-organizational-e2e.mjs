import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import assert from "node:assert/strict";
import {
  createPublicClient,
  createWalletClient,
  defineChain,
  encodeAbiParameters,
  http,
  keccak256,
  parseAbi,
  parseEther,
  parseUnits,
  zeroHash,
} from "viem";
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";
import { createClient as createTempoClient } from "viem/tempo";
import { tempoModerato } from "viem/chains";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const PACKAGE = path.join(ROOT, "packages/evm-verification");
const TEMPO_FEE_TOKEN = "0x20c0000000000000000000000000000000000001";
const TEMPO_TOKEN_DECIMALS = 6;
const NETWORK = process.env.PDAO_EVM_NETWORK?.trim() || "ethereum-sepolia";
const NETWORK_CONFIG = {
  "ethereum-sepolia": { chainId: 11155111, rpcEnv: "PDAO_EVM_ETHEREUM_SEPOLIA_RPC_URL", currency: { name: "Sepolia Ether", symbol: "ETH", decimals: 18 } },
  "arbitrum-sepolia": { chainId: 421614, rpcEnv: "PDAO_EVM_ARBITRUM_SEPOLIA_RPC_URL", currency: { name: "Arbitrum Sepolia Ether", symbol: "ETH", decimals: 18 } },
  "bnb-testnet": { chainId: 97, rpcEnv: "PDAO_EVM_BNB_TESTNET_RPC_URL", currency: { name: "BNB Testnet", symbol: "tBNB", decimals: 18 } },
  "base-sepolia": { chainId: 84532, rpcEnv: "PDAO_EVM_BASE_SEPOLIA_RPC_URL", currency: { name: "Base Sepolia Ether", symbol: "ETH", decimals: 18 } },
  "robinhood-testnet": { chainId: 46630, rpcEnv: "PDAO_EVM_ROBINHOOD_TESTNET_RPC_URL", currency: { name: "Robinhood Testnet Ether", symbol: "ETH", decimals: 18 } },
  "tempo-testnet": { chainId: 42431, rpcEnv: "PDAO_EVM_TEMPO_TESTNET_RPC_URL", currency: { name: "Tempo Testnet USD", symbol: "USD", decimals: 18 } },
};
const networkConfig = NETWORK_CONFIG[NETWORK];
if (!networkConfig) throw new Error(`Unsupported organizational E2E network: ${NETWORK}. Use a configured testnet only.`);
const CHAIN_ID = networkConfig.chainId;
const RPC_ENV = networkConfig.rpcEnv;
const rawKey = process.env.PDAO_EVM_DEPLOYER_PRIVATE_KEY?.trim();
const deployerKey = rawKey && /^[0-9a-fA-F]{64}$/.test(rawKey) ? `0x${rawKey}` : rawKey;
if (!deployerKey || !/^0x[0-9a-fA-F]{64}$/.test(deployerKey)) throw new Error("PDAO_EVM_DEPLOYER_PRIVATE_KEY is required for Testnet execution.");
const rpcUrl = process.env[RPC_ENV];
if (!rpcUrl || !/^https:\/\//.test(rpcUrl)) throw new Error(`${RPC_ENV} must be an explicit HTTPS RPC URL.`);

const chain = defineChain({
  id: CHAIN_ID,
  name: NETWORK,
  nativeCurrency: networkConfig.currency,
  rpcUrls: { default: { http: [rpcUrl] } },
});
const deployer = privateKeyToAccount(deployerKey);
const rpcTimeoutMs = Number(process.env.PDAO_EVM_RPC_TIMEOUT_MS || 120_000);
if (!Number.isInteger(rpcTimeoutMs) || rpcTimeoutMs < 10_000 || rpcTimeoutMs > 300_000) {
  throw new Error("PDAO_EVM_RPC_TIMEOUT_MS must be an integer between 10000 and 300000.");
}
const transport = http(rpcUrl, { timeout: rpcTimeoutMs, retryCount: 3, retryDelay: 1_000 });
const deployerTempoClient = NETWORK === "tempo-testnet"
  ? createTempoClient({ account: deployer, chain: tempoModerato.extend({ feeToken: TEMPO_FEE_TOKEN }), transport })
  : null;
const publicClient = deployerTempoClient ?? createPublicClient({ chain, transport });
const deployerWallet = deployerTempoClient ?? createWalletClient({ account: deployer, chain, transport });
let checker;
for (let attempt = 0; attempt < 8; attempt += 1) {
  const candidate = privateKeyToAccount(generatePrivateKey());
  const code = await publicClient.getBytecode({ address: candidate.address });
  if (!code || code === "0x") {
    checker = candidate;
    break;
  }
}
if (!checker) throw new Error("Could not allocate a fresh checker EOA without deployed code.");
const checkerTempoClient = NETWORK === "tempo-testnet"
  ? createTempoClient({ account: checker, chain: tempoModerato.extend({ feeToken: TEMPO_FEE_TOKEN }), transport })
  : null;
const checkerWallet = checkerTempoClient ?? createWalletClient({ account: checker, chain, transport });
const tempoTokenMode = NETWORK === "tempo-testnet";
const erc20Abi = parseAbi([
  "function approve(address spender, uint256 amount) returns (bool)",
  "function transfer(address to, uint256 amount) returns (bool)",
  "function transferFrom(address from, address to, uint256 amount) returns (bool)",
  "function balanceOf(address account) view returns (uint256)",
]);

const treasuryAbi = JSON.parse(await readFile(path.join(PACKAGE, `artifacts/${tempoTokenMode ? "PrivateDaoTokenTreasury" : "PrivateDaoTreasury"}.abi`), "utf8"));
const treasuryBytecode = `0x${(await readFile(path.join(PACKAGE, `artifacts/${tempoTokenMode ? "PrivateDaoTokenTreasury" : "PrivateDaoTreasury"}.bin`), "utf8")).trim()}`;
const governanceAbi = JSON.parse(await readFile(path.join(PACKAGE, "artifacts/PrivateDaoGovernance.abi"), "utf8"));
const governanceBytecode = `0x${(await readFile(path.join(PACKAGE, "artifacts/PrivateDaoGovernance.bin"), "utf8")).trim()}`;
const auctionAbi = JSON.parse(await readFile(path.join(PACKAGE, `artifacts/${tempoTokenMode ? "PrivateDaoTokenSealedAuction" : "PrivateDaoSealedAuction"}.abi`), "utf8"));
const auctionBytecode = `0x${(await readFile(path.join(PACKAGE, `artifacts/${tempoTokenMode ? "PrivateDaoTokenSealedAuction" : "PrivateDaoSealedAuction"}.bin`), "utf8")).trim()}`;

const runId = `${Date.now()}-${process.pid}`;
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const tx = async (hash) => {
  const receipt = await publicClient.waitForTransactionReceipt({ hash });
  assert.equal(receipt.status, "success", `transaction reverted: ${hash}`);
  return receipt;
};
const write = async (wallet, address, abi, functionName, args = [], value) => {
  const hash = await wallet.writeContract({ address, abi, functionName, args, ...(value === undefined ? {} : { value }) });
  await tx(hash);
  return hash;
};
const deploy = async (wallet, abi, bytecode, args) => {
  const hash = await wallet.deployContract({ abi, bytecode, args });
  const receipt = await tx(hash);
  assert.ok(receipt.contractAddress, `deployment has no contract address: ${hash}`);
  return { address: receipt.contractAddress, hash, blockNumber: receipt.blockNumber.toString() };
};
const expectRevert = async (operation, label) => {
  try { await operation(); } catch { return; }
  throw new Error(`${label} unexpectedly succeeded`);
};

const observedChainId = await publicClient.getChainId();
assert.equal(observedChainId, CHAIN_ID, "RPC chain mismatch");
const deployerBalance = await publicClient.getBalance({ address: deployer.address });
assert.ok(deployerBalance > parseEther("0.01"), `deployer lacks enough native testnet asset for ${NETWORK} E2E`);

const deployments = {
  network: NETWORK,
  chainId: CHAIN_ID,
  environment: "testnet",
  deployer: deployer.address,
  checker: checker.address,
  createdAt: new Date().toISOString(),
  contracts: {},
  evidence: {},
};

const checkerFundingHash = tempoTokenMode
  ? await write(deployerWallet, TEMPO_FEE_TOKEN, erc20Abi, "transfer", [checker.address, parseUnits("10", TEMPO_TOKEN_DECIMALS)])
  : await deployerWallet.sendTransaction({ to: checker.address, value: parseEther("0.002") });
if (!tempoTokenMode) await tx(checkerFundingHash);

const treasury = await deploy(deployerWallet, treasuryAbi, treasuryBytecode, tempoTokenMode ? [checker.address, TEMPO_FEE_TOKEN] : [checker.address]);
deployments.contracts.treasury = treasury;
const treasuryAmount = tempoTokenMode ? parseUnits("1", TEMPO_TOKEN_DECIMALS) : parseEther("0.001");
const treasuryApprovalHash = tempoTokenMode ? await write(deployerWallet, TEMPO_FEE_TOKEN, erc20Abi, "approve", [treasury.address, treasuryAmount]) : null;
const treasuryFundingHash = tempoTokenMode
  ? await write(deployerWallet, treasury.address, treasuryAbi, "deposit", [treasuryAmount])
  : await deployerWallet.sendTransaction({ to: treasury.address, value: treasuryAmount, gas: 100_000n });
if (!tempoTokenMode) await tx(treasuryFundingHash);
const budgetId = keccak256(`0x${Buffer.from(`budget:${runId}`).toString("hex")}`);
const paymentId = keccak256(`0x${Buffer.from(`payment:${runId}`).toString("hex")}`);
const recipient = checker.address;
const paymentAmount = tempoTokenMode ? parseUnits("0.1", TEMPO_TOKEN_DECIMALS) : parseEther("0.0001");
await write(deployerWallet, treasury.address, treasuryAbi, "configureBudget", [budgetId, paymentAmount]);
let configuredBudget = 0n;
for (let attempt = 0; attempt < 20; attempt += 1) {
  configuredBudget = await publicClient.readContract({ address: treasury.address, abi: treasuryAbi, functionName: "budgetRemaining", args: [budgetId] });
  if (configuredBudget === paymentAmount) break;
  await sleep(1_000);
}
assert.equal(configuredBudget, paymentAmount, "configured budget was not visible after its successful receipt");
const requestedHash = await write(deployerWallet, treasury.address, treasuryAbi, "requestPayment", [paymentId, budgetId, recipient, paymentAmount]);
const approvedHash = await write(checkerWallet, treasury.address, treasuryAbi, "approvePayment", [paymentId]);
let approvedPayment;
for (let attempt = 0; attempt < 20; attempt += 1) {
  approvedPayment = await publicClient.readContract({ address: treasury.address, abi: treasuryAbi, functionName: "payments", args: [paymentId] });
  if (Number(approvedPayment[3]) === 2) break;
  await sleep(1_000);
}
assert.equal(Number(approvedPayment[3]), 2, "approved payment was not visible before execution");
const executedHash = await write(deployerWallet, treasury.address, treasuryAbi, "executePayment", [paymentId]);
const payment = await publicClient.readContract({ address: treasury.address, abi: treasuryAbi, functionName: "payments", args: [paymentId] });
assert.equal(Number(payment[3]), 3, "treasury payment was not executed");
deployments.evidence.treasury = { checkerFundingHash, treasuryApprovalHash, treasuryFundingHash, requestedHash, approvedHash, executedHash, paymentId, status: "executed" };

const governance = await deploy(deployerWallet, governanceAbi, governanceBytecode, []);
deployments.contracts.governance = governance;
const proposalId = keccak256(`0x${Buffer.from(`proposal:${runId}`).toString("hex")}`);
const actionHash = keccak256(`0x${Buffer.from(`action:${runId}`).toString("hex")}`);
const now = Math.floor(Date.now() / 1000);
const commitEnd = BigInt(now + 120);
const revealEnd = BigInt(now + 300);
const proposalHash = await write(deployerWallet, governance.address, governanceAbi, "createProposal", [proposalId, actionHash, commitEnd, revealEnd, 1n]);
const voteSalt = keccak256(`0x${Buffer.from(`vote-salt:${runId}`).toString("hex")}`);
const voteCommitment = keccak256(encodeAbiParameters([{ type: "bytes32" }, { type: "address" }, { type: "bool" }, { type: "bytes32" }], [proposalId, deployer.address, true, voteSalt]));
const voteCommitHash = await write(deployerWallet, governance.address, governanceAbi, "commitVote", [proposalId, voteCommitment]);
await expectRevert(() => write(deployerWallet, governance.address, governanceAbi, "revealVote", [proposalId, true, voteSalt]), "early governance reveal");
await sleep(130_000);
const voteRevealHash = await write(deployerWallet, governance.address, governanceAbi, "revealVote", [proposalId, true, voteSalt]);
await sleep(190_000);
const proposalFinalizeHash = await write(deployerWallet, governance.address, governanceAbi, "finalizeProposal", [proposalId]);
const proposal = await publicClient.readContract({ address: governance.address, abi: governanceAbi, functionName: "proposals", args: [proposalId] });
assert.equal(Number(proposal[7]), 2, "governance proposal did not pass");
deployments.evidence.governance = { proposalHash, voteCommitHash, voteRevealHash, proposalFinalizeHash, proposalId, status: "passed" };

const auction = await deploy(deployerWallet, auctionAbi, auctionBytecode, tempoTokenMode ? [TEMPO_FEE_TOKEN] : []);
deployments.contracts.auction = auction;
const auctionId = keccak256(`0x${Buffer.from(`auction:${runId}`).toString("hex")}`);
const bidAmount = tempoTokenMode ? parseUnits("0.2", TEMPO_TOKEN_DECIMALS) : parseEther("0.0002");
const escrow = tempoTokenMode ? parseUnits("0.3", TEMPO_TOKEN_DECIMALS) : parseEther("0.0003");
const auctionNow = Math.floor(Date.now() / 1000);
const biddingEnd = BigInt(auctionNow + 120);
const auctionRevealEnd = BigInt(auctionNow + 300);
const auctionCreateHash = await write(deployerWallet, auction.address, auctionAbi, "createAuction", [auctionId, deployer.address, biddingEnd, auctionRevealEnd]);
const bidSalt = keccak256(`0x${Buffer.from(`bid-salt:${runId}`).toString("hex")}`);
const bidCommitment = keccak256(encodeAbiParameters([{ type: "bytes32" }, { type: "address" }, { type: "uint256" }, { type: "bytes32" }], [auctionId, checker.address, bidAmount, bidSalt]));
const bidApprovalHash = tempoTokenMode ? await write(checkerWallet, TEMPO_FEE_TOKEN, erc20Abi, "approve", [auction.address, escrow]) : null;
const bidCommitHash = tempoTokenMode
  ? await write(checkerWallet, auction.address, auctionAbi, "commitBid", [auctionId, bidCommitment, escrow])
  : await checkerWallet.writeContract({ address: auction.address, abi: auctionAbi, functionName: "commitBid", args: [auctionId, bidCommitment], value: escrow });
if (!tempoTokenMode) await tx(bidCommitHash);
await expectRevert(() => checkerWallet.writeContract({ address: auction.address, abi: auctionAbi, functionName: "revealBid", args: [auctionId, bidAmount + 1n, bidSalt] }), "altered auction reveal");
await sleep(130_000);
const bidRevealHash = await write(checkerWallet, auction.address, auctionAbi, "revealBid", [auctionId, bidAmount, bidSalt]);
await sleep(190_000);
const auctionFinalizeHash = await write(deployerWallet, auction.address, auctionAbi, "finalizeAuction", [auctionId]);
const auctionSettleHash = await write(deployerWallet, auction.address, auctionAbi, "settleAuction", [auctionId]);
const auctionState = await publicClient.readContract({ address: auction.address, abi: auctionAbi, functionName: "auctions", args: [auctionId] });
assert.equal(Number(auctionState[5]), 3, "auction was not settled");
deployments.evidence.auction = { bidApprovalHash, auctionCreateHash, bidCommitHash, bidRevealHash, auctionFinalizeHash, auctionSettleHash, auctionId, status: "settled" };

await mkdir(path.join(PACKAGE, "deployments"), { recursive: true });
await writeFile(path.join(PACKAGE, `deployments/organizational-${NETWORK}.json`), `${JSON.stringify(deployments, null, 2)}\n`);
console.log(JSON.stringify({ network: NETWORK, chainId: CHAIN_ID, deployer: deployer.address, contracts: deployments.contracts, evidence: deployments.evidence }, null, 2));
