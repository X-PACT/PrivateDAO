import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { BreadcrumbJsonLd, JsonLd } from "@/components/seo-structured-data";
import { OperationsShell } from "@/components/operations-shell";
import { getResearchArticle, researchArticles } from "@/lib/research-content";
import { buildRouteMetadata } from "@/lib/route-metadata";
import { siteUrl } from "@/lib/site-brand";

export function generateStaticParams() {
  return researchArticles.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const article = getResearchArticle(slug);
  if (!article) return buildRouteMetadata({ title: "Research", description: "PrivateDAO research and insights.", path: `/research/${slug}`, index: false });
  return buildRouteMetadata({ title: article.title, description: article.description, path: `/research/${article.slug}`, image: "/assets/social/thesis.png", keywords: ["PrivateDAO research", "organizational privacy", "verifiable outcomes"] });
}

export default async function ResearchArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = getResearchArticle(slug);
  if (!article) notFound();
  const articleUrl = `${siteUrl}/research/${article.slug}/`;
  return (
    <OperationsShell eyebrow="Research and Insights" title={article.title} description={article.description} navigationMode="focused" badges={[{ label: article.readTime, variant: "cyan" }, { label: "PrivateDAO perspective", variant: "success" }]}>
      <JsonLd data={{ "@context": "https://schema.org", "@type": "Article", headline: article.title, description: article.description, datePublished: article.publishedAt, dateModified: article.publishedAt, mainEntityOfPage: articleUrl, url: articleUrl, author: { "@type": "Person", name: "Fahd Kotb", url: `${siteUrl}/about/` }, publisher: { "@type": "Organization", name: "PrivateDAO", url: siteUrl } }} />
      <BreadcrumbJsonLd items={[{ name: "PrivateDAO", path: "/" }, { name: "Research and Insights", path: "/research" }, { name: article.title, path: `/research/${article.slug}` }]} />
      <article className="space-y-5">
        {article.sections.map((section) => <section key={section.heading} className="enterprise-card rounded-[24px] p-6 sm:p-8"><h2 className="text-2xl font-semibold text-[#10233f]">{section.heading}</h2>{section.paragraphs.map((paragraph) => <p key={paragraph} className="mt-4 max-w-4xl text-base leading-8 text-[#5d6d82]">{paragraph}</p>)}</section>)}
      </article>
    </OperationsShell>
  );
}
