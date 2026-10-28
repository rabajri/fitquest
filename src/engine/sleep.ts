/** Minutes after midnight for a local "HH:MM" or "HH:MM:SS" time (the database returns seconds too). */
export function timeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return (h ?? 0) * 60 + (m ?? 0);
}

/**
 * Hours slept between a bedtime and a wake-up time, to one decimal.
 * If the wake-up time is earlier in the clock than the bedtime, the night crossed midnight.
 *
 * Example: bed 23:30, wake 07:00 → 7.5 hours. Bed 01:00, wake 08:30 → 7.5 hours.
 */
export function sleepHoursBetween(bedtime: string, wakeTime: string): number {
  let minutes = timeToMinutes(wakeTime) - timeToMinutes(bedtime);
  if (minutes <= 0) minutes += 24 * 60;
  return Math.round((minutes / 60) * 10) / 10;
}
