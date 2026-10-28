import {
  Field,
  FormMessage,
  FormScreen,
  FormTitle,
  isBusyMessage,
  LinkButton,
  PrimaryButton,
} from '@/components/form/form-ui';
import { supabase } from '@/lib/supabase';
import { router } from 'expo-router';
import { useState } from 'react';

export default function RegisterScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [needsConfirmation, setNeedsConfirmation] = useState(false);

  async function handleRegister() {
    setNeedsConfirmation(false);
    setMessage('Creating account...');
    const { data, error } = await supabase.auth.signUp({ email, password });

    if (error) {
      setMessage(`Error: ${error.message}`);
      return;
    }

    const userId = data.user?.id;
    if (!userId) {
      setNeedsConfirmation(true);
      setMessage('Check your email to confirm, then log in.');
      return;
    }

    const { error: profileError } = await supabase
      .from('user_profiles')
      .insert({ user_id: userId, name });

    if (profileError) {
      setMessage(`Account created, but profile failed: ${profileError.message}`);
      return;
    }

    router.replace('/onboarding-metrics');
  }

  return (
    <FormScreen>
      <FormTitle
        eyebrow="CREATE ACCOUNT"
        title="Let's start your quest."
        subtitle="It takes a minute. Then we'll build your plan together."
      />

      <Field
        label="Name"
        placeholder="What should we call you?"
        value={name}
        onChangeText={setName}
        autoComplete="name"
        textContentType="name"
      />
      <Field
        label="Email"
        placeholder="you@example.com"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        autoComplete="email"
        keyboardType="email-address"
        textContentType="emailAddress"
      />
      <Field
        label="Password"
        placeholder="At least 6 characters"
        value={password}
        onChangeText={setPassword}
        autoCapitalize="none"
        autoComplete="new-password"
        secureTextEntry
        textContentType="newPassword"
      />

      <FormMessage text={message} tone={needsConfirmation ? 'info' : undefined} />

      <PrimaryButton
        label="Create my account"
        onPress={handleRegister}
        loading={isBusyMessage(message)}
      />

      <LinkButton
        label="Already have an account?"
        strong="Log in"
        onPress={() => router.replace('/login')}
      />
    </FormScreen>
  );
}
