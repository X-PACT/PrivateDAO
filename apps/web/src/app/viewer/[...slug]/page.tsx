import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight, FileText } from "lucide-react";

import { DocumentRenderer } from "@/components/document-renderer";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getRepoDocumentBySegments, getRepoDocumentContent, getRepoDocuments } from "@/lib/repo-documents";
import { buildRouteMetadata } from "@/lib/route-metadata";

type PageProps = {
  params: Promise<{ slug: string[] }>;
};

export async function generateStaticParams() {
  return getRepoDocuments().map((document) => ({ slug: document.routeSegments }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const document = getRepoDocumentBySegments(slug);
  if (!document) {
    return buildRouteMetadata({
      title: "Repository Document Not Found",
      description: "Requested repository markdown document was not found.",
      path: `/viewer/${slug.join("/")}`,
    });
  }

  return buildRouteMetadata({
    title: document.title,
    description: `${document.relativePath} rendered inside the Next.js repository viewer.`,
    path: document.routePath,
    keywords: [document.category, "repository viewer", "docs parity"],
    index: false,
  });
}

export default async function RepoDocumentPage({ params }: PageProps) {
  const { slug } = await params;
  const document = getRepoDocumentContent(slug);
  if (!document) notFound();

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-center gap-3">
        <Badge variant="cyan">{document.category}</Badge>
        <Badge variant="violet">Repository viewer</Badge>
        <Badge variant="warning">Legacy docs parity surface</Badge>
      </div>

      <div className="mt-6 flex flex-wrap items-start justify-between gap-6">
        <div className="max-w-3xl space-y-4">
          <Link className="inline-flex items-center gap-2 text-sm text-cyan-200 transition hover:text-cyan-100" href="/viewer">
            <ArrowLeft className="h-4 w-4" />
            Back to repository viewer
          </Link>
          <div className="space-y-4">
            <div className="text-[11px] uppercase tracking-[0.34em] text-emerald-300/80">Repository document</div>
            <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">{document.title}</h1>
            <p className="font-mono text-sm text-white/45">{document.relativePath}</p>
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
            <p>This route preserves legacy markdown access inside the Next.js surface. The raw repository file remains authoritative.</p>
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
