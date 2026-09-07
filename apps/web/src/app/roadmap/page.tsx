import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Bot, CheckCircle2, Gamepad2, ShieldCheck } from "lucide-react";

import { OperationsShell } from "@/components/operations-shell";
import { buttonVariants } from "@/components/ui/button";
import { buildRouteMetadata } from "@/lib/route-metadata";
import { cn } from "@/lib/utils";

export const metadata: Metadata = buildRouteMetadata({
  title: "PrivateDAO Roadmap",
  description: "The PrivateDAO product roadmap: commercial workflows, agent marketplace, and PDAO Worlds.",
  path: "/roadmap",
  keywords: ["PrivateDAO roadmap", "agent marketplace", "PDAO Worlds", "commercial privacy products"],
});

const milestones = [
  ["Available now", "Customer-ready entry points for payroll, treasury coordination, private governance, sealed auctions, Blind Verification, and Record Verification."],
  ["Network expansion", "Agent Exchange discovery, provider onboarding, machine-readable pricing, receipts, and agent-to-agent service delivery."],
  ["Consumer layer", "PDAO Worlds as a playable, independent game product that introduces privacy, proof, and coordination to a wider audience."],
  ["Scale with evidence", "Repeatable pilots, usage metering, provider reputation, and infrastructure improvements driven by real customer activity."],
] as const;

const principles = [
  "Every release keeps the customer outcome ahead of the implementation detail.",
  "Private inputs remain protected while outcomes stay verifiable.",
  "Agents and game users are measured separately from internal tests and demos.",
  "New rails are added only when they improve a live product workflow.",
] as const;

export default function RoadmapPage() {
  return (
    <OperationsShell
      eyebrow="Roadmap"
      title="A commercial path from trusted workflows to a wider network."
      description="PrivateDAO grows around products customers can understand today, then expands through agents, providers, and PDAO Worlds without hiding the evidence behind the progress."
      navigationMode="guided"
      badges={[{ label: "Product roadmap", variant: "cyan" }, { label: "Commercial focus", variant: "success" }, { label: "Evidence-led", variant: "violet" }]}
    >
      <section className="grid gap-4 lg:grid-cols-2">
        {milestones.map(([title, body], index) => (
          <article key={title} className={cn("rounded-[28px] border p-5 sm:p-6", index === 0 ? "border-emerald-300/22 bg-emerald-300/[0.06]" : index === 1 ? "border-cyan-300/18 bg-cyan-300/[0.05]" : index === 2 ? "border-violet-300/20 bg-violet-300/[0.06]" : "border-white/10 bg-white/[0.035]") }>
            <div className="flex items-start gap-3"><CheckCircle2 className="mt-1 h-5 w-5 shrink-0 text-cyan-100" /><div><h2 className="text-xl font-semibold text-white">{title}</h2><p className="mt-3 text-sm leading-7 text-white/65">{body}</p></div></div>
          </article>
        ))}
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <Link href="/agents/" className="rounded-[28px] border border-cyan-300/18 bg-cyan-300/[0.05] p-5 transition hover:border-cyan-200/35 sm:p-6">
          <Bot className="h-6 w-6 text-cyan-100" /><h2 className="mt-4 text-2xl font-semibold text-white">Agent Exchange</h2><p className="mt-3 text-sm leading-7 text-white/65">A machine-native marketplace for discovery, service procurement, payment, and verifiable results.</p><span className="mt-5 inline-flex text-sm font-semibold text-cyan-100">Explore Agents <ArrowRight className="ml-2 h-4 w-4" /></span>
        </Link>
        <a href="https://game.privatedao.org/game/godot/index.html" className="rounded-[28px] border border-violet-300/18 bg-violet-300/[0.05] p-5 transition hover:border-violet-200/35 sm:p-6">
          <Gamepad2 className="h-6 w-6 text-violet-100" /><h2 className="mt-4 text-2xl font-semibold text-white">PDAO Worlds</h2><p className="mt-3 text-sm leading-7 text-white/65">A consumer game layer that turns trust, privacy, verification, and coordination into playable experiences.</p><span className="mt-5 inline-flex text-sm font-semibold text-violet-100">Play PDAO Worlds <ArrowRight className="ml-2 h-4 w-4" /></span>
        </a>
      </section>

      <section className="rounded-[28px] border border-white/10 bg-white/[0.035] p-5 sm:p-6"><div className="flex items-start gap-3"><ShieldCheck className="mt-1 h-5 w-5 shrink-0 text-emerald-100" /><div><h2 className="text-2xl font-semibold text-white">Release discipline</h2><div className="mt-4 grid gap-2">{principles.map((item) => <div key={item} className="rounded-2xl border border-white/8 bg-black/20 px-4 py-3 text-sm leading-6 text-white/65">{item}</div>)}</div></div></div><Link href="/investors/" className={cn(buttonVariants({ size: "sm" }), "mt-6")}>View Investors <ArrowRight className="h-4 w-4" /></Link></section>
    </OperationsShell>
  );
}
