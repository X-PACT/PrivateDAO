pragma circom 2.1.6;

include "../../node_modules/circomlib/circuits/poseidon.circom";
include "../../node_modules/circomlib/circuits/comparators.circom";

template BlindAml() {
    signal input policyHash;
    signal input subjectCommitment;
    signal input maxRisk;
    signal input clearClaim;

    signal input subjectKey;
    signal input sanctionsClear;
    signal input riskScore;
    signal input salt;

    sanctionsClear * (sanctionsClear - 1) === 0;
    sanctionsClear === 1;
    clearClaim === 1;

    component riskGate = LessEqThan(64);
    riskGate.in[0] <== riskScore;
    riskGate.in[1] <== maxRisk;
    riskGate.out === 1;

    component subjectHash = Poseidon(4);
    subjectHash.inputs[0] <== subjectKey;
    subjectHash.inputs[1] <== sanctionsClear;
    subjectHash.inputs[2] <== riskScore;
    subjectHash.inputs[3] <== salt;
    subjectHash.out === subjectCommitment;
}

component main { public [policyHash, subjectCommitment, maxRisk, clearClaim] } = BlindAml();
