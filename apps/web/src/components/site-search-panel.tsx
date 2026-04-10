"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";

import { siteSearchItems } from "@/lib/site-search";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function SiteSearchPanel() {
  const [query, setQuery] = useState("");

  const results = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return siteSearchItems;
    return siteSearchItems.filter((item) =>
      [item.title, item.summary, item.category].some((field) => field.toLowerCase().includes(normalized)),
    );
  }, [query]);

  return (
    <div className="grid gap-6">
      <Card className="border-white/10 bg-[linear-gradient(180deg,rgba(10,16,32,0.94),rgba(7,11,23,0.98))]">
        <CardHeader>
          <CardTitle>Search the product surface</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3 rounded-3xl border border-white/10 bg-white/4 px-4 py-3">
            <Search className="h-4 w-4 text-cyan-200" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search routes, docs, tracks, proof packets, or services"
              className="w-full bg-transparent text-sm text-white outline-none placeholder:text-white/34"
            />
          </div>
          <div className="text-xs uppercase tracking-[0.24em] text-white/42">
            {results.length} result{results.length === 1 ? "" : "s"}
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
