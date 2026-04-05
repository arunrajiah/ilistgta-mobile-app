import React, { useCallback, useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  ActivityIndicator, Alert, RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import type { Href } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/lib/auth';
import { getMyListings, deleteListing } from '@/lib/api';
import { Listing } from '@/lib/types';
import { Colors, FontSize, Radius, Shadow, Spacing } from '@/constants/theme';

const STATUS_COLORS: Record<string, string> = {
  approved: '#22c55e',
  pending: '#f59e0b',
  rejected: '#ef4444',
};

const STATUS_LABELS: Record<string, string> = {
  approved: 'Live',
  pending: 'Under Review',
  rejected: 'Rejected',
};

export default function MyListingsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { session } = useAuth();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!session?.access_token) return;
    try {
      const data = await getMyListings(session.access_token);
      setListings(data.listings);
    } catch (e: any) {
      Alert.alert('Error', e.message ?? 'Failed to load listings');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [session]);

  useEffect(() => { load(); }, [load]);

  const onRefresh = () => { setRefreshing(true); load(); };

  async function handleDelete(listing: Listing) {
    Alert.alert(
      'Delete Listing',
      `Are you sure you want to delete "${listing.name}"? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setDeletingId(listing.id);
            try {
              await deleteListing(session!.access_token, listing.id);
              setListings(prev => prev.filter(l => l.id !== listing.id));
            } catch (e: any) {
              Alert.alert('Error', e.message ?? 'Failed to delete listing');
            } finally {
              setDeletingId(null);
            }
          },
        },
      ],
    );
  }

  function renderItem({ item }: { item: Listing }) {
    const status = item.status ?? 'pending';
    const statusColor = STATUS_COLORS[status] ?? Colors.textMuted;
    const statusLabel = STATUS_LABELS[status] ?? status;
    const isDeleting = deletingId === item.id;

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={{ flex: 1 }}>
            <Text style={styles.cardName} numberOfLines={1}>{item.name}</Text>
            <Text style={styles.cardCity}>{item.city}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusColor + '20' }]}>
            <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
            <Text style={[styles.statusText, { color: statusColor }]}>{statusLabel}</Text>
          </View>
        </View>

        {item.short_description ? (
          <Text style={styles.cardDesc} numberOfLines={2}>{item.short_description}</Text>
        ) : null}

        <View style={styles.cardMeta}>
          {item.review_count > 0 && (() => {
            const rating = Number(item.avg_rating ?? 0);
            const displayRating = isNaN(rating) ? '—' : rating.toFixed(1);
            return (
              <View style={styles.cardMetaItem}>
                <Ionicons name="star" size={13} color={Colors.star} />
                <Text style={styles.cardMetaText}>{displayRating} ({item.review_count})</Text>
              </View>
            );
          })()}
          {item.categories && (
            <View style={styles.cardMetaItem}>
              <Text style={styles.cardMetaText}>{item.categories.icon} {item.categories.name}</Text>
            </View>
          )}
        </View>

        <View style={styles.cardActions}>
          {status === 'approved' && (
            <TouchableOpacity
              style={[styles.actionBtn, styles.viewBtn]}
              onPress={() => router.push(`/business/${item.slug}` as Href)}
            >
              <Ionicons name="eye-outline" size={16} color={Colors.primary} />
              <Text style={[styles.actionBtnText, { color: Colors.primary }]}>View</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={[styles.actionBtn, styles.editBtn]}
            onPress={() => router.push(`/listing/${item.id}/edit` as Href)}
          >
            <Ionicons name="pencil-outline" size={16} color={Colors.primary} />
            <Text style={[styles.actionBtnText, { color: Colors.primary }]}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionBtn, styles.deleteBtn]}
            onPress={() => handleDelete(item)}
            disabled={isDeleting}
          >
            {isDeleting
              ? <ActivityIndicator size="small" color={Colors.error} />
              : <>
                  <Ionicons name="trash-outline" size={16} color={Colors.error} />
                  <Text style={[styles.actionBtnText, { color: Colors.error }]}>Delete</Text>
                </>
            }
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Listings</Text>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => router.push('/listing/new' as Href)}
        >
          <Ionicons name="add" size={24} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : (
        <FlatList
          data={listings}
          keyExtractor={i => i.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="business-outline" size={56} color={Colors.border} />
              <Text style={styles.emptyTitle}>No listings yet</Text>
              <Text style={styles.emptyText}>Add your first business to iListGTA</Text>
              <TouchableOpacity style={styles.emptyBtn} onPress={() => router.push('/listing/new' as Href)}>
                <Text style={styles.emptyBtnText}>Add a Listing</Text>
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
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: Spacing.md, paddingBottom: Spacing.sm,
    backgroundColor: Colors.surface, borderBottomWidth: 1, borderBottomColor: Colors.border,
    ...Shadow.sm,
  },
  backBtn: { width: 36, height: 36, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: FontSize.md, fontWeight: '700', color: Colors.text },
  addBtn: { width: 36, height: 36, justifyContent: 'center', alignItems: 'center' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  list: { padding: Spacing.md, gap: Spacing.sm },

  card: {
    backgroundColor: Colors.surface, borderRadius: Radius.lg,
    padding: Spacing.md, ...Shadow.sm,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 6, gap: Spacing.sm },
  cardName: { fontSize: FontSize.base, fontWeight: '700', color: Colors.text },
  cardCity: { fontSize: FontSize.xs, color: Colors.textMuted, marginTop: 2 },
  statusBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: Radius.full,
  },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusText: { fontSize: FontSize.xs, fontWeight: '700' },
  cardDesc: { fontSize: FontSize.sm, color: Colors.textSecondary, lineHeight: 19, marginBottom: 8 },
  cardMeta: { flexDirection: 'row', gap: Spacing.md, marginBottom: Spacing.sm },
  cardMetaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  cardMetaText: { fontSize: FontSize.xs, color: Colors.textMuted },

  cardActions: {
    flexDirection: 'row', gap: Spacing.sm,
    borderTopWidth: 1, borderTopColor: Colors.borderLight, paddingTop: Spacing.sm,
  },
  actionBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 4, paddingVertical: 8, borderRadius: Radius.md, borderWidth: 1,
  },
  viewBtn: { borderColor: Colors.primary, backgroundColor: Colors.primaryBg },
  editBtn: { borderColor: Colors.primary, backgroundColor: Colors.primaryBg },
  deleteBtn: { borderColor: '#fecaca', backgroundColor: '#fef2f2' },
  actionBtnText: { fontSize: FontSize.sm, fontWeight: '600' },

  empty: { alignItems: 'center', paddingTop: 80, gap: Spacing.sm },
  emptyTitle: { fontSize: FontSize.lg, fontWeight: '700', color: Colors.textSecondary },
  emptyText: { fontSize: FontSize.base, color: Colors.textMuted, textAlign: 'center' },
  emptyBtn: {
    marginTop: Spacing.sm, backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.xl, paddingVertical: 12, borderRadius: Radius.full,
  },
  emptyBtnText: { color: '#fff', fontWeight: '700', fontSize: FontSize.base },
});
