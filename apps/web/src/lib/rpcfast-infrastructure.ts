type RpcFastEndpoint = {
  label: string;
  purpose: string;
  configured: boolean;
  host: string;
};

function endpointHost(value: string | undefined) {
  if (!value) return "Not configured";

  try {
    return new URL(value).host;
  } catch {
    return value.split("/")[0] || "Configured";
  }
}

function hasValue(value: string | undefined) {
  return Boolean(value && value.trim());
}

export function getRpcFastInfrastructureSnapshot() {
  const endpoints: RpcFastEndpoint[] = [
    {
      label: "Testnet RPC",
      purpose: "Backend release-candidate transaction and monitoring path; browser bundles keep using public cluster RPC.",
      configured: hasValue(process.env.RPC_FAST_TESTNET_RPC),
      host: endpointHost(process.env.RPC_FAST_TESTNET_RPC),
    },
    {
      label: "Testnet WebSocket",
      purpose: "Slot and signature confirmation fallback for Testnet runtime UX.",
      configured: hasValue(process.env.RPC_FAST_TESTNET_WSS),
      host: endpointHost(process.env.RPC_FAST_TESTNET_WSS),
    },
    {
      label: "Devnet Yellowstone gRPC",
      purpose: "Historical rehearsal stream for program/account observation and diagnostics comparison.",
      configured:
        hasValue(process.env.RPCFAST_DEVNET_YELLOWSTONE_GRPC_ENDPOINT) ||
        hasValue(process.env.RPC_FAST_DEVNET_YELLOWSTONE_GRPC_ENDPOINT),
      host: endpointHost(
        process.env.RPCFAST_DEVNET_YELLOWSTONE_GRPC_ENDPOINT ??
          process.env.RPC_FAST_DEVNET_YELLOWSTONE_GRPC_ENDPOINT,
      ),
    },
    {
      label: "Mainnet Aperture gRPC",
      purpose: "Read-only data-plane readiness checks before any production custody claim.",
      configured:
        hasValue(process.env.RPCFAST_MAINNET_APERTURE_GRPC_ENDPOINT) ||
        hasValue(process.env.RPC_FAST_MAINNET_APERTURE_GRPC_ENDPOINT),
      host: endpointHost(
        process.env.RPCFAST_MAINNET_APERTURE_GRPC_ENDPOINT ??
          process.env.RPC_FAST_MAINNET_APERTURE_GRPC_ENDPOINT,
      ),
    },
    {
      label: "Mainnet ShredStream gRPC",
      purpose: "Low-latency monitoring research and release-readiness telemetry.",
      configured:
        hasValue(process.env.RPCFAST_MAINNET_SHREDSTREAM_GRPC_ENDPOINT) ||
        hasValue(process.env.RPC_FAST_MAINNET_SHREDSTREAM_GRPC_ENDPOINT),
      host: endpointHost(
        process.env.RPCFAST_MAINNET_SHREDSTREAM_GRPC_ENDPOINT ??
          process.env.RPC_FAST_MAINNET_SHREDSTREAM_GRPC_ENDPOINT,
      ),
    },
    {
      label: "Mainnet Yellowstone gRPC",
      purpose: "Future production observability for account and program streams.",
      configured:
        hasValue(process.env.RPCFAST_MAINNET_YELLOWSTONE_GRPC_ENDPOINT) ||
        hasValue(process.env.RPC_FAST_MAINNET_YELLOWSTONE_GRPC_ENDPOINT),
      host: endpointHost(
        process.env.RPCFAST_MAINNET_YELLOWSTONE_GRPC_ENDPOINT ??
          process.env.RPC_FAST_MAINNET_YELLOWSTONE_GRPC_ENDPOINT,
      ),
    },
  ];

  return {
    activatedPlan: "RPCFast Hackathon/Aperture",
    validThrough: "2026-05-11",
    endpoints,
    configuredCount: endpoints.filter((endpoint) => endpoint.configured).length,
    totalCount: endpoints.length,
  };
}
