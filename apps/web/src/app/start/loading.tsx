import { RouteLoadingShell } from "@/components/route-loading-shell";

export default function Loading() {
  return (
    <RouteLoadingShell
      eyebrow="Loading Start"
      title="Preparing the guided Testnet path"
      description="The start route is loading wallet onboarding, action shortcuts, and the first governance corridor."
    />
  );
}
