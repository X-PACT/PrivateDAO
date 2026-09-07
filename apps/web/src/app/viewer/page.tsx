import type { Metadata } from "next";

import { RepoDocumentBrowser } from "@/components/repo-document-browser";
import { SectionHeader } from "@/components/section-header";
import { Badge } from "@/components/ui/badge";
import { getRepoDocuments } from "@/lib/repo-documents";
import { buildRouteMetadata } from "@/lib/route-metadata";

export const metadata: Metadata = buildRouteMetadata({
  title: "Repository Viewer",
  description:
    "Full repository markdown viewer for PrivateDAO docs, used to preserve legacy docs entrypoints while the curated document library expands.",
  path: "/viewer",
  keywords: ["repository docs", "legacy docs viewer", "markdown viewer"],
  index: false,
});

export default function ViewerIndexPage() {
  const documents = getRepoDocuments();

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
      <div className="flex flex-wrap gap-3">
        <Badge variant="cyan">Repository viewer</Badge>
        <Badge variant="violet">Legacy link compatible</Badge>
        <Badge variant="warning">{documents.length} markdown docs</Badge>
      </div>
      <div className="mt-6">
        <SectionHeader
          eyebrow="Full repository docs"
          title="Legacy docs entrypoints now have an in-app destination"
          description="Use the curated documents library for the reviewer-first subset, and this repository viewer for broader markdown parity across the repo docs tree."
        />
      </div>
      <div className="mt-10">
        <RepoDocumentBrowser documents={documents} />
      </div>
    </main>
  );
}
