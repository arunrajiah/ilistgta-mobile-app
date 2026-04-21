import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ActivityIndicator, Alert, KeyboardAvoidingView, Platform,
  ScrollView, Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, FontSize, Radius, Spacing, Shadow } from '@/constants/theme';
import { useAuth } from '@/lib/auth';
import { useLang } from '@/lib/i18n';
import { useAppConfig } from '@/lib/appConfig';

export default function LoginScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { signIn } = useAuth();
  const { t } = useLang();
  const { branding } = useAppConfig();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
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
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: Colors.surface }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={[s.container, { paddingTop: insets.top + 16 }]} keyboardShouldPersistTaps="handled">

        {/* Close button */}
        <TouchableOpacity style={s.closeBtn} onPress={() => router.back()}>
          <Ionicons name="close" size={22} color={Colors.text} />
        </TouchableOpacity>

        {/* Logo */}
        <View style={s.logoWrap}>
          {branding.logoDark
            ? <Image source={{ uri: branding.logoDark }} style={s.logoImg} resizeMode="contain" />
            : <Image source={require('../../assets/images/logo-dark.png')} style={s.logoImg} resizeMode="contain" />
          }
        </View>

        {/* Heading */}
        <Text style={s.heading}>Welcome back</Text>
        <Text style={s.subheading}>Sign in to continue</Text>

        {/* Form */}
        <View style={s.form}>
          {/* Email */}
          <View style={s.fieldWrap}>
            <Ionicons name="mail-outline" size={18} color={Colors.textMuted} style={s.fieldIcon} />
            <TextInput
              style={s.input}
              value={email}
              onChangeText={setEmail}
              placeholder="johndoe@mail.com"
              placeholderTextColor={Colors.textMuted}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          {/* Password */}
          <View style={s.fieldWrap}>
            <Ionicons name="lock-closed-outline" size={18} color={Colors.textMuted} style={s.fieldIcon} />
            <TextInput
              style={[s.input, { flex: 1 }]}
              value={password}
              onChangeText={setPassword}
              placeholder="Password"
              placeholderTextColor={Colors.textMuted}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity onPress={() => setShowPassword(v => !v)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={18} color={Colors.textMuted} />
            </TouchableOpacity>
          </View>

          {/* Remember me / Forgot password row */}
          <View style={s.rememberRow}>
            <TouchableOpacity style={s.checkRow} onPress={() => setRememberMe(v => !v)} activeOpacity={0.7}>
              <View style={[s.checkbox, rememberMe && s.checkboxActive]}>
                {rememberMe && <Ionicons name="checkmark" size={12} color="#fff" />}
              </View>
              <Text style={s.rememberText}>Remember me</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push('/auth/forgot-password')}>
              <Text style={s.forgotText}>Forgot password?</Text>
            </TouchableOpacity>
          </View>

          {/* Sign In button */}
          <TouchableOpacity
            style={[s.btn, loading && { opacity: 0.7 }]}
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading
              ? <ActivityIndicator color="#fff" />
              : <Text style={s.btnText}>Sign In</Text>
            }
          </TouchableOpacity>

          {/* Divider */}
          <View style={s.divider}>
            <View style={s.dividerLine} />
            <Text style={s.dividerText}>or</Text>
            <View style={s.dividerLine} />
          </View>

          {/* Facebook sign in */}
          <TouchableOpacity style={s.socialBtn} activeOpacity={0.85}>
            <Ionicons name="logo-facebook" size={20} color="#1877F2" />
            <Text style={s.socialBtnText}>Sign in with Facebook</Text>
          </TouchableOpacity>

          {/* Sign up link */}
          <View style={s.bottomRow}>
            <Text style={s.bottomText}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => router.push('/auth/register')}>
              <Text style={s.linkText}>Sign Up</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.xxl,
  },

  closeBtn: {
    alignSelf: 'flex-end',
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.surfaceSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },

  logoWrap: { alignItems: 'center', marginBottom: Spacing.xl },
  logoImg: { width: 140, height: 36 },

  heading: {
    fontSize: FontSize.xxl,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: 6,
  },
  subheading: {
    fontSize: FontSize.base,
    color: Colors.textSecondary,
    marginBottom: Spacing.xl,
  },

  form: { gap: Spacing.md },

  fieldWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceSecondary,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing.md,
    minHeight: 54,
    gap: Spacing.sm,
    ...Shadow.sm,
  },
  fieldIcon: { width: 20 },
  input: {
    flex: 1,
    fontSize: FontSize.base,
    color: Colors.text,
    paddingVertical: 14,
  },

  rememberRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: -4,
  },
  checkRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: Colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  rememberText: { fontSize: FontSize.sm, color: Colors.textSecondary },
  forgotText: { fontSize: FontSize.sm, color: Colors.primary, fontWeight: '600' },

  btn: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.full,
    paddingVertical: 15,
    alignItems: 'center',
    ...Shadow.md,
  },
  btnText: { color: '#fff', fontWeight: '700', fontSize: FontSize.base },

  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginVertical: 4,
  },
  dividerLine: { flex: 1, height: 1, backgroundColor: Colors.border },
  dividerText: { fontSize: FontSize.sm, color: Colors.textMuted },

  socialBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: Radius.full,
    paddingVertical: 13,
    backgroundColor: Colors.surface,
    ...Shadow.sm,
  },
  socialBtnText: {
    fontSize: FontSize.base,
    fontWeight: '600',
    color: Colors.text,
  },

  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
  },
  bottomText: { fontSize: FontSize.sm, color: Colors.textSecondary },
  linkText: { fontSize: FontSize.sm, color: Colors.primary, fontWeight: '700' },
});
