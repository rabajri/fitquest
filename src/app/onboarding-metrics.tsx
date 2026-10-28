import {
  Field,
  FormMessage,
  FormScreen,
  FormTitle,
  isBusyMessage,
  Option,
  OptionRow,
  PrimaryButton,
  SectionLabel,
} from '@/components/form/form-ui';
import { AGE_LIMITS, HEIGHT_LIMITS_CM } from '@/engine/constants';
import { parseDecimal } from '@/lib/numbers';
import { supabase } from '@/lib/supabase';
import { inchesToCm } from '@/lib/units';
import { router } from 'expo-router';
import { useState } from 'react';

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

    const ageYears = parseDecimal(age);
    if (!Number.isInteger(ageYears) || ageYears < AGE_LIMITS.min || ageYears > AGE_LIMITS.max) {
      setMessage(`Age should be a whole number between ${AGE_LIMITS.min} and ${AGE_LIMITS.max}.`);
      return;
    }

    // We always store height in cm, whatever unit the user picked
    const heightValue = parseDecimal(height);
    const heightCm = unitSystem === 'imperial' ? inchesToCm(heightValue) : heightValue;

    if (!(heightCm >= HEIGHT_LIMITS_CM.min && heightCm <= HEIGHT_LIMITS_CM.max)) {
      setMessage(
        `Height should be between ${HEIGHT_LIMITS_CM.min} and ${HEIGHT_LIMITS_CM.max} cm. Please check the number and the unit.`
      );
      return;
    }

    setMessage('Saving...');

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setMessage('Not logged in.');
      return;
    }

    const { error } = await supabase
      .from('user_profiles')
      .upsert(
        {
          user_id: user.id,
          age: ageYears,
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

    setMessage('');
    // push (not replace) so the next step can come back here
    router.push('/onboarding-goal');
  }

  return (
    <FormScreen step={{ current: 1, total: 4 }}>
      <FormTitle
        eyebrow="ABOUT YOU"
        title="Let's get to know you."
        subtitle="We use this to work out how much energy your body needs each day."
      />

      <SectionLabel>Units</SectionLabel>
      <OptionRow>
        <Option
          label="Metric"
          sublabel="kg, cm"
          grow
          selected={unitSystem === 'metric'}
          onPress={() => setUnitSystem('metric')}
        />
        <Option
          label="Imperial"
          sublabel="lb, in"
          grow
          selected={unitSystem === 'imperial'}
          onPress={() => setUnitSystem('imperial')}
        />
      </OptionRow>

      <SectionLabel>Gender</SectionLabel>
      <OptionRow>
        <Option
          label="Female"
          grow
          selected={gender === 'female'}
          onPress={() => setGender('female')}
        />
        <Option label="Male" grow selected={gender === 'male'} onPress={() => setGender('male')} />
      </OptionRow>

      <Field
        label="Age"
        placeholder="e.g. 28"
        value={age}
        onChangeText={setAge}
        keyboardType="number-pad"
        suffix="years"
      />

      <Field
        label="Height"
        placeholder={unitSystem === 'metric' ? 'e.g. 165' : 'e.g. 65'}
        value={height}
        onChangeText={setHeight}
        keyboardType="decimal-pad"
        suffix={unitSystem === 'metric' ? 'cm' : 'in'}
      />

      <FormMessage text={message} />

      <PrimaryButton label="Continue" onPress={handleContinue} loading={isBusyMessage(message)} />
    </FormScreen>
  );
}
