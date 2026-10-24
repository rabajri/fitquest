import { KeyboardScreen } from '@/components/keyboard-screen';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { getHealthyWeightRangeKg } from '@/lib/bmi';
import { supabase } from '@/lib/supabase';
import { lbToKg } from '@/lib/units';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, StyleSheet, TextInput } from 'react-native';

type Goal = 'lose_weight' | 'gain_muscle' | '';

export default function OnboardingGoalScreen() {
  // Weight loss is the only available goal for now
  const [goal, setGoal] = useState<Goal>('lose_weight');
  const [currentWeight, setCurrentWeight] = useState('');
  const [targetWeight, setTargetWeight] = useState('');
  const [wantsWorkout, setWantsWorkout] = useState<boolean | null>(null);
  const [message, setMessage] = useState('');
  const [healthyRange, setHealthyRange] = useState<{ min: number; max: number } | null>(null);
  const [isImperial, setIsImperial] = useState(false);

  // Runs every time this screen appears, not just the first time
  useFocusEffect(
    useCallback(() => {
      async function loadProfile() {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setMessage('Not logged in.');
          return;
        }

        const { data: profile, error } = await supabase
          .from('user_profiles')
          .select('height_cm, unit_system')
          .eq('user_id', user.id)
          .maybeSingle();

        if (error) {
          setMessage(`Could not load your height: ${error.message}`);
          return;
        }
        if (!profile?.height_cm) {
          setMessage('No height found on your profile. Go back and fill in About You.');
          return;
        }

        setMessage('');
        setHealthyRange(getHealthyWeightRangeKg(profile.height_cm));
        setIsImperial(profile.unit_system === 'imperial');
      }

      loadProfile();
    }, [])
  );

  async function handleContinue() {
    if (!goal || !currentWeight) {
      setMessage('Please select a goal and enter your current weight.');
      return;
    }
    if (goal === 'lose_weight' && !targetWeight) {
      setMessage('Please enter your target weight.');
      return;
    }
    if (goal === 'lose_weight' && wantsWorkout === null) {
      setMessage('Please let us know if you want to work out.');
      return;
    }

    const currentWeightKg = isImperial ? lbToKg(Number(currentWeight)) : Number(currentWeight);
    const targetWeightKg = targetWeight
      ? (isImperial ? lbToKg(Number(targetWeight)) : Number(targetWeight))
      : null;

    if (goal === 'lose_weight' && targetWeightKg && targetWeightKg >= currentWeightKg) {
      setMessage('Target weight should be less than your current weight.');
      return;
    }

    if (targetWeightKg && healthyRange && targetWeightKg < healthyRange.min) {
      setMessage(`Target weight is below a healthy minimum for your height (${healthyRange.min} kg).`);
      return;
    }

    setMessage('Saving...');

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setMessage('Not logged in.');
      return;
    }

    const finalWantsWorkout = goal === 'gain_muscle' ? true : wantsWorkout;

    const planData = {
      goal_type: goal,
      current_weight_kg: currentWeightKg,
      target_weight_kg: targetWeightKg,
      wants_workout: finalWantsWorkout,
      mandatory_step_goal_active: !finalWantsWorkout,
    };

    // Update the user's existing plan if there is one, otherwise create it
    const { data: existingPlan, error: lookupError } = await supabase
      .from('user_plans')
      .select('id')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (lookupError) {
      setMessage(`Error: ${lookupError.message}`);
      return;
    }

    const { error } = existingPlan
      ? await supabase.from('user_plans').update(planData).eq('id', existingPlan.id)
      : await supabase.from('user_plans').insert({ user_id: user.id, ...planData });

    if (error) {
      setMessage(`Error: ${error.message}`);
      return;
    }

    // Everyone ends at Reality Check, where the plan is calculated
    router.replace(finalWantsWorkout ? '/onboarding-gym-setup' : '/onboarding-reality-check');
  }

  return (
    <KeyboardScreen>
      <ThemedText type="title">Your Goal</ThemedText>

      <ThemedView style={styles.row}>
        <Pressable
          onPress={() => setGoal('lose_weight')}
          style={[styles.pill, goal === 'lose_weight' && styles.pillActive]}
        >
          <ThemedText>Lose Weight</ThemedText>
        </Pressable>
        <Pressable disabled style={[styles.pill, styles.pillDisabled]}>
          <ThemedText>Gain Muscle</ThemedText>
          <ThemedText type="small">Coming soon</ThemedText>
        </Pressable>
      </ThemedView>

      <TextInput
        placeholder="Current Weight"
        value={currentWeight}
        onChangeText={setCurrentWeight}
        keyboardType="decimal-pad"
        style={styles.input}
        placeholderTextColor="#888"
      />

      {healthyRange && (
        <ThemedText type="small">
          Healthy weight range for your height: {healthyRange.min}–{healthyRange.max} kg
        </ThemedText>
      )}

      {goal === 'lose_weight' && (
        <>
          <TextInput
            placeholder="Target Weight"
            value={targetWeight}
            onChangeText={setTargetWeight}
            keyboardType="decimal-pad"
            style={styles.input}
            placeholderTextColor="#888"
          />

          <ThemedText>Do you want a workout plan?</ThemedText>
          <ThemedView style={styles.row}>
            <Pressable
              onPress={() => setWantsWorkout(true)}
              style={[styles.pill, wantsWorkout === true && styles.pillActive]}
            >
              <ThemedText>Yes</ThemedText>
            </Pressable>
            <Pressable
              onPress={() => setWantsWorkout(false)}
              style={[styles.pill, wantsWorkout === false && styles.pillActive]}
            >
              <ThemedText>No</ThemedText>
            </Pressable>
          </ThemedView>
        </>
      )}

      <Pressable onPress={handleContinue} style={styles.button}>
        <ThemedText style={{ color: 'white' }}>Continue</ThemedText>
      </Pressable>

      {!!message && <ThemedText>{message}</ThemedText>}
    </KeyboardScreen>
  );
}

const styles = StyleSheet.create({
  input: { borderWidth: 1, borderColor: '#444', borderRadius: 8, padding: 12, width: '100%', color: 'white' },
  button: { backgroundColor: '#3b82f6', padding: 14, borderRadius: 8, width: '100%', alignItems: 'center', marginTop: 8 },
  row: { flexDirection: 'row', gap: 8, width: '100%' },
  pill: { flex: 1, borderWidth: 1, borderColor: '#444', borderRadius: 8, padding: 10, alignItems: 'center' },
  pillActive: { backgroundColor: '#3b82f6', borderColor: '#3b82f6' },
  pillDisabled: { opacity: 0.4 },
});