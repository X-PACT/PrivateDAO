import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, BriefcaseBusiness, FileText, LockKeyhole, Mail } from "lucide-react";

import { buildRouteMetadata } from "@/lib/route-metadata";

export const metadata: Metadata = buildRouteMetadata({
  title: "PrivateDAO | Official information",
  description: "The official PrivateDAO product, company, and public information index.",
  path: "/documents",
  keywords: ["PrivateDAO", "products", "whitepaper", "contact", "PDAO"],
});

const productLinks = [
  ["Confidential Payroll", "Pay people without publishing employee salaries.", "/payroll/"],
  ["Private Treasury", "Coordinate approvals and spending with privacy built in.", "/treasury/"],
  ["Private Governance", "Make decisions without exposing every internal discussion.", "/govern/"],
  ["Private Auctions", "Run sealed procurement without revealing competing bids.", "/auctions/"],
  ["Blind Verification", "Prove a condition without exposing the information behind it.", "/proof-workflows/blind-policy/"],
  ["Record Verification", "Share a verification record with a clear scope and status.", "/products/record-verification/"],
] as const;

const informationLinks = [
  ["Why PrivateDAO", "The simple idea behind private work and verifiable outcomes.", "/thesis/"],
  ["Whitepaper", "The product model, boundaries, and long-term direction.", "/whitepaper/"],
  ["PDAO", "Official public token and ecosystem information.", "/token/"],
  ["Contact", "Talk to PrivateDAO about a private workflow.", "/contact/"],
] as const;

function LinkCard({ label, description, href }: { label: string; description: string; href: string }) {
  return (
    <Link href={href} className="group flex min-h-24 items-start justify-between gap-4 rounded-2xl border border-[#d9e4f1] bg-white p-5 transition hover:-translate-y-0.5 hover:border-[#1769e8] hover:shadow-[0_12px_30px_rgba(23,105,232,0.1)]">
      <span>
        <span className="block font-semibold text-[#10233f]">{label}</span>
        <span className="mt-2 block text-sm leading-6 text-[#5d6d82]">{description}</span>
      </span>
      <ArrowUpRight className="mt-0.5 h-4 w-4 shrink-0 text-[#1769e8] transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden="true" />
    </Link>
  );
}

export default function DocumentsPage() {
  return (
    <main className="min-h-screen bg-white text-[#10233f]">
      <section className="mx-auto w-full max-w-6xl px-4 pb-20 pt-16 sm:px-6 sm:pb-28 sm:pt-24 lg:px-8">
        <div className="max-w-3xl">
          <div className="text-[11px] font-bold uppercase tracking-[0.28em] text-[#1769e8]">PrivateDAO</div>
          <h1 className="mt-5 text-4xl font-semibold tracking-[-0.05em] sm:text-6xl">Private work. Clear outcomes.</h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-[#5d6d82]">This is the official index for PrivateDAO products and company information. Start with the business problem, then go deeper only when you need to.</p>
        </div>

        <section className="mt-14" aria-labelledby="products-heading">
          <div className="flex items-center gap-3"><BriefcaseBusiness className="h-5 w-5 text-[#1769e8]" aria-hidden="true" /><h2 id="products-heading" className="text-2xl font-semibold tracking-[-0.035em]">Products</h2></div>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {productLinks.map(([label, description, href]) => <LinkCard key={href} label={label} description={description} href={href} />)}
          </div>
        </section>

        <section className="mt-14" aria-labelledby="information-heading">
          <div className="flex items-center gap-3"><FileText className="h-5 w-5 text-[#1769e8]" aria-hidden="true" /><h2 id="information-heading" className="text-2xl font-semibold tracking-[-0.035em]">Company information</h2></div>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {informationLinks.map(([label, description, href]) => <LinkCard key={href} label={label} description={description} href={href} />)}
          </div>
        </section>

        <section className="mt-14 flex flex-col gap-5 rounded-3xl bg-[#10233f] p-7 text-white sm:flex-row sm:items-center sm:justify-between sm:p-9">
          <div className="flex items-start gap-4"><LockKeyhole className="mt-1 h-5 w-5 shrink-0 text-[#67d9ef]" aria-hidden="true" /><div><h2 className="text-xl font-semibold">Need a private workflow?</h2><p className="mt-2 max-w-xl text-sm leading-6 text-[#d5e2f3]">Tell us what your organization needs to keep private and what it needs to prove.</p></div></div>
          <Link href="/contact/" className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-[#10233f] transition hover:bg-[#eaf4ff]"><Mail className="h-4 w-4" aria-hidden="true" />Talk to us</Link>
        </section>
      </section>
    </main>
  );
}
