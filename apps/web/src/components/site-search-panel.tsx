"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, Search, Sparkles } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { siteSearchItems } from "@/lib/site-search";
import { getAssistantSuggestion } from "@/lib/search-assistant";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function SiteSearchPanel() {
  const [query, setQuery] = useState("");

  const results = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return siteSearchItems;
    return siteSearchItems.filter((item) =>
      [item.title, item.summary, item.category].some((field) => field.toLowerCase().includes(normalized)),
    );
  }, [query]);
  const suggestion = useMemo(() => getAssistantSuggestion(query), [query]);
  const primaryIsExternal = suggestion.primaryActionHref.startsWith("http");

  return (
    <div className="grid gap-6">
      <Card className="border-white/10 bg-[linear-gradient(180deg,rgba(10,16,32,0.94),rgba(7,11,23,0.98))]">
        <CardHeader>
          <CardTitle>Search or ask AI</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-5 xl:grid-cols-[1.06fr_0.94fr]">
          <div className="space-y-4">
            <div className="flex items-center gap-3 rounded-3xl border border-white/10 bg-white/4 px-4 py-3">
              <Search className="h-4 w-4 text-cyan-200" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search routes, docs, tracks, proof packets, wallets, or services"
                className="w-full bg-transparent text-sm text-white outline-none placeholder:text-white/34"
              />
            </div>
            <div className="text-xs uppercase tracking-[0.24em] text-white/42">
              {results.length} result{results.length === 1 ? "" : "s"}
            </div>
            <div className="rounded-3xl border border-white/8 bg-black/20 p-4 text-sm leading-7 text-white/58">
              Ask in natural language: “best wallet for consumer demo”, “judge path for privacy track”, “QuickNode submission route”, “what is blocking privacy track mainnet?”, or “what is the fastest paid motion for QuickNode track?”.
            </div>
          </div>

          <div className="rounded-3xl border border-cyan-300/16 bg-cyan-300/[0.08] p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-cyan-300/20 bg-cyan-300/10 text-cyan-100">
                <Sparkles className="h-4 w-4" />
              </div>
              <div>
                <div className="text-[11px] uppercase tracking-[0.28em] text-cyan-100/75">AI routing answer</div>
                <div className="mt-2 text-lg font-medium text-white">{suggestion.title}</div>
              </div>
            </div>
            <p className="mt-4 text-sm leading-7 text-white/68">{suggestion.summary}</p>
            <div className="mt-5 flex flex-wrap gap-3">
              {primaryIsExternal ? (
                <a className={cn(buttonVariants({ size: "sm" }))} href={suggestion.primaryActionHref} target="_blank" rel="noreferrer">
                  {suggestion.primaryActionLabel}
                  <ArrowRight className="h-4 w-4" />
                </a>
              ) : (
                <Link className={cn(buttonVariants({ size: "sm" }))} href={suggestion.primaryActionHref}>
                  {suggestion.primaryActionLabel}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              )}
              {suggestion.relatedRoutes.map((route) => (
                route.href.startsWith("http") ? (
                  <a
                    key={`${suggestion.title}-${route.href}`}
                    className={cn(buttonVariants({ size: "sm", variant: "outline" }))}
                    href={route.href}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {route.label}
                  </a>
                ) : (
                  <Link
                    key={`${suggestion.title}-${route.href}`}
                    className={cn(buttonVariants({ size: "sm", variant: "outline" }))}
                    href={route.href}
                  >
                    {route.label}
                  </Link>
                )
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4">
        {results.map((item) => (
          <Link
            key={`${item.category}-${item.href}`}
            href={item.href}
            className="rounded-3xl border border-white/10 bg-white/4 p-5 transition hover:border-cyan-300/20 hover:bg-cyan-300/8"
          >
            <div className="flex items-center justify-between gap-4">
              <div className="text-sm font-medium text-white">{item.title}</div>
              <div className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-[11px] uppercase tracking-[0.22em] text-white/52">
                {item.category}
              </div>
            </div>
            <div className="mt-3 text-sm leading-7 text-white/58">{item.summary}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
