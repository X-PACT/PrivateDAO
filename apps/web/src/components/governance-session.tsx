"use client";

import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type {
  ServiceHandoffRequestDelivery,
  ServiceHandoffRequestPayload,
} from "@/lib/service-handoff-state";
import { markStoredServiceHandoffExecuted } from "@/lib/service-handoff-state";

type VoteChoice = "Approve" | "Reject" | "Abstain";

type GovernanceLogEntry = {
  label: string;
  value: string;
};

export type GovernanceExecutionIntent = {
  payoutProfile: string;
  payoutTitle: string;
  telemetryMode: string;
  amountDisplay: string;
  reference: string;
  purpose: string;
  executionTarget: string;
  evidenceRoute: string;
  requestPayload: ServiceHandoffRequestPayload | null;
  requestDelivery: ServiceHandoffRequestDelivery | null;
};

type LiveDaoRuntime = {
  address: string;
  governanceMint: string;
  signature: string;
};

type LiveProposalRuntime = {
  address: string;
  signature: string;
};

type GovernanceSessionState = {
  daoName: string;
  daoCreated: boolean;
  liveDaoRuntime: LiveDaoRuntime | null;
  proposalTitle: string;
  reviewContextKey: string | null;
  executionIntentKey: string | null;
  executionIntent: GovernanceExecutionIntent | null;
  proposalCreated: boolean;
  liveProposalRuntime: LiveProposalRuntime | null;
  voteChoice: VoteChoice;
  voteCommitted: boolean;
  voteRevealed: boolean;
  proposalFinalized: boolean;
  proposalExecuted: boolean;
  logs: GovernanceLogEntry[];
};

function sanitizeGovernanceLogs(
  logs: GovernanceLogEntry[],
  executionIntent: GovernanceExecutionIntent | null,
) {
  const filtered = executionIntent
    ? logs.filter((entry) => {
        if (entry.label !== "Execution request loaded") {
          return true;
        }

        return (
          entry.value.includes(executionIntent.reference) &&
          entry.value.includes(executionIntent.amountDisplay)
        );
      })
    : logs;

  const deduped = filtered.filter(
    (entry, index, collection) =>
      collection.findIndex(
        (candidate) =>
          candidate.label === entry.label && candidate.value === entry.value,
      ) === index,
  );

  return deduped
    .filter((entry) => {
      return Boolean(entry.label.trim()) && Boolean(entry.value.trim());
    })
    .slice(0, 8);
}

function mergePersistedGovernanceState(parsed: Partial<GovernanceSessionState>): GovernanceSessionState {
  const mergedState = {
    ...defaultState,
    ...parsed,
    logs: Array.isArray(parsed.logs) ? parsed.logs : [],
  };

  return {
    ...mergedState,
    logs: sanitizeGovernanceLogs(mergedState.logs, mergedState.executionIntent ?? null),
  };
}

function deriveExecutionContinuityFlags(
  requestDelivery: ServiceHandoffRequestDelivery | null | undefined,
  requestPayload: ServiceHandoffRequestPayload | null | undefined,
) {
  const deliveryState = requestDelivery?.state ?? requestPayload?.state ?? "draft";
  const delivered =
    deliveryState === "delivered" || deliveryState === "ready-for-execution";
  const staged =
    delivered || deliveryState === "staged" || deliveryState === "ready-for-delivery";

  return {
    daoCreated: staged,
    proposalCreated: staged,
    voteCommitted: staged,
    voteRevealed: staged,
    proposalFinalized: staged,
    proposalExecuted: deliveryState === "executed",
  };
}

type GovernanceSessionContextValue = GovernanceSessionState & {
  setDaoName: (value: string) => void;
  setProposalTitle: (value: string) => void;
  setVoteChoice: (value: VoteChoice) => void;
  recordLog: (label: string, value: string) => void;
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
    requestPayload?: ServiceHandoffRequestPayload | null;
    requestDelivery?: ServiceHandoffRequestDelivery | null;
    source: string;
  }) => void;
  createDao: (liveRuntime?: LiveDaoRuntime | null) => void;
  createProposal: (liveRuntime?: LiveProposalRuntime | null) => void;
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
  liveDaoRuntime: null,
  proposalTitle: "Confidential payroll batch / April",
  reviewContextKey: null,
  executionIntentKey: null,
  executionIntent: null,
  proposalCreated: false,
  liveProposalRuntime: null,
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
      return mergePersistedGovernanceState(parsed);
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
      logs: sanitizeGovernanceLogs(
        [{ label, value }, ...current.logs],
        current.executionIntent,
      ),
    };
  }

  const value = useMemo<GovernanceSessionContextValue>(
    () => ({
      ...state,
      setDaoName: (daoName) => setState((current) => ({ ...current, daoName })),
      setProposalTitle: (proposalTitle) => setState((current) => ({ ...current, proposalTitle })),
      setVoteChoice: (voteChoice) => setState((current) => ({ ...current, voteChoice })),
      recordLog: (label, value) =>
        setState((current) => withLog(current, label, value)),
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
        requestPayload,
        requestDelivery,
        source,
      }) =>
        setState((current) => {
          const executionIntentKey = `${proposalId}:${payoutProfile}:${telemetryMode}:${reference}:${requestPayload?.requestId ?? "no-request"}:${requestDelivery?.state ?? "draft"}:${source}`;
          const nextExecutionIntent = {
            payoutProfile,
            payoutTitle,
            telemetryMode,
            amountDisplay,
            reference,
            purpose,
            executionTarget,
            evidenceRoute,
            requestPayload: requestPayload ?? null,
            requestDelivery: requestDelivery ?? null,
          };
          const continuityFlags = deriveExecutionContinuityFlags(
            requestDelivery ?? null,
            requestPayload ?? null,
          );
          const sanitizedLogs = sanitizeGovernanceLogs(current.logs, nextExecutionIntent);
          if (current.executionIntentKey === executionIntentKey) {
            if (sanitizedLogs === current.logs) {
              return current;
            }

            return {
              ...current,
              ...continuityFlags,
              executionIntent: nextExecutionIntent,
              logs: sanitizedLogs,
            };
          }

          return withLog(
            {
              ...current,
              ...continuityFlags,
              executionIntentKey,
              executionIntent: nextExecutionIntent,
              logs: sanitizedLogs,
            },
            "Execution request loaded",
            `${proposalId} · ${requestPayload?.requestId ?? payoutTitle} · ${amountDisplay} · ${reference} staged from ${source}.`,
          );
        }),
      createDao: (liveRuntime) =>
        setState((current) =>
          withLog(
            {
              ...current,
              daoCreated: true,
              liveDaoRuntime: liveRuntime ?? current.liveDaoRuntime,
              proposalCreated: false,
              liveProposalRuntime: null,
              voteCommitted: false,
              voteRevealed: false,
              proposalFinalized: false,
              proposalExecuted: false,
            },
            "DAO created",
            liveRuntime
              ? `${current.daoName} bootstrapped live on devnet at ${liveRuntime.address}.`
              : `${current.daoName} staged in the product shell and ready for proposal creation.`,
          ),
        ),
      createProposal: (liveRuntime) =>
        setState((current) =>
          withLog(
            {
              ...current,
              proposalCreated: true,
              liveProposalRuntime: liveRuntime ?? current.liveProposalRuntime,
              voteCommitted: false,
              voteRevealed: false,
              proposalFinalized: false,
              proposalExecuted: false,
            },
            "Proposal created",
            liveRuntime
              ? `${current.proposalTitle} submitted live on devnet at ${liveRuntime.address}.`
              : `${current.proposalTitle} is now the active proposal in the UI flow.`,
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
        setState((current) => {
          const nextExecutionIntent: GovernanceExecutionIntent | null = current.executionIntent?.requestPayload
            ? {
                ...current.executionIntent,
                requestPayload: {
                  ...current.executionIntent.requestPayload,
                  state: "executed",
                },
                requestDelivery: current.executionIntent.requestDelivery
                  ? {
                      ...current.executionIntent.requestDelivery,
                      state: "executed" as const,
                      stateDetail:
                        "Authoritative request object signed and submitted from the payload-driven command-center lane.",
                    }
                  : null,
              }
            : current.executionIntent;

          if (current.executionIntent?.requestPayload) {
            markStoredServiceHandoffExecuted({
              stateDetail:
                "Authoritative request object signed and submitted from the payload-driven command-center lane.",
              telemetryRoute: current.executionIntent.requestPayload.telemetryRoute,
            });
          }

          const nextState = withLog(
            {
              ...current,
              proposalExecuted: true,
              executionIntent: nextExecutionIntent,
            },
            current.executionIntent?.requestPayload ? "Delivered payload submitted" : "Proposal executed",
            current.executionIntent?.requestPayload
              ? `${current.executionIntent.requestPayload.requestId} · ${current.executionIntent.requestPayload.amountDisplay} · ${current.executionIntent.requestPayload.reference ?? "reference pending"} submitted from the payload-driven signing shell into ${current.executionIntent.requestPayload.deliveryRoute}.`
              : `${current.proposalTitle} advanced to the execute stage in the product workflow.`,
          );

          return current.executionIntent?.requestPayload
            ? withLog(
                nextState,
                "Runtime review lane attached",
                `${current.executionIntent.requestPayload.telemetryRoute} remains attached to the same authoritative request object after submit.`,
              )
            : nextState;
        }),
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
