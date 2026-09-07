import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(new URL("../..", import.meta.url).pathname);
const output = process.argv[2] ?? path.join(root, "zk/inputs/private_dao_auction_outcome.sample.json");
const field = 21888242871839275222246405745257275088548364400416034343698204186575808495617n;
const bytes = (value) => crypto.createHash("sha256").update(value).digest();
const toField = (value) => {
  let number = 0n;
  for (let index = value.length - 1; index >= 0; index -= 1) number = (number << 8n) + BigInt(value[index]);
  return (number % field).toString(10);
};
const u64 = (value) => { const result = Buffer.alloc(8); result.writeBigUInt64LE(BigInt(value)); return result; };
const u32 = (value) => { const result = Buffer.alloc(4); result.writeUInt32LE(value); return result; };

const auctionId = bytes("auction-outcome-sample");
const rulesDigest = bytes("rules-v1");
const policyDigest = bytes("policy-v1");
const bidderA = bytes("bidder:sample-a");
const bidderB = bytes("bidder:sample-b");
const winningAmount = 250n;
const bidCount = 2;
const deadline = 1893456000n;
const resultCommitment = crypto.createHash("sha256").update(Buffer.concat([
  Buffer.from("privatedao-auction-result-v1"), auctionId, rulesDigest, policyDigest,
  bidderB, u64(winningAmount), u32(bidCount), u64(deadline),
])).digest();

const input = {
  auctionId: toField(auctionId),
  rulesDigest: toField(rulesDigest),
  policyDigest: toField(policyDigest),
  winnerCommitment: toField(bidderB),
  winningAmount: winningAmount.toString(),
  bidCount: String(bidCount),
  deadline: deadline.toString(),
  resultCommitment: toField(resultCommitment),
  bidderCommitments: [toField(bidderA), toField(bidderB), "0", "0", "0", "0", "0", "0"],
  amounts: ["100", "250", "0", "0", "0", "0", "0", "0"],
  active: ["1", "1", "0", "0", "0", "0", "0", "0"],
  winner: ["0", "1", "0", "0", "0", "0", "0", "0"],
};
fs.mkdirSync(path.dirname(output), { recursive: true });
fs.writeFileSync(output, `${JSON.stringify(input, null, 2)}\n`);
console.log(output);
console.log(`result_commitment=${resultCommitment.toString("hex")}`);
