import Link from "next/link";
import { MessageSquareMore, Trophy, Youtube } from "lucide-react";

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
          <div className="rounded-3xl border border-white/10 bg-black/20 p-4 text-sm leading-7 text-white/58">
            This route is where public community links, awards, videos, and future Discord activity belong. It keeps the social layer visible without mixing it into proof-heavy pages.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
