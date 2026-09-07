import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(new URL("../..", import.meta.url).pathname);
const source = process.argv[2];
const output = process.argv[3] ?? path.join(root, "zk/inputs/private_dao_auction_outcome.e2e.json");
if (!source) throw new Error("Usage: generate-auction-outcome-from-witness.mjs WITNESS_JSON [OUTPUT_JSON]");
const field = 21888242871839275222246405745257275088548364400416034343698204186575808495617n;
const toField = (hex) => {
  const bytes = Buffer.from(hex, "hex");
  if (bytes.length !== 32) throw new Error("All digest values must be 32 bytes.");
  let number = 0n;
  for (let index = bytes.length - 1; index >= 0; index -= 1) number = (number << 8n) + BigInt(bytes[index]);
  return (number % field).toString(10);
};
const input = JSON.parse(fs.readFileSync(source, "utf8"));
const metadata = input.metadata;
const bids = input.bids;
if (!metadata || !Array.isArray(bids) || bids.length !== Number(metadata.bidCount)) throw new Error("Witness bid count mismatch.");
const winnerIndex = bids.findIndex((bid) => bid.bidderCommitment === metadata.winnerCommitment);
if (winnerIndex < 0) throw new Error("Winner commitment is not present in witness.");
if (bids[winnerIndex].amount !== String(metadata.winningAmount)) throw new Error("Winner amount mismatch.");
for (const [index, bid] of bids.entries()) if (index !== winnerIndex && BigInt(bid.amount) >= BigInt(metadata.winningAmount)) throw new Error("Unique maximum bid required.");
const expected = crypto.createHash("sha256").update(Buffer.concat([
  Buffer.from("privatedao-auction-result-v1"), Buffer.from(metadata.auctionId, "hex"), Buffer.from(metadata.rulesDigest, "hex"),
  Buffer.from(metadata.policyDigest, "hex"), Buffer.from(metadata.winnerCommitment, "hex"), Buffer.from(new BN64(metadata.winningAmount)),
  Buffer.from(new BN32(metadata.bidCount)), Buffer.from(new BN64(metadata.deadline)),
])).digest("hex");
if (expected !== metadata.resultCommitment) throw new Error("Witness is not bound to the on-chain result commitment.");
const commitments = bids.map((bid) => toField(bid.bidderCommitment));
const amounts = bids.map((bid) => String(bid.amount));
while (commitments.length < 8) commitments.push("0");
while (amounts.length < 8) amounts.push("0");
const circuitInput = {
  auctionId: toField(metadata.auctionId), rulesDigest: toField(metadata.rulesDigest), policyDigest: toField(metadata.policyDigest),
  winnerCommitment: toField(metadata.winnerCommitment), winningAmount: String(metadata.winningAmount), bidCount: String(metadata.bidCount),
  deadline: String(metadata.deadline), resultCommitment: toField(metadata.resultCommitment), bidderCommitments: commitments, amounts,
  active: Array.from({ length: 8 }, (_, index) => index < Number(metadata.bidCount) ? "1" : "0"),
  winner: Array.from({ length: 8 }, (_, index) => index === winnerIndex ? "1" : "0"),
};
fs.mkdirSync(path.dirname(output), { recursive: true });
fs.writeFileSync(output, `${JSON.stringify(circuitInput, null, 2)}\n`);
console.log(output);
console.log(`result_commitment=${metadata.resultCommitment}`);

function BN64(value) { const result = Buffer.alloc(8); result.writeBigUInt64LE(BigInt(value)); return result; }
function BN32(value) { const result = Buffer.alloc(4); result.writeUInt32LE(Number(value)); return result; }
