import { KeyboardScreen } from '@/components/keyboard-screen';
import { ThemedText } from '@/components/themed-text';
import {
  calculateWeightLossPlan,
  earliestSafeDays,
  validateWeightLossDeadline
} from '@/engine';
import { addDays, daysUntil, toLocalDate } from '@/lib/dates';
import { supabase } from '@/lib/supabase';
import DateTimePicker from '@react-native-community/datetimepicker';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet } from 'react-native';

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
}

export default function OnboardingRealityCheckScreen() {
  const [goalDate, setGoalDate] = useState<Date | null>(null);
  const [showPicker, setShowPicker] = useState(false);
  const [message, setMessage] = useState('');
  const [earliestDate, setEarliestDate] = useState<Date | null>(null);

  // Work out the earliest safe date as soon as the screen opens
  useEffect(() => {
    async function loadEarliest() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: plan } = await supabase
        .from('user_plans')
        .select('current_weight_kg, target_weight_kg')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!plan?.current_weight_kg || !plan?.target_weight_kg) return;

      const days = earliestSafeDays({
        currentWeightKg: plan.current_weight_kg,
        targetWeightKg: plan.target_weight_kg,
      });
      setEarliestDate(addDays(new Date(), days));
    }
    loadEarliest();
  }, []);

  function handlePick(event: { type: string }, selected?: Date) {
    setShowPicker(false);
    if (event.type === 'set' && selected) {
      setGoalDate(selected);
      setMessage('');
    }
  }

  async function handleFinish() {
    if (!goalDate) {
      setMessage('Please pick a date.');
      return;
    }

    const timelineDays = daysUntil(goalDate);
    if (timelineDays < 1) {
      setMessage('Pick a date in the future.');
      return;
    }

    setMessage('Checking...');

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setMessage('Not logged in.');
      return;
    }

    const { data: plan, error: planError } = await supabase
      .from('user_plans')
      .select('id, goal_type, current_weight_kg, target_weight_kg, wants_workout, selected_days, session_duration_minutes')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (planError || !plan) {
      setMessage(`Could not load your plan: ${planError?.message ?? 'no plan found'}`);
      return;
    }

    const { data: profile, error: profileLoadError } = await supabase
      .from('user_profiles')
      .select('age, gender, height_cm')
      .eq('user_id', user.id)
      .maybeSingle();

    if (profileLoadError || !profile) {
      setMessage(`Could not load your profile: ${profileLoadError?.message ?? 'no profile found'}`);
      return;
    }

    if (!plan.target_weight_kg) {
      setMessage('No target weight found. Go back to Your Goal and enter one.');
      return;
    }

    const result = validateWeightLossDeadline({
      currentWeightKg: plan.current_weight_kg,
      targetWeightKg: plan.target_weight_kg,
      timelineDays,
      wantsWorkout: plan.wants_workout,
    });

    if (!result.ok) {
      const safeDate = addDays(
        new Date(),
        earliestSafeDays({
          currentWeightKg: plan.current_weight_kg,
          targetWeightKg: plan.target_weight_kg,
        }),
      );
      setEarliestDate(safeDate);
      setMessage(`${result.message} The earliest safe date for this goal is ${formatDate(safeDate)}.`);
      return;
    }

    const deadlineWeeks = timelineDays / 7;

    // All the maths lives in the engine; this screen only passes answers in
    const dailyPlan = calculateWeightLossPlan({
      sex: profile.gender,
      ageYears: profile.age,
      heightCm: profile.height_cm,
      weightKg: plan.current_weight_kg,
      targetWeightKg: plan.target_weight_kg,
      deadlineWeeks,
      daysPerWeek: plan.wants_workout ? (plan.selected_days?.length ?? 0) : 0,
      sessionMinutes: plan.session_duration_minutes ?? 0,
    });

    const { error: planUpdateError } = await supabase
      .from('user_plans')
      .update({
        deadline_weeks: Math.ceil(deadlineWeeks),
        end_date: toLocalDate(goalDate),
        activity_level: dailyPlan.activity,
        initial_bmr: Math.round(dailyPlan.bmr),
        initial_tdee: Math.round(dailyPlan.tdee),
        current_calorie_target: Math.round(dailyPlan.dailyCalorieTarget),
        protein_grams: Math.round(dailyPlan.proteinGrams),
        fat_grams: Math.round(dailyPlan.fatGrams),
        carb_grams: Math.round(dailyPlan.carbGrams),
        water_liters: Math.round(dailyPlan.waterLiters * 10) / 10,
        step_goal: dailyPlan.stepGoal === null ? null : Math.round(dailyPlan.stepGoal),
      })
      .eq('id', plan.id);

    if (planUpdateError) {
      setMessage(`Error: ${planUpdateError.message}`);
      return;
    }

    const { error: profileError } = await supabase
      .from('user_profiles')
      .update({ onboarding_completed: true })
      .eq('user_id', user.id);

    if (profileError) {
      setMessage(`Error: ${profileError.message}`);
      return;
    }

    router.replace('/dashboard-placeholder');
  }

  return (
    <KeyboardScreen>
      <ThemedText type="title">Reality Check</ThemedText>
      <ThemedText>By what date do you want to reach your goal?</ThemedText>

      <Pressable onPress={() => setShowPicker(true)} style={styles.input}>
        <ThemedText>{goalDate ? formatDate(goalDate) : 'Pick a date'}</ThemedText>
      </Pressable>

      {showPicker && (
        <DateTimePicker
          value={goalDate ?? earliestDate ?? addDays(new Date(), 1)}
          mode="date"
          minimumDate={addDays(new Date(), 1)}
          onChange={handlePick}
        />
      )}

      {earliestDate && (
        <ThemedText>Earliest safe date for your goal: {formatDate(earliestDate)}</ThemedText>
      )}

      <Pressable onPress={handleFinish} style={styles.button}>
        <ThemedText style={{ color: 'white' }}>Finish Setup</ThemedText>
      </Pressable>

      {!!message && <ThemedText>{message}</ThemedText>}
    </KeyboardScreen>
  );
}

const styles = StyleSheet.create({
  input: { borderWidth: 1, borderColor: '#444', borderRadius: 8, padding: 12, width: '100%' },
  button: { backgroundColor: '#3b82f6', padding: 14, borderRadius: 8, width: '100%', alignItems: 'center', marginTop: 8 },
});