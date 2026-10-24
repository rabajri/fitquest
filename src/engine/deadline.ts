import { WEIGHT_LOSS } from './constants';

// The fewest days in which this loss stays within the safe weekly pace
export function earliestSafeDays(input: {
  currentWeightKg: number;
  targetWeightKg: number;
}): number {
  const kgToLose = input.currentWeightKg - input.targetWeightKg;
  const maxKgPerDay = (input.currentWeightKg * WEIGHT_LOSS.maxPercentPerWeek) / 7;
  return Math.ceil(kgToLose / maxKgPerDay);
}