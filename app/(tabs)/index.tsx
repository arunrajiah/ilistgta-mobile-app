import React, { useCallback, useEffect, useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  RefreshControl, ActivityIndicator, TextInput, Alert, Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize, Radius, Shadow } from '@/constants/theme';
import { getCategories, getListings, getEvents, getCoupons, getBanners, getCities, submitNewsletter } from '@/lib/api';
import { Category, Listing, Event, Coupon, Banner } from '@/lib/types';
import ListingCard from '@/components/ListingCard';
import EventCard from '@/components/EventCard';
import CouponCard from '@/components/CouponCard';
import SearchBar from '@/components/SearchBar';
import BannerCard from '@/components/BannerCard';
import { useLang } from '@/lib/i18n';
import { useAppConfig } from '@/lib/appConfig';

type City = { id: string; name: string; slug: string; image_url?: string; count?: number };

export default function HomeScreen() {
  const router = useRouter();
  const { t } = useLang();
  const { branding } = useAppConfig();
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
      const [catsResult, listResult, eventResult, couponResult, bannerResult, citiesResult] = await Promise.allSettled([
        getCategories('business'),
        getListings({ limit: 8 }),
        getEvents({ limit: 6 }),
        getCoupons({ limit: 6 }),
        getBanners({ page: 'home', limit: 5 }),
        getCities(8),
      ]);

      if (catsResult.status === 'fulfilled')   setCategories(catsResult.value);
      if (listResult.status === 'fulfilled')   setListings(listResult.value.listings);
      if (eventResult.status === 'fulfilled')  setEvents(eventResult.value.events);
      if (couponResult.status === 'fulfilled') setCoupons(couponResult.value.coupons);
      if (bannerResult.status === 'fulfilled') setBanners(bannerResult.value.banners ?? []);
      if (citiesResult.status === 'fulfilled') setCities(citiesResult.value.cities ?? []);

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
      style={styles.container}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
    >
      {/* Hero */}
      <LinearGradient colors={[Colors.primary, Colors.primaryDark]} style={styles.hero}>
        {branding.logoLight
          ? <Image source={{ uri: branding.logoLight }} style={styles.logoImg} resizeMode="contain" />
          : <Image source={require('../../assets/images/logo-light.png')} style={styles.logoImg} resizeMode="contain" />
        }
        <Text style={styles.heroEyebrow}>Greater Toronto Area</Text>
        <Text style={styles.heroTitle}>Discover Local{'\n'}Businesses & Events</Text>
        <View style={styles.heroSearch}>
          <SearchBar value={search} onChangeText={setSearch} onSubmit={handleSearch} />
        </View>
      </LinearGradient>

      {loading && (
        <View style={styles.inlineLoader}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      )}

      {!loading && error ? (
        <View style={styles.inlineError}>
          <Text style={styles.inlineErrorText}>{error}</Text>
          <TouchableOpacity onPress={() => { setLoading(true); fetchAll(); }} style={styles.retryBtn}>
            <Text style={styles.retryBtnText}>{t('home.retry')}</Text>
          </TouchableOpacity>
        </View>
      ) : null}

      {/* Banners */}
      {!loading && banners.length > 0 && <BannerCard banners={banners} />}

      {!loading && (
        <>
          {/* Categories */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('home.browseCategories')}</Text>
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
              <TouchableOpacity
                style={[styles.categoryChip, styles.categoryChipMore]}
                onPress={() => router.push('/(tabs)/explore')}
                activeOpacity={0.75}
              >
                <Text style={[styles.categoryIcon, { color: Colors.primary }]}>→</Text>
                <Text style={[styles.categoryName, { color: Colors.primary, fontWeight: '700' }]}>{t('home.more')}</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>

          {/* Featured Businesses */}
          {listings.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>{t('home.featuredBusinesses')}</Text>
                <TouchableOpacity onPress={() => router.push('/(tabs)/explore')}>
                  <Text style={styles.seeAll}>{t('home.seeAll')} →</Text>
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

          {/* Browse by City */}
          {cities.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>{t('home.browseCity')}</Text>
                <TouchableOpacity onPress={() => router.push({ pathname: '/(tabs)/explore' })}>
                  <Text style={styles.seeAll}>{t('home.seeAll')} →</Text>
                </TouchableOpacity>
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.cityScroll}>
                {cities.map(city => (
                  <TouchableOpacity
                    key={city.id}
                    style={styles.cityCard}
                    onPress={() => router.push({ pathname: '/(tabs)/explore', params: { city: city.name } })}
                    activeOpacity={0.8}
                  >
                    {city.image_url ? (
                      <Image source={{ uri: city.image_url }} style={styles.cityImage} resizeMode="cover" />
                    ) : (
                      <LinearGradient colors={[Colors.primary, Colors.primaryLight]} style={styles.cityImage}>
                        <Text style={styles.cityInitial}>{city.name.charAt(0)}</Text>
                      </LinearGradient>
                    )}
                    <View style={styles.cityInfo}>
                      <Text style={styles.cityName} numberOfLines={1}>{city.name}</Text>
                      {city.count != null && city.count > 0 && (
                        <Text style={styles.cityCount}>{city.count} {t('home.businesses')}</Text>
                      )}
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

          {/* Upcoming Events */}
          {events.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>{t('home.upcomingEvents')}</Text>
                <TouchableOpacity onPress={() => router.push('/(tabs)/events')}>
                  <Text style={styles.seeAll}>{t('home.seeAll')} →</Text>
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

          {/* Hot Deals & Coupons */}
          {coupons.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>{t('home.hotDeals')}</Text>
                <TouchableOpacity onPress={() => router.push('/(tabs)/coupons')}>
                  <Text style={styles.seeAll}>{t('home.seeAll')} →</Text>
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
              <Text style={styles.newsletterTitle}>{t('home.newsletter')}</Text>
              <Text style={styles.newsletterSub}>{t('home.newsletterSubtitle')}</Text>
              {subscribed ? (
                <View style={styles.subscribedRow}>
                  <Ionicons name="checkmark-circle" size={20} color="#fff" />
                  <Text style={styles.subscribedText}>{t('home.subscribed')}</Text>
                </View>
              ) : (
                <View style={styles.newsletterRow}>
                  <TextInput
                    style={styles.newsletterInput}
                    placeholder={t('home.emailPlaceholder')}
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
                      : <Text style={styles.subscribeBtnText}>{t('home.subscribe')}</Text>
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

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.surfaceSecondary },
  inlineLoader: { paddingVertical: 48, alignItems: 'center', justifyContent: 'center' },
  inlineError: { margin: Spacing.md, padding: Spacing.lg, backgroundColor: '#fef2f2', borderRadius: Radius.lg, alignItems: 'center', gap: Spacing.sm },
  inlineErrorText: { color: '#b91c1c', fontSize: FontSize.sm, textAlign: 'center', lineHeight: 20 },
  retryBtn: { backgroundColor: Colors.primary, paddingHorizontal: Spacing.lg, paddingVertical: 8, borderRadius: Radius.full },
  retryBtnText: { color: '#fff', fontWeight: '700', fontSize: FontSize.sm },
  hero: { paddingTop: 56, paddingBottom: 36, paddingHorizontal: Spacing.lg },
  logoImg: { width: 180, height: 45, marginBottom: Spacing.md },
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
  categoryChipMore: {
    borderWidth: 1.5,
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryBg,
  },
  categoryIcon: { fontSize: 24, marginBottom: 4 },
  categoryName: { fontSize: FontSize.xs, fontWeight: '600', color: Colors.text, textAlign: 'center' },
  // Cities
  cityScroll: { marginTop: Spacing.sm },
  cityCard: {
    width: 120, marginRight: Spacing.sm, borderRadius: Radius.lg,
    backgroundColor: Colors.surface, overflow: 'hidden', ...Shadow.sm,
  },
  cityImage: {
    width: 120, height: 80,
    alignItems: 'center', justifyContent: 'center',
  },
  cityInitial: { fontSize: 32, fontWeight: '800', color: '#fff' },
  cityInfo: { padding: Spacing.sm },
  cityName: { fontSize: FontSize.sm, fontWeight: '700', color: Colors.text },
  cityCount: { fontSize: FontSize.xs, color: Colors.textMuted, marginTop: 2 },
  newsletter: { borderRadius: Radius.lg, padding: Spacing.lg, gap: Spacing.sm, marginBottom: Spacing.sm },
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
