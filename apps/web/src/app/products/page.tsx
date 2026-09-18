import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { OperationsShell } from "@/components/operations-shell";
import { buildRouteMetadata } from "@/lib/route-metadata";

export const metadata: Metadata = buildRouteMetadata({
  title: "Solutions",
  description: "PrivateDAO solutions for sensitive payroll, treasury, governance, transactions, and verification.",
  path: "/products",
  keywords: ["PrivateDAO solutions", "confidential payroll", "private treasury", "blind verification"],
});

const solutionGroups = [
  [
    "Private operations",
    "Keep the work that powers the organization under control.",
    [
      ["Confidential Payroll", "Run payroll privately, apply your policy, and share proof of the result.", "/payroll"],
      ["Treasury Coordination", "Route spending requests through clear budgets, approvals, and accountable execution.", "/treasury"],
      ["Private Governance", "Make decisions with the right people while keeping sensitive intent private.", "/govern"],
    ],
  ],
  [
    "Private transactions",
    "Coordinate value without exposing commercial intent too early.",
    [
      ["Confidential Auctions", "Collect private offers and share a fair result after the decision is complete.", "/auctions"],
      ["Private Settlement Workflows", "Move approved transactions through a controlled operating path.", "/payments"],
    ],
  ],
  [
    "Verification",
    "Give partners, auditors, and decision-makers confidence without handing over sensitive source data.",
    [
      ["Blind Verification", "Prove a private policy was satisfied without exposing the inputs or internal rules.", "/proof-workflows/blind-policy"],
      ["Record Verification", "Create a shareable receipt for a critical record without publishing private fields.", "/products/record-verification"],
    ],
  ],
] as const;

export default function ProductsPage() {
  return (
    <OperationsShell
      eyebrow="Solutions"
      title="Choose the business outcome. PrivateDAO handles the complexity."
      description="Start with payroll, treasury, governance, transactions, or verification. The wallet, network, and execution provider appear only when the workflow requires them."
      navigationMode="guided"
      badges={[
        { label: "Enterprise-first", variant: "cyan" },
        { label: "Wallet-agnostic", variant: "success" },
        { label: "Private by design", variant: "violet" },
      ]}
    >
      <div className="grid gap-5 lg:grid-cols-3">
        {solutionGroups.map(([title, summary, products]) => (
          <section key={title} className="enterprise-card rounded-[20px] p-5 sm:p-6">
            <div className="border-b border-[#dce5f0] pb-4"><div className="text-[11px] font-bold uppercase tracking-[0.23em] text-[#175cd3]">{title}</div><p className="mt-3 text-sm leading-6 text-[#5d6d82]">{summary}</p></div>
            <div className="mt-4 grid gap-3">
              {products.map(([product, body, href]) => <Link key={product} href={href} className="group rounded-[16px] border border-[#dce5f0] bg-[#f7f9fc] p-4 transition hover:-translate-y-0.5 hover:border-[#175cd3]"><div className="flex items-start justify-between gap-3"><h2 className="text-base font-semibold text-[#10233f]">{product}</h2><ArrowRight className="mt-0.5 h-4 w-4 shrink-0 text-[#175cd3] transition group-hover:translate-x-1" /></div><p className="mt-2 text-sm leading-6 text-[#5d6d82]">{body}</p></Link>)}
            </div>
          </section>
        ))}
      </div>

      <section className="rounded-[24px] bg-[#10233f] p-6 text-white sm:p-8">
        <div className="text-[11px] font-bold uppercase tracking-[0.25em] text-[#9fc7ff]">Beyond the core workflow</div>
        <div className="mt-3 flex flex-wrap items-end justify-between gap-5"><div><h2 className="text-2xl font-semibold tracking-[-0.03em]">Extend the ecosystem when your organization is ready.</h2><p className="mt-3 max-w-2xl text-sm leading-7 text-[#d5e2f3]">Agent services and PDAO Worlds remain available as separate products without complicating the core enterprise path.</p></div><div className="flex flex-wrap gap-3"><Link href="/agents" className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2.5 text-sm font-semibold text-[#10233f]">Explore Agents <ArrowRight className="h-4 w-4" /></Link><a href="https://game.privatedao.org/game/godot/index.html" className="inline-flex items-center gap-2 rounded-full border border-white/25 px-4 py-2.5 text-sm font-semibold text-white">Play PDAO Worlds <ArrowRight className="h-4 w-4" /></a></div></div>
      </section>
    </OperationsShell>
  );
}
