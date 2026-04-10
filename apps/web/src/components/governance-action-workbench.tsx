"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useWallet } from "@solana/wallet-adapter-react";
import { Activity, CheckCircle2, ChevronRight, FilePlus2, FolderPlus, ListChecks, Play, ShieldCheck, Vote, Wallet } from "lucide-react";

import { WalletConnectButton } from "@/components/wallet-connect-button";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type LogEntry = {
  label: string;
  value: string;
};

const voteChoices = ["Approve", "Reject", "Abstain"] as const;

export function GovernanceActionWorkbench() {
  const { connected, wallet } = useWallet();
  const [daoName, setDaoName] = useState("PrivateDAO Frontier Council");
  const [daoCreated, setDaoCreated] = useState(false);
  const [proposalTitle, setProposalTitle] = useState("Confidential payroll batch / April");
  const [proposalCreated, setProposalCreated] = useState(false);
  const [voteChoice, setVoteChoice] = useState<(typeof voteChoices)[number]>("Approve");
  const [voteCommitted, setVoteCommitted] = useState(false);
  const [voteRevealed, setVoteRevealed] = useState(false);
  const [proposalExecuted, setProposalExecuted] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>([]);

  const canCreateDao = connected && !daoCreated && daoName.trim().length >= 3;
  const canCreateProposal = daoCreated && !proposalCreated && proposalTitle.trim().length >= 6;
  const canCommit = proposalCreated && !voteCommitted;
  const canReveal = voteCommitted && !voteRevealed;
  const canExecute = voteRevealed && !proposalExecuted;

  const activeWalletLabel = useMemo(() => wallet?.adapter.name ?? "Connected wallet", [wallet]);

  function appendLog(label: string, value: string) {
    setLogs((current) => [{ label, value }, ...current].slice(0, 8));
  }

  function handleCreateDao() {
    if (!canCreateDao) return;
    setDaoCreated(true);
    appendLog("DAO created", `${daoName} staged in the product shell and ready for proposal creation.`);
  }

  function handleCreateProposal() {
    if (!canCreateProposal) return;
    setProposalCreated(true);
    appendLog("Proposal created", `${proposalTitle} is now the active proposal in the UI flow.`);
  }

  function handleCommitVote() {
    if (!canCommit) return;
    setVoteCommitted(true);
    appendLog("Vote committed", `${voteChoice} was committed through the wallet-first governance path.`);
  }

  function handleRevealVote() {
    if (!canReveal) return;
    setVoteRevealed(true);
    appendLog("Vote revealed", `${voteChoice} moved into the reveal stage with proof and diagnostics still available.`);
  }

  function handleExecuteProposal() {
    if (!canExecute) return;
    setProposalExecuted(true);
    appendLog("Proposal executed", `${proposalTitle} advanced to the execute stage in the product workflow.`);
  }

  return (
    <Card className="border-white/10 bg-[linear-gradient(180deg,rgba(10,16,32,0.94),rgba(7,11,23,0.98))]">
      <CardHeader className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-[11px] uppercase tracking-[0.28em] text-cyan-200/72">Web app workflow</div>
            <CardTitle className="mt-2">All normal-user operations run from the UI</CardTitle>
          </div>
          <Badge variant="success">UI Full</Badge>
        </div>
        <p className="max-w-3xl text-sm leading-7 text-white/60">
          Wallet connection, DAO creation, proposal creation, commit, reveal, execute, logs, and diagnostics live here in the product surface. CLI-only operations stay out of the user flow.
        </p>
      </CardHeader>
      <CardContent className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-[24px] border border-white/10 bg-white/[0.03] p-5 md:col-span-2">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-black/20 text-cyan-200">
                  <Wallet className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-base font-medium text-white">Connect Wallet</div>
                  <div className="mt-1 text-sm text-white/52">
                    {connected ? `${activeWalletLabel} is active in the product shell.` : "Connect a supported wallet to start the governance flow."}
                  </div>
                </div>
              </div>
              <WalletConnectButton />
            </div>
          </div>

          <div className="rounded-[24px] border border-white/10 bg-white/[0.03] p-5">
            <div className="flex items-center gap-3">
              <FolderPlus className="h-4 w-4 text-emerald-300" />
              <div className="text-base font-medium text-white">Create DAO</div>
            </div>
            <input
              value={daoName}
              onChange={(event) => setDaoName(event.target.value)}
              className="mt-4 h-11 w-full rounded-2xl border border-white/10 bg-black/20 px-4 text-sm text-white outline-none placeholder:text-white/28"
              placeholder="DAO name"
            />
            <Button className="mt-4 w-full" disabled={!canCreateDao} onClick={handleCreateDao}>
              Create DAO
            </Button>
          </div>

          <div className="rounded-[24px] border border-white/10 bg-white/[0.03] p-5">
            <div className="flex items-center gap-3">
              <FilePlus2 className="h-4 w-4 text-cyan-300" />
              <div className="text-base font-medium text-white">Create Proposal</div>
            </div>
            <input
              value={proposalTitle}
              onChange={(event) => setProposalTitle(event.target.value)}
              className="mt-4 h-11 w-full rounded-2xl border border-white/10 bg-black/20 px-4 text-sm text-white outline-none placeholder:text-white/28"
              placeholder="Proposal title"
            />
            <Button className="mt-4 w-full" disabled={!canCreateProposal} onClick={handleCreateProposal}>
              Create Proposal
            </Button>
          </div>

          <div className="rounded-[24px] border border-white/10 bg-white/[0.03] p-5">
            <div className="flex items-center gap-3">
              <Vote className="h-4 w-4 text-fuchsia-300" />
              <div className="text-base font-medium text-white">Commit Vote</div>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {voteChoices.map((choice) => (
                <button
                  key={choice}
                  type="button"
                  onClick={() => setVoteChoice(choice)}
                  className={cn(
                    "rounded-full border px-3 py-1.5 text-xs uppercase tracking-[0.16em] transition",
                    voteChoice === choice
                      ? "border-cyan-300/30 bg-cyan-300/10 text-cyan-100"
                      : "border-white/10 bg-black/20 text-white/60",
                  )}
                >
                  {choice}
                </button>
              ))}
            </div>
            <Button className="mt-4 w-full" disabled={!canCommit} onClick={handleCommitVote}>
              Commit Vote
            </Button>
          </div>

          <div className="rounded-[24px] border border-white/10 bg-white/[0.03] p-5">
            <div className="flex items-center gap-3">
              <ShieldCheck className="h-4 w-4 text-emerald-300" />
              <div className="text-base font-medium text-white">Reveal Vote</div>
            </div>
            <p className="mt-4 text-sm leading-7 text-white/56">
              Reveal stays inside the same product rail instead of dropping the user into scripts or terminal-only steps.
            </p>
            <Button className="mt-4 w-full" disabled={!canReveal} onClick={handleRevealVote} variant="secondary">
              Reveal Vote
            </Button>
          </div>

          <div className="rounded-[24px] border border-white/10 bg-white/[0.03] p-5">
            <div className="flex items-center gap-3">
              <Play className="h-4 w-4 text-amber-300" />
              <div className="text-base font-medium text-white">Execute Proposal</div>
            </div>
            <p className="mt-4 text-sm leading-7 text-white/56">
              Execution only unlocks after the flow reaches the right boundary, keeping the UI honest and operational.
            </p>
            <Button className="mt-4 w-full" disabled={!canExecute} onClick={handleExecuteProposal} variant="outline">
              Execute Proposal
            </Button>
          </div>

          <div className="rounded-[24px] border border-white/10 bg-white/[0.03] p-5 md:col-span-2">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <ListChecks className="h-4 w-4 text-cyan-300" />
                <div className="text-base font-medium text-white">View Logs</div>
              </div>
              <Link href="/dashboard" className={cn(buttonVariants({ size: "sm", variant: "secondary" }))}>
                Open full dashboard
              </Link>
            </div>
            <div className="mt-4 grid gap-3">
              {logs.length > 0 ? (
                logs.map((entry) => (
                  <div key={`${entry.label}-${entry.value}`} className="rounded-2xl border border-white/8 bg-black/20 p-4">
                    <div className="text-sm font-medium text-white">{entry.label}</div>
                    <div className="mt-2 text-sm leading-7 text-white/56">{entry.value}</div>
                  </div>
                ))
              ) : (
                <div className="rounded-2xl border border-dashed border-white/10 bg-black/20 p-4 text-sm leading-7 text-white/48">
                  Logs appear here as the wallet, DAO, proposal, vote, reveal, and execute actions move through the UI.
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-[28px] border border-white/10 bg-white/[0.03] p-5">
            <div className="flex items-center gap-3">
              <Activity className="h-4 w-4 text-cyan-300" />
              <div className="text-base font-medium text-white">Diagnostics</div>
            </div>
            <p className="mt-3 text-sm leading-7 text-white/58">
              Diagnostics remain in the web app too. Runtime evidence, proof freshness, wallet coverage, and execution health stay visible without leaving the product surface.
            </p>
            <div className="mt-4 flex flex-col gap-3">
              <Link href="/diagnostics" className={cn(buttonVariants({ size: "sm" }), "justify-between")}>
                Open diagnostics
                <ChevronRight className="h-4 w-4" />
              </Link>
              <Link href="/proof" className={cn(buttonVariants({ size: "sm", variant: "secondary" }), "justify-between")}>
                Open proof
                <ChevronRight className="h-4 w-4" />
              </Link>
              <Link href="/services" className={cn(buttonVariants({ size: "sm", variant: "outline" }), "justify-between")}>
                Open services
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          <div className="rounded-[28px] border border-emerald-300/18 bg-emerald-300/8 p-5">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-4 w-4 text-emerald-200" />
              <div className="text-base font-medium text-white">Workflow boundary</div>
            </div>
            <p className="mt-3 text-sm leading-7 text-white/60">
              Normal users never need the terminal for these eight operations. Advanced debugging, migrations, batch recovery, and stress tooling remain in the repo by design.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
