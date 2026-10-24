import { STEPS } from './constants';

export function stepGoal(input: { dailyDeficitKcal: number; weightKg: number }): number {
  const targetKcal = input.dailyDeficitKcal * STEPS.deficitContribution;
  const needed = targetKcal / (input.weightKg * STEPS.kcalPerStepPerKg);
  return Math.min(STEPS.maxGoal, Math.max(STEPS.minGoal, needed));
}

export function stepCaloriesBurned(stepsLogged: number, weightKg: number): number {
  return stepsLogged * weightKg * STEPS.kcalPerStepPerKg;
}
