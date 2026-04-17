import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView, Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Colors, FontSize, Radius, Spacing } from '@/constants/theme';
import { useAuth } from '@/lib/auth';
import { useLang } from '@/lib/i18n';
import { useAppConfig } from '@/lib/appConfig';

export default function LoginScreen() {
  const router = useRouter();
  const { signIn } = useAuth();
  const { t } = useLang();
  const { branding } = useAppConfig();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    if (!email.trim() || !password) {
      Alert.alert(t('auth.error'), 'Please enter your email and password.');
      return;
    }
    setLoading(true);
    try {
      await signIn(email.trim(), password);
      router.back();
    } catch (e: any) {
      Alert.alert(t('auth.loginFailed'), e.message ?? 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.logo}>
          {branding.logoDark
            ? <Image source={{ uri: branding.logoDark }} style={styles.logoImg} resizeMode="contain" />
            : <Image source={require('../../assets/images/logo-dark.png')} style={styles.logoImg} resizeMode="contain" />
          }
          <Text style={styles.logoSub}>Your GTA Business Directory</Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>{t('auth.email')}</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="you@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />

          <Text style={styles.label}>{t('auth.password')}</Text>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            placeholder="Your password"
            secureTextEntry
          />

          <TouchableOpacity style={[styles.btn, loading && { opacity: 0.7 }]} onPress={handleLogin} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>{t('auth.signIn')}</Text>}
          </TouchableOpacity>

          <TouchableOpacity style={styles.linkRow} onPress={() => router.push('/auth/forgot-password')}>
            <Text style={styles.linkText}>{t('auth.forgotPassword')} <Text style={styles.link}>Reset it</Text></Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.linkRow} onPress={() => router.push('/auth/register')}>
            <Text style={styles.linkText}>{t('auth.noAccount')} <Text style={styles.link}>Create one</Text></Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.linkRow} onPress={() => router.push('/(tabs)/')}>
            <Text style={styles.linkText}>← Back to Home</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: Colors.surface, padding: Spacing.xl, justifyContent: 'center' },
  logo: { alignItems: 'center', marginBottom: Spacing.xxl },
  logoImg: { width: 160, height: 40, marginBottom: 6 },
  logoSub: { fontSize: FontSize.base, color: Colors.textMuted, marginTop: 4 },
  form: { gap: 4 },
  label: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.text, marginTop: Spacing.md, marginBottom: 6 },
  input: {
    backgroundColor: Colors.surfaceSecondary, borderWidth: 1, borderColor: Colors.border,
    borderRadius: Radius.md, padding: Spacing.md, fontSize: FontSize.base, color: Colors.text,
  },
  btn: {
    backgroundColor: Colors.primary, borderRadius: Radius.full,
    paddingVertical: 14, alignItems: 'center', marginTop: Spacing.lg,
  },
  btnText: { color: '#fff', fontWeight: '700', fontSize: FontSize.base },
  linkRow: { alignItems: 'center', marginTop: Spacing.md },
  linkText: { fontSize: FontSize.sm, color: Colors.textSecondary },
  link: { color: Colors.primary, fontWeight: '700' },
});
