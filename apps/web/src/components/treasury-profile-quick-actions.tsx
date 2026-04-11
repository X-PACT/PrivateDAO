"use client";

import { useMemo, useSyncExternalStore } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowRight, BriefcaseBusiness, Coins, HandCoins, Wallet } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import {
  buildServiceHandoffQuery,
  readServiceHandoffState,
  readStoredServiceHandoffState,
  SERVICE_HANDOFF_STORAGE_KEY,
  type ServiceHandoffProfile,
} from "@/lib/service-handoff-state";
import { cn } from "@/lib/utils";

const quickActions = [
  {
    value: "pilot-funding",
    title: "Pilot funding",
    summary: "Open the buyer-facing pilot path with the strongest startup/demo bundle already attached.",
    href: "/engage?profile=pilot-funding",
    icon: BriefcaseBusiness,
  },
  {
    value: "treasury-top-up",
    title: "Treasury top-up",
    summary: "Route capital into services, trust, and operating runway with the treasury bundle preselected.",
    href: "/engage?profile=treasury-top-up",
    icon: Wallet,
  },
  {
    value: "vendor-payout",
    title: "Vendor payout",
    summary: "Start a governed vendor payout flow tied to command execution and diagnostics from the first click.",
    href: "/engage?profile=vendor-payout",
    icon: Coins,
  },
  {
    value: "contributor-payout",
    title: "Contributor payout",
    summary: "Open the contributor payout lane with governed treasury execution and trust context already attached.",
    href: "/engage?profile=contributor-payout",
    icon: HandCoins,
  },
] as const;

type TreasuryProfileQuickActionsProps = {
  title?: string;
};

function subscribeToStorage(callback: () => void) {
  if (typeof window === "undefined") return () => {};
  const handler = (event: StorageEvent) => {
    if (event.key === SERVICE_HANDOFF_STORAGE_KEY) {
      callback();
    }
  };
  window.addEventListener("storage", handler);
  return () => window.removeEventListener("storage", handler);
}

function getStoredSnapshot() {
  return readStoredServiceHandoffState();
}

export function TreasuryProfileQuickActions({ title = "Commercial quick actions" }: TreasuryProfileQuickActionsProps) {
  const searchParams = useSearchParams();
  const storedState = useSyncExternalStore(subscribeToStorage, getStoredSnapshot, () => null);
  const queryState = readServiceHandoffState(searchParams);
  const selectedProfile = useMemo<ServiceHandoffProfile>(
    () => queryState?.payoutProfile ?? storedState?.payoutProfile ?? "treasury-top-up",
    [queryState, storedState],
  );
  const handoffQuery = useMemo(
    () =>
      storedState
        ? buildServiceHandoffQuery({
            ...storedState,
            payoutProfile: selectedProfile,
          })
        : queryState
          ? (() => {
              const params = new URLSearchParams(searchParams.toString());
              params.set("profile", selectedProfile);
              return params.toString();
            })()
          : "",
    [queryState, searchParams, selectedProfile, storedState],
  );

  return (
    <Card id="payout-route-selection">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4 lg:grid-cols-2">
        {quickActions.map((item) => {
          const Icon = item.icon;
          const isSelected = item.value === selectedProfile;
          const href = handoffQuery
            ? (() => {
                const params = new URLSearchParams(handoffQuery);
                params.set("profile", item.value);
                return `/engage?${params.toString()}`;
              })()
            : item.href;

          return (
            <div
              key={item.title}
              className={cn(
                "rounded-3xl border p-4 transition",
                isSelected
                  ? "border-emerald-300/25 bg-emerald-300/[0.09]"
                  : "border-white/8 bg-white/4",
              )}
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-black/20 text-cyan-200">
                  <Icon className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-base font-medium text-white">{item.title}</div>
                  {isSelected ? (
                    <div className="mt-1 text-[11px] uppercase tracking-[0.2em] text-emerald-200/80">
                      Selected from handoff
                    </div>
                  ) : null}
                </div>
              </div>
              <p className="mt-3 text-sm leading-7 text-white/60">{item.summary}</p>
              <Link className={cn(buttonVariants({ size: "sm" }), "mt-4")} href={href}>
                {isSelected ? "Continue selected route" : "Open route"}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
