import React, { useEffect, useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Colors, FontSize, Radius, Spacing } from '@/constants/theme';
import { supabase } from '@/lib/supabase';
import { useLang } from '@/lib/i18n';

export default function ResetPasswordScreen() {
  const router = useRouter();
  const { t } = useLang();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    // Listen for Supabase PASSWORD_RECOVERY event triggered when the user
    // follows the magic link from the forgot-password email.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setReady(true);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  async function handleUpdate() {
    if (!password || password.length < 8) {
      Alert.alert(t('auth.error'), 'Password must be at least 8 characters.');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert(t('auth.error'), 'Passwords do not match.');
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      setDone(true);
    } catch (e: any) {
      Alert.alert(t('auth.error'), e.message ?? 'Failed to update password.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.logo}>
          <Text style={styles.logoText}>iList<Text style={styles.logoGta}>GTA</Text></Text>
          <Text style={styles.logoSub}>{t('auth.resetPassword')}</Text>
        </View>

        {done ? (
          <View style={styles.successBox}>
            <Text style={styles.successTitle}>Password Updated!</Text>
            <Text style={styles.successMsg}>Your password has been changed successfully. You can now sign in with your new password.</Text>
            <TouchableOpacity style={styles.btn} onPress={() => router.replace('/auth/login')}>
              <Text style={styles.btnText}>{t('auth.signIn')}</Text>
            </TouchableOpacity>
          </View>
        ) : !ready ? (
          <View style={styles.waitingBox}>
            <ActivityIndicator size="large" color={Colors.primary} />
            <Text style={styles.waitingText}>Verifying your reset link…</Text>
            <Text style={styles.waitingHint}>
              If this screen stays empty, please request a new password reset link.
            </Text>
            <TouchableOpacity style={styles.linkRow} onPress={() => router.replace('/auth/forgot-password')}>
              <Text style={styles.linkText}>← Request new link</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.form}>
            <Text style={styles.instructions}>Enter your new password below.</Text>

            <Text style={styles.label}>New Password</Text>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              placeholder="Min. 8 characters"
              placeholderTextColor={Colors.textMuted}
              secureTextEntry
              autoFocus
            />

            <Text style={styles.label}>Confirm Password</Text>
            <TextInput
              style={styles.input}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Re-enter new password"
              placeholderTextColor={Colors.textMuted}
              secureTextEntry
            />

            <TouchableOpacity style={[styles.btn, loading && { opacity: 0.7 }]} onPress={handleUpdate} disabled={loading}>
              {loading
                ? <ActivityIndicator color="#fff" />
                : <Text style={styles.btnText}>Set New Password</Text>
              }
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: Colors.surface, padding: Spacing.xl, justifyContent: 'center' },
  logo: { alignItems: 'center', marginBottom: Spacing.xxl },
  logoText: { fontSize: 36, fontWeight: '900', color: Colors.text },
  logoGta: { color: Colors.primary },
  logoSub: { fontSize: FontSize.base, color: Colors.textMuted, marginTop: 4 },
  form: { gap: Spacing.sm },
  instructions: { fontSize: FontSize.sm, color: Colors.textSecondary, lineHeight: 20, marginBottom: Spacing.sm },
  label: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.textSecondary, marginTop: Spacing.sm },
  input: {
    borderWidth: 1, borderColor: Colors.border, borderRadius: Radius.md,
    paddingHorizontal: Spacing.md, paddingVertical: 12,
    fontSize: FontSize.base, color: Colors.text, backgroundColor: Colors.surface,
    marginTop: 4,
  },
  btn: {
    backgroundColor: Colors.primary, borderRadius: Radius.md,
    paddingVertical: 14, alignItems: 'center', marginTop: Spacing.md,
  },
  btnText: { color: '#fff', fontSize: FontSize.base, fontWeight: '700' },
  linkRow: { alignItems: 'center', marginTop: Spacing.md },
  linkText: { color: Colors.primary, fontSize: FontSize.sm, fontWeight: '600' },
  successBox: {
    alignItems: 'center', gap: Spacing.md, padding: Spacing.lg,
    backgroundColor: Colors.primaryBg, borderRadius: Radius.lg,
  },
  successTitle: { fontSize: FontSize.lg, fontWeight: '800', color: Colors.primary },
  successMsg: { fontSize: FontSize.sm, color: Colors.textSecondary, textAlign: 'center', lineHeight: 20 },
  waitingBox: { alignItems: 'center', gap: Spacing.md, padding: Spacing.lg },
  waitingText: { fontSize: FontSize.base, fontWeight: '600', color: Colors.text },
  waitingHint: { fontSize: FontSize.sm, color: Colors.textMuted, textAlign: 'center', lineHeight: 20 },
});
