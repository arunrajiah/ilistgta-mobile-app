import React, { useCallback, useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, RefreshControl, FlatList,
} from 'react-native';
import { useRouter } from 'expo-router';
import type { Href } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/lib/auth';
import { getAnalytics, getMyListings } from '@/lib/api';
import { AnalyticsEnquiry, AnalyticsLog, Listing } from '@/lib/types';
import { Colors, FontSize, Radius, Shadow, Spacing } from '@/constants/theme';
import ScreenHeader from '@/components/ScreenHeader';

const RANGES = [
  { label: '7d',  days: 7 },
  { label: '30d', days: 30 },
  { label: '90d', days: 90 },
];

interface ListingStats {
  id: string;
  name: string;
  slug: string;
  avg_rating: number;
  views: number;
  enquiries: number;
}

export default function AnalyticsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { session } = useAuth();

  const [days, setDays] = useState(30);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const [totalViews, setTotalViews] = useState(0);
  const [totalEnquiries, setTotalEnquiries] = useState(0);
  const [listingStats, setListingStats] = useState<ListingStats[]>([]);

  const load = useCallback(async (selectedDays = days) => {
    if (!session?.access_token) {
      setLoading(false);
      setRefreshing(false);
      return;
    }
    setError('');
    try {
      const [analyticsRes, listingsRes] = await Promise.all([
        getAnalytics(session.access_token, selectedDays),
        getMyListings(session.access_token),
      ]);

      const { viewLogs, enquiries } = analyticsRes;
      const listings = listingsRes.listings;

      setTotalViews(viewLogs.length);
      setTotalEnquiries(enquiries.length);

      // Count views per listing slug
      const viewsByPage: Record<string, number> = {};
      viewLogs.forEach((v: AnalyticsLog) => {
        viewsByPage[v.page] = (viewsByPage[v.page] || 0) + 1;
      });

      // Count enquiries per listing
      const enquiriesByListing: Record<string, number> = {};
      enquiries.forEach((e: AnalyticsEnquiry) => {
        enquiriesByListing[e.listing_id] = (enquiriesByListing[e.listing_id] || 0) + 1;
      });

      const stats: ListingStats[] = listings.map((l: Listing) => ({
        id: l.id,
        name: l.name,
        slug: l.slug,
        avg_rating: Number(l.avg_rating) || 0,
        // Count both /business/ (mobile) and /businesses/ (legacy web) paths (B5 fix)
        views: (viewsByPage[`/business/${l.slug}`] || 0) + (viewsByPage[`/businesses/${l.slug}`] || 0),
        enquiries: enquiriesByListing[l.id] || 0,
      })).sort((a, b) => b.views - a.views);

      setListingStats(stats);
    } catch (e: any) {
      setError(e.message ?? 'Failed to load analytics');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [session, days]);

  useEffect(() => { setLoading(true); load(days); }, [days]);

  const onRefresh = () => { setRefreshing(true); load(days); };

  if (!session?.access_token && !loading) {
    return (
      <View style={[styles.loader, { paddingTop: insets.top }]}>
        <Ionicons name="lock-closed-outline" size={48} color={Colors.border} />
        <Text style={{ fontSize: FontSize.base, color: Colors.textMuted, marginTop: 12, textAlign: 'center' }}>
          Please sign in to view your analytics.
        </Text>
        <TouchableOpacity
          style={{ marginTop: 20, backgroundColor: Colors.primary, paddingHorizontal: 32, paddingVertical: 12, borderRadius: 24 }}
          onPress={() => router.push('/auth/login' as Href)}
        >
          <Text style={{ color: '#fff', fontWeight: '600', fontSize: FontSize.base }}>Sign In</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={[styles.loader, { paddingTop: insets.top }]}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScreenHeader title="Analytics" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
      >
        {/* Range selector */}
        <View style={styles.rangePicker}>
          {RANGES.map(r => (
            <TouchableOpacity
              key={r.days}
              style={[styles.rangeBtn, days === r.days && styles.rangeBtnActive]}
              onPress={() => setDays(r.days)}
            >
              <Text style={[styles.rangeBtnText, days === r.days && styles.rangeBtnTextActive]}>{r.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {error ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity onPress={() => load(days)} style={styles.retryBtn}>
              <Text style={styles.retryText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {/* Summary cards */}
            <View style={styles.statsRow}>
              <View style={styles.statCard}>
                <Ionicons name="eye-outline" size={24} color={Colors.primary} />
                <Text style={styles.statNumber}>{totalViews.toLocaleString()}</Text>
                <Text style={styles.statLabel}>Total Views</Text>
              </View>
              <View style={styles.statCard}>
                <Ionicons name="mail-outline" size={24} color={Colors.primary} />
                <Text style={styles.statNumber}>{totalEnquiries.toLocaleString()}</Text>
                <Text style={styles.statLabel}>Enquiries</Text>
              </View>
            </View>

            {/* Per-listing breakdown */}
            <View style={styles.tableCard}>
              <Text style={styles.tableTitle}>Listing Performance</Text>
              {listingStats.length === 0 ? (
                <View style={styles.emptyBox}>
                  <Ionicons name="bar-chart-outline" size={40} color={Colors.border} />
                  <Text style={styles.emptyText}>No listings to show analytics for.</Text>
                </View>
              ) : (
                listingStats.map((item, idx) => (
                  <View key={item.id} style={[styles.tableRow, idx > 0 && styles.tableRowBorder]}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.listingName} numberOfLines={1}>{item.name}</Text>
                      {item.avg_rating > 0 && (
                        <View style={styles.ratingRow}>
                          <Ionicons name="star" size={12} color={Colors.star} />
                          <Text style={styles.ratingText}>{item.avg_rating.toFixed(1)}</Text>
                        </View>
                      )}
                    </View>
                    <View style={styles.metricCol}>
                      <Text style={styles.metricNumber}>{item.views}</Text>
                      <Text style={styles.metricLabel}>Views</Text>
                    </View>
                    <View style={styles.metricCol}>
                      <Text style={styles.metricNumber}>{item.enquiries}</Text>
                      <Text style={styles.metricLabel}>Enquiries</Text>
                    </View>
                  </View>
                ))
              )}
            </View>
          </>
        )}

        <View style={{ height: Spacing.xxl }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.surfaceSecondary },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  rangePicker: { flexDirection: 'row', justifyContent: 'center', gap: Spacing.sm, padding: Spacing.md },
  rangeBtn: { paddingHorizontal: 20, paddingVertical: 8, borderRadius: Radius.full, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border },
  rangeBtnActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  rangeBtnText: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.text },
  rangeBtnTextActive: { color: '#fff' },
  statsRow: { flexDirection: 'row', gap: Spacing.md, paddingHorizontal: Spacing.md, marginBottom: Spacing.md },
  statCard: { flex: 1, backgroundColor: Colors.surface, borderRadius: Radius.lg, padding: Spacing.md, alignItems: 'center', gap: 6, ...Shadow.sm },
  statNumber: { fontSize: FontSize.xxl, fontWeight: '800', color: Colors.text },
  statLabel: { fontSize: FontSize.xs, color: Colors.textMuted, fontWeight: '600' },
  tableCard: { backgroundColor: Colors.surface, borderRadius: Radius.lg, marginHorizontal: Spacing.md, marginBottom: Spacing.md, padding: Spacing.md, ...Shadow.sm },
  tableTitle: { fontSize: FontSize.base, fontWeight: '700', color: Colors.text, marginBottom: Spacing.md },
  tableRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: Spacing.sm, gap: Spacing.sm },
  tableRowBorder: { borderTopWidth: 1, borderTopColor: Colors.borderLight },
  listingName: { fontSize: FontSize.base, fontWeight: '600', color: Colors.text },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 2 },
  ratingText: { fontSize: FontSize.xs, color: Colors.textMuted },
  metricCol: { alignItems: 'center', minWidth: 60 },
  metricNumber: { fontSize: FontSize.lg, fontWeight: '700', color: Colors.primary },
  metricLabel: { fontSize: FontSize.xs, color: Colors.textMuted, marginTop: 1 },
  emptyBox: { alignItems: 'center', paddingVertical: Spacing.xl, gap: 10 },
  emptyText: { fontSize: FontSize.sm, color: Colors.textMuted, textAlign: 'center' },
  errorBox: { alignItems: 'center', padding: Spacing.xl, gap: 12 },
  errorText: { fontSize: FontSize.base, color: Colors.textMuted, textAlign: 'center' },
  retryBtn: { backgroundColor: Colors.primary, paddingHorizontal: 24, paddingVertical: 10, borderRadius: Radius.full },
  retryText: { color: '#fff', fontWeight: '700' },
});
