import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { LOGGING } from '@/engine';
import { todayLocalDate } from '@/lib/dates';
import { supabase } from '@/lib/supabase';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet } from 'react-native';
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
  water_target_liters: number | null;
  water_logged_liters: number;
};

export default function DashboardPlaceholder() {
  const [plan, setPlan] = useState<PlanSummary | null>(null);
  const [log, setLog] = useState<TodayLog | null>(null);
  const [message, setMessage] = useState('Loading your plan...');

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
          .select('id, water_target_liters, water_logged_liters')
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
            .select('id, water_target_liters, water_logged_liters')
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

  async function handleLogout() {
    await supabase.auth.signOut();
    router.replace('/login');
  }

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.content}>
          <ThemedText type="title">Today</ThemedText>

          {!!message && <ThemedText>{message}</ThemedText>}

          {log && (
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

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  content: { padding: 20, gap: 16 },
  card: { borderWidth: 1, borderColor: '#444', borderRadius: 12, padding: 16, gap: 8 },
  rowLine: { flexDirection: 'row', justifyContent: 'space-between' },
  addButton: { backgroundColor: '#3b82f6', padding: 12, borderRadius: 8, alignItems: 'center' },
  button: { backgroundColor: '#ef4444', padding: 14, borderRadius: 8, alignItems: 'center', marginTop: 8 },
});