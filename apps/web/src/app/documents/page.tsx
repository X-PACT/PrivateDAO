import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, BookOpen, CheckCircle2, FileCheck2, ShieldCheck } from "lucide-react";

import { buildRouteMetadata } from "@/lib/route-metadata";

export const metadata: Metadata = buildRouteMetadata({
  title: "Evidence & Resources",
  description:
    "Current public product, verification, and architecture resources from PrivateDAO.",
  path: "/documents",
  keywords: ["PrivateDAO evidence", "verification", "whitepaper", "product resources"],
});

const sections = [
  {
    eyebrow: "Understand the product",
    title: "Start with the idea, not the implementation.",
    icon: BookOpen,
    links: [
      ["Thesis", "Why privacy and proof belong in the same organizational workflow.", "/thesis"],
      ["Whitepaper", "The product model, boundaries, and infrastructure behind the commercial surfaces.", "/whitepaper"],
      ["Products", "Choose payroll, treasury, governance, auctions, or verification by business need.", "/products"],
    ],
  },
  {
    eyebrow: "Check an outcome",
    title: "Verify the result without receiving the private source data.",
    icon: FileCheck2,
    links: [
      ["Blind Verification", "Check that a condition was satisfied without exposing the underlying information.", "/proof-workflows/blind-policy"],
      ["Record Verification", "Open a public record link and inspect its current validity and scope.", "/products/record-verification"],
      ["EVM Verification", "Inspect the currently published testnet verification evidence.", "/verify/evm"],
    ],
  },
  {
    eyebrow: "Review the boundaries",
    title: "See what is live before you rely on it.",
    icon: ShieldCheck,
    links: [
      ["Security", "Read the public security and release boundaries without turning them into marketing claims.", "/security"],
      ["Build", "Find APIs, Agents, network capability, and integration material when you need implementation detail.", "/developers"],
      ["PDAO", "See the official token information and current ecosystem utility.", "/token"],
    ],
  },
] as const;

export default function DocumentsPage() {
  return (
    <main className="min-h-screen bg-white text-[#10233f]">
        <section className="mx-auto w-full max-w-7xl px-4 pb-16 pt-16 sm:px-6 sm:pb-24 sm:pt-24 lg:px-8">
          <div className="max-w-4xl">
            <div className="text-[11px] font-bold uppercase tracking-[0.28em] text-[#175cd3]">Evidence & resources</div>
            <h1 className="mt-5 text-4xl font-semibold tracking-[-0.045em] text-[#10233f] sm:text-6xl">The current PrivateDAO surface, in one place.</h1>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-[#5d6d82]">
              This page lists the public product and verification resources that matter today. It does not present old internal packets, historical reviewer drafts, or archived implementation notes as current product truth.
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
                  A public page explains a product. A verification page proves a specific result. A developer page explains an integration. No document on this route should be treated as evidence of adoption, an audit, unrestricted mainnet readiness, or financial returns unless the linked surface proves that exact claim.
                </p>
              </div>
            </div>
          </section>
        </section>
    </main>
  );
}
