import React, { useCallback, useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  ActivityIndicator, RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { getCoupons } from '@/lib/api';
import { Coupon } from '@/lib/types';
import { Colors, FontSize, Radius, Spacing, Shadow } from '@/constants/theme';
import CouponCard from '@/components/CouponCard';
import { useLang } from '@/lib/i18n';

const PAGE_SIZE = 12;

export default function CouponsScreen() {
  const insets = useSafeAreaInsets();
  const { t } = useLang();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  async function fetchCoupons(pg = 1, reset = false) {
    if (reset) setError('');
    try {
      if (reset) setLoading(true); else if (pg > 1) setLoadingMore(true);
      const data = await getCoupons({ page: pg, limit: PAGE_SIZE });
      setCoupons(prev => reset ? data.coupons : [...prev, ...data.coupons]);
      setTotalPages(data.pagination.pages);
      setPage(pg);
    } catch (e: any) {
      if (reset) setError(e.message ?? 'Failed to load deals.');
    } finally {
      setLoading(false);
      setLoadingMore(false);
      setRefreshing(false);
    }
  }

  useEffect(() => { fetchCoupons(1, true); }, []);
  const onRefresh = useCallback(() => { setRefreshing(true); fetchCoupons(1, true); }, []);

  return (
    <View style={[s.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={s.header}>
        <View>
          <Text style={s.headerTitle}>{t('deals.title')}</Text>
          <Text style={s.headerSub}>{t('deals.subtitle')}</Text>
        </View>
        <View style={s.headerBadge}>
          <Ionicons name="pricetag" size={16} color={Colors.primary} />
          <Text style={s.headerBadgeText}>Hot Deals</Text>
        </View>
      </View>

      {loading ? (
        <View style={s.loader}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={s.loadingText}>Loading deals…</Text>
        </View>
      ) : error ? (
        <View style={s.errorBox}>
          <Ionicons name="cloud-offline-outline" size={44} color={Colors.textMuted} />
          <Text style={s.errorText}>{error}</Text>
          <TouchableOpacity style={s.retryBtn} onPress={() => fetchCoupons(1, true)}>
            <Text style={s.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={coupons}
          keyExtractor={c => c.id}
          contentContainerStyle={s.listContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
          onEndReached={() => { if (!loadingMore && page < totalPages) fetchCoupons(page + 1); }}
          onEndReachedThreshold={0.4}
          ListEmptyComponent={
            <View style={s.empty}>
              <Ionicons name="pricetag" size={56} color={Colors.border} />
              <Text style={s.emptyTitle}>No deals right now</Text>
              <Text style={s.emptyText}>Check back soon for great offers!</Text>
            </View>
          }
          ListFooterComponent={
            loadingMore
              ? <ActivityIndicator style={{ paddingVertical: 20 }} color={Colors.primary} />
              : null
          }
          renderItem={({ item }) => <CouponCard coupon={item} />}
        />
      )}
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.surfaceSecondary },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.md,
    ...Shadow.sm,
  },
  headerTitle: { fontSize: FontSize.xl, fontWeight: '800', color: Colors.text },
  headerSub: { fontSize: FontSize.sm, color: Colors.textMuted, marginTop: 2 },
  headerBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: Colors.primaryBg, borderRadius: Radius.full,
    paddingHorizontal: 12, paddingVertical: 6,
  },
  headerBadgeText: { fontSize: FontSize.xs, color: Colors.primary, fontWeight: '700' },
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
  emptyText: { fontSize: FontSize.base, color: Colors.textMuted },
});
