pragma circom 2.1.6;

include "../../node_modules/circomlib/circuits/poseidon.circom";
include "../../node_modules/circomlib/circuits/comparators.circom";

template PrivateDaoDelegationOverlay() {
    signal input proposalId;
    signal input daoKey;
    signal input minWeight;
    signal input delegationCommitment;
    signal input delegationNullifier;
    signal input delegateeBinding;
    signal input weightCommitment;

    signal input delegatorKey;
    signal input delegateeKey;
    signal input salt;
    signal input delegatedWeight;
    signal input active;

    active * (active - 1) === 0;
    active === 1;

    component weightGate = GreaterEqThan(64);
    weightGate.in[0] <== delegatedWeight;
    weightGate.in[1] <== minWeight;
    weightGate.out === 1;

    component delegationHash = Poseidon(5);
    delegationHash.inputs[0] <== delegatorKey;
    delegationHash.inputs[1] <== delegateeKey;
    delegationHash.inputs[2] <== proposalId;
    delegationHash.inputs[3] <== daoKey;
    delegationHash.inputs[4] <== salt;
    delegationHash.out === delegationCommitment;

    component nullifierHash = Poseidon(3);
    nullifierHash.inputs[0] <== delegatorKey;
    nullifierHash.inputs[1] <== proposalId;
    nullifierHash.inputs[2] <== daoKey;
    nullifierHash.out === delegationNullifier;

    component delegateeHash = Poseidon(3);
    delegateeHash.inputs[0] <== delegateeKey;
    delegateeHash.inputs[1] <== proposalId;
    delegateeHash.inputs[2] <== daoKey;
    delegateeHash.out === delegateeBinding;

    component weightHash = Poseidon(3);
    weightHash.inputs[0] <== delegateeKey;
    weightHash.inputs[1] <== delegatedWeight;
    weightHash.inputs[2] <== daoKey;
    weightHash.out === weightCommitment;
}

component main { public [proposalId, daoKey, minWeight, delegationCommitment, delegationNullifier, delegateeBinding, weightCommitment] } = PrivateDaoDelegationOverlay();

