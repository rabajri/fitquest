import { KeyboardScreen } from '@/components/keyboard-screen';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { supabase } from '@/lib/supabase';
import { inchesToCm } from '@/lib/units';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, TextInput } from 'react-native';

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

    // We always store height in cm, whatever unit the user picked
    const heightCm = unitSystem === 'imperial' ? inchesToCm(Number(height)) : Number(height);

    const { error } = await supabase
      .from('user_profiles')
      .upsert(
        {
          user_id: user.id,
          age: Number(age),
          gender,
          height_cm: heightCm,
          unit_system: unitSystem,
        },
        { onConflict: 'user_id' }
      );

    if (error) {
      setMessage(`Error: ${error.message}`);
      return;
    }

    router.replace('/onboarding-goal');
  }

  return (
    <KeyboardScreen>
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
    </KeyboardScreen>
  );
}

const styles = StyleSheet.create({
  input: { borderWidth: 1, borderColor: '#444', borderRadius: 8, padding: 12, width: '100%', color: 'white' },
  button: { backgroundColor: '#3b82f6', padding: 14, borderRadius: 8, width: '100%', alignItems: 'center', marginTop: 8 },
  row: { flexDirection: 'row', gap: 8, width: '100%' },
  pill: { flex: 1, borderWidth: 1, borderColor: '#444', borderRadius: 8, padding: 10, alignItems: 'center' },
  pillActive: { backgroundColor: '#3b82f6', borderColor: '#3b82f6' },
});