import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { supabase } from '@/lib/supabase';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type PlanSummary = {
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

export default function DashboardPlaceholder() {
  const [plan, setPlan] = useState<PlanSummary | null>(null);
  const [message, setMessage] = useState('Loading your plan...');

  // Reload every time the dashboard appears
  useFocusEffect(
    useCallback(() => {
      async function loadPlan() {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setMessage('Not logged in.');
          return;
        }

        const { data, error } = await supabase
          .from('user_plans')
          .select(
            'current_weight_kg, target_weight_kg, deadline_weeks, end_date, current_calorie_target, protein_grams, fat_grams, carb_grams, water_liters, step_goal'
          )
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (error) {
          setMessage(`Could not load your plan: ${error.message}`);
          return;
        }
        if (!data) {
          setMessage('No plan found yet.');
          return;
        }

        setPlan(data);
        setMessage('');
      }

      loadPlan();
    }, [])
  );

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
  button: { backgroundColor: '#ef4444', padding: 14, borderRadius: 8, alignItems: 'center', marginTop: 8 },
});