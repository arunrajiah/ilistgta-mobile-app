import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  ActivityIndicator, RefreshControl, ScrollView,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getCategories, getListings } from '@/lib/api';
import { Category, Listing } from '@/lib/types';
import { Colors, FontSize, Radius, Shadow, Spacing } from '@/constants/theme';
import SearchBar from '@/components/SearchBar';
import ListingCard from '@/components/ListingCard';

const PAGE_SIZE = 12;

const GTA_CITIES = ['All Cities', 'Toronto', 'Mississauga', 'Brampton', 'Markham', 'Vaughan', 'Richmond Hill', 'Oakville', 'Burlington', 'Ajax', 'Pickering'];

export default function ExploreScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ q?: string; category?: string }>();

  const [search, setSearch] = useState(params.q ?? '');
  const [activeCategory, setActiveCategory] = useState(params.category ?? '');
  const [city, setCity] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [listings, setListings] = useState<Listing[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    getCategories('business').then(setCategories).catch(console.error);
  }, []);

  async function fetchListings(pg = 1, reset = false) {
    try {
      if (reset) setLoading(true); else if (pg > 1) setLoadingMore(true);
      const data = await getListings({ query: search, category: activeCategory, city, page: pg, limit: PAGE_SIZE });
      setListings(prev => reset ? data.listings : [...prev, ...data.listings]);
      setTotalPages(data.pagination.pages);
      setPage(pg);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setLoadingMore(false);
      setRefreshing(false);
    }
  }

  useEffect(() => { fetchListings(1, true); }, [search, activeCategory, city]);

  const onRefresh = useCallback(() => { setRefreshing(true); fetchListings(1, true); }, [search, activeCategory, city]);

  function loadMore() {
    if (!loadingMore && page < totalPages) fetchListings(page + 1);
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Explore</Text>
        <SearchBar value={search} onChangeText={setSearch} onSubmit={() => fetchListings(1, true)} />
      </View>

      {/* Category filter chips */}
      <FlatList
        horizontal
        data={[{ id: '', name: 'All', slug: '', icon: '🏙️', type: 'business' as const }, ...categories]}
        keyExtractor={c => c.id || 'all'}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterList}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.filterChip, activeCategory === item.slug && styles.filterChipActive]}
            onPress={() => setActiveCategory(item.slug)}
            activeOpacity={0.75}
          >
            <Text style={[styles.filterChipText, activeCategory === item.slug && styles.filterChipTextActive]}>
              {item.icon} {item.name}
            </Text>
          </TouchableOpacity>
        )}
      />

      {/* City filter chips */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.cityRow} contentContainerStyle={{ paddingHorizontal: Spacing.md, gap: 8 }}>
        {GTA_CITIES.map(c => {
          const val = c === 'All Cities' ? '' : c;
          const active = city === val;
          return (
            <TouchableOpacity
              key={c}
              style={[styles.cityChip, active && styles.cityChipActive]}
              onPress={() => { setCity(val); setPage(1); }}
            >
              <Text style={[styles.cityChipText, active && styles.cityChipTextActive]}>{c}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Listings */}
      {loading ? (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : (
        <FlatList
          data={listings}
          keyExtractor={l => l.id}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
          onEndReached={loadMore}
          onEndReachedThreshold={0.4}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyIcon}>🔍</Text>
              <Text style={styles.emptyTitle}>No businesses found</Text>
              <Text style={styles.emptyText}>Try a different search or category</Text>
            </View>
          }
          ListFooterComponent={loadingMore ? <ActivityIndicator style={{ padding: 16 }} color={Colors.primary} /> : null}
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

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.surfaceSecondary },
  header: { backgroundColor: Colors.surface, padding: Spacing.md, gap: Spacing.sm, ...Shadow.sm },
  headerTitle: { fontSize: FontSize.xl, fontWeight: '800', color: Colors.text },
  filterList: { paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, gap: Spacing.sm },
  filterChip: {
    paddingHorizontal: Spacing.md, paddingVertical: 6,
    backgroundColor: Colors.surface, borderRadius: Radius.full,
    borderWidth: 1, borderColor: Colors.border,
  },
  filterChipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  filterChipText: { fontSize: FontSize.sm, color: Colors.text, fontWeight: '600' },
  filterChipTextActive: { color: '#fff' },
  cityRow: { paddingVertical: Spacing.sm },
  cityChip: {
    paddingHorizontal: 14, paddingVertical: 6, borderRadius: Radius.full,
    borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.surface,
  },
  cityChipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  cityChipText: { fontSize: FontSize.xs, color: Colors.textSecondary, fontWeight: '600' },
  cityChipTextActive: { color: '#fff' },
  listContent: { padding: Spacing.md },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  empty: { alignItems: 'center', paddingTop: 60 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyTitle: { fontSize: FontSize.lg, fontWeight: '700', color: Colors.text, marginBottom: 6 },
  emptyText: { fontSize: FontSize.base, color: Colors.textMuted },
});
