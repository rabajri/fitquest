const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function getRecoveryWarnings(selectedDays: string[]): string[] {
  const warnings: string[] = [];

  if (selectedDays.length === 1) {
    warnings.push(
      'Training only once a week is too little: each muscle group should be trained at least twice a week for results.'
    );
  }

  const indices = selectedDays.map((d) => DAYS.indexOf(d));
  const hasBackToBack = indices.some((i) => indices.includes((i + 1) % 7));

  if (selectedDays.length >= 5) {
    warnings.push(
      'With this many training days, some will be back-to-back. We will rotate muscle groups and make some sessions lighter so you can recover.'
    );
  } else if (hasBackToBack) {
    warnings.push(
      'You picked back-to-back days. Muscles need 24-48 hours to recover (large muscles like glutes, quads, back and chest need 48-72). Spread your days out if you can.'
    );
  }

  return warnings;
}