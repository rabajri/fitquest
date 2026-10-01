import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { supabase } from '@/lib/supabase';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function RegisterScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  async function handleRegister() {
    setMessage('Creating account...');
    const { data, error } = await supabase.auth.signUp({ email, password });

    if (error) {
      setMessage(`Error: ${error.message}`);
      return;
    }

    const userId = data.user?.id;
    if (!userId) {
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
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ThemedText type="title">Create Account</ThemedText>

        <TextInput placeholder="Name" value={name} onChangeText={setName} style={styles.input} placeholderTextColor="#888" />
        <TextInput placeholder="Email" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" style={styles.input} placeholderTextColor="#888" />
        <TextInput placeholder="Password" value={password} onChangeText={setPassword} autoCapitalize="none" secureTextEntry style={styles.input} placeholderTextColor="#888" />

        <Pressable onPress={handleRegister} style={styles.button}>
          <ThemedText style={{ color: 'white' }}>Sign Up</ThemedText>
        </Pressable>

        <Pressable onPress={() => router.push('/login')}>
          <ThemedText>Already have an account? Log in</ThemedText>
        </Pressable>

        {!!message && <ThemedText>{message}</ThemedText>}
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12, paddingHorizontal: 24 },
  input: { borderWidth: 1, borderColor: '#444', borderRadius: 8, padding: 12, width: '100%', color: 'white' },
  button: { backgroundColor: '#3b82f6', padding: 14, borderRadius: 8, width: '100%', alignItems: 'center' },
});