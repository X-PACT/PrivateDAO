import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, FileCheck2, Landmark, Scale, ShieldCheck } from "lucide-react";

import { OperationsShell } from "@/components/operations-shell";
import { buttonVariants } from "@/components/ui/button";
import { buildRouteMetadata } from "@/lib/route-metadata";
import { cn } from "@/lib/utils";

export const metadata: Metadata = buildRouteMetadata({
  title: "Private Operations",
  description: "Run payroll, treasury, governance, and private auctions from simple business workflows.",
  path: "/execute",
  keywords: ["private operations", "confidential payroll", "private treasury", "private auctions"],
});

const solutions = [
  { href: "/payroll", icon: FileCheck2, title: "Run confidential payroll", body: "Prepare pay, apply your policy, complete the payout, and share one proof link without exposing employee details.", action: "Open Payroll" },
  { href: "/treasury", icon: Landmark, title: "Coordinate treasury", body: "Review spending, approvals, and treasury actions in one clear operating workflow.", action: "Open Treasury" },
  { href: "/govern", icon: Scale, title: "Make private decisions", body: "Run proposals and approvals with a decision trail your organization can verify.", action: "Open Governance" },
  { href: "/auctions", icon: ShieldCheck, title: "Run fair private auctions", body: "Collect sealed bids, select a winner, and publish a simple result that can be checked.", action: "Open Auctions" },
] as const;

export default function ExecutePage() {
  return (
    <OperationsShell eyebrow="Private operations" title="Run important work privately. Prove the outcome clearly." description="Choose a business workflow and start in seconds. PrivateDAO keeps sensitive information protected while your team gets clear approvals, results, and proof." navigationMode="guided" badges={[{ label: "Business workflows", variant: "cyan" }, { label: "Simple to start", variant: "success" }]}>
      <section className="grid gap-4 sm:grid-cols-2">
        {solutions.map(({ href, icon: Icon, title, body, action }) => (
          <Link key={href} href={href} className="group rounded-[24px] border border-white/10 bg-white/[0.04] p-6 transition hover:border-cyan-300/30 hover:bg-white/[0.07]">
            <Icon className="h-6 w-6 text-cyan-200" />
            <h2 className="mt-5 text-xl font-semibold text-white">{title}</h2>
            <p className="mt-3 max-w-xl text-sm leading-7 text-white/62">{body}</p>
            <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-cyan-100">{action}<ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" /></span>
          </Link>
        ))}
      </section>
      <section className="rounded-[24px] border border-cyan-300/16 bg-cyan-300/[0.06] p-6">
        <div className="text-[11px] uppercase tracking-[0.24em] text-cyan-100/76">Start with one workflow</div>
        <h2 className="mt-3 text-2xl font-semibold text-white">No technical setup required to explore the products.</h2>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-white/62">Try Payroll with a sample batch, review the result, and generate a shareable verification link after the secure Devnet flow completes.</p>
        <Link href="/payroll" className={cn(buttonVariants({ size: "sm" }), "mt-5")}>Try Payroll <ArrowRight className="h-4 w-4" /></Link>
      </section>
    </OperationsShell>
  );
}
