import Link from "next/link";
import { ArrowUpRight, DatabaseZap, FileBarChart2, FileSpreadsheet, ShieldCheck } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ProofLink = {
  label: string;
  href: string;
  icon: typeof DatabaseZap;
  external?: boolean;
};

const proofLinks: ProofLink[] = [
  {
    label: "Runtime evidence",
    href: "/viewer/runtime-evidence.generated",
    icon: FileBarChart2,
  },
  {
    label: "Frontier integrations",
    href: "/documents/frontier-integrations",
    icon: DatabaseZap,
  },
  {
    label: "Read-node snapshot",
    href: "/documents/read-node-snapshot",
    icon: FileSpreadsheet,
  },
  {
    label: "Launch trust packet",
    href: "/documents/launch-trust-packet",
    icon: ShieldCheck,
  },
] as const;

export function HostedReadProofStrip() {
  return (
    <Card className="border-cyan-300/16 bg-cyan-300/[0.06]">
      <CardHeader>
        <div className="text-[11px] uppercase tracking-[0.3em] text-cyan-200/78">Hosted-read proof strip</div>
        <CardTitle className="text-xl">Runtime, integration, and reviewer proof tied to one infrastructure story</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <p className="text-sm leading-7 text-white/60">
          This strip keeps the RPC and telemetry story concrete: hosted reads, runtime evidence, integration proof, and trust surfaces remain linked so the infrastructure case reads like product value rather than hidden backend detail.
        </p>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {proofLinks.map((item) => {
            const Icon = item.icon;

            return item.external ? (
              <a
                key={item.href}
                href={item.href}
                rel="noreferrer"
                target="_blank"
                className={cn(buttonVariants({ variant: "outline" }), "justify-between")}
              >
                <span className="inline-flex items-center gap-2">
                  <Icon className="h-4 w-4" />
                  {item.label}
                </span>
                <ArrowUpRight className="h-4 w-4" />
              </a>
            ) : (
              <Link
                key={item.href}
                href={item.href}
                className={cn(buttonVariants({ variant: "outline" }), "justify-between")}
              >
                <span className="inline-flex items-center gap-2">
                  <Icon className="h-4 w-4" />
                  {item.label}
                </span>
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
