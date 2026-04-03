pragma circom 2.1.6;

include "../../node_modules/circomlib/circuits/poseidon.circom";
include "../../node_modules/circomlib/circuits/comparators.circom";

template PrivateDaoVoteOverlay() {
    signal input proposalId;
    signal input daoKey;
    signal input minWeight;
    signal input commitment;
    signal input nullifier;
    signal input eligibilityHash;

    signal input vote;
    signal input salt;
    signal input voterKey;
    signal input weight;

    vote * (vote - 1) === 0;

    component weightGate = GreaterEqThan(64);
    weightGate.in[0] <== weight;
    weightGate.in[1] <== minWeight;
    weightGate.out === 1;

    component commitmentHash = Poseidon(5);
    commitmentHash.inputs[0] <== vote;
    commitmentHash.inputs[1] <== salt;
    commitmentHash.inputs[2] <== voterKey;
    commitmentHash.inputs[3] <== proposalId;
    commitmentHash.inputs[4] <== daoKey;
    commitmentHash.out === commitment;

    component nullifierHash = Poseidon(3);
    nullifierHash.inputs[0] <== voterKey;
    nullifierHash.inputs[1] <== proposalId;
    nullifierHash.inputs[2] <== daoKey;
    nullifierHash.out === nullifier;

    component eligibilityCommitment = Poseidon(3);
    eligibilityCommitment.inputs[0] <== voterKey;
    eligibilityCommitment.inputs[1] <== weight;
    eligibilityCommitment.inputs[2] <== daoKey;
    eligibilityCommitment.out === eligibilityHash;
}

component main { public [proposalId, daoKey, minWeight, commitment, nullifier, eligibilityHash] } = PrivateDaoVoteOverlay();
