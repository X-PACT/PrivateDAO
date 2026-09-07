"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Code2,
  Compass,
  Bot,
  FileCheck2,
  FileText,
  Gamepad2,
  Gavel,
  GitBranch,
  Gauge,
  MessageSquareMore,
  PlayCircle,
  ShieldCheck,
  SquareTerminal,
  WalletCards,
} from "lucide-react";

import { useI18n } from "@/components/i18n-provider";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const operationsNav = [
  { href: "/products", label: "Products", icon: Compass, summary: "Choose the right PrivateDAO solution" },
  { href: "/products/record-verification", label: "Verify", icon: FileCheck2, summary: "Turn sensitive records into trusted evidence" },
  { href: "/auctions", label: "Decide", icon: Gavel, summary: "Choose fairly without exposing live offers" },
  { href: "/govern", label: "Govern", icon: SquareTerminal, summary: "Make private decisions with a clear audit trail" },
  { href: "/treasury", label: "Treasury", icon: Gauge, summary: "Coordinate approvals, funds, and accountability" },
  { href: "/proof-workflows", label: "Workflows", icon: GitBranch, summary: "Prove that important business processes happened correctly" },
  { href: "/pricing", label: "Pricing", icon: WalletCards, summary: "Choose a pilot, managed plan, or private deployment" },
  { href: "/pilots", label: "Pilots", icon: PlayCircle, summary: "Start with a focused business use case" },
  { href: "/developers", label: "Developers", icon: Code2, summary: "Connect your systems with the API and SDK" },
  { href: "/trust", label: "Trust", icon: ShieldCheck, summary: "Understand privacy, evidence, and operating boundaries" },
  { href: "/documents", label: "Docs", icon: FileText, summary: "Read the product and integration guides" },
  { href: "/community", label: "Community", icon: MessageSquareMore, summary: "Join the ecosystem and get support" },
  { href: "/agents", label: "Agent Marketplace", icon: Bot, summary: "Discover and connect useful agent services" },
  { href: "https://game.privatedao.org/game/godot/index.html", label: "PDAO Worlds", icon: Gamepad2, summary: "Experience privacy and coordination through play" },
];

const guidedNav = [
  { href: "/products", label: "Products", icon: Compass, summary: "Choose Proof Workflows, Governance, or Treasury" },
  { href: "/products/record-verification", label: "Record Verification", icon: FileCheck2, summary: "Turn critical records into independently verifiable evidence" },
  { href: "/auctions", label: "Private Auctions", icon: Gavel, summary: "Collect private offers and share a verified result" },
  { href: "/proof-workflows", label: "Workflows", icon: GitBranch, summary: "Prove a business process happened correctly" },
  { href: "/govern", label: "Governance", icon: SquareTerminal, summary: "Private rooms, votes, and decisions" },
  { href: "/treasury", label: "Treasury", icon: Gauge, summary: "Requests, approvals, and audit trails" },
  { href: "/pricing", label: "Pricing", icon: WalletCards, summary: "Plans, pilots, and deployment models" },
  { href: "/pilots", label: "Pilots", icon: PlayCircle, summary: "Request a focused pilot" },
  { href: "/agents", label: "Agent Marketplace", icon: Bot, summary: "Discover and connect useful agent services" },
  { href: "https://game.privatedao.org/game/godot/index.html", label: "PDAO Worlds", icon: Gamepad2, summary: "Experience privacy and coordination through play" },
];

type OperationsShellProps = {
  eyebrow: string;
  title: string;
  description: string;
  navigationMode?: "full" | "guided" | "focused";
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
  const { copy } = useI18n();
  const navItems = navigationMode === "guided" ? guidedNav : operationsNav;
  const getNavLabel = (href: string, fallback: string) => {
    switch (href) {
      case "/govern":
        return copy.chrome.govern;
      case "/products":
        return copy.chrome.products;
      case "/documents":
        return copy.chrome.docs;
      case "/community":
        return copy.chrome.community;
      default:
        return fallback;
    }
  };
  const useMinimalGuidedChrome = navigationMode !== "full";
  const isGovernRoute = pathname === "/govern" || pathname.startsWith("/govern/");
  const isGuidedRoute = navigationMode === "guided";
  const isFocusedRoute = navigationMode === "focused";
  const heroTitleClass = useMinimalGuidedChrome
    ? "max-w-4xl text-2xl font-semibold tracking-[-0.03em] text-white sm:text-4xl lg:text-[2.8rem]"
    : "max-w-4xl text-3xl font-semibold tracking-[-0.035em] text-white sm:text-5xl";
  const heroDescriptionClass = useMinimalGuidedChrome
    ? "max-w-2xl text-sm leading-7 text-white/60 sm:text-base sm:leading-7"
    : "max-w-3xl text-sm leading-7 text-white/60 sm:text-lg sm:leading-8";

  return (
    <main className="mx-auto w-full max-w-7xl overflow-x-clip px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
      {!useMinimalGuidedChrome ? <div className="mb-6 xl:hidden">
        <Card className="border-white/10 bg-[#07101d]/88">
          <CardHeader className="space-y-3">
            <div className="text-[11px] uppercase tracking-[0.34em] text-cyan-200/78">{copy.shell.explore}</div>
            <CardTitle className="text-lg">{copy.shell.productNavigation}</CardTitle>
          </CardHeader>
          <CardContent className="no-scrollbar flex gap-3 overflow-x-auto pb-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = item.href.startsWith("http") ? false : pathname === item.href || pathname.startsWith(`${item.href}/`);
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
                    <div className="text-sm font-medium">{getNavLabel(item.href, item.label)}</div>
                    <div className="mt-1 line-clamp-2 text-xs leading-5 text-white/45">{item.summary}</div>
                  </div>
                </Link>
              );
            })}
          </CardContent>
        </Card>
      </div> : null}

      <div
        className={cn(
          "grid min-w-0 gap-6 xl:gap-8",
          !useMinimalGuidedChrome && "xl:grid-cols-[280px_minmax(0,1fr)]",
        )}
      >
        {!useMinimalGuidedChrome ? <aside className="hidden xl:sticky xl:top-28 xl:block xl:self-start">
          <Card className="border-white/10 bg-[#07101d]/88">
            <CardHeader className="space-y-4">
              <div className="space-y-2">
                <div className="text-[11px] uppercase tracking-[0.34em] text-cyan-200/78">{copy.shell.explore}</div>
                <CardTitle className="text-xl">{copy.shell.productNavigation}</CardTitle>
              </div>
              <p className="text-sm leading-7 text-white/56">
                {copy.shell.userFirstRoutes}
              </p>
            </CardHeader>
            <CardContent className="space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = item.href.startsWith("http") ? false : pathname === item.href || pathname.startsWith(`${item.href}/`);
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
                      <div className="text-sm font-medium">{getNavLabel(item.href, item.label)}</div>
                      <div className="mt-1 text-xs leading-6 text-white/45">{item.summary}</div>
                    </div>
                  </Link>
                );
              })}
            </CardContent>
          </Card>

          <Card className="mt-4 border-white/10 bg-white/[0.03]">
            <CardHeader>
              <CardTitle className="text-base">How PrivateDAO works</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-white/58">
              <div className="rounded-2xl border border-white/8 bg-black/20 px-4 py-3">Keep sensitive inputs private.</div>
              <div className="rounded-2xl border border-white/8 bg-black/20 px-4 py-3">Turn decisions into verifiable evidence.</div>
              <div className="rounded-2xl border border-white/8 bg-black/20 px-4 py-3">Coordinate people, approvals, and funds.</div>
              <div className="rounded-2xl border border-white/8 bg-black/20 px-4 py-3">Share a clear result with the people who need it.</div>
            </CardContent>
          </Card>
        </aside> : null}

        <div className="min-w-0 space-y-8">
          <Card className="min-w-0 border-white/10 bg-[linear-gradient(180deg,rgba(10,16,32,0.94),rgba(7,11,23,0.98))]">
            <CardContent className={cn("p-6", useMinimalGuidedChrome ? "sm:p-6" : "sm:p-8")}>
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
                <div className={heroTitleClass}>{title}</div>
                <p className={heroDescriptionClass}>{description}</p>
                {isGuidedRoute ? (
                  <div className="flex flex-wrap gap-2 text-[11px] uppercase tracking-[0.22em] text-white/48">
                    <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1">Connect</span>
                    <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1">Review</span>
                    <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1">Sign</span>
                    <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1">Verify</span>
                  </div>
                ) : null}
              </div>

              {!isFocusedRoute ? <div className={cn("flex flex-wrap gap-3", useMinimalGuidedChrome ? "mt-6" : "mt-8")}>
                {isGovernRoute ? (
                  <>
                    <a className={buttonVariants({ size: "sm" })} href="#proposal-review-action">
                      {copy.shell.startTheFlow}
                    </a>
                    <Link className={buttonVariants({ size: "sm", variant: "secondary" })} href="/execute">
                      Open execute
                    </Link>
                    <Link className={buttonVariants({ size: "sm", variant: "outline" })} href="/proof">
                      <span className="hidden sm:inline">Open proof</span>
                      <span className="sm:hidden">Proof</span>
                    </Link>
                  </>
                ) : (
                  <>
                    <Link className={buttonVariants({ size: "sm" })} href="/govern">
                      {copy.shell.openGovern}
                    </Link>
                    <Link className={buttonVariants({ size: "sm", variant: "secondary" })} href="/execute">
                      Open execute
                    </Link>
                    {isGuidedRoute ? (
                      <Link className={cn(buttonVariants({ size: "sm", variant: "outline" }), "hidden sm:inline-flex")} href="/proof">
                        Open proof
                      </Link>
                    ) : (
                      <Link className={buttonVariants({ size: "sm", variant: "outline" })} href="/documents">
                        {copy.shell.openCuratedDocs}
                      </Link>
                    )}
                  </>
                )}
              </div> : null}
            </CardContent>
          </Card>

          <div className="min-w-0 space-y-8">{children}</div>
        </div>
      </div>
    </main>
  );
}
