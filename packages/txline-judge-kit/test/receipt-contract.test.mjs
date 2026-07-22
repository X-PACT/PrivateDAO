import assert from "node:assert/strict";
import test from "node:test";
import { stableReceiptHash, verifyPublicReceipt } from "../src/receipt-contract.mjs";
test("verifies a public settlement receipt without any proving artifact",()=>{const receipt={version:"txline-settlement-receipt/v1",proofId:"judge-1",matchId:"fixture-1",marketId:"winner",outcome:"resolved",fixtureHash:"fixture-hash",issuedAt:"2026-07-22T00:00:00.000Z"};receipt.receiptHash=stableReceiptHash(receipt);assert.deepEqual(verifyPublicReceipt(receipt),{ok:true,receiptHash:receipt.receiptHash});assert.equal(verifyPublicReceipt({...receipt,outcome:"tampered"}).ok,false);});
