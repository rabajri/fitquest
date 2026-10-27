import { ThemedTextInput } from '@/components/themed-text-input';
import { KeyboardScreen } from '@/components/keyboard-screen';
import { ThemedText } from '@/components/themed-text';
import { supabase } from '@/lib/supabase';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet } from 'react-native';

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
    <KeyboardScreen>
      <ThemedText type="title">Log In</ThemedText>

      <ThemedTextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        style={styles.input}
      />
      <ThemedTextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        autoCapitalize="none"
        secureTextEntry
        style={styles.input}
      />

      <Pressable onPress={handleLogin} style={styles.button}>
        <ThemedText style={{ color: 'white' }}>Log In</ThemedText>
      </Pressable>

      <Pressable onPress={() => router.push('/register')}>
        <ThemedText>Don't have an account? Sign up</ThemedText>
      </Pressable>

      {!!message && <ThemedText>{message}</ThemedText>}
    </KeyboardScreen>
  );
}

const styles = StyleSheet.create({
  input: { borderWidth: 1, borderColor: '#444', borderRadius: 8, padding: 12, width: '100%' },
  button: { backgroundColor: '#3b82f6', padding: 14, borderRadius: 8, width: '100%', alignItems: 'center' },
});