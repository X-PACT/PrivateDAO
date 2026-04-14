"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { LockKeyhole, Search, Sparkles } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { useSiteUrls } from "@/lib/site-urls";
import { cn } from "@/lib/utils";

const WalletConnectButton = dynamic(
  () => import("@/components/wallet-connect-button").then((mod) => mod.WalletConnectButton),
  {
    ssr: false,
    loading: () => (
      <div className="wallet-adapter-shell">
        <button
          type="button"
          className="wallet-adapter-button wallet-adapter-button-trigger"
          aria-label="Connect wallet"
        >
          Select Wallet
        </button>
      </div>
    ),
  },
);

const navItems = [
  { href: "/learn", label: "Learn" },
  { href: "/developers", label: "Developers" },
  { href: "/products", label: "Products" },
  { href: "/network", label: "Network" },
  { href: "/community", label: "Community" },
];

const utilityNav = [
  { href: "/documents", label: "Docs" },
  { href: "/services", label: "Plans & API" },
  { href: "/govern", label: "Govern" },
  { href: "/demo", label: "Demo" },
  { href: "/live", label: "Live State" },
  { href: "/trust", label: "Trust" },
  { href: "/assistant", label: "Get Support" },
];

export function SiteHeader() {
  const { liveSiteUrl } = useSiteUrls();

  return (
    <header className="sticky top-0 z-40 border-b border-white/8 bg-[#050816]/75 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-start justify-between gap-4 sm:items-center">
          <Link href="/" className="group flex min-w-0 items-center gap-0">
            <div className="min-w-0">
              <div className="flex flex-nowrap items-center gap-0.5 whitespace-nowrap text-lg font-semibold tracking-tight text-white sm:text-2xl">
                <span>PrivateD</span>
                <span className="inline-block bg-[linear-gradient(135deg,#14f195,#00c2ff,#9945ff)] bg-clip-text text-[1.3rem] font-black text-transparent drop-shadow-[0_0_20px_rgba(20,241,149,0.42)] animate-pulse sm:text-[1.7rem]">
                  △
                </span>
                <span>O</span>
              </div>
              <div className="mt-1 hidden items-center gap-2 text-[11px] uppercase tracking-[0.24em] text-white/42 lg:flex">
                <LockKeyhole className="h-3.5 w-3.5 text-cyan-200/80" />
                <span>Solana private governance, proof, diagnostics, and services</span>
              </div>
            </div>
          </Link>

          <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
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
              <Sparkles className="h-4 w-4" />
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

        <nav className="no-scrollbar flex items-center gap-1.5 overflow-x-auto border-t border-white/6 pt-3 pb-1">
          {navItems.map((item) => (
            <Link
              className={cn(buttonVariants({ size: "sm", variant: "ghost" }), "shrink-0 px-3 text-white/72")}
              href={item.href}
              key={item.href}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex flex-col gap-3 border-t border-white/6 pt-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex min-w-0 items-center gap-2 rounded-full border border-white/10 bg-white/4 px-4 py-2 text-sm text-white/62">
            <Search className="h-4 w-4 text-cyan-200" />
            <Link href="/search" className="truncate">
              Search or ask AI
            </Link>
            <span className="ml-auto hidden rounded-full border border-white/10 bg-black/20 px-2 py-0.5 text-[11px] uppercase tracking-[0.18em] text-white/38 sm:inline-flex">
              ⌘K
            </span>
          </div>

          <nav className="no-scrollbar flex items-center gap-1.5 overflow-x-auto pb-1">
            {utilityNav.map((item) => (
              <Link
                className={cn(buttonVariants({ size: "sm", variant: "ghost" }), "shrink-0 px-3 text-white/68")}
                href={item.href}
                key={item.href}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
}
