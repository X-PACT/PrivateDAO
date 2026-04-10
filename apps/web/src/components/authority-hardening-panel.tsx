import Link from "next/link";
import { KeyRound, ShieldCheck } from "lucide-react";

import { authorityHardeningLinks, authorityHardeningSections } from "@/lib/authority-hardening";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function AuthorityHardeningPanel() {
  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-[11px] uppercase tracking-[0.28em] text-cyan-200/76">Authority hardening</div>
            <CardTitle className="mt-2">Mainnet authority separation must be explicit, reviewable, and multisig-backed</CardTitle>
          </div>
          <Badge variant="warning">Mainnet discipline</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {authorityHardeningSections.map((section) => (
          <div key={section.title} className="rounded-3xl border border-white/8 bg-white/4 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-black/20 text-cyan-200">
                {section.title === "Authority split" ? <KeyRound className="h-4 w-4" /> : <ShieldCheck className="h-4 w-4" />}
              </div>
              <div className="text-base font-medium text-white">{section.title}</div>
            </div>
            <p className="mt-3 text-sm leading-7 text-white/60">{section.summary}</p>
            <div className="mt-3 space-y-2 text-sm leading-7 text-white/68">
              {section.bullets.map((item) => (
                <div key={item}>• {item}</div>
              ))}
            </div>
          </div>
        ))}

        <div className="grid gap-3 sm:grid-cols-3">
          {authorityHardeningLinks.map((link) => (
            <Link key={link.href} className={cn(buttonVariants({ size: "sm", variant: "secondary" }))} href={link.href}>
              {link.label}
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
