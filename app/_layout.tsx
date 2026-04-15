import { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { AuthProvider } from '@/lib/auth';
import { Colors } from '@/constants/theme';
import { AppConfigContext, fetchAppConfig, DEFAULT_CONFIG } from '@/lib/appConfig';
import type { AppConfig } from '@/lib/appConfig';
import { setApiBaseUrl } from '@/lib/api';
import { LangProvider } from '@/lib/i18n';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [appConfig, setAppConfig] = useState<AppConfig>(DEFAULT_CONFIG);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Fetch remote config first, then hide splash. Falls back to DEFAULT_CONFIG on any error.
    // A 3-second safety timeout ensures splash always hides even if the fetch hangs.
    const safetyTimer = setTimeout(() => {
      setReady(true);
      SplashScreen.hideAsync();
    }, 3000);

    fetchAppConfig().then(cfg => {
      clearTimeout(safetyTimer);
      // If the admin has set a custom API base URL, apply it for all subsequent API calls.
      if (cfg.apiBaseUrl) setApiBaseUrl(cfg.apiBaseUrl);
      setAppConfig(cfg);
      setReady(true);
      SplashScreen.hideAsync();
    });

    return () => clearTimeout(safetyTimer);
  }, []);

  // Keep native splash visible until config is loaded (max 3 s via safety timer)
  if (!ready) return null;

  if (appConfig.maintenance) {
    return (
      <View style={styles.maintenanceContainer}>
        <StatusBar style="auto" />
        <Text style={styles.maintenanceIcon}>🔧</Text>
        <Text style={styles.maintenanceTitle}>Under Maintenance</Text>
        <Text style={styles.maintenanceMessage}>
          {appConfig.maintenanceMessage || "We're updating the app. Please check back shortly."}
        </Text>
      </View>
    );
  }

  return (
    <AppConfigContext.Provider value={appConfig}>
      <LangProvider>
      <AuthProvider>
        <StatusBar style="auto" />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen
            name="business/[slug]"
            options={{ headerShown: true, headerTitle: '', headerBackTitle: 'Back', headerTintColor: Colors.primary }}
          />
          <Stack.Screen
            name="event/[slug]"
            options={{ headerShown: true, headerTitle: '', headerBackTitle: 'Back', headerTintColor: Colors.primary }}
          />
          <Stack.Screen
            name="auth/login"
            options={{ headerShown: true, headerTitle: 'Sign In', headerTintColor: Colors.primary, presentation: 'modal' }}
          />
          <Stack.Screen
            name="auth/register"
            options={{ headerShown: true, headerTitle: 'Create Account', headerTintColor: Colors.primary, presentation: 'modal' }}
          />
          <Stack.Screen
            name="auth/forgot-password"
            options={{ headerShown: true, headerTitle: 'Forgot Password', headerTintColor: Colors.primary, presentation: 'modal' }}
          />
          <Stack.Screen name="listing/new" options={{ headerShown: false }} />
          <Stack.Screen name="listing/[id]/edit" options={{ headerShown: false }} />
          <Stack.Screen name="my-listings" options={{ headerShown: false }} />
          <Stack.Screen name="my-events" options={{ headerShown: false }} />
          <Stack.Screen name="my-coupons" options={{ headerShown: false }} />
          <Stack.Screen name="vendor-profile" options={{ headerShown: false }} />
          <Stack.Screen name="analytics" options={{ headerShown: false }} />
          <Stack.Screen name="event-form/new" options={{ headerShown: false }} />
          <Stack.Screen name="event-form/[id]/edit" options={{ headerShown: false }} />
          <Stack.Screen name="coupon-form/new" options={{ headerShown: false }} />
          <Stack.Screen name="coupon-form/[id]/edit" options={{ headerShown: false }} />
          <Stack.Screen name="enquiries" options={{ headerShown: false }} />
          <Stack.Screen name="saved" options={{ headerShown: false }} />
          <Stack.Screen name="account-settings" options={{ headerShown: false }} />
          <Stack.Screen name="help" options={{ headerShown: false }} />
          <Stack.Screen name="about" options={{ headerShown: false }} />
        </Stack>
      </AuthProvider>
      </LangProvider>
    </AppConfigContext.Provider>
  );
}

const styles = StyleSheet.create({
  maintenanceContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    backgroundColor: '#ffffff',
  },
  maintenanceIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  maintenanceTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 12,
    textAlign: 'center',
  },
  maintenanceMessage: {
    fontSize: 15,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 22,
  },
});
