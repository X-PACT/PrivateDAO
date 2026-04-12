export const SERVICE_HANDOFF_STORAGE_KEY = "privatedao:service-handoff";
export const SERVICE_HANDOFF_EVENT = "privatedao:service-handoff-updated";

export const SERVICE_HANDOFF_PROFILES = [
  "pilot-funding",
  "treasury-top-up",
  "vendor-payout",
  "contributor-payout",
] as const;

export const SERVICE_HANDOFF_LANES = [
  "buyer",
  "operator",
  "support",
] as const;

export const SERVICE_HANDOFF_ASSET_SYMBOLS = [
  "SOL",
  "USDC",
  "USDG",
] as const;

export const SERVICE_HANDOFF_TELEMETRY_MODES = [
  "packet",
  "snapshot",
  "backend",
] as const;

export type ServiceHandoffProfile =
  | (typeof SERVICE_HANDOFF_PROFILES)[number];

export type ServiceHandoffLane =
  | (typeof SERVICE_HANDOFF_LANES)[number];

export type ServiceHandoffAssetSymbol =
  | (typeof SERVICE_HANDOFF_ASSET_SYMBOLS)[number];

export type ServiceHandoffTelemetryMode =
  | (typeof SERVICE_HANDOFF_TELEMETRY_MODES)[number];

export type ServiceHandoffProposalReview = {
  proposalAccount: string | null;
  window: string;
  treasury: string;
  executionTarget: string;
  evidenceRoute: string;
  proofHref: string;
  proofLabel: string;
};

export type ServiceHandoffPayoutIntent = {
  assetSymbol: ServiceHandoffAssetSymbol;
  amount: string;
  amountDisplay: string;
  reference: string;
  purpose: string;
  lane: ServiceHandoffLane;
  routeFocus: string;
  recipient: string | null;
  mintAddress: string | null;
  executionTarget: string;
  evidenceRoute: string;
};

export type ServiceHandoffTelemetrySelection = {
  title: string;
  summary: string;
  state: string;
  stateDetail: string;
  primaryHref: string;
  proofHref: string;
};

export type ServiceHandoffState = {
  proposalId: string;
  proposalTitle: string;
  proposalStatus: string;
  payoutProfile: ServiceHandoffProfile;
  payoutTitle: string;
  telemetryMode: ServiceHandoffTelemetryMode;
  updatedAt: string;
  source: "start" | "services" | "command-center" | "analytics" | "diagnostics" | "network";
  proposalReview?: ServiceHandoffProposalReview;
  payoutIntent?: ServiceHandoffPayoutIntent;
  telemetrySelection?: ServiceHandoffTelemetrySelection;
};

export type ServiceHandoffSelection = {
  proposalId: string;
  payoutProfile: ServiceHandoffProfile;
  telemetryMode: ServiceHandoffTelemetryMode;
};

let storedServiceHandoffRawCache: string | null = null;
let storedServiceHandoffParsedCache: ServiceHandoffState | null = null;

function updateStoredServiceHandoffCache(raw: string | null) {
  storedServiceHandoffRawCache = raw;
  storedServiceHandoffParsedCache = parseStoredServiceHandoffState(raw);
  return storedServiceHandoffParsedCache;
}

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

export function isServiceHandoffLane(value: string | null | undefined): value is ServiceHandoffLane {
  return !!value && SERVICE_HANDOFF_LANES.includes(value as ServiceHandoffLane);
}

export function isServiceHandoffAssetSymbol(
  value: string | null | undefined,
): value is ServiceHandoffAssetSymbol {
  return !!value && SERVICE_HANDOFF_ASSET_SYMBOLS.includes(value as ServiceHandoffAssetSymbol);
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
      (
        parsed.source !== "start" &&
        parsed.source !== "services" &&
        parsed.source !== "command-center" &&
        parsed.source !== "analytics" &&
        parsed.source !== "diagnostics" &&
        parsed.source !== "network"
      )
    ) {
      return null;
    }

    if (parsed.proposalReview) {
      const proposalReview = parsed.proposalReview as Partial<ServiceHandoffProposalReview>;
      if (
        typeof proposalReview.window !== "string" ||
        typeof proposalReview.treasury !== "string" ||
        typeof proposalReview.executionTarget !== "string" ||
        typeof proposalReview.evidenceRoute !== "string" ||
        typeof proposalReview.proofHref !== "string" ||
        typeof proposalReview.proofLabel !== "string" ||
        !(
          typeof proposalReview.proposalAccount === "string" ||
          proposalReview.proposalAccount === null
        )
      ) {
        return null;
      }
    }

    if (parsed.payoutIntent) {
      const payoutIntent = parsed.payoutIntent as Partial<ServiceHandoffPayoutIntent>;
      if (
        !isServiceHandoffAssetSymbol(payoutIntent.assetSymbol) ||
        typeof payoutIntent.amount !== "string" ||
        typeof payoutIntent.amountDisplay !== "string" ||
        typeof payoutIntent.reference !== "string" ||
        typeof payoutIntent.purpose !== "string" ||
        !isServiceHandoffLane(payoutIntent.lane) ||
        typeof payoutIntent.routeFocus !== "string" ||
        !(typeof payoutIntent.recipient === "string" || payoutIntent.recipient === null) ||
        !(typeof payoutIntent.mintAddress === "string" || payoutIntent.mintAddress === null) ||
        typeof payoutIntent.executionTarget !== "string" ||
        typeof payoutIntent.evidenceRoute !== "string"
      ) {
        return null;
      }
    }

    if (parsed.telemetrySelection) {
      const telemetrySelection = parsed.telemetrySelection as Partial<ServiceHandoffTelemetrySelection>;
      if (
        typeof telemetrySelection.title !== "string" ||
        typeof telemetrySelection.summary !== "string" ||
        typeof telemetrySelection.state !== "string" ||
        typeof telemetrySelection.stateDetail !== "string" ||
        typeof telemetrySelection.primaryHref !== "string" ||
        typeof telemetrySelection.proofHref !== "string"
      ) {
        return null;
      }
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

  return updateStoredServiceHandoffCache(raw);
}

export function writeStoredServiceHandoffState(state: ServiceHandoffState) {
  if (typeof window === "undefined") return;

  const raw = JSON.stringify(state);
  window.localStorage.setItem(SERVICE_HANDOFF_STORAGE_KEY, raw);
  updateStoredServiceHandoffCache(raw);
}

export function readServiceHandoffState(searchParams: URLSearchParams): ServiceHandoffSelection | null {
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

export function mergeServiceHandoffState(
  selection: ServiceHandoffSelection | null,
  storedState: ServiceHandoffState | null,
  fallbackSource: ServiceHandoffState["source"],
): ServiceHandoffState | null {
  if (!selection) return storedState;

  return {
    proposalId: selection.proposalId,
    proposalTitle: storedState?.proposalTitle ?? selection.proposalId,
    proposalStatus: storedState?.proposalStatus ?? "Context selected",
    payoutProfile: selection.payoutProfile,
    payoutTitle: storedState?.payoutTitle ?? selection.payoutProfile,
    telemetryMode: selection.telemetryMode,
    updatedAt: storedState?.updatedAt ?? "query-handoff",
    source: storedState?.source ?? fallbackSource,
    proposalReview: storedState?.proposalReview,
    payoutIntent: storedState?.payoutIntent,
    telemetrySelection: storedState?.telemetrySelection,
  };
}
