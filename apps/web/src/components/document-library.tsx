import Link from "next/link";
import { ArrowUpRight, FileText } from "lucide-react";

import type { CuratedDocument } from "@/lib/curated-documents";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type DocumentLibraryProps = {
  documents: CuratedDocument[];
};

export function DocumentLibrary({ documents }: DocumentLibraryProps) {
  return (
    <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
      {documents.map((document) => (
        <Card key={document.slug}>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="rounded-2xl border border-white/8 bg-white/6 p-3 text-cyan-200">
                <FileText className="h-4 w-4" />
              </div>
              <div>
                <div className="text-[11px] uppercase tracking-[0.28em] text-white/40">{document.category}</div>
                <CardTitle className="mt-2 text-lg">{document.title}</CardTitle>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm leading-7 text-white/60">{document.summary}</p>
            <div className="rounded-3xl border border-white/8 bg-white/4 p-4 text-sm leading-7 text-white/60">
              <div className="text-[11px] uppercase tracking-[0.28em] text-emerald-300/75">Audience</div>
              <div className="mt-2">{document.audience}</div>
            </div>
            <div className="rounded-3xl border border-white/8 bg-white/4 p-4 text-sm leading-7 text-white/60">
              <div className="text-[11px] uppercase tracking-[0.28em] text-amber-200/70">Boundary</div>
              <div className="mt-2">{document.boundary}</div>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                className="inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-4 py-2 text-xs font-medium uppercase tracking-[0.24em] text-cyan-100 transition hover:bg-cyan-300/14"
                href={`/documents/${document.slug}`}
              >
                Open in app
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
              <a
                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/6 px-4 py-2 text-xs font-medium uppercase tracking-[0.24em] text-white/72 transition hover:bg-white/10"
                href={document.rawHref}
                rel="noreferrer"
                target="_blank"
              >
                Open raw file
                <ArrowUpRight className="h-3.5 w-3.5" />
              </a>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
