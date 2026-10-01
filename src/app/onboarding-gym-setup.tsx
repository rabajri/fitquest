import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { supabase } from '@/lib/supabase';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';


const EQUIPMENT_OPTIONS = ['Dumbbells', 'Barbell', 'Resistance Bands', 'Machines', 'Full Gym Access'];
const MACHINE_OPTIONS = [
  'Leg Press', 'Lat Pulldown', 'Cable Machine', 'Smith Machine',
  'Chest Press', 'Rowing Machine', 'Leg Extension', 'Leg Curl',
];
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MAX_DAYS = 6;

export default function OnboardingGymSetupScreen() {
  const [equipment, setEquipment] = useState<string[]>([]);
  const [dumbbellWeights, setDumbbellWeights] = useState<number[]>([]);
  const [newDumbbellWeight, setNewDumbbellWeight] = useState('');
  const [machineTypes, setMachineTypes] = useState<string[]>([]);
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [message, setMessage] = useState('');

  function toggleEquipment(item: string) {
    setEquipment((prev) =>
      prev.includes(item) ? prev.filter((e) => e !== item) : [...prev, item]
    );
  }

  function toggleMachine(item: string) {
    setMachineTypes((prev) =>
      prev.includes(item) ? prev.filter((m) => m !== item) : [...prev, item]
    );
  }

  function addDumbbellWeight() {
    const value = Number(newDumbbellWeight);
    if (!value || value <= 0) return;
    if (dumbbellWeights.includes(value)) {
      setNewDumbbellWeight('');
      return;
    }
    setDumbbellWeights((prev) => [...prev, value].sort((a, b) => a - b));
    setNewDumbbellWeight('');
  }

  function removeDumbbellWeight(value: number) {
    setDumbbellWeights((prev) => prev.filter((w) => w !== value));
  }

  function toggleDay(day: string) {
    setSelectedDays((prev) => {
      if (prev.includes(day)) return prev.filter((d) => d !== day);
      if (prev.length >= MAX_DAYS) {
        setMessage(`You can select at most ${MAX_DAYS} days — rest days matter too.`);
        return prev;
      }
      setMessage('');
      return [...prev, day];
    });
  }

  const hasDumbbells = equipment.includes('Dumbbells');
  const hasMachines = equipment.includes('Machines');

  async function handleContinue() {
    if (selectedDays.length === 0) {
      setMessage('Please select at least one training day.');
      return;
    }
    if (hasDumbbells && dumbbellWeights.length === 0) {
      setMessage('Please add at least one dumbbell weight, or deselect Dumbbells.');
      return;
    }
    if (hasMachines && machineTypes.length === 0) {
      setMessage('Please select at least one machine, or deselect Machines.');
      return;
    }

    setMessage('Saving...');

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setMessage('Not logged in.');
      return;
    }

    const { error } = await supabase
      .from('user_plans')
      .update({
        equipment, // empty array = bodyweight only
        dumbbell_weights_kg: hasDumbbells ? dumbbellWeights : null,
        machine_types: hasMachines ? machineTypes : null,
        selected_days: selectedDays,
      })
      .eq('user_id', user.id);

    if (error) {
      setMessage(`Error: ${error.message}`);
      return;
    }

    router.replace('/dashboard-placeholder');
  }

  async function handleSwitchToSteps() {
    setMessage('Switching to step tracking...');
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from('user_plans')
      .update({ wants_workout: false, mandatory_step_goal_active: true })
      .eq('user_id', user.id);

    if (error) {
      setMessage(`Error: ${error.message}`);
      return;
    }

    router.replace('/dashboard-placeholder');
  }

  return (
    <ThemedView style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <ThemedText type="title">Gym Setup</ThemedText>

        <ThemedText type="small">
          Leave equipment unselected if you'll be training with bodyweight only.
        </ThemedText>
        <ThemedText>Equipment Available</ThemedText>
        <ThemedView style={styles.wrapRow}>
          {EQUIPMENT_OPTIONS.map((item) => (
            <Pressable
              key={item}
              onPress={() => toggleEquipment(item)}
              style={[styles.pill, equipment.includes(item) && styles.pillActive]}
            >
              <ThemedText>{item}</ThemedText>
            </Pressable>
          ))}
        </ThemedView>

        {hasDumbbells && (
          <>
            <ThemedText>Your Dumbbell Weights (kg)</ThemedText>
            <ThemedView style={styles.row}>
              <TextInput
                placeholder="e.g. 10"
                value={newDumbbellWeight}
                onChangeText={setNewDumbbellWeight}
                keyboardType="decimal-pad"
                style={[styles.input, { flex: 1 }]}
                placeholderTextColor="#888"
              />
              <Pressable onPress={addDumbbellWeight} style={styles.addButton}>
                <ThemedText style={{ color: 'white' }}>Add</ThemedText>
              </Pressable>
            </ThemedView>
            <ThemedView style={styles.wrapRow}>
              {dumbbellWeights.map((w) => (
                <Pressable key={w} onPress={() => removeDumbbellWeight(w)} style={styles.chip}>
                  <ThemedText>{w} kg ✕</ThemedText>
                </Pressable>
              ))}
            </ThemedView>
          </>
        )}

        {hasMachines && (
          <>
            <ThemedText>Which Machines?</ThemedText>
            <ThemedView style={styles.wrapRow}>
              {MACHINE_OPTIONS.map((item) => (
                <Pressable
                  key={item}
                  onPress={() => toggleMachine(item)}
                  style={[styles.pill, machineTypes.includes(item) && styles.pillActive]}
                >
                  <ThemedText>{item}</ThemedText>
                </Pressable>
              ))}
            </ThemedView>
          </>
        )}

        <ThemedText>Training Days (max {MAX_DAYS})</ThemedText>
        <ThemedView style={styles.wrapRow}>
          {DAYS.map((day) => (
            <Pressable
              key={day}
              onPress={() => toggleDay(day)}
              style={[styles.dayPill, selectedDays.includes(day) && styles.pillActive]}
            >
              <ThemedText>{day}</ThemedText>
            </Pressable>
          ))}
        </ThemedView>

        <Pressable onPress={handleContinue} style={styles.button}>
          <ThemedText style={{ color: 'white' }}>Continue</ThemedText>
        </Pressable>

        <Pressable onPress={handleSwitchToSteps}>
          <ThemedText type="small">Actually, I'd rather just track steps</ThemedText>
        </Pressable>

        {!!message && <ThemedText>{message}</ThemedText>}
      </ScrollView>
    </SafeAreaView>
  </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1, paddingHorizontal: 24 },
  scrollContent: { alignItems: 'center', gap: 10, paddingVertical: 24 },
  input: { borderWidth: 1, borderColor: '#444', borderRadius: 8, padding: 12, color: 'white' },
  button: { backgroundColor: '#3b82f6', padding: 14, borderRadius: 8, width: '100%', alignItems: 'center', marginTop: 8 },
  addButton: { backgroundColor: '#3b82f6', borderRadius: 8, paddingHorizontal: 16, justifyContent: 'center' },
  row: { flexDirection: 'row', gap: 8, width: '100%' },
  wrapRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'center' },
  pill: { borderWidth: 1, borderColor: '#444', borderRadius: 8, padding: 10, paddingHorizontal: 14 },
  chip: { borderWidth: 1, borderColor: '#666', borderRadius: 16, padding: 8, paddingHorizontal: 12, backgroundColor: '#222' },
  dayPill: { borderWidth: 1, borderColor: '#444', borderRadius: 8, padding: 10, width: 44, alignItems: 'center' },
  pillActive: { backgroundColor: '#3b82f6', borderColor: '#3b82f6' },
});