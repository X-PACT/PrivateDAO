import type { Metadata } from "next";
import Link from "next/link";

import { OperationsShell } from "@/components/operations-shell";
import { ProjectOperatingMap } from "@/components/project-operating-map";
import { JudgeFoundationMessageCard } from "@/components/judge-foundation-message-card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { buildRouteMetadata } from "@/lib/route-metadata";
import { cn } from "@/lib/utils";

export const metadata: Metadata = buildRouteMetadata({
  title: "Trust",
  description:
    "Trust route for Whitepaper, roadmap, and practical verification boundaries linked to the live security and proof surfaces.",
  path: "/trust",
  keywords: ["trust", "whitepaper", "roadmap", "security", "proof", "operating boundary"],
});

const trustPackets = [
  {
    title: "Whitepaper",
    body:
      "Architecture, encryption layers, local-first intelligence, ZK direction, treasury logic, threat boundaries, and wallet-first execution design.",
    href: "/whitepaper",
    cta: "Open Whitepaper",
  },
  {
    title: "Roadmap",
    body:
      "Phase 1 core proof, Phase 2 encrypted customer delivery, Mainnet security reviews, and Phase 3 cross-chain expansion anchored by Solana.",
    href: "/whitepaper#phase-roadmap",
    cta: "Open Roadmap",
  },
  {
    title: "Security execution surface",
    body:
      "Live hardening, custody readiness, runtime evidence, and launch gates stay in the security route for operational verification.",
    href: "/security",
    cta: "Open Security",
  },
] as const;

export default function TrustPage() {
  return (
    <OperationsShell
      eyebrow="Trust"
      title="Whitepaper, roadmap, and verifiable security boundaries"
      description="This trust route keeps the narrative clean: Whitepaper and roadmap context here, with direct links to live proof and operational security surfaces."
      badges={[
        { label: "Whitepaper", variant: "warning" },
        { label: "Roadmap", variant: "cyan" },
        { label: "Verification-first", variant: "success" },
      ]}
    >
      <section id="whitepaper" className="rounded-[28px] border border-amber-300/18 bg-amber-300/[0.07] p-6">
        <div className="flex flex-wrap gap-2">
          <Badge variant="warning">Whitepaper in trust</Badge>
          <Badge variant="cyan">Roadmap in trust</Badge>
        </div>
        <p className="mt-4 max-w-4xl text-sm leading-7 text-white/66">
          Whitepaper and roadmap are intentionally centralized in this trust route to keep reviewer flow professional,
          avoid section duplication, and preserve a single source of context.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {trustPackets.map((item) => (
          <div key={item.title} className="rounded-[24px] border border-white/10 bg-white/[0.035] p-5">
            <h2 className="text-lg font-semibold text-white">{item.title}</h2>
            <p className="mt-3 text-sm leading-7 text-white/62">{item.body}</p>
            <Link href={item.href} className={cn(buttonVariants({ size: "sm" }), "mt-4")}>
              {item.cta}
            </Link>
          </div>
        ))}
      </section>

      <JudgeFoundationMessageCard />
      <ProjectOperatingMap
        compact
        title="Trust should point into the real product, not away from it"
        description="Whitepaper and roadmap belong here, but trust is completed only when they connect directly to governance, intelligence, execution, confidential payment rails, and proof. This route is the narrative bridge into those live sections."
      />

      <div className="flex flex-wrap gap-3">
        <Link className={cn(buttonVariants({ size: "sm" }))} href="/judge">
          Open judge route
        </Link>
        <Link className={cn(buttonVariants({ size: "sm", variant: "outline" }))} href="/proof">
          Open proof
        </Link>
        <Link className={cn(buttonVariants({ size: "sm", variant: "outline" }))} href="/intelligence">
          Open intelligence
        </Link>
      </div>
    </OperationsShell>
  );
}
