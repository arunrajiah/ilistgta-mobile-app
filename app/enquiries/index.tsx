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
import { getMyEnquiries, formatDate } from '@/lib/api';
import { Colors, FontSize, Radius, Shadow, Spacing } from '@/constants/theme';
import ScreenHeader from '@/components/ScreenHeader';

type Enquiry = {
  id: string; name: string; email: string; phone?: string;
  message: string; created_at: string;
  business_listings?: { id: string; name: string; slug: string; city: string };
};

export default function EnquiriesScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { session } = useAuth();
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!session?.access_token) {
      setLoading(false);
      setRefreshing(false);
      return;
    }
    try {
      const data = await getMyEnquiries(session.access_token);
      setEnquiries(data.enquiries);
    } catch (e: any) {
      Alert.alert('Error', e.message ?? 'Failed to load enquiries');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [session]);

  useEffect(() => { load(); }, [load]);

  const onRefresh = () => { setRefreshing(true); load(); };

  function renderItem({ item }: { item: Enquiry }) {
    const isExpanded = expanded === item.id;
    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => setExpanded(isExpanded ? null : item.id)}
        activeOpacity={0.85}
      >
        <View style={styles.cardHeader}>
          <View style={styles.cardIcon}>
            <Ionicons name="mail" size={18} color={Colors.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.cardBusiness} numberOfLines={1}>
              {item.business_listings?.name ?? 'Unknown Business'}
            </Text>
            <Text style={styles.cardCity}>
              {item.business_listings?.city ?? ''} · {formatDate(item.created_at)}
            </Text>
          </View>
          <Ionicons
            name={isExpanded ? 'chevron-up' : 'chevron-down'}
            size={18}
            color={Colors.textMuted}
          />
        </View>

        <Text style={[styles.cardMessage, !isExpanded && styles.cardMessageCollapsed]} numberOfLines={isExpanded ? undefined : 2}>
          {item.message}
        </Text>

        {isExpanded && item.business_listings?.slug && (
          <TouchableOpacity
            style={styles.viewBusinessBtn}
            onPress={() => router.push(`/business/${item.business_listings!.slug}`)}
          >
            <Ionicons name="arrow-forward" size={14} color={Colors.primary} />
            <Text style={styles.viewBusinessText}>View Business</Text>
          </TouchableOpacity>
        )}
      </TouchableOpacity>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScreenHeader title="My Enquiries" />

      {!session?.access_token && !loading ? (
        <View style={styles.center}>
          <Ionicons name="lock-closed-outline" size={48} color={Colors.border} />
          <Text style={{ fontSize: FontSize.base, color: Colors.textMuted, marginTop: 12, textAlign: 'center' }}>
            Please sign in to view your enquiries.
          </Text>
          <TouchableOpacity
            style={{ marginTop: 20, backgroundColor: Colors.primary, paddingHorizontal: 32, paddingVertical: 12, borderRadius: 24 }}
            onPress={() => router.push('/auth/login' as Href)}
          >
            <Text style={{ color: '#fff', fontWeight: '600', fontSize: FontSize.base }}>Sign In</Text>
          </TouchableOpacity>
        </View>
      ) : loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : (
        <FlatList
          data={enquiries}
          keyExtractor={i => i.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="mail-outline" size={56} color={Colors.border} />
              <Text style={styles.emptyTitle}>No enquiries yet</Text>
              <Text style={styles.emptyText}>Enquiries you send to businesses will appear here</Text>
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
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: 8 },
  cardIcon: {
    width: 36, height: 36, borderRadius: Radius.md,
    backgroundColor: Colors.primaryBg, justifyContent: 'center', alignItems: 'center',
  },
  cardBusiness: { fontSize: FontSize.base, fontWeight: '700', color: Colors.text },
  cardCity: { fontSize: FontSize.xs, color: Colors.textMuted, marginTop: 2 },
  cardMessage: { fontSize: FontSize.sm, color: Colors.textSecondary, lineHeight: 20 },
  cardMessageCollapsed: {},
  viewBusinessBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    marginTop: Spacing.sm, paddingTop: Spacing.sm,
    borderTopWidth: 1, borderTopColor: Colors.borderLight,
  },
  viewBusinessText: { fontSize: FontSize.sm, color: Colors.primary, fontWeight: '600' },

  empty: { alignItems: 'center', paddingTop: 80, gap: Spacing.sm },
  emptyTitle: { fontSize: FontSize.lg, fontWeight: '700', color: Colors.textSecondary },
  emptyText: { fontSize: FontSize.base, color: Colors.textMuted, textAlign: 'center', paddingHorizontal: Spacing.xl },
});
