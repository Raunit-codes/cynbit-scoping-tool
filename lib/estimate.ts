import { findPillar, findStage, findTimeline } from "./domain";
import { EstimateRange, PillarId, StageId, TimelineId } from "./types";

const PER_SCOPE_ITEM_THOUSANDS = 35;
const LOW_FACTOR = 0.85;
const HIGH_FACTOR = 1.25;

/**
 * Pure, deterministic estimate calculation. Figures are illustrative
 * placeholders — calibrate base/multiplier values against Cynbit's real
 * rate card before this goes live.
 *
 * This function is the single source of truth: the wizard calls it for
 * instant client-side feedback, and the API route calls it again on the
 * server using only the IDs the client submitted (never a client-supplied
 * number) so a tampered request can't inflate or deflate its own quote.
 */
export function computeEstimate(
  pillarId: PillarId,
  scopeIds: string[],
  stageId: StageId,
  timelineId: TimelineId
): EstimateRange | null {
  const pillar = findPillar(pillarId);
  const stage = findStage(stageId);
  const timeline = findTimeline(timelineId);
  if (!pillar || !stage || !timeline) return null;

  // Only count scope items that actually belong to the chosen pillar —
  // prevents a crafted request from padding the item count with IDs
  // borrowed from a different pillar.
  const validScopeIds = new Set(pillar.scope.map((s) => s.id));
  const validCount = scopeIds.filter((id) => validScopeIds.has(id)).length;

  const raw = (pillar.base + validCount * PER_SCOPE_ITEM_THOUSANDS) * stage.multiplier * timeline.multiplier;

  return {
    lowThousandsINR: Math.round((raw * LOW_FACTOR) / 5) * 5,
    highThousandsINR: Math.round((raw * HIGH_FACTOR) / 5) * 5,
  };
}

export function formatINR(thousands: number): string {
  if (thousands >= 100) {
    const lakhs = thousands / 100;
    return `₹${lakhs % 1 === 0 ? lakhs.toFixed(0) : lakhs.toFixed(1)}L`;
  }
  return `₹${thousands}k`;
}

export function formatRange(range: EstimateRange): string {
  return `${formatINR(range.lowThousandsINR)} – ${formatINR(range.highThousandsINR)}`;
}
