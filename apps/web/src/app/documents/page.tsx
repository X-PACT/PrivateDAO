import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, BookOpen, CheckCircle2, FileCheck2, ShieldCheck } from "lucide-react";

import { buildRouteMetadata } from "@/lib/route-metadata";

export const metadata: Metadata = buildRouteMetadata({
  title: "Resources",
  description:
    "PrivateDAO product, verification, and company resources.",
  path: "/documents",
  keywords: ["PrivateDAO", "products", "verification", "whitepaper"],
});

const sections = [
  {
    eyebrow: "Understand the product",
    title: "Start with what PrivateDAO does.",
    icon: BookOpen,
    links: [
      ["Thesis", "Why privacy and proof belong in the same organizational workflow.", "/thesis"],
      ["Products", "Choose a private workflow by business need.", "/products"],
      ["Whitepaper", "The product model and boundaries behind the company.", "/whitepaper"],
    ],
  },
  {
    eyebrow: "Use the products",
    title: "Keep sensitive work private and still accountable.",
    icon: FileCheck2,
    links: [
      ["Confidential Payroll", "Run payroll without publishing employee salaries.", "/payroll"],
      ["Private Treasury", "Manage spending, approvals, and financial workflows privately.", "/treasury"],
      ["Private Governance", "Make decisions without exposing every internal discussion.", "/govern"],
      ["Private Auctions", "Run sealed procurement without revealing competing bids.", "/auctions"],
      ["Blind Verification", "Prove a condition without exposing the information behind it.", "/proof-workflows/blind-policy"],
      ["Record Verification", "Share a verification record with a clear scope and status.", "/products/record-verification"],
    ],
  },
  {
    eyebrow: "Go deeper when needed",
    title: "The company, the technical details, and the boundaries.",
    icon: ShieldCheck,
    links: [
      ["Security", "Read the public security contact and operating boundaries.", "/security"],
      ["Build", "Find developer resources when you need implementation detail.", "/developers"],
      ["PDAO", "See the published token and ecosystem information.", "/token"],
      ["Contact", "Talk to PrivateDAO about a private workflow.", "/contact"],
    ],
  },
] as const;

export default function DocumentsPage() {
  return (
    <main className="min-h-screen bg-white text-[#10233f]">
        <section className="mx-auto w-full max-w-7xl px-4 pb-16 pt-16 sm:px-6 sm:pb-24 sm:pt-24 lg:px-8">
          <div className="max-w-4xl">
            <div className="text-[11px] font-bold uppercase tracking-[0.28em] text-[#175cd3]">PrivateDAO resources</div>
            <h1 className="mt-5 text-4xl font-semibold tracking-[-0.045em] text-[#10233f] sm:text-6xl">A simpler way to explore PrivateDAO.</h1>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-[#5d6d82]">
              Start with the product that matches your work. Open the technical material only when you need it.
            </p>
          </div>

          <div className="mt-12 grid gap-5 lg:grid-cols-3">
            {sections.map((section) => {
              const Icon = section.icon;
              return (
                <section key={section.title} className="rounded-[24px] border border-[#dce5f0] bg-[#f8fbff] p-6 shadow-[0_18px_55px_rgba(16,35,63,0.06)] sm:p-7">
                  <Icon className="h-6 w-6 text-[#175cd3]" aria-hidden="true" />
                  <div className="mt-6 text-[11px] font-bold uppercase tracking-[0.23em] text-[#175cd3]">{section.eyebrow}</div>
                  <h2 className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-[#10233f]">{section.title}</h2>
                  <div className="mt-7 grid gap-3">
                    {section.links.map(([label, description, href]) => (
                      <Link key={href} href={href} className="group rounded-[16px] border border-[#dce5f0] bg-white p-4 transition hover:border-[#8bb7ed] hover:shadow-sm">
                        <div className="flex items-center justify-between gap-3">
                          <span className="font-semibold text-[#10233f]">{label}</span>
                          <ArrowUpRight className="h-4 w-4 shrink-0 text-[#175cd3] transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden="true" />
                        </div>
                        <p className="mt-2 text-sm leading-6 text-[#5d6d82]">{description}</p>
                      </Link>
                    ))}
                  </div>
                </section>
              );
            })}
          </div>

          <section className="mt-6 rounded-[24px] bg-[#10233f] p-6 text-white sm:p-8">
            <div className="flex items-start gap-4">
              <CheckCircle2 className="mt-1 h-5 w-5 shrink-0 text-[#57d6ed]" aria-hidden="true" />
              <div>
                <h2 className="text-2xl font-semibold tracking-[-0.03em]">A simple rule for reading the site</h2>
                <p className="mt-3 max-w-3xl text-sm leading-7 text-[#d5e2f3]">
                  Product pages explain what PrivateDAO offers. Verification pages show the scope and status of a specific record. Technical pages explain implementation details. Nothing here should be read as a claim of adoption, audit, unrestricted mainnet readiness, or financial returns unless the relevant page states and supports that claim.
                </p>
              </div>
            </div>
          </section>
        </section>
    </main>
  );
}
