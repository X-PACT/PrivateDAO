"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Mic, MicOff, Sparkles, Volume2 } from "lucide-react";

import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type VoteChoice = "Approve" | "Reject" | "Abstain";
type TreasuryMode = "standard" | "sol" | "token";

type GovernanceVoiceCommandPanelProps = {
  daoName: string;
  proposalTitle: string;
  voteChoice: VoteChoice;
  treasuryMode: TreasuryMode;
  onDaoName: (value: string) => void;
  onProposalTitle: (value: string) => void;
  onVoteChoice: (value: VoteChoice) => void;
  onTreasuryMode: (value: TreasuryMode) => void;
  onTreasuryRecipient: (value: string) => void;
  onTreasuryAmount: (value: string) => void;
  onTreasuryTokenMint: (value: string) => void;
};

type SpeechRecognitionLike = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: ((event: { error?: string }) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
};

type SpeechRecognitionCtor = new () => SpeechRecognitionLike;

type SpeechRecognitionEventLike = {
  results: ArrayLike<{
    0: { transcript: string };
    isFinal?: boolean;
  }>;
};

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionCtor;
    webkitSpeechRecognition?: SpeechRecognitionCtor;
  }
}

const EXAMPLES = [
  "Create DAO Private Frontier Council",
  "Create proposal reviewer payout batch",
  "Vote approve",
  "Vote reject",
  "Vote abstain",
  "Send SOL to 4Mm5YTRbJuyA8NcWM85wTnx6ZQMXNph2DSnzCCKLhsMD 0.05",
  "Send token So11111111111111111111111111111111111111112 to 4Mm5YTRbJuyA8NcWM85wTnx6ZQMXNph2DSnzCCKLhsMD 1000",
] as const;

function normalizeLabel(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

export function GovernanceVoiceCommandPanel({
  daoName,
  proposalTitle,
  voteChoice,
  treasuryMode,
  onDaoName,
  onProposalTitle,
  onVoteChoice,
  onTreasuryMode,
  onTreasuryRecipient,
  onTreasuryAmount,
  onTreasuryTokenMint,
}: GovernanceVoiceCommandPanelProps) {
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const [commandInput, setCommandInput] = useState("");
  const [listening, setListening] = useState(false);
  const [status, setStatus] = useState("Speak or type a command, then apply it to the live workbench.");
  const [appliedChanges, setAppliedChanges] = useState<string[]>([]);

  const speechRecognitionCtor = useMemo(
    () =>
      typeof window === "undefined"
        ? null
        : window.SpeechRecognition ?? window.webkitSpeechRecognition ?? null,
    [],
  );

  useEffect(() => {
    if (!speechRecognitionCtor) return;
    const recognition = new speechRecognitionCtor();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";
    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map((result) => result[0]?.transcript ?? "")
        .join(" ")
        .trim();
      if (transcript) {
        setCommandInput(transcript);
        setStatus("Voice captured. Apply the command to update the live governance workbench.");
      }
    };
    recognition.onerror = (event) => {
      setListening(false);
      setStatus(`Voice capture failed${event.error ? `: ${event.error}` : ""}. You can still paste or type the command.`);
    };
    recognition.onend = () => {
      setListening(false);
    };
    recognitionRef.current = recognition;
    return () => {
      recognitionRef.current?.stop();
      recognitionRef.current = null;
    };
  }, [speechRecognitionCtor]);

  function toggleListening() {
    const recognition = recognitionRef.current;
    if (!recognition) {
      setStatus("This browser does not expose SpeechRecognition. Use the text command field instead.");
      return;
    }
    if (listening) {
      recognition.stop();
      setListening(false);
      setStatus("Voice capture stopped.");
      return;
    }
    try {
      recognition.start();
      setListening(true);
      setStatus("Listening for one command. Example: Create proposal reviewer payout batch.");
    } catch (error) {
      setListening(false);
      setStatus(error instanceof Error ? error.message : "Voice capture could not start.");
    }
  }

  function applyCommand() {
    const source = normalizeLabel(commandInput);
    if (!source) {
      setStatus("Enter or record a command first.");
      return;
    }

    const updates: string[] = [];

    const daoMatch = source.match(/(?:create|name)\s+dao\s+(.+)/i);
    if (daoMatch?.[1]) {
      const nextDaoName = normalizeLabel(daoMatch[1]);
      onDaoName(nextDaoName);
      updates.push(`DAO name -> ${nextDaoName}`);
    }

    const proposalMatch = source.match(/(?:create\s+proposal|proposal(?:\s+title)?)\s+(.+)/i);
    if (proposalMatch?.[1]) {
      const nextProposalTitle = normalizeLabel(proposalMatch[1]);
      onProposalTitle(nextProposalTitle);
      updates.push(`Proposal title -> ${nextProposalTitle}`);
    }

    const voteMatch = source.match(/\bvote\s+(approve|reject|abstain)\b/i);
    if (voteMatch?.[1]) {
      const nextVoteChoice = `${voteMatch[1][0].toUpperCase()}${voteMatch[1].slice(1).toLowerCase()}` as VoteChoice;
      onVoteChoice(nextVoteChoice);
      updates.push(`Vote choice -> ${nextVoteChoice}`);
    }

    const sendTokenMatch = source.match(
      /\bsend\s+token\s+([1-9A-HJ-NP-Za-km-z]{32,44})\s+to\s+([1-9A-HJ-NP-Za-km-z]{32,44})\s+([0-9]+)\b/i,
    );
    if (sendTokenMatch) {
      onTreasuryMode("token");
      onTreasuryTokenMint(sendTokenMatch[1]);
      onTreasuryRecipient(sendTokenMatch[2]);
      onTreasuryAmount(sendTokenMatch[3]);
      updates.push(`Treasury motion -> token ${sendTokenMatch[3]} to ${sendTokenMatch[2]}`);
    }

    const sendSolMatch = source.match(
      /\bsend\s+sol\s+to\s+([1-9A-HJ-NP-Za-km-z]{32,44})\s+([0-9]+(?:\.[0-9]{1,9})?)\b/i,
    );
    if (sendSolMatch) {
      onTreasuryMode("sol");
      onTreasuryRecipient(sendSolMatch[1]);
      onTreasuryAmount(sendSolMatch[2]);
      updates.push(`Treasury motion -> ${sendSolMatch[2]} SOL to ${sendSolMatch[1]}`);
    }

    if (updates.length === 0) {
      setStatus("No supported command was detected. Use one short command at a time.");
      return;
    }

    setAppliedChanges(updates);
    setStatus("Command applied. Review the updated fields below, then sign the wallet action when ready.");
  }

  return (
    <div className="rounded-[24px] border border-cyan-300/18 bg-cyan-300/[0.08] p-5 md:col-span-2">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-[11px] uppercase tracking-[0.22em] text-cyan-100/78">Voice-assisted governance</div>
          <div className="mt-2 text-lg font-medium text-white">
            Speak or type one governance command, then let the wallet remain the signing boundary.
          </div>
        </div>
        <Badge variant="success">Browser-first command layer</Badge>
      </div>

      <p className="mt-3 max-w-4xl text-sm leading-7 text-white/68">
        This is a real voice-assisted control lane. The panel converts plain-language commands into workbench inputs for
        DAO creation, proposal drafting, vote selection, and treasury motions. Final execution still requires the wallet
        signature, which keeps the product usable for normal users without removing the cryptographic boundary.
      </p>
      <p className="mt-3 max-w-4xl text-sm leading-7 text-white/60">
        The visible action is simple on purpose. Under the UI, the product still preserves private-vote posture,
        policy-bound execution preparation, and reviewer-visible proof after the transaction lands on Devnet.
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        {EXAMPLES.map((example) => (
          <button
            key={example}
            type="button"
            onClick={() => setCommandInput(example)}
            className="rounded-full border border-white/10 bg-black/20 px-3 py-1.5 text-xs uppercase tracking-[0.14em] text-white/66 transition hover:border-cyan-300/25 hover:text-white"
          >
            {example}
          </button>
        ))}
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1fr)_220px]">
        <div className="space-y-3">
          <textarea
            value={commandInput}
            onChange={(event) => setCommandInput(event.target.value)}
            rows={4}
            className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none placeholder:text-white/28"
            placeholder="Example: Create proposal reviewer payout batch"
          />
          <div className="flex flex-wrap gap-3">
            <Button onClick={applyCommand}>
              <Sparkles className="h-4 w-4" />
              Apply command
            </Button>
            <Button variant="secondary" onClick={toggleListening}>
              {listening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              {listening ? "Stop listening" : "Record voice"}
            </Button>
            <Link href="/judge" className={cn(buttonVariants({ size: "default", variant: "outline" }))}>
              Open judge route
            </Link>
            <Link href="/learn" className={cn(buttonVariants({ size: "default", variant: "outline" }))}>
              Open guide
            </Link>
          </div>
        </div>

        <div className="rounded-2xl border border-white/8 bg-black/20 p-4">
          <div className="flex items-center gap-2 text-sm font-medium text-white">
            <Volume2 className="h-4 w-4 text-cyan-300" />
            Current command state
          </div>
          <div className="mt-3 text-sm leading-7 text-white/64">{status}</div>
          <div className="mt-4 space-y-2 text-sm text-white/72">
            <div>DAO: {daoName || "not set"}</div>
            <div>Proposal: {proposalTitle || "not set"}</div>
            <div>Vote: {voteChoice}</div>
            <div>Treasury mode: {treasuryMode}</div>
          </div>
        </div>
      </div>

      {appliedChanges.length ? (
        <div className="mt-4 rounded-2xl border border-emerald-300/18 bg-emerald-300/[0.08] p-4 text-sm leading-7 text-emerald-100/84">
          <div className="text-[11px] uppercase tracking-[0.22em] text-emerald-100/70">Applied updates</div>
          <ul className="mt-2 space-y-1">
            {appliedChanges.map((change) => (
              <li key={change}>• {change}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
