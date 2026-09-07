import Link from "next/link";
import { ArrowUpRight, Layers3 } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { platformServiceLayers } from "@/lib/site-data";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function PlatformServiceArchitecture() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-cyan-300/18 bg-cyan-300/10 text-cyan-100">
            <Layers3 className="h-5 w-5" />
          </div>
          <div>
            <CardTitle>PrivateDAO platform architecture</CardTitle>
            <p className="mt-2 text-sm leading-7 text-white/60">
              PrivateDAO should read as governance infrastructure, not as a single DAO toy. These layers keep the product, infrastructure, gaming, payments, proof, and developer story aligned.
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="grid gap-4 xl:grid-cols-2">
        {platformServiceLayers.map((layer) => (
          <div key={layer.title} className="rounded-3xl border border-white/8 bg-white/4 p-5">
            <div className="flex flex-wrap items-center gap-3">
              <div className="rounded-full border border-cyan-300/18 bg-cyan-300/10 px-3 py-1 text-[11px] uppercase tracking-[0.22em] text-cyan-100">
                {layer.layer}
              </div>
              <div className="text-lg font-medium text-white">{layer.title}</div>
            </div>
            <p className="mt-4 text-sm leading-7 text-white/60">{layer.summary}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {layer.services.map((service) => (
                <div
                  key={`${layer.title}-${service}`}
                  className="rounded-full border border-white/10 bg-black/20 px-3 py-1.5 text-xs uppercase tracking-[0.16em] text-white/66"
                >
                  {service}
                </div>
              ))}
            </div>
            <Link className={cn(buttonVariants({ size: "sm", variant: "secondary" }), "mt-5")} href={layer.href}>
              {layer.cta}
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
