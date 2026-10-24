import { WATER } from './constants';

export function waterTargetLiters(input: {
  weightKg: number;
  sessionDurationMinutes: number;
}): number {
  return input.weightKg * WATER.litersPerKg + (input.sessionDurationMinutes / 30) * WATER.extraLitersPer30MinWorkout;
}
