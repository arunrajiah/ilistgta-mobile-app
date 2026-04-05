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
import { getMyCoupons, deleteVendorCoupon } from '@/lib/api';
import { VendorCoupon } from '@/lib/types';
import { Colors, FontSize, Radius, Shadow, Spacing } from '@/constants/theme';

const STATUS_COLORS: Record<string, string> = {
  approved: '#22c55e', pending: '#f59e0b', rejected: '#ef4444', draft: '#9ca3af',
};
const STATUS_LABELS: Record<string, string> = {
  approved: 'Live', pending: 'Under Review', rejected: 'Rejected', draft: 'Draft',
};

function formatDiscount(type: string, value?: number) {
  if (type === 'percentage') return `${value}% OFF`;
  if (type === 'fixed') return `$${value} OFF`;
  if (type === 'bogo') return 'BOGO';
  return 'DEAL';
}

export default function MyCouponsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { session } = useAuth();
  const [coupons, setCoupons] = useState<VendorCoupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!session?.access_token) return;
    try {
      const data = await getMyCoupons(session.access_token);
      setCoupons(data.coupons);
    } catch (e: any) {
      Alert.alert('Error', e.message ?? 'Failed to load coupons');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [session]);

  useEffect(() => { load(); }, [load]);
  const onRefresh = () => { setRefreshing(true); load(); };

  async function handleDelete(coupon: VendorCoupon) {
    Alert.alert('Delete Coupon', `Delete "${coupon.title}"? This cannot be undone.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive',
        onPress: async () => {
          setDeletingId(coupon.id);
          try {
            await deleteVendorCoupon(session!.access_token, coupon.id);
            setCoupons(prev => prev.filter(c => c.id !== coupon.id));
          } catch (e: any) {
            Alert.alert('Error', e.message ?? 'Failed to delete coupon');
          } finally {
            setDeletingId(null);
          }
        },
      },
    ]);
  }

  function renderItem({ item }: { item: VendorCoupon }) {
    const status = item.status ?? 'draft';
    const statusColor = STATUS_COLORS[status] ?? Colors.textMuted;
    const isDeleting = deletingId === item.id;
    const isExpired = item.end_date && new Date(item.end_date) < new Date();

    return (
      <View style={[styles.card, isExpired && { opacity: 0.6 }]}>
        <View style={styles.cardHeader}>
          <View style={{ flex: 1 }}>
            <Text style={styles.cardName} numberOfLines={1}>{item.title}</Text>
            <Text style={styles.cardBiz}>{item.business_listings?.name ?? '—'}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusColor + '20' }]}>
            <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
            <Text style={[styles.statusText, { color: statusColor }]}>{STATUS_LABELS[status] ?? status}</Text>
          </View>
        </View>

        <View style={styles.discountRow}>
          <View style={styles.discountBadge}>
            <Text style={styles.discountText}>{formatDiscount(item.discount_type, item.discount_value)}</Text>
          </View>
          {item.code && (
            <View style={styles.codeBadge}>
              <Ionicons name="pricetag-outline" size={12} color={Colors.textMuted} />
              <Text style={styles.codeText}>{item.code}</Text>
            </View>
          )}
          {isExpired && (
            <View style={styles.expiredBadge}>
              <Text style={styles.expiredText}>Expired</Text>
            </View>
          )}
        </View>

        <View style={styles.cardActions}>
          <TouchableOpacity style={[styles.actionBtn, styles.editBtn]} onPress={() => router.push(`/coupon-form/${item.id}/edit` as Href)}>
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
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Coupons</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => router.push('/coupon-form/new' as Href)}>
          <Ionicons name="add" size={24} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.center}><ActivityIndicator size="large" color={Colors.primary} /></View>
      ) : (
        <FlatList
          data={coupons}
          keyExtractor={c => c.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="pricetags-outline" size={56} color={Colors.border} />
              <Text style={styles.emptyTitle}>No coupons yet</Text>
              <Text style={styles.emptyText}>Create deals and discounts to attract customers</Text>
              <TouchableOpacity style={styles.emptyBtn} onPress={() => router.push('/coupon-form/new' as Href)}>
                <Text style={styles.emptyBtnText}>Create Coupon</Text>
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
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.md, paddingBottom: Spacing.sm, backgroundColor: Colors.surface, borderBottomWidth: 1, borderBottomColor: Colors.border, ...Shadow.sm },
  backBtn: { width: 36, height: 36, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: FontSize.md, fontWeight: '700', color: Colors.text },
  addBtn: { width: 36, height: 36, justifyContent: 'center', alignItems: 'center' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  list: { padding: Spacing.md, gap: Spacing.sm },
  card: { backgroundColor: Colors.surface, borderRadius: Radius.lg, padding: Spacing.md, ...Shadow.sm },
  cardHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.sm, marginBottom: 8 },
  cardName: { fontSize: FontSize.base, fontWeight: '700', color: Colors.text },
  cardBiz: { fontSize: FontSize.xs, color: Colors.textMuted, marginTop: 2 },
  statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 4, borderRadius: Radius.full },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusText: { fontSize: FontSize.xs, fontWeight: '700' },
  discountRow: { flexDirection: 'row', gap: Spacing.sm, alignItems: 'center', marginBottom: Spacing.sm, flexWrap: 'wrap' },
  discountBadge: { backgroundColor: Colors.primaryBg, paddingHorizontal: 10, paddingVertical: 4, borderRadius: Radius.full },
  discountText: { fontSize: FontSize.sm, fontWeight: '700', color: Colors.primary },
  codeBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: Colors.surfaceSecondary, paddingHorizontal: 8, paddingVertical: 4, borderRadius: Radius.full },
  codeText: { fontSize: FontSize.xs, color: Colors.textMuted, fontFamily: 'monospace', fontWeight: '600' },
  expiredBadge: { backgroundColor: '#fee2e2', paddingHorizontal: 8, paddingVertical: 4, borderRadius: Radius.full },
  expiredText: { fontSize: FontSize.xs, color: '#ef4444', fontWeight: '600' },
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
