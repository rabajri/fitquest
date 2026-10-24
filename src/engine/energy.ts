import { ACTIVITY_MULTIPLIER, KCAL_PER_KG, MUSCLE_GAIN, WEIGHT_LOSS } from './constants';
import type { ActivityLevel, GoalType, Sex } from './types';

/** Mifflin–St Jeor. No AI. */
export function bmrKcal(input: {
  weightKg: number;
  heightCm: number;
  ageYears: number;
  sex: Sex;
}): number {
  const base = 10 * input.weightKg + 6.25 * input.heightCm - 5 * input.ageYears;
  return input.sex === 'male' ? base + 5 : base - 161;
}

export function tdeeKcal(bmr: number, activity: ActivityLevel): number {
  return bmr * ACTIVITY_MULTIPLIER[activity];
}

export function dailyCalorieTarget(input: {
  goal: GoalType;
  tdee: number;
  bmr: number;
  kgDelta: number;
  planDays: number;
}): number {
  const dailyShift = (input.kgDelta * KCAL_PER_KG) / Math.max(input.planDays, 1);

  if (input.goal === 'lose_weight') {
    const raw = input.tdee - dailyShift;
    return Math.max(raw, input.bmr * WEIGHT_LOSS.bmrFloorMultiplier, WEIGHT_LOSS.calorieFloor);
  }

  const raw = input.tdee + dailyShift;
  return Math.min(raw, input.tdee * MUSCLE_GAIN.maxTdeeMultiplier);
}
