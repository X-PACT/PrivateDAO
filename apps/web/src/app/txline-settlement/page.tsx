import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ShieldCheck } from "lucide-react";

import { OperationsShell } from "@/components/operations-shell";
import { TxlineSettlementWorkbench } from "@/components/txline-settlement-workbench";
import { buttonVariants } from "@/components/ui/button";
import { buildRouteMetadata } from "@/lib/route-metadata";
import { cn } from "@/lib/utils";

const worldCupHackathonLogo =
  "/assets/txline/world-cup-hackathon-logo.png";
const pdaoMint = "9isGuumtaqvJeJeyLF44fvfskk2cv5mYsopexMBfpump";
const pdaoSwapUrl = `https://jup.ag/swap/SOL-${pdaoMint}`;

const productOutcomes = [
  "Consumer prediction flow",
  "Verifiable match outcomes",
  "Private post-match settlement",
  "Merkle / ZK proof packets",
  "Privacy-preserving settlement workflows",
  "Independent proof verification",
  "Solana Mainnet activation live",
  "World Cup-ready match pages",
  "Audit-ready settlement packets",
] as const;

const useCases = [
  "Prediction markets",
  "Community competitions",
  "Fantasy sports",
  "Reward distribution",
  "Sports insurance",
  "Enterprise settlement workflows",
  "Audit-ready verification",
] as const;

const exampleFlow = [
  "User predicts Brazil vs Japan.",
  "User pays 0.1 SOL.",
  "Match ends.",
  "TxLINE publishes the official result.",
  "PrivateDAO verifies the result.",
  "Settlement policy executes privately.",
  "Treasury distributes or unlocks rewards.",
  "A verifiable proof is generated on Solana.",
] as const;

const liveSignals = [
  ["Mainnet Active", "TxLINE subscription activated"],
  ["Provider Connected", "live-txline-provider"],
  ["Live Fixtures", "18 indexed fixtures"],
  ["Latest Receipt", "mainnet activation recorded"],
  ["Proof Verified", "demo verifier route available"],
] as const;

const settlementPipeline = [
  "Match Ends",
  "TxLINE Verification",
  "Private Settlement Policy",
  "Proof Generation",
  "Solana Receipt",
] as const;

const consumerSteps = [
  ["Predict", "Brazil vs Japan", "Choose Brazil, Japan, or draw from a simple match screen."],
  ["Pay", "0.1 SOL entry", "The wallet signs one clear payment before the market closes."],
  ["Settle", "TxLINE result", "When the match ends, TxLINE supplies the trusted result data."],
  ["Verify", "Solana proof", "PrivateDAO executes the policy and publishes a receipt users can inspect."],
] as const;

const extensionLayers = [
  ["TxLINE", "Proves the match result and supplies trusted sports data."],
  ["PrivateDAO", "Proves everything that happens after the match: policy, treasury movement, settlement, receipt, and audit trail."],
] as const;

const proofLayers = [
  ["Merkle proof", "Compact evidence that the payout set, participant set, or result packet was not changed after commitment."],
  ["Groth16 / ZK", "Private policy verification without exposing the operator's risk rules or sensitive settlement inputs."],
  ["Solana receipt", "A public verification trail that users, judges, and auditors can inspect after settlement."],
] as const;

const comparisonRows = [
  ["Sports data", "Match data", "Settlement engine"],
  ["Validation", "Official result validation", "Privacy-preserving post-match execution"],
  ["Proof", "Merkle-compatible result evidence", "Blind Verification, policy proof, and settlement hash"],
  ["Output", "API data", "Complete product: prediction, payment, settlement, proof, and receipt"],
] as const;

const pdaoPaymentUtility = [
  ["Entry access", "PDAO can become the community-aware access layer for premium match pools and settlement rooms."],
  ["Reward pools", "Community pools can denominate rewards, rebates, or participation benefits around PDAO-aligned campaigns."],
  ["Fee benefits", "Operators can design lower fees or priority verification lanes for PDAO community participants."],
  ["Treasury alignment", "Settlement revenue, proof fees, and community growth can point back to the same PrivateDAO ecosystem token."],
] as const;

export const metadata: Metadata = buildRouteMetadata({
  title: "TxLINE Match Settlement",
  description:
    "Trustless sports settlement powered by TxLINE and PrivateDAO: TxLINE proves the match result, while PrivateDAO proves the private settlement, proof workflow, treasury movement, and Solana receipt.",
  path: "/txline-settlement",
  keywords: ["TxLINE", "TxODDS", "World Cup", "prediction markets", "match settlement", "Groth16", "Solana receipt"],
});

export default function TxlineSettlementPage() {
  return (
    <OperationsShell
      eyebrow="TxODDS / TxLINE Hackathon Product"
      title="Trustless sports settlement powered by TxLINE and PrivateDAO."
      description="Every prediction market has one critical moment: settlement. Everyone can place bets. The hard part is proving the outcome without trusting the operator. TxLINE proves the match result; PrivateDAO proves the settlement."
      navigationMode="focused"
      badges={[
        { label: "TxLINE data source", variant: "cyan" },
        { label: "Blind settlement proof", variant: "violet" },
        { label: "Mainnet active", variant: "success" },
      ]}
    >
      <section className="grid gap-3 md:grid-cols-5">
        {liveSignals.map(([label, value]) => (
          <div key={label} className="rounded-2xl border border-emerald-300/16 bg-emerald-300/[0.06] p-4">
            <div className="text-[11px] uppercase tracking-[0.2em] text-emerald-100/70">{label}</div>
            <div className="mt-2 text-sm font-semibold text-white">{value}</div>
          </div>
        ))}
      </section>

      <section className="grid gap-5 rounded-[28px] border border-cyan-300/16 bg-cyan-300/[0.055] p-4 sm:p-5 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="flex flex-col justify-between gap-6">
          <div>
            <div className="flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                alt="World Cup Hackathon"
                className="h-14 w-14 rounded-2xl border border-white/10 bg-white object-contain p-2"
                src={worldCupHackathonLogo}
              />
              <div>
                <div className="text-[11px] uppercase tracking-[0.24em] text-cyan-100/76">Powered by TxLINE</div>
                <h2 className="mt-1 text-3xl font-semibold tracking-[-0.035em] text-white">Who verifies the final result?</h2>
              </div>
            </div>
            <p className="mt-4 text-sm leading-7 text-white/66">
              TxLINE proves the match. PrivateDAO proves the settlement. The user sees a simple product: predict Brazil
              vs Japan, pay 0.1 SOL, receive or claim the payout after verified settlement, and inspect the proof.
            </p>
            <p className="mt-3 max-w-3xl text-sm font-semibold leading-7 text-cyan-100">
              TxLINE proves the match result. PrivateDAO proves everything that happens after the match.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="#live-settlement" className={cn(buttonVariants({ size: "sm" }))}>
                Try Live Settlement
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/txline-settlement/verify/txline-settlement-demo" className={cn(buttonVariants({ size: "sm", variant: "outline" }))}>
                Verify demo proof
              </Link>
            </div>
          </div>
          <div className="grid gap-3 text-sm text-white/68 sm:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-black/24 p-4">
              <div className="text-[11px] uppercase tracking-[0.2em] text-cyan-100/70">Consumer match example</div>
              <div className="mt-2 text-xl">Brazil vs Japan</div>
              <div className="mt-1 text-white/58">A simple prediction screen, powered by verified match data.</div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/24 p-4">
              <div className="text-[11px] uppercase tracking-[0.2em] text-cyan-100/70">Three-minute promise</div>
              <div className="mt-2 font-semibold text-white">Predict. Pay. Settle. Verify.</div>
              <div className="mt-1 text-white/58">The fan sees a product. The operator gets infrastructure.</div>
            </div>
          </div>
        </div>
        <video
          className="aspect-video w-full rounded-[22px] border border-white/10 bg-black"
          controls
          preload="metadata"
          src="/videos/txline-settlement-demo-3min.mp4"
        />
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        {[
          ["1. Fan action", "Choose Brazil vs Japan, predict the result, and pay 0.1 SOL from a wallet."],
          ["2. Data engine", "TxLINE supplies the official sports result that settlement depends on."],
          ["3. Public trust", "PrivateDAO executes the policy, coordinates treasury, and publishes verifiable proof."],
        ].map(([title, copy]) => (
          <article key={title} className="rounded-[28px] border border-white/10 bg-white/[0.035] p-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-full border border-cyan-200/20 bg-cyan-300/[0.08] text-cyan-100">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <div className="mt-4 text-lg font-semibold text-white">{title}</div>
            <p className="mt-2 text-sm leading-7 text-white/62">{copy}</p>
          </article>
        ))}
      </section>

      <section className="rounded-[28px] border border-cyan-300/16 bg-cyan-300/[0.06] p-5 sm:p-6">
        <div className="text-[11px] uppercase tracking-[0.25em] text-cyan-100/76">Settlement pipeline</div>
        <h2 className="mt-3 max-w-4xl text-2xl font-semibold text-white">
          Official Result → Validation → Settlement Policy → Proof → Receipt
        </h2>
        <div className="mt-6 grid gap-3 lg:grid-cols-5">
          {settlementPipeline.map((item, index) => (
            <div key={item} className="relative rounded-2xl border border-white/10 bg-black/22 p-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-cyan-300/14 text-xs font-semibold text-cyan-100">
                {index + 1}
              </div>
              <div className="mt-4 text-sm font-semibold text-white">{item}</div>
              <div className="mt-2 text-xs leading-5 text-white/52">
                {index === 0 && "The fixture finishes and the market closes."}
                {index === 1 && "TxLINE confirms the trusted match result."}
                {index === 2 && "PrivateDAO applies hidden settlement rules."}
                {index === 3 && "Blind Verification and proof workflow run."}
                {index === 4 && "A public Solana receipt completes the trail."}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-[28px] border border-violet-300/16 bg-violet-300/[0.06] p-5 sm:p-6">
        <div className="text-[11px] uppercase tracking-[0.25em] text-violet-100/76">PrivateDAO extends TxLINE</div>
        <h2 className="mt-3 max-w-4xl text-2xl font-semibold text-white">
          TxLINE proves the match. PrivateDAO proves the settlement after the match.
        </h2>
        <p className="mt-3 max-w-5xl text-sm leading-7 text-white/64">
          A sports data provider can answer who won. A settlement product must also answer what happened next: which
          private policy executed, which treasury action was authorized, which users are eligible, and which public proof
          can be inspected later.
        </p>
        <div className="mt-5 grid gap-3 md:grid-cols-2">
          {extensionLayers.map(([title, body]) => (
            <article key={title} className="rounded-2xl border border-white/10 bg-black/22 p-4">
              <div className="text-base font-semibold text-white">{title}</div>
              <p className="mt-2 text-sm leading-6 text-white/62">{body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="rounded-[28px] border border-white/10 bg-white/[0.035] p-5 sm:p-6">
        <div className="text-[11px] uppercase tracking-[0.25em] text-white/46">Why not just TxLINE?</div>
        <h2 className="mt-3 max-w-4xl text-2xl font-semibold text-white">
          Because match verification is only the first half of settlement.
        </h2>
        <div className="mt-5 overflow-hidden rounded-2xl border border-white/10">
          <div className="grid grid-cols-[0.8fr_1fr_1fr] bg-black/36 text-xs font-semibold uppercase tracking-[0.18em] text-white/48">
            <div className="border-r border-white/10 p-3">Layer</div>
            <div className="border-r border-white/10 p-3">TxLINE</div>
            <div className="p-3">PrivateDAO</div>
          </div>
          {comparisonRows.map(([layer, txline, privateDao]) => (
            <div key={layer} className="grid grid-cols-[0.8fr_1fr_1fr] border-t border-white/10 text-sm">
              <div className="border-r border-white/10 p-3 font-semibold text-white/74">{layer}</div>
              <div className="border-r border-white/10 p-3 text-white/60">{txline}</div>
              <div className="p-3 text-cyan-100/82">{privateDao}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-4 rounded-[28px] border border-cyan-300/16 bg-cyan-300/[0.055] p-5 sm:p-6 lg:grid-cols-[0.88fr_1.12fr]">
        <article>
          <div className="text-[11px] uppercase tracking-[0.25em] text-cyan-100/76">Consumer product direction</div>
          <h2 className="mt-3 max-w-3xl text-2xl font-semibold text-white">
            The front door should feel like a match app, not an API.
          </h2>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-white/64">
            TxLINE Match Settlement becomes understandable when the user sees one concrete action: pick a team, pay the
            entry amount, wait for the official result, then verify the payout trail. The infrastructure remains the
            engine, but the product experience is a simple prediction and reward flow.
          </p>
          <div className="mt-5 grid gap-2">
            {consumerSteps.map(([title, label, copy]) => (
              <div key={title} className="rounded-2xl border border-white/10 bg-black/22 p-4">
                <div className="text-sm font-semibold text-cyan-100">{title}: {label}</div>
                <div className="mt-1 text-sm leading-6 text-white/62">{copy}</div>
              </div>
            ))}
          </div>
        </article>
        <article className="rounded-[26px] border border-white/10 bg-black/28 p-5">
          <div className="flex items-center justify-between gap-3 border-b border-white/10 pb-4">
            <div>
              <div className="text-[11px] uppercase tracking-[0.22em] text-white/44">World Cup prediction</div>
              <div className="mt-1 text-2xl font-semibold text-white">Brazil vs Japan</div>
            </div>
            <div className="rounded-full border border-emerald-300/24 bg-emerald-300/[0.08] px-3 py-1 text-xs font-semibold text-emerald-100">
              0.1 SOL
            </div>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            {["Brazil", "Draw", "Japan"].map((item) => (
              <div key={item} className="rounded-2xl border border-cyan-300/18 bg-cyan-300/[0.07] px-4 py-5 text-center text-sm font-semibold text-white">
                {item}
              </div>
            ))}
          </div>
          <div className="mt-5 rounded-2xl border border-emerald-300/16 bg-emerald-300/[0.06] p-4">
            <div className="text-sm font-semibold text-emerald-100">After the match</div>
            <div className="mt-2 text-sm leading-6 text-white/62">
              TxLINE confirms the official result. PrivateDAO privately applies the settlement policy, coordinates the
              reward treasury, and exposes a public proof receipt.
            </div>
          </div>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link href="/payment-gate" className={cn(buttonVariants({ size: "sm" }))}>
              Open payment gate
            </Link>
            <a href={pdaoSwapUrl} target="_blank" rel="noreferrer" className={cn(buttonVariants({ size: "sm", variant: "secondary" }))}>
              Get PDAO
            </a>
            <Link href="/txline-settlement/verify/txline-settlement-demo" className={cn(buttonVariants({ size: "sm", variant: "outline" }))}>
              Verify demo proof
            </Link>
          </div>
        </article>
      </section>

      <section className="rounded-[28px] border border-emerald-300/16 bg-emerald-300/[0.06] p-5 sm:p-6">
        <div className="text-[11px] uppercase tracking-[0.25em] text-emerald-100/76">Proof packet</div>
        <h2 className="mt-3 max-w-4xl text-2xl font-semibold text-white">
          Settlement needs proof beyond the final score.
        </h2>
        <p className="mt-3 max-w-5xl text-sm leading-7 text-white/64">
          PrivateDAO can turn a match result into an audit-ready settlement packet: Merkle commitments for compact
          inclusion checks, Groth16 / ZK posture for private policy verification, and a Solana receipt path for public
          inspection.
        </p>
        <div className="mt-5 grid gap-3 md:grid-cols-3">
          {proofLayers.map(([title, body]) => (
            <article key={title} className="rounded-2xl border border-white/10 bg-black/22 p-4">
              <div className="text-base font-semibold text-white">{title}</div>
              <p className="mt-2 text-sm leading-6 text-white/62">{body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="rounded-[28px] border border-emerald-300/16 bg-emerald-300/[0.06] p-5 sm:p-6">
        <div className="text-[11px] uppercase tracking-[0.25em] text-emerald-100/76">PDAO-aware settlement utility</div>
        <h2 className="mt-3 max-w-4xl text-2xl font-semibold text-white">
          Payments should not only collect fees. They should align the community around settlement.
        </h2>
        <p className="mt-3 max-w-5xl text-sm leading-7 text-white/64">
          The current live payment gate verifies SOL payments. The stronger product direction is token-aware settlement:
          PDAO can connect access, rewards, fee benefits, and community pools to the same TxLINE-powered match flow.
        </p>
        <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {pdaoPaymentUtility.map(([title, body]) => (
            <article key={title} className="rounded-2xl border border-white/10 bg-black/22 p-4">
              <div className="text-base font-semibold text-white">{title}</div>
              <p className="mt-2 text-sm leading-6 text-white/62">{body}</p>
            </article>
          ))}
        </div>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link href="/token/" className={cn(buttonVariants({ size: "sm" }))}>
            Open PDAO token
          </Link>
          <a href={pdaoSwapUrl} target="_blank" rel="noreferrer" className={cn(buttonVariants({ size: "sm", variant: "secondary" }))}>
            Swap SOL to PDAO
          </a>
          <Link href="/payment-gate" className={cn(buttonVariants({ size: "sm", variant: "outline" }))}>
            Live SOL payment gate
          </Link>
        </div>
      </section>

      <section className="rounded-[28px] border border-emerald-300/16 bg-emerald-300/[0.06] p-5 sm:p-6">
        <div className="text-[11px] uppercase tracking-[0.25em] text-emerald-100/76">Product announcement</div>
        <h2 className="mt-3 max-w-4xl text-2xl font-semibold text-white">Introducing TxLINE Match Settlement.</h2>
        <div className="mt-4 max-w-5xl space-y-3 text-sm leading-7 text-white/66">
          <p>
            Our first World Cup-focused infrastructure product is designed to bring verifiable settlement to
            sports-based applications on Solana.
          </p>
          <p>
            Every prediction, reward, competition, insurance trigger, or settlement ultimately depends on one question:
            can everyone trust the final result?
          </p>
          <p>
            Instead of asking users to trust a centralized service, TxLINE Match Settlement uses cryptographically
            verifiable match data to validate outcomes before settlement.
          </p>
        </div>
        <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {productOutcomes.map((item) => (
            <div key={item} className="rounded-2xl border border-white/10 bg-black/22 px-4 py-3 text-sm text-white/70">
              {item}
            </div>
          ))}
        </div>
      </section>

      <div id="live-settlement" className="scroll-mt-24">
        <TxlineSettlementWorkbench />
      </div>

      <section className="grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
        <article className="rounded-[28px] border border-cyan-300/16 bg-cyan-300/[0.06] p-5 sm:p-6">
          <div className="text-[11px] uppercase tracking-[0.25em] text-cyan-100/76">What each layer does</div>
          <h2 className="mt-3 text-2xl font-semibold text-white">TxLINE is the data source. PrivateDAO is the execution and proof layer.</h2>
          <p className="mt-3 text-sm leading-7 text-white/64">
            TxLINE provides trusted sports data. PrivateDAO provides the confidential execution, policy engine, treasury
            coordination, settlement logic, and verifiable proof layer built on top of that data.
          </p>
          <p className="mt-3 text-sm leading-7 text-white/64">
            That separation matters: applications do not only need a scoreboard. They need a private way to decide how
            funds, rewards, claims, or payouts should move once the official result is known.
          </p>
        </article>
        <article className="rounded-[28px] border border-emerald-300/16 bg-emerald-300/[0.06] p-5 sm:p-6">
          <div className="text-[11px] uppercase tracking-[0.25em] text-emerald-100/76">Example Flow</div>
          <div className="mt-5 grid gap-2">
            {exampleFlow.map((item, index) => (
              <div key={item} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/22 px-4 py-3">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-300/14 text-xs font-semibold text-emerald-100">
                  {index + 1}
                </div>
                <div className="text-sm text-white/72">{item}</div>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="grid gap-4 lg:grid-cols-[0.85fr_1.15fr]">
        <article className="rounded-[28px] border border-cyan-300/16 bg-cyan-300/[0.06] p-5 sm:p-6">
          <div className="text-[11px] uppercase tracking-[0.25em] text-cyan-100/76">World Cup match pages</div>
          <h2 className="mt-3 text-2xl font-semibold text-white">A match page should explain settlement in seconds.</h2>
          <p className="mt-3 text-sm leading-7 text-white/64">
            Each fixture can become a simple route: match identity, TxLINE validation state, settlement policy hash,
            proof status, and Solana receipt. The interface hides the engine until a reviewer wants to inspect it.
          </p>
        </article>
        <article className="rounded-[28px] border border-white/10 bg-white/[0.035] p-5 sm:p-6">
          <div className="text-[11px] uppercase tracking-[0.25em] text-white/46">Potential use cases</div>
          <div className="mt-5 grid gap-2 sm:grid-cols-2">
            {useCases.map((item) => (
              <div key={item} className="rounded-2xl border border-white/10 bg-black/22 px-4 py-3 text-sm text-white/68">
                {item}
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="rounded-[28px] border border-violet-300/16 bg-violet-300/[0.06] p-5 sm:p-6">
        <div className="text-[11px] uppercase tracking-[0.25em] text-violet-100/76">Investor version</div>
        <h2 className="mt-3 text-2xl font-semibold text-white">Prediction markets need a neutral scoreboard and a private settlement engine.</h2>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-white/64">
          TxLINE supplies cryptographically verifiable sports data. PrivateDAO turns that data into a buyer-facing
          settlement product for markets, pools, contests, and payout review. The customer gets a clean result; the
          operator keeps risk rules private; reviewers get hashes, proof status, and a receipt they can check.
        </p>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-white/64">
          This is not a sports dashboard. It is infrastructure for applications that need trusted, verifiable
          settlement. Mainnet activation is live, with public pages and reviewer-readable receipts kept separate
          from the Payment Gate product line.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link href="/developers/txline-settlement-api" className={cn(buttonVariants({ size: "sm" }))}>
            Developer API
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link href="/documents/txline-settlement-architecture" className={cn(buttonVariants({ size: "sm", variant: "outline" }))}>
            Architecture
          </Link>
        </div>
      </section>
    </OperationsShell>
  );
}
