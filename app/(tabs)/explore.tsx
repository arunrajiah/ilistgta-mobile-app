import React, { useCallback, useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  ActivityIndicator, RefreshControl, ScrollView, TextInput,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { getCategories, getListings } from '@/lib/api';
import { Category, Listing } from '@/lib/types';
import { Colors, FontSize, Radius, Shadow, Spacing } from '@/constants/theme';
import ListingCard from '@/components/ListingCard';

const PAGE_SIZE = 12;
const GTA_CITIES = [
  'All', 'Toronto', 'Mississauga', 'Brampton', 'Markham',
  'Vaughan', 'Richmond Hill', 'Oakville', 'Burlington', 'Ajax', 'Pickering',
];

export default function ExploreScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ q?: string; category?: string }>();

  const [search, setSearch] = useState(params.q ?? '');
  const [activeCategory, setActiveCategory] = useState(params.category ?? '');
  const [city, setCity] = useState('');
  const [priceFilter, setPriceFilter] = useState(false);
  const [availableFilter, setAvailableFilter] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [listings, setListings] = useState<Listing[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    getCategories('business').then(setCategories).catch(console.error);
  }, []);

  async function fetchListings(pg = 1, reset = false) {
    if (reset) setError('');
    try {
      if (reset) setLoading(true);
      else if (pg > 1) setLoadingMore(true);
      const data = await getListings({
        query: search, category: activeCategory, city, page: pg, limit: PAGE_SIZE,
      });
      setListings(prev => reset ? data.listings : [...prev, ...data.listings]);
      setTotalPages(data.pagination.pages);
      setPage(pg);
    } catch (e: any) {
      if (reset) setError(e.message ?? 'Failed to load listings.');
    } finally {
      setLoading(false);
      setLoadingMore(false);
      setRefreshing(false);
    }
  }

  useEffect(() => { fetchListings(1, true); }, [search, activeCategory, city]);
  const onRefresh = useCallback(() => { setRefreshing(true); fetchListings(1, true); }, [search, activeCategory, city]);

  const hasFilters = !!(search || activeCategory || city || priceFilter || availableFilter);
  const clearFilters = () => { setSearch(''); setActiveCategory(''); setCity(''); setPriceFilter(false); setAvailableFilter(false); };

  return (
    <View style={[s.container, { paddingTop: insets.top }]}>
      {/* ── Header ────────────────────────────────────────────── */}
      <View style={s.header}>
        <Text style={s.headerTitle}>Service Search</Text>
        <View style={s.searchRow}>
          <View style={s.searchBox}>
            <Ionicons name="search" size={18} color={Colors.textMuted} />
            <TextInput
              style={s.searchInput}
              value={search}
              onChangeText={setSearch}
              placeholder="Search businesses…"
              placeholderTextColor={Colors.textMuted}
              returnKeyType="search"
              onSubmitEditing={() => fetchListings(1, true)}
              autoCapitalize="none"
              autoCorrect={false}
            />
            {!!search && (
              <TouchableOpacity onPress={() => setSearch('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Ionicons name="close-circle" size={18} color={Colors.textMuted} />
              </TouchableOpacity>
            )}
          </View>
          {hasFilters && (
            <TouchableOpacity style={s.clearBtn} onPress={clearFilters}>
              <Text style={s.clearBtnText}>Clear</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Filter pills */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.pillRow}>
          <TouchableOpacity style={[s.pill, s.pillOutline]}>
            <Ionicons name="options-outline" size={13} color={Colors.primary} />
            <Text style={s.pillOutlineText}>Filters</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[s.pill, priceFilter && s.pillActive]} onPress={() => setPriceFilter(v => !v)}>
            <Text style={[s.pillText, priceFilter && s.pillTextActive]}>Price Range</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[s.pill, availableFilter && s.pillActive]} onPress={() => setAvailableFilter(v => !v)}>
            <Text style={[s.pillText, availableFilter && s.pillTextActive]}>Booking Available</Text>
          </TouchableOpacity>
        </ScrollView>

        {/* Result count */}
        {!loading && (
          <Text style={s.resultCount}>
            {listings.length > 0
              ? `Found ${listings.length}${page < totalPages ? '+' : ''} services near you`
              : 'No services found'}
          </Text>
        )}
      </View>

      {/* ── Category chips ───────────────────────────────────── */}
      <View style={s.filterSection}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={s.filterList}
        >
          {[{ id: '_all', name: 'All', slug: '', icon: '🏙️' }, ...categories].map(cat => {
            const active = activeCategory === cat.slug;
            return (
              <TouchableOpacity
                key={cat.id}
                style={[s.filterChip, active && s.filterChipActive]}
                onPress={() => setActiveCategory(cat.slug)}
                activeOpacity={0.75}
              >
                <Text style={[s.filterChipText, active && s.filterChipTextActive]}>
                  {cat.icon} {cat.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* City chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={s.cityList}
        >
          {GTA_CITIES.map(c => {
            const val = c === 'All' ? '' : c;
            const active = city === val;
            return (
              <TouchableOpacity
                key={c}
                style={[s.cityChip, active && s.cityChipActive]}
                onPress={() => setCity(val)}
                activeOpacity={0.75}
              >
                {active && <Ionicons name="location-sharp" size={12} color="#fff" />}
                <Text style={[s.cityChipText, active && s.cityChipTextActive]}>{c}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* ── Listings ─────────────────────────────────────────── */}
      {loading ? (
        <View style={s.loader}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={s.loadingText}>Finding businesses…</Text>
        </View>
      ) : error ? (
        <View style={s.errorBox}>
          <Ionicons name="cloud-offline-outline" size={44} color={Colors.textMuted} />
          <Text style={s.errorText}>{error}</Text>
          <TouchableOpacity style={s.retryBtn} onPress={() => fetchListings(1, true)}>
            <Text style={s.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={listings}
          keyExtractor={l => l.id}
          contentContainerStyle={s.listContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
          onEndReached={() => { if (!loadingMore && page < totalPages) fetchListings(page + 1); }}
          onEndReachedThreshold={0.4}
          ListEmptyComponent={
            <View style={s.empty}>
              <Ionicons name="search" size={56} color={Colors.border} />
              <Text style={s.emptyTitle}>No businesses found</Text>
              <Text style={s.emptyText}>Try adjusting your search or filters</Text>
              {hasFilters && (
                <TouchableOpacity style={s.retryBtn} onPress={clearFilters}>
                  <Text style={s.retryText}>Clear Filters</Text>
                </TouchableOpacity>
              )}
            </View>
          }
          ListFooterComponent={
            loadingMore
              ? <ActivityIndicator style={{ paddingVertical: 20 }} color={Colors.primary} />
              : null
          }
          renderItem={({ item }) => (
            <ListingCard
              listing={item}
              onPress={() => router.push(`/business/${item.slug}`)}
            />
          )}
        />
      )}
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.surfaceSecondary },

  /* ── Header ── */
  header: {
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
    ...Shadow.sm,
  },
  headerTitle: { fontSize: FontSize.xl, fontWeight: '800', color: Colors.text, marginBottom: Spacing.sm },
  searchRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  searchBox: {
    flex: 1, flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
    backgroundColor: Colors.surfaceSecondary,
    borderRadius: Radius.xl, paddingHorizontal: Spacing.md, paddingVertical: 10,
    borderWidth: 1, borderColor: Colors.border,
  },
  searchInput: { flex: 1, fontSize: FontSize.base, color: Colors.text, padding: 0 },
  clearBtn: {
    backgroundColor: Colors.primaryBg, borderRadius: Radius.full,
    paddingHorizontal: 14, paddingVertical: 8,
    borderWidth: 1, borderColor: Colors.primary,
  },
  clearBtnText: { color: Colors.primary, fontWeight: '700', fontSize: FontSize.xs },
  pillRow: { gap: Spacing.sm, paddingTop: Spacing.sm, paddingBottom: 4 },
  pill: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 14, paddingVertical: 7,
    backgroundColor: Colors.surfaceSecondary,
    borderRadius: Radius.full, borderWidth: 1, borderColor: Colors.border,
  },
  pillOutline: { borderColor: Colors.primary, backgroundColor: Colors.primaryBg },
  pillActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  pillText: { fontSize: FontSize.sm, color: Colors.textSecondary, fontWeight: '600' },
  pillTextActive: { color: '#fff' },
  pillOutlineText: { fontSize: FontSize.sm, color: Colors.primary, fontWeight: '700' },
  resultCount: { fontSize: FontSize.xs, color: Colors.textMuted, marginTop: 6 },

  /* ── Filters ── */
  filterSection: {
    backgroundColor: Colors.surface,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
    paddingBottom: Spacing.sm,
  },
  filterList: { paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, gap: Spacing.sm },
  filterChip: {
    paddingHorizontal: 14, paddingVertical: 7,
    backgroundColor: Colors.surfaceSecondary,
    borderRadius: Radius.full, borderWidth: 1, borderColor: Colors.border,
  },
  filterChipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  filterChipText: { fontSize: FontSize.sm, color: Colors.text, fontWeight: '600' },
  filterChipTextActive: { color: '#fff' },
  cityList: { paddingHorizontal: Spacing.md, paddingVertical: 4, gap: 8 },
  cityChip: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 14, paddingVertical: 6,
    backgroundColor: Colors.surfaceSecondary,
    borderRadius: Radius.full, borderWidth: 1, borderColor: Colors.border,
  },
  cityChipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  cityChipText: { fontSize: FontSize.xs, color: Colors.textSecondary, fontWeight: '600' },
  cityChipTextActive: { color: '#fff' },

  /* ── List ── */
  listContent: { padding: Spacing.md, paddingBottom: Spacing.xxl },

  /* ── States ── */
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: Spacing.md },
  loadingText: { color: Colors.textMuted, fontSize: FontSize.sm },
  errorBox: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: Spacing.xl, gap: Spacing.md },
  errorText: { color: Colors.textSecondary, fontSize: FontSize.base, textAlign: 'center' },
  retryBtn: {
    backgroundColor: Colors.primary, borderRadius: Radius.full,
    paddingHorizontal: Spacing.xl, paddingVertical: 10,
  },
  retryText: { color: '#fff', fontWeight: '700', fontSize: FontSize.base },
  empty: { alignItems: 'center', paddingTop: 60, gap: Spacing.sm },
  emptyTitle: { fontSize: FontSize.lg, fontWeight: '700', color: Colors.text, marginTop: Spacing.md },
  emptyText: { fontSize: FontSize.base, color: Colors.textMuted, marginBottom: Spacing.md },
});
