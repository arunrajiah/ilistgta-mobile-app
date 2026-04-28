import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, FontSize, Radius, Spacing, Shadow } from '@/constants/theme';
import { useAuth } from '@/lib/auth';

export default function RegisterScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { signUp } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mobile, setMobile] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleRegister() {
    if (!fullName.trim() || !email.trim() || !password) {
      Alert.alert('Missing fields', 'Please fill in all required fields.');
      return;
    }
    if (!agreed) {
      Alert.alert('Terms required', 'Please agree to the Terms of Service to continue.');
      return;
    }
    if (password.length < 8) {
      Alert.alert('Weak password', 'Password must be at least 8 characters.');
      return;
    }
    setLoading(true);
    try {
      await signUp(email.trim(), password, fullName.trim());
      Alert.alert(
        'Account created!',
        'Please check your email to verify your account, then sign in.',
        [{ text: 'OK', onPress: () => router.replace('/auth/login') }],
      );
    } catch (e: any) {
      Alert.alert('Registration failed', e.message ?? 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: Colors.surface }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={[s.container, { paddingTop: insets.top + 16 }]} keyboardShouldPersistTaps="handled">

        {/* Close */}
        <TouchableOpacity style={s.closeBtn} onPress={() => router.back()}>
          <Ionicons name="close" size={22} color={Colors.text} />
        </TouchableOpacity>

        {/* Header */}
        <Text style={s.heading}>Welcome user</Text>
        <Text style={s.subheading}>Sign up to join</Text>

        {/* Avatar placeholder */}
        <View style={s.avatarWrap}>
          <View style={s.avatar}>
            <Ionicons name="person-outline" size={40} color={Colors.textMuted} />
          </View>
          <TouchableOpacity style={s.avatarEdit}>
            <Ionicons name="camera" size={14} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Fields */}
        <View style={s.form}>
          <Field icon="person-outline" value={fullName} onChange={setFullName} placeholder="Name" autoCapitalize="words" />
          <Field icon="mail-outline" value={email} onChange={setEmail} placeholder="Email" keyboardType="email-address" autoCapitalize="none" />
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
          <Field icon="call-outline" value={mobile} onChange={setMobile} placeholder="Mobile" keyboardType="phone-pad" />

          {/* Terms checkbox */}
          <TouchableOpacity style={s.termsRow} onPress={() => setAgreed(v => !v)} activeOpacity={0.7}>
            <View style={[s.checkbox, agreed && s.checkboxActive]}>
              {agreed && <Ionicons name="checkmark" size={12} color="#fff" />}
            </View>
            <Text style={s.termsText}>
              I agree to the{' '}
              <Text style={s.termsLink}>Terms of Service</Text>
            </Text>
          </TouchableOpacity>

          {/* Sign Up button */}
          <TouchableOpacity
            style={[s.btn, loading && { opacity: 0.7 }]}
            onPress={handleRegister}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading
              ? <ActivityIndicator color="#fff" />
              : <Text style={s.btnText}>Sign Up</Text>
            }
          </TouchableOpacity>

          {/* Sign in link */}
          <View style={s.bottomRow}>
            <Text style={s.bottomText}>Have an account? </Text>
            <TouchableOpacity onPress={() => router.push('/auth/login')}>
              <Text style={s.linkText}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function Field({
  icon, value, onChange, placeholder, keyboardType = 'default', autoCapitalize = 'none',
}: {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  keyboardType?: 'default' | 'email-address' | 'phone-pad';
  autoCapitalize?: 'none' | 'words';
}) {
  return (
    <View style={s.fieldWrap}>
      <Ionicons name={icon} size={18} color={Colors.textMuted} style={s.fieldIcon} />
      <TextInput
        style={[s.input, { flex: 1 }]}
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor={Colors.textMuted}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        autoCorrect={false}
      />
    </View>
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
  heading: {
    fontSize: FontSize.xxl,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: 4,
  },
  subheading: {
    fontSize: FontSize.base,
    color: Colors.textSecondary,
    marginBottom: Spacing.lg,
  },

  avatarWrap: {
    alignSelf: 'center',
    marginBottom: Spacing.xl,
    position: 'relative',
  },
  avatar: {
    width: 86,
    height: 86,
    borderRadius: 43,
    backgroundColor: Colors.surfaceSecondary,
    borderWidth: 2,
    borderColor: Colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarEdit: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
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
    paddingVertical: Platform.OS === 'ios' ? 14 : 4,
    gap: Spacing.sm,
    ...Shadow.sm,
  },
  fieldIcon: { width: 20 },
  input: {
    fontSize: FontSize.base,
    color: Colors.text,
  },

  termsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginTop: -4,
  },
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
  termsText: { fontSize: FontSize.sm, color: Colors.textSecondary },
  termsLink: { color: Colors.primary, fontWeight: '600' },

  btn: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.full,
    paddingVertical: 15,
    alignItems: 'center',
    ...Shadow.md,
  },
  btnText: { color: '#fff', fontWeight: '700', fontSize: FontSize.base },

  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomText: { fontSize: FontSize.sm, color: Colors.textSecondary },
  linkText: { fontSize: FontSize.sm, color: Colors.primary, fontWeight: '700' },
});
