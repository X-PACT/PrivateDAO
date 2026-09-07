import type { Metadata } from "next";
import Link from "next/link";

import { OperationsShell } from "@/components/operations-shell";
import { buttonVariants } from "@/components/ui/button";
import { buildRouteMetadata } from "@/lib/route-metadata";
import { cn } from "@/lib/utils";

export const metadata: Metadata = buildRouteMetadata({
  title: "PrivateDAO Investors",
  description: "The current PrivateDAO investor overview and commercial product portfolio.",
  path: "/deck",
  keywords: ["PrivateDAO investors", "commercial product portfolio", "confidential coordination"],
});

export default function DeckCompatibilityPage() {
  return (
    <OperationsShell
      eyebrow="Investor materials"
      title="The investor overview now lives in one commercial surface."
      description="The former pitch deck route is retained only for URL compatibility. Use the current Investors page for the product portfolio, commercial model, and partnership path."
      navigationMode="guided"
      badges={[{ label: "Investor overview", variant: "cyan" }, { label: "Commercial product", variant: "violet" }]}
    >
      <section className="rounded-[28px] border border-cyan-300/16 bg-cyan-300/[0.06] p-6">
        <h2 className="text-2xl font-semibold text-white">PrivateDAO Investors</h2>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-white/65">The former deck route is a compatibility bridge; the canonical investor surface is now the same commercial UI used across the product.</p>
        <Link href="/investors/" className={cn(buttonVariants({ size: "sm" }), "mt-5")}>Open Investors</Link>
      </section>
    </OperationsShell>
  );
}
