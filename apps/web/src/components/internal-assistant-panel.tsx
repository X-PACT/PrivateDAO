"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, BanknoteArrowDown, BrainCircuit, Coins, Compass, FileText, LockKeyhole, Search, ShieldCheck, Sparkles, Wallet, WalletCards } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { getAssistantSuggestion } from "@/lib/search-assistant";
import { cn } from "@/lib/utils";

const assistantPaths = [
  {
    title: "I want the easiest start",
    summary: "Open the onboarding path, connect a wallet, and move into the guided govern flow.",
    href: "/start",
    icon: Compass,
  },
  {
    title: "I am a judge",
    summary: "Open the shortest proof route, V3 packet, and trust docs without digging.",
    href: "/proof/?judge=1",
    icon: Sparkles,
  },
  {
    title: "I need security and cryptography",
    summary: "Go straight to the ZK matrix, confidence engine, and policy composer.",
    href: "/security",
    icon: ShieldCheck,
  },
  {
    title: "I need AI-powered governance analysis",
    summary: "Open the intelligence layer for Proposal Review AI, Treasury Review AI, Voting Summary, RPC Analyzer, and Gaming AI.",
    href: "/intelligence",
    icon: BrainCircuit,
  },
  {
    title: "I need docs fast",
    summary: "Use the in-app document library or the broader repo viewer.",
    href: "/documents",
    icon: FileText,
  },
  {
    title: "I need the right wallet flow",
    summary: "Use Solflare-first onboarding and continue into the govern flow.",
    href: "/start",
    icon: Wallet,
  },
  {
    title: "I need the clearest product route",
    summary: "Open the learning path first, then move into start, judge, proof, or services without passing through internal track pages.",
    href: "/learn",
    icon: Sparkles,
  },
  {
    title: "I want the community channels",
    summary: "Open Discord, YouTube, and the public community route without mixing them into proof or operator pages.",
    href: "/community",
    icon: Compass,
  },
];

type OpenRouterMessage = {
  role: "system" | "user";
  content: string;
};

type OpenRouterChoice = {
  message?: {
    content?: string;
  };
};

type OpenRouterResponse = {
  choices?: OpenRouterChoice[];
  error?: {
    message?: string;
  };
};

export function InternalAssistantPanel() {
  const [query, setQuery] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [liveAnswer, setLiveAnswer] = useState("");
  const [liveStatus, setLiveStatus] = useState<"idle" | "running" | "ready" | "error">("idle");
  const [liveError, setLiveError] = useState("");
  const suggestion = useMemo(() => getAssistantSuggestion(query), [query]);
  const primaryIsExternal = suggestion.primaryActionHref.startsWith("http");
  const liveAiEnabled = apiKey.trim().length > 12;

  useEffect(() => {
    const stored = window.sessionStorage.getItem("privatedao-openrouter-key");
    if (stored) setApiKey(stored);
  }, []);

  function updateApiKey(value: string) {
    setApiKey(value);
    if (value.trim()) {
      window.sessionStorage.setItem("privatedao-openrouter-key", value.trim());
    } else {
      window.sessionStorage.removeItem("privatedao-openrouter-key");
    }
  }

  async function askLiveAssistant() {
    const prompt = query.trim();
    if (!prompt || !liveAiEnabled) return;

    setLiveStatus("running");
    setLiveError("");
    setLiveAnswer("");

    const messages: OpenRouterMessage[] = [
      {
        role: "system",
        content:
          "You are PrivateDAO's product guide. Answer in clear product language. Start with Problem, then Solution, then Next click. Never claim mainnet readiness, real custody closure, or completed wallet signatures unless the user provides proof. Prefer routes: /start, /learn, /govern, /intelligence, /treasury, /payroll, /gaming, /compliance, /proof, /services, /assistant.",
      },
      {
        role: "user",
        content: `User question: ${prompt}\nDeterministic route suggestion: ${suggestion.title} - ${suggestion.summary}\nPrimary route: ${suggestion.primaryActionHref}`,
      },
    ];

    try {
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey.trim()}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://privatedao.org",
          "X-Title": "PrivateDAO Product Assistant",
        },
        body: JSON.stringify({
          model: "openai/gpt-4.1-mini",
          messages,
          temperature: 0.2,
          max_tokens: 420,
        }),
      });

      const data = (await response.json()) as OpenRouterResponse;
      if (!response.ok) {
        throw new Error(data.error?.message ?? `OpenRouter returned HTTP ${response.status}`);
      }

      const content = data.choices?.[0]?.message?.content?.trim();
      if (!content) throw new Error("OpenRouter returned an empty assistant response.");
      setLiveAnswer(content);
      setLiveStatus("ready");
    } catch (error) {
      setLiveStatus("error");
      setLiveError(error instanceof Error ? error.message : "Live assistant failed.");
    }
  }

  const deterministicProblem = query.trim()
    ? "The user needs the right PrivateDAO route without understanding the full Solana, privacy, proof, and treasury stack first."
    : "A new visitor needs a safe starting point before choosing governance, treasury, payroll, gaming, compliance, or proof.";

  return (
    <div className="grid gap-6 xl:grid-cols-[1.02fr_0.98fr]">
      <Card className="border-white/10 bg-[linear-gradient(180deg,rgba(10,16,32,0.94),rgba(7,11,23,0.98))]">
        <CardHeader>
          <CardTitle>PrivateDAO product assistant</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5 text-sm leading-7 text-white/62">
          <div className="flex items-center gap-3 rounded-3xl border border-white/10 bg-white/4 px-4 py-3">
            <Search className="h-4 w-4 text-cyan-200" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Describe the problem: private payroll, DAO vote, treasury risk, QVAC AI, proof, wallet setup..."
              className="w-full bg-transparent text-sm text-white outline-none placeholder:text-white/34"
            />
          </div>
          <div className="rounded-3xl border border-white/8 bg-white/4 p-5">
            <div className="text-[11px] uppercase tracking-[0.28em] text-cyan-100/72">Problem</div>
            <p className="mt-2 text-sm leading-7 text-white/62">{deterministicProblem}</p>
            <div className="mt-4 text-[11px] uppercase tracking-[0.28em] text-emerald-100/72">Solution</div>
            <p className="mt-2 text-sm leading-7 text-white/62">
              PrivateDAO turns that intent into a route-aware answer, then sends the user to the exact page where the action can be reviewed, signed, and verified.
            </p>
          </div>
          <div className="rounded-3xl border border-white/8 bg-black/20 p-4 text-sm leading-7 text-white/58">
            Try: “I need to pay payroll privately”, “explain QVAC”, “show proof after a vote”, “treasury review”, “custody proof”, “reviewer packet”, or “what should a judge click first?”.
          </div>
          <div className="rounded-3xl border border-violet-300/16 bg-violet-300/[0.07] p-5">
            <div className="text-[11px] uppercase tracking-[0.28em] text-violet-100/72">Optional live AI guide</div>
            <p className="mt-2 text-sm leading-7 text-white/60">
              For production demos, add an OpenRouter key in this browser session. The key is stored only in sessionStorage and is never committed to the repository.
            </p>
            <div className="mt-4 flex flex-col gap-3 sm:flex-row">
              <input
                value={apiKey}
                onChange={(event) => updateApiKey(event.target.value)}
                placeholder="OpenRouter API key for this browser session"
                type="password"
                className="min-h-11 flex-1 rounded-2xl border border-white/10 bg-black/20 px-4 text-sm text-white outline-none placeholder:text-white/34"
              />
              <button
                type="button"
                onClick={askLiveAssistant}
                disabled={!query.trim() || !liveAiEnabled || liveStatus === "running"}
                className={cn(buttonVariants({ size: "sm", variant: "secondary" }), "min-h-11 disabled:cursor-not-allowed disabled:opacity-50")}
              >
                {liveStatus === "running" ? "Thinking..." : "Ask live AI"}
              </button>
            </div>
            {liveStatus === "ready" ? (
              <div className="mt-4 whitespace-pre-wrap rounded-2xl border border-white/10 bg-black/25 p-4 text-sm leading-7 text-white/70">
                {liveAnswer}
              </div>
            ) : null}
            {liveStatus === "error" ? (
              <div className="mt-4 rounded-2xl border border-red-300/20 bg-red-300/[0.08] p-4 text-sm leading-7 text-red-100/80">
                {liveError}
              </div>
            ) : null}
          </div>
          <div className="grid gap-4">
            {assistantPaths.map((path) => {
              const Icon = path.icon;
              return (
                <Link key={path.title} href={path.href} className="rounded-3xl border border-white/10 bg-white/4 p-5 transition hover:border-cyan-300/20 hover:bg-cyan-300/8">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/8 bg-black/20 text-cyan-200">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="text-base font-medium text-white">{path.title}</div>
                  </div>
                  <div className="mt-3 text-sm leading-7 text-white/58">{path.summary}</div>
                </Link>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card className="border-white/10 bg-white/[0.03]">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-cyan-300/20 bg-cyan-300/10 text-cyan-100">
              <Sparkles className="h-5 w-5" />
            </div>
            <CardTitle>Recommended fast routes</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-3xl border border-cyan-300/16 bg-cyan-300/[0.08] p-5">
            <div className="text-[11px] uppercase tracking-[0.28em] text-cyan-100/72">AI routing answer</div>
            <div className="mt-3 text-lg font-medium text-white">{suggestion.title}</div>
            <p className="mt-3 text-sm leading-7 text-white/68">{suggestion.summary}</p>
            <div className="mt-4 flex flex-wrap gap-3">
              {primaryIsExternal ? (
                <a href={suggestion.primaryActionHref} target="_blank" rel="noreferrer" className={cn(buttonVariants({ size: "sm" }))}>
                  {suggestion.primaryActionLabel}
                  <ArrowRight className="h-4 w-4" />
                </a>
              ) : (
                <Link href={suggestion.primaryActionHref} className={cn(buttonVariants({ size: "sm" }))}>
                  {suggestion.primaryActionLabel}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              )}
              {suggestion.relatedRoutes.map((route) => (
                route.href.startsWith("http") ? (
                  <a
                    key={`${suggestion.title}-${route.href}`}
                    href={route.href}
                    target="_blank"
                    rel="noreferrer"
                    className={cn(buttonVariants({ size: "sm", variant: "outline" }))}
                  >
                    {route.label}
                  </a>
                ) : (
                  <Link key={`${suggestion.title}-${route.href}`} href={route.href} className={cn(buttonVariants({ size: "sm", variant: "outline" }))}>
                    {route.label}
                  </Link>
                )
              ))}
            </div>
            {suggestion.queryBlock?.kind === "payments-truth" ? (
              <div className="mt-5 rounded-3xl border border-emerald-300/16 bg-emerald-300/[0.07] p-4">
                <div className="text-[11px] uppercase tracking-[0.28em] text-emerald-100/72">
                  {suggestion.queryBlock.title}
                </div>
                <div className="mt-4 grid gap-3">
                  <div className="rounded-2xl border border-white/8 bg-black/20 p-3">
                    <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-white/42">
                      <BanknoteArrowDown className="h-3.5 w-3.5 text-emerald-200/78" />
                      Readiness
                    </div>
                    <div className="mt-2 text-sm font-medium text-white">{suggestion.queryBlock.readiness}</div>
                  </div>
                  <div className="rounded-2xl border border-white/8 bg-black/20 p-3">
                    <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-white/42">
                      <WalletCards className="h-3.5 w-3.5 text-emerald-200/78" />
                      Rails
                    </div>
                    <div className="mt-2 text-sm font-medium text-white">
                      {suggestion.queryBlock.network} · {suggestion.queryBlock.rails}
                    </div>
                  </div>
                  <div className="rounded-2xl border border-white/8 bg-black/20 p-3">
                    <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-white/42">
                      <ShieldCheck className="h-3.5 w-3.5 text-emerald-200/78" />
                      Blocker
                    </div>
                    <div className="mt-2 text-sm font-medium text-white">{suggestion.queryBlock.blocker}</div>
                    <p className="mt-2 text-sm leading-7 text-white/58">{suggestion.queryBlock.blockerSummary}</p>
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap gap-3">
                  <Link href={suggestion.queryBlock.reviewerPacketHref} className={cn(buttonVariants({ size: "sm", variant: "secondary" }))}>
                    {suggestion.queryBlock.reviewerPacketLabel}
                  </Link>
                  <Link href={suggestion.queryBlock.bestRouteHref} className={cn(buttonVariants({ size: "sm", variant: "outline" }))}>
                    {suggestion.queryBlock.bestRouteLabel}
                  </Link>
                </div>
              </div>
            ) : null}
            {suggestion.queryBlock?.kind === "token-truth" ? (
              <div className="mt-5 rounded-3xl border border-fuchsia-300/16 bg-fuchsia-300/[0.07] p-4">
                <div className="text-[11px] uppercase tracking-[0.28em] text-fuchsia-100/72">
                  {suggestion.queryBlock.title}
                </div>
                <div className="mt-4 grid gap-3">
                  <div className="rounded-2xl border border-white/8 bg-black/20 p-3">
                    <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-white/42">
                      <Coins className="h-3.5 w-3.5 text-fuchsia-200/78" />
                      What it is
                    </div>
                    <div className="mt-2 text-sm font-medium text-white">{suggestion.queryBlock.whatItIs}</div>
                  </div>
                  <div className="rounded-2xl border border-white/8 bg-black/20 p-3">
                    <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-white/42">
                      <ShieldCheck className="h-3.5 w-3.5 text-fuchsia-200/78" />
                      What it is not
                    </div>
                    <div className="mt-2 text-sm font-medium text-white">{suggestion.queryBlock.whatItIsNot}</div>
                  </div>
                  <div className="rounded-2xl border border-white/8 bg-black/20 p-3">
                    <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-white/42">
                      <LockKeyhole className="h-3.5 w-3.5 text-fuchsia-200/78" />
                      What it gates
                    </div>
                    <p className="mt-2 text-sm leading-7 text-white/58">{suggestion.queryBlock.gates}</p>
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap gap-3">
                  <Link href={suggestion.queryBlock.bestProofRouteHref} className={cn(buttonVariants({ size: "sm", variant: "secondary" }))}>
                    {suggestion.queryBlock.bestProofRouteLabel}
                  </Link>
                  <Link href={suggestion.queryBlock.tokenSurfaceHref} className={cn(buttonVariants({ size: "sm", variant: "outline" }))}>
                    {suggestion.queryBlock.tokenSurfaceLabel}
                  </Link>
                </div>
              </div>
            ) : null}
          </div>
          <Link href="/search" className={cn(buttonVariants({ size: "sm", variant: "secondary" }), "w-full")}>
            Open site search
          </Link>
          <Link href="/story" className={cn(buttonVariants({ size: "sm", variant: "secondary" }), "w-full")}>
            Open story video
          </Link>
          <Link href="/live" className={cn(buttonVariants({ size: "sm", variant: "outline" }), "w-full")}>
            Open activity
          </Link>
          <Link href="/learn" className={cn(buttonVariants({ size: "sm", variant: "outline" }), "w-full")}>
            Open learning path
          </Link>
          <div className="rounded-3xl border border-white/10 bg-black/20 p-4 text-sm leading-7 text-white/58">
            Best wallet for the current surface: <span className="text-white">Solflare</span>. Keep Phantom as a fallback for judges who expect it.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
