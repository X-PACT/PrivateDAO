"use client";

import Link from "next/link";
import { Bot, Search } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { useSiteUrls } from "@/lib/site-urls";
import { cn } from "@/lib/utils";
import { WalletConnectButton } from "@/components/wallet-connect-button";

const navItems = [
  { href: "/", label: "Overview" },
  { href: "/start", label: "Start" },
  { href: "/assistant", label: "Assistant" },
  { href: "/story", label: "Story" },
  { href: "/command-center", label: "Command Center" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/proof", label: "Proof" },
  { href: "/documents", label: "Documents" },
  { href: "/security", label: "Security" },
  { href: "/services", label: "Services" },
  { href: "/tracks", label: "Tracks" },
];

export function SiteHeader() {
  const { liveSiteUrl } = useSiteUrls();

  return (
    <header className="sticky top-0 z-40 border-b border-white/8 bg-[#050816]/75 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4">
          <Link href="/" className="group flex min-w-0 items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-amber-300/20 bg-[radial-gradient(circle_at_top,#ffdf80,#ffb100_58%,#9f5a00)] text-base font-black text-slate-950 shadow-[0_14px_36px_rgba(255,177,0,0.22)] transition-transform duration-300 group-hover:scale-[1.03]">
              △
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <div className="text-lg font-semibold tracking-tight text-white">PrivateDAO</div>
                <span className="rounded-full border border-emerald-300/20 bg-emerald-300/10 px-2.5 py-1 text-[10px] uppercase tracking-[0.24em] text-emerald-200">
                  1st Place · Superteam Poland
                </span>
              </div>
              <div className="truncate text-[11px] uppercase tracking-[0.28em] text-white/42">
                Solana private governance, proof, diagnostics, and services
              </div>
            </div>
          </Link>

          <div className="flex shrink-0 items-center gap-2">
            <Link
              href="/search"
              className={cn(buttonVariants({ size: "sm", variant: "ghost" }), "h-10 w-10 rounded-full p-0 text-white/72")}
              aria-label="Search site"
            >
              <Search className="h-4 w-4" />
            </Link>
            <Link
              href="/assistant"
              className={cn(buttonVariants({ size: "sm", variant: "ghost" }), "h-10 w-10 rounded-full p-0 text-white/72")}
              aria-label="Open assistant"
            >
              <Bot className="h-4 w-4" />
            </Link>
            <a
              className={cn(buttonVariants({ size: "sm", variant: "secondary" }), "hidden xl:inline-flex")}
              href={liveSiteUrl}
              rel="noreferrer"
              target="_blank"
            >
              Live Surface
            </a>
            <WalletConnectButton />
          </div>
        </div>

        <nav className="flex flex-wrap items-center gap-1.5 border-t border-white/6 pt-3">
          {navItems.map((item) => (
            <Link
              className={cn(buttonVariants({ size: "sm", variant: "ghost" }), "px-3 text-white/72")}
              href={item.href}
              key={item.href}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
