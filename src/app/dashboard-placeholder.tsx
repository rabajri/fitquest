import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { LOGGING, POINTS, caloriePoints, movementPoints } from '@/engine';
import { todayLocalDate } from '@/lib/dates';
import { supabase } from '@/lib/supabase';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type PlanSummary = {
  id: string;
  current_weight_kg: number;
  target_weight_kg: number | null;
  deadline_weeks: number | null;
  end_date: string | null;
  current_calorie_target: number | null;
  protein_grams: number | null;
  fat_grams: number | null;
  carb_grams: number | null;
  water_liters: number | null;
  step_goal: number | null;
};

type TodayLog = {
  id: string;
  calorie_target: number | null;
  calorie_logged: number;
  protein_target: number | null;
  protein_logged: number;
  fat_target: number | null;
  fat_logged: number;
  carb_target: number | null;
  carb_logged: number;
  water_target_liters: number | null;
  water_logged_liters: number;
  steps_target: number | null;
  steps_logged: number;
};

const LOG_COLUMNS =
  'id, calorie_target, calorie_logged, protein_target, protein_logged, fat_target, fat_logged, carb_target, carb_logged, water_target_liters, water_logged_liters, steps_target, steps_logged';

function round1(n: number) {
  return Math.round(n * 10) / 10;
}

export default function DashboardPlaceholder() {
  const [plan, setPlan] = useState<PlanSummary | null>(null);
  const [log, setLog] = useState<TodayLog | null>(null);
  const [message, setMessage] = useState('Loading your plan...');

  const [foodCalories, setFoodCalories] = useState('');
  const [foodProtein, setFoodProtein] = useState('');
  const [foodFat, setFoodFat] = useState('');
  const [foodCarbs, setFoodCarbs] = useState('');
  const [stepsInput, setStepsInput] = useState('');

  // Reload every time the dashboard appears
  useFocusEffect(
    useCallback(() => {
      async function loadEverything() {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setMessage('Not logged in.');
          return;
        }

        const { data: planData, error: planError } = await supabase
          .from('user_plans')
          .select(
            'id, current_weight_kg, target_weight_kg, deadline_weeks, end_date, current_calorie_target, protein_grams, fat_grams, carb_grams, water_liters, step_goal'
          )
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (planError) {
          setMessage(`Could not load your plan: ${planError.message}`);
          return;
        }
        if (!planData) {
          setMessage('No plan found yet.');
          return;
        }
        setPlan(planData);

        // Find today's log, or create it with today's targets copied from the plan
        const today = todayLocalDate();
        const { data: existing, error: logError } = await supabase
          .from('daily_logs')
          .select(LOG_COLUMNS)
          .eq('user_id', user.id)
          .eq('log_date', today)
          .maybeSingle();

        if (logError) {
          setMessage(`Could not load today's log: ${logError.message}`);
          return;
        }

        let todayLog = existing;
        if (!todayLog) {
          const { data: created, error: createError } = await supabase
            .from('daily_logs')
            .insert({
              user_id: user.id,
              plan_id: planData.id,
              log_date: today,
              calorie_target: planData.current_calorie_target,
              protein_target: planData.protein_grams,
              fat_target: planData.fat_grams,
              carb_target: planData.carb_grams,
              water_target_liters: planData.water_liters,
              steps_target: planData.step_goal,
            })
            .select(LOG_COLUMNS)
            .single();

          if (createError) {
            setMessage(`Could not start today's log: ${createError.message}`);
            return;
          }
          todayLog = created;
        }

        setLog(todayLog);
        setMessage('');
      }

      loadEverything();
    }, [])
  );

  async function handleAddWater() {
    if (!log) return;
    const next = Math.round((log.water_logged_liters + LOGGING.waterStepLiters) * 100) / 100;

    const { error } = await supabase
      .from('daily_logs')
      .update({ water_logged_liters: next })
      .eq('id', log.id);

    if (error) {
      setMessage(`Could not save water: ${error.message}`);
      return;
    }
    setMessage('');
    setLog({ ...log, water_logged_liters: next });
  }

  async function handleAddFood() {
    if (!log) return;

    const calories = Number(foodCalories || 0);
    const protein = Number(foodProtein || 0);
    const fat = Number(foodFat || 0);
    const carbs = Number(foodCarbs || 0);

    if ([calories, protein, fat, carbs].some((n) => Number.isNaN(n) || n < 0)) {
      setMessage('Please enter numbers only (no negatives).');
      return;
    }
    if (calories + protein + fat + carbs === 0) {
      setMessage('Enter at least one number to add.');
      return;
    }

    const next = {
      calorie_logged: round1(log.calorie_logged + calories),
      protein_logged: round1(log.protein_logged + protein),
      fat_logged: round1(log.fat_logged + fat),
      carb_logged: round1(log.carb_logged + carbs),
    };

    const { error } = await supabase.from('daily_logs').update(next).eq('id', log.id);

    if (error) {
      setMessage(`Could not save food: ${error.message}`);
      return;
    }

    setMessage('');
    setLog({ ...log, ...next });
    setFoodCalories('');
    setFoodProtein('');
    setFoodFat('');
    setFoodCarbs('');
  }

  async function handleAddSteps() {
    if (!log) return;

    const steps = Number(stepsInput);
    if (!stepsInput || Number.isNaN(steps) || steps <= 0) {
      setMessage('Please enter the number of steps you walked.');
      return;
    }

    const next = Math.round(log.steps_logged + steps);

    const { error } = await supabase
      .from('daily_logs')
      .update({ steps_logged: next })
      .eq('id', log.id);

    if (error) {
      setMessage(`Could not save steps: ${error.message}`);
      return;
    }

    setMessage('');
    setLog({ ...log, steps_logged: next });
    setStepsInput('');
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    router.replace('/login');
  }

  // Live preview of today's points (all the maths is in the engine)
  const todayCaloriePoints =
    log && log.calorie_target ? caloriePoints(log.calorie_logged, log.calorie_target) : 0;
  const todayStepPoints =
    log && log.steps_target ? movementPoints(log.steps_logged, log.steps_target) : 0;

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <ThemedText type="title">Today</ThemedText>

          {!!message && <ThemedText>{message}</ThemedText>}

          {log && (
            <>
              <ThemedView style={styles.card}>
                <ThemedText type="subtitle">Water</ThemedText>
                <ThemedText>
                  {log.water_logged_liters} / {log.water_target_liters ?? '?'} L
                </ThemedText>
                <Pressable onPress={handleAddWater} style={styles.addButton}>
                  <ThemedText style={{ color: 'white' }}>
                    + {LOGGING.waterStepLiters * 1000} ml
                  </ThemedText>
                </Pressable>
              </ThemedView>

              {log.steps_target !== null && (
                <ThemedView style={styles.card}>
                  <ThemedText type="subtitle">Steps</ThemedText>
                  <ProgressRow label="Steps" logged={log.steps_logged} target={log.steps_target} unit="steps" />
                  <ThemedText type="small">
                    Movement points right now: {round1(todayStepPoints)} / {POINTS.movementMax}
                  </ThemedText>
                  <TextInput
                    placeholder="Steps you just walked"
                    value={stepsInput}
                    onChangeText={setStepsInput}
                    keyboardType="number-pad"
                    style={styles.input}
                    placeholderTextColor="#888"
                  />
                  <Pressable onPress={handleAddSteps} style={styles.addButton}>
                    <ThemedText style={{ color: 'white' }}>Add steps</ThemedText>
                  </Pressable>
                </ThemedView>
              )}

              <ThemedView style={styles.card}>
                <ThemedText type="subtitle">Food</ThemedText>
                <ProgressRow label="Calories" logged={log.calorie_logged} target={log.calorie_target} unit="kcal" />
                <ProgressRow label="Protein" logged={log.protein_logged} target={log.protein_target} unit="g" />
                <ProgressRow label="Fat" logged={log.fat_logged} target={log.fat_target} unit="g" />
                <ProgressRow label="Carbs" logged={log.carb_logged} target={log.carb_target} unit="g" />
                <ThemedText type="small">
                  Calorie points right now: {round1(todayCaloriePoints)} / {POINTS.calorieMax} (final score counts at the end of the day)
                </ThemedText>

                <ThemedText type="small">Add what you just ate:</ThemedText>
                <TextInput
                  placeholder="Calories (kcal)"
                  value={foodCalories}
                  onChangeText={setFoodCalories}
                  keyboardType="decimal-pad"
                  style={styles.input}
                  placeholderTextColor="#888"
                />
                <TextInput
                  placeholder="Protein (g)"
                  value={foodProtein}
                  onChangeText={setFoodProtein}
                  keyboardType="decimal-pad"
                  style={styles.input}
                  placeholderTextColor="#888"
                />
                <TextInput
                  placeholder="Fat (g)"
                  value={foodFat}
                  onChangeText={setFoodFat}
                  keyboardType="decimal-pad"
                  style={styles.input}
                  placeholderTextColor="#888"
                />
                <TextInput
                  placeholder="Carbs (g)"
                  value={foodCarbs}
                  onChangeText={setFoodCarbs}
                  keyboardType="decimal-pad"
                  style={styles.input}
                  placeholderTextColor="#888"
                />
                <Pressable onPress={handleAddFood} style={styles.addButton}>
                  <ThemedText style={{ color: 'white' }}>Add</ThemedText>
                </Pressable>
              </ThemedView>
            </>
          )}

          {plan && (
            <>
              <ThemedView style={styles.card}>
                <ThemedText type="subtitle">Your Goal</ThemedText>
                <ThemedText>
                  {plan.current_weight_kg} kg → {plan.target_weight_kg ?? '?'} kg
                </ThemedText>
                {plan.deadline_weeks && (
                  <ThemedText type="small">
                    {plan.deadline_weeks} weeks · until {plan.end_date}
                  </ThemedText>
                )}
              </ThemedView>

              <ThemedView style={styles.card}>
                <ThemedText type="subtitle">Daily Targets</ThemedText>
                <Row label="Calories" value={plan.current_calorie_target} unit="kcal" />
                <Row label="Protein" value={plan.protein_grams} unit="g" />
                <Row label="Fat" value={plan.fat_grams} unit="g" />
                <Row label="Carbs" value={plan.carb_grams} unit="g" />
                <Row label="Water" value={plan.water_liters} unit="L" />
                {plan.step_goal !== null && (
                  <Row label="Steps" value={plan.step_goal} unit="steps" />
                )}
              </ThemedView>
            </>
          )}

          <Pressable onPress={handleLogout} style={styles.button}>
            <ThemedText style={{ color: 'white' }}>Log Out</ThemedText>
          </Pressable>
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

function Row({ label, value, unit }: { label: string; value: number | null; unit: string }) {
  return (
    <ThemedView style={styles.rowLine}>
      <ThemedText>{label}</ThemedText>
      <ThemedText>
        {value === null ? '—' : `${value.toLocaleString()} ${unit}`}
      </ThemedText>
    </ThemedView>
  );
}

function ProgressRow({
  label,
  logged,
  target,
  unit,
}: {
  label: string;
  logged: number;
  target: number | null;
  unit: string;
}) {
  return (
    <ThemedView style={styles.rowLine}>
      <ThemedText>{label}</ThemedText>
      <ThemedText>
        {logged.toLocaleString()} / {target === null ? '?' : target.toLocaleString()} {unit}
      </ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  content: { padding: 20, gap: 16 },
  card: { borderWidth: 1, borderColor: '#444', borderRadius: 12, padding: 16, gap: 8 },
  rowLine: { flexDirection: 'row', justifyContent: 'space-between' },
  input: { borderWidth: 1, borderColor: '#444', borderRadius: 8, padding: 12, width: '100%', color: 'white' },
  addButton: { backgroundColor: '#3b82f6', padding: 12, borderRadius: 8, alignItems: 'center' },
  button: { backgroundColor: '#ef4444', padding: 14, borderRadius: 8, alignItems: 'center', marginTop: 8 },
});