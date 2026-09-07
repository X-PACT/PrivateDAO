import Link from "next/link";
import { ArrowUpRight, Files } from "lucide-react";

import type { RepoDocument } from "@/lib/repo-documents";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type RepoDocumentBrowserProps = {
  documents: RepoDocument[];
};

export function RepoDocumentBrowser({ documents }: RepoDocumentBrowserProps) {
  const grouped = documents.reduce<Record<string, RepoDocument[]>>((acc, document) => {
    acc[document.category] ??= [];
    acc[document.category].push(document);
    return acc;
  }, {});

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {Object.entries(grouped).map(([category, docs]) => (
        <Card key={category}>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="rounded-2xl border border-white/8 bg-white/6 p-3 text-cyan-200">
                <Files className="h-4 w-4" />
              </div>
              <div>
                <div className="text-[11px] uppercase tracking-[0.28em] text-white/40">Repo documents</div>
                <CardTitle className="mt-2 text-lg">{category}</CardTitle>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {docs.map((document) => (
              <div key={document.relativePath} className="rounded-2xl border border-white/8 bg-white/4 p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-sm font-medium text-white">{document.title}</div>
                    <div className="mt-2 font-mono text-xs text-white/42">{document.relativePath}</div>
                  </div>
                  <Link
                    className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.24em] text-cyan-100 transition hover:text-cyan-50"
                    href={document.routePath}
                  >
                    Open
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
