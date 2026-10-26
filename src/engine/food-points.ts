import { FOOD_POINTS, POINTS } from './constants';
import { caloriePoints } from './points';

type Intake = { logged: number; target: number | null };

/** Share of the target reached, from 0 to 1. Going over still counts as full. */
function shareOfTarget({ logged, target }: Intake) {
  return target && target > 0 ? Math.min(logged / target, 1) : 0;
}

function round1(n: number) {
  return Math.round(n * 10) / 10;
}

/**
 * Points for the food quest.
 * Calories keep their own rule (full marks near target, taper when far off),
 * scaled down to their share of the quest.
 * Protein, fat and carbs are proportional: half the target = half the points.
 */
export function foodPoints(input: {
  calories: Intake;
  protein: Intake;
  fat: Intake;
  carbs: Intake;
}) {
  const calories = input.calories.target
    ? caloriePoints(input.calories.logged, input.calories.target) *
      (FOOD_POINTS.calories / POINTS.calorieMax)
    : 0;
  const protein = shareOfTarget(input.protein) * FOOD_POINTS.protein;
  const fat = shareOfTarget(input.fat) * FOOD_POINTS.fat;
  const carbs = shareOfTarget(input.carbs) * FOOD_POINTS.carbs;

  return {
    calories: round1(calories),
    protein: round1(protein),
    fat: round1(fat),
    carbs: round1(carbs),
    total: round1(calories + protein + fat + carbs),
  };
}