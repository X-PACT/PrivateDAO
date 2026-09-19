import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Archive } from "lucide-react";

import {
  getCuratedDocument,
  getCuratedDocuments,
} from "@/lib/curated-documents";
import { buildRouteMetadata } from "@/lib/route-metadata";

type PageProps = {
  params: Promise<{ slug: string }>;
};

// Historical document URLs remain addressable as bridges, but their old copy
// must not be presented as current product, security, or adoption evidence.
const currentPublicDocumentSlugs = new Set<string>();

export async function generateStaticParams() {
  return getCuratedDocuments().map((document) => ({ slug: document.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const document = getCuratedDocument(slug);
  if (!document || !currentPublicDocumentSlugs.has(slug)) {
    return buildRouteMetadata({
      title: "Archived Resource",
      description: "This historical resource is not current PrivateDAO product documentation.",
      path: `/documents/${slug}`,
      index: false,
    });
  }

  return buildRouteMetadata({
    title: document.title,
    description: document.summary,
    path: `/documents/${document.slug}`,
    keywords: [document.category, "curated documents", "product documents"],
    index: false,
  });
}

export default async function DocumentPage({ params }: PageProps) {
  const { slug } = await params;
  const document = getCuratedDocument(slug);

  if (!document || !currentPublicDocumentSlugs.has(slug)) {
    return (
      <main className="min-h-screen bg-white text-[#10233f]">
        <section className="mx-auto flex min-h-[70vh] w-full max-w-3xl flex-col justify-center px-4 py-16 sm:px-6 lg:px-8">
          <Archive className="h-8 w-8 text-[#175cd3]" aria-hidden="true" />
          <div className="mt-7 text-[11px] font-bold uppercase tracking-[0.28em] text-[#175cd3]">Archived resource</div>
          <h1 className="mt-4 text-4xl font-semibold tracking-[-0.045em] text-[#10233f] sm:text-5xl">This is not current product documentation.</h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-[#5d6d82]">
            This historical link is kept for continuity, but its contents are not a current statement about PrivateDAO products, security, adoption, network support, or financial outcomes.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/documents/" className="inline-flex items-center gap-2 rounded-full bg-[#175cd3] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#1248a8]">
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Open current resources
            </Link>
            <Link href="/products/" className="inline-flex items-center rounded-full border border-[#cbd8e8] px-5 py-3 text-sm font-semibold text-[#10233f] transition hover:border-[#175cd3]">
              Explore products
            </Link>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white text-[#10233f]">
      <section className="mx-auto w-full max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        <Link className="inline-flex items-center gap-2 text-sm text-[#175cd3]" href="/documents/">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back to resources
        </Link>
        <h1 className="mt-8 text-4xl font-semibold tracking-[-0.045em]">{document.title}</h1>
        <p className="mt-5 text-lg leading-8 text-[#5d6d82]">{document.summary}</p>
      </section>
    </main>
  );
}
