"use client";

import Link from "next/link";
import { LockKeyhole, Search, Sparkles } from "lucide-react";

import { LanguageSwitcher } from "@/components/language-switcher";
import { WalletConnectButton } from "@/components/wallet-connect-button";
import { useI18n } from "@/components/i18n-provider";
import { buttonVariants } from "@/components/ui/button";
import { useSiteUrls } from "@/lib/site-urls";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/start", label: "Start" },
  { href: "/learn", label: "Learn" },
  { href: "/govern", label: "Govern", rel: "nofollow" },
  { href: "/live", label: "Live State", rel: "nofollow" },
  { href: "/story", label: "Story" },
  { href: "/trust", label: "Trust" },
];

const utilityNav = [
  { href: "/products", label: "Products" },
  { href: "/services", label: "API & Pricing" },
  { href: "/network", label: "Network", rel: "nofollow" },
  { href: "/documents", label: "Docs" },
  { href: "/community", label: "Community" },
  { href: "/assistant", label: "Help", rel: "nofollow" },
  { href: "/search", label: "Search", rel: "nofollow" },
];

export function SiteHeader() {
  const { liveSiteUrl } = useSiteUrls();
  const { copy } = useI18n();

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
                <span>{copy.chrome.createPrivateDaoTagline}</span>
              </div>
            </div>
          </Link>

          <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
            <LanguageSwitcher />
            <Link
              href="/search"
              className={cn(buttonVariants({ size: "sm", variant: "ghost" }), "h-10 w-10 rounded-full p-0 text-white/72")}
              aria-label={copy.chrome.search}
            >
              <Search className="h-4 w-4" />
            </Link>
            <Link
              href="/assistant"
              className={cn(buttonVariants({ size: "sm", variant: "ghost" }), "h-10 w-10 rounded-full p-0 text-white/72")}
              aria-label={copy.chrome.help}
            >
              <Sparkles className="h-4 w-4" />
            </Link>
            <a
              className={cn(buttonVariants({ size: "sm", variant: "secondary" }), "hidden xl:inline-flex")}
              href={liveSiteUrl}
              rel="noreferrer"
              target="_blank"
            >
              {copy.chrome.openApp}
            </a>
            <WalletConnectButton />
          </div>
        </div>

          <nav className="no-scrollbar flex items-center gap-1.5 overflow-x-auto border-t border-white/6 pt-3 pb-1">
            {navItems.map((item) => {
              const label =
                item.href === "/start"
                  ? copy.chrome.start
                  : item.href === "/learn"
                    ? copy.chrome.learn
                    : item.href === "/govern"
                      ? copy.chrome.govern
                      : item.href === "/live"
                        ? copy.chrome.liveState
                        : item.href === "/story"
                          ? copy.chrome.story
                          : copy.chrome.trust;

              return (
              <Link
                className={cn(buttonVariants({ size: "sm", variant: "ghost" }), "shrink-0 px-3 text-white/72")}
                href={item.href}
                key={item.href}
                rel={item.rel}
              >
                {label}
              </Link>
              );
            })}
        </nav>

        <div className="hidden border-t border-white/6 pt-3 lg:flex lg:flex-row lg:items-center lg:justify-between lg:gap-3">
          <div className="flex min-w-0 items-center gap-2 rounded-full border border-white/10 bg-white/4 px-4 py-2 text-sm text-white/62">
            <Search className="h-4 w-4 text-cyan-200" />
            <Link href="/search" className="truncate">
              {copy.chrome.searchSite}
            </Link>
            <span className="ml-auto hidden rounded-full border border-white/10 bg-black/20 px-2 py-0.5 text-[11px] uppercase tracking-[0.18em] text-white/38 sm:inline-flex">
              ⌘K
            </span>
          </div>

          <nav className="no-scrollbar flex items-center gap-1.5 overflow-x-auto pb-1">
            {utilityNav.map((item) => {
              const label =
                item.href === "/products"
                  ? copy.chrome.products
                  : item.href === "/services"
                    ? copy.chrome.apiPricing
                    : item.href === "/network"
                      ? copy.chrome.network
                      : item.href === "/documents"
                        ? copy.chrome.docs
                        : item.href === "/community"
                          ? copy.chrome.community
                          : item.href === "/assistant"
                            ? copy.chrome.help
                            : copy.chrome.search;

              return (
              <Link
                className={cn(buttonVariants({ size: "sm", variant: "ghost" }), "shrink-0 px-3 text-white/68")}
                href={item.href}
                key={item.href}
                rel={item.rel}
              >
                {label}
              </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
}
