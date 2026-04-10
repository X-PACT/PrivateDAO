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

type GovernanceSessionState = {
  daoName: string;
  daoCreated: boolean;
  proposalTitle: string;
  proposalCreated: boolean;
  voteChoice: VoteChoice;
  voteCommitted: boolean;
  voteRevealed: boolean;
  proposalExecuted: boolean;
  logs: GovernanceLogEntry[];
};

type GovernanceSessionContextValue = GovernanceSessionState & {
  setDaoName: (value: string) => void;
  setProposalTitle: (value: string) => void;
  setVoteChoice: (value: VoteChoice) => void;
  createDao: () => void;
  createProposal: () => void;
  commitVote: () => void;
  revealVote: () => void;
  executeProposal: () => void;
  resetSession: () => void;
};

const STORAGE_KEY = "privatedao-governance-session";

const defaultState: GovernanceSessionState = {
  daoName: "PrivateDAO Frontier Council",
  daoCreated: false,
  proposalTitle: "Confidential payroll batch / April",
  proposalCreated: false,
  voteChoice: "Approve",
  voteCommitted: false,
  voteRevealed: false,
  proposalExecuted: false,
  logs: [],
};

const GovernanceSessionContext = createContext<GovernanceSessionContextValue | null>(null);

export function GovernanceSessionProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<GovernanceSessionState>(defaultState);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return;

    try {
      const parsed = JSON.parse(raw) as Partial<GovernanceSessionState>;
      setState({
        ...defaultState,
        ...parsed,
        logs: Array.isArray(parsed.logs) ? parsed.logs : [],
      });
    } catch {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

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
      createDao: () =>
        setState((current) =>
          withLog(
            { ...current, daoCreated: true },
            "DAO created",
            `${current.daoName} staged in the product shell and ready for proposal creation.`,
          ),
        ),
      createProposal: () =>
        setState((current) =>
          withLog(
            { ...current, proposalCreated: true },
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
