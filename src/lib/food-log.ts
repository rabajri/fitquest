import { supabase } from '@/lib/supabase';

/**
 * Food log: one row per food eaten (table `food_entries`), plus saved favourites (`favorite_foods`).
 * Nutrition is stored PER SERVING; an entry's total = per-serving value × servings.
 * After every change, the day's totals are copied into `daily_logs`, which points and streaks read.
 */

export type Meal = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export const MEALS: { id: Meal; label: string }[] = [
  { id: 'breakfast', label: 'Breakfast' },
  { id: 'lunch', label: 'Lunch' },
  { id: 'dinner', label: 'Dinner' },
  { id: 'snack', label: 'Snack' },
];

export const MEAL_LABEL: Record<Meal, string> = {
  breakfast: 'Breakfast',
  lunch: 'Lunch',
  dinner: 'Dinner',
  snack: 'Snack',
};

export type Nutrition = {
  calories: number;
  protein_g: number;
  fat_g: number;
  carbs_g: number;
};

/** A food that can be logged: from the built-in list, a favourite, a recent entry or typed in. */
export type FoodItem = Nutrition & {
  name: string;
  portion: string | null;
  /** Id in the built-in list, or null for foods the user typed in. */
  builtin_id: string | null;
};

export type FoodEntry = FoodItem & {
  id: string;
  log_date: string;
  meal: Meal;
  servings: number;
  created_at: string;
};

export type FavoriteFood = FoodItem & { id: string };

const ITEM_COLUMNS = 'name, portion, calories, protein_g, fat_g, carbs_g, builtin_id';
const ENTRY_COLUMNS = `id, log_date, meal, servings, created_at, ${ITEM_COLUMNS}`;

/** Name used for food that was logged before the food list existed. */
const EARLIER_FOOD_NAME = 'Food logged earlier';

function round1(n: number) {
  return Math.round(n * 10) / 10;
}

/** The meal that fits the time of day, used as the default choice. */
export function mealForTime(date = new Date()): Meal {
  const hour = date.getHours();
  if (hour >= 4 && hour < 11) return 'breakfast';
  if (hour >= 11 && hour < 16) return 'lunch';
  if (hour >= 18 && hour < 23) return 'dinner';
  return 'snack';
}

/** Nutrition for a number of servings. */
export function scaleNutrition(item: Nutrition, servings: number): Nutrition {
  return {
    calories: Math.round(item.calories * servings),
    protein_g: round1(item.protein_g * servings),
    fat_g: round1(item.fat_g * servings),
    carbs_g: round1(item.carbs_g * servings),
  };
}

/** "1.5 × 1 plate (400 g)", or just the portion for one serving. */
export function describeServing(portion: string | null, servings: number): string {
  if (!portion) return servings === 1 ? '1 serving' : `${servings} servings`;
  return servings === 1 ? portion : `${servings} × ${portion}`;
}

export function sumEntries(entries: FoodEntry[]): Nutrition {
  return entries.reduce<Nutrition>(
    (sum, entry) => {
      const total = scaleNutrition(entry, entry.servings);
      return {
        calories: sum.calories + total.calories,
        protein_g: sum.protein_g + total.protein_g,
        fat_g: sum.fat_g + total.fat_g,
        carbs_g: sum.carbs_g + total.carbs_g,
      };
    },
    { calories: 0, protein_g: 0, fat_g: 0, carbs_g: 0 }
  );
}

async function currentUserId(): Promise<string> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not logged in.');
  return user.id;
}

function toEntry(row: Record<string, unknown>): FoodEntry {
  return {
    ...(row as FoodEntry),
    servings: Number(row.servings),
    calories: Number(row.calories),
    protein_g: Number(row.protein_g),
    fat_g: Number(row.fat_g),
    carbs_g: Number(row.carbs_g),
  };
}

export async function fetchEntries(date: string): Promise<FoodEntry[]> {
  const { data, error } = await supabase
    .from('food_entries')
    .select(ENTRY_COLUMNS)
    .eq('log_date', date)
    .order('created_at', { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []).map(toEntry);
}

export async function fetchEntry(id: string): Promise<FoodEntry> {
  const { data, error } = await supabase.from('food_entries').select(ENTRY_COLUMNS).eq('id', id).single();
  if (error) throw new Error(error.message);
  return toEntry(data);
}

/**
 * Copies the day's food totals into daily_logs, so points, streak and XP see them.
 * meals_logged = number of foods eaten that day.
 */
export async function syncDailyTotals(date: string): Promise<void> {
  const userId = await currentUserId();
  const entries = await fetchEntries(date);
  const total = sumEntries(entries);

  const { error } = await supabase
    .from('daily_logs')
    .update({
      calorie_logged: Math.round(total.calories),
      protein_logged: round1(total.protein_g),
      fat_logged: round1(total.fat_g),
      carb_logged: round1(total.carbs_g),
      meals_logged: entries.length,
    })
    .eq('user_id', userId)
    .eq('log_date', date);
  if (error) throw new Error(error.message);
}

/**
 * Food added the old way (numbers straight into the day's total) has no entries.
 * Before the first entry of such a day, keep those numbers as one entry so they aren't lost.
 */
async function keepEarlierTotals(userId: string, date: string): Promise<void> {
  const { count, error: countError } = await supabase
    .from('food_entries')
    .select('id', { count: 'exact', head: true })
    .eq('log_date', date);
  if (countError) throw new Error(countError.message);
  if ((count ?? 0) > 0) return;

  const { data: log } = await supabase
    .from('daily_logs')
    .select('calorie_logged, protein_logged, fat_logged, carb_logged')
    .eq('user_id', userId)
    .eq('log_date', date)
    .maybeSingle();
  if (!log) return;

  const earlier = {
    calories: Number(log.calorie_logged) || 0,
    protein_g: Number(log.protein_logged) || 0,
    fat_g: Number(log.fat_logged) || 0,
    carbs_g: Number(log.carb_logged) || 0,
  };
  if (earlier.calories + earlier.protein_g + earlier.fat_g + earlier.carbs_g === 0) return;

  const { error } = await supabase.from('food_entries').insert({
    user_id: userId,
    log_date: date,
    meal: 'snack',
    name: EARLIER_FOOD_NAME,
    portion: null,
    servings: 1,
    builtin_id: null,
    ...earlier,
  });
  if (error) throw new Error(error.message);
}

export async function addEntry(item: FoodItem, servings: number, meal: Meal, date: string) {
  const userId = await currentUserId();
  await keepEarlierTotals(userId, date);

  const { error } = await supabase.from('food_entries').insert({
    user_id: userId,
    log_date: date,
    meal,
    servings,
    name: item.name,
    portion: item.portion,
    calories: item.calories,
    protein_g: item.protein_g,
    fat_g: item.fat_g,
    carbs_g: item.carbs_g,
    builtin_id: item.builtin_id,
  });
  if (error) throw new Error(error.message);
  await syncDailyTotals(date);
}

export async function updateEntry(
  entry: FoodEntry,
  changes: Partial<Pick<FoodEntry, 'servings' | 'meal' | 'name' | keyof Nutrition>>
) {
  const { error } = await supabase.from('food_entries').update(changes).eq('id', entry.id);
  if (error) throw new Error(error.message);
  await syncDailyTotals(entry.log_date);
}

export async function deleteEntry(entry: FoodEntry) {
  const { error } = await supabase.from('food_entries').delete().eq('id', entry.id);
  if (error) throw new Error(error.message);
  await syncDailyTotals(entry.log_date);
}

/** The user's most recently eaten foods, newest first, each food once. */
export async function fetchRecentFoods(limit = 10): Promise<FoodItem[]> {
  const { data, error } = await supabase
    .from('food_entries')
    .select(`${ITEM_COLUMNS}, created_at`)
    .neq('name', EARLIER_FOOD_NAME)
    .order('created_at', { ascending: false })
    .limit(150);
  if (error) throw new Error(error.message);

  const seen = new Set<string>();
  const recent: FoodItem[] = [];
  for (const row of (data ?? []).map(toEntry)) {
    const key = `${row.name.toLowerCase()}|${row.portion ?? ''}`;
    if (seen.has(key)) continue;
    seen.add(key);
    recent.push({
      name: row.name,
      portion: row.portion,
      calories: row.calories,
      protein_g: row.protein_g,
      fat_g: row.fat_g,
      carbs_g: row.carbs_g,
      builtin_id: row.builtin_id,
    });
    if (recent.length >= limit) break;
  }
  return recent;
}

export async function fetchFavorites(): Promise<FavoriteFood[]> {
  const { data, error } = await supabase
    .from('favorite_foods')
    .select(`id, ${ITEM_COLUMNS}`)
    .order('name', { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []).map((row) => toEntry(row) as unknown as FavoriteFood);
}

export async function addFavorite(item: FoodItem): Promise<FavoriteFood> {
  const userId = await currentUserId();
  const { data, error } = await supabase
    .from('favorite_foods')
    .upsert(
      {
        user_id: userId,
        name: item.name,
        portion: item.portion,
        calories: item.calories,
        protein_g: item.protein_g,
        fat_g: item.fat_g,
        carbs_g: item.carbs_g,
        builtin_id: item.builtin_id,
      },
      { onConflict: 'user_id,name' }
    )
    .select(`id, ${ITEM_COLUMNS}`)
    .single();
  if (error) throw new Error(error.message);
  return toEntry(data) as unknown as FavoriteFood;
}

export async function removeFavorite(id: string) {
  const { error } = await supabase.from('favorite_foods').delete().eq('id', id);
  if (error) throw new Error(error.message);
}
