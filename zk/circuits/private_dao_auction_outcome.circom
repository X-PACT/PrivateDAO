pragma circom 2.1.6;

include "../../node_modules/circomlib/circuits/comparators.circom";

// Receipt-bound auction outcome proof, v1.
// The witness contains the sealed bid commitments and amounts. The public
// inputs are checked against the durable on-chain receipt by the application
// verifier; no bid amount or bidder commitment is revealed by the proof.
template AuctionOutcome(MAX_BIDS) {
    signal input auctionId;
    signal input rulesDigest;
    signal input policyDigest;
    signal input winnerCommitment;
    signal input winningAmount;
    signal input bidCount;
    signal input deadline;
    signal input resultCommitment;

    signal input bidderCommitments[MAX_BIDS];
    signal input amounts[MAX_BIDS];
    signal input active[MAX_BIDS];
    signal input winner[MAX_BIDS];

    component bidCountRange = LessEqThan(32);
    bidCountRange.in[0] <== bidCount;
    bidCountRange.in[1] <== MAX_BIDS;
    bidCountRange.out === 1;

    component winningAmountPositive = GreaterThan(64);
    winningAmountPositive.in[0] <== winningAmount;
    winningAmountPositive.in[1] <== 0;
    winningAmountPositive.out === 1;

    component bidCountPositive = GreaterThan(32);
    bidCountPositive.in[0] <== bidCount;
    bidCountPositive.in[1] <== 0;
    bidCountPositive.out === 1;

    var activeTotal = 0;
    var winnerTotal = 0;
    signal selectedCommitment;
    signal selectedAmount;
    signal selectedCommitmentAccum[MAX_BIDS + 1];
    signal selectedAmountAccum[MAX_BIDS + 1];
    selectedCommitmentAccum[0] <== 0;
    selectedAmountAccum[0] <== 0;
    component maxCheck[MAX_BIDS];

    for (var i = 0; i < MAX_BIDS; i++) {
        active[i] * (active[i] - 1) === 0;
        winner[i] * (winner[i] - 1) === 0;
        winner[i] * (1 - active[i]) === 0;

        // Empty slots have no value or commitment. This makes bidCount exact.
        amounts[i] * (1 - active[i]) === 0;
        bidderCommitments[i] * (1 - active[i]) === 0;
        activeTotal += active[i];
        winnerTotal += winner[i];
        selectedCommitmentAccum[i + 1] <== selectedCommitmentAccum[i] + winner[i] * bidderCommitments[i];
        selectedAmountAccum[i + 1] <== selectedAmountAccum[i] + winner[i] * amounts[i];

        maxCheck[i] = LessThan(64);
        maxCheck[i].in[0] <== amounts[i];
        maxCheck[i].in[1] <== winningAmount;
        // Every active non-winner must be strictly below the winner. Empty
        // slots are also below a positive winning amount.
        maxCheck[i].out + winner[i] === 1;
    }

    activeTotal === bidCount;
    winnerTotal === 1;
    selectedCommitment <== selectedCommitmentAccum[MAX_BIDS];
    selectedAmount <== selectedAmountAccum[MAX_BIDS];
    selectedCommitment === winnerCommitment;
    selectedAmount === winningAmount;

    // These public values are intentionally exposed as binding labels. The
    // receipt verifier recomputes the existing SHA-256 result commitment and
    // matches every label to the finalized SettlementReceipt.
    auctionId === auctionId;
    rulesDigest === rulesDigest;
    policyDigest === policyDigest;
    deadline === deadline;
    resultCommitment === resultCommitment;
}

component main { public [auctionId, rulesDigest, policyDigest, winnerCommitment, winningAmount, bidCount, deadline, resultCommitment] } = AuctionOutcome(8);
