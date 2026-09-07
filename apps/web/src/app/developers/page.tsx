import type { Metadata } from "next";
import Link from "next/link";

import { OperationsShell } from "@/components/operations-shell";
import { buttonVariants } from "@/components/ui/button";
import { buildRouteMetadata } from "@/lib/route-metadata";
import { cn } from "@/lib/utils";

export const metadata: Metadata = buildRouteMetadata({
  title: "Developers",
  description:
    "Developer and reviewer resources for PrivateDAO: repository, API status, runtime proof, Android route, documents, and evidence pages.",
  path: "/developers",
  keywords: ["PrivateDAO developers", "PrivateDAO API", "PrivateDAO repository", "runtime proof", "developer docs"],
});

const resources = [
  ["Blind Policy API", "Interactive API console for proving and verifying private policy decisions.", "/developers/blind-policy-api"],
  ["Blind Policy SDK", "Typed SDK surface prepared for customer pilots and private package distribution.", "/developers/blind-policy-sdk"],
  ["Repository", "Source-linked implementation context and public project history.", "https://github.com/X-PACT/PrivateDAO"],
  ["API Status", "Live API routes and operational readiness surfaces.", "/api-status"],
  ["Runtime Proof", "Runtime evidence and proof-linked technical packets.", "/documents/governance-runtime-proof"],
  ["Android", "Mobile route and Android APK material for technical reviewers.", "/android"],
  ["Documents", "Architecture, matrices, evidence packets, and historical routes.", "/documents"],
  ["Evidence", "Judge/reviewer evidence preserved outside the buyer-first navigation.", "/judge"],
] as const;

export default function DevelopersPage() {
  return (
    <OperationsShell
      eyebrow="Developers"
      title="Developer resources live here, not in the buyer path."
      description="The primary website stays commercial and simple. Builders, reviewers, and technical operators can still access source, APIs, proof packets, and historical evidence from this page."
      navigationMode="guided"
      badges={[]}
    >
      <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {resources.map(([title, body, href]) => {
          const external = href.startsWith("http");
          const className = "rounded-[24px] border border-white/10 bg-white/[0.035] p-5 transition hover:border-cyan-300/28";
          const content = (
            <>
              <h2 className="text-base font-semibold text-white">{title}</h2>
              <p className="mt-2 text-sm leading-6 text-white/62">{body}</p>
            </>
          );
          return external ? (
            <a key={title} href={href} target="_blank" rel="noreferrer" className={className}>{content}</a>
          ) : (
            <Link key={title} href={href} className={className}>{content}</Link>
          );
        })}
      </section>
      <section className="rounded-[28px] border border-cyan-300/16 bg-cyan-300/[0.06] p-5 sm:p-6">
        <h2 className="text-2xl font-semibold text-white">Need a buyer-facing path?</h2>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-white/64">
          Use the commercial product routes when sharing with customers: Proof Workflows, Private Governance, Treasury,
          Pricing, Security, Enterprise, and Pilots.
        </p>
        <Link href="/products" className={cn(buttonVariants({ size: "sm" }), "mt-5")}>
          Open products
        </Link>
      </section>
    </OperationsShell>
  );
}
