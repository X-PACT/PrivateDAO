pragma circom 2.1.6;

include "../../node_modules/circomlib/circuits/poseidon.circom";

template PrivateDaoTallyOverlay() {
    signal input proposalId;
    signal input daoKey;
    signal input commitment0;
    signal input commitment1;
    signal input yesWeightTotal;
    signal input noWeightTotal;
    signal input nullifierAccumulator;

    signal input vote0;
    signal input vote1;

    signal input salt0;
    signal input salt1;

    signal input voterKey0;
    signal input voterKey1;

    signal input weight0;
    signal input weight1;

    signal votes[2];
    signal salts[2];
    signal voterKeys[2];
    signal weights[2];
    signal commitments[2];
    signal nullifiers[2];
    signal yesContrib[2];
    signal noContrib[2];
    component commitmentHashes[2];
    component nullifierHashes[2];

    votes[0] <== vote0;
    votes[1] <== vote1;

    salts[0] <== salt0;
    salts[1] <== salt1;

    voterKeys[0] <== voterKey0;
    voterKeys[1] <== voterKey1;

    weights[0] <== weight0;
    weights[1] <== weight1;

    commitments[0] <== commitment0;
    commitments[1] <== commitment1;

    for (var i = 0; i < 2; i++) {
        votes[i] * (votes[i] - 1) === 0;

        commitmentHashes[i] = Poseidon(5);
        commitmentHashes[i].inputs[0] <== votes[i];
        commitmentHashes[i].inputs[1] <== salts[i];
        commitmentHashes[i].inputs[2] <== voterKeys[i];
        commitmentHashes[i].inputs[3] <== proposalId;
        commitmentHashes[i].inputs[4] <== daoKey;
        commitmentHashes[i].out === commitments[i];

        yesContrib[i] <== votes[i] * weights[i];
        noContrib[i] <== (1 - votes[i]) * weights[i];

        nullifierHashes[i] = Poseidon(3);
        nullifierHashes[i].inputs[0] <== voterKeys[i];
        nullifierHashes[i].inputs[1] <== proposalId;
        nullifierHashes[i].inputs[2] <== daoKey;
        nullifierHashes[i].out ==> nullifiers[i];
    }

    yesWeightTotal === yesContrib[0] + yesContrib[1];
    noWeightTotal === noContrib[0] + noContrib[1];

    component nullifierRoot = Poseidon(2);
    nullifierRoot.inputs[0] <== nullifiers[0];
    nullifierRoot.inputs[1] <== nullifiers[1];
    nullifierRoot.out === nullifierAccumulator;
}

component main { public [proposalId, daoKey, commitment0, commitment1, yesWeightTotal, noWeightTotal, nullifierAccumulator] } = PrivateDaoTallyOverlay();
