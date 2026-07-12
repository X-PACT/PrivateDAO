import { assert } from "chai";

import {
  buildSealedAuctionProofPackage,
  computeSealedAuctionProofHash,
  verifySealedAuctionProofPackage,
} from "../../apps/web/src/lib/sealed-auction-proof";

const config = {
  auctionId: "auction-demo-001",
  title: "Private grant allocation auction",
  mode: "private-room-sealed" as const,
  startingPrice: 1000,
  depositRequired: 250,
  inviteCode: "PDAO-AUCTION-7842",
};

const privateBids = [
  { bidderId: "bidder-alpha", amount: 1250, salt: "alpha-private-salt" },
  { bidderId: "bidder-bravo", amount: 1725, salt: "bravo-private-salt" },
  { bidderId: "bidder-charlie", amount: 1510, salt: "charlie-private-salt" },
];

describe("sealed auction proof verifier", () => {
  it("same sealed auction proof package recomputes the same hash", () => {
    const proofPackage = buildSealedAuctionProofPackage({ config, privateBids });
    const recomputedHash = computeSealedAuctionProofHash(proofPackage);

    assert.equal(recomputedHash, proofPackage.originalProofHash);
  });

  it("sealed auction proof verifies successfully", () => {
    const proofPackage = buildSealedAuctionProofPackage({ config, privateBids });
    const verification = verifySealedAuctionProofPackage(proofPackage);

    assert.equal(verification.ok, true);
    assert.equal(verification.status, "verified");
    assert.equal(verification.match, true);
  });

  it("modified winning bid fails verification", () => {
    const proofPackage = buildSealedAuctionProofPackage({ config, privateBids });
    const verification = verifySealedAuctionProofPackage({
      ...proofPackage,
      winningBid: proofPackage.winningBid + 1,
    });

    assert.equal(verification.ok, false);
    assert.equal(verification.status, "mismatch");
    assert.notEqual(verification.originalHash, verification.recomputedHash);
  });

  it("modified completed stage fails verification", () => {
    const proofPackage = buildSealedAuctionProofPackage({ config, privateBids });
    const verification = verifySealedAuctionProofPackage({
      ...proofPackage,
      completedStages: proofPackage.completedStages.map((stage) =>
        stage.id === "winner-selected" ? { ...stage, label: "Different winner selected" } : stage,
      ),
    });

    assert.equal(verification.ok, false);
    assert.equal(verification.status, "mismatch");
  });

  it("missing originalProofHash fails safely", () => {
    const proofPackage = buildSealedAuctionProofPackage({ config, privateBids });
    const verification = verifySealedAuctionProofPackage({
      ...proofPackage,
      originalProofHash: "",
    });

    assert.equal(verification.ok, false);
    assert.equal(verification.status, "missing-original-proof-hash");
    assert.equal(verification.match, false);
  });

  it("does not expose raw bidder ids or salts in the public package", () => {
    const proofPackage = buildSealedAuctionProofPackage({ config, privateBids });
    const serialized = JSON.stringify(proofPackage).toLowerCase();

    assert.notInclude(serialized, "bidder-alpha");
    assert.notInclude(serialized, "bidder-bravo");
    assert.notInclude(serialized, "bidder-charlie");
    assert.notInclude(serialized, "private-salt");
  });

  it("does not issue proof when no bid satisfies starting price", () => {
    assert.throws(
      () =>
        buildSealedAuctionProofPackage({
          config: { ...config, startingPrice: 5000 },
          privateBids,
        }),
      /No bid satisfies the starting price/,
    );
  });
});
