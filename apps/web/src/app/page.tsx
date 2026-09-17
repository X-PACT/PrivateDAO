import type { Metadata } from "next";
import { Suspense } from "react";

import { LegacyEntryBridge } from "@/components/legacy-entry-bridge";
import { BusinessValueSurface } from "@/components/business-value-surface";
import { ServiceLauncher } from "@/components/service-launcher";
import { SimpleHomeHero } from "@/components/simple-home-hero";
import { NetworkMarquee } from "@/components/network-marquee";
import { buildBrandHomeMetadata } from "@/lib/route-metadata";

export const metadata: Metadata = buildBrandHomeMetadata();

const whyNowPoints = [
  "DAO treasuries are growing faster than governance infrastructure.",
  "Sensitive coordination still happens in private chats and spreadsheets.",
  "Solana organizations increasingly need privacy without sacrificing verifiability.",
] as const;

const productCategories = [
  {
    title: "Verify",
    body: "Turn records, claims, and private policy checks into evidence others can verify without seeing sensitive inputs.",
    href: "/products/record-verification",
    cta: "Explore Verify",
  },
  {
    title: "Govern",
    body: "Run private proposals, rooms, reviews, and approvals while keeping the final outcome accountable.",
    href: "/govern",
    cta: "Explore Governance",
  },
  {
    title: "Decide",
    body: "Collect private offers, choose fairly, and share a verified result when the decision is complete.",
    href: "/auctions",
    cta: "Explore private auctions",
  },
  {
    title: "Coordinate",
    body: "Move treasury requests and operational approvals through a clear workflow with evidence at each step.",
    href: "/treasury",
    cta: "Explore Treasury",
  },
  {
    title: "Pay",
    body: "Run confidential payroll with policy checks, private settlement, and a proof link that reveals no employee details.",
    href: "/payroll",
    cta: "Explore Payroll",
  },
  {
    title: "Connect",
    body: "Let agents discover services, hire providers, and verify results through a machine-ready marketplace.",
    href: "/agents",
    cta: "Explore Agent Exchange",
  },
  {
    title: "Platform",
    body: "Connect the workflows to your systems through API, SDK, security, and evidence surfaces.",
    href: "/developers",
    cta: "Explore Integrations",
  },
] as const;

const buyerSegments = [
  "fintech companies",
  "lenders",
  "foundations",
  "DAOs",
  "gaming organizations",
  "compliance teams",
  "treasury committees",
  "public-good communities",
] as const;

const privateValues = ["earnings", "votes", "reviewer notes", "internal policies", "treasury context", "sensitive documents"] as const;
const verifiableValues = ["process completed", "approvals happened", "decision produced", "proof generated", "tamper check passed"] as const;

export default function HomePage() {
  return (
    <>
      <Suspense
        fallback={null}
      >
        <LegacyEntryBridge />
      </Suspense>
      <SimpleHomeHero />
      <NetworkMarquee />
      <div className="enterprise-page mx-auto w-full max-w-7xl space-y-5 px-4 pb-12 sm:px-6 lg:px-8">
        <section className="border-b border-[#dce5f0] py-7 sm:py-9">
          <div className="max-w-4xl">
            <div className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#175cd3]">The PrivateDAO platform</div>
            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-[#10233f] sm:text-4xl">
              One simple promise: private work, trusted outcomes.
            </h2>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-[#5d6d82]">
              Start with the result you need. The cryptography, storage, and network integrations stay in the platform core so your team can focus on the workflow.
            </p>
          </div>
        </section>
        <section className="border-y border-[#dce5f0] py-6 sm:py-8">
          <div className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#175cd3]">Why now?</div>
          <div className="mt-4 grid gap-3 lg:grid-cols-3">
            {whyNowPoints.map((point) => (
              <div key={point} className="border-l border-[#b9d8f2] pl-4 text-sm leading-7 text-[#5d6d82]">
                {point}
              </div>
            ))}
          </div>
        </section>
        <section id="products" className="border-b border-[#dce5f0] pb-7 sm:pb-9">
          <div className="max-w-4xl">
            <div className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#175cd3]">Products</div>
            <h2 className="mt-3 text-2xl font-semibold tracking-[-0.035em] text-[#10233f] sm:text-3xl">
              Product lines. Launch surfaces. One promise.
            </h2>
            <p className="mt-3 text-sm leading-7 text-[#5d6d82]">
              PrivateDAO helps teams make private decisions, coordinate treasury actions, and prove operational workflows
              without exposing sensitive data.
            </p>
          </div>
          <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
            {productCategories.map((item) => (
              <article key={item.title} className="enterprise-card min-w-0 rounded-[16px] p-5">
                <h3 className="text-xl font-semibold leading-7 text-[#10233f]">{item.title}</h3>
                <p className="mt-3 min-h-20 text-sm leading-7 text-[#5d6d82]">{item.body}</p>
                <a href={item.href} className="mt-5 inline-flex text-sm font-semibold text-[#175cd3] underline underline-offset-4">
                  {item.cta}
                </a>
              </article>
            ))}
          </div>
        </section>
        <section className="grid gap-5 border-b border-[#dce5f0] pb-7 sm:pb-9 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#175cd3]">Who it is for</div>
            <div className="mt-4 flex flex-wrap gap-2">
              {buyerSegments.map((item) => (
                <span key={item} className="rounded-full border border-[#dce5f0] bg-[#f7f9fc] px-3 py-1.5 text-sm text-[#5d6d82]">
                  {item}
                </span>
              ))}
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <article className="enterprise-card rounded-[16px] p-5">
              <h3 className="text-base font-semibold text-[#10233f]">What stays private</h3>
              <div className="mt-3 grid gap-2">
                {privateValues.map((item) => (
                  <div key={item} className="text-sm text-[#5d6d82]">{item}</div>
                ))}
              </div>
            </article>
            <article className="enterprise-card rounded-[16px] p-5">
              <h3 className="text-base font-semibold text-[#10233f]">What becomes verifiable</h3>
              <div className="mt-3 grid gap-2">
                {verifiableValues.map((item) => (
                  <div key={item} className="text-sm text-[#5d6d82]">{item}</div>
                ))}
              </div>
            </article>
          </div>
        </section>
        <BusinessValueSurface />
        <ServiceLauncher compact />
      </div>
    </>
  );
}
