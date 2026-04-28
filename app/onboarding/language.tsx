import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, FontSize, Radius, Spacing, Shadow } from '@/constants/theme';
import { useLang } from '@/lib/i18n';

const LANGUAGES = [
  { code: 'en', label: 'English', native: 'English' },
  { code: 'zh', label: 'Chinese', native: '中文' },
  { code: 'pt', label: 'Portuguese', native: 'Português' },
  { code: 'es', label: 'Spanish', native: 'Español' },
  { code: 'hi', label: 'Hindi', native: 'हिन्दी' },
  { code: 'ar', label: 'Arabic', native: 'العربية' },
  { code: 'ru', label: 'Russian', native: 'Русский' },
  { code: 'bg', label: 'Bulgarian', native: 'Български' },
  { code: 'lt', label: 'Lithuanian', native: 'Lietuvių' },
  { code: 'ta', label: 'Tamil', native: 'தமிழ்' },
];

export default function LanguageScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { lang, setLang } = useLang();
  const [selected, setSelected] = useState<string>(lang ?? 'en');

  function handleSelect() {
    if (selected === 'en' || selected === 'ta') setLang(selected);
    router.replace('/onboarding/location' as any);
  }

  return (
    <View style={[s.root, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color={Colors.text} />
        </TouchableOpacity>
        <View style={s.userAvatar}>
          <Ionicons name="person-outline" size={28} color={Colors.textMuted} />
        </View>
      </View>

      <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        <Text style={s.heading}>Hi, welcome!</Text>
        <Text style={s.sub}>
          Please select your preferred language to facilitate communication
        </Text>

        {/* Language grid */}
        <View style={s.grid}>
          {LANGUAGES.map(lng => {
            const active = selected === lng.code;
            return (
              <TouchableOpacity
                key={lng.code}
                style={[s.langBtn, active && s.langBtnActive]}
                onPress={() => setSelected(lng.code)}
                activeOpacity={0.75}
              >
                {active && (
                  <View style={s.checkBadge}>
                    <Ionicons name="checkmark" size={10} color="#fff" />
                  </View>
                )}
                <Text style={[s.langLabel, active && s.langLabelActive]}>{lng.label}</Text>
                <Text style={[s.langNative, active && s.langNativeActive]}>{lng.native}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      {/* Bottom CTA */}
      <View style={[s.bottom, { paddingBottom: insets.bottom + 16 }]}>
        <TouchableOpacity style={s.selectBtn} onPress={handleSelect} activeOpacity={0.85}>
          <Text style={s.selectBtnText}>Select</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.surface },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surfaceSecondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.surfaceSecondary,
    borderWidth: 2,
    borderColor: Colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },

  content: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xl,
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
    lineHeight: 22,
    marginBottom: Spacing.xl,
  },

  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  langBtn: {
    position: 'relative',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: Radius.full,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    ...Shadow.sm,
  },
  langBtnActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryBg,
  },
  checkBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  langLabel: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    color: Colors.text,
  },
  langLabelActive: { color: Colors.primary },
  langNative: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    marginTop: 2,
  },
  langNativeActive: { color: Colors.primaryLight },

  bottom: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
    backgroundColor: Colors.surface,
  },
  selectBtn: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.full,
    paddingVertical: 15,
    alignItems: 'center',
    ...Shadow.md,
  },
  selectBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: FontSize.base,
  },
});
