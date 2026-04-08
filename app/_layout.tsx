import { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { AuthProvider } from '@/lib/auth';
import { Colors } from '@/constants/theme';
import { AppConfigContext, fetchAppConfig, DEFAULT_CONFIG } from '@/lib/appConfig';
import type { AppConfig } from '@/lib/appConfig';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [appConfig, setAppConfig] = useState<AppConfig>(DEFAULT_CONFIG);

  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  useEffect(() => {
    fetchAppConfig().then(setAppConfig);
  }, []);

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
