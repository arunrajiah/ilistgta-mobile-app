import React, { useCallback, useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  ActivityIndicator, RefreshControl, ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { getCoupons } from '@/lib/api';
import { Coupon } from '@/lib/types';
import { Colors, FontSize, Radius, Spacing, Shadow } from '@/constants/theme';
import { useLang } from '@/lib/i18n';

const PAGE_SIZE = 12;
const DEAL_CATEGORIES = [
  { id: 'all', label: 'All Deals', slug: '' },
  { id: 'cleaning', label: 'Cleaning', slug: 'cleaning' },
  { id: 'realestate', label: 'Real Estate', slug: 'real-estate' },
  { id: 'legal', label: 'Consultations', slug: 'consultations' },
  { id: 'food', label: 'Food & Dining', slug: 'food' },
  { id: 'tech', label: 'Technology', slug: 'tech' },
];

export default function CouponsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t } = useLang();
  const [activeCategory, setActiveCategory] = useState('');
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
      const data = await getCoupons({ category: activeCategory || undefined, page: pg, limit: PAGE_SIZE });
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

  useEffect(() => { fetchCoupons(1, true); }, [activeCategory]);
  const onRefresh = useCallback(() => { setRefreshing(true); fetchCoupons(1, true); }, [activeCategory]);

  return (
    <View style={[s.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={s.header}>
        <Text style={s.headerTitle}>Coupons & Deals</Text>

        {/* Category chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={s.chipList}
        >
          {DEAL_CATEGORIES.map(cat => {
            const active = activeCategory === cat.slug;
            return (
              <TouchableOpacity
                key={cat.id}
                style={[s.chip, active && s.chipActive]}
                onPress={() => setActiveCategory(cat.slug)}
                activeOpacity={0.75}
              >
                <Text style={[s.chipText, active && s.chipTextActive]}>{cat.label}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
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
            loadingMore ? <ActivityIndicator style={{ paddingVertical: 20 }} color={Colors.primary} /> : null
          }
          renderItem={({ item }) => (
            <DealCard
              coupon={item}
              onViewDetail={() => router.push(`/coupon/${item.id}` as any)}
            />
          )}
        />
      )}
    </View>
  );
}

function DealCard({ coupon, onViewDetail }: { coupon: Coupon; onViewDetail: () => void }) {
  const discount = coupon.discount_type === 'percentage'
    ? `${coupon.discount_value}% Off`
    : `$${coupon.discount_value} Off`;
  const businessName = coupon.business_listings?.name ?? 'Business';

  async function copyCode() {
    if (coupon.code) {
      await Clipboard.setStringAsync(coupon.code);
    }
  }

  return (
    <View style={d.card}>
      <View style={d.row}>
        {/* Business avatar */}
        <View style={d.avatar}>
          <Text style={d.avatarText}>
            {(businessName ?? coupon.title)[0]?.toUpperCase()}
          </Text>
        </View>

        <View style={{ flex: 1 }}>
          <Text style={d.business} numberOfLines={1}>{businessName}</Text>
          <Text style={d.title} numberOfLines={2}>{coupon.title ?? discount}</Text>
          {coupon.description && (
            <Text style={d.desc} numberOfLines={2}>{coupon.description}</Text>
          )}
        </View>
      </View>

      {/* Code + actions */}
      {coupon.code && (
        <View style={d.codeRow}>
          <View style={d.codePill}>
            <Text style={d.codeLabel}>Promo Code</Text>
            <Text style={d.code}>{coupon.code}</Text>
          </View>
          <TouchableOpacity style={d.copyBtn} onPress={copyCode} activeOpacity={0.8}>
            <Ionicons name="copy-outline" size={14} color={Colors.primary} />
            <Text style={d.copyBtnText}>Copy Code</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={d.actions}>
        <TouchableOpacity style={d.viewBtn} onPress={onViewDetail} activeOpacity={0.85}>
          <Text style={d.viewBtnText}>View Details</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.surfaceSecondary },
  header: {
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.md, paddingTop: Spacing.md, paddingBottom: Spacing.sm,
    ...Shadow.sm, gap: Spacing.sm,
  },
  headerTitle: { fontSize: FontSize.xl, fontWeight: '800', color: Colors.text },
  chipList: { gap: Spacing.sm, paddingVertical: 4 },
  chip: {
    paddingHorizontal: 14, paddingVertical: 7,
    backgroundColor: Colors.surfaceSecondary,
    borderRadius: Radius.full, borderWidth: 1, borderColor: Colors.border,
  },
  chipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  chipText: { fontSize: FontSize.sm, color: Colors.textSecondary, fontWeight: '600' },
  chipTextActive: { color: '#fff' },
  listContent: { padding: Spacing.md, gap: Spacing.md, paddingBottom: Spacing.xxl },
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

const d = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    padding: Spacing.md,
    gap: Spacing.md,
    ...Shadow.sm,
  },
  row: { flexDirection: 'row', gap: Spacing.md, alignItems: 'flex-start' },
  avatar: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: Colors.primaryBg,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: Colors.primary + '30',
  },
  avatarText: { fontSize: FontSize.lg, fontWeight: '800', color: Colors.primary },
  business: { fontSize: FontSize.sm, fontWeight: '700', color: Colors.text },
  title: { fontSize: FontSize.base, fontWeight: '600', color: Colors.text, marginTop: 2, lineHeight: 20 },
  desc: { fontSize: FontSize.xs, color: Colors.textSecondary, marginTop: 4, lineHeight: 16 },
  codeRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  codePill: {
    flex: 1, backgroundColor: Colors.surfaceSecondary,
    borderRadius: Radius.md, padding: Spacing.sm,
    borderWidth: 1, borderColor: Colors.border,
    borderStyle: 'dashed',
  },
  codeLabel: { fontSize: FontSize.xs, color: Colors.textMuted },
  code: { fontSize: FontSize.base, fontWeight: '800', color: Colors.text, letterSpacing: 1 },
  copyBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 14, paddingVertical: 10,
    borderRadius: Radius.md, borderWidth: 1.5, borderColor: Colors.primary,
  },
  copyBtnText: { fontSize: FontSize.sm, fontWeight: '700', color: Colors.primary },
  actions: { flexDirection: 'row' },
  viewBtn: {
    flex: 1, backgroundColor: Colors.primary,
    borderRadius: Radius.full, paddingVertical: 11,
    alignItems: 'center',
  },
  viewBtnText: { color: '#fff', fontWeight: '700', fontSize: FontSize.sm },
});
