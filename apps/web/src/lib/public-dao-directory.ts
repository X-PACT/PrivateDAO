export type PublicDaoProposalRecord = {
  pubkey: string;
  title?: string;
  phase?: string;
  privacyMode?: string;
  daoDetails?: {
    pubkey: string;
    daoName: string;
    governanceToken: string;
    authority?: string;
  } | null;
};

export type PublicDaoDirectoryEntry = {
  daoAddress: string;
  daoName: string;
  governanceMint: string;
  authority?: string;
  proposalCount: number;
  activeProposalCount: number;
  latestProposalAddress: string;
  latestProposalTitle: string;
};

const activePhases = new Set(["Voting", "Reveal", "Committed"]);
const privateNameMarkers = ["room", "secret", "sealed", "incident", "review"];

export function buildPublicDaoDirectory(records: PublicDaoProposalRecord[]): PublicDaoDirectoryEntry[] {
  const directory = new Map<string, PublicDaoDirectoryEntry>();

  for (const record of records) {
    const normalizedDaoName = record.daoDetails?.daoName.toLowerCase() ?? "";
    if (
      !record.daoDetails ||
      record.privacyMode === "private-room" ||
      record.privacyMode === "vip-private-room" ||
      privateNameMarkers.some((marker) => normalizedDaoName.includes(marker))
    ) {
      continue;
    }

    const existing = directory.get(record.daoDetails.pubkey);
    const activeProposalCount = activePhases.has(record.phase ?? "") ? 1 : 0;

    if (existing) {
      existing.proposalCount += 1;
      existing.activeProposalCount += activeProposalCount;
      if (activeProposalCount > 0) {
        existing.latestProposalAddress = record.pubkey;
        existing.latestProposalTitle = record.title ?? existing.latestProposalTitle;
      }
      continue;
    }

    directory.set(record.daoDetails.pubkey, {
      daoAddress: record.daoDetails.pubkey,
      daoName: record.daoDetails.daoName,
      governanceMint: record.daoDetails.governanceToken,
      authority: record.daoDetails.authority,
      proposalCount: 1,
      activeProposalCount,
      latestProposalAddress: record.pubkey,
      latestProposalTitle: record.title ?? "Public DAO proposal",
    });
  }

  return [...directory.values()].sort((left, right) => {
    if (left.activeProposalCount !== right.activeProposalCount) {
      return right.activeProposalCount - left.activeProposalCount;
    }
    return left.daoName.localeCompare(right.daoName);
  });
}
