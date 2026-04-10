import Link from "next/link";
import { Download, MessageSquareMore, Rocket, Trophy, Youtube } from "lucide-react";

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
            <a
              href="https://arena.colosseum.org/projects/explore/praivatedao"
              target="_blank"
              rel="noreferrer"
              className={cn(buttonVariants({ size: "sm", variant: "outline" }), "w-full")}
            >
              Open Colosseum project
            </a>
            <div className="rounded-3xl border border-white/10 bg-black/20 p-4 text-sm leading-7 text-white/58">
              This route keeps public community links, awards, videos, and future Discord activity visible without mixing them into proof-heavy pages.
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
  );
}
