import type { Metadata } from "next";
import Link from "next/link";

import { OperationsShell } from "@/components/operations-shell";
import { buttonVariants } from "@/components/ui/button";
import { buildRouteMetadata } from "@/lib/route-metadata";
import { cn } from "@/lib/utils";

export const metadata: Metadata = buildRouteMetadata({
  title: "DAO UI Template",
  description:
    "Preserved legacy DAO UI template route with direct links into the current PrivateDAO governance template, live app, and proof flow.",
  path: "/dao-ui-template",
  keywords: ["DAO UI template", "PrivateDAO governance", "Solana DAO template", "proof"],
  index: false,
});

export default function DaoUiTemplatePage() {
  return (
    <OperationsShell
      eyebrow="Preserved route"
      title="DAO UI template route preserved for reviewers and legacy links"
      description="This route remains live instead of redirecting silently. Reviewers can continue into the current governance template, open the wallet-first governance lane, or verify proof continuity."
      badges={[
        { label: "Legacy link preserved", variant: "cyan" },
        { label: "No route deletion", variant: "success" },
      ]}
    >
      <section className="rounded-[28px] border border-cyan-300/16 bg-cyan-300/[0.08] p-6">
        <h2 className="text-2xl font-semibold text-white">Current destination</h2>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-white/66">
          The original DAO UI template has moved into the active PrivateDAO governance template and wallet-first
          execution flow. This bridge keeps the submitted URL valid while showing the correct live path.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link href="/governance-template" className={cn(buttonVariants({ size: "sm" }))}>
            Open governance template
          </Link>
          <Link href="/govern" className={cn(buttonVariants({ size: "sm", variant: "secondary" }))}>
            Open govern
          </Link>
          <Link href="/proof" className={cn(buttonVariants({ size: "sm", variant: "outline" }))}>
            Open proof
          </Link>
        </div>
      </section>
    </OperationsShell>
  );
}
