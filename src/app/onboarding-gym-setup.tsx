import {
  Field,
  FormMessage,
  FormScreen,
  FormTitle,
  isBusyMessage,
  LinkButton,
  Notice,
  Option,
  OptionRow,
  PrimaryButton,
  SectionLabel,
} from '@/components/form/form-ui';
import { SESSION_MINUTES_OPTIONS } from '@/engine';
import { parseDecimal } from '@/lib/numbers';
import { getRecoveryWarnings } from '@/lib/recovery';
import { supabase } from '@/lib/supabase';
import { kgToLb, lbToKg } from '@/lib/units';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';

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
  const [sessionMinutes, setSessionMinutes] = useState<number | null>(null);
  const [message, setMessage] = useState('');
  const [isImperial, setIsImperial] = useState(false);

  const unit = isImperial ? 'lb' : 'kg';
  // Dumbbell weights are stored in kg; show them in the user's own unit
  const showWeight = (kg: number) => (isImperial ? Math.round(kgToLb(kg) * 10) / 10 : kg);

  useEffect(() => {
    async function loadUnits() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('unit_system')
        .eq('user_id', user.id)
        .maybeSingle();
      setIsImperial(profile?.unit_system === 'imperial');
    }
    loadUnits();
  }, []);

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
    const typed = parseDecimal(newDumbbellWeight);
    if (!Number.isFinite(typed) || typed <= 0) {
      setMessage('Enter a dumbbell weight as a number, e.g. 10.');
      return;
    }
    setMessage('');
    const value = isImperial ? Math.round(lbToKg(typed) * 100) / 100 : typed;
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
  const warnings = getRecoveryWarnings(selectedDays);

  async function handleContinue() {
    if (selectedDays.length === 0) {
      setMessage('Please select at least one training day.');
      return;
    }
    if (sessionMinutes === null) {
      setMessage('Please choose how long each session lasts.');
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
        session_duration_minutes: sessionMinutes,
      })
      .eq('user_id', user.id);

    if (error) {
      setMessage(`Error: ${error.message}`);
      return;
    }

    setMessage('');
    // push (not replace) so Reality Check can come back here
    router.push('/onboarding-reality-check');
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

    setMessage('');
    router.push('/onboarding-reality-check');
  }

  return (
    <FormScreen step={{ current: 3, total: 4 }}>
      <FormTitle
        eyebrow="GYM SETUP"
        title="What can you train with?"
        subtitle="Leave equipment unselected if you'll train with bodyweight only."
      />

      <SectionLabel>Equipment available</SectionLabel>
      <OptionRow>
        {EQUIPMENT_OPTIONS.map((item) => (
          <Option
            key={item}
            label={item}
            selected={equipment.includes(item)}
            onPress={() => toggleEquipment(item)}
          />
        ))}
      </OptionRow>

      {hasDumbbells && (
        <>
          <SectionLabel>Your dumbbell weights</SectionLabel>
          <View style={styles.addRow}>
            <Field
              placeholder="e.g. 10"
              value={newDumbbellWeight}
              onChangeText={setNewDumbbellWeight}
              keyboardType="decimal-pad"
              suffix={unit}
              returnKeyType="done"
              onSubmitEditing={addDumbbellWeight}
              containerStyle={styles.addField}
            />
            <Option label="Add" onPress={addDumbbellWeight} style={styles.addButton} />
          </View>
          {dumbbellWeights.length > 0 && (
            <OptionRow>
              {dumbbellWeights.map((w) => (
                <Option
                  key={w}
                  label={`${showWeight(w)} ${unit}  ✕`}
                  selected
                  onPress={() => removeDumbbellWeight(w)}
                />
              ))}
            </OptionRow>
          )}
        </>
      )}

      {hasMachines && (
        <>
          <SectionLabel>Which machines?</SectionLabel>
          <OptionRow>
            {MACHINE_OPTIONS.map((item) => (
              <Option
                key={item}
                label={item}
                selected={machineTypes.includes(item)}
                onPress={() => toggleMachine(item)}
              />
            ))}
          </OptionRow>
        </>
      )}

      <SectionLabel>Training days (max {MAX_DAYS})</SectionLabel>
      <OptionRow>
        {DAYS.map((day) => (
          <Option
            key={day}
            label={day}
            selected={selectedDays.includes(day)}
            onPress={() => toggleDay(day)}
            style={styles.day}
          />
        ))}
      </OptionRow>

      {warnings.map((w) => (
        <Notice key={w} text={w} tone="warning" />
      ))}

      <SectionLabel>Session length</SectionLabel>
      <OptionRow>
        {SESSION_MINUTES_OPTIONS.map((minutes) => (
          <Option
            key={minutes}
            label={`${minutes} min`}
            grow
            selected={sessionMinutes === minutes}
            onPress={() => setSessionMinutes(minutes)}
          />
        ))}
      </OptionRow>

      <FormMessage text={message} />

      <PrimaryButton label="Continue" onPress={handleContinue} loading={isBusyMessage(message)} />

      <LinkButton label="Actually, I'd rather just" strong="track steps" onPress={handleSwitchToSteps} />
    </FormScreen>
  );
}

const styles = StyleSheet.create({
  addRow: { flexDirection: 'row', gap: 10, alignItems: 'stretch' },
  addField: { flex: 1 },
  addButton: { minWidth: 72 },
  day: { minWidth: 64 },
});
