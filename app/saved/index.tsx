import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  ActivityIndicator, Alert, RefreshControl, Image, TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/lib/auth';
import { getMySaved, unsaveListing, getPrimaryImage } from '@/lib/api';
import { Listing } from '@/lib/types';
import { Colors, FontSize, Radius, Shadow, Spacing } from '@/constants/theme';

type SavedItem = { id: string; created_at: string; business_listings: Listing };

export default function SavedScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { session } = useAuth();
  const [saved, setSaved] = useState<SavedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [sortBy, setSortBy] = useState<'recent' | 'name' | 'rating'>('recent');

  const displayed = useMemo(() => {
    let list = saved.filter(s =>
      s.business_listings?.name?.toLowerCase().includes(query.toLowerCase())
    );
    if (sortBy === 'name') list = [...list].sort((a, b) =>
      (a.business_listings?.name ?? '').localeCompare(b.business_listings?.name ?? '')
    );
    if (sortBy === 'rating') list = [...list].sort((a, b) =>
      (Number(b.business_listings?.avg_rating) || 0) - (Number(a.business_listings?.avg_rating) || 0)
    );
    return list;
  }, [saved, query, sortBy]);

  const load = useCallback(async () => {
    if (!session?.access_token) return;
    try {
      const data = await getMySaved(session.access_token);
      setSaved(data.saved as SavedItem[]);
    } catch (e: any) {
      Alert.alert('Error', e.message ?? 'Failed to load saved businesses');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [session]);

  useEffect(() => { load(); }, [load]);

  const onRefresh = () => { setRefreshing(true); load(); };

  async function handleRemove(item: SavedItem) {
    if (!session?.access_token) return;
    setRemovingId(item.id);
    try {
      await unsaveListing(session.access_token, item.id);
      setSaved(prev => prev.filter(s => s.id !== item.id));
    } catch (e: any) {
      Alert.alert('Error', e.message ?? 'Failed to remove');
    } finally {
      setRemovingId(null);
    }
  }

  function renderItem({ item }: { item: SavedItem }) {
    const listing = item.business_listings;
    const imageUrl = getPrimaryImage(listing.listing_images) ?? `https://picsum.photos/seed/${listing.slug}/400/300`;
    const isRemoving = removingId === item.id;

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => router.push(`/business/${listing.slug}`)}
        activeOpacity={0.85}
      >
        <Image source={{ uri: imageUrl }} style={styles.cardImage} />
        <View style={styles.cardBody}>
          <View style={styles.cardTop}>
            <View style={{ flex: 1 }}>
              {listing.categories && (
                <Text style={styles.category}>{listing.categories.icon} {listing.categories.name}</Text>
              )}
              <Text style={styles.cardName} numberOfLines={2}>{listing.name}</Text>
            </View>
            <TouchableOpacity
              style={styles.removeBtn}
              onPress={() => handleRemove(item)}
              disabled={isRemoving}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              {isRemoving
                ? <ActivityIndicator size="small" color={Colors.error} />
                : <Ionicons name="heart" size={22} color={Colors.error} />
              }
            </TouchableOpacity>
          </View>

          <View style={styles.cardMeta}>
            <Ionicons name="location-outline" size={13} color={Colors.textMuted} />
            <Text style={styles.cardMetaText}>{listing.city}</Text>
            {listing.avg_rating > 0 && (
              <>
                <Text style={styles.dot}>·</Text>
                <Ionicons name="star" size={13} color={Colors.star} />
                <Text style={styles.cardMetaText}>{Number(listing.avg_rating).toFixed(1)}</Text>
              </>
            )}
            {listing.is_verified && (
              <>
                <Text style={styles.dot}>·</Text>
                <Ionicons name="checkmark-circle" size={13} color={Colors.primary} />
                <Text style={[styles.cardMetaText, { color: Colors.primary }]}>Verified</Text>
              </>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Saved Businesses</Text>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.searchRow}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search saved businesses..."
          placeholderTextColor={Colors.textMuted}
          value={query}
          onChangeText={setQuery}
        />
      </View>
      <View style={styles.sortRow}>
        {(['recent', 'name', 'rating'] as const).map(s => (
          <TouchableOpacity
            key={s}
            style={[styles.sortBtn, sortBy === s && styles.sortBtnActive]}
            onPress={() => setSortBy(s)}
          >
            <Text style={[styles.sortBtnText, sortBy === s && styles.sortBtnTextActive]}>
              {s === 'recent' ? 'Recent' : s === 'name' ? 'A–Z' : 'Rating'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : (
        <FlatList
          data={displayed}
          keyExtractor={i => i.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="heart-outline" size={56} color={Colors.border} />
              <Text style={styles.emptyTitle}>No saved businesses</Text>
              <Text style={styles.emptyText}>Tap the heart on any business to save it here</Text>
              <TouchableOpacity style={styles.emptyBtn} onPress={() => router.push('/(tabs)/explore')}>
                <Text style={styles.emptyBtnText}>Browse Businesses</Text>
              </TouchableOpacity>
            </View>
          }
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.surfaceSecondary },
  header: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.sm, backgroundColor: Colors.surface,
    borderBottomWidth: 1, borderBottomColor: Colors.border, ...Shadow.sm,
  },
  backBtn: { width: 36, height: 36, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: FontSize.md, fontWeight: '700', color: Colors.text },
  headerSpacer: { width: 36 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  list: { padding: Spacing.md, gap: Spacing.sm },

  card: {
    backgroundColor: Colors.surface, borderRadius: Radius.lg,
    overflow: 'hidden', ...Shadow.sm, flexDirection: 'row',
  },
  cardImage: { width: 110, height: 110, resizeMode: 'cover', backgroundColor: Colors.border },
  cardBody: { flex: 1, padding: Spacing.md, justifyContent: 'space-between' },
  cardTop: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  category: { fontSize: FontSize.xs, color: Colors.primary, fontWeight: '600', marginBottom: 2 },
  cardName: { fontSize: FontSize.base, fontWeight: '700', color: Colors.text, lineHeight: 20 },
  removeBtn: { padding: 4 },
  cardMeta: { flexDirection: 'row', alignItems: 'center', gap: 4, flexWrap: 'wrap' },
  cardMetaText: { fontSize: FontSize.xs, color: Colors.textMuted },
  dot: { fontSize: FontSize.xs, color: Colors.textMuted },

  searchRow: { paddingHorizontal: Spacing.md, paddingTop: Spacing.sm, backgroundColor: Colors.surface },
  searchInput: {
    backgroundColor: Colors.surfaceSecondary, borderWidth: 1, borderColor: Colors.border,
    borderRadius: Radius.full, paddingHorizontal: Spacing.md, paddingVertical: 8,
    fontSize: FontSize.sm, color: Colors.text,
  },
  sortRow: {
    flexDirection: 'row', gap: Spacing.sm, paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm, backgroundColor: Colors.surface,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  sortBtn: {
    paddingHorizontal: 14, paddingVertical: 6, borderRadius: Radius.full,
    borderWidth: 1, borderColor: Colors.border,
  },
  sortBtnActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  sortBtnText: { fontSize: FontSize.xs, color: Colors.textSecondary, fontWeight: '600' },
  sortBtnTextActive: { color: '#fff' },
  empty: { alignItems: 'center', paddingTop: 80, gap: Spacing.sm },
  emptyTitle: { fontSize: FontSize.lg, fontWeight: '700', color: Colors.textSecondary },
  emptyText: { fontSize: FontSize.base, color: Colors.textMuted, textAlign: 'center', paddingHorizontal: Spacing.xl },
  emptyBtn: {
    marginTop: Spacing.sm, backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.xl, paddingVertical: 12, borderRadius: Radius.full,
  },
  emptyBtnText: { color: '#fff', fontWeight: '700', fontSize: FontSize.base },
});
