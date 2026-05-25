import type { Metadata } from "next";
import Link from "next/link";

import { LocalizedRouteBrief } from "@/components/localized-route-brief";
import { LocalizedRouteSummary } from "@/components/localized-route-summary";
import { NormalUserOperationPath } from "@/components/normal-user-operation-path";
import { OperationsShell } from "@/components/operations-shell";
import { WalletTemplateSandbox } from "@/components/wallet-template-sandbox";
import { buttonVariants } from "@/components/ui/button";
import { buildRouteMetadata } from "@/lib/route-metadata";
import { cn } from "@/lib/utils";

const problemCards = [
  {
    title: "Governance feels like developer work",
    body: "Most DAO tools still ask normal users to understand raw proposals, wallet warnings, phase timing, explorer links, and treasury context before they can safely act.",
  },
  {
    title: "Public voting creates social pressure",
    body: "Communities need accountability, but live public intent can turn every decision into pressure, politics, or copy-trading before the vote is finished.",
  },
  {
    title: "Execution proof is scattered",
    body: "After a decision passes, users often lose the trail: what was signed, where it executed, what changed on-chain, and whether the treasury action matched the proposal.",
  },
] as const;

const solutionSteps = [
  ["Learn", "A first-time user starts with plain product language before touching a transaction."],
  ["Connect", "Solflare-first wallet onboarding keeps the signer visible and the network scoped to Testnet."],
  ["Review", "The app explains the proposal, privacy mode, treasury intent, and proof path before signing."],
  ["Sign", "The wallet signs the exact action inside the same guided flow instead of a separate terminal or script."],
  ["Verify", "The user returns to proof, judge, security, or Android surfaces to inspect the receipt and current state."],
] as const;

const ecosystemValue = [
  "Makes Solana governance usable by community members, not only protocol teams.",
  "Turns privacy into a normal UX feature: vote privately first, reveal or verify at the correct stage.",
  "Connects web and Android so mobile-first communities can participate without terminal work.",
  "Keeps every advanced rail, including REFHE, MagicBlock, Umbra, Ika, Jupiter, and QuickNode, behind a clear user action path.",
] as const;

export const metadata: Metadata = buildRouteMetadata({
  title: "Consumer Governance UX",
  description:
    "Consumer-grade Solana governance route where normal users learn the problem, connect a Testnet wallet, review private treasury actions, sign safely, and verify proof across web and Android.",
  path: "/services/consumer-governance-ux",
  keywords: ["consumer ux", "wallet-first governance", "android", "web", "solana", "private governance", "normal user dao"],
});

export default function ConsumerGovernanceUxPage() {
  return (
    <OperationsShell
      eyebrow="Consumer UX"
      title="Private governance a normal user can understand, sign, and verify in minutes"
      description="This is the consumer entry for the whole PrivateDAO thesis: take the complexity of private voting, treasury execution, encrypted payments, intelligence, and proof, then turn it into a wallet-first path that works from web or Android without terminal knowledge."
      badges={[
        { label: "Consumer-ready", variant: "success" },
        { label: "Wallet-first", variant: "cyan" },
        { label: "Web + Android", variant: "violet" },
      ]}
    >
      <LocalizedRouteSummary routeKey="services" />
      <LocalizedRouteBrief routeKey="servicesCore" />
      <section className="rounded-[30px] border border-cyan-300/20 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.18),transparent_34%),linear-gradient(135deg,rgba(20,241,149,0.10),rgba(8,13,28,0.94))] p-6">
        <div className="max-w-4xl">
          <div className="text-[11px] uppercase tracking-[0.3em] text-cyan-100/78">The user problem</div>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white">DAO infrastructure is powerful, but the first user session is usually broken.</h2>
          <p className="mt-4 text-sm leading-7 text-white/66">
            PrivateDAO exists because serious community decisions should not require command lines, Discord coordination,
            spreadsheet approvals, public vote pressure, and separate explorer archaeology. The product compresses that into
            one path: understand the action, connect a wallet, review privacy and treasury context, sign, then verify.
          </p>
        </div>
        <div className="mt-5 grid gap-3 lg:grid-cols-3">
          {problemCards.map((card) => (
            <div key={card.title} className="rounded-[24px] border border-white/10 bg-black/24 p-4">
              <div className="text-base font-semibold text-white">{card.title}</div>
              <p className="mt-2 text-sm leading-6 text-white/60">{card.body}</p>
            </div>
          ))}
        </div>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link href="/start" className={cn(buttonVariants({ size: "sm" }))}>
            Start the user path
          </Link>
          <Link href="/govern" className={cn(buttonVariants({ size: "sm", variant: "secondary" }))}>
            Open govern
          </Link>
          <Link href="/android" className={cn(buttonVariants({ size: "sm", variant: "secondary" }))}>
            Open Android app
          </Link>
          <Link href="/proof" className={cn(buttonVariants({ size: "sm", variant: "outline" }))}>
            Open proof
          </Link>
        </div>
      </section>

      <section className="rounded-[28px] border border-white/10 bg-white/[0.04] p-6">
        <div className="text-[11px] uppercase tracking-[0.28em] text-emerald-100/78">How PrivateDAO solves it</div>
        <h2 className="mt-3 text-2xl font-semibold text-white">One guided operating path replaces scattered tools</h2>
        <div className="mt-5 grid gap-3 md:grid-cols-5">
          {solutionSteps.map(([label, detail], index) => (
            <div key={label} className="rounded-[22px] border border-white/10 bg-black/24 p-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-full border border-emerald-300/24 bg-emerald-300/[0.10] font-mono text-xs text-emerald-100">
                {index + 1}
              </div>
              <div className="mt-3 text-base font-semibold text-white">{label}</div>
              <p className="mt-2 text-xs leading-5 text-white/58">{detail}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1fr_0.9fr]">
        <div className="rounded-[28px] border border-violet-300/16 bg-violet-300/[0.07] p-6">
          <div className="text-[11px] uppercase tracking-[0.28em] text-violet-100/78">Why it matters to Solana</div>
          <h2 className="mt-3 text-2xl font-semibold text-white">The ecosystem needs private governance that feels like a product</h2>
          <div className="mt-4 space-y-3">
            {ecosystemValue.map((item) => (
              <div key={item} className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm leading-6 text-white/66">
                {item}
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-[28px] border border-amber-300/16 bg-amber-300/[0.08] p-6">
          <div className="text-[11px] uppercase tracking-[0.28em] text-amber-100/78">What the visitor can do now</div>
          <h2 className="mt-3 text-2xl font-semibold text-white">Try the same stack judges inspect</h2>
          <p className="mt-3 text-sm leading-7 text-white/64">
            A visitor can use the Testnet app to move from onboarding into governance, then open proof surfaces that show
            current receipts, custody state, backend readiness, and partner-track lanes. The consumer page deliberately
            hides protocol noise until the user asks for verification.
          </p>
          <div className="mt-5 grid gap-3">
            <Link href="/judge" className={cn(buttonVariants({ size: "sm", variant: "secondary" }), "justify-between")}>
              Open judge proof route
            </Link>
            <Link href="/services/main-frontier-closure" className={cn(buttonVariants({ size: "sm", variant: "outline" }), "justify-between")}>
              Open full product map
            </Link>
            <Link href="/documents/frontier-track-closure-matrix-2026-05-25" className={cn(buttonVariants({ size: "sm", variant: "outline" }), "justify-between")}>
              Open track closure matrix
            </Link>
          </div>
        </div>
      </section>
      <WalletTemplateSandbox />
      <NormalUserOperationPath />
    </OperationsShell>
  );
}
