import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Image, ActivityIndicator,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Spacing, FontSize, Radius } from '@/constants/theme';
import { getBlogPost, formatDate } from '@/lib/api';
import { BlogPost } from '@/lib/types';
import ScreenHeader from '@/components/ScreenHeader';

export default function BlogDetailScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!slug) return;
    getBlogPost(slug)
      .then(data => setPost(data.post))
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <View style={[styles.screen, { paddingTop: insets.top }]}>
        <View style={styles.loader}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      </View>
    );
  }

  if (notFound || !post) {
    return (
      <View style={styles.screen}>
        <ScreenHeader title="Blog" />
        <View style={styles.loader}>
          <Ionicons name="document-outline" size={56} color={Colors.border} />
          <Text style={styles.notFoundText}>Article not found</Text>
        </View>
      </View>
    );
  }

  const paragraphs = (post.content ?? '').split('\n\n').filter(Boolean);

  return (
    <View style={[styles.screen, { paddingTop: 0 }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Cover image with back button overlay */}
        <View style={styles.coverContainer}>
          {post.cover_image ? (
            <Image source={{ uri: post.cover_image }} style={styles.coverImage} resizeMode="cover" />
          ) : (
            <LinearGradient colors={[Colors.primary, Colors.primaryLight]} style={styles.coverImage} />
          )}
          <View style={[styles.backOverlay, { top: insets.top + Spacing.sm }]}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Content */}
        <View style={styles.content}>
          {post.category ? (
            <View style={styles.chip}>
              <Text style={styles.chipText}>{post.category}</Text>
            </View>
          ) : null}

          <Text style={styles.title}>{post.title}</Text>

          <View style={styles.metaRow}>
            {post.author_name ? (
              <View style={styles.metaItem}>
                <Ionicons name="person-outline" size={14} color={Colors.textMuted} />
                <Text style={styles.metaText}>{post.author_name}</Text>
              </View>
            ) : null}
            <View style={styles.metaItem}>
              <Ionicons name="calendar-outline" size={14} color={Colors.textMuted} />
              <Text style={styles.metaText}>{formatDate(post.created_at)}</Text>
            </View>
            {post.read_time ? (
              <View style={styles.metaItem}>
                <Ionicons name="time-outline" size={14} color={Colors.textMuted} />
                <Text style={styles.metaText}>{post.read_time} min read</Text>
              </View>
            ) : null}
          </View>

          <View style={styles.divider} />

          {/* Body */}
          {paragraphs.map((para, i) => (
            <Text key={i} style={styles.paragraph}>{para}</Text>
          ))}
        </View>

        <View style={{ height: Spacing.xxl }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.surface },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: Spacing.md },
  notFoundText: { fontSize: FontSize.lg, color: Colors.textMuted, fontWeight: '600' },
  coverContainer: { position: 'relative' },
  coverImage: { width: '100%', height: 220 },
  backOverlay: { position: 'absolute', left: Spacing.md },
  backBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center',
  },
  content: { padding: Spacing.lg, gap: Spacing.sm },
  chip: {
    alignSelf: 'flex-start', backgroundColor: Colors.primaryBg,
    borderRadius: Radius.sm, paddingHorizontal: 10, paddingVertical: 4,
  },
  chipText: { fontSize: FontSize.xs, color: Colors.primary, fontWeight: '700', textTransform: 'uppercase' },
  title: { fontSize: FontSize.xl, fontWeight: '800', color: Colors.text, lineHeight: 30 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, flexWrap: 'wrap' },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  metaText: { fontSize: FontSize.sm, color: Colors.textMuted },
  divider: { height: 1, backgroundColor: Colors.border, marginVertical: Spacing.sm },
  paragraph: { fontSize: FontSize.base, color: Colors.text, lineHeight: 26, marginBottom: Spacing.md },
});
