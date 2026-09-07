"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, ShieldCheck } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type LegacyRouteRedirectProps = {
  title: string;
  description: string;
  target: string;
  label?: string;
};

export function LegacyRouteRedirect({ title, description, target, label = "Open current route" }: LegacyRouteRedirectProps) {
  const router = useRouter();

  useEffect(() => {
    const timer = window.setTimeout(() => router.replace(target), 800);
    return () => window.clearTimeout(timer);
  }, [router, target]);

  return (
    <main className="mx-auto flex min-h-[70vh] w-full max-w-5xl flex-col justify-center px-4 py-16 sm:px-6 lg:px-8">
      <section className="rounded-[32px] border border-cyan-300/18 bg-[linear-gradient(135deg,rgba(34,211,238,0.12),rgba(20,241,149,0.07),rgba(5,10,20,0.96))] p-6 shadow-2xl shadow-black/20">
        <div className="inline-flex items-center gap-2 rounded-full border border-cyan-300/18 bg-cyan-300/[0.08] px-3 py-1 text-xs uppercase tracking-[0.22em] text-cyan-100">
          <ShieldCheck className="h-3.5 w-3.5" />
          Preserved legacy link
        </div>
        <h1 className="mt-5 max-w-3xl text-4xl font-semibold tracking-tight text-white sm:text-5xl">{title}</h1>
        <p className="mt-4 max-w-3xl text-base leading-7 text-white/66">{description}</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href={target} className={cn(buttonVariants({ size: "lg" }))}>
            {label}
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link href="/judge" className={cn(buttonVariants({ size: "lg", variant: "outline" }))}>
            Open judge hub
          </Link>
        </div>
        <p className="mt-4 text-xs leading-5 text-white/45">This page exists so old public links continue into the active PrivateDAO surface instead of showing a broken route.</p>
      </section>
    </main>
  );
}
