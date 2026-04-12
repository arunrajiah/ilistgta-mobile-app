import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Colors, FontSize, Radius, Spacing } from '@/constants/theme';
import { supabase } from '@/lib/supabase';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleReset() {
    if (!email.trim() || !email.includes('@')) {
      Alert.alert('Invalid email', 'Please enter a valid email address.');
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: 'ilistgta://reset-password',
      });
      if (error) throw error;
      setSent(true);
    } catch (e: any) {
      Alert.alert('Error', e.message ?? 'Failed to send reset email.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.logo}>
          <Text style={styles.logoText}>iList<Text style={styles.logoGta}>GTA</Text></Text>
          <Text style={styles.logoSub}>Reset your password</Text>
        </View>

        {sent ? (
          <View style={styles.successBox}>
            <Text style={styles.successTitle}>Check your inbox</Text>
            <Text style={styles.successMsg}>
              We've sent a password reset link to {email}. Follow the link in the email to set a new password.
            </Text>
            <TouchableOpacity style={styles.btn} onPress={() => router.replace('/auth/login')}>
              <Text style={styles.btnText}>Back to Sign In</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.form}>
            <Text style={styles.instructions}>
              Enter your email address and we'll send you a link to reset your password.
            </Text>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="you@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              autoFocus
            />
            <TouchableOpacity style={[styles.btn, loading && { opacity: 0.7 }]} onPress={handleReset} disabled={loading}>
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Send Reset Link</Text>}
            </TouchableOpacity>
            <TouchableOpacity style={styles.linkRow} onPress={() => router.back()}>
              <Text style={styles.linkText}>← Back to Sign In</Text>
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
  successBox: { alignItems: 'center', gap: Spacing.md, padding: Spacing.lg, backgroundColor: Colors.primaryBg, borderRadius: Radius.lg },
  successTitle: { fontSize: FontSize.lg, fontWeight: '800', color: Colors.primary },
  successMsg: { fontSize: FontSize.sm, color: Colors.textSecondary, textAlign: 'center', lineHeight: 20 },
});
