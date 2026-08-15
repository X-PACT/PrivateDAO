import type { Metadata } from "next";
import Link from "next/link";

import { OperationsShell } from "@/components/operations-shell";
import { ProductVideo } from "@/components/product-video";
import { buttonVariants } from "@/components/ui/button";
import { buildRouteMetadata } from "@/lib/route-metadata";
import { cn } from "@/lib/utils";

export const metadata: Metadata = buildRouteMetadata({
  title: "Record Verification",
  description: "Turn critical records into trusted evidence with a receipt people can check.",
  path: "/products/record-verification",
  keywords: ["record verification", "verifiable records", "audit evidence"],
});

export default function RecordVerificationProductPage() {
  return (
    <OperationsShell
      eyebrow="Verify"
      title="Turn critical records into trusted evidence."
      description="Record Verification gives data platforms, audit systems, and reporting teams a clear way to validate a structured record and share its result."
      navigationMode="guided"
      badges={[{ label: "Evidence-ready", variant: "success" }, { label: "Walletless review", variant: "cyan" }]}
    >
      <ProductVideo
        slug="record-verification"
        title="From record to receipt."
        description="Submit a record, apply the agreed policy, and share a public verification page without asking the reviewer to understand the underlying machinery."
      />
      <section className="grid gap-4 md:grid-cols-3">
        {[
          ["Structured", "Validate a record against an agreed schema before it becomes evidence."],
          ["Consistent", "Use the same canonical representation every time."],
          ["Independent", "Let a reviewer check the receipt without a wallet."],
        ].map(([title, copy]) => (
          <article key={title} className="rounded-[24px] border border-white/10 bg-white/[0.035] p-5">
            <h2 className="font-semibold text-white">{title}</h2>
            <p className="mt-2 text-sm leading-6 text-white/60">{copy}</p>
          </article>
        ))}
      </section>
      <div className="flex flex-wrap gap-3">
        <Link href="/developers" className={cn(buttonVariants({ size: "lg" }))}>Connect an integration</Link>
        <a href="mailto:Fahd.kotb@tuta.io?subject=PrivateDAO%20Record%20Verification%20Pilot" className={cn(buttonVariants({ size: "lg", variant: "outline" }))}>Request a pilot</a>
      </div>
    </OperationsShell>
  );
}
