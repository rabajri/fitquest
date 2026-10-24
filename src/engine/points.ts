import { POINTS } from './constants';

/**
 * Points for being CLOSE to a target (calories, sleep).
 * Within 10% off → full marks. Between 10% and 25% off → loses 1 point per extra 1%.
 * More than 25% off → 0. (Open question from the spec: this is a hard cliff from 5 to 0.)
 *
 * Example: target 2300, ate 2000 → 13% off → 20 - (13 - 10) = 17 points.
 */
export function closenessPoints(actual: number, target: number, maxPoints: number): number {
  if (target <= 0) return 0;
  const off = Math.abs(actual - target) / target;
  if (off <= POINTS.closeBand) return maxPoints;
  if (off <= POINTS.zeroBand) return Math.max(maxPoints - (off - POINTS.closeBand) * 100, 0);
  return 0;
}

/**
 * Points for finishing a share of a plan (workout minutes, steps, tasks).
 * Capped at full marks so nobody can farm points by overdoing it.
 *
 * Example: planned 40 min, did 20 → 10 points.
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

/** Share of today's required logs that are done, from 0 to 1. */
export function loggingPoints(completedShare: number): number {
  if (completedShare >= 1) return POINTS.loggingMax;
  if (completedShare >= POINTS.loggingMostShare) return POINTS.loggingMostPoints;
  if (completedShare > 0) return POINTS.loggingSomePoints;
  return 0;
}

/** Maximum points available from the four daily scores. */
export const DAILY_POINTS_MAX =
  POINTS.calorieMax + POINTS.movementMax + POINTS.taskMax + POINTS.sleepMax;