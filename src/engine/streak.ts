import { STREAK } from './constants';

export type StreakDay = { date: string; itemsLogged: number };
export type StreakResult = {
  /** Current streak length. It has no limit; only the bonus points are capped. */
  streakDays: number;
  /** True while one more missed day would end the streak (the free miss was already used). */
  atRisk: boolean;
};

/** Whole-day number for a YYYY-MM-DD date (no time zones involved). */
function dayNumber(date: string): number {
  const [y, m, d] = date.split('-').map(Number);
  return Date.UTC(y!, m! - 1, d!) / 86400000;
}

/**
 * Works out the streak from the days the user logged.
 * - A day counts if at least STREAK.minItemsPerDay items were logged.
 * - The first missed day is free: the streak stays alive (it just doesn't grow).
 * - A second missed day within STREAK.freeMissWindowDays ends the streak.
 * - Today is never a miss, because it is still in progress.
 * Days with no log at all count as 0 items.
 */
export function calculateStreak(days: StreakDay[], today: string): StreakResult {
  if (days.length === 0) return { streakDays: 0, atRisk: false };

  const itemsByDay = new Map<number, number>();
  for (const day of days) itemsByDay.set(dayNumber(day.date), day.itemsLogged);

  const todayNumber = dayNumber(today);
  const firstDay = Math.min(...itemsByDay.keys());

  let streak = 0;
  let lastFreeMissDay: number | null = null;

  for (let d = firstDay; d <= todayNumber; d++) {
    const met = (itemsByDay.get(d) ?? 0) >= STREAK.minItemsPerDay;
    if (met) {
      streak += 1;
    } else if (d === todayNumber) {
      // Today is still in progress, so it is not a miss yet
    } else if (streak > 0) {
      const usedFreeMissRecently =
        lastFreeMissDay !== null && d - lastFreeMissDay < STREAK.freeMissWindowDays;
      if (usedFreeMissRecently) {
        streak = 0;
        lastFreeMissDay = null;
      } else {
        lastFreeMissDay = d;
      }
    }
  }

  const atRisk =
    streak > 0 &&
    lastFreeMissDay !== null &&
    todayNumber - lastFreeMissDay < STREAK.freeMissWindowDays;

  return { streakDays: streak, atRisk };
}