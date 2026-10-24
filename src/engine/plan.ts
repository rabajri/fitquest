import { ACTIVITY_BY_DAYS, KCAL_PER_KG } from './constants';
import { bmrKcal, dailyCalorieTarget, tdeeKcal } from './energy';
import { fatAndCarbGrams, proteinGrams } from './macros';
import { stepGoal } from './steps';
import type { ActivityLevel, Sex } from './types';
import { waterTargetLiters } from './water';

export function activityFromDays(daysPerWeek: number): ActivityLevel {
  if (daysPerWeek <= 0) return 'sedentary';
  if (daysPerWeek <= ACTIVITY_BY_DAYS.lightMaxDays) return 'light';
  if (daysPerWeek <= ACTIVITY_BY_DAYS.moderateMaxDays) return 'moderate';
  return 'heavy';
}

export type WeightLossPlan = {
  bmr: number;
  tdee: number;
  activity: ActivityLevel;
  dailyCalorieTarget: number;
  proteinGrams: number;
  fatGrams: number;
  carbGrams: number;
  /** True if protein + minimum fat already use up all the calories (carbs were set to 0). */
  macrosExceedCalories: boolean;
  waterLiters: number;
  /** Only for users without a workout plan. */
  stepGoal: number | null;
};

/** The one place that turns a user's answers into a daily plan. Screens call this, never the formulas. */
export function calculateWeightLossPlan(input: {
  sex: Sex;
  ageYears: number;
  heightCm: number;
  weightKg: number;
  targetWeightKg: number;
  deadlineWeeks: number;
  /** 0 if the user has no workout plan. */
  daysPerWeek: number;
  /** 0 if the user has no workout plan. */
  sessionMinutes: number;
}): WeightLossPlan {
  const kgDelta = input.weightKg - input.targetWeightKg;
  const planDays = input.deadlineWeeks * 7;
  const dailyDeficitNeeded = (kgDelta * KCAL_PER_KG) / Math.max(planDays, 1);

  const activity = activityFromDays(input.daysPerWeek);
  const bmr = bmrKcal({
    weightKg: input.weightKg,
    heightCm: input.heightCm,
    ageYears: input.ageYears,
    sex: input.sex,
  });
  const tdee = tdeeKcal(bmr, activity);

  const calorieTarget = dailyCalorieTarget({
    goal: 'lose_weight',
    tdee,
    bmr,
    kgDelta,
    planDays,
  });

  const protein = proteinGrams({
    goal: 'lose_weight',
    weightKg: input.weightKg,
    activity,
    experience: 'beginner', // not used for weight loss
  });

  const { fatGrams, carbGrams } = fatAndCarbGrams({
    dailyCalorieTarget: calorieTarget,
    tdee,
    proteinGrams: protein,
    weightKg: input.weightKg,
  });

  const hasWorkout = input.daysPerWeek > 0;

  return {
    bmr,
    tdee,
    activity,
    dailyCalorieTarget: calorieTarget,
    proteinGrams: protein,
    fatGrams,
    carbGrams: Math.max(carbGrams, 0),
    macrosExceedCalories: carbGrams < 0,
    waterLiters: waterTargetLiters({
      weightKg: input.weightKg,
      sessionDurationMinutes: hasWorkout ? input.sessionMinutes : 0,
    }),
    stepGoal: hasWorkout
      ? null
      : stepGoal({ dailyDeficitKcal: dailyDeficitNeeded, weightKg: input.weightKg }),
  };
}