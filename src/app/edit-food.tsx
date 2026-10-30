import {
  foodStyles,
  GameButton,
  GameField,
  MealPicker,
  NutritionSummary,
  ServingStepper,
} from '@/components/food/food-ui';
import { GAME } from '@/constants/game-theme';
import {
  deleteEntry,
  fetchEntry,
  type FoodEntry,
  type Meal,
  scaleNutrition,
  updateEntry,
} from '@/lib/food-log';
import { parseDecimal } from '@/lib/numbers';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

/** Edit or delete one food from today's list. */
export default function EditFoodScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [entry, setEntry] = useState<FoodEntry | null>(null);
  const [servings, setServings] = useState(1);
  const [meal, setMeal] = useState<Meal>('snack');
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [fat, setFat] = useState('');
  const [carbs, setCarbs] = useState('');
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);
  // Delete needs a second tap, so it can't happen by accident
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (!id) return;
    fetchEntry(id)
      .then((e) => {
        setEntry(e);
        setServings(e.servings);
        setMeal(e.meal);
        setCalories(String(e.calories));
        setProtein(String(e.protein_g));
        setFat(String(e.fat_g));
        setCarbs(String(e.carbs_g));
      })
      .catch((e: Error) => setMessage(`Could not load this food: ${e.message}`));
  }, [id]);

  const perServing = {
    calories: parseDecimal(calories),
    protein_g: parseDecimal(protein || '0'),
    fat_g: parseDecimal(fat || '0'),
    carbs_g: parseDecimal(carbs || '0'),
  };
  const valid = Object.values(perServing).every(Number.isFinite);

  async function handleSave() {
    if (!entry) return;
    if (!valid) {
      setMessage('Calories, protein, fat and carbs must be numbers.');
      return;
    }
    setSaving(true);
    setMessage('');
    try {
      await updateEntry(entry, {
        servings,
        meal,
        calories: Math.round(perServing.calories),
        protein_g: perServing.protein_g,
        fat_g: perServing.fat_g,
        carbs_g: perServing.carbs_g,
      });
      router.back();
    } catch (e) {
      setMessage(`Could not save: ${(e as Error).message}`);
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!entry) return;
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    setSaving(true);
    try {
      await deleteEntry(entry);
      router.back();
    } catch (e) {
      setMessage(`Could not delete: ${(e as Error).message}`);
      setSaving(false);
    }
  }

  return (
    <View style={foodStyles.screen}>
      <SafeAreaView style={styles.flex} edges={['top', 'bottom']}>
        <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={foodStyles.header}>
            <Pressable
              onPress={() => router.back()}
              hitSlop={10}
              style={({ pressed }) => [foodStyles.iconButton, pressed && foodStyles.pressed]}
              accessibilityRole="button"
              accessibilityLabel="Close">
              <Text style={foodStyles.iconButtonLabel}>✕</Text>
            </Pressable>
            <Text style={foodStyles.headerTitle}>Edit food</Text>
          </View>

          <ScrollView
            contentContainerStyle={foodStyles.content}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag">
            {!!message && <Text style={foodStyles.error}>{message}</Text>}

            {!entry && !message && <ActivityIndicator color={GAME.colors.primary} />}

            {entry && (
              <>
                <MealPicker meal={meal} onChange={setMeal} />

                <View style={foodStyles.card}>
                  <View>
                    <Text style={foodStyles.title}>{entry.name}</Text>
                    <Text style={foodStyles.muted}>{entry.portion ?? '1 serving'} per serving</Text>
                  </View>
                  <ServingStepper servings={servings} onChange={setServings} />
                  {valid && <NutritionSummary nutrition={scaleNutrition(perServing, servings)} />}
                </View>

                <View style={foodStyles.card}>
                  <Text style={foodStyles.muted}>Numbers for one serving. Fix them here if they are off.</Text>
                  <GameField
                    label="Calories"
                    value={calories}
                    onChangeText={setCalories}
                    keyboardType="decimal-pad"
                    suffix="kcal"
                  />
                  <View style={styles.macroInputs}>
                    <GameField
                      label="Protein"
                      value={protein}
                      onChangeText={setProtein}
                      keyboardType="decimal-pad"
                      suffix="g"
                      containerStyle={styles.flex}
                    />
                    <GameField
                      label="Fat"
                      value={fat}
                      onChangeText={setFat}
                      keyboardType="decimal-pad"
                      suffix="g"
                      containerStyle={styles.flex}
                    />
                    <GameField
                      label="Carbs"
                      value={carbs}
                      onChangeText={setCarbs}
                      keyboardType="decimal-pad"
                      suffix="g"
                      containerStyle={styles.flex}
                    />
                  </View>
                </View>

                <GameButton label={saving ? 'Saving…' : 'Save changes'} onPress={handleSave} disabled={saving} />
                <GameButton
                  label={confirmDelete ? 'Tap again to delete' : 'Delete this food'}
                  onPress={handleDelete}
                  disabled={saving}
                  tone="danger"
                />
              </>
            )}
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  macroInputs: { flexDirection: 'row', gap: 10 },
});
