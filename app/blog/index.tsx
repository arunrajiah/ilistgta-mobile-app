import React, { useCallback, useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  Image, ActivityIndicator, RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Spacing, FontSize, Radius, Shadow } from '@/constants/theme';
import { getBlogPosts, formatDate } from '@/lib/api';
import { BlogPost } from '@/lib/types';

export default function BlogListScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);

  async function fetchPosts(p = 1, reset = false) {
    try {
      const data = await getBlogPosts({ page: p, limit: 10 });
      setPosts(prev => reset ? data.posts : [...prev, ...data.posts]);
      setPage(data.page);
      setPages(data.pages);
    } catch {
      // silently handle
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  }

  useEffect(() => { fetchPosts(1, true); }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchPosts(1, true);
  }, []);

  function onEndReached() {
    if (loadingMore || page >= pages) return;
    setLoadingMore(true);
    fetchPosts(page + 1);
  }

  function renderPost({ item }: { item: BlogPost }) {
    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => router.push(`/blog/${item.slug}` as any)}
        activeOpacity={0.85}
      >
        {item.cover_image ? (
          <Image source={{ uri: item.cover_image }} style={styles.cardImage} resizeMode="cover" />
        ) : (
          <LinearGradient colors={[Colors.primary, Colors.primaryLight]} style={styles.cardImage} />
        )}
        <View style={styles.cardBody}>
          {item.category ? (
            <View style={styles.chip}>
              <Text style={styles.chipText}>{item.category}</Text>
            </View>
          ) : null}
          <Text style={styles.cardTitle} numberOfLines={2}>{item.title}</Text>
          {item.excerpt ? (
            <Text style={styles.cardExcerpt} numberOfLines={2}>{item.excerpt}</Text>
          ) : null}
          <View style={styles.metaRow}>
            {item.author_name ? (
              <View style={styles.metaItem}>
                <Ionicons name="person-outline" size={13} color={Colors.textMuted} />
                <Text style={styles.metaText}>{item.author_name}</Text>
              </View>
            ) : null}
            {item.read_time ? (
              <View style={styles.metaItem}>
                <Ionicons name="time-outline" size={13} color={Colors.textMuted} />
                <Text style={styles.metaText}>{item.read_time} min read</Text>
              </View>
            ) : null}
            <View style={styles.metaItem}>
              <Ionicons name="calendar-outline" size={13} color={Colors.textMuted} />
              <Text style={styles.metaText}>{formatDate(item.created_at)}</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} style={{ marginLeft: 'auto' }} />
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  function renderEmpty() {
    return (
      <View style={styles.emptyState}>
        <Ionicons name="book-outline" size={56} color={Colors.border} />
        <Text style={styles.emptyTitle}>No articles yet</Text>
        <Text style={styles.emptySub}>Check back soon for the latest GTA business news.</Text>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={[styles.screen, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={Colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Blog & Articles</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.loader}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Blog & Articles</Text>
        <View style={{ width: 40 }} />
      </View>

      <FlatList
        data={posts}
        keyExtractor={item => item.id}
        renderItem={renderPost}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={posts.length === 0 ? styles.emptyContainer : styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
        onEndReached={onEndReached}
        onEndReachedThreshold={0.3}
        ListFooterComponent={loadingMore ? <ActivityIndicator color={Colors.primary} style={{ margin: Spacing.md }} /> : null}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.surfaceSecondary },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm,
    backgroundColor: Colors.surface, borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  backBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: FontSize.lg, fontWeight: '800', color: Colors.text },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  listContent: { padding: Spacing.md, gap: Spacing.md },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: Spacing.xl },
  emptyState: { alignItems: 'center', gap: Spacing.sm },
  emptyTitle: { fontSize: FontSize.lg, fontWeight: '700', color: Colors.text },
  emptySub: { fontSize: FontSize.sm, color: Colors.textMuted, textAlign: 'center' },
  card: {
    backgroundColor: Colors.surface, borderRadius: Radius.lg, overflow: 'hidden', ...Shadow.sm,
  },
  cardImage: { width: '100%', height: 160 },
  cardBody: { padding: Spacing.md, gap: 6 },
  chip: {
    alignSelf: 'flex-start', backgroundColor: Colors.primaryBg,
    borderRadius: Radius.sm, paddingHorizontal: 8, paddingVertical: 3,
  },
  chipText: { fontSize: FontSize.xs, color: Colors.primary, fontWeight: '700', textTransform: 'uppercase' },
  cardTitle: { fontSize: FontSize.md, fontWeight: '800', color: Colors.text, lineHeight: 22 },
  cardExcerpt: { fontSize: FontSize.sm, color: Colors.textSecondary, lineHeight: 20 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, flexWrap: 'wrap', marginTop: 4 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontSize: FontSize.xs, color: Colors.textMuted },
});
