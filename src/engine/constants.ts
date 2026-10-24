/**
 * Tunable knobs for the whole coach. Change numbers here — not in screens.
 * Formulas in the other engine files import these values.
 */

import type { ActivityLevel, ExperienceLevel, RankId } from './types';

/** Rank scoring uses total progress vs the marker path, not this-month-only. */
export const RANK_USES_CUMULATIVE_PROGRESS = true;

export const KCAL_PER_KG = 7700;

/** Heights outside this range are rejected at onboarding (always in cm). */
export const HEIGHT_LIMITS_CM = {
  min: 120,
  max: 230,
} as const;

export const WEIGHT_LOSS = {
  /** Hard fail if the deadline implies more than this % of body weight per week. */
  maxPercentPerWeek: 0.01,
  /** Never go below this many kcal/day. */
  calorieFloor: 1200,
  /** Never go below this fraction of BMR. */
  bmrFloorMultiplier: 0.85,
  /** Later months get a smaller slice of the remaining goal. */
  shrinkRate: 0.85,
} as const;

export const MUSCLE_GAIN = {
  shrinkRate: 0.75,
  /** Surplus is capped so extra calories are less likely to become fat. */
  maxTdeeMultiplier: 1.2,
  maxPercentPerMonth: {
    beginner: 0.01,
    intermediate: 0.005,
    advanced: 0.0025,
  } satisfies Record<ExperienceLevel, number>,
} as const;

/**
 * Muscle-gain Path B (weight + waist, no body-fat %):
 * if the waist grew, some of the scale gain is treated as fat, not muscle.
 *
 * "Small" vs "large" was missing a number in the spec. These cm cutoffs
 * are the definition — change them here if they feel too strict.
 */
export const WAIST_CHANGE_CM = {
  /** Waist same or smaller → count 100% of weight gain. */
  noneMax: 0,
  /** Above none, up to this → count 70% of weight gain. */
  smallMax: 2,
  noneMultiplier: 1,
  smallMultiplier: 0.7,
  /** Waist grew more than smallMax → count 40% of weight gain. */
  largeMultiplier: 0.4,
} as const;

export const ACTIVITY_MULTIPLIER: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  heavy: 1.725,
};

export const PROTEIN_G_PER_KG = {
  lose_weight: {
    sedentary: 1.2,
    light: 1.4,
    moderate: 1.6,
    heavy: 1.6,
  } satisfies Record<ActivityLevel, number>,
  gain_muscle: {
    beginner: 1.6,
    intermediate: 1.8,
    advanced: 2.2,
  } satisfies Record<ExperienceLevel, number>,
} as const;

export const FAT = {
  tdeeFraction: 0.25,
  minGramsPerKg: 0.8,
} as const;

export const WATER = {
  litersPerKg: 0.033,
  extraLitersPer30MinWorkout: 0.35,
} as const;

export const STEPS = {
  kcalPerStepPerKg: 0.0005,
  minGoal: 5000,
  maxGoal: 12000,
  /** Share of the daily deficit that steps are asked to cover when there is no workout plan. */
  deficitContribution: 0.3,
} as const;

export const POINTS = {
  calorieMax: 20,
  movementMax: 20,
  taskMax: 20,
  sleepMax: 20,
  loggingMax: 5,
  streakPerDay: 0.5,
  streakCapDays: 30,
  goodDayBase: 56,
  closeBand: 0.1,
  zeroBand: 0.25,
} as const;

export const RANK_ORDER: RankId[] = [
  'recruit',
  'trainee',
  'athlete',
  'warrior',
  'elite',
  'legend',
];

export const RANK_LABEL: Record<RankId, string> = {
  recruit: 'Recruit',
  trainee: 'Trainee',
  athlete: 'Athlete',
  warrior: 'Warrior',
  elite: 'Elite',
  legend: 'Legend',
};

export const XP = {
  /** XP needed to reach `level` from level 1: 100 * (level-1) * level */
  toReachLevel: (level: number) => 100 * (level - 1) * level,
  trial: {
    overperforming: 300,
    strong: 300,
    rankUp: 150,
    hold: 50,
    low: 0,
    veryLow: 0,
    regression: 0,
  },
} as const;