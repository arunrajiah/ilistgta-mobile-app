import React, { useCallback, useEffect, useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  RefreshControl, ActivityIndicator, Image, Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Spacing, FontSize, Radius, Shadow } from '@/constants/theme';
import {
  getCategories, getListings, getEvents, getCoupons,
  getBanners, getCities,
} from '@/lib/api';
import { Category, Listing, Event, Coupon, Banner } from '@/lib/types';
import ListingCard from '@/components/ListingCard';
import EventCard from '@/components/EventCard';
import CouponCard from '@/components/CouponCard';
import BannerCard from '@/components/BannerCard';
import { useLang } from '@/lib/i18n';
import { useAppConfig } from '@/lib/appConfig';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

type City = { id: string; name: string; slug: string; image_url?: string; count?: number };

function SectionHeader({ title, onSeeAll }: { title: string; onSeeAll?: () => void }) {
  return (
    <View style={s.sectionHeader}>
      <Text style={s.sectionTitle}>{title}</Text>
      {onSeeAll && (
        <TouchableOpacity onPress={onSeeAll} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Text style={s.seeAll}>View All</Text>
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

  const [categories, setCategories] = useState<Category[]>([]);
  const [listings, setListings] = useState<Listing[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

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
      if (allFailed) setError((catsR as PromiseRejectedResult).reason?.message ?? 'Failed to load.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => { fetchAll(); }, []);
  const onRefresh = useCallback(() => { setRefreshing(true); fetchAll(); }, []);

  return (
    <ScrollView
      style={s.container}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
    >
      {/* ── Header ────────────────────────────────────────────────── */}
      <View style={[s.header, { paddingTop: insets.top + 8 }]}>
        {/* Top row: logo left, notification right */}
        <View style={s.headerTop}>
          {branding.logoDark
            ? <Image source={{ uri: branding.logoDark }} style={s.logoSmall} resizeMode="contain" />
            : <Image source={require('../../assets/images/logo-dark.png')} style={s.logoSmall} resizeMode="contain" />
          }
          <TouchableOpacity style={s.actionBtn} onPress={() => router.push('/notifications' as any)}>
            <Ionicons name="notifications-outline" size={20} color={Colors.text} />
          </TouchableOpacity>
        </View>

        {/* Location row below logo */}
        <TouchableOpacity style={s.locationRow}>
          <Ionicons name="location-sharp" size={13} color={Colors.primary} />
          <Text style={s.locationText}>Greater Toronto Area</Text>
          <Ionicons name="chevron-down" size={13} color={Colors.textMuted} />
        </TouchableOpacity>

        {/* Search bar */}
        <TouchableOpacity
          style={s.searchBar}
          onPress={() => router.push('/(tabs)/explore')}
          activeOpacity={0.85}
        >
          <Ionicons name="search" size={18} color={Colors.textMuted} />
          <Text style={s.searchPlaceholder}>Search for everything...</Text>
          <View style={s.searchFilter}>
            <Ionicons name="options-outline" size={16} color={Colors.primary} />
          </View>
        </TouchableOpacity>
      </View>

      {/* ── Loading / Error ─────────────────────────────────────────── */}
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

      {!loading && !error && (
        <>
          {/* ── New Deal Banner ─────────────────────────────────────── */}
          {coupons.length > 0 && (
            <TouchableOpacity
              style={s.dealBanner}
              onPress={() => router.push('/(tabs)/coupons')}
              activeOpacity={0.9}
            >
              <LinearGradient
                colors={['#FF6B35', '#FF4500']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={s.dealBannerGradient}
              >
                <View style={s.dealBadge}>
                  <Text style={s.dealBadgeText}>New Deal</Text>
                </View>
                <View style={s.dealContent}>
                  <Text style={s.dealTitle}>Up to 30% off Tech Services</Text>
                  <Text style={s.dealSub}>Valid for premium subscriptions today</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.8)" />
              </LinearGradient>
            </TouchableOpacity>
          )}

          {/* ── Banner carousel ─────────────────────────────────────── */}
          {banners.length > 0 && (
            <View style={s.bannerWrap}>
              <BannerCard banners={banners} />
            </View>
          )}

          {/* ── Categories ──────────────────────────────────────────── */}
          {categories.length > 0 && (
            <View style={s.section}>
              <SectionHeader
                title="Categories"
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

          {/* ── Featured Vendors ────────────────────────────────────── */}
          {listings.length > 0 && (
            <View style={s.section}>
              <SectionHeader
                title="Featured Vendors"
                onSeeAll={() => router.push('/(tabs)/explore')}
              />
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ gap: Spacing.sm, paddingBottom: 4 }}
              >
                {listings.slice(0, 6).map(listing => (
                  <FeaturedVendorCard
                    key={listing.id}
                    listing={listing}
                    onPress={() => router.push(`/business/${listing.slug}`)}
                  />
                ))}
              </ScrollView>
            </View>
          )}

          {/* ── Upcoming Events ──────────────────────────────────────── */}
          {events.length > 0 && (
            <View style={s.section}>
              <SectionHeader
                title={t('home.upcomingEvents')}
                onSeeAll={() => router.push('/(tabs)/events')}
              />
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ gap: Spacing.sm, paddingBottom: 4 }}
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

          {/* ── Exclusive Coupons ────────────────────────────────────── */}
          {coupons.length > 0 && (
            <View style={s.section}>
              <SectionHeader
                title="Exclusive Coupons"
                onSeeAll={() => router.push('/(tabs)/coupons')}
              />
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ gap: Spacing.sm, paddingBottom: 4 }}
              >
                {coupons.slice(0, 4).map(coupon => (
                  <CompactCouponCard key={coupon.id} coupon={coupon} onPress={() => router.push('/(tabs)/coupons')} />
                ))}
              </ScrollView>
            </View>
          )}

          {/* ── Trending Services ────────────────────────────────────── */}
          {listings.length > 0 && (
            <View style={s.section}>
              <SectionHeader
                title="Trending Services"
                onSeeAll={() => router.push('/(tabs)/explore')}
              />
              {listings.slice(0, 3).map(listing => (
                <ListingCard
                  key={listing.id}
                  listing={listing}
                  horizontal
                  onPress={() => router.push(`/business/${listing.slug}`)}
                />
              ))}
            </View>
          )}

          {/* ── Browse by City ───────────────────────────────────────── */}
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
        </>
      )}

      <View style={{ height: Spacing.xxl }} />
    </ScrollView>
  );
}

/* ── Featured Vendor Card ──────────────────────────────────────────── */
function FeaturedVendorCard({ listing, onPress }: { listing: Listing; onPress: () => void }) {
  const primaryImg = listing.listing_images?.find(i => i.is_primary) ?? listing.listing_images?.[0];
  return (
    <TouchableOpacity style={vc.card} onPress={onPress} activeOpacity={0.85}>
      {primaryImg?.url ? (
        <Image source={{ uri: primaryImg.url }} style={vc.img} resizeMode="cover" />
      ) : (
        <LinearGradient colors={[Colors.primary, Colors.primaryLight]} style={vc.img}>
          <Ionicons name="storefront-outline" size={28} color="#fff" />
        </LinearGradient>
      )}
      <View style={vc.info}>
        <Text style={vc.name} numberOfLines={1}>{listing.name}</Text>
        <Text style={vc.meta} numberOfLines={1}>
          {listing.categories?.name ?? 'Business'} • {listing.city ?? 'GTA'}
        </Text>
        {listing.avg_rating > 0 && (
          <View style={vc.ratingRow}>
            <Ionicons name="star" size={11} color={Colors.star} />
            <Text style={vc.rating}>{listing.avg_rating.toFixed(1)}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

/* ── Compact Coupon Card ───────────────────────────────────────────── */
function CompactCouponCard({ coupon, onPress }: { coupon: Coupon; onPress: () => void }) {
  const discount = coupon.discount_type === 'percentage'
    ? `${coupon.discount_value}% OFF`
    : `$${coupon.discount_value} OFF`;
  return (
    <TouchableOpacity style={cc.card} onPress={onPress} activeOpacity={0.85}>
      <LinearGradient colors={[Colors.primary, Colors.primaryLight]} style={cc.badge}>
        <Text style={cc.badgeText}>{discount}</Text>
      </LinearGradient>
      <Text style={cc.name} numberOfLines={2}>{coupon.business_listings?.name ?? coupon.title}</Text>
      <Text style={cc.code} numberOfLines={1}>COPY CODE</Text>
    </TouchableOpacity>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.surfaceSecondary },

  /* Header */
  header: {
    paddingHorizontal: Spacing.md, paddingBottom: Spacing.lg,
    backgroundColor: '#fff',
    borderBottomWidth: 1, borderBottomColor: Colors.borderLight,
  },
  headerTop: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: 6,
  },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: Spacing.md },
  locationText: { color: Colors.text, fontSize: FontSize.sm, fontWeight: '600' },
  actionBtn: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: Colors.surfaceSecondary,
    justifyContent: 'center', alignItems: 'center',
  },
  logoSmall: { width: 90, height: 30 },
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

  /* Deal banner */
  dealBanner: { marginHorizontal: Spacing.md, marginTop: Spacing.md, borderRadius: Radius.xl, overflow: 'hidden', ...Shadow.sm },
  dealBannerGradient: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
    padding: Spacing.md,
  },
  dealBadge: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderRadius: Radius.sm, paddingHorizontal: 8, paddingVertical: 4,
  },
  dealBadgeText: { color: '#fff', fontSize: FontSize.xs, fontWeight: '800' },
  dealContent: { flex: 1 },
  dealTitle: { color: '#fff', fontWeight: '700', fontSize: FontSize.sm },
  dealSub: { color: 'rgba(255,255,255,0.8)', fontSize: FontSize.xs, marginTop: 2 },

  bannerWrap: { marginTop: Spacing.sm },

  /* Loader / Error */
  loader: { paddingVertical: 56, alignItems: 'center' },
  errorBox: { alignItems: 'center', padding: Spacing.xl, gap: Spacing.md },
  errorText: { fontSize: FontSize.base, color: Colors.textSecondary, textAlign: 'center' },
  retryBtn: {
    backgroundColor: Colors.primary, borderRadius: Radius.full,
    paddingHorizontal: Spacing.xl, paddingVertical: 10,
  },
  retryText: { color: '#fff', fontWeight: '700', fontSize: FontSize.base },

  /* Sections */
  section: { paddingHorizontal: Spacing.md, paddingTop: Spacing.lg },
  sectionHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: Spacing.md,
  },
  sectionTitle: { fontSize: FontSize.md, fontWeight: '800', color: Colors.text },
  seeAll: { fontSize: FontSize.sm, color: Colors.primary, fontWeight: '700' },

  /* Categories */
  catScroll: { gap: Spacing.md, paddingBottom: 4 },
  catItem: { alignItems: 'center', width: 68 },
  catIconWrap: {
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: Colors.surface,
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 6, ...Shadow.sm,
  },
  catIconMore: { backgroundColor: Colors.primaryBg },
  catIcon: { fontSize: 26 },
  catName: { fontSize: FontSize.xs, fontWeight: '600', color: Colors.text, textAlign: 'center' },

  /* Cities */
  cityScroll: { gap: Spacing.sm, paddingBottom: 4 },
  cityCard: { width: 120, borderRadius: Radius.xl, backgroundColor: Colors.surface, overflow: 'hidden', ...Shadow.sm },
  cityImg: { width: 120, height: 80, alignItems: 'center', justifyContent: 'center' },
  cityInitial: { fontSize: 32, fontWeight: '800', color: '#fff' },
  cityInfo: { padding: Spacing.sm },
  cityName: { fontSize: FontSize.sm, fontWeight: '700', color: Colors.text },
  cityCount: { fontSize: FontSize.xs, color: Colors.textMuted, marginTop: 2 },
});

const vc = StyleSheet.create({
  card: {
    width: 160,
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    overflow: 'hidden',
    ...Shadow.sm,
  },
  img: {
    width: 160, height: 110,
    justifyContent: 'center', alignItems: 'center',
  },
  info: { padding: Spacing.sm },
  name: { fontSize: FontSize.sm, fontWeight: '700', color: Colors.text },
  meta: { fontSize: FontSize.xs, color: Colors.textMuted, marginTop: 2 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 4 },
  rating: { fontSize: FontSize.xs, fontWeight: '700', color: Colors.text },
});

const cc = StyleSheet.create({
  card: {
    width: 140,
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    overflow: 'hidden',
    padding: Spacing.sm,
    ...Shadow.sm,
  },
  badge: {
    borderRadius: Radius.md,
    paddingVertical: 6,
    paddingHorizontal: Spacing.sm,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  badgeText: {
    color: '#fff',
    fontWeight: '900',
    fontSize: FontSize.sm,
    letterSpacing: -0.3,
  },
  name: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
    lineHeight: 18,
  },
  code: {
    fontSize: FontSize.xs,
    fontWeight: '700',
    color: Colors.primary,
    letterSpacing: 0.5,
  },
});
