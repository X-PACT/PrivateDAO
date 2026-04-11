"use client";

import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

type VoteChoice = "Approve" | "Reject" | "Abstain";

type GovernanceLogEntry = {
  label: string;
  value: string;
};

type GovernanceExecutionIntent = {
  payoutProfile: string;
  payoutTitle: string;
  telemetryMode: string;
  amountDisplay: string;
  reference: string;
  purpose: string;
  executionTarget: string;
  evidenceRoute: string;
};

type GovernanceSessionState = {
  daoName: string;
  daoCreated: boolean;
  proposalTitle: string;
  reviewContextKey: string | null;
  executionIntentKey: string | null;
  executionIntent: GovernanceExecutionIntent | null;
  proposalCreated: boolean;
  voteChoice: VoteChoice;
  voteCommitted: boolean;
  voteRevealed: boolean;
  proposalFinalized: boolean;
  proposalExecuted: boolean;
  logs: GovernanceLogEntry[];
};

type GovernanceSessionContextValue = GovernanceSessionState & {
  setDaoName: (value: string) => void;
  setProposalTitle: (value: string) => void;
  setVoteChoice: (value: VoteChoice) => void;
  stageReviewContext: (input: {
    proposalId: string;
    proposalTitle: string;
    proposalStatus: string;
    telemetryMode: string;
    source: string;
  }) => void;
  stageExecutionIntent: (input: {
    proposalId: string;
    payoutProfile: string;
    payoutTitle: string;
    telemetryMode: string;
    amountDisplay: string;
    reference: string;
    purpose: string;
    executionTarget: string;
    evidenceRoute: string;
    source: string;
  }) => void;
  createDao: () => void;
  createProposal: () => void;
  commitVote: () => void;
  revealVote: () => void;
  finalizeProposal: () => void;
  executeProposal: () => void;
  resetSession: () => void;
};

const STORAGE_KEY = "privatedao-governance-session";

const defaultState: GovernanceSessionState = {
  daoName: "PrivateDAO Frontier Council",
  daoCreated: false,
  proposalTitle: "Confidential payroll batch / April",
  reviewContextKey: null,
  executionIntentKey: null,
  executionIntent: null,
  proposalCreated: false,
  voteChoice: "Approve",
  voteCommitted: false,
  voteRevealed: false,
  proposalFinalized: false,
  proposalExecuted: false,
  logs: [],
};

const GovernanceSessionContext = createContext<GovernanceSessionContextValue | null>(null);

export function GovernanceSessionProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<GovernanceSessionState>(() => {
    if (typeof window === "undefined") return defaultState;
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState;

    try {
      const parsed = JSON.parse(raw) as Partial<GovernanceSessionState>;
      return {
        ...defaultState,
        ...parsed,
        logs: Array.isArray(parsed.logs) ? parsed.logs : [],
      };
    } catch {
      window.localStorage.removeItem(STORAGE_KEY);
      return defaultState;
    }
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  function withLog(current: GovernanceSessionState, label: string, value: string): GovernanceSessionState {
    return {
      ...current,
      logs: [{ label, value }, ...current.logs].slice(0, 8),
    };
  }

  const value = useMemo<GovernanceSessionContextValue>(
    () => ({
      ...state,
      setDaoName: (daoName) => setState((current) => ({ ...current, daoName })),
      setProposalTitle: (proposalTitle) => setState((current) => ({ ...current, proposalTitle })),
      setVoteChoice: (voteChoice) => setState((current) => ({ ...current, voteChoice })),
      stageReviewContext: ({ proposalId, proposalTitle, proposalStatus, telemetryMode, source }) =>
        setState((current) => {
          const reviewContextKey = `${proposalId}:${proposalStatus}:${telemetryMode}:${source}`;
          if (current.reviewContextKey === reviewContextKey) {
            return current;
          }

          return withLog(
            {
              ...current,
              proposalTitle,
              reviewContextKey,
            },
            "Review context loaded",
            `${proposalId} · ${proposalTitle} staged from ${source} with ${telemetryMode} telemetry mode.`,
          );
        }),
      stageExecutionIntent: ({
        proposalId,
        payoutProfile,
        payoutTitle,
        telemetryMode,
        amountDisplay,
        reference,
        purpose,
        executionTarget,
        evidenceRoute,
        source,
      }) =>
        setState((current) => {
          const executionIntentKey = `${proposalId}:${payoutProfile}:${telemetryMode}:${reference}:${source}`;
          if (current.executionIntentKey === executionIntentKey) {
            return current;
          }

          return withLog(
            {
              ...current,
              executionIntentKey,
              executionIntent: {
                payoutProfile,
                payoutTitle,
                telemetryMode,
                amountDisplay,
                reference,
                purpose,
                executionTarget,
                evidenceRoute,
              },
            },
            "Execution request loaded",
            `${proposalId} · ${payoutTitle} · ${amountDisplay} · ${reference} staged from ${source}.`,
          );
        }),
      createDao: () =>
        setState((current) =>
          withLog(
            {
              ...current,
              daoCreated: true,
              proposalCreated: false,
              voteCommitted: false,
              voteRevealed: false,
              proposalFinalized: false,
              proposalExecuted: false,
            },
            "DAO created",
            `${current.daoName} staged in the product shell and ready for proposal creation.`,
          ),
        ),
      createProposal: () =>
        setState((current) =>
          withLog(
            {
              ...current,
              proposalCreated: true,
              voteCommitted: false,
              voteRevealed: false,
              proposalFinalized: false,
              proposalExecuted: false,
            },
            "Proposal created",
            `${current.proposalTitle} is now the active proposal in the UI flow.`,
          ),
        ),
      commitVote: () =>
        setState((current) =>
          withLog(
            { ...current, voteCommitted: true },
            "Vote committed",
            `${current.voteChoice} was committed through the wallet-first governance path.`,
          ),
        ),
      revealVote: () =>
        setState((current) =>
          withLog(
            { ...current, voteRevealed: true },
            "Vote revealed",
            `${current.voteChoice} moved into the reveal stage with proof and diagnostics still available.`,
          ),
        ),
      finalizeProposal: () =>
        setState((current) =>
          withLog(
            { ...current, proposalFinalized: true },
            "Proposal finalized",
            `${current.proposalTitle} has been finalized in the staged UI flow and is now waiting on execution timing.`,
          ),
        ),
      executeProposal: () =>
        setState((current) =>
          withLog(
            { ...current, proposalExecuted: true },
            "Proposal executed",
            `${current.proposalTitle} advanced to the execute stage in the product workflow.`,
          ),
        ),
      resetSession: () => setState(defaultState),
    }),
    [state],
  );

  return <GovernanceSessionContext.Provider value={value}>{children}</GovernanceSessionContext.Provider>;
}

export function useGovernanceSession() {
  const context = useContext(GovernanceSessionContext);
  if (!context) {
    throw new Error("useGovernanceSession must be used within GovernanceSessionProvider");
  }
  return context;
}
