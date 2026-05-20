import type { Metadata } from "next";
import Link from "next/link";

import { OperationsShell } from "@/components/operations-shell";
import { ProjectOperatingMap } from "@/components/project-operating-map";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buildRouteMetadata } from "@/lib/route-metadata";
import { cn } from "@/lib/utils";

export const metadata: Metadata = buildRouteMetadata({
  title: "About",
  description:
    "PrivateDAO is a wallet-first Solana Testnet financial OS for private governance, treasury execution, local-first AI, and reviewer-visible proof.",
  path: "/about",
  keywords: ["about", "PrivateDAO", "Solana Testnet", "Anchor 1", "QVAC", "private governance"],
});

const lanes = [
  {
    title: "For users",
    body: "Connect a Testnet wallet, review the action, sign only what you understand, then verify the receipt and proof path.",
    href: "/start",
  },
  {
    title: "For judges",
    body: "Inspect the Anchor 1 Testnet program, proof matrix, live proof V3, ZK capability matrix, and direct Solscan evidence.",
    href: "/judge",
  },
  {
    title: "For builders",
    body: "Use the developer portal, RPC services, privacy starter, and QVAC route to understand how the product lanes are assembled.",
    href: "/developers",
  },
] as const;

export default function AboutPage() {
  return (
    <OperationsShell
      eyebrow="About PrivateDAO"
      title="Private governance, treasury execution, local intelligence, and proof in one Solana operating surface"
      description="PrivateDAO is built as public-good governance and treasury infrastructure: live on Solana Testnet, upgraded to Anchor 1.0.1, wallet-first for normal users, and evidence-first for reviewers."
      badges={[
        { label: "Anchor 1 Testnet", variant: "cyan" },
        { label: "QVAC local AI", variant: "violet" },
        { label: "Proof-first", variant: "success" },
      ]}
    >
      <Card className="border-cyan-300/16 bg-cyan-300/[0.07]">
        <CardHeader>
          <CardTitle>The narrative</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm leading-7 text-white/68">
          <p>
            PrivateDAO solves the operating gap between public blockchains and private organizational work. DAOs need
            transparent settlement, but they also need confidential voting context, protected payout operations, simple
            compliance review, and a product surface that non-terminal users can operate safely.
          </p>
          <p>
            The product breakthrough is usability: the hard parts no longer require code, terminal commands, or a deep
            cryptography background. PrivateDAO turns proposal context, local AI review, private payroll, confidential
            payouts, B2B settlement, gaming rewards, treasury routing, compliance packs, and proof exports into guided
            interface steps that can be learned in Learn and operated from web or mobile.
          </p>
          <p>
            The current release is Testnet-first with real wallet actions, real public signatures, real proof packets, and
            a clean path toward production readiness.
          </p>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        {lanes.map((lane) => (
          <Link
            key={lane.title}
            href={lane.href}
            className="rounded-[24px] border border-white/8 bg-white/[0.035] p-5 transition hover:border-cyan-300/22 hover:bg-white/[0.055]"
          >
            <div className="text-lg font-semibold text-white">{lane.title}</div>
            <p className="mt-3 text-sm leading-7 text-white/60">{lane.body}</p>
          </Link>
        ))}
      </div>

      <ProjectOperatingMap
        description="About should explain the whole operating system clearly: governance creates the decision, intelligence informs it, execute handles the signed action, confidential payment rails settle privately, payroll and treasury remain structured, and proof preserves trust afterward."
      />

      <Card>
        <CardHeader>
          <CardTitle>Current proof boundary</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 text-sm leading-7 text-white/64 md:grid-cols-2">
          <div className="rounded-2xl border border-white/8 bg-black/20 p-4">
            <Badge variant="success">Live</Badge>
            <div className="mt-3">Anchor 1.0.1 Testnet program, web constants, Android constants, IDL posture, proof routes, and reviewer docs are aligned.</div>
          </div>
          <div className="rounded-2xl border border-white/8 bg-black/20 p-4">
            <Badge variant="warning">Gated</Badge>
            <div className="mt-3">Mainnet custody ceremony, external audit closure, and production real-funds movement remain explicit pre-release gates.</div>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-wrap gap-3">
        <Link className={cn(buttonVariants({ size: "lg", variant: "outline" }))} href="/whitepaper">
          Open Whitepaper
        </Link>
        <Link className={cn(buttonVariants({ size: "lg" }))} href="/proof">
          Open proof
        </Link>
        <Link className={cn(buttonVariants({ size: "lg", variant: "secondary" }))} href="/documents/anchor-1-migration-evidence-2026-04-30">
          Anchor 1 evidence
        </Link>
        <Link className={cn(buttonVariants({ size: "lg", variant: "outline" }))} href="/documents/live-proof-v3">
          Live proof V3
        </Link>
      </div>
    </OperationsShell>
  );
}
