import {
  competitionTracks,
  getCompetitionTrackWorkspace,
} from "@/lib/site-data";
import { getTrackCommercializationPlan } from "@/lib/track-commercialization";
import { getTrackMainnetGatePlan } from "@/lib/track-mainnet-gates";

export type RankedCompetitionTrack = (typeof competitionTracks)[number] & {
  winProbability: number;
  commercialUpside: number;
  mainnetDistance: number;
  compositeScore: number;
};

function scoreFit(fit: string) {
  const text = fit.toLowerCase();
  if (text.includes("very strong")) return 9;
  if (text.includes("strong")) return 8;
  if (text.includes("moderate")) return 6;
  if (text.includes("partial")) return 4;
  return 5;
}

function scoreStatus(status: string) {
  const text = status.toLowerCase();
  if (text.includes("primary first-place")) return 10;
  if (text.includes("submission-ready")) return 8;
  if (text.includes("secondary")) return 4;
  return 6;
}

function scorePriority(priority: string) {
  const match = priority.match(/(\d+)/);
  const value = match ? Number(match[1]) : 9;
  return Math.max(1, 11 - value);
}

function scoreCommercial(slug: string) {
  const workspace = getCompetitionTrackWorkspace(slug);
  if (!workspace) return 5;
  const plan = getTrackCommercializationPlan(workspace);
  let score = 6;
  if (plan.customerOffer.toLowerCase().includes("enterprise")) score += 2;
  if (plan.customerOffer.toLowerCase().includes("hosted")) score += 1;
  if (plan.customerOffer.toLowerCase().includes("confidential")) score += 1;
  if (plan.firstPaidMotion.toLowerCase().includes("pilot")) score += 1;
  return Math.min(score, 10);
}

function scoreMainnetDistance(slug: string) {
  const workspace = getCompetitionTrackWorkspace(slug);
  if (!workspace) return 5;
  const plan = getTrackMainnetGatePlan(workspace);
  const beforeCount = plan.beforeMainnet.length;
  if (beforeCount <= 2) return 8;
  if (beforeCount === 3) return 7;
  return 6;
}

export function getRankedCompetitionTracks(): RankedCompetitionTrack[] {
  return competitionTracks
    .map((track) => {
      const winProbability = Math.min(
        10,
        Math.round(
          (scoreFit(track.fit) * 0.4 +
            scoreStatus(track.status) * 0.35 +
            scorePriority(track.priority) * 0.25) *
            10,
        ) / 10,
      );
      const commercialUpside = scoreCommercial(track.slug);
      const mainnetDistance = scoreMainnetDistance(track.slug);
      const compositeScore = Math.round(
        (winProbability * 0.45 +
          commercialUpside * 0.35 +
          mainnetDistance * 0.2) *
          10,
      ) / 10;

      return {
        ...track,
        winProbability,
        commercialUpside,
        mainnetDistance,
        compositeScore,
      };
    })
    .sort((left, right) => right.compositeScore - left.compositeScore);
}
