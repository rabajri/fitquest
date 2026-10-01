import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { supabase } from '@/lib/supabase';
import { inchesToCm } from '@/lib/units';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type UnitSystem = 'metric' | 'imperial';

export default function OnboardingMetricsScreen() {
  const [unitSystem, setUnitSystem] = useState<UnitSystem>('metric');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState<'male' | 'female' | ''>('');
  const [height, setHeight] = useState('');
  const [message, setMessage] = useState('');

  async function handleContinue() {
    if (!age || !gender || !height) {
      setMessage('Please fill in all fields.');
      return;
    }

    setMessage('Saving...');

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setMessage('Not logged in.');
      return;
    }

    // Convert to metric for storage if needed (we store everything in cm/kg internally)
    const heightCm = unitSystem === 'imperial' ? inchesToCm(Number(height)) : Number(height);

    const { error } = await supabase
      .from('user_profiles')
      .update({
        age: Number(age),
        gender,
        height_cm: heightCm,
        unit_system: unitSystem,
      })
      .eq('user_id', user.id);

    if (error) {
      setMessage(`Error: ${error.message}`);
      return;
    }

    // weight is plan-specific, not profile-specific — we'll pass it to the next
    // onboarding step (Goal Fork) once we build it. For now, just confirm.
    router.replace('/onboarding-goal');
  }

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ThemedText type="title">About You</ThemedText>

        <ThemedText>Units</ThemedText>
        <ThemedView style={styles.row}>
          <Pressable
            onPress={() => setUnitSystem('metric')}
            style={[styles.pill, unitSystem === 'metric' && styles.pillActive]}
          >
            <ThemedText>Metric (kg, cm)</ThemedText>
          </Pressable>
          <Pressable
            onPress={() => setUnitSystem('imperial')}
            style={[styles.pill, unitSystem === 'imperial' && styles.pillActive]}
          >
            <ThemedText>Imperial (lb, in)</ThemedText>
          </Pressable>
        </ThemedView>

        <TextInput
          placeholder="Age"
          value={age}
          onChangeText={setAge}
          keyboardType="number-pad"
          style={styles.input}
          placeholderTextColor="#888"
        />

        <ThemedText>Gender</ThemedText>
        <ThemedView style={styles.row}>
          <Pressable
            onPress={() => setGender('female')}
            style={[styles.pill, gender === 'female' && styles.pillActive]}
          >
            <ThemedText>Female</ThemedText>
          </Pressable>
          <Pressable
            onPress={() => setGender('male')}
            style={[styles.pill, gender === 'male' && styles.pillActive]}
          >
            <ThemedText>Male</ThemedText>
          </Pressable>
        </ThemedView>

        <TextInput
          placeholder={unitSystem === 'metric' ? 'Height (cm)' : 'Height (in)'}
          value={height}
          onChangeText={setHeight}
          keyboardType="decimal-pad"
          style={styles.input}
          placeholderTextColor="#888"
        />


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