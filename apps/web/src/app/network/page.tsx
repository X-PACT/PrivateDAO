import { LegacyRouteRedirect } from "@/components/legacy-route-redirect";

export default function NetworkBridgePage() {
  return (
    <LegacyRouteRedirect
      title="Network moved to RPC services"
      description="Network and node details now belong in the RPC/read-node services route."
      target="/rpc-services"
      label="Open RPC services"
    />
  );
}
