import { RouteLoadingShell } from "@/components/route-loading-shell";

export default function Loading() {
  return (
    <RouteLoadingShell
      eyebrow="Loading Govern"
      title="Preparing live governance controls"
      description="The governance lane is loading DAO, proposal, voting, and execution surfaces with wallet-aware Devnet context."
    />
  );
}
