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

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  async function handleLogin() {
    setMessage('Logging in...');
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setMessage(`Error: ${error.message}`);
      return;
    }

    const { data: profile } = await supabase
      .from('user_profiles')
      .select('onboarding_completed')
      .eq('user_id', data.user.id)
      .single();

    if (!profile?.onboarding_completed) {
      router.replace('/onboarding-metrics');
    } else {
      router.replace('/dashboard-placeholder');
    }
  }

  return (
    <FormScreen>
      <FormTitle
        eyebrow="WELCOME BACK"
        title="Log in to keep your streak going."
        subtitle="Pick up your quests right where you left off."
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
        placeholder="Your password"
        value={password}
        onChangeText={setPassword}
        autoCapitalize="none"
        autoComplete="current-password"
        secureTextEntry
        textContentType="password"
      />

      <FormMessage text={message} />

      <PrimaryButton label="Log in" onPress={handleLogin} loading={isBusyMessage(message)} />

      <LinkButton
        label="Don't have an account?"
        strong="Sign up"
        onPress={() => router.replace('/register')}
      />
    </FormScreen>
  );
}
