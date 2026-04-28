import React, { useCallback, useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  ActivityIndicator, RefreshControl, ScrollView, TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { getCategories, getEvents } from '@/lib/api';
import { Category, Event } from '@/lib/types';
import { Colors, FontSize, Radius, Spacing, Shadow } from '@/constants/theme';
import EventCard from '@/components/EventCard';
import { useLang } from '@/lib/i18n';

const PAGE_SIZE = 12;
const DEFAULT_CATEGORIES = [
  { id: '_music', name: 'Music', slug: 'music', icon: '🎵' },
  { id: '_workshops', name: 'Workshops', slug: 'workshops', icon: '🛠️' },
  { id: '_food', name: 'Food', slug: 'food', icon: '🍽️' },
  { id: '_networking', name: 'Networking', slug: 'networking', icon: '🤝' },
  { id: '_sports', name: 'Sports', slug: 'sports', icon: '⚽' },
  { id: '_arts', name: 'Arts', slug: 'arts', icon: '🎨' },
];
const GTA_CITIES = [
  'All', 'Toronto', 'Mississauga', 'Brampton', 'Markham',
  'Vaughan', 'Richmond Hill', 'Oakville', 'Burlington', 'Ajax', 'Pickering',
];

export default function EventsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t } = useLang();
  const [search, setSearch] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeCategory, setActiveCategory] = useState('');
  const [activeCity, setActiveCity] = useState('');
  const [events, setEvents] = useState<Event[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    getCategories('event').then(setCategories).catch(console.error);
  }, []);

  async function fetchEvents(pg = 1, reset = false) {
    if (reset) setError('');
    try {
      if (reset) setLoading(true); else if (pg > 1) setLoadingMore(true);
      const data = await getEvents({
        query: search,
        category: activeCategory,
        city: activeCity || undefined,
        page: pg,
        limit: PAGE_SIZE,
      });
      setEvents(prev => reset ? data.events : [...prev, ...data.events]);
      setTotalPages(data.pagination.pages);
      setPage(pg);
    } catch (e: any) {
      if (reset) setError(e.message ?? 'Failed to load events.');
    } finally {
      setLoading(false);
      setLoadingMore(false);
      setRefreshing(false);
    }
  }

  useEffect(() => { fetchEvents(1, true); }, [search, activeCategory, activeCity]);
  const onRefresh = useCallback(() => { setRefreshing(true); fetchEvents(1, true); }, [search, activeCategory, activeCity]);

  return (
    <View style={[s.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={s.header}>
        <Text style={s.headerTitle}>Explore Events</Text>
        {/* Search */}
        <View style={s.searchBox}>
          <Ionicons name="search" size={18} color={Colors.textMuted} />
          <TextInput
            style={s.searchInput}
            value={search}
            onChangeText={setSearch}
            placeholder="Search for events..."
            placeholderTextColor={Colors.textMuted}
            returnKeyType="search"
            autoCapitalize="none"
          />
          {!!search && (
            <TouchableOpacity onPress={() => setSearch('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Ionicons name="close-circle" size={18} color={Colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Category filter */}
      <View style={s.filterWrap}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={s.filterList}
        >
          {[{ id: '_all', name: 'All', slug: '', icon: '🎉' }, ...(categories.length > 0 ? categories : DEFAULT_CATEGORIES)].map(cat => {
            const active = activeCategory === cat.slug;
            return (
              <TouchableOpacity
                key={cat.id}
                style={[s.chip, active && s.chipActive]}
                onPress={() => setActiveCategory(cat.slug)}
                activeOpacity={0.75}
              >
                <Text style={[s.chipText, active && s.chipTextActive]}>
                  {cat.icon} {cat.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* City filter */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={s.cityList}
        >
          {GTA_CITIES.map(c => {
            const val = c === 'All' ? '' : c;
            const active = activeCity === val;
            return (
              <TouchableOpacity
                key={c}
                style={[s.cityChip, active && s.cityChipActive]}
                onPress={() => setActiveCity(val)}
                activeOpacity={0.75}
              >
                {active && <Ionicons name="location-sharp" size={11} color="#fff" />}
                <Text style={[s.cityChipText, active && s.cityChipTextActive]}>{c}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Events list */}
      {loading ? (
        <View style={s.loader}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={s.loadingText}>Loading events…</Text>
        </View>
      ) : error ? (
        <View style={s.errorBox}>
          <Ionicons name="cloud-offline-outline" size={44} color={Colors.textMuted} />
          <Text style={s.errorText}>{error}</Text>
          <TouchableOpacity style={s.retryBtn} onPress={() => fetchEvents(1, true)}>
            <Text style={s.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={events}
          keyExtractor={e => e.id}
          contentContainerStyle={s.listContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
          onEndReached={() => { if (!loadingMore && page < totalPages) fetchEvents(page + 1); }}
          onEndReachedThreshold={0.4}
          ListEmptyComponent={
            <View style={s.empty}>
              <Ionicons name="calendar" size={56} color={Colors.border} />
              <Text style={s.emptyTitle}>No upcoming events</Text>
              <Text style={s.emptyText}>Check back soon for new events!</Text>
              {(activeCategory || activeCity) && (
                <TouchableOpacity style={s.retryBtn} onPress={() => { setActiveCategory(''); setActiveCity(''); }}>
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
            <EventCard event={item} onPress={() => router.push(`/event/${item.slug}`)} />
          )}
        />
      )}
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.surfaceSecondary },
  header: {
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.md, paddingTop: Spacing.md, paddingBottom: Spacing.sm,
    ...Shadow.sm,
    gap: Spacing.sm,
  },
  headerTitle: { fontSize: FontSize.xl, fontWeight: '800', color: Colors.text },
  searchBox: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
    backgroundColor: Colors.surfaceSecondary,
    borderRadius: Radius.xl, paddingHorizontal: Spacing.md, paddingVertical: 10,
    borderWidth: 1, borderColor: Colors.border,
  },
  searchInput: { flex: 1, fontSize: FontSize.base, color: Colors.text, padding: 0 },
  filterWrap: {
    backgroundColor: Colors.surface,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
    paddingBottom: Spacing.sm,
  },
  filterList: { paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, gap: Spacing.sm },
  chip: {
    paddingHorizontal: 14, paddingVertical: 7,
    backgroundColor: Colors.surfaceSecondary,
    borderRadius: Radius.full, borderWidth: 1, borderColor: Colors.border,
  },
  chipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  chipText: { fontSize: FontSize.sm, color: Colors.text, fontWeight: '600' },
  chipTextActive: { color: '#fff' },
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
  listContent: { padding: Spacing.md, paddingBottom: Spacing.xxl },
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
