import { RANK_LABEL, RANK_ORDER, TRIAL_BANDS, WAIST_CHANGE_CM, XP } from './constants';
import type { RankId, TrialBand } from './types';

export function waistAdjustedGainKg(weightGainKg: number, waistChangeCm: number): number {
  if (waistChangeCm <= WAIST_CHANGE_CM.noneMax) {
    return weightGainKg * WAIST_CHANGE_CM.noneMultiplier;
  }
  if (waistChangeCm <= WAIST_CHANGE_CM.smallMax) {
    return weightGainKg * WAIST_CHANGE_CM.smallMultiplier;
  }
  return weightGainKg * WAIST_CHANGE_CM.largeMultiplier;
}

export function leanMassKg(weightKg: number, bodyFatPercent: number): number {
  return weightKg * (1 - bodyFatPercent / 100);
}

/** This marker's actual progress vs this marker's own target (not cumulative). */
export function attainmentPercent(actualThisMarkerKg: number, expectedThisMarkerKg: number): number {
  if (expectedThisMarkerKg === 0) return 0;
  return (actualThisMarkerKg / expectedThisMarkerKg) * 100;
}

export function trialBand(attainment: number): TrialBand {
  if (attainment < TRIAL_BANDS.veryLowFrom) return 'regression';
  if (attainment < TRIAL_BANDS.lowFrom) return 'very_low';
  if (attainment < TRIAL_BANDS.holdFrom) return 'low';
  if (attainment < TRIAL_BANDS.rankUpFrom) return 'hold';
  if (attainment < TRIAL_BANDS.strongRankUpFrom) return 'rank_up';
  if (attainment < TRIAL_BANDS.overperformingFrom) return 'strong_rank_up';
  return 'overperforming';
}

export function nextRank(current: RankId, band: TrialBand): RankId {
  const ranksUp =
    band === 'rank_up' || band === 'strong_rank_up' || band === 'overperforming';
  if (!ranksUp) return current;
  const i = RANK_ORDER.indexOf(current);
  return RANK_ORDER[Math.min(i + 1, RANK_ORDER.length - 1)] ?? current;
}

const TRIAL_XP: Record<TrialBand, number> = {
  overperforming: XP.trial.overperforming,
  strong_rank_up: XP.trial.strong,
  rank_up: XP.trial.rankUp,
  hold: XP.trial.hold,
  low: XP.trial.low,
  very_low: XP.trial.veryLow,
  regression: XP.trial.regression,
};

export function trialXp(band: TrialBand): number {
  return TRIAL_XP[band];
}

export function rankLabel(id: RankId): string {
  return RANK_LABEL[id];
}

export function levelFromXp(totalXp: number): { level: number; xpIntoLevel: number; xpForNext: number } {
  let level = 1;
  while (XP.toReachLevel(level + 1) <= totalXp) {
    level += 1;
  }
  const atThis = XP.toReachLevel(level);
  const atNext = XP.toReachLevel(level + 1);
  return {
    level,
    xpIntoLevel: totalXp - atThis,
    xpForNext: atNext - atThis,
  };
}