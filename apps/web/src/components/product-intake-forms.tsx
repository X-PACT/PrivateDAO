"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, BriefcaseBusiness, CheckCircle2, Clipboard, Download, Headset, LifeBuoy, Rocket, ServerCog, Sparkles, WalletCards } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type IntakeKind = "pilot" | "rpc" | "gaming" | "payments" | "support";
type IntakeMode = "community" | "engage";

type IntakePreset = {
  kind: IntakeKind;
  label: string;
  title: string;
  summary: string;
  icon: typeof Rocket;
  handoff: {
    lane: "buyer" | "operator" | "support" | "track-demo";
    owner: string;
    destination: string;
    priority: string;
    narrative: string;
    primaryAction: { label: string; href: string };
    evidenceAction: { label: string; href: string };
  };
  routeSet: Array<{ label: string; href: string }>;
};

type FundingProfileOverride = {
  handoff?: Partial<IntakePreset["handoff"]>;
  routeSet?: Array<{ label: string; href: string }>;
  summary?: string;
  commercialBundle?: {
    title: string;
    summary: string;
    routes: Array<{ label: string; href: string }>;
  };
};

const intakePresets: IntakePreset[] = [
  {
    kind: "pilot",
    label: "Start a pilot",
    title: "Pilot request",
    summary: "For teams ready to explore a real pilot path around governance, trust packaging, and mainnet-aware rollout.",
    icon: Rocket,
    handoff: {
      lane: "buyer",
      owner: "Buyer motion",
      destination: "Pilot and commercial path",
      priority: "Qualified now",
      narrative: "Move the request into Engage first, then keep Services and Command Center close so the commercial story stays tied to real product operation.",
      primaryAction: { label: "Open buyer path", href: "/engage" },
      evidenceAction: { label: "Open services evidence", href: "/services" },
    },
    routeSet: [
      { label: "Engage", href: "/engage" },
      { label: "Services", href: "/services" },
      { label: "Command Center", href: "/command-center" },
    ],
  },
  {
    kind: "rpc",
    label: "Request RPC access",
    title: "RPC infrastructure request",
    summary: "For teams that need dedicated or shared RPC, hosted reads, diagnostics, and infrastructure support.",
    icon: ServerCog,
    handoff: {
      lane: "operator",
      owner: "Infrastructure operator",
      destination: "RPC onboarding and diagnostics",
      priority: "Fast qualification",
      narrative: "Route the team into Services and Diagnostics first, then continue into Developers so RPC onboarding remains measurable and implementation-ready.",
      primaryAction: { label: "Open RPC services", href: "/services" },
      evidenceAction: { label: "Open diagnostics", href: "/diagnostics" },
    },
    routeSet: [
      { label: "Services", href: "/services" },
      { label: "Diagnostics", href: "/diagnostics" },
      { label: "Developers", href: "/developers" },
    ],
  },
  {
    kind: "gaming",
    label: "Request gaming demo",
    title: "Gaming DAO demo request",
    summary: "For studios, guild operators, or tournament teams exploring reward governance and gaming treasury flows.",
    icon: WalletCards,
    handoff: {
      lane: "track-demo",
      owner: "Track and product demo",
      destination: "Gaming corridor and live demo",
      priority: "Narrative-critical",
      narrative: "Push the request into the gaming corridor, then use Command Center and Ranger routes so the demo stays tied to live governance and competition evidence.",
      primaryAction: { label: "Open gaming corridor", href: "/products" },
      evidenceAction: { label: "Open Ranger track", href: "/tracks/ranger-main" },
    },
    routeSet: [
      { label: "Products", href: "/products" },
      { label: "Command Center", href: "/command-center" },
      { label: "Tracks", href: "/tracks/ranger-main" },
    ],
  },
  {
    kind: "payments",
    label: "Request payments flow",
    title: "Payments DAO request",
    summary: "For contributor, vendor, subscription, or governed treasury payout flows.",
    icon: WalletCards,
    handoff: {
      lane: "buyer",
      owner: "Payments buyer motion",
      destination: "Governed payouts and treasury flow",
      priority: "Commercial now",
      narrative: "Take the request into Services and Command Center so the payments story remains anchored to governance-backed execution, not a generic checkout narrative.",
      primaryAction: { label: "Open payments services", href: "/services" },
      evidenceAction: { label: "Open command center", href: "/command-center" },
    },
    routeSet: [
      { label: "Services", href: "/services" },
      { label: "Command Center", href: "/command-center" },
      { label: "Security", href: "/security" },
    ],
  },
  {
    kind: "support",
    label: "Need support",
    title: "Support request",
    summary: "For route confusion, wallet questions, diagnostics issues, or fast operator guidance.",
    icon: Headset,
    handoff: {
      lane: "support",
      owner: "Support and incident routing",
      destination: "Assistant, diagnostics, and Discord",
      priority: "Immediate",
      narrative: "Keep the user inside the product first, then escalate to Diagnostics or Discord only when the issue needs operator context or live assistance.",
      primaryAction: { label: "Open assistant", href: "/assistant" },
      evidenceAction: { label: "Join Discord", href: "https://discord.gg/bC76YEcpDa" },
    },
    routeSet: [
      { label: "Assistant", href: "/assistant" },
      { label: "Diagnostics", href: "/diagnostics" },
      { label: "Discord", href: "https://discord.gg/bC76YEcpDa" },
    ],
  },
];

const fundingProfileOverrides: Record<string, FundingProfileOverride> = {
  "treasury-top-up": {
    summary: "Treasury top-up for governance runway, shared operations, and customer-facing reliability.",
    handoff: {
      owner: "Treasury buyer motion",
      destination: "Treasury capitalization and governed operating runway",
      priority: "Commercial now",
      narrative:
        "Treat this as treasury capitalization, not a generic payment. Keep Services and Command Center close so the sender sees how capital strengthens live governance, diagnostics, and operator continuity.",
      primaryAction: { label: "Open treasury services", href: "/services" },
      evidenceAction: { label: "Open command center", href: "/command-center" },
    },
    routeSet: [
      { label: "Services", href: "/services" },
      { label: "Command Center", href: "/command-center" },
      { label: "Diagnostics", href: "/diagnostics" },
    ],
    commercialBundle: {
      title: "Treasury capitalization bundle",
      summary: "Position the request as treasury runway for live services, buyer onboarding, and trust visibility.",
      routes: [
        { label: "Services", href: "/services" },
        { label: "Engage", href: "/engage?profile=treasury-top-up" },
        { label: "RPC track", href: "/tracks/rpc-infrastructure?profile=treasury-top-up" },
        { label: "Security", href: "/security" },
      ],
    },
  },
  "pilot-funding": {
    summary: "Pilot funding tied to a time-boxed buyer rollout, measurable Devnet validation, and mainnet-aware next steps.",
    handoff: {
      owner: "Pilot buyer motion",
      destination: "Pilot funding and buyer onboarding",
      priority: "Qualified now",
      narrative:
        "Keep the story commercial: this funding should accelerate a concrete pilot, evidence collection, and trust packaging rather than sit as abstract treasury capital.",
      primaryAction: { label: "Open engage path", href: "/engage" },
      evidenceAction: { label: "Open services evidence", href: "/services" },
    },
    routeSet: [
      { label: "Engage", href: "/engage" },
      { label: "Services", href: "/services" },
      { label: "Proof", href: "/proof" },
    ],
    commercialBundle: {
      title: "Pilot and demo bundle",
      summary: "Move from commercial qualification into the strongest live demo corridor and the startup-grade track narrative.",
      routes: [
        { label: "Engage", href: "/engage?profile=pilot-funding" },
        { label: "Command Center", href: "/command-center" },
        { label: "Colosseum Frontier", href: "/tracks/colosseum-frontier?profile=pilot-funding" },
      ],
    },
  },
  "vendor-payout": {
    summary: "Vendor payout routed as a governed operational disbursement with validation, diagnostics, and treasury discipline.",
    handoff: {
      lane: "operator",
      owner: "Operations payout lane",
      destination: "Vendor disbursement and execution controls",
      priority: "Operational",
      narrative:
        "This is an operator-grade treasury action. Keep Command Center and Diagnostics in the loop so beneficiary validation, execution health, and payout evidence remain explicit.",
      primaryAction: { label: "Open command center", href: "/command-center" },
      evidenceAction: { label: "Open diagnostics", href: "/diagnostics" },
    },
    routeSet: [
      { label: "Command Center", href: "/command-center" },
      { label: "Diagnostics", href: "/diagnostics" },
      { label: "Security", href: "/security" },
    ],
    commercialBundle: {
      title: "Vendor execution bundle",
      summary: "Keep the sender on the execution rail with operations, diagnostics, and payout review visible in one place.",
      routes: [
        { label: "Command Center", href: "/command-center" },
        { label: "Diagnostics", href: "/diagnostics" },
        { label: "Live dApp track", href: "/tracks/eitherway-live-dapp?profile=vendor-payout" },
        { label: "Services", href: "/services" },
      ],
    },
  },
  "contributor-payout": {
    summary: "Contributor payout as a governed treasury flow for builders, operators, and retained contributors.",
    handoff: {
      lane: "operator",
      owner: "Contributor payout lane",
      destination: "Contributor disbursement and governed treasury execution",
      priority: "Operational",
      narrative:
        "Frame this as a retained contributor flow, not a one-off transfer. Keep payout policy, treasury review, and execution evidence visible to preserve operating credibility.",
      primaryAction: { label: "Open command center", href: "/command-center" },
      evidenceAction: { label: "Open security", href: "/security" },
    },
    routeSet: [
      { label: "Command Center", href: "/command-center" },
      { label: "Security", href: "/security" },
      { label: "Services", href: "/services" },
    ],
    commercialBundle: {
      title: "Contributor operations bundle",
      summary: "Keep contributor funding attached to governed execution, diagnostics, and security review rather than ad-hoc transfers.",
      routes: [
        { label: "Command Center", href: "/command-center" },
        { label: "Diagnostics", href: "/diagnostics" },
        { label: "Consumer Apps track", href: "/tracks/consumer-apps?profile=contributor-payout" },
        { label: "Security", href: "/security" },
      ],
    },
  },
};

type ProductIntakeFormsProps = {
  mode: IntakeMode;
  initialKind?: IntakeKind;
  initialFundingContext?: {
    asset?: string;
    amount?: string;
    purpose?: string;
    lane?: string;
    profile?: string;
  };
};

function buildPacket(params: {
  preset: IntakePreset;
  mode: IntakeMode;
  name: string;
  org: string;
  contact: string;
  timeline: string;
  useCase: string;
  fundingContext?: ProductIntakeFormsProps["initialFundingContext"];
}) {
  const { preset, mode, name, org, contact, timeline, useCase, fundingContext } = params;
  return [
    `PrivateDAO Intake`,
    `Type: ${preset.title}`,
    `Source Route: ${mode === "engage" ? "Engage" : "Community"}`,
    `Handoff Lane: ${preset.handoff.lane}`,
    `Handoff Owner: ${preset.handoff.owner}`,
    `Destination: ${preset.handoff.destination}`,
    `Priority: ${preset.handoff.priority}`,
    `Name: ${name || "Not provided"}`,
    `Organization: ${org || "Not provided"}`,
    `Contact: ${contact || "Not provided"}`,
    `Timeline: ${timeline || "Not provided"}`,
    `Treasury Profile: ${fundingContext?.profile || "Not provided"}`,
    `Treasury Asset: ${fundingContext?.asset || "Not provided"}`,
    `Treasury Amount: ${fundingContext?.amount || "Not provided"}`,
    `Use Case: ${useCase || "Not provided"}`,
    `Recommended Next Routes:`,
    ...preset.routeSet.map((route) => `- ${route.label}: ${route.href}`),
  ].join("\n");
}

function buildInitialUseCase(initialFundingContext?: ProductIntakeFormsProps["initialFundingContext"]) {
  if (!initialFundingContext?.asset && !initialFundingContext?.amount && !initialFundingContext?.purpose) {
    return "";
  }

  const parts = [
    initialFundingContext.profile ? `Profile: ${initialFundingContext.profile}` : null,
    initialFundingContext.amount ? `Amount: ${initialFundingContext.amount}` : null,
    initialFundingContext.asset ? `Asset: ${initialFundingContext.asset}` : null,
    initialFundingContext.purpose ? `Purpose: ${initialFundingContext.purpose}` : null,
    initialFundingContext.lane ? `Lane: ${initialFundingContext.lane}` : null,
  ].filter(Boolean);

  return `Treasury funding context\n${parts.join("\n")}`;
}

function getResolvedPreset(preset: IntakePreset, fundingContext?: ProductIntakeFormsProps["initialFundingContext"]) {
  const override = fundingContext?.profile ? fundingProfileOverrides[fundingContext.profile] : undefined;
  if (!override) {
    return preset;
  }

  return {
    ...preset,
    summary: override.summary ?? preset.summary,
    handoff: {
      ...preset.handoff,
      ...override.handoff,
    },
    routeSet: override.routeSet ?? preset.routeSet,
  } satisfies IntakePreset;
}

function getCommercialBundle(fundingContext?: ProductIntakeFormsProps["initialFundingContext"]) {
  return fundingContext?.profile ? fundingProfileOverrides[fundingContext.profile]?.commercialBundle : undefined;
}

export function ProductIntakeForms({ mode, initialKind, initialFundingContext }: ProductIntakeFormsProps) {
  const [kind, setKind] = useState<IntakeKind>(initialKind ?? (mode === "engage" ? "pilot" : "support"));
  const [name, setName] = useState("");
  const [org, setOrg] = useState("");
  const [contact, setContact] = useState("");
  const [timeline, setTimeline] = useState("");
  const [useCase, setUseCase] = useState(buildInitialUseCase(initialFundingContext));
  const [status, setStatus] = useState<"idle" | "copied" | "downloaded">("idle");

  const basePreset = intakePresets.find((item) => item.kind === kind) ?? intakePresets[0];
  const preset = getResolvedPreset(basePreset, initialFundingContext);
  const commercialBundle = getCommercialBundle(initialFundingContext);
  const Icon = preset.icon;
  const LaneIcon =
    preset.handoff.lane === "buyer"
      ? BriefcaseBusiness
      : preset.handoff.lane === "operator"
        ? ServerCog
        : preset.handoff.lane === "support"
          ? LifeBuoy
          : Sparkles;

  const packet = useMemo(
    () =>
      buildPacket({
        preset,
        mode,
        name,
        org,
        contact,
        timeline,
        useCase,
        fundingContext: initialFundingContext,
      }),
    [preset, mode, name, org, contact, timeline, useCase, initialFundingContext],
  );

  const isReady = Boolean(name.trim() && contact.trim() && useCase.trim());

  async function handleCopy() {
    await navigator.clipboard.writeText(packet);
    setStatus("copied");
  }

  function handleDownload() {
    const blob = new Blob([packet], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `privatedao-${preset.kind}-intake.txt`;
    anchor.click();
    URL.revokeObjectURL(url);
    setStatus("downloaded");
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-emerald-300/18 bg-emerald-300/10 text-emerald-100">
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <CardTitle>Product-native intake</CardTitle>
            <p className="mt-2 text-sm leading-7 text-white/60">
              Prepare a real request packet inside the product, then continue into the exact route needed for pilot, RPC, gaming, payments, or support.
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="grid gap-6 xl:grid-cols-[0.98fr_1.02fr]">
        <div className="grid gap-4">
          <div className="flex flex-wrap gap-3">
            {intakePresets.map((item) => (
              <button
                key={item.kind}
                type="button"
                onClick={() => {
                  setKind(item.kind);
                  setStatus("idle");
                }}
                className={cn(
                  "rounded-full border px-4 py-2 text-xs uppercase tracking-[0.18em] transition",
                  kind === item.kind
                    ? "border-cyan-300/28 bg-cyan-300/10 text-white"
                    : "border-white/10 bg-white/4 text-white/62 hover:border-white/16 hover:text-white",
                )}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="rounded-3xl border border-white/8 bg-white/4 p-5">
            <div className="text-lg font-medium text-white">{preset.title}</div>
            <p className="mt-3 text-sm leading-7 text-white/60">{preset.summary}</p>
          </div>

          {initialFundingContext?.profile || initialFundingContext?.asset || initialFundingContext?.amount || initialFundingContext?.purpose ? (
            <div className="rounded-3xl border border-amber-300/16 bg-amber-300/[0.08] p-5">
              <div className="text-[11px] uppercase tracking-[0.24em] text-amber-100/76">Treasury context received</div>
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                <div className="rounded-2xl border border-white/8 bg-black/20 p-4">
                  <div className="text-[11px] uppercase tracking-[0.22em] text-white/46">Profile</div>
                  <div className="mt-2 text-sm font-medium text-white">{initialFundingContext.profile ?? "Not provided"}</div>
                </div>
                <div className="rounded-2xl border border-white/8 bg-black/20 p-4">
                  <div className="text-[11px] uppercase tracking-[0.22em] text-white/46">Asset</div>
                  <div className="mt-2 text-sm font-medium text-white">{initialFundingContext.asset ?? "Not provided"}</div>
                </div>
                <div className="rounded-2xl border border-white/8 bg-black/20 p-4">
                  <div className="text-[11px] uppercase tracking-[0.22em] text-white/46">Amount</div>
                  <div className="mt-2 text-sm font-medium text-white">{initialFundingContext.amount ?? "Not provided"}</div>
                </div>
                <div className="rounded-2xl border border-white/8 bg-black/20 p-4">
                  <div className="text-[11px] uppercase tracking-[0.22em] text-white/46">Purpose</div>
                  <div className="mt-2 text-sm font-medium text-white">{initialFundingContext.purpose ?? "Not provided"}</div>
                </div>
                <div className="rounded-2xl border border-white/8 bg-black/20 p-4">
                  <div className="text-[11px] uppercase tracking-[0.22em] text-white/46">Lane</div>
                  <div className="mt-2 text-sm font-medium text-white">{initialFundingContext.lane ?? "Not provided"}</div>
                </div>
              </div>
            </div>
          ) : null}

          <div className="grid gap-4">
            <label className="grid gap-2 text-sm text-white/70">
              <span className="text-[11px] uppercase tracking-[0.24em] text-white/46">Name</span>
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Your name"
                className="rounded-2xl border border-white/10 bg-white/4 px-4 py-3 text-white outline-none placeholder:text-white/34"
              />
            </label>
            <label className="grid gap-2 text-sm text-white/70">
              <span className="text-[11px] uppercase tracking-[0.24em] text-white/46">Organization</span>
              <input
                value={org}
                onChange={(event) => setOrg(event.target.value)}
                placeholder="Team, studio, DAO, or company"
                className="rounded-2xl border border-white/10 bg-white/4 px-4 py-3 text-white outline-none placeholder:text-white/34"
              />
            </label>
            <label className="grid gap-2 text-sm text-white/70">
              <span className="text-[11px] uppercase tracking-[0.24em] text-white/46">Contact</span>
              <input
                value={contact}
                onChange={(event) => setContact(event.target.value)}
                placeholder="Email, Telegram, Discord, or X handle"
                className="rounded-2xl border border-white/10 bg-white/4 px-4 py-3 text-white outline-none placeholder:text-white/34"
              />
            </label>
            <label className="grid gap-2 text-sm text-white/70">
              <span className="text-[11px] uppercase tracking-[0.24em] text-white/46">Timeline</span>
              <input
                value={timeline}
                onChange={(event) => setTimeline(event.target.value)}
                placeholder="This week, this month, pilot in 30 days..."
                className="rounded-2xl border border-white/10 bg-white/4 px-4 py-3 text-white outline-none placeholder:text-white/34"
              />
            </label>
            <label className="grid gap-2 text-sm text-white/70">
              <span className="text-[11px] uppercase tracking-[0.24em] text-white/46">Use case</span>
              <textarea
                value={useCase}
                onChange={(event) => setUseCase(event.target.value)}
                placeholder="Describe what you want to run with PrivateDAO"
                rows={5}
                className="rounded-2xl border border-white/10 bg-white/4 px-4 py-3 text-white outline-none placeholder:text-white/34"
              />
            </label>
          </div>
        </div>

        <div className="grid gap-4">
          <div className="rounded-3xl border border-cyan-300/16 bg-cyan-300/[0.08] p-5">
            <div className="flex items-center gap-2 text-white">
              <CheckCircle2 className="h-4 w-4 text-cyan-100" />
              <div className="text-[11px] uppercase tracking-[0.24em] text-cyan-100/76">Request packet</div>
            </div>
            <pre className="mt-4 whitespace-pre-wrap text-sm leading-7 text-white/72">{packet}</pre>
          </div>

          <div className="rounded-3xl border border-emerald-300/16 bg-emerald-300/[0.08] p-5">
            <div className="flex items-center gap-2 text-white">
              <LaneIcon className="h-4 w-4 text-emerald-100" />
              <div className="text-[11px] uppercase tracking-[0.24em] text-emerald-100/76">Structured handoff</div>
            </div>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <div className="rounded-2xl border border-white/8 bg-black/20 p-4">
                <div className="text-[11px] uppercase tracking-[0.24em] text-white/46">Lane</div>
                <div className="mt-2 text-sm font-medium capitalize text-white">{preset.handoff.lane.replace("-", " ")}</div>
              </div>
              <div className="rounded-2xl border border-white/8 bg-black/20 p-4">
                <div className="text-[11px] uppercase tracking-[0.24em] text-white/46">Owner</div>
                <div className="mt-2 text-sm font-medium text-white">{preset.handoff.owner}</div>
              </div>
              <div className="rounded-2xl border border-white/8 bg-black/20 p-4">
                <div className="text-[11px] uppercase tracking-[0.24em] text-white/46">Destination</div>
                <div className="mt-2 text-sm font-medium text-white">{preset.handoff.destination}</div>
              </div>
              <div className="rounded-2xl border border-white/8 bg-black/20 p-4">
                <div className="text-[11px] uppercase tracking-[0.24em] text-white/46">Priority</div>
                <div className="mt-2 text-sm font-medium text-white">{preset.handoff.priority}</div>
              </div>
            </div>
            <div className="mt-4 rounded-2xl border border-white/8 bg-black/20 p-4 text-sm leading-7 text-white/68">
              {preset.handoff.narrative}
            </div>
            <div className="mt-4 flex flex-wrap gap-3">
              {preset.handoff.primaryAction.href.startsWith("http") ? (
                <a href={preset.handoff.primaryAction.href} target="_blank" rel="noreferrer" className={cn(buttonVariants({ size: "sm" }))}>
                  {preset.handoff.primaryAction.label}
                  <ArrowRight className="h-4 w-4" />
                </a>
              ) : (
                <Link href={preset.handoff.primaryAction.href} className={cn(buttonVariants({ size: "sm" }))}>
                  {preset.handoff.primaryAction.label}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              )}
              {preset.handoff.evidenceAction.href.startsWith("http") ? (
                <a
                  href={preset.handoff.evidenceAction.href}
                  target="_blank"
                  rel="noreferrer"
                  className={cn(buttonVariants({ size: "sm", variant: "secondary" }))}
                >
                  {preset.handoff.evidenceAction.label}
                  <ArrowRight className="h-4 w-4" />
                </a>
              ) : (
                <Link href={preset.handoff.evidenceAction.href} className={cn(buttonVariants({ size: "sm", variant: "secondary" }))}>
                  {preset.handoff.evidenceAction.label}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              )}
            </div>
          </div>

          {commercialBundle ? (
            <div className="rounded-3xl border border-violet-300/16 bg-violet-300/[0.08] p-5">
              <div className="text-[11px] uppercase tracking-[0.24em] text-violet-100/76">Commercial route bundle</div>
              <div className="mt-3 text-base font-medium text-white">{commercialBundle.title}</div>
              <p className="mt-3 text-sm leading-7 text-white/64">{commercialBundle.summary}</p>
              <div className="mt-4 flex flex-wrap gap-3">
                {commercialBundle.routes.map((route) => (
                  <Link key={`${commercialBundle.title}-${route.href}`} href={route.href} className={cn(buttonVariants({ size: "sm", variant: "outline" }))}>
                    {route.label}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                ))}
              </div>
            </div>
          ) : null}

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleCopy}
              disabled={!isReady}
              className={cn(buttonVariants({ size: "sm" }), !isReady && "pointer-events-none opacity-50")}
            >
              <Clipboard className="h-4 w-4" />
              Copy request
            </button>
            <button
              type="button"
              onClick={handleDownload}
              disabled={!isReady}
              className={cn(buttonVariants({ size: "sm", variant: "secondary" }), !isReady && "pointer-events-none opacity-50")}
            >
              <Download className="h-4 w-4" />
              Download request
            </button>
          </div>

          <div className="rounded-3xl border border-white/8 bg-white/4 p-5">
            <div className="text-[11px] uppercase tracking-[0.24em] text-white/46">Delivery bundle</div>
            <p className="mt-3 text-sm leading-7 text-white/60">
              Use this route bundle to move from intake to buyer, operator, support, or demo follow-up without dropping the context collected above.
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              {preset.routeSet.map((route) =>
                route.href.startsWith("http") ? (
                  <a
                    key={`${preset.kind}-${route.href}`}
                    href={route.href}
                    target="_blank"
                    rel="noreferrer"
                    className={cn(buttonVariants({ size: "sm", variant: "outline" }))}
                  >
                    {route.label}
                    <ArrowRight className="h-4 w-4" />
                  </a>
                ) : (
                  <Link key={`${preset.kind}-${route.href}`} href={route.href} className={cn(buttonVariants({ size: "sm", variant: "outline" }))}>
                    {route.label}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                ),
              )}
            </div>
          </div>

          <div className="rounded-3xl border border-white/8 bg-black/20 p-4 text-sm leading-7 text-white/60">
            {status === "copied"
              ? "Request packet copied. You can now continue inside the product or paste it into Discord."
              : status === "downloaded"
                ? "Request packet downloaded. Keep it with your pilot or support conversation."
                : "Fill the required fields, then copy or download the request packet before continuing into the recommended route."}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
