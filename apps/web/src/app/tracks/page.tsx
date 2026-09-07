import type { Metadata } from "next";
import Link from "next/link";

import { OperationsShell } from "@/components/operations-shell";
import { buttonVariants } from "@/components/ui/button";
import { buildRouteMetadata } from "@/lib/route-metadata";
import { cn } from "@/lib/utils";

export const metadata: Metadata = buildRouteMetadata({
  title: "Learning Redirect",
  description:
    "Preserved track route for judges and ecosystem reviewers with direct access to QVAC, Cloak, proof, and the learning surface.",
  path: "/tracks",
  keywords: ["PrivateDAO learning route", "governance product", "devnet guide"],
  index: false
});

export default function TracksPage() {
  return (
    <OperationsShell
      eyebrow="Tracks"
      title="Track route preserved for hackathon and ecosystem review"
      description="This route keeps submitted and shared track links alive while routing reviewers into the active QVAC, Cloak, proof, and learning surfaces."
      badges={[
        { label: "QVAC", variant: "cyan" },
        { label: "Cloak", variant: "violet" },
        { label: "Proof linked", variant: "success" },
      ]}
    >
      <section className="grid gap-4 md:grid-cols-2">
        {[
          ["QVAC sovereign AI", "/services/qvac-sovereign-ai", "Local-first pre-sign intelligence and runtime SDK proof."],
          ["Cloak private settlement", "/services/cloak-private-settlement", "Private treasury settlement intent and receipt continuity."],
          ["Reviewer proof", "/proof", "Receipts, runtime endpoints, and verification surfaces."],
          ["Learning surface", "/learn", "Workflow-first product explanation for operators and judges."],
        ].map(([title, href, body]) => (
          <div key={href} className="rounded-[24px] border border-white/10 bg-white/[0.035] p-5">
            <h2 className="text-lg font-semibold text-white">{title}</h2>
            <p className="mt-2 min-h-14 text-sm leading-6 text-white/60">{body}</p>
            <Link href={href} className={cn(buttonVariants({ size: "sm", variant: "outline" }), "mt-4")}>
              Open route
            </Link>
          </div>
        ))}
      </section>
    </OperationsShell>
  );
}
