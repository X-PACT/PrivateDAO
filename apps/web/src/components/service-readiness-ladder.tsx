import Link from "next/link";
import { ArrowUpRight, BriefcaseBusiness, Gauge, ShieldCheck, SquareTerminal } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const stages = [
  {
    title: "Real service",
    icon: BriefcaseBusiness,
    color: "text-cyan-100",
    eyebrow: "Live product",
    points: [
      "Wallet-first govern flow and live activity surface for governance operations.",
      "Hosted Read API + Ops, confidential operations, and enterprise governance service packaging.",
      "Proof, diagnostics, and trust routes connected to the same product shell customers see.",
    ],
    links: [
      { label: "Govern", href: "/govern" },
      { label: "Services", href: "/services" },
      { label: "Engage", href: "/engage" },
    ],
  },
  {
    title: "Automated validation",
    icon: SquareTerminal,
    color: "text-emerald-100",
    eyebrow: "Verification gates",
    points: [
      "`verify:frontend-surface`, `verify:browser-smoke`, and `web:verify:live:root` keep the live app honest.",
      "`verify:runtime-surface`, `verify:generated-artifacts`, and wallet/runtime gates keep proof and ops routes synchronized.",
      "Track validation stays tied to the actual sponsor, proof, and buyer surfaces instead of isolated scripts.",
    ],
    links: [
      { label: "Diagnostics", href: "/diagnostics" },
      { label: "Learn", href: "/learn" },
      { label: "Viewer", href: "/viewer/runtime-evidence.generated" },
    ],
  },
  {
    title: "Measurable evidence",
    icon: Gauge,
    color: "text-fuchsia-100",
    eyebrow: "Published evidence",
    points: [
      "Runtime evidence, wallet matrix, PDAO attestation, and live proof packets remain published and inspectable.",
      "Competition and mainnet claims are backed by generated artifacts, not only UI text.",
      "The same evidence surfaces support judges, buyers, operators, and future customers.",
    ],
    links: [
      { label: "Live Proof V3", href: "/documents/live-proof-v3" },
      { label: "Wallet matrix", href: "/viewer/wallet-compatibility-matrix.generated" },
      { label: "Mainnet acceptance", href: "/viewer/mainnet-acceptance-matrix.generated" },
    ],
  },
  {
    title: "Buyer-ready surface",
    icon: ShieldCheck,
    color: "text-amber-100",
    eyebrow: "Commercial delivery",
    points: [
      "Pilot, hosted reads, confidential operations, and enterprise governance are presented as real offers.",
      "Trust package, launch trust packet, and mainnet blockers keep sales posture grounded in truth.",
      "Product learning and proof routes now connect directly into customer conversion and mainnet trajectory.",
    ],
    links: [
      { label: "Products", href: "/products" },
      { label: "Trust package", href: "/documents/trust-package" },
      { label: "Launch trust packet", href: "/documents/launch-trust-packet" },
    ],
  },
];

export function ServiceReadinessLadder() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Operational proof chain</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4 xl:grid-cols-4">
        {stages.map((stage) => {
          const Icon = stage.icon;
          return (
            <div
              key={stage.title}
              className="rounded-3xl border border-white/8 bg-white/4 p-5"
            >
              <div className="flex items-start justify-between gap-4">
                <div className={`rounded-2xl border border-white/8 bg-black/20 p-3 ${stage.color}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="text-[11px] uppercase tracking-[0.24em] text-white/42">
                  {stage.eyebrow}
                </div>
              </div>
              <div className="mt-4 text-lg font-medium text-white">{stage.title}</div>
              <div className="mt-4 grid gap-3">
                {stage.points.map((point) => (
                  <div
                    key={`${stage.title}-${point}`}
                    className="rounded-2xl border border-white/8 bg-black/20 px-4 py-3 text-sm leading-7 text-white/66"
                  >
                    {point}
                  </div>
                ))}
              </div>
              <div className="mt-4 flex flex-wrap gap-3">
                {stage.links.map((link) => (
                  <Link
                    key={`${stage.title}-${link.href}`}
                    href={link.href}
                    className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/6 px-4 py-2 text-xs uppercase tracking-[0.18em] text-white/68 transition hover:border-cyan-300/30 hover:text-white"
                  >
                    {link.label}
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </Link>
                ))}
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
