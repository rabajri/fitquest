import { MILESTONES, MUSCLE_GAIN, WEIGHT_LOSS } from './constants';
import type { GoalType } from './types';

function decayRate(goal: GoalType, monthIndex: number): number {
  const shrink = goal === 'lose_weight' ? WEIGHT_LOSS.shrinkRate : MUSCLE_GAIN.shrinkRate;
  return shrink ** (monthIndex - 1);
}

/** How many markers a plan of this length has (one per 30 days, rounded up, at least 1). */
export function markerCount(totalDays: number): number {
  return Math.max(1, Math.ceil(totalDays / MILESTONES.daysPerMarker));
}

/** How many kg this marker "owns" (used to build the cumulative path). */
export function monthlyKgTargets(input: {
  goal: GoalType;
  totalKgDelta: number;
  monthCount: number;
}): number[] {
  const weights = Array.from({ length: input.monthCount }, (_, i) =>
    decayRate(input.goal, i + 1),
  );
  const sum = weights.reduce((a, b) => a + b, 0);
  return weights.map((w) => (w / sum) * input.totalKgDelta);
}

/** Marker n = total expected progress by the end of month n. Visual path only; rank does NOT use this. */
export function cumulativeMarkers(monthlyTargets: number[]): number[] {
  const out: number[] = [];
  monthlyTargets.forEach((kg, i) => {
    out.push((out[i - 1] ?? 0) + kg);
  });
  return out;
}

export function buildMarkerPath(input: {
  goal: GoalType;
  totalKgDelta: number;
  monthCount: number;
}): { monthlyKg: number[]; cumulativeKg: number[] } {
  const monthlyKg = monthlyKgTargets(input);
  return { monthlyKg, cumulativeKg: cumulativeMarkers(monthlyKg) };
}

/**
 * The weights shown on the journey path: where you start, then where you should be
 * at the end of each marker. The last number is your goal.
 */
export function weightPath(input: {
  goal: GoalType;
  startKg: number;
  targetKg: number;
  totalDays: number;
}): number[] {
  const totalKgDelta = Math.abs(input.startKg - input.targetKg);
  const { cumulativeKg } = buildMarkerPath({
    goal: input.goal,
    totalKgDelta,
    monthCount: markerCount(input.totalDays),
  });
  const direction = input.goal === 'lose_weight' ? -1 : 1;
  return [input.startKg, ...cumulativeKg.map((kg) => input.startKg + direction * kg)];
}