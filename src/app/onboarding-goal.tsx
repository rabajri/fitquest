import {
  Field,
  FormMessage,
  FormScreen,
  FormTitle,
  isBusyMessage,
  Notice,
  Option,
  OptionRow,
  PrimaryButton,
  SectionLabel,
} from '@/components/form/form-ui';
import { WEIGHT_LIMITS_KG } from '@/engine/constants';
import { getHealthyWeightRangeKg } from '@/lib/bmi';
import { parseDecimal } from '@/lib/numbers';
import { supabase } from '@/lib/supabase';
import { kgToLb, lbToKg } from '@/lib/units';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';

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

  const unit = isImperial ? 'lb' : 'kg';
  // Weights are stored in kg; show them in the user's own unit
  const showWeight = (kg: number) => (isImperial ? Math.round(kgToLb(kg)) : kg);

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

    const toKg = (text: string) => {
      const value = parseDecimal(text);
      return isImperial ? lbToKg(value) : value;
    };
    const currentWeightKg = toKg(currentWeight);
    const targetWeightKg = targetWeight ? toKg(targetWeight) : null;

    const inLimits = (kg: number) => kg >= WEIGHT_LIMITS_KG.min && kg <= WEIGHT_LIMITS_KG.max;
    if (!inLimits(currentWeightKg) || (targetWeightKg !== null && !inLimits(targetWeightKg))) {
      setMessage(
        `Weights should be numbers between ${showWeight(WEIGHT_LIMITS_KG.min)} and ${showWeight(WEIGHT_LIMITS_KG.max)} ${unit}.`
      );
      return;
    }

    if (goal === 'lose_weight' && targetWeightKg && targetWeightKg >= currentWeightKg) {
      setMessage('Target weight should be less than your current weight.');
      return;
    }

    if (targetWeightKg && healthyRange && targetWeightKg < healthyRange.min) {
      setMessage(`Target weight is below a healthy minimum for your height (${showWeight(healthyRange.min)} ${unit}).`);
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

    // Everyone ends at Reality Check, where the plan is calculated.
    // push (not replace) so the next step can come back here
    setMessage('');
    router.push(finalWantsWorkout ? '/onboarding-gym-setup' : '/onboarding-reality-check');
  }

  return (
    <FormScreen step={{ current: 2, total: 4 }}>
      <FormTitle
        eyebrow="YOUR GOAL"
        title="What are we working toward?"
        subtitle="Your weights stay private. They only shape your daily targets."
      />

      <OptionRow>
        <Option
          label="Lose weight"
          grow
          selected={goal === 'lose_weight'}
          onPress={() => setGoal('lose_weight')}
        />
        <Option label="Gain muscle" sublabel="Coming soon" grow disabled />
      </OptionRow>

      <Field
        label="Current weight"
        placeholder={isImperial ? 'e.g. 180' : 'e.g. 82'}
        value={currentWeight}
        onChangeText={setCurrentWeight}
        keyboardType="decimal-pad"
        suffix={unit}
      />

      {goal === 'lose_weight' && (
        <>
          <Field
            label="Target weight"
            placeholder={isImperial ? 'e.g. 155' : 'e.g. 70'}
            value={targetWeight}
            onChangeText={setTargetWeight}
            keyboardType="decimal-pad"
            suffix={unit}
          />

          {healthyRange && (
            <Notice
              text={`Healthy weight range for your height: ${showWeight(healthyRange.min)}–${showWeight(healthyRange.max)} ${unit}`}
            />
          )}

          <SectionLabel>Do you want a workout plan?</SectionLabel>
          <OptionRow>
            <Option
              label="Yes, plan workouts"
              grow
              selected={wantsWorkout === true}
              onPress={() => setWantsWorkout(true)}
            />
            <Option
              label="No, just steps"
              grow
              selected={wantsWorkout === false}
              onPress={() => setWantsWorkout(false)}
            />
          </OptionRow>
        </>
      )}

      <FormMessage text={message} />

      <PrimaryButton label="Continue" onPress={handleContinue} loading={isBusyMessage(message)} />
    </FormScreen>
  );
}
