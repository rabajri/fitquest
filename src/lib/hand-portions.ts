import type { Nutrition } from '@/lib/food-log';

/**
 * Quick estimate with the hand-portion method: no numbers needed, your hand is the measure.
 * Each hand portion stands for a typical amount of one kind of food. Change the values here.
 */

export type HandPortionId = 'palm' | 'fist' | 'thumb' | 'cupped';

export type HandPortion = {
  id: HandPortionId;
  emoji: string;
  label: string;
  /** What to count with this hand portion. */
  foods: string;
  /** How to size it. */
  howTo: string;
  /** Nutrition in ONE hand portion. */
  per: Omit<Nutrition, 'calories'>;
};

export const HAND_PORTIONS: HandPortion[] = [
  {
    id: 'palm',
    emoji: '✋',
    label: 'Palms of protein',
    foods: 'Meat, chicken, fish, eggs, tofu',
    howTo: 'Size and thickness of your palm (2 eggs = 1 palm)',
    per: { protein_g: 25, fat_g: 5, carbs_g: 0 },
  },
  {
    id: 'fist',
    emoji: '✊',
    label: 'Fists of carbs',
    foods: 'Rice, bread, pasta, potato, dates, fruit, sweets',
    howTo: 'Size of your closed fist (1 Arabic bread = 1 fist)',
    per: { protein_g: 3, fat_g: 1, carbs_g: 25 },
  },
  {
    id: 'thumb',
    emoji: '👍',
    label: 'Thumbs of fat',
    foods: 'Oil, butter, ghee, nuts, cheese, sauces',
    howTo: 'Size of your whole thumb (fried food: add 1–2)',
    per: { protein_g: 0, fat_g: 10, carbs_g: 0 },
  },
  {
    id: 'cupped',
    emoji: '🤲',
    label: 'Cupped hands of vegetables',
    foods: 'Salad, cooked vegetables, soup vegetables',
    howTo: 'What fits in one cupped hand',
    per: { protein_g: 1.5, fat_g: 0, carbs_g: 5 },
  },
];

export type HandCounts = Record<HandPortionId, number>;

export const EMPTY_HAND_COUNTS: HandCounts = { palm: 0, fist: 0, thumb: 0, cupped: 0 };

function round1(n: number) {
  return Math.round(n * 10) / 10;
}

/** Total nutrition for the counted hand portions. Calories come from protein × 4 + carbs × 4 + fat × 9. */
export function estimateFromHands(counts: HandCounts): Nutrition {
  let protein = 0;
  let fat = 0;
  let carbs = 0;
  for (const portion of HAND_PORTIONS) {
    const n = counts[portion.id];
    protein += portion.per.protein_g * n;
    fat += portion.per.fat_g * n;
    carbs += portion.per.carbs_g * n;
  }
  return {
    calories: Math.round(protein * 4 + carbs * 4 + fat * 9),
    protein_g: round1(protein),
    fat_g: round1(fat),
    carbs_g: round1(carbs),
  };
}

/** "1½ palms · 2 fists · 1 thumb", saved as the portion so the entry shows what was counted. */
export function describeHands(counts: HandCounts): string {
  const short: Record<HandPortionId, [string, string]> = {
    palm: ['palm', 'palms'],
    fist: ['fist', 'fists'],
    thumb: ['thumb', 'thumbs'],
    cupped: ['cupped hand', 'cupped hands'],
  };
  return HAND_PORTIONS.filter((p) => counts[p.id] > 0)
    .map((p) => {
      const n = counts[p.id];
      const amount = Number.isInteger(n) ? String(n) : n === 0.5 ? '½' : `${Math.floor(n)}½`;
      return `${amount} ${n === 1 || n === 0.5 ? short[p.id][0] : short[p.id][1]}`;
    })
    .join(' · ');
}
