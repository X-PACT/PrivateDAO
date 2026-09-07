pragma circom 2.1.6;

include "../../node_modules/circomlib/circuits/poseidon.circom";
include "../../node_modules/circomlib/circuits/comparators.circom";

template BlindPayroll() {
    signal input payrollCommitment;
    signal input batchCommitment;
    signal input maxVariance;
    signal input approvedClaim;

    signal input payrollKey;
    signal input batchKey;
    signal input variance;
    signal input approved;
    signal input salt;

    approved * (approved - 1) === 0;
    approved === 1;
    approvedClaim === 1;

    component varianceGate = LessEqThan(64);
    varianceGate.in[0] <== variance;
    varianceGate.in[1] <== maxVariance;
    varianceGate.out === 1;

    component payrollHash = Poseidon(3);
    payrollHash.inputs[0] <== payrollKey;
    payrollHash.inputs[1] <== approved;
    payrollHash.inputs[2] <== salt;
    payrollHash.out === payrollCommitment;

    component batchHash = Poseidon(3);
    batchHash.inputs[0] <== batchKey;
    batchHash.inputs[1] <== variance;
    batchHash.inputs[2] <== payrollKey;
    batchHash.out === batchCommitment;
}

component main { public [payrollCommitment, batchCommitment, maxVariance, approvedClaim] } = BlindPayroll();
