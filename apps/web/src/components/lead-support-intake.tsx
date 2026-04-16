"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, LifeBuoy, Rocket, Users } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type IntakeMode = "community" | "engage";

type LeadSupportIntakeProps = {
  mode: IntakeMode;
};

const roleOptions = [
  { value: "buyer", label: "Buyer / operator" },
  { value: "developer", label: "Developer / integration team" },
  { value: "community", label: "Community member" },
] as const;

const interestOptions = [
  { value: "governance", label: "Governance core" },
  { value: "rpc", label: "RPC / hosted reads" },
  { value: "gaming", label: "Gaming DAO" },
  { value: "payments", label: "Payments / payouts" },
  { value: "security", label: "Security / proof / privacy" },
] as const;

const stageOptions = [
  { value: "explore", label: "Exploring" },
  { value: "pilot", label: "Pilot soon" },
  { value: "operate", label: "Operate now" },
] as const;

export function LeadSupportIntake({ mode }: LeadSupportIntakeProps) {
  const [role, setRole] = useState<(typeof roleOptions)[number]["value"]>("buyer");
  const [interest, setInterest] = useState<(typeof interestOptions)[number]["value"]>("governance");
  const [stage, setStage] = useState<(typeof stageOptions)[number]["value"]>(mode === "engage" ? "pilot" : "explore");

  const plan = useMemo(() => {
    if (role === "developer") {
      return {
        title: "Developer integration route",
        summary: "Start in Developers, use Services for RPC posture, then validate against Diagnostics and Proof so integration stays evidence-backed.",
        primaryHref: "/developers",
        primaryLabel: "Open developer portal",
        related: [
          { label: "Services", href: "/services" },
          { label: "Diagnostics", href: "/diagnostics" },
          { label: "Proof", href: "/proof/?judge=1" },
        ],
      };
    }

    if (interest === "rpc") {
      return {
        title: "RPC buyer path",
        summary: "Lead with Services and Engage, then keep Diagnostics visible so the infrastructure story stays commercial and measurable.",
        primaryHref: "/services",
        primaryLabel: "Open RPC services",
        related: [
          { label: "Engage", href: "/engage" },
          { label: "Diagnostics", href: "/diagnostics" },
          { label: "Govern", href: "/govern" },
        ],
      };
    }

    if (interest === "gaming") {
      return {
        title: "Gaming DAO path",
        summary: "Use Products for the gaming corridor, then move into Govern to show how proposals, rewards, and treasury rails become a live flow.",
        primaryHref: "/products",
        primaryLabel: "Open gaming corridor",
        related: [
          { label: "Govern", href: "/govern" },
          { label: "Services", href: "/services" },
          { label: "Judge", href: "/judge" },
        ],
      };
    }

    if (interest === "payments") {
      return {
        title: "Payments path",
        summary: "Use Services first, then Govern for governance-backed payouts and Live State for runtime follow-up.",
        primaryHref: "/services",
        primaryLabel: "Open payments services",
        related: [
          { label: "Govern", href: "/govern" },
          { label: "Live State", href: "/live" },
          { label: "Engage", href: "/engage" },
        ],
      };
    }

    if (interest === "security") {
      return {
        title: "Security and proof path",
        summary: "Start in Security, then move into Proof and Engage so privacy, trust, and buyer confidence stay connected.",
        primaryHref: "/security",
        primaryLabel: "Open security",
        related: [
          { label: "Proof", href: "/proof/?judge=1" },
          { label: "Engage", href: "/engage" },
          { label: "Diagnostics", href: "/diagnostics" },
        ],
      };
    }

    return {
      title: stage === "operate" ? "Operator-ready route" : stage === "pilot" ? "Pilot-ready route" : "Exploration route",
      summary:
        stage === "operate"
          ? "Go straight into Govern, then keep Live State and Engage close so operation, trust, and buyer posture stay together."
          : stage === "pilot"
            ? "Use Engage and Services first, then demonstrate the live flow in Govern."
            : "Start from Community or Start, then continue into Govern when the visitor is ready for a real action.",
      primaryHref: stage === "operate" ? "/govern" : stage === "pilot" ? "/engage" : "/start",
      primaryLabel: stage === "operate" ? "Open govern" : stage === "pilot" ? "Open engage" : "Open start",
      related: [
        { label: "Services", href: "/services" },
        { label: "Community", href: "/community" },
        { label: "Track Activity", href: "/live" },
      ],
    };
  }, [interest, role, stage]);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-emerald-300/18 bg-emerald-300/10 text-emerald-100">
            {mode === "engage" ? <Rocket className="h-5 w-5" /> : <Users className="h-5 w-5" />}
          </div>
          <div>
            <CardTitle>{mode === "engage" ? "Pilot and buyer intake" : "Community and support intake"}</CardTitle>
            <p className="mt-2 text-sm leading-7 text-white/60">
              Choose the visitor role, interest, and stage. The product returns the shortest next route without forcing the user to understand the whole system first.
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <div className="grid gap-4">
          <label className="grid gap-2 text-sm text-white/70">
            <span className="text-[11px] uppercase tracking-[0.24em] text-white/46">Role</span>
            <select value={role} onChange={(event) => setRole(event.target.value as typeof role)} className="rounded-2xl border border-white/10 bg-white/4 px-4 py-3 text-white outline-none">
              {roleOptions.map((option) => (
                <option key={option.value} value={option.value} className="bg-[#0b1020]">
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className="grid gap-2 text-sm text-white/70">
            <span className="text-[11px] uppercase tracking-[0.24em] text-white/46">Primary interest</span>
            <select value={interest} onChange={(event) => setInterest(event.target.value as typeof interest)} className="rounded-2xl border border-white/10 bg-white/4 px-4 py-3 text-white outline-none">
              {interestOptions.map((option) => (
                <option key={option.value} value={option.value} className="bg-[#0b1020]">
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className="grid gap-2 text-sm text-white/70">
            <span className="text-[11px] uppercase tracking-[0.24em] text-white/46">Stage</span>
            <select value={stage} onChange={(event) => setStage(event.target.value as typeof stage)} className="rounded-2xl border border-white/10 bg-white/4 px-4 py-3 text-white outline-none">
              {stageOptions.map((option) => (
                <option key={option.value} value={option.value} className="bg-[#0b1020]">
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="rounded-3xl border border-white/8 bg-white/4 p-5">
          <div className="text-[11px] uppercase tracking-[0.28em] text-emerald-300/76">Recommended route</div>
          <div className="mt-3 text-xl font-medium text-white">{plan.title}</div>
          <p className="mt-3 text-sm leading-7 text-white/64">{plan.summary}</p>

          <div className="mt-5 flex flex-wrap gap-3">
            <Link href={plan.primaryHref} className={cn(buttonVariants({ size: "sm" }))}>
              {plan.primaryLabel}
              <ArrowRight className="h-4 w-4" />
            </Link>
            {plan.related.map((route) => (
              <Link key={`${plan.title}-${route.href}`} href={route.href} className={cn(buttonVariants({ size: "sm", variant: "outline" }))}>
                {route.label}
              </Link>
            ))}
          </div>

          <div className="mt-5 rounded-2xl border border-white/8 bg-black/20 p-4 text-sm leading-7 text-white/60">
            <div className="flex items-center gap-2 text-white">
              <LifeBuoy className="h-4 w-4 text-cyan-200" />
              Product-native next step
            </div>
            <div className="mt-2">
              This intake stays inside the app and routes the visitor toward buyer motion, developer integration, or live operation without dropping into repo-only tooling.
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
