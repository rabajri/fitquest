import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://kixlzggramuwnvwbfqip.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtpeGx6Z2dyYW11d252d2JmcWlwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA2ODI4NzksImV4cCI6MjEwNjI1ODg3OX0.GChlRtkMUN5E57TRNy42cE_0UFbxal-mKhdNqDZEWws';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});