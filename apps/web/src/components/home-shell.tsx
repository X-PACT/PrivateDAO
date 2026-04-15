"use client";

import Link from "next/link";
import { ArrowRight, CheckCircle2, Compass, PlayCircle, Shield, Trophy } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSiteUrls } from "@/lib/site-urls";
import { cn } from "@/lib/utils";

export function HomeShell() {
  const { judgeViewUrl } = useSiteUrls();
  const storyCards = [
    {
      title: "Start in under a minute",
      description: "Normal users begin from onboarding and wallet connection instead of raw governance controls.",
      href: "/start",
      icon: Compass,
    },
    {
      title: "Judge path stays explicit",
      description: "Proof, V3, trust packet, and runtime surfaces stay one click away from the product shell.",
      href: "/proof/?judge=1",
      icon: Shield,
    },
    {
      title: "Story video is submission-ready",
      description: "The public reel explains the product, cryptography, and commercial corridors in one watch surface.",
      href: "/demo",
      icon: PlayCircle,
    },
  ];
  const fastActionSteps = [
    {
      title: "1. Connect a wallet",
      description: "Start from the onboarding flow and connect a Devnet-ready wallet without guessing which route to open.",
      href: "/start",
      cta: "Open start",
    },
    {
      title: "2. Create and govern",
      description: "Create a DAO, submit a proposal, vote, and execute from one guided governance surface.",
      href: "/govern",
      cta: "Open govern",
    },
    {
      title: "3. Verify the result",
      description: "Check live state, logs, and proof without leaving the product corridor.",
      href: "/live",
      cta: "Open live state",
    },
  ];
  const techBadges = [
    {
      label: "FHE / REFHE",
      tone: "text-emerald-100",
      badgeClass: "border-emerald-300/25 bg-emerald-300/[0.14] text-emerald-100",
      detail: "Confidential treasury and settlement posture.",
    },
    {
      label: "ZK",
      tone: "text-violet-100",
      badgeClass: "border-violet-300/25 bg-violet-300/[0.14] text-violet-100",
      detail: "Verifiable privacy without exposing raw decision data.",
    },
    {
      label: "MagicBlock",
      tone: "text-cyan-100",
      badgeClass: "border-cyan-300/25 bg-cyan-300/[0.14] text-cyan-100",
      detail: "Responsive execution corridor for wallet-first actions.",
    },
    {
      label: "Fast RPC",
      tone: "text-amber-100",
      badgeClass: "border-amber-300/25 bg-amber-300/[0.14] text-amber-100",
      detail: "Reliable live reads, signatures, and action logs.",
    },
  ];
  return (
    <main className="pb-20 sm:pb-24">
      <section className="mx-auto w-full max-w-7xl px-4 pt-8 sm:px-6 sm:pt-12 lg:px-8 lg:pt-18">
        <div className="grid items-start gap-8 xl:grid-cols-[1.14fr_0.86fr] xl:gap-10">
          <div className="space-y-6 sm:space-y-8">
            <div className="flex flex-wrap gap-3">
              <Badge variant="cyan">Private governance on Solana</Badge>
              <Badge variant="violet">Devnet live flow</Badge>
              <Badge variant="success">User-first start</Badge>
            </div>
            <div className="space-y-4 sm:space-y-5">
              <div className="text-[11px] uppercase tracking-[0.34em] text-emerald-300/80">What PrivateDAO does</div>
              <div className="max-w-3xl text-3xl font-semibold tracking-[-0.045em] text-white sm:text-5xl lg:text-[4rem] xl:text-[4.35rem]">
                Create a private Solana DAO, submit a proposal, vote, and execute without leaving one guided wallet flow.
              </div>
              <p className="max-w-2xl text-sm leading-7 text-white/62 sm:text-lg sm:leading-8">
                PrivateDAO turns treasury decisions into a simple Devnet product flow. Start with wallet connection, create a DAO, move into proposals and voting, then inspect live state and proof only when you need more depth.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link className={cn(buttonVariants({ size: "lg" }))} href="/start">
                Start in under a minute
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link className={cn(buttonVariants({ size: "lg", variant: "secondary" }))} href="/govern">
                Open the live governance flow
              </Link>
              <a
                className={cn(buttonVariants({ size: "lg", variant: "outline" }))}
                href={judgeViewUrl}
                rel="noreferrer"
                target="_blank"
              >
                Open judge proof view
              </a>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {techBadges.map((item) => (
                <div key={item.label} className="rounded-[20px] border border-white/10 bg-white/[0.03] px-4 py-3">
                  <Badge className={cn("border text-[10px] uppercase tracking-[0.22em]", item.badgeClass)}>
                    {item.label}
                  </Badge>
                  <div className="mt-2 text-sm leading-6 text-white/62">{item.detail}</div>
                </div>
              ))}
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              {storyCards.map((item) => {
                const Icon = item.icon;

                return (
                  <Link key={item.title} href={item.href} className="group">
                    <div className="h-full rounded-[24px] border border-white/10 bg-[linear-gradient(180deg,rgba(10,15,29,0.94),rgba(6,9,20,0.98))] p-5 transition hover:border-cyan-300/22 hover:bg-[linear-gradient(180deg,rgba(15,22,40,0.95),rgba(8,11,24,0.99))]">
                      <div className="flex h-10 w-10 items-center justify-center rounded-[18px] border border-white/10 bg-white/[0.04] text-cyan-200">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="mt-4 text-base font-medium text-white">{item.title}</div>
                      <p className="mt-2 text-sm leading-7 text-white/56">{item.description}</p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

          <Card className="overflow-hidden border-white/12 bg-[linear-gradient(180deg,rgba(13,18,34,0.94),rgba(7,10,22,0.98))] xl:mt-1">
            <CardHeader>
              <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-emerald-300/15 bg-emerald-300/10 text-emerald-200">
                    <Shield className="h-5 w-5" />
                  </div>
                  <div>
                  <div className="text-[11px] uppercase tracking-[0.28em] text-white/40">Try it now</div>
                  <CardTitle className="mt-2">The shortest path from landing page to a real Devnet action</CardTitle>
                  </div>
                </div>
              </CardHeader>
            <CardContent className="space-y-6">
              <div className="rounded-[24px] border border-white/8 bg-white/[0.03] p-5">
                <div className="text-[11px] uppercase tracking-[0.28em] text-white/42">Use case</div>
                <div className="mt-2 text-2xl font-semibold text-white">Solana Devnet</div>
                <div className="mt-2 text-sm leading-7 text-white/56">
                  Use it when you want a team or community to create a DAO, propose an action, vote privately, and execute from one surface.
                </div>
              </div>

              <div className="grid gap-3">
                {fastActionSteps.map((item) => (
                  <div key={item.title} className="rounded-[24px] border border-white/8 bg-white/[0.03] p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="text-base font-medium text-white">{item.title}</div>
                      <CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-300" />
                    </div>
                    <p className="mt-2 text-sm leading-7 text-white/58">{item.description}</p>
                    <Link className={cn(buttonVariants({ size: "sm", variant: "secondary" }), "mt-4 w-full justify-between")} href={item.href}>
                      {item.cta}
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                ))}
              </div>

              <div className="rounded-[24px] border border-amber-300/18 bg-[linear-gradient(180deg,rgba(61,46,9,0.92),rgba(26,20,5,0.98))] p-4">
                <div className="flex items-center gap-2 text-amber-100">
                  <Trophy className="h-4 w-4" />
                  <div className="text-[11px] uppercase tracking-[0.28em]">Recognition</div>
                </div>
                <div className="mt-2 text-lg font-semibold text-amber-50">1st Place · Superteam Poland</div>
                <div className="mt-2 text-sm leading-7 text-amber-50/70">
                  Strong proof remains available for judges and investors, but the homepage now stays focused on what the product lets a user do first.
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="mx-auto mt-14 w-full max-w-7xl px-4 sm:mt-16 sm:px-6 lg:px-8">
        <div className="grid gap-4 lg:grid-cols-[0.9fr_2.1fr]">
          <div className="rounded-[24px] border border-amber-300/18 bg-[linear-gradient(180deg,rgba(61,46,9,0.92),rgba(26,20,5,0.98))] p-5">
            <div className="flex items-center gap-2 text-amber-100">
              <Trophy className="h-4 w-4" />
              <div className="text-[11px] uppercase tracking-[0.28em]">Recognition</div>
            </div>
            <div className="mt-2 text-lg font-semibold text-amber-50">1st Place · Superteam Poland</div>
            <div className="mt-2 text-sm leading-7 text-amber-50/70">
              Proof remains available, but it no longer dominates the public landing page.
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-[24px] border border-white/8 bg-white/[0.03] p-5 text-sm leading-7 text-white/62">
              PrivateDAO is a wallet-first app for creating a private Solana DAO and running proposals on Devnet.
            </div>
            <div className="rounded-[24px] border border-white/8 bg-white/[0.03] p-5 text-sm leading-7 text-white/62">
              Live state and proof stay available when needed, but they no longer block the first run.
            </div>
            <div className="rounded-[24px] border border-white/8 bg-white/[0.03] p-5 text-sm leading-7 text-white/62">
              Web, Android, and reviewer routes now point to one product story instead of competing shells.
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto mt-14 w-full max-w-7xl px-4 sm:mt-16 sm:px-6 lg:px-8">
        <div className="max-w-3xl space-y-4">
          <div className="text-[11px] font-medium uppercase tracking-[0.34em] text-cyan-200/78">Why it works</div>
          <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">Four systems make the product usable, private, and fast</h2>
          <p className="text-base leading-8 text-white/60 sm:text-lg">
            PrivateDAO is not just a UI shell. It combines privacy, responsive execution, and reliable reads so a real Devnet governance action can move from wallet click to visible result without forcing the user to learn the architecture first.
          </p>
        </div>
        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-[24px] border border-white/8 bg-white/[0.03] p-5">
            <div className="text-[11px] uppercase tracking-[0.24em] text-emerald-300/80">REFHE</div>
            <div className="mt-3 text-lg font-semibold text-white">Confidential settlement posture</div>
            <p className="mt-3 text-sm leading-7 text-white/58">
              REFHE supports the encrypted payout and settlement path so sensitive treasury actions do not depend on plain-text operating flow alone.
            </p>
          </div>
          <div className="rounded-[24px] border border-white/8 bg-white/[0.03] p-5">
            <div className="text-[11px] uppercase tracking-[0.24em] text-violet-200/80">ZK</div>
            <div className="mt-3 text-lg font-semibold text-white">Verifiable privacy proof</div>
            <p className="mt-3 text-sm leading-7 text-white/58">
              Zero-knowledge proof surfaces give judges, partners, and operators a verifiable trust layer without turning the main product route into a proof maze.
            </p>
          </div>
          <div className="rounded-[24px] border border-white/8 bg-white/[0.03] p-5">
            <div className="text-[11px] uppercase tracking-[0.24em] text-cyan-200/80">MagicBlock</div>
            <div className="mt-3 text-lg font-semibold text-white">Responsive execution corridor</div>
            <p className="mt-3 text-sm leading-7 text-white/58">
              MagicBlock gives the product a faster action corridor for treasury and governance execution where slow, clumsy wallet UX would otherwise kill momentum.
            </p>
          </div>
          <div className="rounded-[24px] border border-white/8 bg-white/[0.03] p-5">
            <div className="text-[11px] uppercase tracking-[0.24em] text-amber-200/80">Fast RPC</div>
            <div className="mt-3 text-lg font-semibold text-white">Reliable live state and logs</div>
            <p className="mt-3 text-sm leading-7 text-white/58">
              Fast RPC and hosted reads keep live state, signatures, proposal progress, and execution logs visible so users can tell what really happened after a wallet action.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto mt-18 w-full max-w-7xl px-4 sm:mt-24 sm:px-6 lg:px-8">
        <div className="max-w-3xl space-y-4">
          <div className="text-[11px] font-medium uppercase tracking-[0.34em] text-emerald-300/80">Need more?</div>
          <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">Go deeper only when you need it</h2>
          <p className="text-base leading-8 text-white/60 sm:text-lg">
            The homepage stays focused on using the product. Demo, live state, and trust stay available when you intentionally want more depth.
          </p>
        </div>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          <Card className="border-white/10 bg-[linear-gradient(180deg,rgba(10,15,30,0.92),rgba(6,9,20,0.98))]">
            <CardHeader><CardTitle className="text-xl">Watch the demo</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm leading-7 text-white/58">Open the hosted demo when you want the fast visual explanation.</p>
              <Link className={cn(buttonVariants({ size: "sm", variant: "secondary" }))} href="/story">Open demo</Link>
            </CardContent>
          </Card>
          <Card className="border-white/10 bg-[linear-gradient(180deg,rgba(10,15,30,0.92),rgba(6,9,20,0.98))]">
            <CardHeader><CardTitle className="text-xl">Open live state</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm leading-7 text-white/58">Use the dedicated live state route for proposals, treasury, and execution logs.</p>
              <Link className={cn(buttonVariants({ size: "sm", variant: "secondary" }))} href="/live">Open live state</Link>
            </CardContent>
          </Card>
          <Card className="border-white/10 bg-[linear-gradient(180deg,rgba(10,15,30,0.92),rgba(6,9,20,0.98))]">
            <CardHeader><CardTitle className="text-xl">Open trust surfaces</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm leading-7 text-white/58">Use proof and trust routes for judges, operators, and technical review when needed.</p>
              <Link className={cn(buttonVariants({ size: "sm", variant: "outline" }))} href="/proof">Open proof</Link>
            </CardContent>
          </Card>
        </div>
      </section>
    </main>
  );
}
