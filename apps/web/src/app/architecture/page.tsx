import type { Metadata } from "next";
import Link from "next/link";

import { BreadcrumbJsonLd, JsonLd } from "@/components/seo-structured-data";
import { OperationsShell } from "@/components/operations-shell";
import { buildRouteMetadata } from "@/lib/route-metadata";
import { siteUrl } from "@/lib/site-brand";

export const metadata: Metadata = buildRouteMetadata({
  title: "Architecture",
  description: "A plain-language view of how PrivateDAO keeps organizational workflows private while producing verifiable outcomes.",
  path: "/architecture",
  image: "/assets/social/whitepaper.png",
  keywords: ["PrivateDAO architecture", "privacy infrastructure", "verifiable workflows", "workflow adapters"],
});

const layers = [
  ["Workflow", "Payroll, treasury, governance, procurement, and verification start with the organization’s actual work."],
  ["Policy", "The organization defines who can review, approve, execute, and verify the outcome."],
  ["Execution", "PrivateDAO selects the appropriate wallet, provider, and network path when the workflow requires it."],
  ["Outcome", "The process produces a clear status, receipt, or verification link without exposing unnecessary source data."],
] as const;

export default function ArchitecturePage() {
  return (
    <OperationsShell eyebrow="Build · Architecture" title="One workflow. The right infrastructure underneath." description="PrivateDAO keeps the customer experience focused on work and policy while the execution layer adapts to the supported environment." navigationMode="guided" badges={[{ label: "Workflow-first", variant: "cyan" }, { label: "Evidence-bound", variant: "success" }]}>
      <JsonLd data={{ "@context": "https://schema.org", "@type": "TechArticle", headline: "PrivateDAO Architecture", description: metadata.description, url: `${siteUrl}/architecture/`, author: { "@type": "Organization", name: "PrivateDAO", url: siteUrl } }} />
      <BreadcrumbJsonLd items={[{ name: "PrivateDAO", path: "/" }, { name: "Architecture", path: "/architecture" }]} />
      <section className="grid gap-4 md:grid-cols-2">
        {layers.map(([title, body], index) => <article key={title} className="enterprise-card rounded-[22px] p-6"><div className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#175cd3]">0{index + 1}</div><h2 className="mt-4 text-xl font-semibold text-[#10233f]">{title}</h2><p className="mt-3 text-sm leading-7 text-[#5d6d82]">{body}</p></article>)}
      </section>
      <section className="enterprise-card rounded-[24px] p-6 sm:p-8"><div className="commercial-eyebrow">For builders</div><h2 className="mt-3 text-2xl font-semibold text-[#10233f]">The product stays portable. The evidence stays explicit.</h2><p className="mt-4 max-w-4xl text-sm leading-7 text-[#5d6d82]">Network and provider support is capability-gated. A network is not presented as supported merely because an RPC endpoint responds; the relevant product path must have an adapter and independent evidence.</p><Link href="/networks" className="mt-5 inline-flex text-sm font-semibold text-[#175cd3]">Review network capabilities</Link></section>
    </OperationsShell>
  );
}
