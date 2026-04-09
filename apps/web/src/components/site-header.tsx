import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { WalletConnectButton } from "@/components/wallet-connect-button";

const navItems = [
  { href: "/", label: "Overview" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/proof", label: "Proof" },
  { href: "/security", label: "Security" },
  { href: "/diagnostics", label: "Diagnostics" },
  { href: "/analytics", label: "Analytics" },
  { href: "/services", label: "Services" },
  { href: "/awards", label: "Awards" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-white/8 bg-[#050816]/75 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-6 px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="group flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-amber-300/20 bg-[radial-gradient(circle_at_top,#ffdf80,#ffb100_58%,#9f5a00)] text-base font-black text-slate-950 shadow-[0_14px_36px_rgba(255,177,0,0.22)] transition-transform duration-300 group-hover:scale-[1.03]">
            △
          </div>
          <div>
            <div className="text-[11px] uppercase tracking-[0.34em] text-emerald-300/80">1st Place · Superteam Poland</div>
            <div className="text-lg font-semibold tracking-tight text-white">PrivateDAO</div>
          </div>
        </Link>

        <nav className="hidden items-center gap-2 md:flex">
          {navItems.map((item) => (
            <Link
              className={cn(buttonVariants({ size: "sm", variant: "ghost" }))}
              href={item.href}
              key={item.href}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <a
            className={cn(buttonVariants({ size: "sm", variant: "secondary" }), "hidden lg:inline-flex")}
            href="https://x-pact.github.io/PrivateDAO/"
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
