pragma circom 2.1.6;

include "../../node_modules/circomlib/circuits/poseidon.circom";
include "../../node_modules/circomlib/circuits/comparators.circom";

template BlindUnderwriting() {
    signal input policyHash;
    signal input applicantCommitment;
    signal input maxLiabilityBps;
    signal input minCoverage;
    signal input eligibleClaim;

    signal input applicantKey;
    signal input assets;
    signal input liabilities;
    signal input coverage;
    signal input salt;

    eligibleClaim === 1;
    component liabilityGate = LessEqThan(128);
    liabilityGate.in[0] <== liabilities * 10000;
    liabilityGate.in[1] <== assets * maxLiabilityBps;
    liabilityGate.out === 1;

    component coverageGate = GreaterEqThan(64);
    coverageGate.in[0] <== coverage;
    coverageGate.in[1] <== minCoverage;
    coverageGate.out === 1;

    component applicantHash = Poseidon(5);
    applicantHash.inputs[0] <== applicantKey;
    applicantHash.inputs[1] <== assets;
    applicantHash.inputs[2] <== liabilities;
    applicantHash.inputs[3] <== coverage;
    applicantHash.inputs[4] <== salt;
    applicantHash.out === applicantCommitment;
}

component main { public [policyHash, applicantCommitment, maxLiabilityBps, minCoverage, eligibleClaim] } = BlindUnderwriting();
