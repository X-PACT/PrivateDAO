import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { OperationsShell } from "@/components/operations-shell";
import { LearnBootcampNav } from "@/components/learn-bootcamp-nav";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { WalletConnectButton } from "@/components/wallet-connect-button";
import type { LearnLecture } from "@/lib/learn-bootcamp";
import { cn } from "@/lib/utils";

type LearnLecturePageProps = {
  lecture: LearnLecture;
};

export function LearnLecturePage({ lecture }: LearnLecturePageProps) {
  const choiceLabels = ["A", "B", "C", "D", "E", "F"];

  return (
    <OperationsShell
      eyebrow={`Lecture ${lecture.lectureNumber}`}
      title={lecture.title}
      description={lecture.summary}
      badges={lecture.badges.map((label, index) => ({
        label,
        variant: index === 0 ? "cyan" : index === 1 ? "success" : "violet",
      }))}
    >
      <LearnBootcampNav />

      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <div className="rounded-[30px] border border-cyan-300/16 bg-cyan-300/[0.08] p-6">
          <div className="text-[11px] uppercase tracking-[0.28em] text-cyan-100/76">{lecture.strapline}</div>
          <h2 className="mt-3 text-2xl font-semibold text-white">What this lecture turns into in the product</h2>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-white/66">{lecture.summary}</p>
          <div className="mt-5 flex flex-wrap gap-3">
            {lecture.actions.map((action) => (
              <Link key={action.href} href={action.href} className={cn(buttonVariants({ size: "sm" }))}>
                {action.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="rounded-[30px] border border-white/10 bg-white/[0.04] p-6">
          <div className="text-[11px] uppercase tracking-[0.28em] text-white/42">Lecture assets</div>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link href="/documents/frontend-solana-bootcamp-materials" className={cn(buttonVariants({ size: "sm", variant: "secondary" }))}>
              Open slides
            </Link>
            <Link href="/learn/assignments" className={cn(buttonVariants({ size: "sm", variant: "secondary" }))}>
              Open assignment
            </Link>
            <Link href="/learn/quizzes" className={cn(buttonVariants({ size: "sm", variant: "secondary" }))}>
              Open quiz
            </Link>
          </div>
          <div className="mt-5 grid gap-3">
            {lecture.codeRefs.map((ref) => (
              <a
                key={ref.href}
                href={ref.href}
                target="_blank"
                rel="noreferrer"
                className="rounded-[22px] border border-white/8 bg-black/20 p-4 text-sm leading-7 text-white/64 transition hover:border-cyan-300/24 hover:bg-black/28"
                >
                <div className="font-medium text-white">{ref.label}</div>
                <div className="mt-2 break-all text-xs text-white/44">{ref.href}</div>
              </a>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <div className="rounded-[30px] border border-emerald-300/18 bg-emerald-300/[0.08] p-6">
          <div className="text-[11px] uppercase tracking-[0.28em] text-emerald-100/78">Run this lecture now</div>
          <h2 className="mt-3 text-2xl font-semibold text-white">{lecture.liveExecution.heading}</h2>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-white/68">{lecture.liveExecution.summary}</p>
          <ul className="mt-4 space-y-2 text-sm leading-7 text-white/60">
            {lecture.liveExecution.steps.map((step) => (
              <li key={step}>• {step}</li>
            ))}
          </ul>
          <div className="mt-5 flex flex-wrap gap-3">
            <WalletConnectButton size="sm" variant="default" />
            <Link href={lecture.liveExecution.routeHref} className={cn(buttonVariants({ size: "sm" }))}>
              {lecture.liveExecution.routeLabel}
            </Link>
            <Link href={lecture.liveExecution.verifyHref} className={cn(buttonVariants({ size: "sm", variant: "secondary" }))}>
              {lecture.liveExecution.verifyLabel}
            </Link>
          </div>
        </div>

        <div className="rounded-[30px] border border-white/10 bg-white/[0.04] p-6">
          <div className="text-[11px] uppercase tracking-[0.28em] text-white/42">Why this is production learning</div>
          <div className="mt-4 grid gap-3">
            <div className="rounded-[22px] border border-white/8 bg-black/20 p-4 text-sm leading-7 text-white/62">
              This lecture does not end at theory. The primary button takes the user into a live product route where the
              same concept becomes a real Testnet action from the UI.
            </div>
            <div className="rounded-[22px] border border-white/8 bg-black/20 p-4 text-sm leading-7 text-white/62">
              The verification button opens the state, judge, diagnostics, or proof lane needed to confirm what the
              wallet action produced on-chain.
            </div>
            <div className="rounded-[22px] border border-white/8 bg-black/20 p-4 text-sm leading-7 text-white/62">
              The result is stronger than a tutorial: a normal user learns the product and exercises the real system in
              the same corridor without terminal work.
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {lecture.sections.map((section) => (
          <div key={section.heading} className="rounded-[26px] border border-white/8 bg-white/[0.04] p-5">
            <div className="text-[11px] uppercase tracking-[0.24em] text-white/42">{section.heading}</div>
            <p className="mt-3 text-sm leading-7 text-white/62">{section.body}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <div className="rounded-[30px] border border-emerald-300/18 bg-emerald-300/[0.08] p-6">
          <div className="flex items-center gap-3">
            <Badge variant="success">Assignment</Badge>
            <div className="text-base font-medium text-white">{lecture.assignment.title}</div>
          </div>
          <p className="mt-3 text-sm leading-7 text-white/68">{lecture.assignment.brief}</p>
          <ul className="mt-4 space-y-2 text-sm leading-7 text-white/60">
            {lecture.assignment.deliverables.map((deliverable) => (
              <li key={deliverable}>• {deliverable}</li>
            ))}
          </ul>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link href={lecture.assignment.liveRoute} className={cn(buttonVariants({ size: "sm" }))}>
              Try the live route
            </Link>
            <Link href="/learn/assignments" className={cn(buttonVariants({ size: "sm", variant: "secondary" }))}>
              Open all assignments
            </Link>
          </div>
          <div className="mt-5 grid gap-3">
            {lecture.assignment.codeRefs.map((ref) => (
              <a
                key={ref.href}
                href={ref.href}
                target="_blank"
                rel="noreferrer"
                className="rounded-[20px] border border-white/8 bg-black/20 p-4 text-sm leading-7 text-white/62 transition hover:border-emerald-300/24 hover:bg-black/28"
              >
                <div className="font-medium text-white">{ref.label}</div>
                <div className="mt-1 break-all text-xs text-white/44">{ref.href}</div>
              </a>
            ))}
          </div>
        </div>

        <div className="rounded-[30px] border border-violet-300/18 bg-violet-300/[0.08] p-6">
          <div className="flex items-center gap-3">
            <Badge variant="violet">Quiz</Badge>
            <div className="text-base font-medium text-white">Check understanding before you ship</div>
          </div>
          <div className="mt-4 grid gap-4">
            {lecture.quiz.map((item, index) => (
              <div key={item.question} className="rounded-[22px] border border-white/8 bg-black/20 p-4">
                <div className="text-sm font-medium text-white">
                  {index + 1}. {item.question}
                </div>
                <ul className="mt-3 space-y-2 text-sm leading-7 text-white/60">
                  {item.options.map((answer, answerIndex) => (
                    <li
                      key={answer}
                      className={
                        answerIndex === item.correctAnswerIndex
                          ? "rounded-2xl border border-emerald-300/24 bg-emerald-300/[0.08] px-3 py-2 text-emerald-100"
                          : "rounded-2xl border border-white/8 bg-black/16 px-3 py-2"
                      }
                    >
                      <span className="mr-2 inline-block min-w-6 font-semibold text-white/86">
                        {choiceLabels[answerIndex]})
                      </span>
                      <span>{answer}</span>
                      {answerIndex === item.correctAnswerIndex ? (
                        <span className="ml-2 text-[11px] uppercase tracking-[0.18em] text-emerald-200/82">Correct</span>
                      ) : null}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link href="/learn/quizzes" className={cn(buttonVariants({ size: "sm", variant: "secondary" }))}>
              Open all quizzes
            </Link>
            <Link href="/judge" className={cn(buttonVariants({ size: "sm", variant: "outline" }))}>
              Verify on-chain evidence
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </OperationsShell>
  );
}
