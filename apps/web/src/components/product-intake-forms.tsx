"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Clipboard, Download, Headset, Rocket, ServerCog, WalletCards } from "lucide-react";

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
  routeSet: Array<{ label: string; href: string }>;
};

const intakePresets: IntakePreset[] = [
  {
    kind: "pilot",
    label: "Start a pilot",
    title: "Pilot request",
    summary: "For teams ready to explore a real pilot path around governance, trust packaging, and mainnet-aware rollout.",
    icon: Rocket,
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
    routeSet: [
      { label: "Assistant", href: "/assistant" },
      { label: "Diagnostics", href: "/diagnostics" },
      { label: "Discord", href: "https://discord.gg/bC76YEcpDa" },
    ],
  },
];

type ProductIntakeFormsProps = {
  mode: IntakeMode;
};

function buildPacket(params: {
  preset: IntakePreset;
  mode: IntakeMode;
  name: string;
  org: string;
  contact: string;
  timeline: string;
  useCase: string;
}) {
  const { preset, mode, name, org, contact, timeline, useCase } = params;
  return [
    `PrivateDAO Intake`,
    `Type: ${preset.title}`,
    `Source Route: ${mode === "engage" ? "Engage" : "Community"}`,
    `Name: ${name || "Not provided"}`,
    `Organization: ${org || "Not provided"}`,
    `Contact: ${contact || "Not provided"}`,
    `Timeline: ${timeline || "Not provided"}`,
    `Use Case: ${useCase || "Not provided"}`,
    `Recommended Next Routes:`,
    ...preset.routeSet.map((route) => `- ${route.label}: ${route.href}`),
  ].join("\n");
}

export function ProductIntakeForms({ mode }: ProductIntakeFormsProps) {
  const [kind, setKind] = useState<IntakeKind>(mode === "engage" ? "pilot" : "support");
  const [name, setName] = useState("");
  const [org, setOrg] = useState("");
  const [contact, setContact] = useState("");
  const [timeline, setTimeline] = useState("");
  const [useCase, setUseCase] = useState("");
  const [status, setStatus] = useState<"idle" | "copied" | "downloaded">("idle");

  const preset = intakePresets.find((item) => item.kind === kind) ?? intakePresets[0];
  const Icon = preset.icon;

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
      }),
    [preset, mode, name, org, contact, timeline, useCase],
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
            <div className="text-[11px] uppercase tracking-[0.24em] text-white/46">Recommended next routes</div>
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
