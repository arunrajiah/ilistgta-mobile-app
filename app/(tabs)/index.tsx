import React, { useCallback, useEffect, useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  FlatList, RefreshControl, ActivityIndicator, TextInput, Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize, Radius, Shadow } from '@/constants/theme';
import { getCategories, getListings, getEvents, getCoupons, getBanners } from '@/lib/api';
import { Category, Listing, Event, Coupon, Banner } from '@/lib/types';
import ListingCard from '@/components/ListingCard';
import EventCard from '@/components/EventCard';
import CouponCard from '@/components/CouponCard';
import SearchBar from '@/components/SearchBar';
import BannerCard from '@/components/BannerCard';

export default function HomeScreen() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [listings, setListings] = useState<Listing[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [subscribing, setSubscribing] = useState(false);

  async function fetchAll() {
    setError('');
    try {
      // Use allSettled so one failing endpoint doesn't block the rest
      const [catsResult, listResult, eventResult, couponResult, bannerResult] = await Promise.allSettled([
        getCategories('business'),
        getListings({ limit: 8 }),
        getEvents({ limit: 6 }),
        getCoupons({ limit: 6 }),
        getBanners({ page: 'home', limit: 5 }),
      ]);

      if (catsResult.status === 'fulfilled')   setCategories(catsResult.value);
      if (listResult.status === 'fulfilled')   setListings(listResult.value.listings);
      if (eventResult.status === 'fulfilled')  setEvents(eventResult.value.events);
      if (couponResult.status === 'fulfilled') setCoupons(couponResult.value.coupons);
      if (bannerResult.status === 'fulfilled') setBanners(bannerResult.value.banners ?? []);

      // Only show error if ALL content requests failed
      const allFailed = [catsResult, listResult, eventResult, couponResult].every(r => r.status === 'rejected');
      if (allFailed) {
        const firstErr = (catsResult as PromiseRejectedResult).reason;
        setError(firstErr?.message ?? 'Failed to load. Please check your connection and try again.');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => { fetchAll(); }, []);

  const onRefresh = useCallback(() => { setRefreshing(true); fetchAll(); }, []);

  function handleSearch() {
    if (search.trim()) router.push({ pathname: '/(tabs)/explore', params: { q: search.trim() } });
  }

  async function handleSubscribe() {
    if (!newsletterEmail.trim() || !newsletterEmail.includes('@')) {
      Alert.alert('Invalid Email', 'Please enter a valid email address.');
      return;
    }
    setSubscribing(true);
    try {
      const BASE_URL = (process.env.EXPO_PUBLIC_API_BASE_URL ?? '').replace(/\/$/, '');
      await fetch(`${BASE_URL}/api/newsletter`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: newsletterEmail.trim() }),
      });
      setSubscribed(true);
    } catch {
      Alert.alert('Error', 'Failed to subscribe. Please try again.');
    } finally {
      setSubscribing(false);
    }
  }

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
    >
      {/* Hero */}
      <LinearGradient colors={[Colors.primary, Colors.primaryDark]} style={styles.hero}>
        <Text style={styles.heroEyebrow}>Greater Toronto Area</Text>
        <Text style={styles.heroTitle}>Discover Local{'\n'}Businesses & Events</Text>
        <View style={styles.heroSearch}>
          <SearchBar value={search} onChangeText={setSearch} onSubmit={handleSearch} />
        </View>
      </LinearGradient>

      {/* Loading indicator (inline, below hero so hero is always visible) */}
      {loading && (
        <View style={styles.inlineLoader}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      )}

      {/* Connection error (inline, retryable) */}
      {!loading && error ? (
        <View style={styles.inlineError}>
          <Text style={styles.inlineErrorText}>{error}</Text>
          <TouchableOpacity
            onPress={() => { setLoading(true); fetchAll(); }}
            style={styles.retryBtn}
          >
            <Text style={styles.retryBtnText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : null}

      {/* Banners */}
      {!loading && banners.length > 0 && <BannerCard banners={banners} />}

      {/* Categories */}
      {!loading && (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Browse by Category</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
          {categories.map(cat => (
            <TouchableOpacity
              key={cat.id}
              style={styles.categoryChip}
              onPress={() => router.push({ pathname: '/(tabs)/explore', params: { category: cat.slug } })}
              activeOpacity={0.75}
            >
              <Text style={styles.categoryIcon}>{cat.icon}</Text>
              <Text style={styles.categoryName}>{cat.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Featured Listings */}
      {listings.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Featured Businesses</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/explore')}>
              <Text style={styles.seeAll}>See all →</Text>
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {listings.map(listing => (
              <ListingCard
                key={listing.id}
                listing={listing}
                horizontal
                onPress={() => router.push(`/business/${listing.slug}`)}
              />
            ))}
          </ScrollView>
        </View>
      )}

      {/* Upcoming Events */}
      {events.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Upcoming Events</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/events')}>
              <Text style={styles.seeAll}>See all →</Text>
            </TouchableOpacity>
          </View>
          {events.slice(0, 3).map(event => (
            <EventCard
              key={event.id}
              event={event}
              onPress={() => router.push(`/event/${event.slug}`)}
            />
          ))}
        </View>
      )}

      {/* Latest Deals */}
      {coupons.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Latest Deals</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/coupons')}>
              <Text style={styles.seeAll}>See all →</Text>
            </TouchableOpacity>
          </View>
          {coupons.slice(0, 3).map(coupon => (
            <CouponCard key={coupon.id} coupon={coupon} />
          ))}
        </View>
      )}

      {/* Newsletter */}
      <View style={styles.section}>
        <LinearGradient colors={[Colors.primary, Colors.primaryLight]} style={styles.newsletter}>
          <Text style={styles.newsletterTitle}>Stay in the Loop</Text>
          <Text style={styles.newsletterSub}>Get the latest GTA business news & deals</Text>
          {subscribed ? (
            <View style={styles.subscribedRow}>
              <Ionicons name="checkmark-circle" size={20} color="#fff" />
              <Text style={styles.subscribedText}>You're subscribed!</Text>
            </View>
          ) : (
            <View style={styles.newsletterRow}>
              <TextInput
                style={styles.newsletterInput}
                placeholder="Your email address"
                placeholderTextColor="rgba(255,255,255,0.65)"
                value={newsletterEmail}
                onChangeText={setNewsletterEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              <TouchableOpacity
                style={styles.subscribeBtn}
                onPress={handleSubscribe}
                disabled={subscribing}
                activeOpacity={0.85}
              >
                {subscribing
                  ? <ActivityIndicator color={Colors.primary} size="small" />
                  : <Text style={styles.subscribeBtnText}>Subscribe</Text>
                }
              </TouchableOpacity>
            </View>
          )}
        </LinearGradient>
      </View>
      )}

      <View style={{ height: Spacing.xxl }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.surfaceSecondary },
  inlineLoader: { paddingVertical: 48, alignItems: 'center', justifyContent: 'center' },
  inlineError: { margin: Spacing.md, padding: Spacing.lg, backgroundColor: '#fef2f2', borderRadius: Radius.lg, alignItems: 'center', gap: Spacing.sm },
  inlineErrorText: { color: '#b91c1c', fontSize: FontSize.sm, textAlign: 'center', lineHeight: 20 },
  retryBtn: { backgroundColor: Colors.primary, paddingHorizontal: Spacing.lg, paddingVertical: 8, borderRadius: Radius.full },
  retryBtnText: { color: '#fff', fontWeight: '700', fontSize: FontSize.sm },
  hero: { paddingTop: 64, paddingBottom: 36, paddingHorizontal: Spacing.lg },
  heroEyebrow: { color: 'rgba(255,255,255,0.75)', fontSize: FontSize.sm, fontWeight: '600', marginBottom: 6 },
  heroTitle: { color: '#fff', fontSize: FontSize.xxl, fontWeight: '800', lineHeight: 36, marginBottom: Spacing.lg },
  heroSearch: { marginTop: 4 },
  section: { paddingHorizontal: Spacing.md, paddingTop: Spacing.lg },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.sm },
  sectionTitle: { fontSize: FontSize.lg, fontWeight: '800', color: Colors.text },
  seeAll: { fontSize: FontSize.sm, color: Colors.primary, fontWeight: '600' },
  categoryScroll: { marginVertical: Spacing.sm },
  categoryChip: {
    alignItems: 'center', marginRight: Spacing.sm,
    backgroundColor: Colors.surface, borderRadius: Radius.lg,
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm,
    ...Shadow.sm, minWidth: 80,
  },
  categoryIcon: { fontSize: 24, marginBottom: 4 },
  categoryName: { fontSize: FontSize.xs, fontWeight: '600', color: Colors.text, textAlign: 'center' },
  newsletter: {
    borderRadius: Radius.lg, padding: Spacing.lg, gap: Spacing.sm, marginBottom: Spacing.sm,
  },
  newsletterTitle: { color: '#fff', fontSize: FontSize.lg, fontWeight: '800' },
  newsletterSub: { color: 'rgba(255,255,255,0.85)', fontSize: FontSize.sm, marginBottom: Spacing.sm },
  newsletterRow: { flexDirection: 'row', gap: Spacing.sm },
  newsletterInput: {
    flex: 1, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: Radius.md,
    paddingHorizontal: Spacing.md, paddingVertical: 10,
    color: '#fff', fontSize: FontSize.sm,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.4)',
  },
  subscribeBtn: {
    backgroundColor: '#fff', borderRadius: Radius.md,
    paddingHorizontal: Spacing.md, justifyContent: 'center', alignItems: 'center',
  },
  subscribeBtnText: { color: Colors.primary, fontWeight: '700', fontSize: FontSize.sm },
  subscribedRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  subscribedText: { color: '#fff', fontWeight: '600', fontSize: FontSize.base },
});
