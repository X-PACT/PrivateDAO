export const SERVICE_HANDOFF_STORAGE_KEY = "privatedao:service-handoff";

export const SERVICE_HANDOFF_PROFILES = [
  "pilot-funding",
  "treasury-top-up",
  "vendor-payout",
  "contributor-payout",
] as const;

export const SERVICE_HANDOFF_TELEMETRY_MODES = [
  "packet",
  "snapshot",
  "backend",
] as const;

export type ServiceHandoffProfile =
  | (typeof SERVICE_HANDOFF_PROFILES)[number];

export type ServiceHandoffTelemetryMode =
  | (typeof SERVICE_HANDOFF_TELEMETRY_MODES)[number];

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

let storedServiceHandoffRawCache: string | null = null;
let storedServiceHandoffParsedCache: ServiceHandoffState | null = null;

export function buildServiceHandoffQuery(state: ServiceHandoffState) {
  const params = new URLSearchParams();
  params.set("proposal", state.proposalId);
  params.set("profile", state.payoutProfile);
  params.set("telemetryMode", state.telemetryMode);
  params.set("handoff", "1");
  return params.toString();
}

export function isServiceHandoffProfile(value: string | null | undefined): value is ServiceHandoffProfile {
  return !!value && SERVICE_HANDOFF_PROFILES.includes(value as ServiceHandoffProfile);
}

export function isServiceHandoffTelemetryMode(
  value: string | null | undefined,
): value is ServiceHandoffTelemetryMode {
  return !!value && SERVICE_HANDOFF_TELEMETRY_MODES.includes(value as ServiceHandoffTelemetryMode);
}

export function parseStoredServiceHandoffState(raw: string | null): ServiceHandoffState | null {
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as Partial<ServiceHandoffState>;
    if (
      typeof parsed.proposalId !== "string" ||
      typeof parsed.proposalTitle !== "string" ||
      typeof parsed.proposalStatus !== "string" ||
      !isServiceHandoffProfile(parsed.payoutProfile) ||
      typeof parsed.payoutTitle !== "string" ||
      !isServiceHandoffTelemetryMode(parsed.telemetryMode) ||
      typeof parsed.updatedAt !== "string" ||
      (parsed.source !== "start" && parsed.source !== "services" && parsed.source !== "command-center")
    ) {
      return null;
    }

    return parsed as ServiceHandoffState;
  } catch {
    return null;
  }
}

export function readStoredServiceHandoffState(): ServiceHandoffState | null {
  if (typeof window === "undefined") return null;

  const raw = window.localStorage.getItem(SERVICE_HANDOFF_STORAGE_KEY);
  if (raw === storedServiceHandoffRawCache) {
    return storedServiceHandoffParsedCache;
  }

  storedServiceHandoffRawCache = raw;
  storedServiceHandoffParsedCache = parseStoredServiceHandoffState(raw);
  return storedServiceHandoffParsedCache;
}

export function readServiceHandoffState(searchParams: URLSearchParams) {
  const proposalId = searchParams.get("proposal");
  const payoutProfile = searchParams.get("profile");
  const telemetryMode = searchParams.get("telemetryMode");

  if (!proposalId || !isServiceHandoffProfile(payoutProfile) || !isServiceHandoffTelemetryMode(telemetryMode)) {
    return null;
  }

  return {
    proposalId,
    payoutProfile,
    telemetryMode,
  };
}
