import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { supabase } from '@/lib/supabase';
import { router } from 'expo-router';
import { Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function DashboardPlaceholder() {
  async function handleLogout() {
    await supabase.auth.signOut();
    router.replace('/login');
  }

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ThemedText type="title">Dashboard (coming soon)</ThemedText>
        <Pressable onPress={handleLogout} style={styles.button}>
          <ThemedText style={{ color: 'white' }}>Log Out</ThemedText>
        </Pressable>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 16 },
  button: { backgroundColor: '#ef4444', padding: 14, borderRadius: 8, paddingHorizontal: 24 },
});