import React, { useCallback, useEffect, useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  RefreshControl, ActivityIndicator, TextInput, Alert, Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Spacing, FontSize, Radius, Shadow } from '@/constants/theme';
import {
  getCategories, getListings, getEvents, getCoupons,
  getBanners, getCities, submitNewsletter,
} from '@/lib/api';
import { Category, Listing, Event, Coupon, Banner } from '@/lib/types';
import ListingCard from '@/components/ListingCard';
import EventCard from '@/components/EventCard';
import CouponCard from '@/components/CouponCard';
import BannerCard from '@/components/BannerCard';
import { useLang } from '@/lib/i18n';
import { useAppConfig } from '@/lib/appConfig';

type City = { id: string; name: string; slug: string; image_url?: string; count?: number };

/* ─── Section header ──────────────────────────────────────────── */
function SectionHeader({ title, onSeeAll }: { title: string; onSeeAll?: () => void }) {
  return (
    <View style={s.sectionHeader}>
      <Text style={s.sectionTitle}>{title}</Text>
      {onSeeAll && (
        <TouchableOpacity onPress={onSeeAll} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Text style={s.seeAll}>See All</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

export default function HomeScreen() {
  const router = useRouter();
  const { t } = useLang();
  const { branding } = useAppConfig();
  const insets = useSafeAreaInsets();

  const [search, setSearch] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [listings, setListings] = useState<Listing[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [subscribing, setSubscribing] = useState(false);

  async function fetchAll() {
    setError('');
    try {
      const [catsR, listR, evtR, cpnR, banR, citR] = await Promise.allSettled([
        getCategories('business'),
        getListings({ limit: 8 }),
        getEvents({ limit: 6 }),
        getCoupons({ limit: 6 }),
        getBanners({ page: 'home', limit: 5 }),
        getCities(8),
      ]);
      if (catsR.status === 'fulfilled') setCategories(catsR.value);
      if (listR.status === 'fulfilled') setListings(listR.value.listings);
      if (evtR.status === 'fulfilled')  setEvents(evtR.value.events);
      if (cpnR.status === 'fulfilled')  setCoupons(cpnR.value.coupons);
      if (banR.status === 'fulfilled')  setBanners(banR.value.banners ?? []);
      if (citR.status === 'fulfilled')  setCities(citR.value.cities ?? []);
      const allFailed = [catsR, listR, evtR, cpnR].every(r => r.status === 'rejected');
      if (allFailed) {
        setError((catsR as PromiseRejectedResult).reason?.message ?? 'Failed to load. Please check your connection.');
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
      await submitNewsletter(newsletterEmail.trim());
      setSubscribed(true);
    } catch {
      Alert.alert('Error', 'Failed to subscribe. Please try again.');
    } finally {
      setSubscribing(false);
    }
  }

  return (
    <ScrollView
      style={s.container}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
    >
      {/* ── Top Header ─────────────────────────────────────────── */}
      <LinearGradient
        colors={[Colors.primary, Colors.primaryDark]}
        style={[s.header, { paddingTop: insets.top + 12 }]}
      >
        {/* Logo row */}
        <View style={s.headerTop}>
          {branding.logoLight
            ? <Image source={{ uri: branding.logoLight }} style={s.logo} resizeMode="contain" />
            : <Image source={require('../../assets/images/logo-light.png')} style={s.logo} resizeMode="contain" />
          }
          <TouchableOpacity style={s.notifBtn} onPress={() => router.push('/(tabs)/explore')}>
            <Ionicons name="search" size={20} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Location & tagline */}
        <View style={s.locationRow}>
          <Ionicons name="location-sharp" size={14} color="rgba(255,255,255,0.85)" />
          <Text style={s.locationText}>Greater Toronto Area</Text>
        </View>
        <Text style={s.heroTitle}>Discover Local{'\n'}Businesses & Events</Text>

        {/* Search bar */}
        <TouchableOpacity
          style={s.searchBar}
          onPress={() => router.push('/(tabs)/explore')}
          activeOpacity={0.85}
        >
          <Ionicons name="search" size={18} color={Colors.textMuted} />
          <Text style={s.searchPlaceholder}>Search businesses, events…</Text>
          <View style={s.searchFilter}>
            <Ionicons name="options-outline" size={16} color={Colors.primary} />
          </View>
        </TouchableOpacity>
      </LinearGradient>

      {/* ── Loading / Error ─────────────────────────────────────── */}
      {loading && (
        <View style={s.loader}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      )}

      {!loading && !!error && (
        <View style={s.errorBox}>
          <Ionicons name="cloud-offline-outline" size={40} color={Colors.textMuted} />
          <Text style={s.errorText}>{error}</Text>
          <TouchableOpacity style={s.retryBtn} onPress={() => { setLoading(true); fetchAll(); }}>
            <Text style={s.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* ── Banners ──────────────────────────────────────────────── */}
      {!loading && banners.length > 0 && (
        <View style={s.bannerWrap}>
          <BannerCard banners={banners} />
        </View>
      )}

      {!loading && !error && (
        <>
          {/* ── Categories ──────────────────────────────────────── */}
          {categories.length > 0 && (
            <View style={s.section}>
              <SectionHeader
                title={t('home.browseCategories')}
                onSeeAll={() => router.push('/(tabs)/explore')}
              />
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={s.catScroll}
              >
                {categories.map(cat => (
                  <TouchableOpacity
                    key={cat.id}
                    style={s.catItem}
                    onPress={() => router.push({ pathname: '/(tabs)/explore', params: { category: cat.slug } })}
                    activeOpacity={0.75}
                  >
                    <View style={s.catIconWrap}>
                      <Text style={s.catIcon}>{cat.icon}</Text>
                    </View>
                    <Text style={s.catName} numberOfLines={1}>{cat.name}</Text>
                  </TouchableOpacity>
                ))}
                <TouchableOpacity
                  style={s.catItem}
                  onPress={() => router.push('/(tabs)/explore')}
                  activeOpacity={0.75}
                >
                  <View style={[s.catIconWrap, s.catIconMore]}>
                    <Ionicons name="grid-outline" size={22} color={Colors.primary} />
                  </View>
                  <Text style={[s.catName, { color: Colors.primary }]}>More</Text>
                </TouchableOpacity>
              </ScrollView>
            </View>
          )}

          {/* ── Featured Businesses ─────────────────────────────── */}
          {listings.length > 0 && (
            <View style={s.section}>
              <SectionHeader
                title={t('home.featuredBusinesses')}
                onSeeAll={() => router.push('/(tabs)/explore')}
              />
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 4 }}
              >
                {listings.slice(0, 6).map(listing => (
                  <ListingCard
                    key={listing.id}
                    listing={listing}
                    compact
                    onPress={() => router.push(`/business/${listing.slug}`)}
                  />
                ))}
              </ScrollView>
            </View>
          )}

          {/* ── All Businesses (horizontal list rows) ───────────── */}
          {listings.length > 0 && (
            <View style={s.section}>
              <SectionHeader
                title="Popular Near You"
                onSeeAll={() => router.push('/(tabs)/explore')}
              />
              {listings.slice(0, 4).map(listing => (
                <ListingCard
                  key={listing.id}
                  listing={listing}
                  horizontal
                  onPress={() => router.push(`/business/${listing.slug}`)}
                />
              ))}
            </View>
          )}

          {/* ── Browse by City ──────────────────────────────────── */}
          {cities.length > 0 && (
            <View style={s.section}>
              <SectionHeader
                title={t('home.browseCity')}
                onSeeAll={() => router.push('/(tabs)/explore')}
              />
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={s.cityScroll}
              >
                {cities.map(city => (
                  <TouchableOpacity
                    key={city.id}
                    style={s.cityCard}
                    onPress={() => router.push({ pathname: '/(tabs)/explore', params: { city: city.name } })}
                    activeOpacity={0.8}
                  >
                    {city.image_url ? (
                      <Image source={{ uri: city.image_url }} style={s.cityImg} resizeMode="cover" />
                    ) : (
                      <LinearGradient colors={[Colors.primary, Colors.primaryLight]} style={s.cityImg}>
                        <Text style={s.cityInitial}>{city.name.charAt(0)}</Text>
                      </LinearGradient>
                    )}
                    <View style={s.cityInfo}>
                      <Text style={s.cityName} numberOfLines={1}>{city.name}</Text>
                      {(city.count ?? 0) > 0 && (
                        <Text style={s.cityCount}>{city.count} businesses</Text>
                      )}
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

          {/* ── Upcoming Events ──────────────────────────────────── */}
          {events.length > 0 && (
            <View style={s.section}>
              <SectionHeader
                title={t('home.upcomingEvents')}
                onSeeAll={() => router.push('/(tabs)/events')}
              />
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 4 }}
              >
                {events.map(event => (
                  <EventCard
                    key={event.id}
                    event={event}
                    compact
                    onPress={() => router.push(`/event/${event.slug}`)}
                  />
                ))}
              </ScrollView>
            </View>
          )}

          {/* ── Hot Deals & Coupons ──────────────────────────────── */}
          {coupons.length > 0 && (
            <View style={s.section}>
              <SectionHeader
                title={t('home.hotDeals')}
                onSeeAll={() => router.push('/(tabs)/coupons')}
              />
              {coupons.slice(0, 3).map(coupon => (
                <CouponCard key={coupon.id} coupon={coupon} />
              ))}
            </View>
          )}

          {/* ── Newsletter ───────────────────────────────────────── */}
          <View style={s.section}>
            <LinearGradient colors={[Colors.primary, Colors.primaryLight]} style={s.newsletter}>
              <View style={s.nlIconWrap}>
                <Ionicons name="mail" size={24} color="#fff" />
              </View>
              <Text style={s.nlTitle}>{t('home.newsletter')}</Text>
              <Text style={s.nlSub}>{t('home.newsletterSubtitle')}</Text>
              {subscribed ? (
                <View style={s.subscribedRow}>
                  <Ionicons name="checkmark-circle" size={20} color="#fff" />
                  <Text style={s.subscribedText}>{t('home.subscribed')}</Text>
                </View>
              ) : (
                <View style={s.nlRow}>
                  <TextInput
                    style={s.nlInput}
                    placeholder={t('home.emailPlaceholder')}
                    placeholderTextColor="rgba(255,255,255,0.6)"
                    value={newsletterEmail}
                    onChangeText={setNewsletterEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                  <TouchableOpacity
                    style={s.subscribeBtn}
                    onPress={handleSubscribe}
                    disabled={subscribing}
                    activeOpacity={0.85}
                  >
                    {subscribing
                      ? <ActivityIndicator color={Colors.primary} size="small" />
                      : <Text style={s.subscribeBtnText}>{t('home.subscribe')}</Text>
                    }
                  </TouchableOpacity>
                </View>
              )}
            </LinearGradient>
          </View>
        </>
      )}

      <View style={{ height: Spacing.xxl }} />
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.surfaceSecondary },

  /* ── Header ── */
  header: { paddingHorizontal: Spacing.lg, paddingBottom: 28 },
  headerTop: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: Spacing.md,
  },
  logo: { width: 160, height: 40 },
  notifBtn: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center', alignItems: 'center',
  },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 6 },
  locationText: { color: 'rgba(255,255,255,0.85)', fontSize: FontSize.sm, fontWeight: '500' },
  heroTitle: {
    color: '#fff', fontSize: FontSize.xxl, fontWeight: '800',
    lineHeight: 36, marginBottom: Spacing.lg,
  },
  searchBar: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
    backgroundColor: '#fff', borderRadius: Radius.xl,
    paddingHorizontal: Spacing.md, paddingVertical: 12,
    ...Shadow.sm,
  },
  searchPlaceholder: { flex: 1, fontSize: FontSize.base, color: Colors.textMuted },
  searchFilter: {
    width: 32, height: 32, borderRadius: Radius.md,
    backgroundColor: Colors.primaryBg,
    justifyContent: 'center', alignItems: 'center',
  },

  /* ── Banners ── */
  bannerWrap: { marginTop: Spacing.md },

  /* ── Loader / Error ── */
  loader: { paddingVertical: 56, alignItems: 'center' },
  errorBox: { alignItems: 'center', padding: Spacing.xl, gap: Spacing.md },
  errorText: { fontSize: FontSize.base, color: Colors.textSecondary, textAlign: 'center' },
  retryBtn: {
    backgroundColor: Colors.primary, borderRadius: Radius.full,
    paddingHorizontal: Spacing.xl, paddingVertical: 10,
  },
  retryText: { color: '#fff', fontWeight: '700', fontSize: FontSize.base },

  /* ── Sections ── */
  section: { paddingHorizontal: Spacing.md, paddingTop: Spacing.lg + 4 },
  sectionHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: Spacing.md,
  },
  sectionTitle: { fontSize: FontSize.lg, fontWeight: '800', color: Colors.text },
  seeAll: { fontSize: FontSize.sm, color: Colors.primary, fontWeight: '700' },

  /* ── Categories ── */
  catScroll: { gap: Spacing.md, paddingBottom: 4 },
  catItem: { alignItems: 'center', width: 68 },
  catIconWrap: {
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: Colors.surface,
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 6,
    ...Shadow.sm,
  },
  catIconMore: { backgroundColor: Colors.primaryBg },
  catIcon: { fontSize: 26 },
  catName: {
    fontSize: FontSize.xs, fontWeight: '600', color: Colors.text,
    textAlign: 'center',
  },

  /* ── Cities ── */
  cityScroll: { gap: Spacing.sm, paddingBottom: 4 },
  cityCard: {
    width: 120, borderRadius: Radius.xl,
    backgroundColor: Colors.surface, overflow: 'hidden', ...Shadow.sm,
  },
  cityImg: { width: 120, height: 80, alignItems: 'center', justifyContent: 'center' },
  cityInitial: { fontSize: 32, fontWeight: '800', color: '#fff' },
  cityInfo: { padding: Spacing.sm },
  cityName: { fontSize: FontSize.sm, fontWeight: '700', color: Colors.text },
  cityCount: { fontSize: FontSize.xs, color: Colors.textMuted, marginTop: 2 },

  /* ── Newsletter ── */
  newsletter: { borderRadius: Radius.xl, padding: Spacing.lg, gap: Spacing.sm, marginBottom: Spacing.sm },
  nlIconWrap: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 4,
  },
  nlTitle: { color: '#fff', fontSize: FontSize.lg, fontWeight: '800' },
  nlSub: { color: 'rgba(255,255,255,0.85)', fontSize: FontSize.sm, marginBottom: 4 },
  nlRow: { flexDirection: 'row', gap: Spacing.sm },
  nlInput: {
    flex: 1, backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: Radius.md, paddingHorizontal: Spacing.md, paddingVertical: 10,
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
