import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { getHealthyWeightRangeKg } from '@/lib/bmi';
import { supabase } from '@/lib/supabase';
import { lbToKg } from '@/lib/units';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type Goal = 'lose_weight' | 'gain_muscle' | '';

export default function OnboardingGoalScreen() {
  const [goal, setGoal] = useState<Goal>('');
  const [currentWeight, setCurrentWeight] = useState('');
  const [targetWeight, setTargetWeight] = useState('');
  const [wantsWorkout, setWantsWorkout] = useState<boolean | null>(null);
  const [message, setMessage] = useState('');
  const [heightCm, setHeightCm] = useState<number | null>(null);
  const [healthyRange, setHealthyRange] = useState<{ min: number; max: number } | null>(null);
  const [isImperial, setIsImperial] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return;
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('height_cm, unit_system')
        .eq('user_id', user.id)
        .single();

      if (profile?.height_cm) {
        setHeightCm(profile.height_cm);
        setHealthyRange(getHealthyWeightRangeKg(profile.height_cm));
      }
      setIsImperial(profile?.unit_system === 'imperial');
    });
  }, []);

  async function handleContinue() {
    if (!goal || !currentWeight) {
      setMessage('Please select a goal and enter your current weight.');
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

    if (targetWeightKg) {
     const { data: { user: freshUser } } = await supabase.auth.getUser();
    const { data: freshProfile } = await supabase
     .from('user_profiles')
     .select('height_cm')
     .eq('user_id', freshUser?.id)
     .single();

    if (freshProfile?.height_cm) {
         const range = getHealthyWeightRangeKg(freshProfile.height_cm);
    if (targetWeightKg < range.min) {
      setMessage(`Target weight is below a healthy minimum for your height (${range.min} kg).`);
      return;
         }
     }
    }

    setMessage('Saving...');

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setMessage('Not logged in.');
      return;
    }

    const finalWantsWorkout = goal === 'gain_muscle' ? true : wantsWorkout;

const { error } = await supabase.from('user_plans').insert({
  user_id: user.id,
  goal_type: goal,
  current_weight_kg: currentWeightKg,
  target_weight_kg: targetWeightKg,
  wants_workout: finalWantsWorkout,
  mandatory_step_goal_active: !finalWantsWorkout,
});

if (error) {
  setMessage(`Error: ${error.message}`);
  return;
}

router.replace(finalWantsWorkout ? '/onboarding-gym-setup' : '/dashboard-placeholder');
  }

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ThemedText type="title">Your Goal</ThemedText>

        <ThemedView style={styles.row}>
          <Pressable
            onPress={() => setGoal('lose_weight')}
            style={[styles.pill, goal === 'lose_weight' && styles.pillActive]}
          >
            <ThemedText>Lose Weight</ThemedText>
          </Pressable>
          <Pressable
            onPress={() => setGoal('gain_muscle')}
            style={[styles.pill, goal === 'gain_muscle' && styles.pillActive]}
          >
            <ThemedText>Gain Muscle</ThemedText>
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

        {goal === 'gain_muscle' && (
          <ThemedText type="small">
            Muscle gain requires a workout plan — we'll set that up next.
          </ThemedText>
        )}

        <Pressable onPress={handleContinue} style={styles.button}>
          <ThemedText style={{ color: 'white' }}>Continue</ThemedText>
        </Pressable>

        {!!message && <ThemedText>{message}</ThemedText>}
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 10, paddingHorizontal: 24 },
  input: { borderWidth: 1, borderColor: '#444', borderRadius: 8, padding: 12, width: '100%', color: 'white' },
  button: { backgroundColor: '#3b82f6', padding: 14, borderRadius: 8, width: '100%', alignItems: 'center', marginTop: 8 },
  row: { flexDirection: 'row', gap: 8, width: '100%' },
  pill: { flex: 1, borderWidth: 1, borderColor: '#444', borderRadius: 8, padding: 10, alignItems: 'center' },
  pillActive: { backgroundColor: '#3b82f6', borderColor: '#3b82f6' },
});