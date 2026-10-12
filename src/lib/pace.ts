const MAX_WEEKLY_LOSS_PERCENT = 0.01; // 1% of body weight per week

export function getMinWeeksForLoss(currentWeightKg: number, targetWeightKg: number) {
  const kgToLose = currentWeightKg - targetWeightKg;
  const maxKgPerWeek = currentWeightKg * MAX_WEEKLY_LOSS_PERCENT;
  return Math.ceil(kgToLose / maxKgPerWeek);
}

export function checkLossPace(
  currentWeightKg: number,
  targetWeightKg: number,
  weeks: number
) {
  const kgToLose = currentWeightKg - targetWeightKg;
  const kgPerWeek = kgToLose / weeks;
  const minWeeks = getMinWeeksForLoss(currentWeightKg, targetWeightKg);

  return {
    ok: weeks >= minWeeks,
    kgPerWeek: Math.round(kgPerWeek * 100) / 100,
    minWeeks,
  };
}