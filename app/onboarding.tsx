import React, { useRef, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  Dimensions, Animated, Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors, Spacing, FontSize, Radius } from '@/constants/theme';

const { width, height } = Dimensions.get('window');

const SLIDES = [
  {
    id: '1',
    number: '01.',
    title: 'Discover Businesses\nNear You',
    subtitle: 'Find the best local businesses by your location or neighbourhood in the GTA.',
    icon: 'storefront-outline' as const,
    gradient: [Colors.primary, Colors.primaryDark] as [string, string],
    iconBg: 'rgba(255,255,255,0.15)',
  },
  {
    id: '2',
    number: '02.',
    title: 'Search for Services',
    subtitle: 'Browse all the services you need — from cleaning to tech, food to fitness.',
    icon: 'search-outline' as const,
    gradient: ['#1a6b4a', '#0d4a32'] as [string, string],
    iconBg: 'rgba(255,255,255,0.15)',
  },
  {
    id: '3',
    number: '03.',
    title: 'Exclusive Deals\n& Events',
    subtitle: 'Unlock coupons, attend local events, and save on your favourite businesses.',
    icon: 'ticket-outline' as const,
    gradient: ['#2d5a7a', '#1e3d52'] as [string, string],
    iconBg: 'rgba(255,255,255,0.15)',
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const flatListRef = useRef<FlatList>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;

  async function finish() {
    await AsyncStorage.setItem('onboarding_done', '1');
    router.replace('/onboarding/language' as any);
  }

  function handleNext() {
    if (activeIndex < SLIDES.length - 1) {
      const next = activeIndex + 1;
      flatListRef.current?.scrollToIndex({ index: next, animated: true });
      setActiveIndex(next);
    } else {
      finish();
    }
  }

  function handleSkip() {
    finish();
  }

  return (
    <View style={s.root}>
      <Animated.FlatList
        ref={flatListRef}
        data={SLIDES}
        keyExtractor={item => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false },
        )}
        onMomentumScrollEnd={e => {
          const idx = Math.round(e.nativeEvent.contentOffset.x / width);
          setActiveIndex(idx);
        }}
        renderItem={({ item }) => (
          <LinearGradient colors={item.gradient} style={s.slide}>
            {/* Top row: number + skip */}
            <View style={[s.topRow, { paddingTop: insets.top + 16 }]}>
              <Text style={s.slideNumber}>{item.number}</Text>
              {activeIndex < SLIDES.length - 1 && (
                <TouchableOpacity onPress={handleSkip} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
                  <Text style={s.skipText}>Skip</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Illustration area */}
            <View style={s.illustrationArea}>
              <View style={[s.iconRing, { backgroundColor: item.iconBg }]}>
                <View style={s.iconInner}>
                  <Ionicons name={item.icon} size={72} color="#fff" />
                </View>
              </View>
              {/* Decorative circles */}
              <View style={s.decCircle1} />
              <View style={s.decCircle2} />
            </View>

            {/* Text content */}
            <View style={s.textBlock}>
              <Text style={s.slideTitle}>{item.title}</Text>
              <Text style={s.slideSubtitle}>{item.subtitle}</Text>
            </View>
          </LinearGradient>
        )}
      />

      {/* Bottom controls */}
      <View style={[s.bottomBar, { paddingBottom: insets.bottom + 16 }]}>
        {/* Dots */}
        <View style={s.dots}>
          {SLIDES.map((_, i) => {
            const inputRange = [(i - 1) * width, i * width, (i + 1) * width];
            const dotWidth = scrollX.interpolate({
              inputRange,
              outputRange: [8, 24, 8],
              extrapolate: 'clamp',
            });
            const opacity = scrollX.interpolate({
              inputRange,
              outputRange: [0.4, 1, 0.4],
              extrapolate: 'clamp',
            });
            return (
              <Animated.View
                key={i}
                style={[s.dot, { width: dotWidth, opacity }]}
              />
            );
          })}
        </View>

        {/* Next / Get Started button */}
        <TouchableOpacity style={s.nextBtn} onPress={handleNext} activeOpacity={0.85}>
          <Text style={s.nextBtnText}>
            {activeIndex === SLIDES.length - 1 ? 'Get Started' : 'Next'}
          </Text>
          <Ionicons
            name={activeIndex === SLIDES.length - 1 ? 'checkmark' : 'arrow-forward'}
            size={18}
            color={Colors.primary}
          />
        </TouchableOpacity>

        {/* Terms */}
        <Text style={s.terms}>
          By joining you agree to our{' '}
          <Text style={s.termsLink}>Terms of Service</Text>
          {' '}and{' '}
          <Text style={s.termsLink}>Privacy Policy</Text>
        </Text>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.primary },

  slide: {
    width,
    flex: 1,
    minHeight: height,
  },

  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  slideNumber: {
    fontSize: FontSize.xxl,
    fontWeight: '900',
    color: 'rgba(255,255,255,0.5)',
    letterSpacing: -0.5,
  },
  skipText: {
    fontSize: FontSize.base,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.8)',
  },

  illustrationArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  iconRing: {
    width: 200,
    height: 200,
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconInner: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  decCircle1: {
    position: 'absolute',
    width: 280,
    height: 280,
    borderRadius: 140,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  decCircle2: {
    position: 'absolute',
    width: 340,
    height: 340,
    borderRadius: 170,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },

  textBlock: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: 120,
  },
  slideTitle: {
    fontSize: FontSize.xxxl,
    fontWeight: '800',
    color: '#fff',
    lineHeight: 44,
    marginBottom: Spacing.md,
  },
  slideSubtitle: {
    fontSize: FontSize.base,
    color: 'rgba(255,255,255,0.8)',
    lineHeight: 24,
  },

  /* Bottom bar */
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xl,
    alignItems: 'center',
    gap: Spacing.md,
  },
  dots: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
    marginBottom: 4,
  },
  dot: {
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
  },
  nextBtn: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.primaryBg,
    borderWidth: 2,
    borderColor: Colors.primary,
    borderRadius: Radius.full,
    paddingVertical: 14,
  },
  nextBtnText: {
    fontSize: FontSize.base,
    fontWeight: '700',
    color: Colors.primary,
  },
  terms: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: 18,
  },
  termsLink: {
    color: Colors.primary,
    fontWeight: '600',
  },
});
