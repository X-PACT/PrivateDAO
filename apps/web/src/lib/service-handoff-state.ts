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

export type ServiceHandoffRequestDelivery = {
  state: "draft" | "staged" | "delivered";
  stateDetail: string;
  requestRoute: string;
  deliveryRoute: string;
  telemetryRoute: string;
  deliveredAt: string | null;
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
  requestDelivery?: ServiceHandoffRequestDelivery;
};

export type ServiceHandoffSelection = {
  proposalId: string;
  payoutProfile: ServiceHandoffProfile;
  telemetryMode: ServiceHandoffTelemetryMode;
  deliveryState?: "staged" | "delivered";
  deliveredAt?: string;
};

type ServiceHandoffQueryState = {
  proposalId: string;
  payoutProfile: ServiceHandoffProfile;
  telemetryMode: ServiceHandoffTelemetryMode;
  requestDelivery?: Pick<ServiceHandoffRequestDelivery, "state" | "deliveredAt">;
};

let storedServiceHandoffRawCache: string | null = null;
let storedServiceHandoffParsedCache: ServiceHandoffState | null = null;

function updateStoredServiceHandoffCache(raw: string | null) {
  storedServiceHandoffRawCache = raw;
  storedServiceHandoffParsedCache = parseStoredServiceHandoffState(raw);
  return storedServiceHandoffParsedCache;
}

export function buildServiceHandoffQuery(state: ServiceHandoffQueryState) {
  const params = new URLSearchParams();
  params.set("proposal", state.proposalId);
  params.set("profile", state.payoutProfile);
  params.set("telemetryMode", state.telemetryMode);
  params.set("handoff", "1");
  if (
    state.requestDelivery?.state === "staged" ||
    state.requestDelivery?.state === "delivered"
  ) {
    params.set("deliveryState", state.requestDelivery.state);
  }
  if (
    state.requestDelivery?.state === "delivered" &&
    typeof state.requestDelivery.deliveredAt === "string" &&
    state.requestDelivery.deliveredAt.length > 0
  ) {
    params.set("deliveredAt", state.requestDelivery.deliveredAt);
  }
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

    if (parsed.requestDelivery) {
      const requestDelivery = parsed.requestDelivery as Partial<ServiceHandoffRequestDelivery>;
      if (
        (
          requestDelivery.state !== "draft" &&
          requestDelivery.state !== "staged" &&
          requestDelivery.state !== "delivered"
        ) ||
        typeof requestDelivery.stateDetail !== "string" ||
        typeof requestDelivery.requestRoute !== "string" ||
        typeof requestDelivery.deliveryRoute !== "string" ||
        typeof requestDelivery.telemetryRoute !== "string" ||
        !(
          typeof requestDelivery.deliveredAt === "string" ||
          requestDelivery.deliveredAt === null
        )
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
  window.dispatchEvent(new CustomEvent(SERVICE_HANDOFF_EVENT, { detail: state }));
}

export function readServiceHandoffState(searchParams: URLSearchParams): ServiceHandoffSelection | null {
  const proposalId = searchParams.get("proposal");
  const payoutProfile = searchParams.get("profile");
  const telemetryMode = searchParams.get("telemetryMode");
  const deliveryState = searchParams.get("deliveryState");
  const deliveredAt = searchParams.get("deliveredAt");

  if (!proposalId || !isServiceHandoffProfile(payoutProfile) || !isServiceHandoffTelemetryMode(telemetryMode)) {
    return null;
  }

  return {
    proposalId,
    payoutProfile,
    telemetryMode,
    deliveryState:
      deliveryState === "staged" || deliveryState === "delivered"
        ? deliveryState
        : undefined,
    deliveredAt:
      deliveryState === "delivered" && typeof deliveredAt === "string" && deliveredAt.length > 0
        ? deliveredAt
        : undefined,
  };
}

export function mergeServiceHandoffState(
  selection: ServiceHandoffSelection | null,
  storedState: ServiceHandoffState | null,
  fallbackSource: ServiceHandoffState["source"],
): ServiceHandoffState | null {
  if (!selection) return storedState;

  const sameProposal = storedState?.proposalId === selection.proposalId;
  const sameProfile = sameProposal && storedState?.payoutProfile === selection.payoutProfile;
  const sameTelemetryMode =
    sameProposal && storedState?.telemetryMode === selection.telemetryMode;
  const baseState = {
    proposalId: selection.proposalId,
    proposalTitle: storedState?.proposalTitle ?? selection.proposalId,
    proposalStatus: storedState?.proposalStatus ?? "Context selected",
    payoutProfile: selection.payoutProfile,
    payoutTitle: storedState?.payoutTitle ?? selection.payoutProfile,
    telemetryMode: selection.telemetryMode,
    updatedAt: storedState?.updatedAt ?? "query-handoff",
    source: sameProposal ? storedState?.source ?? fallbackSource : fallbackSource,
    proposalReview: sameProposal ? storedState?.proposalReview : undefined,
    payoutIntent: sameProfile ? storedState?.payoutIntent : undefined,
    telemetrySelection: sameTelemetryMode ? storedState?.telemetrySelection : undefined,
  } satisfies Omit<ServiceHandoffState, "requestDelivery">;

  const baseQuery = buildServiceHandoffQuery({
    ...baseState,
    requestDelivery: storedState?.requestDelivery,
  } as ServiceHandoffState);
  const requestDelivery =
    selection.deliveryState === "staged" || selection.deliveryState === "delivered"
      ? {
          state: selection.deliveryState,
          stateDetail:
            selection.deliveryState === "delivered" && sameProfile && storedState?.requestDelivery?.stateDetail
              ? storedState.requestDelivery.stateDetail
              : selection.deliveryState === "delivered"
              ? "Execution handoff delivered into command-center from the active UI lane."
              : "Execution handoff staged in services and ready for governed delivery.",
          requestRoute: `/services?${baseQuery}#treasury-payment-request`,
          deliveryRoute: `/command-center?${baseQuery}#proposal-review-action`,
          telemetryRoute: `/network?${baseQuery}`,
          deliveredAt:
            selection.deliveryState === "delivered"
              ? (sameProfile && storedState?.requestDelivery?.state === "delivered"
                  ? storedState.requestDelivery.deliveredAt
                  : undefined) ?? selection.deliveredAt ?? "query-handoff"
              : null,
        }
      : sameProfile
        ? storedState?.requestDelivery
        : undefined;

  return {
    ...baseState,
    requestDelivery,
  };
}
