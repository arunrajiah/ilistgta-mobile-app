import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ActivityIndicator, Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors, FontSize, Radius, Spacing, Shadow } from '@/constants/theme';

export default function LocationScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [showManual, setShowManual] = useState(false);
  const [locationText, setLocationText] = useState('');
  const [loading, setLoading] = useState(false);

  async function saveAndContinue(location: string) {
    await AsyncStorage.setItem('user_location', location);
    router.replace('/(tabs)' as any);
  }

  async function handleUseCurrentLocation() {
    setLoading(true);
    try {
      // In production, use expo-location here
      await new Promise(r => setTimeout(r, 1000));
      await saveAndContinue('Greater Toronto Area');
    } finally {
      setLoading(false);
    }
  }

  async function handleSetManual() {
    if (!locationText.trim()) return;
    await saveAndContinue(locationText.trim());
  }

  if (showManual) {
    return (
      <View style={[s.root, { paddingTop: insets.top }]}>
        <TouchableOpacity style={s.backBtn} onPress={() => setShowManual(false)}>
          <Ionicons name="arrow-back" size={22} color={Colors.text} />
        </TouchableOpacity>

        <View style={s.manualContent}>
          <View style={s.iconWrap}>
            <Ionicons name="map-outline" size={40} color={Colors.primary} />
          </View>
          <Text style={s.heading}>Your Location</Text>

          <View style={s.inputWrap}>
            <Ionicons name="search-outline" size={18} color={Colors.textMuted} />
            <TextInput
              style={s.locationInput}
              value={locationText}
              onChangeText={setLocationText}
              placeholder="Type location you want…"
              placeholderTextColor={Colors.textMuted}
              autoFocus
            />
          </View>

          <TouchableOpacity
            style={[s.btn, !locationText.trim() && { opacity: 0.5 }]}
            onPress={handleSetManual}
            disabled={!locationText.trim()}
            activeOpacity={0.85}
          >
            <Text style={s.btnText}>Set Location</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={[s.root, { paddingTop: insets.top }]}>
      <View style={s.content}>
        {/* Illustration */}
        <LinearGradient colors={[Colors.primary, Colors.primaryDark]} style={s.illustrationBg}>
          <View style={s.mapIllustration}>
            <Ionicons name="location" size={64} color="#fff" />
            <View style={s.mapPulse} />
          </View>
        </LinearGradient>

        {/* Text */}
        <View style={s.textBlock}>
          <Text style={s.greeting}>Hello, nice to meet you!</Text>
          <Text style={s.sub}>
            Set your location to start finding new businesses around you
          </Text>

          <View style={s.hint}>
            <Ionicons name="information-circle-outline" size={16} color={Colors.textMuted} />
            <Text style={s.hintText}>
              We only access your location while you are using this incredible app
            </Text>
          </View>

          {/* Use current location */}
          <TouchableOpacity
            style={s.primaryBtn}
            onPress={handleUseCurrentLocation}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading
              ? <ActivityIndicator color="#fff" />
              : <>
                <Ionicons name="locate" size={18} color="#fff" />
                <Text style={s.primaryBtnText}>Use current location</Text>
              </>
            }
          </TouchableOpacity>

          {/* Divider */}
          <View style={s.divider}>
            <View style={s.dividerLine} />
            <Text style={s.dividerText}>or set your location manually</Text>
            <View style={s.dividerLine} />
          </View>

          {/* Manual location */}
          <TouchableOpacity
            style={s.secondaryBtn}
            onPress={() => setShowManual(true)}
            activeOpacity={0.85}
          >
            <Ionicons name="map-outline" size={18} color={Colors.primary} />
            <Text style={s.secondaryBtnText}>Enter location manually</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.surface },

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

  content: { flex: 1 },

  illustrationBg: {
    height: 280,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapIllustration: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapPulse: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
  },

  textBlock: {
    flex: 1,
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xl,
    gap: Spacing.md,
  },
  greeting: {
    fontSize: FontSize.xxl,
    fontWeight: '800',
    color: Colors.text,
  },
  sub: {
    fontSize: FontSize.base,
    color: Colors.textSecondary,
    lineHeight: 22,
  },
  hint: {
    flexDirection: 'row',
    gap: Spacing.sm,
    alignItems: 'flex-start',
    backgroundColor: Colors.primaryBg,
    borderRadius: Radius.md,
    padding: Spacing.md,
  },
  hintText: {
    flex: 1,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    lineHeight: 18,
  },

  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.primary,
    borderRadius: Radius.full,
    paddingVertical: 15,
    ...Shadow.md,
  },
  primaryBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: FontSize.base,
  },

  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  dividerLine: { flex: 1, height: 1, backgroundColor: Colors.border },
  dividerText: { fontSize: FontSize.xs, color: Colors.textMuted },

  secondaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    borderRadius: Radius.full,
    paddingVertical: 13,
  },
  secondaryBtnText: {
    color: Colors.primary,
    fontWeight: '700',
    fontSize: FontSize.base,
  },

  /* Manual location */
  manualContent: {
    flex: 1,
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xl,
    gap: Spacing.lg,
  },
  iconWrap: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primaryBg,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
  },
  heading: {
    fontSize: FontSize.xxl,
    fontWeight: '800',
    color: Colors.text,
    textAlign: 'center',
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.surfaceSecondary,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: Platform.OS === 'ios' ? 14 : 4,
    ...Shadow.sm,
  },
  locationInput: {
    flex: 1,
    fontSize: FontSize.base,
    color: Colors.text,
  },
  btn: {
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
