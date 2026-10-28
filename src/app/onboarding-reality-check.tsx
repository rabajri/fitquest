import {
  FormMessage,
  FormScreen,
  FormTitle,
  isBusyMessage,
  LinkButton,
  Notice,
  PrimaryButton,
  SectionLabel,
} from '@/components/form/form-ui';
import { WELCOME } from '@/constants/welcome-theme';
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
import { Pressable, StyleSheet, Text } from 'react-native';

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

  function handlePick(_event: unknown, selected: Date) {
    setShowPicker(false);
    setGoalDate(selected);
    setMessage('');
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

    // Clear the onboarding steps so Back can't return to them from the dashboard
    if (router.canDismiss()) router.dismissAll();
    router.replace('/dashboard-placeholder');
  }

  return (
    <FormScreen step={{ current: 4, total: 4 }}>
      <FormTitle
        eyebrow="REALITY CHECK"
        title="When do you want to get there?"
        subtitle="We'll check your date is safe: at most 1% of your body weight a week."
      />

      <SectionLabel>Goal date</SectionLabel>
      <Pressable
        onPress={() => setShowPicker(true)}
        style={({ pressed }) => [styles.dateBox, showPicker && styles.dateBoxActive, pressed && styles.pressed]}
        accessibilityRole="button">
        <Text style={goalDate ? styles.dateText : styles.datePlaceholder}>
          {goalDate ? formatDate(goalDate) : 'Pick a date'}
        </Text>
        <Text style={styles.dateIcon}>📅</Text>
      </Pressable>

      {showPicker && (
        <DateTimePicker
          value={goalDate ?? earliestDate ?? addDays(new Date(), 1)}
          mode="date"
          minimumDate={addDays(new Date(), 1)}
          onValueChange={handlePick}
          onDismiss={() => setShowPicker(false)}
          themeVariant="dark"
          accentColor={WELCOME.accent}
          textColor={WELCOME.text}
        />
      )}

      {earliestDate && (
        <>
          <Notice text={`Earliest safe date for your goal: ${formatDate(earliestDate)}`} />
          {goalDate?.getTime() !== earliestDate.getTime() && (
            <LinkButton
              label="Go as fast as is safe?"
              strong="Use this date"
              align="left"
              onPress={() => {
                setGoalDate(earliestDate);
                setMessage('');
              }}
            />
          )}
        </>
      )}

      <FormMessage text={message} />

      <PrimaryButton
        label="Build my plan"
        onPress={handleFinish}
        loading={isBusyMessage(message)}
      />
    </FormScreen>
  );
}

const styles = StyleSheet.create({
  pressed: { opacity: 0.75 },
  dateBox: {
    minHeight: 54,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: WELCOME.cardBorder,
    backgroundColor: WELCOME.card,
    paddingHorizontal: 16,
  },
  dateBoxActive: { borderColor: WELCOME.accent },
  dateText: { color: WELCOME.text, fontSize: 16 },
  datePlaceholder: { color: WELCOME.placeholder, fontSize: 16 },
  dateIcon: { fontSize: 18 },
});
