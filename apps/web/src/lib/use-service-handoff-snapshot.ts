"use client";

import { useMemo, useSyncExternalStore } from "react";
import { useSearchParams } from "next/navigation";

import {
  mergeServiceHandoffState,
  readServiceHandoffState,
  readStoredServiceHandoffState,
  SERVICE_HANDOFF_EVENT,
  SERVICE_HANDOFF_STORAGE_KEY,
  type ServiceHandoffState,
  type ServiceHandoffTelemetryMode,
} from "@/lib/service-handoff-state";

function subscribeToStorage(callback: () => void) {
  if (typeof window === "undefined") return () => {};

  const handler = (event: StorageEvent) => {
    if (event.key === SERVICE_HANDOFF_STORAGE_KEY) {
      callback();
    }
  };

  window.addEventListener("storage", handler);
  window.addEventListener(SERVICE_HANDOFF_EVENT, callback);
  return () => {
    window.removeEventListener("storage", handler);
    window.removeEventListener(SERVICE_HANDOFF_EVENT, callback);
  };
}

function getStoredSnapshot() {
  return readStoredServiceHandoffState();
}

export function useServiceHandoffSnapshot(
  fallbackSource: ServiceHandoffState["source"],
) {
  const searchParams = useSearchParams();
  const storedState = useSyncExternalStore(
    subscribeToStorage,
    getStoredSnapshot,
    () => null,
  );

  return useMemo(
    () =>
      mergeServiceHandoffState(
        readServiceHandoffState(searchParams),
        storedState,
        fallbackSource,
      ),
    [fallbackSource, searchParams, storedState],
  );
}

export function useServiceHandoffTelemetryMode(
  fallbackSource: ServiceHandoffState["source"],
  defaultMode: ServiceHandoffTelemetryMode = "packet",
) {
  const snapshot = useServiceHandoffSnapshot(fallbackSource);
  return snapshot?.telemetryMode ?? defaultMode;
}
