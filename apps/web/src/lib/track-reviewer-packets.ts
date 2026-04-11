export const TRACK_REVIEWER_PACKET_SLUGS = new Set([
  "colosseum-frontier",
  "privacy-track",
  "rpc-infrastructure",
]);

const TRACK_REVIEWER_PACKET_PUBLIC_LABELS: Record<string, string> = {
  "colosseum-frontier": "Frontier Reviewer Packet",
  "privacy-track": "Confidential Governance Reviewer Packet",
  "rpc-infrastructure": "Runtime Infrastructure Reviewer Packet",
};

const TRACK_REVIEWER_PACKET_PUBLIC_SUMMARIES: Record<string, string> = {
  "colosseum-frontier":
    "Judge packet for the main Frontier submission with the judge-first opening, proof closure, exact blocker, best demo route, and reviewer links.",
  "privacy-track":
    "Judge packet for the confidential-governance corridor with the judge-first opening, proof closure, exact blocker, best demo route, and reviewer links.",
  "rpc-infrastructure":
    "Judge packet for the runtime-infrastructure corridor with the judge-first opening, proof closure, exact blocker, best demo route, and reviewer links.",
};

export function getTrackReviewerPacketDocumentSlug(trackSlug: string) {
  return `track-reviewer-packet-${trackSlug}`;
}

export function getTrackReviewerPacketDocumentPath(trackSlug: string) {
  return `docs/track-reviewer-packets/${trackSlug}.generated.md`;
}

export function getTrackReviewerPacketRoute(trackSlug: string) {
  return `/documents/${getTrackReviewerPacketDocumentSlug(trackSlug)}`;
}

export function getTrackReviewerPacketPublicLabel(trackSlug: string) {
  return TRACK_REVIEWER_PACKET_PUBLIC_LABELS[trackSlug] ?? "Reviewer Packet";
}

export function getTrackReviewerPacketPublicSummary(trackSlug: string) {
  return (
    TRACK_REVIEWER_PACKET_PUBLIC_SUMMARIES[trackSlug] ??
    "Judge packet with the opening, proof closure, exact blocker, best demo route, and reviewer links."
  );
}
