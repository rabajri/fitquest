import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { supabase } from '@/lib/supabase';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

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
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ThemedText type="title">Log In</ThemedText>

        <TextInput placeholder="Email" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" style={styles.input} placeholderTextColor="#888" />
        <TextInput placeholder="Password" value={password} onChangeText={setPassword} autoCapitalize="none" secureTextEntry style={styles.input} placeholderTextColor="#888" />

        <Pressable onPress={handleLogin} style={styles.button}>
           <ThemedText style={{ color: 'white' }}>Log In</ThemedText>
        </Pressable>

         <Pressable onPress={() => router.push('/register')}>
           <ThemedText>Don't have an account? Sign up</ThemedText>
         </Pressable>

{!!message && <ThemedText>{message}</ThemedText>}

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