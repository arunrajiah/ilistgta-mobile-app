import React, { useCallback, useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList,
  ActivityIndicator, RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getCoupons } from '@/lib/api';
import { Coupon } from '@/lib/types';
import { Colors, FontSize, Spacing, Shadow } from '@/constants/theme';
import CouponCard from '@/components/CouponCard';

const PAGE_SIZE = 12;

export default function CouponsScreen() {
  const insets = useSafeAreaInsets();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  async function fetchCoupons(pg = 1, reset = false) {
    try {
      if (reset) setLoading(true); else if (pg > 1) setLoadingMore(true);
      const data = await getCoupons({ page: pg, limit: PAGE_SIZE });
      setCoupons(prev => reset ? data.coupons : [...prev, ...data.coupons]);
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

  useEffect(() => { fetchCoupons(1, true); }, []);

  const onRefresh = useCallback(() => { setRefreshing(true); fetchCoupons(1, true); }, []);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Deals & Coupons</Text>
        <Text style={styles.headerSub}>Exclusive offers from local businesses</Text>
      </View>

      {loading ? (
        <View style={styles.loader}><ActivityIndicator size="large" color={Colors.primary} /></View>
      ) : (
        <FlatList
          data={coupons}
          keyExtractor={c => c.id}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
          onEndReached={() => { if (!loadingMore && page < totalPages) fetchCoupons(page + 1); }}
          onEndReachedThreshold={0.4}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyIcon}>🏷️</Text>
              <Text style={styles.emptyTitle}>No deals right now</Text>
              <Text style={styles.emptyText}>Check back soon for great offers!</Text>
            </View>
          }
          ListFooterComponent={loadingMore ? <ActivityIndicator style={{ padding: 16 }} color={Colors.primary} /> : null}
          renderItem={({ item }) => <CouponCard coupon={item} />}
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
  listContent: { padding: Spacing.md },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  empty: { alignItems: 'center', paddingTop: 60 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyTitle: { fontSize: FontSize.lg, fontWeight: '700', color: Colors.text, marginBottom: 6 },
  emptyText: { fontSize: FontSize.base, color: Colors.textMuted },
});
