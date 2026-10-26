import { POINTS } from './constants';

/**
 * Points for being CLOSE to a target (calories, sleep).
 * - Within closeBand (10%) of target: full marks.
 * - Then 1 point lost per extra 1%, down to steepBand (25%).
 * - Then a gentle taper to 0 at zeroBand (40%). No cliff.
 * Over or under the target counts the same.
 *
 * Example: target 1550, ate 1300 → 16% off → 20 - 6 = 14 points.
 */
export function closenessPoints(actual: number, target: number, maxPoints: number): number {
  if (target <= 0) return 0;
  const off = Math.abs(actual - target) / target;
  if (off <= POINTS.closeBand) return maxPoints;

  const valueAtSteep = Math.max(maxPoints - (POINTS.steepBand - POINTS.closeBand) * 100, 0);
  if (off <= POINTS.steepBand) {
    return Math.max(maxPoints - (off - POINTS.closeBand) * 100, 0);
  }
  if (off < POINTS.zeroBand) {
    return (valueAtSteep * (POINTS.zeroBand - off)) / (POINTS.zeroBand - POINTS.steepBand);
  }
  return 0;
}

/**
 * Points for finishing a share of a plan (workout exercises, steps, tasks).
 * Capped at full marks so nobody can farm points by overdoing it.
 *
 * Example: planned 10 exercises, did 5 → 10 points.
 */
export function ratioPoints(done: number, planned: number, maxPoints: number): number {
  if (planned <= 0) return 0;
  return Math.min(done / planned, 1) * maxPoints;
}

export function caloriePoints(caloriesLogged: number, calorieTarget: number): number {
  return closenessPoints(caloriesLogged, calorieTarget, POINTS.calorieMax);
}

export function sleepPoints(hoursSlept: number, targetHours: number): number {
  return closenessPoints(hoursSlept, targetHours, POINTS.sleepMax);
}

export function movementPoints(done: number, planned: number): number {
  return ratioPoints(done, planned, POINTS.movementMax);
}

export function taskPoints(tasksDone: number, tasksTotal: number): number {
  return ratioPoints(tasksDone, tasksTotal, POINTS.taskMax);
}

/**
 * Logging bonus: 1 point per item logged today, up to the daily maximum.
 * bonusItems are extra items that count for points but not for the streak (full water).
 */
export function loggingPoints(itemsLogged: number, bonusItems = 0): number {
  const items = Math.max(itemsLogged, 0) + Math.max(bonusItems, 0);
  return Math.min(items * POINTS.loggingPerItem, POINTS.loggingMax);
}

/** Streak bonus: the streak day count, up to the cap. The streak itself has no limit. */
export function streakPoints(streakDays: number): number {
  return Math.min(Math.max(streakDays, 0), POINTS.streakCapPoints);
}

/** Maximum points from the four daily scores. */
export const DAILY_POINTS_MAX =
  POINTS.calorieMax + POINTS.movementMax + POINTS.taskMax + POINTS.sleepMax;

/** A perfect day: the four scores plus the logging and streak bonuses. */
export const PERFECT_DAY_POINTS =
  DAILY_POINTS_MAX + POINTS.loggingMax + POINTS.streakCapPoints;