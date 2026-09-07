import Link from "next/link";
import { ArrowRight, CheckCircle2, ShieldCheck } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { WalletConnectButton } from "@/components/wallet-connect-button";
import { cn } from "@/lib/utils";

const flow = [
  ["Decide privately", "Keep sensitive votes, reviews, customer data, and treasury context protected while the process runs."],
  ["Coordinate securely", "Move work through rooms, approvals, workflows, and treasury requests without scattering evidence."],
  ["Verify publicly", "Publish proof that the process completed without exposing the private data or internal rules."],
] as const;

export function SimpleHomeHero() {
  return (
    <main className="mx-auto w-full max-w-7xl px-4 pt-8 sm:px-6 sm:pt-12 lg:px-8 lg:pt-16">
      <section className="grid items-start gap-8 border-b border-white/10 pb-10 lg:grid-cols-[1.08fr_0.92fr] lg:gap-12 lg:pb-14">
        <div>
          <div className="flex flex-wrap gap-2">
            <Badge variant="success">Proof Workflows</Badge>
            <Badge variant="cyan">Private Governance</Badge>
            <Badge variant="violet">Treasury Coordination</Badge>
          </div>
          <div className="mt-6 text-[11px] font-semibold uppercase tracking-[0.3em] text-emerald-100/78">
            Commercial privacy and proof infrastructure
          </div>
          <h1 className="mt-4 max-w-4xl text-4xl font-semibold tracking-[-0.05em] text-white sm:text-6xl">
            Private decisions. Verifiable outcomes.
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-white/68">
            PrivateDAO helps organizations run governance, treasury, and operational workflows with privacy, proof, and
            audit-ready verification.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <WalletConnectButton size="lg" variant="default" connectLabel="Connect Wallet" />
            <Link href="#products" className={cn(buttonVariants({ size: "lg" }))}>
              Explore Products
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/pilots" className={cn(buttonVariants({ size: "lg", variant: "outline" }))}>
              Request Pilot
            </Link>
            <Link href="mailto:Fahd.kotb@tuta.io?subject=PrivateDAO%20Enterprise%20Discovery" className={cn(buttonVariants({ size: "lg", variant: "outline" }))}>
              Book Discovery Call
            </Link>
          </div>
          <div className="mt-7 flex flex-wrap gap-x-5 gap-y-2 text-sm text-white/58">
            {["Proof-ready", "Private by default", "Buyer paths", "Pilot-ready"].map((item) => (
              <div key={item} className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-100" />
                {item}
              </div>
            ))}
          </div>
        </div>

        <aside className="rounded-[26px] border border-white/10 bg-white/[0.035] p-5 sm:p-6">
          <div className="flex items-center gap-3 text-cyan-100">
            <ShieldCheck className="h-5 w-5" />
            <div className="text-[11px] uppercase tracking-[0.26em]">One simple operating flow</div>
          </div>
          <div className="mt-5 grid gap-3">
            {flow.map(([title, body], index) => (
              <article key={title} className="rounded-[20px] border border-white/10 bg-black/22 p-4">
                <div className="text-[10px] uppercase tracking-[0.22em] text-emerald-100/72">Step {index + 1}</div>
                <h2 className="mt-2 text-base font-semibold text-white">{title}</h2>
                <p className="mt-2 text-sm leading-6 text-white/60">{body}</p>
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
