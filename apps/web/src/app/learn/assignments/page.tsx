import type { Metadata } from "next";
import Link from "next/link";

import { LearnBootcampNav } from "@/components/learn-bootcamp-nav";
import { OperationsShell } from "@/components/operations-shell";
import { buttonVariants } from "@/components/ui/button";
import { learnLectures } from "@/lib/learn-bootcamp";
import { buildRouteMetadata } from "@/lib/route-metadata";
import { cn } from "@/lib/utils";

export const metadata: Metadata = buildRouteMetadata({
  title: "PrivateDAO Assignments",
  description: "Ship practical frontend assignments from the live PrivateDAO product instead of solving isolated toy exercises.",
  path: "/learn/assignments",
  keywords: ["learn assignments", "solana frontend assignments", "private dao"],
});

export default function LearnAssignmentsPage() {
  return (
    <OperationsShell
      eyebrow="Assignments"
      title="Assignments that compile into a real product path"
      description="Each assignment is scoped so a builder can finish a real surface, open the live route, and compare the result against the running product."
      badges={[
        { label: "Route-linked", variant: "cyan" },
        { label: "UI-first", variant: "success" },
        { label: "Testnet-verifiable", variant: "violet" },
      ]}
    >
      <LearnBootcampNav />
      <div className="grid gap-4 xl:grid-cols-2">
        {learnLectures.map((lecture) => (
          <div key={lecture.slug} className="rounded-[28px] border border-white/10 bg-white/[0.04] p-6">
            <div className="text-[11px] uppercase tracking-[0.24em] text-white/42">Lecture {lecture.lectureNumber}</div>
            <div className="mt-2 text-xl font-semibold text-white">{lecture.assignment.title}</div>
            <p className="mt-3 text-sm leading-7 text-white/62">{lecture.assignment.brief}</p>
            <ul className="mt-4 space-y-2 text-sm leading-7 text-white/58">
              {lecture.assignment.deliverables.map((deliverable) => (
                <li key={deliverable}>• {deliverable}</li>
              ))}
            </ul>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link href={`/learn/${lecture.slug}`} className={cn(buttonVariants({ size: "sm", variant: "secondary" }))}>
                Open lecture
              </Link>
              <Link href={lecture.assignment.liveRoute} className={cn(buttonVariants({ size: "sm" }))}>
                Open live route
              </Link>
            </div>
          </div>
        ))}
      </div>
    </OperationsShell>
  );
}
