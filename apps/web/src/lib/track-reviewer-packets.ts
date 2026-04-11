export const TRACK_REVIEWER_PACKET_SLUGS = new Set([
  "colosseum-frontier",
  "privacy-track",
  "rpc-infrastructure",
]);

export function getTrackReviewerPacketDocumentSlug(trackSlug: string) {
  return `track-reviewer-packet-${trackSlug}`;
}

export function getTrackReviewerPacketDocumentPath(trackSlug: string) {
  return `docs/track-reviewer-packets/${trackSlug}.generated.md`;
}

export function getTrackReviewerPacketRoute(trackSlug: string) {
  return `/documents/${getTrackReviewerPacketDocumentSlug(trackSlug)}`;
}
