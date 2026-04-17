import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView, Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Colors, FontSize, Radius, Spacing } from '@/constants/theme';
import { useAuth } from '@/lib/auth';

export default function RegisterScreen() {
  const router = useRouter();
  const { signUp } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm]   = useState('');
  const [loading, setLoading]   = useState(false);

  async function handleRegister() {
    if (!fullName.trim() || !email.trim() || !password) {
      Alert.alert('Missing fields', 'Please fill in all fields.'); return;
    }
    if (password !== confirm) {
      Alert.alert('Password mismatch', 'Passwords do not match.'); return;
    }
    if (password.length < 8) {
      Alert.alert('Weak password', 'Password must be at least 8 characters.'); return;
    }
    setLoading(true);
    try {
      await signUp(email.trim(), password, fullName.trim());
      Alert.alert(
        'Account created!',
        'Please check your email to verify your account, then sign in.',
        [{ text: 'OK', onPress: () => router.replace('/auth/login') }]
      );
    } catch (e: any) {
      Alert.alert('Registration failed', e.message ?? 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.logo}>
          <Image source={require('../../assets/images/logo-dark.png')} style={styles.logoImg} resizeMode="contain" />
          <Text style={styles.logoSub}>Join the GTA community</Text>
        </View>

        <View style={styles.form}>
          {[
            { label: 'Full Name', value: fullName, set: setFullName, placeholder: 'Jane Doe', type: 'default' },
            { label: 'Email', value: email, set: setEmail, placeholder: 'you@example.com', type: 'email-address' },
            { label: 'Password', value: password, set: setPassword, placeholder: 'Min. 8 characters', secure: true },
            { label: 'Confirm Password', value: confirm, set: setConfirm, placeholder: 'Repeat password', secure: true },
          ].map(field => (
            <React.Fragment key={field.label}>
              <Text style={styles.label}>{field.label}</Text>
              <TextInput
                style={styles.input}
                value={field.value}
                onChangeText={field.set}
                placeholder={field.placeholder}
                keyboardType={(field.type as any) ?? 'default'}
                autoCapitalize={field.type === 'email-address' ? 'none' : 'words'}
                autoCorrect={false}
                secureTextEntry={field.secure}
              />
            </React.Fragment>
          ))}

          <TouchableOpacity style={[styles.btn, loading && { opacity: 0.7 }]} onPress={handleRegister} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Create Account</Text>}
          </TouchableOpacity>

          <TouchableOpacity style={styles.linkRow} onPress={() => router.push('/auth/login')}>
            <Text style={styles.linkText}>Already have an account? <Text style={styles.link}>Sign in</Text></Text>
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
  container: { flexGrow: 1, backgroundColor: Colors.surface, padding: Spacing.xl },
  logo: { alignItems: 'center', marginVertical: Spacing.xl },
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
  linkRow: { alignItems: 'center', marginTop: Spacing.md, marginBottom: Spacing.xxl },
  linkText: { fontSize: FontSize.sm, color: Colors.textSecondary },
  link: { color: Colors.primary, fontWeight: '700' },
});
