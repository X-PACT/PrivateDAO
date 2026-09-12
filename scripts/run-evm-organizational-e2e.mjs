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
  parseEther,
  zeroHash,
} from "viem";
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const PACKAGE = path.join(ROOT, "packages/evm-verification");
const NETWORK = "ethereum-sepolia";
const CHAIN_ID = 11155111;
const RPC_ENV = "PDAO_EVM_ETHEREUM_SEPOLIA_RPC_URL";
const rawKey = process.env.PDAO_EVM_DEPLOYER_PRIVATE_KEY?.trim();
const deployerKey = rawKey && /^[0-9a-fA-F]{64}$/.test(rawKey) ? `0x${rawKey}` : rawKey;
if (!deployerKey || !/^0x[0-9a-fA-F]{64}$/.test(deployerKey)) throw new Error("PDAO_EVM_DEPLOYER_PRIVATE_KEY is required for Testnet execution.");
const rpcUrl = process.env[RPC_ENV];
if (!rpcUrl || !/^https:\/\//.test(rpcUrl)) throw new Error(`${RPC_ENV} must be an explicit HTTPS RPC URL.`);

const chain = defineChain({
  id: CHAIN_ID,
  name: "Ethereum Sepolia",
  nativeCurrency: { name: "Sepolia Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: { default: { http: [rpcUrl] } },
});
const deployer = privateKeyToAccount(deployerKey);
const checker = privateKeyToAccount(generatePrivateKey());
const transport = http(rpcUrl, { timeout: 30_000 });
const publicClient = createPublicClient({ chain, transport });
const deployerWallet = createWalletClient({ account: deployer, chain, transport });
const checkerWallet = createWalletClient({ account: checker, chain, transport });

const treasuryAbi = JSON.parse(await readFile(path.join(PACKAGE, "artifacts/PrivateDaoTreasury.abi"), "utf8"));
const treasuryBytecode = `0x${(await readFile(path.join(PACKAGE, "artifacts/PrivateDaoTreasury.bin"), "utf8")).trim()}`;
const governanceAbi = JSON.parse(await readFile(path.join(PACKAGE, "artifacts/PrivateDaoGovernance.abi"), "utf8"));
const governanceBytecode = `0x${(await readFile(path.join(PACKAGE, "artifacts/PrivateDaoGovernance.bin"), "utf8")).trim()}`;
const auctionAbi = JSON.parse(await readFile(path.join(PACKAGE, "artifacts/PrivateDaoSealedAuction.abi"), "utf8"));
const auctionBytecode = `0x${(await readFile(path.join(PACKAGE, "artifacts/PrivateDaoSealedAuction.bin"), "utf8")).trim()}`;

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
assert.ok(deployerBalance > parseEther("0.01"), "deployer lacks enough Sepolia ETH for this E2E");

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

const checkerFundingHash = await deployerWallet.sendTransaction({ to: checker.address, value: parseEther("0.002") });
await tx(checkerFundingHash);

const treasury = await deploy(deployerWallet, treasuryAbi, treasuryBytecode, [checker.address]);
deployments.contracts.treasury = treasury;
const treasuryFundingHash = await deployerWallet.sendTransaction({ to: treasury.address, value: parseEther("0.001") });
await tx(treasuryFundingHash);
const budgetId = keccak256(`0x${Buffer.from(`budget:${runId}`).toString("hex")}`);
const paymentId = keccak256(`0x${Buffer.from(`payment:${runId}`).toString("hex")}`);
const recipient = checker.address;
const paymentAmount = parseEther("0.0001");
await write(deployerWallet, treasury.address, treasuryAbi, "configureBudget", [budgetId, paymentAmount]);
const requestedHash = await write(deployerWallet, treasury.address, treasuryAbi, "requestPayment", [paymentId, budgetId, recipient, paymentAmount]);
const approvedHash = await write(checkerWallet, treasury.address, treasuryAbi, "approvePayment", [paymentId]);
const executedHash = await write(deployerWallet, treasury.address, treasuryAbi, "executePayment", [paymentId]);
const payment = await publicClient.readContract({ address: treasury.address, abi: treasuryAbi, functionName: "payments", args: [paymentId] });
assert.equal(Number(payment[3]), 3, "treasury payment was not executed");
deployments.evidence.treasury = { treasuryFundingHash, requestedHash, approvedHash, executedHash, paymentId, status: "executed" };

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

const auction = await deploy(deployerWallet, auctionAbi, auctionBytecode, []);
deployments.contracts.auction = auction;
const auctionId = keccak256(`0x${Buffer.from(`auction:${runId}`).toString("hex")}`);
const bidAmount = parseEther("0.0002");
const escrow = parseEther("0.0003");
const auctionNow = Math.floor(Date.now() / 1000);
const biddingEnd = BigInt(auctionNow + 120);
const auctionRevealEnd = BigInt(auctionNow + 300);
const auctionCreateHash = await write(deployerWallet, auction.address, auctionAbi, "createAuction", [auctionId, deployer.address, biddingEnd, auctionRevealEnd]);
const bidSalt = keccak256(`0x${Buffer.from(`bid-salt:${runId}`).toString("hex")}`);
const bidCommitment = keccak256(encodeAbiParameters([{ type: "bytes32" }, { type: "address" }, { type: "uint256" }, { type: "bytes32" }], [auctionId, checker.address, bidAmount, bidSalt]));
const bidCommitHash = await checkerWallet.writeContract({ address: auction.address, abi: auctionAbi, functionName: "commitBid", args: [auctionId, bidCommitment], value: escrow });
await tx(bidCommitHash);
await expectRevert(() => checkerWallet.writeContract({ address: auction.address, abi: auctionAbi, functionName: "revealBid", args: [auctionId, bidAmount + 1n, bidSalt] }), "altered auction reveal");
await sleep(130_000);
const bidRevealHash = await write(checkerWallet, auction.address, auctionAbi, "revealBid", [auctionId, bidAmount, bidSalt]);
await sleep(190_000);
const auctionFinalizeHash = await write(deployerWallet, auction.address, auctionAbi, "finalizeAuction", [auctionId]);
const auctionSettleHash = await write(deployerWallet, auction.address, auctionAbi, "settleAuction", [auctionId]);
const auctionState = await publicClient.readContract({ address: auction.address, abi: auctionAbi, functionName: "auctions", args: [auctionId] });
assert.equal(Number(auctionState[5]), 3, "auction was not settled");
deployments.evidence.auction = { auctionCreateHash, bidCommitHash, bidRevealHash, auctionFinalizeHash, auctionSettleHash, auctionId, status: "settled" };

await mkdir(path.join(PACKAGE, "deployments"), { recursive: true });
await writeFile(path.join(PACKAGE, "deployments/organizational-ethereum-sepolia.json"), `${JSON.stringify(deployments, null, 2)}\n`);
console.log(JSON.stringify({ network: NETWORK, chainId: CHAIN_ID, deployer: deployer.address, contracts: deployments.contracts, evidence: deployments.evidence }, null, 2));
