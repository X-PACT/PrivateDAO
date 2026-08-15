"use client";

import { useMemo, useState } from "react";
import { CheckCircle2, LockKeyhole, ShieldCheck, WalletCards } from "lucide-react";
import { useWallet, type AnchorWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { BN } from "@coral-xyz/anchor";
import { PublicKey } from "@solana/web3.js";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  AUCTION_PROGRAM_ID,
  createAuctionClient,
  type AuctionAddresses,
} from "@/lib/privatedao-auction-client";

const DEVNET_TEE_VALIDATOR = new PublicKey("MTEWGuqxUpYZGFJQcp8tLN7x5v9BSeoFHYWQQ3n3xzo");

type Step = "idle" | "created" | "active" | "private" | "submitted" | "closed" | "finalized" | "anchored";

function bytesFromHex(hex: string) {
  return new Uint8Array(hex.match(/.{1,2}/g)?.map((value) => Number.parseInt(value, 16)) ?? []);
}

async function digestBytes(value: Uint8Array | string) {
  const input = typeof value === "string" ? new TextEncoder().encode(value) : value;
  const owned = new Uint8Array(input);
  return new Uint8Array(await crypto.subtle.digest("SHA-256", owned.buffer as ArrayBuffer));
}

function randomBytes(size: number) {
  const value = new Uint8Array(size);
  crypto.getRandomValues(value);
  return value;
}

export function ConfidentialAuctionWorkbench() {
  const { connected, publicKey, signMessage, signTransaction, signAllTransactions } = useWallet();
  const [title, setTitle] = useState("Private vendor selection");
  const [closeInSeconds, setCloseInSeconds] = useState("180");
  const [bidderWallet, setBidderWallet] = useState("");
  const [bidAmount, setBidAmount] = useState("");
  const [bidSalt, setBidSalt] = useState("");
  const [step, setStep] = useState<Step>("idle");
  const [addresses, setAddresses] = useState<AuctionAddresses>();
  const [authorizationAddress, setAuthorizationAddress] = useState<PublicKey>();
  const [authorizationAddresses, setAuthorizationAddresses] = useState<PublicKey[]>([]);
  const [commitSignature, setCommitSignature] = useState<string>();
  const [receiptAddress, setReceiptAddress] = useState<PublicKey>();
  const [deadlineAt, setDeadlineAt] = useState<number>();
  const [error, setError] = useState<string>();
  const [technical, setTechnical] = useState(false);

  const wallet = useMemo<AnchorWallet | undefined>(() => {
    if (!publicKey || !signTransaction || !signAllTransactions) return undefined;
    return { publicKey, signTransaction, signAllTransactions };
  }, [publicKey, signAllTransactions, signTransaction]);

  async function client() {
    if (!wallet || !signMessage) throw new Error("Connect a wallet that supports message signing first.");
    return createAuctionClient(wallet, signMessage);
  }

  async function createAuction() {
    try {
      setError(undefined);
      const auctionClient = await client();
      const auctionId = randomBytes(32);
      const now = Math.floor(Date.now() / 1000);
      const deadline = now + Math.max(60, Number(closeInSeconds) || 180);
      const nextAddresses = auctionClient.addressesFor(auctionId);
      await auctionClient.initialize({
        auctionId,
        biddingStart: now + 10,
        biddingDeadline: deadline,
        rulesDigest: await digestBytes(`${title}:highest-valid-bid:v1`),
        policyDigest: await digestBytes("pseudonymous-bidders:private-bids:public-result:v1"),
        discloseWinningAmount: true,
        allowBidUpdates: false,
      });
      setAddresses(nextAddresses);
      setDeadlineAt(deadline);
      setStep("created");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Auction creation failed.");
    }
  }

  async function activate() {
    try {
      if (!addresses) throw new Error("Create the auction first.");
      await new Promise((resolve) => window.setTimeout(resolve, 11_000));
      const auctionClient = await client();
      await auctionClient.activate(addresses);
      setStep("active");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Auction activation failed.");
    }
  }

  async function authorize() {
    try {
      if (!addresses) throw new Error("Create the auction first.");
      const auctionClient = await client();
      const bidderKeys = bidderWallet.split(/[\s,]+/).map((value) => value.trim()).filter(Boolean).map((value) => new PublicKey(value));
      if (bidderKeys.length === 0) throw new Error("Enter at least one bidder wallet address.");
      const authorizationKeys: PublicKey[] = [];
      const signatures: string[] = [];
      for (const bidder of bidderKeys) {
        const commitment = await digestBytes(new TextEncoder().encode(`bidder:${bidder.toBase58()}`));
        signatures.push(await auctionClient.authorizeBidder(addresses, commitment, bidder));
        authorizationKeys.push(PublicKey.findProgramAddressSync(
          [Buffer.from("authorization"), addresses.config.toBuffer(), Buffer.from(commitment)],
          AUCTION_PROGRAM_ID,
        )[0]);
      }
      setAuthorizationAddresses(authorizationKeys);
      setAuthorizationAddress(authorizationKeys[0]);
      setError(`${authorizationKeys.length} bidder(s) authorized. Transactions: ${signatures.join(", ")}`);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Bidder authorization failed.");
    }
  }

  async function startPrivateSession() {
    try {
      if (!addresses || authorizationAddresses.length === 0) throw new Error("Authorize at least one bidder first.");
      const auctionClient = await client();
      await auctionClient.delegate(addresses, DEVNET_TEE_VALIDATOR);
      await auctionClient.initPermission(addresses, authorizationAddresses);
      setStep("private");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Private session could not start.");
    }
  }

  async function submitBid() {
    try {
      if (!addresses || !authorizationAddress || !publicKey) throw new Error("Connect the authorized bidder wallet first.");
      const amount = Number(bidAmount);
      if (!Number.isSafeInteger(amount) || amount <= 0) throw new Error("Enter a positive whole-number bid.");
      const auctionClient = await client();
      const commitment = await digestBytes(new TextEncoder().encode(`bidder:${publicKey.toBase58()}`));
      await auctionClient.submitPrivateBid(addresses, commitment, new BN(amount), await digestBytes(bidSalt || crypto.randomUUID()), 0, authorizationAddress);
      setStep("submitted");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Private bid failed.");
    }
  }

  async function finalize() {
    try {
      if (!addresses) throw new Error("Create the auction first.");
      if (deadlineAt && Math.floor(Date.now() / 1000) < deadlineAt) {
        throw new Error(`Bidding is still open. It closes in ${deadlineAt - Math.floor(Date.now() / 1000)} seconds.`);
      }
      const auctionClient = await client();
      await auctionClient.closeBidding(addresses);
      setStep("closed");
      await auctionClient.finalizePrivateResult(addresses);
      setStep("finalized");
      const signature = await auctionClient.commitAndUndelegate(addresses);
      const signatureStatus = await auctionClient.teeConnection.getSignatureStatuses([signature]);
      const confirmation = signatureStatus.value[0]?.confirmationStatus;
      if (confirmation !== "confirmed" && confirmation !== "finalized") {
        throw new Error("The final Solana commitment was submitted but is not confirmed yet.");
      }
      const slot = await auctionClient.teeConnection.getSlot("confirmed");
      const receiptId = await digestBytes(`${addresses.config.toBase58()}:${signature}`);
      await auctionClient.finalizeReceipt(addresses, receiptId, signature, slot);
      setCommitSignature(signature);
      setReceiptAddress(addresses.receipt);
      setStep("anchored");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Finalization or Solana anchoring failed.");
    }
  }

  return (
    <section className="grid gap-5 rounded-[28px] border border-cyan-300/16 bg-cyan-300/[0.055] p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.25em] text-cyan-100/76">
            <LockKeyhole className="h-4 w-4" /> Private Auction
          </div>
          <h2 className="mt-3 text-3xl font-semibold tracking-[-0.035em] text-white">Choose a winner without exposing live bids.</h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-white/64">Offers stay private while the auction is open. After closing, the result becomes easy to share and verify without asking anyone to connect a wallet.</p>
        </div>
        <WalletMultiButton className={cn(buttonVariants({ size: "sm" }))} />
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        {["Create auction", "Invite bidders", "Verify result"].map((label, index) => (
          <div key={label} className={cn("rounded-2xl border p-4", index <= ["idle", "created", "active", "private", "submitted", "closed", "finalized", "anchored"].indexOf(step) ? "border-cyan-200/40 bg-cyan-200/[0.08]" : "border-white/10 bg-black/20")}>
            <div className="text-xs text-white/48">0{index + 1}</div>
            <div className="mt-2 font-medium text-white">{label}</div>
          </div>
        ))}
      </div>

      {!connected ? <div className="rounded-2xl border border-amber-200/20 bg-amber-200/[0.06] p-4 text-sm text-amber-100/80">Connect a Solana wallet to create or join a private auction.</div> : null}

      <div className="grid gap-4 md:grid-cols-2">
        <label className="grid gap-2 text-sm text-white/70">What are people bidding for?
          <input value={title} onChange={(event) => setTitle(event.target.value)} className="rounded-2xl border border-white/10 bg-black/30 px-3 py-3 text-white outline-none focus:border-cyan-200/60" />
        </label>
        <label className="grid gap-2 text-sm text-white/70">Bidding closes after (seconds)
          <input value={closeInSeconds} onChange={(event) => setCloseInSeconds(event.target.value)} inputMode="numeric" className="rounded-2xl border border-white/10 bg-black/30 px-3 py-3 text-white outline-none focus:border-cyan-200/60" />
        </label>
      </div>

      <div className="flex flex-wrap gap-3">
        <button disabled={!connected || step !== "idle"} onClick={createAuction} className={cn(buttonVariants({ size: "sm" }), "disabled:cursor-not-allowed disabled:opacity-40")}><WalletCards className="h-4 w-4" /> Create auction</button>
        <button disabled={step !== "created"} onClick={activate} className={cn(buttonVariants({ size: "sm", variant: "outline" }), "disabled:cursor-not-allowed disabled:opacity-40")}>Start bidding</button>
        <button disabled={step !== "submitted" && step !== "private"} onClick={finalize} className={cn(buttonVariants({ size: "sm", variant: "outline" }), "disabled:cursor-not-allowed disabled:opacity-40")}>Close and verify result</button>
      </div>

      {addresses && (step === "active" || step === "private" || step === "submitted") ? <div className="grid gap-4 rounded-2xl border border-white/10 bg-black/20 p-4 md:grid-cols-2">
        <div className="grid gap-3">
          <div className="text-sm font-medium text-white">Invite a bidder</div>
          <input value={bidderWallet} onChange={(event) => setBidderWallet(event.target.value)} placeholder="Bidder wallet address" className="rounded-2xl border border-white/10 bg-black/30 px-3 py-3 font-mono text-xs text-white outline-none focus:border-cyan-200/60" />
          <button onClick={authorize} className={cn(buttonVariants({ size: "sm", variant: "outline" }))}>Authorize bidder</button>
          <button onClick={startPrivateSession} disabled={!authorizationAddress || step === "private"} className={cn(buttonVariants({ size: "sm", variant: "outline" }), "disabled:opacity-40")}>Open private bidding</button>
        </div>
        <div className="grid gap-3">
          <div className="text-sm font-medium text-white">Your private bid</div>
          <input value={bidAmount} onChange={(event) => setBidAmount(event.target.value)} placeholder="Amount" inputMode="numeric" className="rounded-2xl border border-white/10 bg-black/30 px-3 py-3 text-white outline-none focus:border-cyan-200/60" />
          <input value={bidSalt} onChange={(event) => setBidSalt(event.target.value)} placeholder="Private passphrase" type="password" className="rounded-2xl border border-white/10 bg-black/30 px-3 py-3 text-white outline-none focus:border-cyan-200/60" />
          <button onClick={submitBid} disabled={step !== "private"} className={cn(buttonVariants({ size: "sm" }), "disabled:opacity-40")}>Submit private bid</button>
        </div>
      </div> : null}

      {step === "anchored" && receiptAddress ? <div className="rounded-2xl border border-emerald-200/25 bg-emerald-200/[0.07] p-4 text-sm text-emerald-50"><div className="flex items-center gap-2 font-semibold"><CheckCircle2 className="h-4 w-4" /> Result committed and ready to verify</div><a className="mt-3 block break-all underline" href={`/verify/auction?receiptId=${receiptAddress.toBase58()}`}>Open public verification page</a>{commitSignature ? <div className="mt-2 break-all font-mono text-xs text-emerald-100/70">Solana reference: {commitSignature}</div> : null}</div> : null}
      {error ? <div className="rounded-2xl border border-red-200/25 bg-red-200/[0.07] p-4 text-sm text-red-100">{error}</div> : null}

      <button onClick={() => setTechnical((value) => !value)} className="flex items-center gap-2 text-left text-xs text-white/48 hover:text-white/80"><ShieldCheck className="h-4 w-4" /> {technical ? "Hide verification details" : "Verification details"}</button>
      {technical ? <div className="grid gap-2 rounded-2xl border border-white/10 bg-black/20 p-4 text-xs text-white/50"><div>Private offers are not shown during bidding.</div><div>The final result is recorded and independently checked before the receipt is issued.</div><div>This preview currently runs on Solana Devnet.</div></div> : null}
    </section>
  );
}
