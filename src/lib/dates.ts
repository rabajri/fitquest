// Local calendar dates as YYYY-MM-DD (never UTC, so the day doesn't flip at 3 a.m. in Riyadh)

export function toLocalDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function todayLocalDate(): string {
  return toLocalDate(new Date());
}

export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

// Whole days from today (midnight) to the given date (midnight)
export function daysUntil(date: Date): number {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date(date);
  end.setHours(0, 0, 0, 0);
  return Math.round((end.getTime() - start.getTime()) / 86400000);
}