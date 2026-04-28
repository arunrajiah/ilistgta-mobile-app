import React, { useRef, useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ActivityIndicator, Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, FontSize, Radius, Spacing, Shadow } from '@/constants/theme';

const CODE_LENGTH = 6;
const RESEND_SECONDS = 80;

export default function VerifyScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { phone } = useLocalSearchParams<{ phone?: string }>();
  const displayPhone = phone ?? '+1 (XXX) XXX-XXXX';

  const [code, setCode] = useState<string[]>(Array(CODE_LENGTH).fill(''));
  const [countdown, setCountdown] = useState(RESEND_SECONDS);
  const [loading, setLoading] = useState(false);
  const inputRefs = useRef<(TextInput | null)[]>([]);

  useEffect(() => {
    if (countdown <= 0) return;
    const t = setInterval(() => setCountdown(v => v - 1), 1000);
    return () => clearInterval(t);
  }, [countdown]);

  function handleDigit(index: number, value: string) {
    const digit = value.replace(/\D/g, '').slice(-1);
    const next = [...code];
    next[index] = digit;
    setCode(next);
    if (digit && index < CODE_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  }

  function handleKeyPress(index: number, key: string) {
    if (key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  }

  async function handleVerify() {
    const full = code.join('');
    if (full.length < CODE_LENGTH) {
      Alert.alert('Incomplete', 'Please enter the full verification code.');
      return;
    }
    setLoading(true);
    try {
      // Verification logic: integrate with your auth backend here
      await new Promise(r => setTimeout(r, 1200));
      router.replace('/(tabs)' as any);
    } catch {
      Alert.alert('Invalid code', 'The code you entered is incorrect. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  function handleResend() {
    setCountdown(RESEND_SECONDS);
    setCode(Array(CODE_LENGTH).fill(''));
    inputRefs.current[0]?.focus();
  }

  const minutes = Math.floor(countdown / 60);
  const seconds = countdown % 60;
  const timeLabel = `${minutes}:${String(seconds).padStart(2, '0')} min left`;

  return (
    <KeyboardAvoidingView style={[s.root, { paddingTop: insets.top }]} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      {/* Back */}
      <TouchableOpacity style={s.backBtn} onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={22} color={Colors.text} />
      </TouchableOpacity>

      <View style={s.content}>
        {/* Icon */}
        <View style={s.iconWrap}>
          <Ionicons name="phone-portrait-outline" size={40} color={Colors.primary} />
        </View>

        <Text style={s.heading}>Verifying Number</Text>
        <Text style={s.sub}>
          We've sent your verification code to{'\n'}
          <Text style={s.phone}>{displayPhone}</Text>
        </Text>

        {/* OTP boxes */}
        <Text style={s.label}>Enter code</Text>
        <View style={s.otpRow}>
          {code.map((digit, i) => (
            <TextInput
              key={i}
              ref={r => { inputRefs.current[i] = r; }}
              style={[s.otpBox, digit && s.otpBoxFilled]}
              value={digit}
              onChangeText={v => handleDigit(i, v)}
              onKeyPress={({ nativeEvent }) => handleKeyPress(i, nativeEvent.key)}
              keyboardType="number-pad"
              maxLength={1}
              textAlign="center"
              selectionColor={Colors.primary}
            />
          ))}
        </View>

        {/* Resend */}
        <View style={s.resendRow}>
          {countdown > 0 ? (
            <Text style={s.countdown}>{timeLabel}</Text>
          ) : (
            <TouchableOpacity onPress={handleResend}>
              <Text style={s.resendText}>Resend code</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Verify button */}
        <TouchableOpacity
          style={[s.btn, loading && { opacity: 0.7 }]}
          onPress={handleVerify}
          disabled={loading}
          activeOpacity={0.85}
        >
          {loading
            ? <ActivityIndicator color="#fff" />
            : <Text style={s.btnText}>Verify</Text>
          }
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.surface,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surfaceSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: Spacing.lg,
    marginTop: Spacing.md,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xxl,
    alignItems: 'center',
  },
  iconWrap: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primaryBg,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  heading: {
    fontSize: FontSize.xxl,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  sub: {
    fontSize: FontSize.base,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: Spacing.xl,
  },
  phone: {
    color: Colors.primary,
    fontWeight: '700',
  },
  label: {
    alignSelf: 'flex-start',
    fontSize: FontSize.sm,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  otpRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  otpBox: {
    width: 46,
    height: 54,
    borderRadius: Radius.lg,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.surfaceSecondary,
    fontSize: FontSize.xl,
    fontWeight: '700',
    color: Colors.text,
    ...Shadow.sm,
  },
  otpBoxFilled: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryBg,
  },
  resendRow: {
    marginBottom: Spacing.xl,
    alignItems: 'center',
  },
  countdown: {
    fontSize: FontSize.sm,
    color: Colors.textMuted,
  },
  resendText: {
    fontSize: FontSize.sm,
    color: Colors.primary,
    fontWeight: '700',
  },
  btn: {
    width: '100%',
    backgroundColor: Colors.primary,
    borderRadius: Radius.full,
    paddingVertical: 15,
    alignItems: 'center',
    ...Shadow.md,
  },
  btnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: FontSize.base,
  },
});
