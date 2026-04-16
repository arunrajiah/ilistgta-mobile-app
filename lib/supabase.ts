import 'react-native-url-polyfill/auto';
import { Platform } from 'react-native';
import { createClient } from '@supabase/supabase-js';

// Use SecureStore on native, localStorage on web
let ExpoSecureStoreAdapter: { getItem: (k: string) => Promise<string | null>; setItem: (k: string, v: string) => Promise<void>; removeItem: (k: string) => Promise<void> };

if (Platform.OS === 'web') {
  ExpoSecureStoreAdapter = {
    getItem: (key) => Promise.resolve(typeof localStorage !== 'undefined' ? localStorage.getItem(key) : null),
    setItem: (key, value) => { if (typeof localStorage !== 'undefined') localStorage.setItem(key, value); return Promise.resolve(); },
    removeItem: (key) => { if (typeof localStorage !== 'undefined') localStorage.removeItem(key); return Promise.resolve(); },
  };
} else {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const SecureStore = require('expo-secure-store');
  ExpoSecureStoreAdapter = {
    getItem: (key) => SecureStore.getItemAsync(key),
    setItem: (key, value) => SecureStore.setItemAsync(key, value),
    removeItem: (key) => SecureStore.deleteItemAsync(key),
  };
}

const supabaseUrl  = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseKey  = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    storage: ExpoSecureStoreAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
