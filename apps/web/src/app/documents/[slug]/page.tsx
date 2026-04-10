import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight, FileText } from "lucide-react";

import { DocumentRenderer } from "@/components/document-renderer";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getCuratedDocument, getCuratedDocumentContent, getCuratedDocuments } from "@/lib/curated-documents";
import { buildRouteMetadata } from "@/lib/route-metadata";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  return getCuratedDocuments().map((document) => ({ slug: document.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const document = getCuratedDocument(slug);
  if (!document) {
    return buildRouteMetadata({
      title: "Document Not Found",
      description: "Requested curated document was not found.",
      path: `/documents/${slug}`,
    });
  }

  return buildRouteMetadata({
    title: document.title,
    description: document.summary,
    path: `/documents/${document.slug}`,
    keywords: [document.category, "curated documents", "reviewer documents"],
  });
}

export default async function DocumentPage({ params }: PageProps) {
  const { slug } = await params;
  const document = getCuratedDocumentContent(slug);
  if (!document) notFound();

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-center gap-3">
        <Badge variant="cyan">{document.category}</Badge>
        <Badge variant="violet">Curated in-app view</Badge>
        <Badge variant="warning">Raw file remains authoritative</Badge>
      </div>

      <div className="mt-6 flex flex-wrap items-start justify-between gap-6">
        <div className="max-w-3xl space-y-4">
          <Link className="inline-flex items-center gap-2 text-sm text-cyan-200 transition hover:text-cyan-100" href="/documents">
            <ArrowLeft className="h-4 w-4" />
            Back to documents
          </Link>
          <div className="space-y-4">
            <div className="text-[11px] uppercase tracking-[0.34em] text-emerald-300/80">Document route</div>
            <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">{document.title}</h1>
            <p className="text-base leading-8 text-white/62 sm:text-lg">{document.summary}</p>
          </div>
        </div>

        <Card className="w-full max-w-sm">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="rounded-2xl border border-white/8 bg-white/6 p-3 text-cyan-200">
                <FileText className="h-4 w-4" />
              </div>
              <CardTitle className="text-lg">Boundary</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 text-sm leading-7 text-white/62">
            <p>{document.boundary}</p>
            <p>
              Audience: <span className="text-white/82">{document.audience}</span>
            </p>
            <a
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/6 px-4 py-2 text-xs font-medium uppercase tracking-[0.24em] text-white/72 transition hover:bg-white/10"
              href={document.rawHref}
              rel="noreferrer"
              target="_blank"
            >
              Open raw file
              <ArrowUpRight className="h-3.5 w-3.5" />
            </a>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-10">
        <CardContent className="p-6 sm:p-8">
          <DocumentRenderer content={document.content} />
        </CardContent>
      </Card>
    </main>
  );
}
