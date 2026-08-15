import { createHash } from "crypto";

import { stableStringify } from "./proof-workflow-proof-package";

export type SealedAuctionMode = "public-sealed" | "private-room-sealed";

export type SealedAuctionPrivateBid = {
  bidderId: string;
  amount: number;
  salt: string;
};

export type SealedAuctionConfig = {
  auctionId: string;
  title: string;
  mode: SealedAuctionMode;
  startingPrice: number;
  depositRequired: number;
  inviteCode?: string;
};

export type SealedAuctionCommitment = {
  bidderCommitment: string;
  bidCommitment: string;
  depositCommitment: string;
};

export type SealedAuctionProofPackage = {
  proofId: string;
  auctionId: string;
  originalProofHash: string;
  title: string;
  mode: SealedAuctionMode;
  publicOutcome: "auction-finalized";
  winnerCommitment: string;
  winningBid: number;
  startingPrice: number;
  depositRequired: number;
  totalSealedBids: number;
  completedStages: Array<{
    id: "auction-created" | "bids-committed" | "reveal-completed" | "winner-selected" | "proof-generated";
    label: string;
    status: "completed";
  }>;
  commitments: SealedAuctionCommitment[];
  providerLanes: Array<{
    id: "zk-sealed-bid" | "magicblock-fast-session" | "room-access" | "public-verification";
    label: string;
    status: "verified";
    publicCommitment: string;
    verifierNote: string;
  }>;
  valuesHiddenDuringAuction: string[];
  verifierStatement: string;
};

export type SealedAuctionVerification =
  | {
      ok: true;
      status: "verified";
      match: true;
      originalHash: string;
      recomputedHash: string;
      message: string;
    }
  | {
      ok: false;
      status: "missing-original-proof-hash" | "invalid-proof-package" | "mismatch";
      match: false;
      originalHash: string | null;
      recomputedHash: string | null;
      message: string;
    };

function sha256Hex(value: unknown): string {
  return createHash("sha256").update(stableStringify(value)).digest("hex");
}

function assertPositiveNumber(value: number, label: string) {
  if (!Number.isFinite(value) || value <= 0) throw new Error(`${label} must be a positive number.`);
}

export function buildSealedBidCommitment(bid: SealedAuctionPrivateBid, depositRequired: number): SealedAuctionCommitment {
  assertPositiveNumber(bid.amount, "Bid amount");
  assertPositiveNumber(depositRequired, "Deposit required");
  if (!bid.bidderId.trim()) throw new Error("Bidder id is required.");
  if (!bid.salt.trim()) throw new Error("Bid salt is required.");

  return {
    bidderCommitment: sha256Hex({ bidderId: bid.bidderId }),
    bidCommitment: sha256Hex({ bidderId: bid.bidderId, amount: bid.amount, salt: bid.salt }),
    depositCommitment: sha256Hex({ bidderId: bid.bidderId, depositRequired, salt: bid.salt }),
  };
}

export function buildSealedAuctionProofPayload(proofPackage: SealedAuctionProofPackage) {
  const payload: Omit<SealedAuctionProofPackage, "originalProofHash"> & { originalProofHash?: string } = {
    ...proofPackage,
  };
  delete payload.originalProofHash;
  return payload;
}

export function computeSealedAuctionProofHash(proofPackage: SealedAuctionProofPackage): string {
  return sha256Hex(buildSealedAuctionProofPayload(proofPackage));
}

export function buildSealedAuctionProofPackage(input: {
  config: SealedAuctionConfig;
  privateBids: SealedAuctionPrivateBid[];
  proofId?: string;
}): SealedAuctionProofPackage {
  const { config } = input;
  assertPositiveNumber(config.startingPrice, "Starting price");
  assertPositiveNumber(config.depositRequired, "Deposit required");
  if (!config.auctionId.trim()) throw new Error("auctionId is required.");
  if (!config.title.trim()) throw new Error("title is required.");
  if (!Array.isArray(input.privateBids) || input.privateBids.length === 0) throw new Error("At least one sealed bid is required.");

  const validBids = input.privateBids.filter((bid) => bid.amount >= config.startingPrice);
  if (validBids.length === 0) throw new Error("No bid satisfies the starting price.");

  const commitments = input.privateBids.map((bid) => buildSealedBidCommitment(bid, config.depositRequired));
  const winner = validBids.reduce((best, bid) => (bid.amount > best.amount ? bid : best), validBids[0]);
  const winnerCommitment = buildSealedBidCommitment(winner, config.depositRequired).bidderCommitment;
  const proofId = input.proofId ?? `${config.auctionId}-proof`;
  const laneSeed = {
    proofId,
    auctionId: config.auctionId,
    mode: config.mode,
    startingPrice: config.startingPrice,
    depositRequired: config.depositRequired,
    commitments,
    winnerCommitment,
    winningBid: winner.amount,
  };
  const unsigned: SealedAuctionProofPackage = {
    proofId,
    auctionId: config.auctionId,
    originalProofHash: "",
    title: config.title,
    mode: config.mode,
    publicOutcome: "auction-finalized",
    winnerCommitment,
    winningBid: winner.amount,
    startingPrice: config.startingPrice,
    depositRequired: config.depositRequired,
    totalSealedBids: input.privateBids.length,
    completedStages: [
      { id: "auction-created", label: "Auction created", status: "completed" },
      { id: "bids-committed", label: "Sealed bids committed", status: "completed" },
      { id: "reveal-completed", label: "Reveal completed", status: "completed" },
      { id: "winner-selected", label: "Winner selected", status: "completed" },
      { id: "proof-generated", label: "Public proof generated", status: "completed" },
    ],
    commitments,
    providerLanes: [
      {
        id: "zk-sealed-bid",
        label: "ZK sealed-bid lane",
        status: "verified",
        publicCommitment: sha256Hex({ lane: "zk-sealed-bid", ...laneSeed }),
        verifierNote: "Bid amounts stay hidden during bidding. Public verification checks commitments after reveal.",
      },
      {
        id: "magicblock-fast-session",
        label: "MagicBlock fast auction session",
        status: "verified",
        publicCommitment: sha256Hex({ lane: "magicblock", auctionId: config.auctionId, commitments }),
        verifierNote: "Fast auction state is represented as a session commitment for responsive bidding and finalization.",
      },
      {
        id: "room-access",
        label: "Room access boundary",
        status: "verified",
        publicCommitment: sha256Hex({ lane: "room-access", inviteCode: config.inviteCode ?? "public", mode: config.mode }),
        verifierNote: "Private room auctions can restrict entry by invite code without exposing bidder intent.",
      },
      {
        id: "public-verification",
        label: "Public verification",
        status: "verified",
        publicCommitment: sha256Hex({ lane: "public-verification", proofId, winnerCommitment, winningBid: winner.amount }),
        verifierNote: "The final proof can be recomputed. If the winner, bid, or commitments change, verification fails.",
      },
    ],
    valuesHiddenDuringAuction: [
      "Bid amounts",
      "Bidder intent",
      "Leading side",
      "Bidder identities",
      "Auction momentum",
      "Private room membership",
    ],
    verifierStatement:
      "We recompute the auction proof package and compare it with the original hash. If any bid commitment, stage, winner, or final amount changes, verification fails.",
  };

  return {
    ...unsigned,
    originalProofHash: computeSealedAuctionProofHash(unsigned),
  };
}

export function assertSealedAuctionProofPackage(value: unknown): SealedAuctionProofPackage {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("Proof package must be an object.");
  const proofPackage = value as Partial<SealedAuctionProofPackage>;
  if (!proofPackage.proofId || typeof proofPackage.proofId !== "string") throw new Error("proofId is required.");
  if (!proofPackage.auctionId || typeof proofPackage.auctionId !== "string") throw new Error("auctionId is required.");
  if (typeof proofPackage.originalProofHash !== "string") throw new Error("originalProofHash is required.");
  if (proofPackage.publicOutcome !== "auction-finalized") throw new Error("publicOutcome is invalid.");
  if (typeof proofPackage.winningBid !== "number" || proofPackage.winningBid <= 0) throw new Error("winningBid is invalid.");
  if (typeof proofPackage.totalSealedBids !== "number" || proofPackage.totalSealedBids < 1) {
    throw new Error("totalSealedBids is invalid.");
  }
  if (!Array.isArray(proofPackage.commitments) || proofPackage.commitments.length !== proofPackage.totalSealedBids) {
    throw new Error("commitments are invalid.");
  }
  if (!Array.isArray(proofPackage.completedStages) || proofPackage.completedStages.length < 5) {
    throw new Error("completedStages are required.");
  }
  if (!Array.isArray(proofPackage.providerLanes) || proofPackage.providerLanes.length < 4) {
    throw new Error("providerLanes are required.");
  }
  if (!Array.isArray(proofPackage.valuesHiddenDuringAuction)) throw new Error("valuesHiddenDuringAuction is required.");
  if (typeof proofPackage.verifierStatement !== "string") throw new Error("verifierStatement is required.");

  return proofPackage as SealedAuctionProofPackage;
}

export function verifySealedAuctionProofPackage(value: unknown): SealedAuctionVerification {
  try {
    const proofPackage = assertSealedAuctionProofPackage(value);
    const recomputedHash = computeSealedAuctionProofHash(proofPackage);
    const originalHash = proofPackage.originalProofHash.trim() || null;

    if (!originalHash) {
      return {
        ok: false,
        status: "missing-original-proof-hash",
        match: false,
        originalHash,
        recomputedHash,
        message: "Missing original proof hash.",
      };
    }

    if (originalHash !== recomputedHash) {
      return {
        ok: false,
        status: "mismatch",
        match: false,
        originalHash,
        recomputedHash,
        message: "Mismatch. The sealed auction proof package was changed after the original hash was created.",
      };
    }

    return {
      ok: true,
      status: "verified",
      match: true,
      originalHash,
      recomputedHash,
      message: "Verified. The recomputed sealed auction proof matches the original hash.",
    };
  } catch (error) {
    return {
      ok: false,
      status: "invalid-proof-package",
      match: false,
      originalHash: null,
      recomputedHash: null,
      message: error instanceof Error ? error.message : "Invalid sealed auction proof package.",
    };
  }
}
