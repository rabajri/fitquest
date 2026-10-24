import type { SplitType } from './types';

/**
 * One scheduler. The spec described two overlapping systems:
 *  1) days/week → full body / upper-lower / PPL
 *  2) per-day tables if the user picked specific muscles
 *
 * This function is the only place that decides the split. Muscle-focus
 * tables (intense/light by day count) can be added under this, not beside it.
 */
export function determineSplitType(input: {
  daysPerWeek: number;
  targetMuscles: string[];
}): SplitType {
  const focused = input.targetMuscles.filter((m) => m !== 'full_body');
  if (focused.length > 0) return 'muscle_focus';
  if (input.daysPerWeek <= 3) return 'full_body';
  if (input.daysPerWeek === 4) return 'upper_lower';
  return 'push_pull_legs';
}

export function defaultDayLabels(split: SplitType, daysPerWeek: number): string[] {
  if (split === 'full_body') {
    return Array.from({ length: daysPerWeek }, () => 'Full Body');
  }
  if (split === 'upper_lower') {
    return Array.from({ length: daysPerWeek }, (_, i) => (i % 2 === 0 ? 'Upper' : 'Lower'));
  }
  if (split === 'push_pull_legs') {
    const pattern = ['Push', 'Pull', 'Legs'];
    return Array.from({ length: daysPerWeek }, (_, i) => pattern[i % 3]!);
  }
  return Array.from({ length: daysPerWeek }, () => 'Focus');
}
