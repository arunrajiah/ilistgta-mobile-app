import React, { useEffect, useRef, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  Linking, Dimensions, Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Spacing, FontSize, Radius } from '@/constants/theme';
import { Banner } from '../lib/types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface Props {
  banners: Banner[];
}

export default function BannerCard({ banners }: Props) {
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!banners || banners.length <= 1) return;

    intervalRef.current = setInterval(() => {
      setActiveIndex(prev => {
        const next = (prev + 1) % banners.length;
        flatListRef.current?.scrollToIndex({ index: next, animated: true });
        return next;
      });
    }, 5000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [banners]);

  if (!banners || banners.length === 0) return null;

  function handleCTA(url?: string) {
    if (!url) return;
    Linking.openURL(url).catch(() => {});
  }

  function onViewableItemsChanged({ viewableItems }: any) {
    if (viewableItems.length > 0) {
      setActiveIndex(viewableItems[0].index ?? 0);
    }
  }

  const viewabilityConfig = { viewAreaCoveragePercentThreshold: 50 };
  const viewabilityConfigCallbackPairs = useRef([
    { viewabilityConfig, onViewableItemsChanged },
  ]);

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={banners}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={item => item.id}
        viewabilityConfigCallbackPairs={viewabilityConfigCallbackPairs.current}
        renderItem={({ item }) => (
          <View style={styles.bannerItem}>
            {item.image_url ? (
              <Image source={{ uri: item.image_url }} style={styles.bannerImage} resizeMode="cover" />
            ) : (
              <LinearGradient
                colors={[Colors.primary, Colors.primaryLight]}
                style={styles.bannerImage}
              />
            )}
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.72)']}
              style={styles.overlay}
            >
              <Text style={styles.title} numberOfLines={2}>{item.title}</Text>
              {item.subtitle ? (
                <Text style={styles.subtitle} numberOfLines={2}>{item.subtitle}</Text>
              ) : null}
              {item.cta_text && item.cta_link ? (
                <TouchableOpacity
                  style={styles.ctaButton}
                  onPress={() => handleCTA(item.cta_link)}
                  activeOpacity={0.85}
                >
                  <Text style={styles.ctaText}>{item.cta_text}</Text>
                </TouchableOpacity>
              ) : null}
            </LinearGradient>
          </View>
        )}
      />
      {banners.length > 1 && (
        <View style={styles.dots}>
          {banners.map((_, i) => (
            <View key={i} style={[styles.dot, i === activeIndex && styles.dotActive]} />
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: Spacing.md,
  },
  bannerItem: {
    width: SCREEN_WIDTH,
    height: 160,
    position: 'relative',
  },
  bannerImage: {
    width: SCREEN_WIDTH,
    height: 160,
  },
  overlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.md,
    paddingTop: Spacing.xl,
  },
  title: {
    color: '#fff',
    fontSize: FontSize.lg,
    fontWeight: '800',
    marginBottom: 4,
  },
  subtitle: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: FontSize.sm,
    marginBottom: Spacing.sm,
  },
  ctaButton: {
    alignSelf: 'flex-start',
    borderWidth: 1.5,
    borderColor: '#fff',
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: 5,
    marginTop: 4,
  },
  ctaText: {
    color: '#fff',
    fontSize: FontSize.sm,
    fontWeight: '700',
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.border,
  },
  dotActive: {
    backgroundColor: Colors.primary,
    width: 18,
  },
});
