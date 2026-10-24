import { MILESTONES, MUSCLE_GAIN, WEIGHT_LOSS } from './constants';
import type { GoalType } from './types';

function shrinkRateFor(goal: GoalType): number {
  return goal === 'lose_weight' ? WEIGHT_LOSS.shrinkRate : MUSCLE_GAIN.shrinkRate;
}

/** How many markers a plan of this length has (one per 30 days, rounded up, at least 1). */
export function markerCount(totalDays: number): number {
  return Math.max(1, Math.ceil(totalDays / MILESTONES.daysPerMarker));
}

/**
 * How many kg each marker owns.
 * - Days are split evenly, so every marker lasts totalDays / monthCount days.
 * - Earlier markers get bigger shares (each share is shrinkRate times the one before).
 * - Weight loss only: if a marker would need more than the safe weekly pace, the extra kg
 *   move to the later markers. The last marker absorbs any remainder.
 * Pass startKg and totalDays to switch the safety cap on.
 */
export function monthlyKgTargets(input: {
  goal: GoalType;
  totalKgDelta: number;
  monthCount: number;
  startKg?: number;
  totalDays?: number;
}): number[] {
  const { goal, totalKgDelta, monthCount, startKg, totalDays } = input;
  const shrink = shrinkRateFor(goal);

  const weights = Array.from({ length: monthCount }, (_, i) => shrink ** i);
  const weightSum = weights.reduce((a, b) => a + b, 0);
  const kg = weights.map((w) => (w / weightSum) * totalKgDelta);

  const capIsOn = goal === 'lose_weight' && startKg !== undefined && totalDays !== undefined;
  if (!capIsOn) return kg;

  const weeksPerMarker = totalDays / monthCount / 7;
  let bodyWeight = startKg;

  for (let i = 0; i < monthCount; i++) {
    const cap = bodyWeight * WEIGHT_LOSS.maxPercentPerWeek * weeksPerMarker;
    const isLast = i === monthCount - 1;

    if (!isLast && kg[i]! > cap) {
      const excess = kg[i]! - cap;
      kg[i] = cap;
      const laterWeight = weights.slice(i + 1).reduce((a, b) => a + b, 0);
      for (let j = i + 1; j < monthCount; j++) {
        kg[j] = kg[j]! + (excess * weights[j]!) / laterWeight;
      }
    }

    bodyWeight -= kg[i]!;
  }

  return kg;
}

/** Marker n = total expected progress by the end of marker n. Visual path only; rank does NOT use this. */
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
  startKg?: number;
  totalDays?: number;
}): { monthlyKg: number[]; cumulativeKg: number[] } {
  const monthlyKg = monthlyKgTargets(input);
  return { monthlyKg, cumulativeKg: cumulativeMarkers(monthlyKg) };
}

/** Body weight at the start, then at the end of each marker (the last one is the goal). */
export function weightPath(input: {
  goal: GoalType;
  startKg: number;
  targetKg: number;
  totalDays: number;
}): number[] {
  const { goal, startKg, targetKg, totalDays } = input;
  const { cumulativeKg } = buildMarkerPath({
    goal,
    totalKgDelta: Math.abs(startKg - targetKg),
    monthCount: markerCount(totalDays),
    startKg,
    totalDays,
  });
  const direction = goal === 'lose_weight' ? -1 : 1;
  return [startKg, ...cumulativeKg.map((kg) => startKg + direction * kg)];
}