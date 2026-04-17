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
import { getMyEvents, deleteVendorEvent } from '@/lib/api';
import { VendorEvent } from '@/lib/types';
import { Colors, FontSize, Radius, Shadow, Spacing } from '@/constants/theme';
import ScreenHeader from '@/components/ScreenHeader';

const STATUS_COLORS: Record<string, string> = {
  approved: '#22c55e', pending: '#f59e0b', rejected: '#ef4444', draft: '#9ca3af',
};
const STATUS_LABELS: Record<string, string> = {
  approved: 'Live', pending: 'Under Review', rejected: 'Rejected', draft: 'Draft',
};

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-CA', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function MyEventsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { session } = useAuth();
  const [events, setEvents] = useState<VendorEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!session?.access_token) {
      setLoading(false);
      setRefreshing(false);
      return;
    }
    try {
      const data = await getMyEvents(session.access_token);
      setEvents(data.events);
    } catch (e: any) {
      Alert.alert('Error', e.message ?? 'Failed to load events');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [session]);

  useEffect(() => { load(); }, [load]);
  const onRefresh = () => { setRefreshing(true); load(); };

  async function handleDelete(event: VendorEvent) {
    Alert.alert('Delete Event', `Delete "${event.title}"? This cannot be undone.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive',
        onPress: async () => {
          setDeletingId(event.id);
          try {
            await deleteVendorEvent(session!.access_token, event.id);
            setEvents(prev => prev.filter(e => e.id !== event.id));
          } catch (e: any) {
            Alert.alert('Error', e.message ?? 'Failed to delete event');
          } finally {
            setDeletingId(null);
          }
        },
      },
    ]);
  }

  function renderItem({ item }: { item: VendorEvent }) {
    const status = item.status ?? 'draft';
    const statusColor = STATUS_COLORS[status] ?? Colors.textMuted;
    const isDeleting = deletingId === item.id;

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={{ flex: 1 }}>
            <Text style={styles.cardName} numberOfLines={1}>{item.title}</Text>
            <Text style={styles.cardMeta}>{item.city ?? '—'} · {formatDate(item.start_date)}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusColor + '20' }]}>
            <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
            <Text style={[styles.statusText, { color: statusColor }]}>{STATUS_LABELS[status] ?? status}</Text>
          </View>
        </View>

        <View style={styles.cardTags}>
          <View style={styles.tag}>
            <Ionicons name={item.is_free ? 'gift-outline' : 'cash-outline'} size={12} color={Colors.textMuted} />
            <Text style={styles.tagText}>{item.is_free ? 'Free' : `$${item.price}`}</Text>
          </View>
          {item.is_online && (
            <View style={styles.tag}>
              <Ionicons name="wifi-outline" size={12} color={Colors.textMuted} />
              <Text style={styles.tagText}>Online</Text>
            </View>
          )}
        </View>

        <View style={styles.cardActions}>
          <TouchableOpacity style={[styles.actionBtn, styles.editBtn]} onPress={() => router.push(`/event-form/${item.id}/edit` as Href)}>
            <Ionicons name="pencil-outline" size={16} color={Colors.primary} />
            <Text style={[styles.actionBtnText, { color: Colors.primary }]}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionBtn, styles.deleteBtn]} onPress={() => handleDelete(item)} disabled={isDeleting}>
            {isDeleting
              ? <ActivityIndicator size="small" color={Colors.error} />
              : <><Ionicons name="trash-outline" size={16} color={Colors.error} /><Text style={[styles.actionBtnText, { color: Colors.error }]}>Delete</Text></>
            }
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScreenHeader
        title="My Events"
        rightElement={
          <TouchableOpacity onPress={() => router.push('/event-form/new' as Href)}>
            <Ionicons name="add" size={24} color={Colors.primary} />
          </TouchableOpacity>
        }
      />

      {!session?.access_token && !loading ? (
        <View style={styles.center}>
          <Ionicons name="lock-closed-outline" size={48} color={Colors.border} />
          <Text style={{ fontSize: FontSize.base, color: Colors.textMuted, marginTop: 12, textAlign: 'center' }}>
            Please sign in to view your events.
          </Text>
          <TouchableOpacity
            style={{ marginTop: 20, backgroundColor: Colors.primary, paddingHorizontal: 32, paddingVertical: 12, borderRadius: 24 }}
            onPress={() => router.push('/auth/login' as Href)}
          >
            <Text style={{ color: '#fff', fontWeight: '600', fontSize: FontSize.base }}>Sign In</Text>
          </TouchableOpacity>
        </View>
      ) : loading ? (
        <View style={styles.center}><ActivityIndicator size="large" color={Colors.primary} /></View>
      ) : (
        <FlatList
          data={events}
          keyExtractor={i => i.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="calendar-outline" size={56} color={Colors.border} />
              <Text style={styles.emptyTitle}>No events yet</Text>
              <Text style={styles.emptyText}>Create your first event to attract customers</Text>
              <TouchableOpacity style={styles.emptyBtn} onPress={() => router.push('/event-form/new' as Href)}>
                <Text style={styles.emptyBtnText}>Create Event</Text>
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
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  list: { padding: Spacing.md, gap: Spacing.sm },
  card: { backgroundColor: Colors.surface, borderRadius: Radius.lg, padding: Spacing.md, ...Shadow.sm },
  cardHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.sm, marginBottom: 8 },
  cardName: { fontSize: FontSize.base, fontWeight: '700', color: Colors.text },
  cardMeta: { fontSize: FontSize.xs, color: Colors.textMuted, marginTop: 2 },
  statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 4, borderRadius: Radius.full },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusText: { fontSize: FontSize.xs, fontWeight: '700' },
  cardTags: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.sm },
  tag: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: Colors.surfaceSecondary, paddingHorizontal: 8, paddingVertical: 3, borderRadius: Radius.full },
  tagText: { fontSize: FontSize.xs, color: Colors.textMuted, fontWeight: '500' },
  cardActions: { flexDirection: 'row', gap: Spacing.sm, borderTopWidth: 1, borderTopColor: Colors.borderLight, paddingTop: Spacing.sm },
  actionBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, paddingVertical: 8, borderRadius: Radius.md, borderWidth: 1 },
  editBtn: { borderColor: Colors.primary, backgroundColor: Colors.primaryBg },
  deleteBtn: { borderColor: '#fecaca', backgroundColor: '#fef2f2' },
  actionBtnText: { fontSize: FontSize.sm, fontWeight: '600' },
  empty: { alignItems: 'center', paddingTop: 80, gap: Spacing.sm },
  emptyTitle: { fontSize: FontSize.lg, fontWeight: '700', color: Colors.textSecondary },
  emptyText: { fontSize: FontSize.base, color: Colors.textMuted, textAlign: 'center' },
  emptyBtn: { marginTop: Spacing.sm, backgroundColor: Colors.primary, paddingHorizontal: Spacing.xl, paddingVertical: 12, borderRadius: Radius.full },
  emptyBtnText: { color: '#fff', fontWeight: '700', fontSize: FontSize.base },
});
