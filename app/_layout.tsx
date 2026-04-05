import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { AuthProvider } from '@/lib/auth';
import { Colors } from '@/constants/theme';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
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
        <Stack.Screen name="enquiries" options={{ headerShown: false }} />
        <Stack.Screen name="saved" options={{ headerShown: false }} />
        <Stack.Screen name="account-settings" options={{ headerShown: false }} />
        <Stack.Screen name="help" options={{ headerShown: false }} />
        <Stack.Screen name="about" options={{ headerShown: false }} />
      </Stack>
    </AuthProvider>
  );
}
