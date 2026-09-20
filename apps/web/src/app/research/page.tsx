import type { Metadata } from "next";
import Link from "next/link";

import { BreadcrumbJsonLd, JsonLd } from "@/components/seo-structured-data";
import { OperationsShell } from "@/components/operations-shell";
import { buildRouteMetadata } from "@/lib/route-metadata";
import { researchArticles } from "@/lib/research-content";
import { siteUrl } from "@/lib/site-brand";

export const metadata: Metadata = buildRouteMetadata({
  title: "Research and Insights",
  description: "Original PrivateDAO research on organizational privacy, verifiable workflows, payroll, governance, and private coordination.",
  path: "/research",
  image: "/assets/social/thesis.png",
  keywords: ["organizational privacy", "verifiable workflows", "private governance research", "confidential payroll insights"],
});

export default function ResearchPage() {
  return (
    <OperationsShell eyebrow="Research and Insights" title="Private work deserves better ideas." description="Original thinking about privacy, proof, and the organizational workflows that connect them." navigationMode="guided" badges={[{ label: "Original research", variant: "cyan" }, { label: "Plain language", variant: "success" }]}>
      <JsonLd data={{ "@context": "https://schema.org", "@type": "CollectionPage", name: "PrivateDAO Research and Insights", url: `${siteUrl}/research/`, description: metadata.description }} />
      <BreadcrumbJsonLd items={[{ name: "PrivateDAO", path: "/" }, { name: "Research and Insights", path: "/research" }]} />
      <section className="grid gap-4 md:grid-cols-3">
        {researchArticles.map((article) => (
          <article key={article.slug} className="enterprise-card rounded-[22px] p-5 sm:p-6">
            <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#175cd3]">{article.readTime}</div>
            <h2 className="mt-4 text-xl font-semibold leading-tight text-[#10233f]"><Link href={`/research/${article.slug}`} className="hover:text-[#175cd3]">{article.title}</Link></h2>
            <p className="mt-3 text-sm leading-7 text-[#5d6d82]">{article.description}</p>
            <Link href={`/research/${article.slug}`} className="mt-5 inline-flex text-sm font-semibold text-[#175cd3]">Read the insight</Link>
          </article>
        ))}
      </section>
    </OperationsShell>
  );
}
