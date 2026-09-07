import type { Metadata } from "next";

import { LearnBootcampNav } from "@/components/learn-bootcamp-nav";
import { OperationsShell } from "@/components/operations-shell";
import { learnLectures } from "@/lib/learn-bootcamp";
import { buildRouteMetadata } from "@/lib/route-metadata";

export const metadata: Metadata = buildRouteMetadata({
  title: "PrivateDAO Quizzes",
  description: "Check whether a builder understands wallet-first UX, governance privacy, runtime trust, and private payment rails before shipping.",
  path: "/learn/quizzes",
  keywords: ["learn quizzes", "wallet-first ux", "private dao bootcamp"],
});

export default function LearnQuizzesPage() {
  const choiceLabels = ["A", "B", "C", "D", "E", "F"];

  return (
    <OperationsShell
      eyebrow="Quizzes"
      title="Check understanding before you ship"
      description="These quiz prompts are designed to keep the builder honest: if they cannot explain the product boundary, they are not done with the feature."
      badges={[
        { label: "4 lectures", variant: "cyan" },
        { label: "Product-first", variant: "success" },
        { label: "Proof-aware", variant: "violet" },
      ]}
    >
      <LearnBootcampNav />
      <div className="grid gap-4">
        {learnLectures.map((lecture) => (
          <div key={lecture.slug} className="rounded-[28px] border border-white/10 bg-white/[0.04] p-6">
            <div className="text-[11px] uppercase tracking-[0.24em] text-white/42">Lecture {lecture.lectureNumber}</div>
            <div className="mt-2 text-xl font-semibold text-white">{lecture.title}</div>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {lecture.quiz.map((item) => (
                <div key={item.question} className="rounded-[22px] border border-white/8 bg-black/20 p-4">
                  <div className="text-sm font-medium text-white">{item.question}</div>
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
          </div>
        ))}
      </div>
    </OperationsShell>
  );
}
