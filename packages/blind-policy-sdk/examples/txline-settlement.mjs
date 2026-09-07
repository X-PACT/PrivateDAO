import { createBlindPolicyClient } from "../dist/index.js";

const client = createBlindPolicyClient({
  baseUrl: process.env.PRIVATE_DAO_API_BASE || "https://api.privatedao.org/api/v1",
});

const matches = await client.fetchTxlineMatches();
if (!matches.ok || !matches.matches?.length) {
  throw new Error("No TxLINE matches available.");
}

const finalMatch = matches.matches.find((match) => match.status === "final") || matches.matches[0];
const resolved = await client.resolveMatchMarket({
  matchId: finalMatch.matchId,
  marketId: "worldcup-winner-market",
});

console.log("resolved:", {
  ok: resolved.ok,
  status: resolved.status,
  providerMode: resolved.providerMode,
  proofHash: resolved.ok ? resolved.proofHash : null,
});

if (!resolved.ok) process.exit(1);

const verification = await client.verifySettlementProof(resolved.publicProofPackage);
console.log("verify:", verification);

const tampered = {
  ...resolved.publicProofPackage,
  marketId: `${resolved.publicProofPackage.marketId}-tampered`,
};
const tamperVerification = await client.verifySettlementProof(tampered);
console.log("tamper:", tamperVerification);

if (process.env.SUBMIT_ONCHAIN_RECEIPT === "1") {
  const receipt = await client.submitSettlementReceipt(resolved.publicProofPackage);
  console.log("onchain:", receipt);
}
