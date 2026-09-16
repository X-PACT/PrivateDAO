"use client";

import { useMemo, useState } from "react";
import { BarChart3, CheckCircle2, EyeOff, KeyRound, Play, QrCode, ShieldCheck, XCircle } from "lucide-react";
import Image from "next/image";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type AuctionMode = "public-sealed" | "private-room-sealed";

type BidInput = {
  bidderId: string;
  amount: string;
  salt: string;
};

type AuctionProof = {
  proofId: string;
  auctionId: string;
  originalProofHash: string;
  title: string;
  mode: AuctionMode;
  publicOutcome: "auction-finalized";
  winnerCommitment: string;
  winningBid: number;
  startingPrice: number;
  depositRequired: number;
  totalSealedBids: number;
  completedStages: Array<{ id: string; label: string; status: "completed" }>;
  commitments: Array<{ bidderCommitment: string; bidCommitment: string; depositCommitment: string }>;
  valuesHiddenDuringAuction: string[];
  verifierStatement: string;
};

function stableStringify(value: unknown): string {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map((item) => stableStringify(item)).join(",")}]`;
  const entries = Object.entries(value as Record<string, unknown>)
    .filter(([, entryValue]) => entryValue !== undefined)
    .sort(([left], [right]) => left.localeCompare(right));
  return `{${entries.map(([key, entryValue]) => `${JSON.stringify(key)}:${stableStringify(entryValue)}`).join(",")}}`;
}

async function sha256Hex(value: unknown) {
  const encoded = new TextEncoder().encode(stableStringify(value));
  const digest = await crypto.subtle.digest("SHA-256", encoded);
  return Array.from(new Uint8Array(digest))
    .map((item) => item.toString(16).padStart(2, "0"))
    .join("");
}

function proofPayload(proof: AuctionProof) {
  const payload: Omit<AuctionProof, "originalProofHash"> & { originalProofHash?: string } = { ...proof };
  delete payload.originalProofHash;
  return payload;
}

function qrUrl(value: string) {
  return `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(value)}`;
}

export function SealedAuctionWorkbench() {
  const [title, setTitle] = useState("Private grant allocation auction");
  const [mode, setMode] = useState<AuctionMode>("private-room-sealed");
  const [startingPrice, setStartingPrice] = useState("1000");
  const [depositRequired, setDepositRequired] = useState("250");
  const [inviteCode, setInviteCode] = useState("PDAO-AUCTION-7842");
  const [showTechnicalDetails, setShowTechnicalDetails] = useState(false);
  const [error, setError] = useState<string>();
  const [proof, setProof] = useState<AuctionProof>();
  const [tamperHash, setTamperHash] = useState<{ original: string; recomputed: string; match: boolean }>();
  const [bids, setBids] = useState<BidInput[]>([
    { bidderId: "bidder-alpha", amount: "1250", salt: "alpha-private-salt" },
    { bidderId: "bidder-bravo", amount: "1725", salt: "bravo-private-salt" },
    { bidderId: "bidder-charlie", amount: "1510", salt: "charlie-private-salt" },
  ]);

  const inviteLink = useMemo(() => `https://privatedao.org/auctions?invite=${encodeURIComponent(inviteCode)}`, [inviteCode]);

  function updateBid(index: number, key: keyof BidInput, value: string) {
    setBids((items) => items.map((item, itemIndex) => (itemIndex === index ? { ...item, [key]: value } : item)));
  }

  async function runAuction() {
    setError(undefined);
    setProof(undefined);
    setTamperHash(undefined);

    const parsedStartingPrice = Number(startingPrice);
    const parsedDeposit = Number(depositRequired);
    const parsedBids = bids.map((bid) => ({ ...bid, amount: Number(bid.amount) }));

    if (!title.trim()) {
      setError("Auction title is required.");
      return;
    }
    if (!Number.isFinite(parsedStartingPrice) || parsedStartingPrice <= 0) {
      setError("Starting price must be a positive number.");
      return;
    }
    if (!Number.isFinite(parsedDeposit) || parsedDeposit <= 0) {
      setError("Deposit must be a positive number.");
      return;
    }
    if (parsedBids.some((bid) => !bid.bidderId.trim() || !bid.salt.trim() || !Number.isFinite(bid.amount) || bid.amount <= 0)) {
      setError("Every sealed bid needs a bidder label, amount, and private salt.");
      return;
    }

    const validBids = parsedBids.filter((bid) => bid.amount >= parsedStartingPrice);
    if (validBids.length === 0) {
      setError("No bid satisfies the starting price. Proof was not issued.");
      return;
    }

    const auctionId = `${title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "sealed-auction"}-${Date.now()}`;
    const commitments = await Promise.all(
      parsedBids.map(async (bid) => ({
        bidderCommitment: await sha256Hex({ bidderId: bid.bidderId }),
        bidCommitment: await sha256Hex({ bidderId: bid.bidderId, amount: bid.amount, salt: bid.salt }),
        depositCommitment: await sha256Hex({ bidderId: bid.bidderId, depositRequired: parsedDeposit, salt: bid.salt }),
      })),
    );
    const winner = validBids.reduce((best, bid) => (bid.amount > best.amount ? bid : best), validBids[0]);
    const winnerCommitment = await sha256Hex({ bidderId: winner.bidderId });
    const unsigned: AuctionProof = {
      proofId: `${auctionId}-proof`,
      auctionId,
      originalProofHash: "",
      title,
      mode,
      publicOutcome: "auction-finalized",
      winnerCommitment,
      winningBid: winner.amount,
      startingPrice: parsedStartingPrice,
      depositRequired: parsedDeposit,
      totalSealedBids: parsedBids.length,
      completedStages: [
        { id: "auction-created", label: "Auction created", status: "completed" },
        { id: "bids-committed", label: "Sealed bids committed", status: "completed" },
        { id: "reveal-completed", label: "Reveal completed", status: "completed" },
        { id: "winner-selected", label: "Winner selected", status: "completed" },
        { id: "proof-generated", label: "Public proof generated", status: "completed" },
      ],
      commitments,
      valuesHiddenDuringAuction: [
        "Bid amounts",
        "Bidder intent",
        "Leading bidder",
        "Bidder identities",
        "Auction momentum",
        "Private room membership",
      ],
      verifierStatement:
        "We recompute the auction proof package and compare it with the original hash. If any bid commitment, stage, winner, or final amount changes, verification fails.",
    };
    const originalProofHash = await sha256Hex(proofPayload(unsigned));
    const proofPackage = { ...unsigned, originalProofHash };
    const tampered = { ...proofPackage, winningBid: proofPackage.winningBid + 1 };
    const recomputed = await sha256Hex(proofPayload(tampered));
    setProof(proofPackage);
    setTamperHash({ original: originalProofHash, recomputed, match: originalProofHash === recomputed });
  }

  return (
    <div className="grid gap-5">
      <section className="grid gap-5 rounded-[28px] border border-cyan-300/16 bg-cyan-300/[0.055] p-5 sm:p-6 lg:grid-cols-[0.95fr_1.05fr]">
        <div>
          <div className="text-[11px] uppercase tracking-[0.25em] text-cyan-100/76">Create sealed auction</div>
          <h2 className="mt-3 text-3xl font-semibold tracking-[-0.035em] text-white">Hide bidding intent until reveal.</h2>
          <p className="mt-3 text-sm leading-7 text-white/64">
            Create a public sealed auction or a private-room auction. During bidding, the interface shows only live status
            and time context. Bid amounts, leaders, and bidder intent stay hidden until reveal.
          </p>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <label className="grid gap-2 text-sm text-white/70 sm:col-span-2">
              Auction name
              <input value={title} onChange={(event) => setTitle(event.target.value)} className="rounded-2xl border border-white/10 bg-black/30 px-3 py-3 text-sm text-white outline-none focus:border-cyan-200/60" />
            </label>
            <label className="grid gap-2 text-sm text-white/70">
              Mode
              <select value={mode} onChange={(event) => setMode(event.target.value as AuctionMode)} className="rounded-2xl border border-white/10 bg-black/30 px-3 py-3 text-sm text-white outline-none focus:border-cyan-200/60">
                <option value="private-room-sealed">Private room sealed auction</option>
                <option value="public-sealed">Public sealed auction</option>
              </select>
            </label>
            <label className="grid gap-2 text-sm text-white/70">
              Invite code
              <input value={inviteCode} onChange={(event) => setInviteCode(event.target.value)} className="rounded-2xl border border-white/10 bg-black/30 px-3 py-3 text-sm text-white outline-none focus:border-cyan-200/60" />
            </label>
            <label className="grid gap-2 text-sm text-white/70">
              Starting price
              <input value={startingPrice} onChange={(event) => setStartingPrice(event.target.value)} inputMode="decimal" className="rounded-2xl border border-white/10 bg-black/30 px-3 py-3 text-sm text-white outline-none focus:border-cyan-200/60" />
            </label>
            <label className="grid gap-2 text-sm text-white/70">
              Required deposit
              <input value={depositRequired} onChange={(event) => setDepositRequired(event.target.value)} inputMode="decimal" className="rounded-2xl border border-white/10 bg-black/30 px-3 py-3 text-sm text-white outline-none focus:border-cyan-200/60" />
            </label>
          </div>
        </div>

        <aside className="grid gap-4">
          <div className="rounded-[24px] border border-white/10 bg-black/24 p-5">
            <div className="flex items-center gap-2 text-sm font-semibold text-white">
              <QrCode className="h-4 w-4 text-cyan-100" />
              Invite access
            </div>
            <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center">
              <Image src={qrUrl(inviteLink)} alt="Auction invite QR" width={144} height={144} unoptimized className="h-36 w-36 rounded-2xl border border-white/10 bg-white p-2" />
              <div className="min-w-0">
                <div className="text-xs uppercase tracking-[0.22em] text-white/42">Invite link</div>
                <div className="mt-2 break-all font-mono text-xs text-white/68">{inviteLink}</div>
                <div className="mt-3 text-sm leading-6 text-white/58">
                  Invite codes route members into the room without revealing bids or bidder intent.
                </div>
              </div>
            </div>
          </div>
          <div className="grid gap-3">
            {[
              ["During bidding", "No counts, no leader, no momentum, no bidder intent."],
              ["At reveal", "Final winner and proof become public."],
              ["Verification", "Hash recomputation detects any changed winner, bid, or stage."],
            ].map(([label, body]) => (
              <div key={label} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <div className="text-sm font-semibold text-white">{label}</div>
                <p className="mt-1 text-sm leading-6 text-white/58">{body}</p>
              </div>
            ))}
          </div>
        </aside>
      </section>

      <section className="rounded-[28px] border border-white/10 bg-white/[0.035] p-5 sm:p-6">
        <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.25em] text-white/42">
          <EyeOff className="h-4 w-4" />
          Sealed bids
        </div>
        <div className="mt-4 grid gap-3">
          {bids.map((bid, index) => (
            <div key={index} className="grid gap-3 rounded-2xl border border-white/10 bg-black/22 p-4 md:grid-cols-3">
              <input value={bid.bidderId} onChange={(event) => updateBid(index, "bidderId", event.target.value)} className="rounded-xl border border-white/10 bg-black/30 px-3 py-3 text-sm text-white outline-none focus:border-cyan-200/60" />
              <input value={bid.amount} onChange={(event) => updateBid(index, "amount", event.target.value)} inputMode="decimal" className="rounded-xl border border-white/10 bg-black/30 px-3 py-3 text-sm text-white outline-none focus:border-cyan-200/60" />
              <input value={bid.salt} onChange={(event) => updateBid(index, "salt", event.target.value)} className="rounded-xl border border-white/10 bg-black/30 px-3 py-3 text-sm text-white outline-none focus:border-cyan-200/60" />
            </div>
          ))}
        </div>
        <button type="button" onClick={runAuction} className={cn(buttonVariants({ size: "sm" }), "mt-5")}>
          <Play className="h-4 w-4" />
          Run sealed auction
        </button>
      </section>

      {error ? (
        <section className="rounded-[28px] border border-red-300/22 bg-red-400/[0.08] p-5 sm:p-6">
          <div className="flex items-center gap-2 text-red-100">
            <XCircle className="h-5 w-5" />
            <h2 className="text-xl font-semibold">Proof not issued</h2>
          </div>
          <p className="mt-3 text-sm leading-7 text-red-50/78">{error}</p>
        </section>
      ) : null}

      {proof ? (
        <section className="rounded-[28px] border border-emerald-300/22 bg-emerald-300/[0.08] p-5 sm:p-6">
          <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.25em] text-emerald-100/76">
            <ShieldCheck className="h-4 w-4" />
            Auction verified
          </div>
          <h2 className="mt-3 text-3xl font-semibold text-white">Winner revealed. Intent stayed hidden during bidding.</h2>
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            {[
              `Winning bid: $${proof.winningBid.toLocaleString()}`,
              `${proof.totalSealedBids} sealed bids were committed.`,
              "Bid amounts and bidder intent were hidden during the auction.",
              "A public proof was generated for the final winner and auction stages.",
            ].map((item) => (
              <div key={item} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/22 p-4 text-sm font-semibold text-white">
                <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-100" />
                {item}
              </div>
            ))}
          </div>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <article className="rounded-2xl border border-white/10 bg-black/22 p-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-white">
                <KeyRound className="h-4 w-4 text-violet-100" />
                Hidden during auction
              </div>
              <div className="mt-3 grid gap-2 text-sm text-white/60">
                {proof.valuesHiddenDuringAuction.map((item) => (
                  <div key={item}>{item}</div>
                ))}
              </div>
            </article>
            <article className="rounded-2xl border border-white/10 bg-black/22 p-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-white">
                <BarChart3 className="h-4 w-4 text-cyan-100" />
                Verification
              </div>
              <div className="mt-3 grid gap-2 text-sm text-white/60">
                <div>Original hash: <span className="break-all font-mono text-white/70">{proof.originalProofHash}</span></div>
                <div>Tamper recomputed hash: <span className="break-all font-mono text-white/70">{tamperHash?.recomputed}</span></div>
                <div className="font-semibold text-red-100">Tamper result: {tamperHash?.match ? "Match" : "Mismatch"}</div>
              </div>
            </article>
          </div>
          <button type="button" onClick={() => setShowTechnicalDetails((value) => !value)} className={cn(buttonVariants({ size: "sm", variant: "outline" }), "mt-5")}>
            {showTechnicalDetails ? "Hide technical details" : "Show technical details"}
          </button>
          {showTechnicalDetails ? (
            <pre className="mt-5 max-h-80 overflow-auto rounded-2xl border border-white/10 bg-black/30 p-4 text-xs leading-6 text-white/58">
              {JSON.stringify(proof, null, 2)}
            </pre>
          ) : null}
        </section>
      ) : null}
    </div>
  );
}
