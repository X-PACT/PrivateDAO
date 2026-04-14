"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Activity, BarChart3, BrainCircuit, BriefcaseBusiness, Compass, FileSearch, FileText, KeyRound, LayoutDashboard, MessageSquareMore, PlayCircle, Rocket, ShieldCheck, Smartphone, Sparkles, SquareTerminal, Trophy } from "lucide-react";

import { ProductServiceMap } from "@/components/product-service-map";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const operationsNav = [
  { href: "/start", label: "Start", icon: Compass, summary: "Guided onboarding and wallet-first flow" },
  { href: "/assistant", label: "AI Assistant", icon: Sparkles, summary: "Internal AI-style guide across routes, docs, and proof" },
  { href: "/demo", label: "Demo", icon: PlayCircle, summary: "Product demo and fast explanation" },
  { href: "/community", label: "Community", icon: MessageSquareMore, summary: "Join, updates, pilot interest, and support routing" },
  { href: "/govern", label: "Govern", icon: SquareTerminal, summary: "Create, vote, and execute on Devnet" },
  { href: "/live", label: "Live State", icon: LayoutDashboard, summary: "Proposals, treasury, and action logs" },
  { href: "/android", label: "Android", icon: Smartphone, summary: "Mobile app, APK download, parity plan" },
  { href: "/proof", label: "Proof", icon: Sparkles, summary: "Baseline and V3 evidence" },
  { href: "/trust", label: "Trust", icon: ShieldCheck, summary: "Security, proof, and operating boundaries" },
  { href: "/intelligence", label: "Intelligence", icon: BrainCircuit, summary: "Proposal, treasury, voting, RPC, and gaming analysis" },
  { href: "/diagnostics", label: "Health", icon: Activity, summary: "Runtime status and verification health" },
  { href: "/custody", label: "Custody", icon: KeyRound, summary: "Multisig, authority transfer, and custody evidence" },
  { href: "/analytics", label: "Analytics", icon: BarChart3, summary: "Votes, proposals, actions" },
  { href: "/services", label: "Services", icon: BriefcaseBusiness, summary: "Pilot, API, commercial packs" },
  { href: "/engage", label: "Engage", icon: Rocket, summary: "Buyer path, pilot motion, mainnet trajectory" },
  { href: "/tracks", label: "Tracks", icon: Trophy, summary: "Competition readiness and fit" },
  { href: "/search", label: "Search", icon: FileSearch, summary: "Search routes, docs, tracks, and proof" },
  { href: "/documents", label: "Documents", icon: FileText, summary: "Curated reviewer and trust docs" },
];

const guidedNav = [
  { href: "/start", label: "Start", icon: Compass, summary: "Connect a wallet and understand the first move" },
  { href: "/govern", label: "Govern", icon: SquareTerminal, summary: "Create a DAO, propose, vote, and execute" },
  { href: "/live", label: "Track Activity", icon: LayoutDashboard, summary: "Follow proposals, treasury state, and action logs" },
  { href: "/services", label: "API & Pricing", icon: BriefcaseBusiness, summary: "Hosted API, plans, and rollout options" },
  { href: "/trust", label: "Security & Proof", icon: ShieldCheck, summary: "Proof, hardening, and operating trust" },
  { href: "/demo", label: "Demo", icon: PlayCircle, summary: "Watch the product story before using the live flow" },
];

type OperationsShellProps = {
  eyebrow: string;
  title: string;
  description: string;
  navigationMode?: "full" | "guided";
  badges?: Array<{
    label: string;
    variant?: "cyan" | "violet" | "success" | "warning";
  }>;
  children: ReactNode;
};

export function OperationsShell({
  eyebrow,
  title,
  description,
  navigationMode = "full",
  badges = [],
  children,
}: OperationsShellProps) {
  const pathname = usePathname();
  const navItems = navigationMode === "guided" ? guidedNav : operationsNav;

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
      <div className="mb-6 xl:hidden">
        <Card className="border-white/10 bg-[#07101d]/88">
          <CardHeader className="space-y-3">
            <div className="text-[11px] uppercase tracking-[0.34em] text-cyan-200/78">Explore</div>
            <CardTitle className="text-lg">Quick route navigation</CardTitle>
          </CardHeader>
          <CardContent className="no-scrollbar flex gap-3 overflow-x-auto pb-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex min-w-[170px] shrink-0 items-center gap-3 rounded-2xl border px-4 py-3 transition",
                    active
                      ? "border-cyan-300/25 bg-cyan-300/10 text-white"
                      : "border-white/8 bg-white/[0.03] text-white/68",
                  )}
                >
                  <div
                    className={cn(
                      "flex h-9 w-9 items-center justify-center rounded-xl border",
                      active ? "border-cyan-300/20 bg-cyan-300/14 text-cyan-100" : "border-white/8 bg-black/20 text-white/72",
                    )}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-medium">{item.label}</div>
                    <div className="mt-1 line-clamp-2 text-xs leading-5 text-white/45">{item.summary}</div>
                  </div>
                </Link>
              );
            })}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-[280px_minmax(0,1fr)] xl:gap-8">
        <aside className="hidden xl:sticky xl:top-28 xl:block xl:self-start">
          <Card className="border-white/10 bg-[#07101d]/88">
            <CardHeader className="space-y-4">
              <div className="space-y-2">
                <div className="text-[11px] uppercase tracking-[0.34em] text-cyan-200/78">Explore</div>
                <CardTitle className="text-xl">{navigationMode === "guided" ? "Simple route map" : "Product navigation"}</CardTitle>
              </div>
              <p className="text-sm leading-7 text-white/56">
                {navigationMode === "guided"
                  ? "The shortest map through PrivateDAO: start, act, track results, then inspect API or trust only if needed."
                  : "User-first routes for onboarding, governance, proof, support, and live product state."}
              </p>
            </CardHeader>
            <CardContent className="space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-start gap-3 rounded-2xl border px-4 py-3 transition",
                      active
                        ? "border-cyan-300/25 bg-cyan-300/10 text-white"
                        : "border-white/8 bg-white/[0.03] text-white/68 hover:border-white/12 hover:bg-white/[0.05] hover:text-white",
                    )}
                  >
                    <div
                      className={cn(
                        "mt-0.5 flex h-9 w-9 items-center justify-center rounded-xl border",
                        active ? "border-cyan-300/20 bg-cyan-300/14 text-cyan-100" : "border-white/8 bg-black/20 text-white/72",
                      )}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-medium">{item.label}</div>
                      <div className="mt-1 text-xs leading-6 text-white/45">{item.summary}</div>
                    </div>
                  </Link>
                );
              })}
            </CardContent>
          </Card>

          {navigationMode === "guided" ? (
            <div className="mt-4">
              <ProductServiceMap
                compact
                title="PrivateDAO map"
                description="Read this as a service map, not a route catalog. Start, use the app, track the result, then inspect API and proof when you want more depth."
              />
            </div>
          ) : (
            <Card className="mt-4 border-white/10 bg-white/[0.03]">
              <CardHeader>
                <CardTitle className="text-base">System rails</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-white/58">
                <div className="rounded-2xl border border-white/8 bg-black/20 px-4 py-3">ZK: privacy review and proof anchors</div>
                <div className="rounded-2xl border border-white/8 bg-black/20 px-4 py-3">REFHE: confidential settlement and payout posture</div>
                <div className="rounded-2xl border border-white/8 bg-black/20 px-4 py-3">MagicBlock: execution corridor for responsive paths</div>
                <div className="rounded-2xl border border-white/8 bg-black/20 px-4 py-3">Fast RPC: operational speed, diagnostics, and runtime readiness</div>
              </CardContent>
            </Card>
          )}
        </aside>

        <div className="space-y-8">
          <Card className="border-white/10 bg-[linear-gradient(180deg,rgba(10,16,32,0.94),rgba(7,11,23,0.98))]">
            <CardContent className="p-6 sm:p-8">
              {badges.length > 0 ? (
                <div className="flex flex-wrap gap-3">
                  {badges.map((badge) => (
                    <Badge key={badge.label} variant={badge.variant ?? "cyan"}>
                      {badge.label}
                    </Badge>
                  ))}
                </div>
              ) : null}

              <div className={cn("space-y-5", badges.length > 0 ? "mt-6" : "")}>
                <div className="text-[11px] uppercase tracking-[0.34em] text-emerald-300/80">{eyebrow}</div>
                <div className="max-w-4xl text-3xl font-semibold tracking-[-0.035em] text-white sm:text-5xl">{title}</div>
                <p className="max-w-3xl text-sm leading-7 text-white/60 sm:text-lg sm:leading-8">{description}</p>
              </div>

              <div className="mt-8 flex flex-wrap gap-3">
                {pathname === "/govern" ? (
                  <>
                    <a className={buttonVariants({ size: "sm" })} href="#proposal-review-action">
                      Start the flow
                    </a>
                    <Link className={buttonVariants({ size: "sm", variant: "secondary" })} href="/live">
                      Open live state
                    </Link>
                    <Link className={buttonVariants({ size: "sm", variant: "outline" })} href="/documents">
                      Open curated docs
                    </Link>
                  </>
                ) : (
                  <>
                    <Link className={buttonVariants({ size: "sm" })} href="/govern">
                      Open govern
                    </Link>
                    <Link className={buttonVariants({ size: "sm", variant: "secondary" })} href="/live">
                      Open live state
                    </Link>
                    <Link className={buttonVariants({ size: "sm", variant: "outline" })} href="/documents">
                      Open curated docs
                    </Link>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="space-y-8">{children}</div>
        </div>
      </div>
    </main>
  );
}
