import { MUSCLE_GAIN, WEIGHT_LOSS } from './constants';
import type { GoalType } from './types';

function decayRate(goal: GoalType, monthIndex: number): number {
  const shrink = goal === 'lose_weight' ? WEIGHT_LOSS.shrinkRate : MUSCLE_GAIN.shrinkRate;
  return shrink ** (monthIndex - 1);
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
