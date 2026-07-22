import { stableReceiptHash } from "./receipt-contract.mjs";
const receipt={version:"txline-settlement-receipt/v1",proofId:"txline-judge-demo-001",matchId:"demo-final-match",marketId:"demo-winner-market",outcome:"resolved",fixtureHash:"demo-fixture-hash",issuedAt:"2026-07-22T00:00:00.000Z"};
console.log(JSON.stringify({...receipt,receiptHash:stableReceiptHash(receipt)},null,2));
