"use client";

import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { useSiteUrls } from "@/lib/site-urls";
import { cn } from "@/lib/utils";
import { WalletConnectButton } from "@/components/wallet-connect-button";

const navItems = [
  { href: "/", label: "Overview" },
  { href: "/command-center", label: "Command Center" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/proof", label: "Proof" },
  { href: "/documents", label: "Documents" },
  { href: "/security", label: "Security" },
  { href: "/diagnostics", label: "Diagnostics" },
  { href: "/analytics", label: "Analytics" },
  { href: "/services", label: "Services" },
  { href: "/awards", label: "Awards" },
];

export function SiteHeader() {
  const { liveSiteUrl } = useSiteUrls();

  return (
    <header className="sticky top-0 z-40 border-b border-white/8 bg-[#050816]/75 backdrop-blur-xl">
      <div className="mx-auto grid w-full max-w-7xl grid-cols-[auto_1fr_auto] items-center gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="group flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-amber-300/20 bg-[radial-gradient(circle_at_top,#ffdf80,#ffb100_58%,#9f5a00)] text-base font-black text-slate-950 shadow-[0_14px_36px_rgba(255,177,0,0.22)] transition-transform duration-300 group-hover:scale-[1.03]">
            △
          </div>
          <div>
            <div className="text-[11px] uppercase tracking-[0.34em] text-emerald-300/80">1st Place · Superteam Poland</div>
            <div className="text-lg font-semibold tracking-tight text-white">PrivateDAO</div>
          </div>
        </Link>

        <nav className="hidden items-center justify-center gap-2 md:flex">
          {navItems.map((item) => (
            <Link
              className={cn(buttonVariants({ size: "sm", variant: "ghost" }), "text-white/72")}
              href={item.href}
              key={item.href}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center justify-end gap-3">
          <a
            className={cn(buttonVariants({ size: "sm", variant: "secondary" }), "hidden lg:inline-flex")}
            href={liveSiteUrl}
            rel="noreferrer"
            target="_blank"
          >
            Live Surface
          </a>
          <WalletConnectButton />
        </div>
      </div>
    </header>
  );
}
