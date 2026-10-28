import { WELCOME } from '@/constants/welcome-theme';
import { supabase } from '@/lib/supabase';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
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
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {checking && <ActivityIndicator color={WELCOME.accent} />}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: WELCOME.background },
  safeArea: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});