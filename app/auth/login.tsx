import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Colors, FontSize, Radius, Spacing } from '@/constants/theme';
import { useAuth } from '@/lib/auth';

export default function LoginScreen() {
  const router = useRouter();
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    if (!email.trim() || !password) {
      Alert.alert('Missing fields', 'Please enter your email and password.');
      return;
    }
    setLoading(true);
    try {
      await signIn(email.trim(), password);
      router.back();
    } catch (e: any) {
      Alert.alert('Sign in failed', e.message ?? 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.logo}>
          <Text style={styles.logoText}>iList<Text style={styles.logoGta}>GTA</Text></Text>
          <Text style={styles.logoSub}>Your GTA Business Directory</Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="you@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />

          <Text style={styles.label}>Password</Text>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            placeholder="Your password"
            secureTextEntry
          />

          <TouchableOpacity style={[styles.btn, loading && { opacity: 0.7 }]} onPress={handleLogin} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Sign In</Text>}
          </TouchableOpacity>

          <TouchableOpacity style={styles.linkRow} onPress={() => router.push('/auth/forgot-password')}>
            <Text style={styles.linkText}>Forgot password? <Text style={styles.link}>Reset it</Text></Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.linkRow} onPress={() => router.push('/auth/register')}>
            <Text style={styles.linkText}>Don't have an account? <Text style={styles.link}>Create one</Text></Text>
          </TouchableOpacity>
        </View>
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
