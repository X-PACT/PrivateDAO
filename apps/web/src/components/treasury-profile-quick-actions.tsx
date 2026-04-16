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
  SERVICE_HANDOFF_EVENT,
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
    value: "treasury-rebalance",
    title: "Treasury rebalance",
    summary: "Open the Jupiter-backed treasury route for governed asset-motion planning, quote review, and rebalance-ready execution context.",
    href: "/services#jupiter-treasury-route",
    icon: Coins,
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
  const customHandler = () => callback();
  window.addEventListener("storage", handler);
  window.addEventListener(SERVICE_HANDOFF_EVENT, customHandler);
  return () => {
    window.removeEventListener("storage", handler);
    window.removeEventListener(SERVICE_HANDOFF_EVENT, customHandler);
  };
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
        {storedState?.payoutIntent ? (
          <div className="rounded-3xl border border-cyan-300/18 bg-cyan-300/[0.08] p-5 lg:col-span-2">
            <div className="text-[11px] uppercase tracking-[0.24em] text-cyan-100/78">Execution-ready payout intent</div>
            <div className="mt-3 text-base font-medium text-white">
              {storedState.payoutTitle ?? selectedProfile} · {storedState.payoutIntent.amountDisplay}
            </div>
            <div className="mt-2 text-sm leading-7 text-white/60">
              {storedState.payoutIntent.reference} · {storedState.payoutIntent.executionTarget}
            </div>
            <div className="mt-4 grid gap-3 md:grid-cols-3">
              <div className="rounded-2xl border border-white/8 bg-black/20 p-3">
                <div className="text-[11px] uppercase tracking-[0.2em] text-white/38">Asset</div>
                <div className="mt-2 text-sm text-white/70">{storedState.payoutIntent.assetSymbol}</div>
              </div>
              <div className="rounded-2xl border border-white/8 bg-black/20 p-3">
                <div className="text-[11px] uppercase tracking-[0.2em] text-white/38">Lane</div>
                <div className="mt-2 text-sm text-white/70">{storedState.payoutIntent.lane}</div>
              </div>
              <div className="rounded-2xl border border-white/8 bg-black/20 p-3">
                <div className="text-[11px] uppercase tracking-[0.2em] text-white/38">Telemetry mode</div>
                <div className="mt-2 text-sm text-white/70">{storedState.telemetryMode}</div>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-3">
              <Link href={`/services?${handoffQuery}#treasury-payment-request`} className={cn(buttonVariants({ size: "sm", variant: "outline" }))}>
                Open request object
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href={`/govern?${handoffQuery}#proposal-review-action`} className={cn(buttonVariants({ size: "sm", variant: "outline" }))}>
                Continue govern flow
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        ) : null}
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
