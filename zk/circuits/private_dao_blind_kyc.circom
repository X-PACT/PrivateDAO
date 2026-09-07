pragma circom 2.1.6;

include "../../node_modules/circomlib/circuits/poseidon.circom";

template BlindKyc() {
    signal input policyHash;
    signal input subjectCommitment;
    signal input jurisdictionCommitment;
    signal input verifiedClaim;

    signal input subjectKey;
    signal input kycStatus;
    signal input jurisdictionKey;
    signal input salt;

    kycStatus * (kycStatus - 1) === 0;
    kycStatus === 1;
    verifiedClaim === 1;

    component subjectHash = Poseidon(3);
    subjectHash.inputs[0] <== subjectKey;
    subjectHash.inputs[1] <== salt;
    subjectHash.inputs[2] <== policyHash;
    subjectHash.out === subjectCommitment;

    component jurisdictionHash = Poseidon(2);
    jurisdictionHash.inputs[0] <== jurisdictionKey;
    jurisdictionHash.inputs[1] <== policyHash;
    jurisdictionHash.out === jurisdictionCommitment;
}

component main { public [policyHash, subjectCommitment, jurisdictionCommitment, verifiedClaim] } = BlindKyc();
