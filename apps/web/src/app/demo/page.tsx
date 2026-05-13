import type { Metadata } from "next";
import Link from "next/link";

import { OperationsShell } from "@/components/operations-shell";
import { buttonVariants } from "@/components/ui/button";
import { buildRouteMetadata } from "@/lib/route-metadata";
import { cn } from "@/lib/utils";

export const metadata: Metadata = buildRouteMetadata({
  title: "Legacy Learning Alias",
  description:
    "Legacy route redirected to the main product learning surface so visitors land on the live PrivateDAO explanation first.",
  path: "/demo",
  keywords: ["private dao", "product story", "learn private dao", "devnet governance"],
  index: false,
});

export default function DemoAliasPage() {
  return (
    <OperationsShell
      eyebrow="Demo"
      title="Demo route preserved with direct access to the live product walkthrough"
      description="This legacy demo URL remains active for judges, submitted links, and older walkthroughs. It now points visitors to the current learning, QVAC, execution, and proof paths."
      badges={[
        { label: "Demo preserved", variant: "cyan" },
        { label: "Reviewer safe", variant: "success" },
      ]}
    >
      <section className="rounded-[28px] border border-emerald-300/16 bg-emerald-300/[0.08] p-6">
        <h2 className="text-2xl font-semibold text-white">Open the current demo flow</h2>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-white/66">
          The current walkthrough is route-based: learn the workflow, review QVAC local intelligence, execute a private
          operation, and verify the receipt trail.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link href="/learn" className={cn(buttonVariants({ size: "sm" }))}>
            Open learn
          </Link>
          <Link href="/services/qvac-sovereign-ai" className={cn(buttonVariants({ size: "sm", variant: "secondary" }))}>
            Open QVAC
          </Link>
          <Link href="/proof" className={cn(buttonVariants({ size: "sm", variant: "outline" }))}>
            Open proof
          </Link>
        </div>
      </section>
    </OperationsShell>
  );
}
