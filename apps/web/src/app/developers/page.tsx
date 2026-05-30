import { LegacyRouteRedirect } from "@/components/legacy-route-redirect";

export default function DevelopersBridgePage() {
  return (
    <LegacyRouteRedirect
      title="Developers moved to the documents hub"
      description="Developer material is preserved in docs and proof packets so builders see source-linked implementation context."
      target="/documents"
      label="Open documents"
    />
  );
}
