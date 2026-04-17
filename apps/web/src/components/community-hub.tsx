import Link from "next/link";
import { ArrowRight, Download, LifeBuoy, MessageSquareMore, Rocket, Trophy, Youtube } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { communityLinks } from "@/lib/site-data";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const iconMap = {
  YouTube: Youtube,
  Discord: MessageSquareMore,
} as const;

export function CommunityHub() {
  return (
    <div className="grid gap-6">
      <Card className="border-white/10 bg-[linear-gradient(180deg,rgba(10,16,32,0.94),rgba(7,11,23,0.98))]">
        <CardHeader>
          <CardTitle>Join, learn, try, verify</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 xl:grid-cols-4">
          <a
            href="https://discord.gg/PbM8BC2A"
            target="_blank"
            rel="noreferrer"
            className="group rounded-3xl border border-cyan-300/16 bg-cyan-300/[0.08] p-5 transition hover:border-cyan-300/30 hover:bg-cyan-300/[0.12]"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-cyan-300/18 bg-black/20 text-cyan-100">
                <MessageSquareMore className="h-5 w-5" />
              </div>
              <ArrowRight className="mt-1 h-4 w-4 text-cyan-200 transition group-hover:translate-x-0.5" />
            </div>
            <div className="mt-4 text-lg font-medium text-white">Join Discord</div>
            <div className="mt-3 text-sm leading-7 text-white/62">
              Enter the live server for onboarding help, announcements, walkthroughs, feedback, and real-time operator discussion.
            </div>
          </a>

          <Link
            href="/learn"
            className="group rounded-3xl border border-white/10 bg-white/4 p-5 transition hover:border-violet-300/24 hover:bg-white/6"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-violet-300/18 bg-black/20 text-violet-100">
                <Youtube className="h-5 w-5" />
              </div>
              <ArrowRight className="mt-1 h-4 w-4 text-violet-200 transition group-hover:translate-x-0.5" />
            </div>
            <div className="mt-4 text-lg font-medium text-white">Learn PrivateDAO</div>
            <div className="mt-3 text-sm leading-7 text-white/62">
              Start with the plain-language guide to understand private governance, treasury rails, RPC, APIs, ZK, and the product stack before you touch the wallet flow.
            </div>
          </Link>

          <Link
            href="/start"
            className="group rounded-3xl border border-emerald-300/16 bg-emerald-300/[0.08] p-5 transition hover:border-emerald-300/30 hover:bg-emerald-300/[0.12]"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-emerald-300/18 bg-black/20 text-emerald-100">
                <Rocket className="h-5 w-5" />
              </div>
              <ArrowRight className="mt-1 h-4 w-4 text-emerald-200 transition group-hover:translate-x-0.5" />
            </div>
            <div className="mt-4 text-lg font-medium text-white">Try Devnet</div>
            <div className="mt-3 text-sm leading-7 text-white/62">
              Connect a Devnet wallet, create a DAO, submit a proposal, vote, reveal, and execute from the browser without terminal work.
            </div>
          </Link>

          <Link
            href="/judge"
            className="group rounded-3xl border border-amber-300/16 bg-amber-300/[0.08] p-5 transition hover:border-amber-300/30 hover:bg-amber-300/[0.12]"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-amber-300/18 bg-black/20 text-amber-100">
                <LifeBuoy className="h-5 w-5" />
              </div>
              <ArrowRight className="mt-1 h-4 w-4 text-amber-200 transition group-hover:translate-x-0.5" />
            </div>
            <div className="mt-4 text-lg font-medium text-white">Verify in Judge</div>
            <div className="mt-3 text-sm leading-7 text-white/62">
              Open the shortest reviewer path for lifecycle proof, transaction hashes, execution status, and the Agentic Treasury Micropayment Rail.
            </div>
          </Link>
        </CardContent>
      </Card>

      <div className="grid gap-6 xl:grid-cols-[1.02fr_0.98fr]">
      <Card className="border-white/10 bg-[linear-gradient(180deg,rgba(10,16,32,0.94),rgba(7,11,23,0.98))]">
        <CardHeader>
          <CardTitle>Community channels</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          {communityLinks.map((item) => {
            const Icon = iconMap[item.title as keyof typeof iconMap] ?? MessageSquareMore;
            const isExternal = item.href.startsWith("http");

            const button = isExternal ? (
              <a
                className={cn(buttonVariants({ size: "sm" }), "w-full")}
                href={item.href}
                target="_blank"
                rel="noreferrer"
              >
                {item.cta}
              </a>
            ) : (
              <div className="rounded-full border border-white/10 bg-white/6 px-4 py-2 text-center text-xs uppercase tracking-[0.22em] text-white/46">
                {item.cta}
              </div>
            );

            return (
              <div key={item.title} className="rounded-3xl border border-white/10 bg-white/4 p-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/8 bg-black/20 text-cyan-200">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="text-lg font-medium text-white">{item.title}</div>
                </div>
                <div className="mt-3 text-sm leading-7 text-white/58">{item.summary}</div>
                <div className="mt-4">{button}</div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      <div className="grid gap-6">
        <Card className="border-white/10 bg-white/[0.03]">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-amber-300/18 bg-amber-300/10 text-amber-100">
                <Trophy className="h-5 w-5" />
              </div>
              <CardTitle>Get help and start</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="grid gap-3">
            <Link href="/learn" className={cn(buttonVariants({ size: "sm" }), "w-full")}>
              Open the learning guide
            </Link>
            <Link href="/start" className={cn(buttonVariants({ size: "sm", variant: "secondary" }), "w-full")}>
              Open the Devnet start route
            </Link>
            <Link href="/assistant" className={cn(buttonVariants({ size: "sm", variant: "outline" }), "w-full")}>
              Open support routing
            </Link>
            <Link href="/govern" className={cn(buttonVariants({ size: "sm", variant: "outline" }), "w-full")}>
              Open govern flow
            </Link>
            <Link href="/services" className={cn(buttonVariants({ size: "sm", variant: "outline" }), "w-full")}>
              Open services
            </Link>
            <Link href="/engage" className={cn(buttonVariants({ size: "sm", variant: "secondary" }), "w-full")}>
              Open pilot and buyer path
            </Link>
            <div className="rounded-3xl border border-white/10 bg-black/20 p-4 text-sm leading-7 text-white/58">
              If a visitor gets blocked, the recovery path should stay obvious: ask in Discord, reopen the learning guide, or return to the browser-first Devnet flow.
            </div>
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-[linear-gradient(180deg,rgba(10,16,32,0.94),rgba(7,11,23,0.98))]">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-cyan-300/18 bg-cyan-300/10 text-cyan-100">
                <Rocket className="h-5 w-5" />
              </div>
              <CardTitle>Brand pack</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="grid gap-3">
            <Link href="/story" className={cn(buttonVariants({ size: "sm", variant: "outline" }), "w-full")}>
              Open story video
            </Link>
            <Link href="/awards" className={cn(buttonVariants({ size: "sm", variant: "secondary" }), "w-full")}>
              Open achievements
            </Link>
            <a
              href="https://arena.colosseum.org/projects/explore/praivatedao"
              target="_blank"
              rel="noreferrer"
              className={cn(buttonVariants({ size: "sm", variant: "outline" }), "w-full")}
            >
              Open Colosseum project
            </a>
            <a
              href="/assets/brand/privatedao-avatar-1024.png"
              target="_blank"
              rel="noreferrer"
              className={cn(buttonVariants({ size: "sm" }), "w-full")}
            >
              Download 1024 avatar
              <Download className="h-4 w-4" />
            </a>
            <a
              href="/assets/brand/privatedao-avatar.svg"
              target="_blank"
              rel="noreferrer"
              className={cn(buttonVariants({ size: "sm", variant: "secondary" }), "w-full")}
            >
              Open SVG master
              <Download className="h-4 w-4" />
            </a>
            <Link href="/viewer/brand-kit/" className={cn(buttonVariants({ size: "sm", variant: "outline" }), "w-full")}>
              Open brand kit
            </Link>
            <div className="rounded-3xl border border-white/10 bg-black/20 p-4 text-sm leading-7 text-white/58">
              Use the same avatar pack across Discord, X, Telegram, YouTube, and profile surfaces instead of ad-hoc crops.
            </div>
          </CardContent>
        </Card>
      </div>
      </div>
    </div>
  );
}
