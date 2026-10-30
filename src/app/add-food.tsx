import {
  FoodRow,
  foodStyles,
  GameButton,
  GameField,
  HandCounter,
  MealPicker,
  NutritionSummary,
  SectionHeading,
  ServingStepper,
} from '@/components/food/food-ui';
import { GAME } from '@/constants/game-theme';
import {
  type CommonFood,
  FOOD_CATEGORIES,
  normalizeSearch,
  searchCommonFoods,
} from '@/data/common-foods';
import { todayLocalDate } from '@/lib/dates';
import {
  addEntry,
  addFavorite,
  type FavoriteFood,
  fetchFavorites,
  fetchRecentFoods,
  type FoodItem,
  type Meal,
  MEAL_LABEL,
  mealForTime,
  removeFavorite,
  scaleNutrition,
} from '@/lib/food-log';
import {
  describeHands,
  EMPTY_HAND_COUNTS,
  estimateFromHands,
  HAND_PORTIONS,
  type HandCounts,
} from '@/lib/hand-portions';
import { parseDecimal } from '@/lib/numbers';
import { router } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type Step =
  | { kind: 'list' }
  | { kind: 'detail'; item: FoodItem }
  | { kind: 'custom' }
  | { kind: 'estimate' };

/** Most foods shown while searching, so the list stays quick. */
const MAX_RESULTS = 40;

function fromCommon(food: CommonFood): FoodItem {
  return {
    name: food.name,
    portion: food.portion,
    calories: food.calories,
    protein_g: food.protein_g,
    fat_g: food.fat_g,
    carbs_g: food.carbs_g,
    builtin_id: food.id,
  };
}

function sameFood(a: FoodItem, b: FoodItem) {
  return a.name.trim().toLowerCase() === b.name.trim().toLowerCase();
}

/** Empty text counts as 0; anything else must be a number, 0 or more. */
function optionalNumber(text: string): number {
  if (!text.trim()) return 0;
  return parseDecimal(text);
}

export default function AddFoodScreen() {
  const [step, setStep] = useState<Step>({ kind: 'list' });
  const [meal, setMeal] = useState<Meal>(() => mealForTime());
  const [query, setQuery] = useState('');
  const [favorites, setFavorites] = useState<FavoriteFood[]>([]);
  const [recent, setRecent] = useState<FoodItem[]>([]);
  const [servings, setServings] = useState(1);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  // Custom food form
  const [customName, setCustomName] = useState('');
  const [customPortion, setCustomPortion] = useState('');
  const [customCalories, setCustomCalories] = useState('');
  const [customProtein, setCustomProtein] = useState('');
  const [customFat, setCustomFat] = useState('');
  const [customCarbs, setCustomCarbs] = useState('');
  const [customFavorite, setCustomFavorite] = useState(true);

  // Quick estimate (hand portions)
  const [estimateName, setEstimateName] = useState('');
  const [hands, setHands] = useState<HandCounts>(EMPTY_HAND_COUNTS);

  useEffect(() => {
    Promise.all([fetchFavorites(), fetchRecentFoods()])
      .then(([favs, recents]) => {
        setFavorites(favs);
        setRecent(recents);
      })
      .catch((e: Error) => setMessage(`Could not load your foods: ${e.message}`));
  }, []);

  const searching = query.trim().length > 0;
  const results = useMemo(() => {
    const words = normalizeSearch(query).split(/\s+/).filter(Boolean);
    const matches = (item: FoodItem) => {
      const name = normalizeSearch(item.name);
      return words.every((w) => name.includes(w));
    };
    return {
      favorites: searching ? favorites.filter(matches) : favorites,
      recent: searching ? recent.filter(matches) : recent,
      common: searchCommonFoods(query),
    };
  }, [query, searching, favorites, recent]);

  const favoriteFor = (item: FoodItem) => favorites.find((f) => sameFood(f, item));

  function openFood(item: FoodItem) {
    setServings(1);
    setMessage('');
    setStep({ kind: 'detail', item });
  }

  function openCustom() {
    setCustomName(query.trim());
    setMessage('');
    setStep({ kind: 'custom' });
  }

  function openEstimate() {
    setEstimateName(query.trim());
    setHands(EMPTY_HAND_COUNTS);
    setMessage('');
    setStep({ kind: 'estimate' });
  }

  async function saveEstimate() {
    const estimate = estimateFromHands(hands);
    if (estimate.calories === 0) {
      setMessage('Count at least one hand portion.');
      return;
    }
    await save(
      {
        name: estimateName.trim() || `${MEAL_LABEL[meal]} (estimate)`,
        portion: describeHands(hands),
        ...estimate,
        builtin_id: null,
      },
      1
    );
  }

  async function toggleFavorite(item: FoodItem) {
    try {
      const existing = favoriteFor(item);
      if (existing) {
        await removeFavorite(existing.id);
        setFavorites((prev) => prev.filter((f) => f.id !== existing.id));
      } else {
        const saved = await addFavorite(item);
        setFavorites((prev) => [...prev, saved].sort((a, b) => a.name.localeCompare(b.name)));
      }
    } catch (e) {
      setMessage(`Could not update favourites: ${(e as Error).message}`);
    }
  }

  async function save(item: FoodItem, count: number) {
    setSaving(true);
    setMessage('');
    try {
      await addEntry(item, count, meal, todayLocalDate());
      router.back();
    } catch (e) {
      setMessage(`Could not save: ${(e as Error).message}`);
      setSaving(false);
    }
  }

  async function saveCustom() {
    const name = customName.trim();
    if (!name) {
      setMessage('Give the food a name, e.g. "Mum\'s kabsa".');
      return;
    }
    const calories = parseDecimal(customCalories);
    const protein = optionalNumber(customProtein);
    const fat = optionalNumber(customFat);
    const carbs = optionalNumber(customCarbs);
    if (!Number.isFinite(calories)) {
      setMessage('Enter the calories as a number.');
      return;
    }
    if (![protein, fat, carbs].every(Number.isFinite)) {
      setMessage('Protein, fat and carbs must be numbers (or leave them empty).');
      return;
    }

    const item: FoodItem = {
      name,
      portion: customPortion.trim() || null,
      calories: Math.round(calories),
      protein_g: protein,
      fat_g: fat,
      carbs_g: carbs,
      builtin_id: null,
    };

    if (customFavorite) {
      try {
        const saved = await addFavorite(item);
        setFavorites((prev) => [...prev.filter((f) => f.id !== saved.id), saved]);
      } catch (e) {
        setMessage(`Could not save to favourites: ${(e as Error).message}`);
        return;
      }
    }
    await save(item, 1);
  }

  const title = {
    list: 'Add food',
    detail: 'How much?',
    custom: 'Custom food',
    estimate: 'Quick estimate',
  }[step.kind];

  return (
    <View style={foodStyles.screen}>
      <SafeAreaView style={styles.flex} edges={['top', 'bottom']}>
        <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={foodStyles.header}>
            <Pressable
              onPress={() => (step.kind === 'list' ? router.back() : setStep({ kind: 'list' }))}
              hitSlop={10}
              style={({ pressed }) => [foodStyles.iconButton, pressed && foodStyles.pressed]}
              accessibilityRole="button"
              accessibilityLabel={step.kind === 'list' ? 'Close' : 'Back'}>
              <Text style={foodStyles.iconButtonLabel}>{step.kind === 'list' ? '✕' : '‹'}</Text>
            </Pressable>
            <Text style={foodStyles.headerTitle}>{title}</Text>
          </View>

          <ScrollView
            contentContainerStyle={foodStyles.content}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag">
            <MealPicker meal={meal} onChange={setMeal} />

            {!!message && <Text style={foodStyles.error}>{message}</Text>}

            {step.kind === 'list' && (
              <>
                <GameField
                  placeholder="Search foods, e.g. kabsa or لبن"
                  value={query}
                  onChangeText={setQuery}
                  autoCorrect={false}
                  returnKeyType="search"
                  clearButtonMode="while-editing"
                />

                <Pressable
                  onPress={openCustom}
                  style={({ pressed }) => [styles.customRow, pressed && foodStyles.pressed]}
                  accessibilityRole="button">
                  <Text style={styles.customPlus}>＋</Text>
                  <View style={styles.flex}>
                    <Text style={styles.customTitle}>
                      {searching ? `Create "${query.trim()}"` : 'Create a custom food'}
                    </Text>
                    <Text style={foodStyles.muted}>Type the numbers once, re-use it with one tap</Text>
                  </View>
                </Pressable>

                <Pressable
                  onPress={openEstimate}
                  style={({ pressed }) => [styles.customRow, pressed && foodStyles.pressed]}
                  accessibilityRole="button">
                  <Text style={styles.customPlus}>✋</Text>
                  <View style={styles.flex}>
                    <Text style={styles.customTitle}>Quick estimate</Text>
                    <Text style={foodStyles.muted}>Don't know the calories? Measure with your hand</Text>
                  </View>
                </Pressable>

                {results.favorites.length > 0 && (
                  <>
                    <SectionHeading>★ Favourites</SectionHeading>
                    {results.favorites.map((item) => (
                      <FoodRow
                        key={`fav-${item.id}`}
                        name={item.name}
                        detail={item.portion ?? undefined}
                        calories={item.calories}
                        onPress={() => openFood(item)}
                      />
                    ))}
                  </>
                )}

                {results.recent.length > 0 && (
                  <>
                    <SectionHeading>Recent</SectionHeading>
                    {results.recent.map((item) => (
                      <FoodRow
                        key={`recent-${item.name}-${item.portion}`}
                        name={item.name}
                        detail={item.portion ?? undefined}
                        calories={item.calories}
                        onPress={() => openFood(item)}
                      />
                    ))}
                  </>
                )}

                {searching ? (
                  <>
                    <SectionHeading>Common foods</SectionHeading>
                    {results.common.length === 0 && (
                      <View style={styles.notFound}>
                        <Text style={styles.customTitle}>Not on the list?</Text>
                        <Text style={foodStyles.muted}>
                          Try a similar food (e.g. "mandi" for a chicken and rice dish), or count it
                          with your hand. No calories needed.
                        </Text>
                        <GameButton label="✋ Quick estimate" onPress={openEstimate} />
                      </View>
                    )}
                    {results.common.slice(0, MAX_RESULTS).map((food) => (
                      <FoodRow
                        key={food.id}
                        name={food.name}
                        detail={food.portion}
                        calories={food.calories}
                        onPress={() => openFood(fromCommon(food))}
                      />
                    ))}
                  </>
                ) : (
                  FOOD_CATEGORIES.map((category) => (
                    <View key={category} style={styles.group}>
                      <SectionHeading>{category}</SectionHeading>
                      {results.common
                        .filter((food) => food.category === category)
                        .map((food) => (
                          <FoodRow
                            key={food.id}
                            name={food.name}
                            detail={food.portion}
                            calories={food.calories}
                            onPress={() => openFood(fromCommon(food))}
                          />
                        ))}
                    </View>
                  ))
                )}

                <Text style={styles.footnote}>
                  Common food values are typical estimates. Recipes and brands vary.
                </Text>
              </>
            )}

            {step.kind === 'detail' && (
              <View style={foodStyles.card}>
                <View style={styles.detailHeader}>
                  <View style={styles.flex}>
                    <Text style={foodStyles.title}>{step.item.name}</Text>
                    <Text style={foodStyles.muted}>{step.item.portion ?? '1 serving'} per serving</Text>
                  </View>
                  <Pressable
                    onPress={() => toggleFavorite(step.item)}
                    hitSlop={10}
                    accessibilityRole="button"
                    accessibilityLabel={favoriteFor(step.item) ? 'Remove from favourites' : 'Add to favourites'}>
                    <Text style={[styles.star, favoriteFor(step.item) && styles.starOn]}>
                      {favoriteFor(step.item) ? '★' : '☆'}
                    </Text>
                  </Pressable>
                </View>

                <ServingStepper servings={servings} onChange={setServings} />
                <NutritionSummary nutrition={scaleNutrition(step.item, servings)} />

                <GameButton
                  label={saving ? 'Saving…' : `Add to ${MEAL_LABEL[meal]}`}
                  onPress={() => save(step.item, servings)}
                  disabled={saving}
                />
              </View>
            )}

            {step.kind === 'estimate' && (
              <>
                <Text style={foodStyles.muted}>
                  Look at your plate and count each part with your hand. It's an estimate, and that's
                  fine: logging something beats logging nothing.
                </Text>

                <View style={foodStyles.card}>
                  {HAND_PORTIONS.map((portion) => (
                    <HandCounter
                      key={portion.id}
                      emoji={portion.emoji}
                      label={portion.label}
                      foods={portion.foods}
                      howTo={portion.howTo}
                      count={hands[portion.id]}
                      onChange={(n) => setHands((prev) => ({ ...prev, [portion.id]: n }))}
                    />
                  ))}
                </View>

                <View style={foodStyles.card}>
                  <NutritionSummary nutrition={estimateFromHands(hands)} />
                  <GameField
                    label="Name (optional)"
                    placeholder={`e.g. Office lunch · default "${MEAL_LABEL[meal]} (estimate)"`}
                    value={estimateName}
                    onChangeText={setEstimateName}
                  />
                  <GameButton
                    label={saving ? 'Saving…' : `Add to ${MEAL_LABEL[meal]}`}
                    onPress={saveEstimate}
                    disabled={saving}
                  />
                </View>
              </>
            )}

            {step.kind === 'custom' && (
              <View style={foodStyles.card}>
                <GameField
                  label="Name"
                  placeholder="e.g. Mum's kabsa"
                  value={customName}
                  onChangeText={setCustomName}
                />
                <GameField
                  label="Portion (optional)"
                  placeholder="e.g. 1 plate"
                  value={customPortion}
                  onChangeText={setCustomPortion}
                />
                <GameField
                  label="Calories"
                  placeholder="e.g. 450"
                  value={customCalories}
                  onChangeText={setCustomCalories}
                  keyboardType="decimal-pad"
                  suffix="kcal"
                />
                <Text style={foodStyles.muted}>Protein, fat and carbs are optional.</Text>
                <View style={styles.macroInputs}>
                  <GameField
                    label="Protein"
                    placeholder="0"
                    value={customProtein}
                    onChangeText={setCustomProtein}
                    keyboardType="decimal-pad"
                    suffix="g"
                    containerStyle={styles.flex}
                  />
                  <GameField
                    label="Fat"
                    placeholder="0"
                    value={customFat}
                    onChangeText={setCustomFat}
                    keyboardType="decimal-pad"
                    suffix="g"
                    containerStyle={styles.flex}
                  />
                  <GameField
                    label="Carbs"
                    placeholder="0"
                    value={customCarbs}
                    onChangeText={setCustomCarbs}
                    keyboardType="decimal-pad"
                    suffix="g"
                    containerStyle={styles.flex}
                  />
                </View>

                <Pressable
                  onPress={() => setCustomFavorite((v) => !v)}
                  style={styles.checkRow}
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: customFavorite }}>
                  <View style={[styles.checkbox, customFavorite && styles.checkboxOn]}>
                    {customFavorite && <Text style={styles.checkMark}>✓</Text>}
                  </View>
                  <Text style={styles.checkLabel}>Save to favourites for one-tap logging</Text>
                </Pressable>

                <GameButton
                  label={saving ? 'Saving…' : `Add to ${MEAL_LABEL[meal]}`}
                  onPress={saveCustom}
                  disabled={saving}
                />
              </View>
            )}
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  group: { gap: GAME.spacing.gap },
  customRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: GAME.radius.button,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: GAME.colors.primary,
  },
  customPlus: { color: GAME.colors.primary, fontSize: 22, fontWeight: '700' },
  customTitle: { color: GAME.colors.text, fontSize: 15, fontWeight: '600' },
  notFound: {
    gap: 10,
    padding: 16,
    borderRadius: GAME.radius.card,
    backgroundColor: GAME.colors.surface,
    borderWidth: 1,
    borderColor: GAME.colors.border,
  },
  footnote: { color: GAME.colors.textMuted, fontSize: 12, textAlign: 'center', marginTop: 8 },
  detailHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  star: { color: GAME.colors.textMuted, fontSize: 30 },
  starOn: { color: GAME.colors.reward },
  macroInputs: { flexDirection: 'row', gap: 10 },
  checkRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: GAME.colors.edgeLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxOn: { backgroundColor: GAME.colors.primary, borderColor: GAME.colors.primary },
  checkMark: { color: GAME.colors.onPrimary, fontSize: 14, fontWeight: '800' },
  checkLabel: { flex: 1, color: GAME.colors.text, fontSize: 14 },
});
