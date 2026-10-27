import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { supabase } from '@/lib/supabase';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function IndexScreen() {
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      if (!data.session) {
        router.replace('/welcome');
        setChecking(false);
        return;
      }

      const { data: profile } = await supabase
         .from('user_profiles')
         .select('onboarding_completed')
         .eq('user_id', data.session.user.id)
         .single();

      if (!profile?.onboarding_completed) {
        router.replace('/onboarding-metrics');
      } else {
        router.replace('/dashboard-placeholder');
      }
      setChecking(false);
    });
  }, []);

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ThemedText>{checking ? 'Loading...' : ''}</ThemedText>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});