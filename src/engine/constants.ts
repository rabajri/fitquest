/**
 * Tunable knobs for the whole coach. Change numbers here — not in screens.
 * Formulas in the other engine files import these values.
 */

import type { ActivityLevel, ExperienceLevel, RankId } from './types';

/** Rank scoring uses each marker's own attainment. The cumulative path is visual only. */
export const RANK_USES_CUMULATIVE_PROGRESS = false;

export const KCAL_PER_KG = 7700;

/** Heights outside this range are rejected at onboarding (always in cm). */
export const HEIGHT_LIMITS_CM = {
  min: 120,
  max: 230,
} as const;

/** Ages outside this range are rejected at onboarding. The calorie formulas are for adults, not children. */
export const AGE_LIMITS = {
  min: 16,
  max: 100,
} as const;

/** Body weights outside this range are rejected at onboarding (always in kg). */
export const WEIGHT_LIMITS_KG = {
  min: 30,
  max: 300,
} as const;

/** Training days per week → activity level. 0 days is sedentary. (The spec's ranges overlap at 3 days; 3 counts as light.) */
export const ACTIVITY_BY_DAYS = {
  lightMaxDays: 3,
  moderateMaxDays: 5,
} as const;

/** Session lengths offered on the Gym Setup screen (minutes). */
export const SESSION_MINUTES_OPTIONS = [30, 45, 60, 90] as const;

/** Quick-log buttons on the dashboard. */
export const LOGGING = {
  waterStepLiters: 0.25,
  maxMealsCounted: 5,
  waterCountsAtShare: 0.5,
  waterFullShare: 1,
} as const;

/** Milestones: how long one marker (one "month") lasts. */
export const MILESTONES = {
  daysPerMarker: 30,
} as const;

/**
 * Monthly Trial bands. Each number is the attainment % where that band STARTS.
 * Below veryLowFrom (negative progress) counts as regression.
 */
export const TRIAL_BANDS = {
  veryLowFrom: 0,
  lowFrom: 30,
  holdFrom: 50,
  rankUpFrom: 70,
  strongRankUpFrom: 90,
  overperformingFrom: 150,
} as const;

export const WEIGHT_LOSS = {
  /** Hard fail if the deadline implies more than this % of body weight per week. */
  maxPercentPerWeek: 0.01,
  /** Never go below this many kcal/day. */
  calorieFloor: 1200,
  /** Never go below this fraction of BMR. */
  bmrFloorMultiplier: 0.85,
  /** Later months get a smaller slice of the remaining goal. */
  shrinkRate: 0.9,
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
  calorieMax: 20, movementMax: 20, taskMax: 20, sleepMax: 20,
  loggingPerItem: 1, loggingMax: 10,
  streakCapPoints: 30, goodDayBase: 56,
  closeBand: 0.1, steepBand: 0.25, zeroBand: 0.4,
} as const;

/**
 * Sleep quest. The spec recommends 7–9 hours a night, so that whole range earns full points.
 * Below it, points fall in a straight line to 0 at zeroBelow hours; above it, to 0 at zeroAbove hours.
 * Times are local "HH:MM". Last night's sleep is logged on the day you wake up.
 */
export const SLEEP = {
  fullFromHours: 7,
  fullToHours: 9,
  zeroBelowHours: 4,
  zeroAboveHours: 12,
  defaultBedtime: '23:00',
  defaultWakeTime: '07:00',
  /** Anything longer is treated as a typo (e.g. AM/PM mixed up). */
  maxHours: 16,
} as const;

/** Streak rules. A streak day needs at least minItemsPerDay logged items. */
export const STREAK = {
  minItemsPerDay: 2,
  freeMissWindowDays: 7,
  freeMissesPerWindow: 1,
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

/** How the food quest's 20 points are split. These must add up to POINTS.calorieMax. */
export const FOOD_POINTS = {
  calories: 10,
  protein: 6,
  fat: 2,
  carbs: 2,
} as const;