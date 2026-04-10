import type { Metadata } from "next";

import { DocumentLibrary } from "@/components/document-library";
import { OperationsShell } from "@/components/operations-shell";
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
    <OperationsShell
      eyebrow="Document library"
      title="Reviewer, trust, and launch documents inside the Next.js surface"
      description="This is the curated in-app document layer for the highest-value reviewer and trust surfaces. It complements the raw viewer, but already behaves like a proper product documentation center."
      badges={[
        { label: "Documents", variant: "cyan" },
        { label: "Curated subset", variant: "violet" },
        { label: "Viewer parity staged", variant: "warning" },
      ]}
    >
      <div>
        <DocumentLibrary documents={documents} />
      </div>
    </OperationsShell>
  );
}
