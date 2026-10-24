import { FAT, PROTEIN_G_PER_KG } from './constants';
import type { ActivityLevel, ExperienceLevel, GoalType } from './types';

export function proteinGrams(input: {
  goal: GoalType;
  weightKg: number;
  bodyFatPercent?: number;
  activity: ActivityLevel;
  experience: ExperienceLevel;
}): number {
  const mass =
    input.bodyFatPercent == null
      ? input.weightKg
      : input.weightKg * (1 - input.bodyFatPercent / 100);

  const multiplier =
    input.goal === 'lose_weight'
      ? PROTEIN_G_PER_KG.lose_weight[input.activity]
      : PROTEIN_G_PER_KG.gain_muscle[input.experience];

  return mass * multiplier;
}

export function fatAndCarbGrams(input: {
  dailyCalorieTarget: number;
  proteinGrams: number;
  weightKg: number;
}): { fatGrams: number; carbGrams: number } {
  const proteinKcal = input.proteinGrams * 4;
  const fatGrams = Math.max(
    (input.dailyCalorieTarget * FAT.tdeeFraction) / 9,
    input.weightKg * FAT.minGramsPerKg,
  );
  const fatKcal = fatGrams * 9;
  const carbGrams = (input.dailyCalorieTarget - (proteinKcal + fatKcal)) / 4;
  return { fatGrams, carbGrams };
}
