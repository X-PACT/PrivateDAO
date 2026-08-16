import type { Metadata } from "next";
import Link from "next/link";

import { OperationsShell } from "@/components/operations-shell";
import { buttonVariants } from "@/components/ui/button";
import { buildRouteMetadata } from "@/lib/route-metadata";
import { cn } from "@/lib/utils";

export const metadata: Metadata = buildRouteMetadata({
  title: "Blind Verification",
  description: "Prove that a policy was followed without exposing sensitive inputs.",
  path: "/products/blind-verification",
  keywords: ["blind verification", "private verification", "policy evidence"],
});

export default function BlindVerificationProductPage() {
  return (
    <OperationsShell
      eyebrow="Verify"
      title="Prove the rule. Keep the input private."
      description="Blind Verification helps compliance, HR, grant, and finance teams produce a trusted answer without putting sensitive source data on display."
      navigationMode="guided"
      badges={[{ label: "Privacy-first", variant: "cyan" }, { label: "Shareable result", variant: "success" }]}
    >
      <section className="grid gap-4 md:grid-cols-3">
        {[
          ["Private inputs", "Sensitive source data stays behind the verification boundary."],
          ["Policy-led", "The result follows a defined rule instead of a manual claim."],
          ["Easy to share", "Give reviewers a clear result and evidence trail."],
        ].map(([title, copy]) => (
          <article key={title} className="rounded-[24px] border border-white/10 bg-white/[0.035] p-5">
            <h2 className="font-semibold text-white">{title}</h2>
            <p className="mt-2 text-sm leading-6 text-white/60">{copy}</p>
          </article>
        ))}
      </section>
      <div className="flex flex-wrap gap-3">
        <Link href="/proof" className={cn(buttonVariants({ size: "lg" }))}>Open verification</Link>
        <a href="mailto:Fahd.kotb@tuta.io?subject=PrivateDAO%20Blind%20Verification%20Pilot" className={cn(buttonVariants({ size: "lg", variant: "outline" }))}>Request a pilot</a>
      </div>
    </OperationsShell>
  );
}
