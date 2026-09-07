import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { OperationsShell } from "@/components/operations-shell";
import { buttonVariants } from "@/components/ui/button";
import { buildRouteMetadata } from "@/lib/route-metadata";
import { cn } from "@/lib/utils";
import { commercialProductGroups } from "@/lib/commercial-product-map";

export const metadata: Metadata = buildRouteMetadata({
  title: "Products",
  description:
    "PrivateDAO helps organizations verify sensitive records, govern privately, and coordinate treasury operations with clear evidence.",
  path: "/products",
  keywords: ["PrivateDAO products", "record verification", "private governance", "treasury coordination", "verifiable evidence"],
});

export default function ProductsPage() {
  return (
    <OperationsShell
      eyebrow="Products"
      title="Make sensitive decisions private and verifiable."
      description="PrivateDAO gives organizations a simple way to verify important records, govern with discretion, and coordinate treasury work with evidence others can trust."
      navigationMode="guided"
      badges={[
        { label: "Commercial product lines", variant: "cyan" },
        { label: "Commercial pilots", variant: "success" },
        { label: "Audit-ready proof", variant: "violet" },
      ]}
    >
      <section className="grid gap-5 lg:grid-cols-2">
        {commercialProductGroups.map((group, index) => {
          const Icon = group.icon;
          return <article key={group.title} className={cn("rounded-[28px] border bg-white/[0.035] p-5 sm:p-6", index === 0 ? "border-cyan-300/28" : index === 1 ? "border-emerald-300/24" : index === 2 ? "border-violet-300/24" : "border-white/10")}>
            <div className="flex items-start gap-3">
              <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-2.5 text-cyan-100"><Icon className="h-5 w-5" /></div>
              <div><h2 className="text-2xl font-semibold text-white">{group.title}</h2><p className="mt-2 text-sm leading-6 text-white/58">{group.summary}</p></div>
            </div>
            <div className="mt-5 grid gap-3">
              {group.products.map((product) => <div key={product.title} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <h3 className="text-lg font-semibold text-white">{product.title}</h3>
                <p className="mt-2 text-sm leading-6 text-white/64">{product.summary}</p>
                <p className="mt-2 text-xs text-white/42">For: {product.audience}</p>
                <Link href={product.href} className={cn(buttonVariants({ size: "sm" }), "mt-4")}>{product.cta}<ArrowRight className="h-4 w-4" /></Link>
              </div>)}
            </div>
          </article>;
        })}
      </section>

      <section className="rounded-[28px] border border-cyan-300/16 bg-cyan-300/[0.06] p-5 sm:p-6">
        <div className="text-[11px] uppercase tracking-[0.25em] text-cyan-100/76">Explore the ecosystem</div>
        <p className="mt-3 max-w-4xl text-sm leading-7 text-white/64">
          Start with the business outcome you need. The operational detail stays behind the experience until your team is ready to connect its own systems.
        </p>
        <div className="mt-5 grid gap-3 md:grid-cols-2">
          <Link href="/agents" className="rounded-2xl border border-violet-300/18 bg-violet-300/[0.06] p-4 transition hover:border-violet-200/35">
            <div className="text-lg font-semibold text-white">Agent Marketplace</div>
            <p className="mt-2 text-sm leading-6 text-white/62">Discover services, connect providers, and let software work with software.</p>
            <span className="mt-3 inline-flex text-sm font-semibold text-violet-100">Explore agents <ArrowRight className="ml-2 h-4 w-4" /></span>
          </Link>
          <a href="https://game.privatedao.org/game/godot/index.html" className="rounded-2xl border border-emerald-300/18 bg-emerald-300/[0.06] p-4 transition hover:border-emerald-200/35">
            <div className="text-lg font-semibold text-white">PDAO Worlds</div>
            <p className="mt-2 text-sm leading-6 text-white/62">A playful world where privacy, trust, and coordination become something you can experience.</p>
            <span className="mt-3 inline-flex text-sm font-semibold text-emerald-100">Play PDAO Worlds <ArrowRight className="ml-2 h-4 w-4" /></span>
          </a>
        </div>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link href="/services" className={cn(buttonVariants({ size: "sm", variant: "secondary" }))}>View all services</Link>
          <Link href="/developers" className={cn(buttonVariants({ size: "sm", variant: "outline" }))}>For developers</Link>
          <Link href="/pilots" className={cn(buttonVariants({ size: "sm", variant: "outline" }))}>Request Pilot</Link>
        </div>
      </section>
    </OperationsShell>
  );
}
