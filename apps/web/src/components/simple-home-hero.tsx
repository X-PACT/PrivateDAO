import Link from "next/link";
import { ArrowRight, CheckCircle2, ShieldCheck } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const flow = [
  ["Keep the details private", "Protect the information your organization should not publish."],
  ["Move work through control", "Give teams a clear path for review, approval, and execution."],
  ["Make the outcome trusted", "Share evidence without handing over the underlying sensitive data."],
] as const;

export function SimpleHomeHero() {
  return (
    <main className="enterprise-page mx-auto w-full max-w-7xl px-4 pt-8 sm:px-6 sm:pt-12 lg:px-8 lg:pt-16">
      <section className="grid items-start gap-8 border-b border-[#dce5f0] pb-10 lg:grid-cols-[1.08fr_0.92fr] lg:gap-12 lg:pb-14">
        <div>
          <div className="flex flex-wrap gap-2">
            <Badge variant="cyan">Private operations</Badge>
            <Badge variant="default">Private transactions</Badge>
            <Badge variant="violet">Verification</Badge>
          </div>
          <div className="mt-6 text-[11px] font-semibold uppercase tracking-[0.3em] text-[#175cd3]">
            PrivateDAO for organizations
          </div>
          <h1 className="mt-4 max-w-4xl text-4xl font-semibold tracking-[-0.05em] text-[#10233f] sm:text-6xl">
            Private decisions. Verifiable outcomes.
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-[#5d6d82]">
            PrivateDAO helps organizations run sensitive financial and operational workflows with privacy, control, and outcomes others can trust.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link href="#products" className={cn(buttonVariants({ size: "lg" }))}>
              Explore solutions
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/contact" className={cn(buttonVariants({ size: "lg", variant: "outline" }))}>
              Talk to PrivateDAO
            </Link>
          </div>
          <div className="mt-7 flex flex-wrap gap-x-5 gap-y-2 text-sm text-[#5d6d82]">
            {["Private by design", "Clear approvals", "Trusted outcomes", "Built for organizations"].map((item) => (
              <div key={item} className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-[#175cd3]" />
                {item}
              </div>
            ))}
          </div>
        </div>

        <aside className="enterprise-card relative overflow-hidden rounded-[26px] p-5 sm:p-6">
          <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full border border-[#b9d8f2]" />
          <div className="pointer-events-none absolute right-4 top-4 h-28 w-28 rounded-full border border-[#f0c9cd]" />
          <div className="relative mb-5 flex items-center gap-3 border-b border-[#dce5f0] pb-5">
            <img src="/assets/privatedao-brand-mark-20260918.jpeg" alt="PrivateDAO" width={58} height={58} className="h-14 w-14 rounded-full object-cover shadow-[0_10px_26px_rgba(23,92,211,0.18)]" />
            <div>
              <div className="text-lg font-semibold tracking-[-0.03em] text-[#10233f]">Private<span className="text-[#175cd3]">DAO</span></div>
              <div className="mt-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-[#7a8ba0]">Private work. Trusted outcomes.</div>
            </div>
          </div>
          <div className="flex items-center gap-3 text-[#175cd3]">
            <ShieldCheck className="h-5 w-5" />
            <div className="text-[11px] uppercase tracking-[0.26em]">One simple operating flow</div>
          </div>
          <div className="mt-5 grid gap-3">
            {flow.map(([title, body], index) => (
              <article key={title} className="rounded-[20px] border border-[#dce5f0] bg-white p-4">
                <div className="text-[10px] uppercase tracking-[0.22em] text-[#175cd3]">Step {index + 1}</div>
                <h2 className="mt-2 text-base font-semibold text-[#10233f]">{title}</h2>
                <p className="mt-2 text-sm leading-6 text-[#5d6d82]">{body}</p>
              </article>
            ))}
          </div>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link href="/proof-workflows" className={cn(buttonVariants({ size: "sm", variant: "secondary" }))}>
              Proof Workflows
            </Link>
            <Link href="/govern" className={cn(buttonVariants({ size: "sm", variant: "outline" }))}>
              Private Governance
            </Link>
          </div>
        </aside>
      </section>
    </main>
  );
}
