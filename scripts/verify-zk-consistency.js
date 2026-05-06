"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const index_1 = require("../sdk/src/index");
async function main() {
    await verifyVoteOverlay();
    await verifyDelegationOverlay();
    await verifyTallyOverlay();
    console.log("ZK consistency verification: PASS");
}
async function verifyVoteOverlay() {
    const input = readJson("zk/inputs/private_dao_vote_overlay.sample.json");
    const publicSignals = readJson("zk/proofs/private_dao_vote_overlay.public.json");
    const expected = await (0, index_1.computeVoteOverlaySignals)(input);
    const actual = [
        expected.proposalId,
        expected.daoKey,
        expected.minWeight,
        expected.commitment,
        expected.nullifier,
        expected.eligibilityHash,
    ].map((value) => value.toString());
    assertEqual(publicSignals, actual, "vote overlay public signals mismatch");
}
async function verifyDelegationOverlay() {
    const input = readJson("zk/inputs/private_dao_delegation_overlay.sample.json");
    const publicSignals = readJson("zk/proofs/private_dao_delegation_overlay.public.json");
    const expected = await (0, index_1.computeDelegationOverlaySignals)(input);
    const actual = [
        expected.proposalId,
        expected.daoKey,
        expected.minWeight,
        expected.delegationCommitment,
        expected.delegationNullifier,
        expected.delegateeBinding,
        expected.weightCommitment,
    ].map((value) => value.toString());
    assertEqual(publicSignals, actual, "delegation overlay public signals mismatch");
}
async function verifyTallyOverlay() {
    const input = readJson("zk/inputs/private_dao_tally_overlay.sample.json");
    const publicSignals = readJson("zk/proofs/private_dao_tally_overlay.public.json");
    const expected = await (0, index_1.computeTallyOverlaySignals)(input);
    const actual = [
        expected.proposalId,
        expected.daoKey,
        expected.commitment0,
        expected.commitment1,
        expected.yesWeightTotal,
        expected.noWeightTotal,
        expected.nullifierAccumulator,
    ].map((value) => value.toString());
    assertEqual(publicSignals, actual, "tally overlay public signals mismatch");
}
function readJson(relativePath) {
    return JSON.parse(fs_1.default.readFileSync(path_1.default.resolve(relativePath), "utf8"));
}
function assertEqual(actual, expected, message) {
    if (actual.length !== expected.length) {
        throw new Error(`${message}: length mismatch`);
    }
    for (let i = 0; i < actual.length; i += 1) {
        if (actual[i] !== expected[i]) {
            throw new Error(`${message}: index ${i}`);
        }
    }
}
main().catch((error) => {
    console.error(error);
    process.exit(1);
});
