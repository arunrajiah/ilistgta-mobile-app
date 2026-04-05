import React, { useCallback, useEffect, useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  FlatList, RefreshControl, ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize, Radius, Shadow } from '@/constants/theme';
import { getCategories, getListings, getEvents, getCoupons } from '@/lib/api';
import { Category, Listing, Event, Coupon } from '@/lib/types';
import ListingCard from '@/components/ListingCard';
import EventCard from '@/components/EventCard';
import CouponCard from '@/components/CouponCard';
import SearchBar from '@/components/SearchBar';

export default function HomeScreen() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [listings, setListings] = useState<Listing[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  async function fetchAll() {
    try {
      const [cats, listData, eventData, couponData] = await Promise.all([
        getCategories('business'),
        getListings({ limit: 8 }),
        getEvents({ limit: 6 }),
        getCoupons({ limit: 6 }),
      ]);
      setCategories(cats);
      setListings(listData.listings);
      setEvents(eventData.events);
      setCoupons(couponData.coupons);
    } catch (e) {
      console.error('Home fetch error:', e);
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

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
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

      {/* Categories */}
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

      <View style={{ height: Spacing.xxl }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.surfaceSecondary },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.surfaceSecondary },
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
});
