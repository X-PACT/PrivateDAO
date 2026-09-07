pragma circom 2.1.6;

include "../../node_modules/circomlib/circuits/poseidon.circom";
include "../../node_modules/circomlib/circuits/comparators.circom";

template BlindEmployment() {
    signal input employerCommitment;
    signal input employeeCommitment;
    signal input minTenure;
    signal input verifiedClaim;

    signal input employerKey;
    signal input employeeKey;
    signal input active;
    signal input tenureMonths;
    signal input salt;

    active * (active - 1) === 0;
    active === 1;
    verifiedClaim === 1;

    component tenureGate = GreaterEqThan(64);
    tenureGate.in[0] <== tenureMonths;
    tenureGate.in[1] <== minTenure;
    tenureGate.out === 1;

    component employerHash = Poseidon(2);
    employerHash.inputs[0] <== employerKey;
    employerHash.inputs[1] <== salt;
    employerHash.out === employerCommitment;

    component employeeHash = Poseidon(4);
    employeeHash.inputs[0] <== employeeKey;
    employeeHash.inputs[1] <== active;
    employeeHash.inputs[2] <== tenureMonths;
    employeeHash.inputs[3] <== employerKey;
    employeeHash.out === employeeCommitment;
}

component main { public [employerCommitment, employeeCommitment, minTenure, verifiedClaim] } = BlindEmployment();
