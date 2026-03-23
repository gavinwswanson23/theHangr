import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  // Keep this as a warning so the app can still boot in UI-only mode.
  console.warn('Missing Supabase environment variables. Set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY.');
}

const memoryStorage = new Map<string, string>();

const safeStorage = {
  getItem: async (key: string) => {
    if (Platform.OS === 'web') return memoryStorage.get(key) ?? null;
    try {
      return await AsyncStorage.getItem(key);
    } catch {
      return memoryStorage.get(key) ?? null;
    }
  },
  setItem: async (key: string, value: string) => {
    memoryStorage.set(key, value);
    if (Platform.OS === 'web') return;
    try {
      await AsyncStorage.setItem(key, value);
    } catch {
      // Fall back to memory storage in environments where native storage is unavailable.
    }
  },
  removeItem: async (key: string) => {
    memoryStorage.delete(key);
    if (Platform.OS === 'web') return;
    try {
      await AsyncStorage.removeItem(key);
    } catch {
      // Fall back to memory storage in environments where native storage is unavailable.
    }
  },
};

export const supabase = createClient(supabaseUrl ?? '', supabaseAnonKey ?? '', {
  auth: {
    storage: safeStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
