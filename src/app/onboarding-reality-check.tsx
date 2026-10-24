import { KeyboardScreen } from '@/components/keyboard-screen';
import { ThemedText } from '@/components/themed-text';
import { WEIGHT_LOSS, validateWeightLossDeadline } from '@/engine';
import { supabase } from '@/lib/supabase';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, TextInput } from 'react-native';

export default function OnboardingRealityCheckScreen() {
  const [weeks, setWeeks] = useState('');
  const [message, setMessage] = useState('');

  async function handleFinish() {
    const weeksNumber = Number(weeks);
    if (!weeksNumber || weeksNumber < 1) {
      setMessage('Please enter the number of weeks (at least 1).');
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
      .select('id, goal_type, current_weight_kg, target_weight_kg, wants_workout')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (planError || !plan) {
      setMessage(`Could not load your plan: ${planError?.message ?? 'no plan found'}`);
      return;
    }

    if (plan.goal_type === 'lose_weight' && plan.target_weight_kg) {
      const result = validateWeightLossDeadline({
        currentWeightKg: plan.current_weight_kg,
        targetWeightKg: plan.target_weight_kg,
        timelineDays: weeksNumber * 7,
        wantsWorkout: plan.wants_workout,
      });

      if (!result.ok) {
        const kgToLose = plan.current_weight_kg - plan.target_weight_kg;
        const maxKgPerWeek = plan.current_weight_kg * WEIGHT_LOSS.maxPercentPerWeek;
        const minWeeks = Math.ceil(kgToLose / maxKgPerWeek);
        setMessage(`${result.message} You need at least ${minWeeks} weeks for this goal.`);
        return;
      }
    }

    const endDate = new Date();
    endDate.setDate(endDate.getDate() + weeksNumber * 7);

    const { error: planUpdateError } = await supabase
      .from('user_plans')
      .update({
        deadline_weeks: weeksNumber,
        end_date: endDate.toISOString().slice(0, 10),
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
      <ThemedText>In how many weeks do you want to reach your goal?</ThemedText>

      <TextInput
        placeholder="Number of weeks (e.g. 12)"
        value={weeks}
        onChangeText={setWeeks}
        keyboardType="number-pad"
        style={styles.input}
        placeholderTextColor="#888"
      />

      <Pressable onPress={handleFinish} style={styles.button}>
        <ThemedText style={{ color: 'white' }}>Finish Setup</ThemedText>
      </Pressable>

      {!!message && <ThemedText>{message}</ThemedText>}
    </KeyboardScreen>
  );
}

const styles = StyleSheet.create({
  input: { borderWidth: 1, borderColor: '#444', borderRadius: 8, padding: 12, width: '100%', color: 'white' },
  button: { backgroundColor: '#3b82f6', padding: 14, borderRadius: 8, width: '100%', alignItems: 'center', marginTop: 8 },
});