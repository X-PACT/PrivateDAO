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
          <CardTitle>Join, update, pilot, operate</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 xl:grid-cols-4">
          <a
            href="https://discord.gg/bC76YEcpDa"
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
            <div className="mt-4 text-lg font-medium text-white">Join the server</div>
            <div className="mt-3 text-sm leading-7 text-white/62">
              Enter the live Discord for announcements, demos, feedback, and operator discussion.
            </div>
          </a>

          <Link
            href="/story"
            className="group rounded-3xl border border-white/10 bg-white/4 p-5 transition hover:border-violet-300/24 hover:bg-white/6"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-violet-300/18 bg-black/20 text-violet-100">
                <Youtube className="h-5 w-5" />
              </div>
              <ArrowRight className="mt-1 h-4 w-4 text-violet-200 transition group-hover:translate-x-0.5" />
            </div>
            <div className="mt-4 text-lg font-medium text-white">Follow updates</div>
            <div className="mt-3 text-sm leading-7 text-white/62">
              Watch the story reel, new demo drops, and public product momentum from the same route.
            </div>
          </Link>

          <Link
            href="/engage?profile=pilot-funding"
            className="group rounded-3xl border border-emerald-300/16 bg-emerald-300/[0.08] p-5 transition hover:border-emerald-300/30 hover:bg-emerald-300/[0.12]"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-emerald-300/18 bg-black/20 text-emerald-100">
                <Rocket className="h-5 w-5" />
              </div>
              <ArrowRight className="mt-1 h-4 w-4 text-emerald-200 transition group-hover:translate-x-0.5" />
            </div>
            <div className="mt-4 text-lg font-medium text-white">Start a pilot</div>
            <div className="mt-3 text-sm leading-7 text-white/62">
              Move from community interest to buyer path, pilot packaging, and mainnet-aware rollout.
            </div>
          </Link>

          <Link
            href="/assistant"
            className="group rounded-3xl border border-amber-300/16 bg-amber-300/[0.08] p-5 transition hover:border-amber-300/30 hover:bg-amber-300/[0.12]"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-amber-300/18 bg-black/20 text-amber-100">
                <LifeBuoy className="h-5 w-5" />
              </div>
              <ArrowRight className="mt-1 h-4 w-4 text-amber-200 transition group-hover:translate-x-0.5" />
            </div>
            <div className="mt-4 text-lg font-medium text-white">Get support or operate</div>
            <div className="mt-3 text-sm leading-7 text-white/62">
              Route directly into support, search, or the live govern flow when the user is ready to act.
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
              <CardTitle>Community-ready routes</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="grid gap-3">
            <Link href="/awards" className={cn(buttonVariants({ size: "sm" }), "w-full")}>
              Open achievements
            </Link>
            <Link href="/tracks" className={cn(buttonVariants({ size: "sm", variant: "secondary" }), "w-full")}>
              Open competition center
            </Link>
            <Link href="/story" className={cn(buttonVariants({ size: "sm", variant: "outline" }), "w-full")}>
              Open story video
            </Link>
            <Link href="/engage" className={cn(buttonVariants({ size: "sm", variant: "secondary" }), "w-full")}>
              Open buyer path
            </Link>
            <Link href="/govern" className={cn(buttonVariants({ size: "sm", variant: "outline" }), "w-full")}>
              Open govern flow
            </Link>
            <Link href="/services" className={cn(buttonVariants({ size: "sm", variant: "outline" }), "w-full")}>
              Open services
            </Link>
            <Link href="/assistant" className={cn(buttonVariants({ size: "sm", variant: "outline" }), "w-full")}>
              Open support routing
            </Link>
            <a
              href="https://arena.colosseum.org/projects/explore/praivatedao"
              target="_blank"
              rel="noreferrer"
              className={cn(buttonVariants({ size: "sm", variant: "outline" }), "w-full")}
            >
              Open Colosseum project
            </a>
            <div className="rounded-3xl border border-white/10 bg-black/20 p-4 text-sm leading-7 text-white/58">
              This route keeps public community links, awards, videos, buyer routing, and operator entry visible without mixing them into proof-heavy pages.
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
