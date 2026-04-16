import React, { useCallback, useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  ActivityIndicator, RefreshControl, ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getCategories, getEvents } from '@/lib/api';
import { Category, Event } from '@/lib/types';
import { Colors, FontSize, Radius, Spacing, Shadow } from '@/constants/theme';
import EventCard from '@/components/EventCard';
import { useLang } from '@/lib/i18n';

const PAGE_SIZE = 12;
const GTA_CITIES = ['All Cities', 'Toronto', 'Mississauga', 'Brampton', 'Markham', 'Vaughan', 'Richmond Hill', 'Oakville', 'Burlington', 'Ajax', 'Pickering'];

export default function EventsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t } = useLang();
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeCategory, setActiveCategory] = useState('');
  const [activeCity, setActiveCity] = useState('All Cities');
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
      const city = activeCity !== 'All Cities' ? activeCity : undefined;
      const data = await getEvents({ category: activeCategory, city, page: pg, limit: PAGE_SIZE });
      setEvents(prev => reset ? data.events : [...prev, ...data.events]);
      setTotalPages(data.pagination.pages);
      setPage(pg);
    } catch (e: any) {
      if (reset) setError(e.message ?? 'Failed to load events. Please try again.');
    } finally {
      setLoading(false);
      setLoadingMore(false);
      setRefreshing(false);
    }
  }

  useEffect(() => { fetchEvents(1, true); }, [activeCategory, activeCity]);

  const onRefresh = useCallback(() => { setRefreshing(true); fetchEvents(1, true); }, [activeCategory]);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t('events.title')}</Text>
        <Text style={styles.headerSub}>{t('events.subtitle')}</Text>
      </View>

      {/* Category filter */}
      <FlatList
        horizontal
        data={[{ id: '', name: t('events.allEvents'), slug: '', icon: '🎉', type: 'event' as const }, ...categories]}
        keyExtractor={c => c.id || 'all'}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterList}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.chip, activeCategory === item.slug && styles.chipActive]}
            onPress={() => setActiveCategory(item.slug)}
            activeOpacity={0.75}
          >
            <Text style={[styles.chipText, activeCategory === item.slug && styles.chipTextActive]}>
              {item.icon} {item.name}
            </Text>
          </TouchableOpacity>
        )}
      />

      {/* City filter */}
      <FlatList
        horizontal
        data={GTA_CITIES}
        keyExtractor={c => c}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterList}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.chip, activeCity === item && styles.chipActive]}
            onPress={() => setActiveCity(item)}
            activeOpacity={0.75}
          >
            <Text style={[styles.chipText, activeCity === item && styles.chipTextActive]}>{item}</Text>
          </TouchableOpacity>
        )}
      />

      {loading ? (
        <View style={styles.loader}><ActivityIndicator size="large" color={Colors.primary} /></View>
      ) : error ? (
        <View style={styles.loader}>
          <Text style={{ color: Colors.textMuted, fontSize: FontSize.base, textAlign: 'center', marginBottom: 16 }}>{error}</Text>
          <TouchableOpacity onPress={() => fetchEvents(1, true)} style={{ backgroundColor: Colors.primary, paddingHorizontal: 24, paddingVertical: 10, borderRadius: Radius.full }}>
            <Text style={{ color: '#fff', fontWeight: '700' }}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={events}
          keyExtractor={e => e.id}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
          onEndReached={() => { if (!loadingMore && page < totalPages) fetchEvents(page + 1); }}
          onEndReachedThreshold={0.4}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyIcon}>📅</Text>
              <Text style={styles.emptyTitle}>No upcoming events</Text>
              <Text style={styles.emptyText}>Check back soon!</Text>
            </View>
          }
          ListFooterComponent={loadingMore ? <ActivityIndicator style={{ padding: 16 }} color={Colors.primary} /> : null}
          renderItem={({ item }) => (
            <EventCard event={item} onPress={() => router.push(`/event/${item.slug}`)} />
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.surfaceSecondary },
  header: { backgroundColor: Colors.surface, padding: Spacing.md, ...Shadow.sm },
  headerTitle: { fontSize: FontSize.xl, fontWeight: '800', color: Colors.text },
  headerSub: { fontSize: FontSize.sm, color: Colors.textMuted, marginTop: 2 },
  filterList: { paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, gap: Spacing.sm },
  chip: {
    paddingHorizontal: Spacing.md, paddingVertical: 6,
    backgroundColor: Colors.surface, borderRadius: Radius.full,
    borderWidth: 1, borderColor: Colors.border,
  },
  chipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  chipText: { fontSize: FontSize.sm, color: Colors.text, fontWeight: '600' },
  chipTextActive: { color: '#fff' },
  listContent: { padding: Spacing.md },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  empty: { alignItems: 'center', paddingTop: 60 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyTitle: { fontSize: FontSize.lg, fontWeight: '700', color: Colors.text, marginBottom: 6 },
  emptyText: { fontSize: FontSize.base, color: Colors.textMuted },
});
