import { RouteLoadingShell } from "@/components/route-loading-shell";

export default function Loading() {
  return (
    <RouteLoadingShell
      eyebrow="Loading Live State"
      title="Preparing proposals, treasury, and logs"
      description="The live state route is loading proposal cards, treasury status, and execution history."
    />
  );
}
