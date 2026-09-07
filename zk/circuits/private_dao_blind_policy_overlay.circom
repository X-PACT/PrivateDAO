pragma circom 2.1.6;

include "../../node_modules/circomlib/circuits/poseidon.circom";
include "../../node_modules/circomlib/circuits/comparators.circom";

template PrivateDaoBlindPolicyOverlay() {
    signal input policyId;
    signal input policyCommitment;
    signal input inputCommitment;
    signal input satisfiedClaim;

    signal input organizationKey;
    signal input subjectKey;
    signal input membershipVerified;
    signal input record0;
    signal input record1;
    signal input record2;
    signal input liabilitiesUsd;
    signal input riskScore;
    signal input minRecordCount;
    signal input minAverageAmountUsd;
    signal input maxLiabilityBps;
    signal input minRiskScore;
    signal input policySalt;
    signal input inputSalt;

    membershipVerified * (membershipVerified - 1) === 0;
    membershipVerified === 1;
    satisfiedClaim === 1;

    component record0Positive = GreaterEqThan(64);
    record0Positive.in[0] <== record0;
    record0Positive.in[1] <== 1;
    record0Positive.out === 1;

    component record1Positive = GreaterEqThan(64);
    record1Positive.in[0] <== record1;
    record1Positive.in[1] <== 1;
    record1Positive.out === 1;

    component record2Positive = GreaterEqThan(64);
    record2Positive.in[0] <== record2;
    record2Positive.in[1] <== 1;
    record2Positive.out === 1;

    component recordCountGate = LessEqThan(64);
    recordCountGate.in[0] <== minRecordCount;
    recordCountGate.in[1] <== 3;
    recordCountGate.out === 1;

    signal recordSum;
    signal minimumRequiredSum;
    recordSum <== record0 + record1 + record2;
    minimumRequiredSum <== minAverageAmountUsd * 3;

    component capacityGate = GreaterEqThan(64);
    capacityGate.in[0] <== recordSum;
    capacityGate.in[1] <== minimumRequiredSum;
    capacityGate.out === 1;

    component liabilityGate = LessEqThan(64);
    liabilityGate.in[0] <== liabilitiesUsd * 30000;
    liabilityGate.in[1] <== recordSum * maxLiabilityBps;
    liabilityGate.out === 1;

    component riskGate = GreaterEqThan(64);
    riskGate.in[0] <== riskScore;
    riskGate.in[1] <== minRiskScore;
    riskGate.out === 1;

    component policyHash = Poseidon(6);
    policyHash.inputs[0] <== policyId;
    policyHash.inputs[1] <== minRecordCount;
    policyHash.inputs[2] <== minAverageAmountUsd;
    policyHash.inputs[3] <== maxLiabilityBps;
    policyHash.inputs[4] <== minRiskScore;
    policyHash.inputs[5] <== policySalt;
    policyHash.out === policyCommitment;

    component inputHash = Poseidon(8);
    inputHash.inputs[0] <== organizationKey;
    inputHash.inputs[1] <== subjectKey;
    inputHash.inputs[2] <== record0;
    inputHash.inputs[3] <== record1;
    inputHash.inputs[4] <== record2;
    inputHash.inputs[5] <== liabilitiesUsd;
    inputHash.inputs[6] <== riskScore;
    inputHash.inputs[7] <== inputSalt;
    inputHash.out === inputCommitment;
}

component main { public [policyId, policyCommitment, inputCommitment, satisfiedClaim] } = PrivateDaoBlindPolicyOverlay();
