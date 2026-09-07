"use client";

import { FormEvent, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, BrainCircuit, CheckCircle2, Coins, MessageCircle, Search, ShieldCheck, Sparkles, Workflow } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ProductOption = {
  key: string;
  title: string;
  summary: string;
  href: string;
  icon: typeof ShieldCheck;
  keywords: string[];
};

type ChatMessage = {
  role: "assistant" | "user";
  text: string;
};

const productOptions: ProductOption[] = [
  {
    key: "verify",
    title: "Verify sensitive records",
    summary: "Create trusted evidence for important records without exposing the underlying information.",
    href: "/products/record-verification",
    icon: ShieldCheck,
    keywords: ["verify", "proof", "record", "evidence", "privacy", "compliance"],
  },
  {
    key: "govern",
    title: "Govern private decisions",
    summary: "Run proposals, approvals, and decision workflows with a clear record of what happened.",
    href: "/govern",
    icon: CheckCircle2,
    keywords: ["govern", "vote", "proposal", "approval", "dao", "decision"],
  },
  {
    key: "treasury",
    title: "Coordinate treasury work",
    summary: "Organize requests, people, and funds with accountability from approval to completion.",
    href: "/treasury",
    icon: Coins,
    keywords: ["treasury", "payment", "payroll", "fund", "money", "payout"],
  },
  {
    key: "workflows",
    title: "Run trusted workflows",
    summary: "Make business processes easier to review, verify, and share with the right people.",
    href: "/proof-workflows",
    icon: Workflow,
    keywords: ["workflow", "process", "business", "claim", "operation"],
  },
  {
    key: "developers",
    title: "Connect your systems",
    summary: "Start with the API and SDK when PrivateDAO needs to fit inside your existing product.",
    href: "/developers",
    icon: BrainCircuit,
    keywords: ["api", "sdk", "integrate", "integration", "developer", "cash app"],
  },
];

const starterQuestions = [
  "I need to verify a sensitive record",
  "We need private approvals",
  "I want to coordinate treasury work",
  "How do we integrate PrivateDAO?",
];

function chooseProduct(question: string) {
  const normalized = question.toLowerCase();
  return productOptions.find((product) => product.keywords.some((keyword) => normalized.includes(keyword))) ?? null;
}

export function InternalAssistantPanel() {
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      text: "Welcome to PrivateDAO. Tell me what you need to protect, decide, or coordinate, and I will point you to the simplest starting place.",
    },
  ]);
  const selectedProduct = useMemo(() => chooseProduct(question), [question]);

  function submitQuestion(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = question.trim();
    if (!trimmed) return;

    const product = chooseProduct(trimmed);
    const answer = product
      ? `${product.title} is the best place to start. ${product.summary}`
      : "Start with Products to compare the three main paths. You can begin with Verify, Govern, or Treasury and move into a guided workflow from there.";

    setMessages((current) => [...current, { role: "user", text: trimmed }, { role: "assistant", text: answer }]);
    setQuestion("");
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1.12fr_0.88fr]">
      <Card className="border-white/10 bg-[linear-gradient(180deg,rgba(10,16,32,0.96),rgba(7,11,23,0.99))]">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-cyan-300/20 bg-cyan-300/10 text-cyan-100">
              <MessageCircle className="h-5 w-5" />
            </div>
            <div>
              <CardTitle>PrivateDAO assistant</CardTitle>
              <p className="mt-1 text-sm font-normal text-white/48">Simple guidance for choosing the right product.</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="min-h-56 space-y-3 rounded-3xl border border-white/8 bg-black/20 p-4">
            {messages.map((message, index) => (
              <div key={`${message.role}-${index}`} className={cn("flex", message.role === "user" ? "justify-end" : "justify-start")}>
                <div
                  className={cn(
                    "max-w-[88%] rounded-2xl px-4 py-3 text-sm leading-7",
                    message.role === "user" ? "bg-cyan-300/12 text-cyan-50" : "bg-white/6 text-white/70",
                  )}
                >
                  {message.text}
                </div>
              </div>
            ))}
          </div>
          <form onSubmit={submitQuestion} className="flex items-center gap-3 rounded-3xl border border-white/10 bg-white/4 px-4 py-3">
            <Search className="h-4 w-4 shrink-0 text-cyan-200" />
            <input
              value={question}
              onChange={(event) => setQuestion(event.target.value)}
              placeholder="What are you trying to protect or coordinate?"
              className="w-full bg-transparent text-sm text-white outline-none placeholder:text-white/34"
              aria-label="Ask the PrivateDAO assistant"
            />
            <button type="submit" className={cn(buttonVariants({ size: "sm" }), "shrink-0")}>
              Ask
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>
          <div className="flex flex-wrap gap-2">
            {starterQuestions.map((starter) => (
              <button
                key={starter}
                type="button"
                onClick={() => setQuestion(starter)}
                className="rounded-full border border-white/10 bg-white/4 px-3 py-2 text-xs text-white/58 transition hover:border-cyan-300/24 hover:text-white/82"
              >
                {starter}
              </button>
            ))}
          </div>
          <p className="text-xs leading-6 text-white/42">Your question is used only to guide you through the site. No private business data is required here.</p>
        </CardContent>
      </Card>

      <Card className="border-white/10 bg-white/[0.03]">
        <CardHeader>
          <div className="flex items-center gap-3">
            <Sparkles className="h-5 w-5 text-cyan-200" />
            <CardTitle>Choose a starting point</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {productOptions.map((product) => {
            const Icon = product.icon;
            const isSelected = selectedProduct?.key === product.key;
            return (
              <Link
                key={product.key}
                href={product.href}
                className={cn(
                  "block rounded-2xl border p-4 transition",
                  isSelected ? "border-cyan-300/30 bg-cyan-300/[0.08]" : "border-white/8 bg-black/15 hover:border-white/18 hover:bg-white/[0.05]",
                )}
              >
                <div className="flex items-start gap-3">
                  <Icon className="mt-0.5 h-4 w-4 shrink-0 text-cyan-200" />
                  <div>
                    <div className="text-sm font-medium text-white">{product.title}</div>
                    <p className="mt-1 text-sm leading-6 text-white/52">{product.summary}</p>
                  </div>
                </div>
              </Link>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
