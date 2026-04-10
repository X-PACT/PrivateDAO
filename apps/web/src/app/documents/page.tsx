import type { Metadata } from "next";

import { DocumentLibrary } from "@/components/document-library";
import { SectionHeader } from "@/components/section-header";
import { Badge } from "@/components/ui/badge";
import { getCuratedDocuments } from "@/lib/curated-documents";
import { buildRouteMetadata } from "@/lib/route-metadata";

export const metadata: Metadata = buildRouteMetadata({
  title: "Curated Documents",
  description:
    "Curated reviewer, trust, and launch documents available inside the Next.js surface without claiming full docs-viewer parity yet.",
  path: "/documents",
  keywords: ["documents", "reviewer docs", "trust package", "audit packet"],
});

export default function DocumentsPage() {
  const documents = getCuratedDocuments();

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
      <div className="flex flex-wrap gap-3">
        <Badge variant="cyan">Documents</Badge>
        <Badge variant="violet">Curated subset</Badge>
        <Badge variant="warning">Viewer parity staged</Badge>
      </div>
      <div className="mt-6">
        <SectionHeader
          eyebrow="Document library"
          title="Reviewer, trust, and launch documents inside the Next.js surface"
          description="This is a curated in-app document route for the highest-value reviewer and trust surfaces. It does not replace the full query-driven docs viewer in the current live docs app yet."
        />
      </div>
      <div className="mt-10">
        <DocumentLibrary documents={documents} />
      </div>
    </main>
  );
}
