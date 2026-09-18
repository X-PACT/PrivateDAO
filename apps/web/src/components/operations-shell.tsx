"use client";
/* eslint-disable @next/next/no-img-element -- the brand asset is a static export asset. */

import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowRight, FileCheck2, Gavel, Landmark, LockKeyhole, ShieldCheck, Users } from "lucide-react";
import { usePathname } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const productNav = [
  { href: "/payroll", label: "Payroll", icon: LockKeyhole },
  { href: "/treasury", label: "Treasury", icon: Landmark },
  { href: "/govern", label: "Governance", icon: Users },
  { href: "/auctions", label: "Auctions", icon: Gavel },
  { href: "/proof-workflows", label: "Verification", icon: ShieldCheck },
] as const;

const productNarratives = [
  {
    match: "/payroll",
    eyebrow: "Why this exists",
    title: "Pay people without publishing the payroll.",
    examples: [
      ["A trusted payroll", "Salary, tax, and deduction details stay private while the organization proves the approved batch was processed correctly."],
      ["A clear approval path", "Finance prepares the batch, the right people approve it, and the final outcome is easy to review."],
      ["A shareable result", "An auditor or board member receives proof of the process, not every employee record."],
    ],
    cards: [
      ["Private input", "Salary, tax, and deduction details stay inside the approved payroll process.", LockKeyhole],
      ["Clear responsibility", "The right people review policy and approve the batch before payment.", Users],
      ["Trusted result", "Share evidence that payroll was processed correctly without exposing employees.", ShieldCheck],
    ],
  },
  {
    match: "/treasury",
    eyebrow: "Why this exists",
    title: "Approve spending without exposing the room.",
    examples: [
      ["A private request", "Keep amount, counterparty, and internal context visible only to the people responsible for the decision."],
      ["A controlled release", "Budgets and approval rules are checked before an authorized action can move forward."],
      ["A trusted record", "The organization can show what was approved and what happened next without publishing its internal plan."],
    ],
    cards: [
      ["Private request", "Keep sensitive amounts, counterparties, and context inside the finance workflow.", LockKeyhole],
      ["Clear responsibility", "Delegate spending authority, apply budgets, and keep an approval trail before an automated action runs.", Users],
      ["Trusted result", "Keep a reviewable record of what was approved and what happened next.", ShieldCheck],
    ],
  },
  {
    match: "/govern",
    eyebrow: "Why this exists",
    title: "Make decisions without exposing every discussion.",
    examples: [
      ["A private room", "Members can discuss funding, delegation, or a shared asset without public pressure shaping the conversation."],
      ["A fair decision", "Each participant follows the same rules while sensitive intent stays protected until the decision is ready."],
      ["An accountable outcome", "The result and a useful activity report can be shared without publishing every private contribution."],
    ],
    cards: [
      ["Private intent", "Members can vote on a shared physical or digital asset without pressure or public steering.", LockKeyhole],
      ["Useful intelligence", "Review activity before, during, and after a proposal so the room can spot participation gaps, unusual momentum, and execution risk without exposing private intent.", Users],
      ["Trusted outcome", "Reveal the result and a clear activity report to the people who need confidence in it.", ShieldCheck],
    ],
  },
  {
    match: "/auctions",
    eyebrow: "Why this exists",
    title: "Protect bids until a fair result is ready.",
    examples: [
      ["A sealed offer", "Suppliers submit real commercial intent without giving competitors an advantage before the close."],
      ["A known rule", "Eligibility, timing, and winner selection are agreed before anyone sees the competing offers."],
      ["A defensible result", "Participants can check the outcome without receiving every losing bid or private negotiation."],
    ],
    cards: [
      ["Private offers", "Keep competing prices and commercial intent hidden until the agreed close.", LockKeyhole],
      ["Market intelligence", "Review participation, timing, and decision signals around the auction without exposing the bids that should remain sealed.", Users],
      ["Trusted result", "Share the winning result and evidence without exposing every losing offer.", ShieldCheck],
    ],
  },
  {
    match: "/proof-workflows",
    eyebrow: "Why this exists",
    title: "Prove what happened. Not everything behind it.",
    examples: [
      ["A private condition", "Show that a requirement was met without sending the source document or sensitive personal data."],
      ["A limited review", "Choose whether a reviewer can check identity, age, jurisdiction, or business eligibility."],
      ["A simple link", "Give a partner or auditor one result they can verify, with scope and validity clearly visible."],
    ],
    cards: [
      ["Private source", "Keep the original record or sensitive inputs with the organization that owns them.", LockKeyhole],
      ["Defined conditions", "Choose the exact claims a reviewer is allowed to check.", FileCheck2],
      ["Shareable proof", "Give an auditor, partner, or customer a simple result they can verify.", ShieldCheck],
    ],
  },
  {
    match: "/products/record-verification",
    eyebrow: "Why this exists",
    title: "Make an important record easy to trust.",
    examples: [
      ["A protected source", "Keep the original invoice, report, or business record with the organization that owns it."],
      ["A defined claim", "Decide exactly what a reviewer is allowed to confirm and nothing more."],
      ["A lasting reference", "Share a verification result that can be reviewed later without forwarding the private record."],
    ],
    cards: [
      ["Private source", "Protect the fields that do not belong in a public receipt.", LockKeyhole],
      ["Defined review", "Choose the conditions and evidence that a reviewer should see.", FileCheck2],
      ["Simple link", "Share one verification result without sending the original record.", ShieldCheck],
    ],
  },
  {
    match: "/agents",
    eyebrow: "Why this exists",
    title: "Let software act with boundaries and receipts.",
    examples: [
      ["A bounded request", "Give an agent one useful capability instead of access to the whole organization."],
      ["A controlled action", "Set the scope, approval, and expected outcome before software performs work."],
      ["A checkable result", "Receive a clear receipt that a person or another system can review later."],
    ],
    cards: [
      ["Bounded request", "Give an agent access to the capability it needs, not the whole organization.", LockKeyhole],
      ["Useful action", "Let software discover and run a service through a clear operating path.", Users],
      ["Checkable result", "Receive an outcome that a person or another system can verify later.", ShieldCheck],
    ],
  },
] as const;

type OperationsShellProps = {
  eyebrow: string;
  title: string;
  description: string;
  navigationMode?: "full" | "guided" | "focused";
  badges?: Array<{
    label: string;
    variant?: "cyan" | "violet" | "success" | "warning";
  }>;
  children: ReactNode;
};

export function OperationsShell({ eyebrow, title, description, navigationMode = "full", badges = [], children }: OperationsShellProps) {
  const pathname = usePathname();
  const focused = navigationMode === "focused";
  const narrative = productNarratives.find((item) => pathname === item.match || pathname.startsWith(`${item.match}/`));

  return (
    <main className="enterprise-operations mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      {!focused ? (
        <nav aria-label="PrivateDAO products" className="enterprise-product-nav no-scrollbar mb-8 flex gap-2 overflow-x-auto pb-1">
          {productNav.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(`${href}/`);
            return (
              <Link key={href} href={href} className={cn("flex shrink-0 items-center gap-2 rounded-full border px-4 py-2.5 text-sm font-medium transition", active ? "border-[#175cd3] bg-[#175cd3] text-white shadow-[0_6px_18px_rgba(23,92,211,0.2)]" : "border-[#dce5f0] bg-white text-[#425570] hover:border-[#175cd3] hover:text-[#175cd3]")}>
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            );
          })}
        </nav>
      ) : null}

      <section className="enterprise-operations-hero relative overflow-hidden rounded-[24px] border border-[#dce5f0] bg-white p-6 shadow-[0_14px_42px_rgba(16,35,63,0.07)] sm:p-10">
        <div className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full border border-[#d9e8f7] opacity-80" />
        <div className="pointer-events-none absolute right-10 top-10 h-24 w-24 rounded-full border border-[#f0c9cd] opacity-70" />
        <div className="relative grid gap-8 lg:grid-cols-[minmax(0,1fr)_240px] lg:items-center">
          <div>
            {badges.length > 0 ? <div className="flex flex-wrap gap-2">{badges.map((badge) => <Badge key={badge.label} variant={badge.variant ?? "cyan"}>{badge.label}</Badge>)}</div> : null}
            <div className="mt-5 text-[11px] font-bold uppercase tracking-[0.28em] text-[#175cd3]">{eyebrow}</div>
            <h1 className="mt-3 max-w-4xl text-3xl font-semibold tracking-[-0.045em] text-[#10233f] sm:text-5xl">{title}</h1>
            <p className="mt-4 max-w-3xl text-base leading-8 text-[#5d6d82] sm:text-lg">{description}</p>
            {!focused ? <div className="mt-6 flex flex-wrap gap-3"><Link href="/contact" className={buttonVariants({ size: "sm" })}>Talk to PrivateDAO <ArrowRight className="h-4 w-4" /></Link><Link href="/products" className={buttonVariants({ size: "sm", variant: "outline" })}>View solutions</Link></div> : null}
          </div>
          <div className="enterprise-brand-orbit mx-auto hidden h-44 w-44 items-center justify-center lg:flex" aria-hidden="true">
            <div className="absolute h-40 w-40 rounded-full border border-[#b9d8f2]" />
            <div className="absolute h-28 w-28 rounded-full border border-[#f0c9cd]" />
            <img src="/assets/privatedao-brand-mark-20260918.jpeg" alt="" className="relative h-20 w-20 rounded-full object-cover shadow-[0_10px_26px_rgba(23,92,211,0.2)]" />
          </div>
        </div>
        {!focused ? (
          <div className="relative mt-8 border-t border-[#dce5f0] pt-5">
            <div className="mb-3 text-[10px] font-bold uppercase tracking-[0.24em] text-[#7a8ba0]">A simple operating path</div>
            <div className="grid gap-2 sm:grid-cols-5">
              {[
                ["01", "Choose a solution"],
                ["02", "Set your policies"],
                ["03", "Run the workflow"],
                ["04", "Approve the outcome"],
                ["05", "Share trusted evidence"],
              ].map(([number, label]) => (
                <div key={number} className="rounded-[12px] border border-[#dce5f0] bg-[#f7f9fc] px-3 py-3">
                  <div className="text-[10px] font-bold text-[#175cd3]">{number}</div>
                  <div className="mt-1 text-xs font-semibold leading-5 text-[#10233f]">{label}</div>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </section>

      {narrative ? <section className="commercial-product-explainer" aria-label={`${eyebrow} overview`}>
        <div className="commercial-product-explainer-heading">
          <div className="commercial-eyebrow">{narrative.eyebrow}</div>
          <h2>{narrative.title}</h2>
        </div>
        <div className="commercial-product-explainer-cards">
          {narrative.cards.map(([cardTitle, cardBody, Icon]) => <article key={cardTitle}>
            <Icon className="h-5 w-5 text-[#175cd3]" />
            <h3>{cardTitle}</h3>
            <p>{cardBody}</p>
          </article>)}
        </div>
      </section> : null}

      {narrative ? <section className="commercial-product-examples" aria-label="Practical examples">
        <div className="commercial-product-examples-heading">
          <div className="commercial-eyebrow">What this looks like</div>
          <h2>Privacy that makes sense in the real world.</h2>
          <p>Keep the sensitive part inside the workflow. Share the outcome with the people who need confidence.</p>
        </div>
        <div className="commercial-product-examples-grid">
          {narrative.examples.map(([exampleTitle, exampleBody], index) => <article key={exampleTitle}>
            <span>0{index + 1}</span>
            <h3>{exampleTitle}</h3>
            <p>{exampleBody}</p>
          </article>)}
        </div>
      </section> : null}

      <div className="enterprise-operations-content mt-8 min-w-0 space-y-8">{children}</div>
    </main>
  );
}
