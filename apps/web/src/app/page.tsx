import type { Metadata } from "next";
import { Suspense } from "react";

import { LegacyEntryBridge } from "@/components/legacy-entry-bridge";
import { SimpleHomeHero } from "@/components/simple-home-hero";
import { NetworkMarquee } from "@/components/network-marquee";
import { OrganizationFitSelector } from "@/components/organization-fit-selector";
import { buildBrandHomeMetadata } from "@/lib/route-metadata";

export const metadata: Metadata = buildBrandHomeMetadata();

const productGroups = [
  {
    eyebrow: "Private Operations",
    title: "Run sensitive work with control.",
    products: [
      ["Confidential Payroll", "Run payroll without exposing employee salaries while preserving evidence of calculation, approval, and settlement.", "/payroll"],
      ["Treasury Coordination", "Move spending requests through clear budgets, approvals, and accountable execution.", "/treasury"],
      ["Private Governance", "Make organizational decisions privately while keeping the outcome understandable and accountable.", "/govern"],
    ],
  },
  {
    eyebrow: "Private Transactions",
    title: "Coordinate offers without exposing them.",
    products: [
      ["Confidential Auctions", "Run sealed procurement and auction workflows where bids stay private until the decision is complete.", "/auctions"],
      ["Private Settlement Workflows", "Move approved transactions through a controlled workflow with a clear record of what happened.", "/payments"],
    ],
  },
  {
    eyebrow: "Verification",
    title: "Prove the result without publishing the source.",
    products: [
      ["Blind Verification", "Prove that private conditions were satisfied without disclosing the underlying data.", "/proof-workflows/blind-policy"],
      ["Record Verification", "Create shareable records that let a third party verify a result without receiving the original private file.", "/products/record-verification"],
    ],
  },
] as const;

const audiences = ["Finance teams", "Web3 organizations", "Institutions", "Treasury committees", "Compliance teams", "Onchain operations"] as const;

const operatingScale = [
  ["Small teams", "5-10 people", "Start with one sensitive workflow: payroll, approvals, or a shared treasury decision."],
  ["Growing organizations", "10+ people", "Bring finance, operations, and leadership into one private process with clear responsibility."],
  ["Institutions and markets", "Public-scale work", "Coordinate decisions where confidentiality, review, and confidence must exist together."],
] as const;

export default function HomePage() {
  return (
    <>
      <Suspense fallback={null}>
        <LegacyEntryBridge />
      </Suspense>
      <SimpleHomeHero />
      <NetworkMarquee />
      <main className="enterprise-page mx-auto w-full max-w-7xl space-y-16 px-4 pb-16 sm:px-6 lg:px-8">
        <section className="pt-12 sm:pt-16">
          <div className="max-w-3xl">
            <div className="text-[11px] font-bold uppercase tracking-[0.28em] text-[#175cd3]">What PrivateDAO solves</div>
            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-[#10233f] sm:text-5xl">Privacy should not make important work impossible to verify.</h2>
            <p className="mt-5 text-lg leading-8 text-[#5d6d82]">Salaries, treasury decisions, bids, approvals, and organizational records should not become public simply because an organization uses modern infrastructure.</p>
          </div>
          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            {[
              ["Protect sensitive work", "Keep the details that should remain internal inside the workflow."],
              ["Coordinate with confidence", "Give the right people a clear path to review and approve."],
              ["Share trusted outcomes", "Publish the evidence a customer, auditor, or partner actually needs."],
            ].map(([title, body]) => (
              <article key={title} className="enterprise-card rounded-[16px] p-5">
                <h3 className="text-base font-semibold text-[#10233f]">{title}</h3>
                <p className="mt-2 text-sm leading-7 text-[#5d6d82]">{body}</p>
              </article>
            ))}
          </div>
        </section>

        <OrganizationFitSelector />

        <section id="products" className="space-y-10">
          <div className="max-w-3xl">
            <div className="text-[11px] font-bold uppercase tracking-[0.28em] text-[#175cd3]">Products</div>
            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-[#10233f] sm:text-5xl">Choose the workflow. PrivateDAO handles the complexity.</h2>
          </div>
          <div className="grid gap-10 lg:grid-cols-3">
            {productGroups.map((group) => (
              <section key={group.eyebrow}>
                <div className="border-b border-[#dce5f0] pb-3 text-[11px] font-bold uppercase tracking-[0.24em] text-[#175cd3]">{group.eyebrow}</div>
                <h3 className="mt-4 text-2xl font-semibold tracking-[-0.03em] text-[#10233f]">{group.title}</h3>
                <div className="mt-5 grid gap-3">
                  {group.products.map(([title, body, href]) => (
                    <a key={title} href={href} className="enterprise-card group rounded-[16px] p-5 transition hover:-translate-y-0.5 hover:border-[#175cd3]">
                      <div className="flex items-start justify-between gap-4"><h4 className="text-lg font-semibold text-[#10233f]">{title}</h4><span className="text-[#175cd3] transition group-hover:translate-x-1" aria-hidden="true">→</span></div>
                      <p className="mt-2 text-sm leading-7 text-[#5d6d82]">{body}</p>
                    </a>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </section>

        <section className="grid gap-10 border-y border-[#dce5f0] py-12 lg:grid-cols-[0.8fr_1.2fr] lg:py-16">
          <div><div className="text-[11px] font-bold uppercase tracking-[0.28em] text-[#175cd3]">Built for organizations</div><h2 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-[#10233f]">For teams where trust is part of the workflow.</h2></div>
          <div className="flex flex-wrap content-start gap-2">{audiences.map((audience) => <span key={audience} className="rounded-full border border-[#dce5f0] bg-[#f7f9fc] px-4 py-2 text-sm font-medium text-[#425570]">{audience}</span>)}</div>
        </section>

        <section className="space-y-7">
          <div className="max-w-3xl">
            <div className="text-[11px] font-bold uppercase tracking-[0.28em] text-[#175cd3]">Fits the organization you are building</div>
            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-[#10233f] sm:text-5xl">Start small. Grow without giving up privacy.</h2>
          </div>
          <div className="grid gap-3 lg:grid-cols-3">
            {operatingScale.map(([title, scale, body]) => (
              <article key={title} className="enterprise-card rounded-[16px] p-5">
                <div className="flex items-center justify-between gap-3"><h3 className="text-lg font-semibold text-[#10233f]">{title}</h3><span className="rounded-full bg-[#edf4ff] px-3 py-1 text-xs font-bold text-[#175cd3]">{scale}</span></div>
                <p className="mt-3 text-sm leading-7 text-[#5d6d82]">{body}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="grid gap-8 lg:grid-cols-2">
          <div><div className="text-[11px] font-bold uppercase tracking-[0.28em] text-[#175cd3]">How it works</div><h2 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-[#10233f]">One workflow from private input to trusted outcome.</h2></div>
          <div className="grid gap-3 sm:grid-cols-2">{["Choose the solution", "Prepare policies and access", "Run the workflow", "Approve when ready", "Share the trusted outcome"].map((step, index) => <div key={step} className="flex gap-3 rounded-[16px] border border-[#dce5f0] bg-[#f7f9fc] p-4"><span className="text-sm font-bold text-[#175cd3]">0{index + 1}</span><span className="text-sm font-semibold text-[#10233f]">{step}</span></div>)}</div>
        </section>

        <section className="rounded-[20px] bg-[#10233f] px-6 py-10 text-white sm:px-10 sm:py-14">
          <div className="max-w-3xl"><div className="text-[11px] font-bold uppercase tracking-[0.28em] text-[#9fc7ff]">Start a conversation</div><h2 className="mt-3 text-3xl font-semibold tracking-[-0.04em] sm:text-5xl">Need a private workflow built around your organization?</h2><p className="mt-4 max-w-2xl text-base leading-7 text-[#d5e2f3]">Tell us what must stay private, who needs to approve it, and what outcome others need to trust.</p><a href="/contact" className="mt-7 inline-flex h-12 items-center justify-center rounded-full bg-white px-6 text-sm font-semibold text-[#10233f] transition hover:bg-[#eef3f9]">Talk to PrivateDAO</a></div>
        </section>
      </main>
    </>
  );
}
