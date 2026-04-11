import Link from "next/link";
import { ArrowUpRight, Database, FileText, Gauge, Layers3 } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type DataCorridorQuickLinksProps = {
  title?: string;
  description?: string;
};

const quickLinks = [
  {
    label: "Open telemetry packet",
    href: "/documents/reviewer-telemetry-packet",
    icon: FileText,
  },
  {
    label: "Open diagnostics",
    href: "/diagnostics",
    icon: Gauge,
  },
  {
    label: "Open analytics",
    href: "/analytics",
    icon: Layers3,
  },
  {
    label: "Open hosted-read proof",
    href: "/documents/frontier-integrations",
    icon: Database,
  },
] as const;

export function DataCorridorQuickLinks({
  title = "Data corridor quick links",
  description = "Fast path into the telemetry, hosted-read, and reviewer-safe data corridor without scanning the full product or document library first.",
}: DataCorridorQuickLinksProps) {
  return (
    <div className="rounded-3xl border border-cyan-300/16 bg-cyan-300/[0.06] p-5">
      <div className="text-[11px] uppercase tracking-[0.3em] text-cyan-200/78">{title}</div>
      <div className="mt-3 max-w-3xl text-sm leading-7 text-white/60">{description}</div>
      <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {quickLinks.map((item) => {
          const Icon = item.icon;

          return (
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
    </div>
  );
}
