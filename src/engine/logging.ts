import { LOGGING } from './constants';

/** What was logged today, straight from the day's log row. Sleep and mood don't exist yet, so they are optional. */
export type LoggedToday = {
  /** How many times food was added today. */
  mealsLogged: number;
  waterLiters: number;
  waterTargetLiters: number | null;
  steps: number;
  sleepHours?: number | null;
  mood?: number | null;
};

/**
 * How many logging items were earned today (each is worth one logging point):
 * - one per food entry, up to LOGGING.maxMealsCounted
 * - water, once the user has drunk LOGGING.waterCountsAtShare of the target
 * - steps, once any are logged
 * - sleep and mood, once logged
 * This number feeds both the logging bonus and the streak.
 */
export function loggedItemCount(log: LoggedToday): number {
  const meals = Math.min(Math.max(log.mealsLogged, 0), LOGGING.maxMealsCounted);

  const hasWaterTarget = log.waterTargetLiters !== null && log.waterTargetLiters > 0;
  const waterDone = hasWaterTarget
    ? log.waterLiters >= (log.waterTargetLiters as number) * LOGGING.waterCountsAtShare
    : log.waterLiters > 0;

  const others = [waterDone, log.steps > 0, (log.sleepHours ?? 0) > 0, (log.mood ?? 0) > 0];
  return meals + others.filter(Boolean).length;
}

/**
 * Extra logging item for finishing the water target (0 or 1).
 * It only adds to the logging bonus. It does NOT count toward the streak,
 * so water alone can't keep a streak alive.
 */
export function waterFullBonusItems(log: LoggedToday): number {
  const hasWaterTarget = log.waterTargetLiters !== null && log.waterTargetLiters > 0;
  if (!hasWaterTarget) return 0;
  return log.waterLiters >= (log.waterTargetLiters as number) * LOGGING.waterFullShare ? 1 : 0;
}