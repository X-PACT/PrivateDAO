export const SERVICE_HANDOFF_STORAGE_KEY = "privatedao:service-handoff";

export type ServiceHandoffProfile =
  | "pilot-funding"
  | "treasury-top-up"
  | "vendor-payout"
  | "contributor-payout";

export type ServiceHandoffTelemetryMode = "packet" | "snapshot" | "backend";

export type ServiceHandoffState = {
  proposalId: string;
  proposalTitle: string;
  proposalStatus: string;
  payoutProfile: ServiceHandoffProfile;
  payoutTitle: string;
  telemetryMode: ServiceHandoffTelemetryMode;
  updatedAt: string;
  source: "start" | "services" | "command-center";
};

export function buildServiceHandoffQuery(state: ServiceHandoffState) {
  const params = new URLSearchParams();
  params.set("proposal", state.proposalId);
  params.set("profile", state.payoutProfile);
  params.set("telemetryMode", state.telemetryMode);
  params.set("handoff", "1");
  return params.toString();
}

export function readServiceHandoffState(searchParams: URLSearchParams) {
  const proposalId = searchParams.get("proposal");
  const payoutProfile = searchParams.get("profile") as ServiceHandoffProfile | null;
  const telemetryMode = searchParams.get("telemetryMode") as ServiceHandoffTelemetryMode | null;

  if (!proposalId || !payoutProfile || !telemetryMode) {
    return null;
  }

  return {
    proposalId,
    payoutProfile,
    telemetryMode,
  };
}
