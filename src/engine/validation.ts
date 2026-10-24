import { KCAL_PER_KG, MUSCLE_GAIN, WEIGHT_LOSS } from './constants';
import type { ExperienceLevel } from './types';

export type DeadlineCheck =
  | { ok: true; warning?: string }
  | { ok: false; message: string };

export function validateWeightLossDeadline(input: {
  currentWeightKg: number;
  targetWeightKg: number;
  timelineDays: number;
  wantsWorkout: boolean;
}): DeadlineCheck {
  const toLose = input.currentWeightKg - input.targetWeightKg;
  if (toLose <= 0) {
    return { ok: false, message: 'Target weight must be below current weight.' };
  }

  const maxSafeKgPerWeek = input.currentWeightKg * WEIGHT_LOSS.maxPercentPerWeek;
  const maxAllowed = maxSafeKgPerWeek * (input.timelineDays / 7);
  if (toLose > maxAllowed) {
    return {
      ok: false,
      message:
        'This rate exceeds safe limits (greater than 1%/week). Please extend your deadline or lower your target weight.',
    };
  }

  if (!input.wantsWorkout) {
    return {
      ok: true,
      warning:
        'Your goal is achievable, but because workout frequency is low, success depends heavily on diet discipline.',
    };
  }

  return { ok: true };
}

export function validateMuscleGainDeadline(input: {
  currentWeightKg: number;
  kgToGain: number;
  timelineDays: number;
  experience: ExperienceLevel;
}): DeadlineCheck {
  const cap = MUSCLE_GAIN.maxPercentPerMonth[input.experience];
  const maxAllowed = input.currentWeightKg * cap * (input.timelineDays / 30);
  if (input.kgToGain > maxAllowed) {
    return {
      ok: false,
      message:
        'Lean muscle building takes time. This rate exceeds biological limits for your experience level. Please extend your timeline.',
    };
  }
  return { ok: true };
}

export function kcalFromKg(kg: number): number {
  return kg * KCAL_PER_KG;
}
