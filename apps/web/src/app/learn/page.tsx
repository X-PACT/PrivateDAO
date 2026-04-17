import type { Metadata } from "next";
import Link from "next/link";

import { GettingStartedWorkspace } from "@/components/getting-started-workspace";
import { LearnBootcampNav } from "@/components/learn-bootcamp-nav";
import { OperationsShell } from "@/components/operations-shell";
import { ProductLearningGuide } from "@/components/product-learning-guide";
import { VideoCenter } from "@/components/video-center";
import { buttonVariants } from "@/components/ui/button";
import { getExecutionSurfaceSnapshot } from "@/lib/devnet-service-metrics";
import { getJudgeRuntimeLogsSnapshot } from "@/lib/judge-runtime-logs";
import { learnLectures, learnModuleNav, learnToolkitItems } from "@/lib/learn-bootcamp";
import { buildRouteMetadata } from "@/lib/route-metadata";
import { cn } from "@/lib/utils";

const googleSlidesDeckHref =
  "https://docs.google.com/presentation/d/1ubzMiYvie7f_5viUWpqPJvjL666TEJCPk527suDxyi8/edit?usp=drivesdk";

export const metadata: Metadata = buildRouteMetadata({
  title: "Learn",
  description:
    "Learn PrivateDAO through the shortest onboarding path, wallet-first Devnet flows, and product-guided walkthroughs.",
  path: "/learn",
  keywords: ["learn", "onboarding", "devnet", "wallet-first", "walkthrough"],
});

export default function LearnPage() {
  const executionSnapshot = getExecutionSurfaceSnapshot();
  const runtimeSnapshot = getJudgeRuntimeLogsSnapshot();

  return (
    <OperationsShell
      eyebrow="Learn"
      title="Learn PrivateDAO through the shortest onboarding path and a plain-language product guide"
      description="This route packages onboarding, wallet-first entry, product explanation, real Devnet verification steps, and the clearest way to understand how governance, payments, gaming, privacy, API, and RPC fit together."
      badges={[
        { label: "Wallet-first", variant: "cyan" },
        { label: "Devnet live", variant: "success" },
        { label: "Bootcamp + proof", variant: "violet" },
      ]}
    >
      <LearnBootcampNav />
      <div className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="rounded-[30px] border border-cyan-300/16 bg-cyan-300/[0.08] p-6">
          <div className="text-[11px] uppercase tracking-[0.28em] text-cyan-100/76">PrivateDAO Frontend Bootcamp</div>
          <h2 className="mt-3 text-2xl font-semibold text-white">Four lectures that turn a normal builder into a product operator</h2>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-white/66">
            This learning corridor no longer stops at onboarding. It now teaches wallet-first UX, governance UI,
            runtime visibility, private payments, gaming rails, proof, agentic execution, APIs, RPC, and the exact
            product surfaces where each layer becomes usable.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link href={`/learn/${learnLectures[0]!.slug}`} className={cn(buttonVariants({ size: "sm" }))}>
              Start Lecture 1
            </Link>
            <Link href="/learn/toolkit" className={cn(buttonVariants({ size: "sm", variant: "secondary" }))}>
              Open toolkit
            </Link>
            <Link href="/documents/frontend-solana-bootcamp-materials" className={cn(buttonVariants({ size: "sm", variant: "outline" }))}>
              Open lecture materials
            </Link>
            <a href={googleSlidesDeckHref} target="_blank" rel="noreferrer" className={cn(buttonVariants({ size: "sm", variant: "outline" }))}>
              Open Google Slides
            </a>
            <Link href="/learn/assignments" className={cn(buttonVariants({ size: "sm", variant: "outline" }))}>
              Open assignments
            </Link>
          </div>
        </div>
        <div className="rounded-[30px] border border-white/10 bg-white/[0.04] p-6">
          <div className="text-[11px] uppercase tracking-[0.28em] text-white/42">What this section covers</div>
          <ul className="mt-4 space-y-3 text-sm leading-7 text-white/62">
            <li>• Wallet-first Devnet onboarding that starts from the browser.</li>
            <li>• Governance lifecycle UI with voice-assisted commands and private voting posture.</li>
            <li>• Fast RPC, hosted reads, diagnostics, analytics, and blockchain verification.</li>
            <li>• ZK, MagicBlock, REFHE, Jupiter, Kamino, SNS, Torque, and agentic rails explained through the product itself.</li>
          </ul>
        </div>
      </div>
      <div className="grid gap-4 xl:grid-cols-2">
        {learnLectures.map((lecture) => (
          <div key={lecture.slug} className="rounded-[28px] border border-white/10 bg-white/[0.04] p-6">
            <div className="text-[11px] uppercase tracking-[0.24em] text-white/42">Lecture {lecture.lectureNumber}</div>
            <div className="mt-2 text-xl font-semibold text-white">{lecture.title}</div>
            <p className="mt-3 text-sm leading-7 text-white/62">{lecture.summary}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {lecture.badges.map((badge) => (
                <span key={badge} className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-white/58">
                  {badge}
                </span>
              ))}
            </div>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link href={`/learn/${lecture.slug}`} className={cn(buttonVariants({ size: "sm" }))}>
                Open lecture
              </Link>
              <Link href={lecture.actions[0]!.href} className={cn(buttonVariants({ size: "sm", variant: "secondary" }))}>
                Try the live route
              </Link>
            </div>
          </div>
        ))}
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <Link href="/learn" className="rounded-[26px] border border-cyan-300/16 bg-cyan-300/[0.08] p-5 transition hover:border-cyan-300/26 hover:bg-cyan-300/[0.12]">
          <div className="text-base font-medium text-white">Learn PrivateDAO</div>
          <p className="mt-3 text-sm leading-7 text-white/66">
            A few simple minutes of learning first, then advanced blockchain operations from the UI without command lines or terminal scripts.
          </p>
        </Link>
        {[
          ...learnModuleNav.filter((item) =>
            ["/documents/frontend-solana-bootcamp-materials", "/learn/toolkit", "/learn/assignments", "/learn/quizzes"].includes(item.href),
          ),
          { href: googleSlidesDeckHref, label: "Google Slides", shortLabel: "Slides" },
        ].map((item) =>
          item.href.startsWith("https://") ? (
            <a
              key={item.href}
              href={item.href}
              target="_blank"
              rel="noreferrer"
              className="rounded-[26px] border border-white/10 bg-white/[0.04] p-5 transition hover:border-cyan-300/22 hover:bg-white/[0.06]"
            >
              <div className="text-base font-medium text-white">{item.label}</div>
              <p className="mt-3 text-sm leading-7 text-white/60">
                {item.href === "/documents/frontend-solana-bootcamp-materials"
                  ? "Open the complete slide-ready lecture pack, toolkit map, assignments, and quizzes."
                  : item.href === "https://docs.google.com/presentation/d/1ubzMiYvie7f_5viUWpqPJvjL666TEJCPk527suDxyi8/edit?usp=drivesdk"
                  ? "Open the submission-ready Google Slides deck built from the live product lectures."
                  : item.href === "/learn/toolkit"
                  ? `Open the live starters built from ${learnToolkitItems.length} real product lanes.`
                  : item.href === "/learn/assignments"
                    ? "Build real UI slices, not toy examples."
                    : "Check whether the builder actually understands the product boundary."}
              </p>
            </a>
          ) : (
            <Link key={item.href} href={item.href} className="rounded-[26px] border border-white/10 bg-white/[0.04] p-5 transition hover:border-cyan-300/22 hover:bg-white/[0.06]">
              <div className="text-base font-medium text-white">{item.label}</div>
              <p className="mt-3 text-sm leading-7 text-white/60">
                {item.href === "/documents/frontend-solana-bootcamp-materials"
                  ? "Open the complete slide-ready lecture pack, toolkit map, assignments, and quizzes."
                  : item.href === googleSlidesDeckHref
                    ? "Open the submission-ready Google Slides deck built from the live product lectures."
                    : item.href === "/learn/toolkit"
                      ? `Open the live starters built from ${learnToolkitItems.length} real product lanes.`
                      : item.href === "/learn/assignments"
                        ? "Build real UI slices, not toy examples."
                        : "Check whether the builder actually understands the product boundary."}
              </p>
            </Link>
          ),
        )}
      </div>
      <ProductLearningGuide
        executionSnapshot={executionSnapshot}
        runtimeSnapshot={runtimeSnapshot}
      />
      <div className="rounded-[28px] border border-cyan-300/16 bg-cyan-300/[0.08] p-6">
        <div className="text-[11px] uppercase tracking-[0.28em] text-cyan-100/78">Ready to try it?</div>
        <h2 className="mt-3 text-2xl font-semibold text-white">Use one short path on Devnet</h2>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-white/64">
          Start in the browser, connect a Devnet wallet, move into the governance flow, then open the judge route to
          verify signatures, proof, runtime evidence, and the blockchain trail itself. The learning surface stays
          here for context, but the real product experience starts on the next click and remains understandable to a
          normal user without scripts or terminal work.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link href="/start" className={cn(buttonVariants({ size: "sm" }))}>
            Try it on Devnet
          </Link>
          <Link href="/judge" className={cn(buttonVariants({ size: "sm", variant: "secondary" }))}>
            Open judge route
          </Link>
        </div>
      </div>
      <GettingStartedWorkspace executionSnapshot={executionSnapshot} />
      <VideoCenter compact />
    </OperationsShell>
  );
}
