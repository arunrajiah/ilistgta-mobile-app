import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Linking, ActivityIndicator, Alert } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, FontSize, Radius, Shadow, Spacing } from '@/constants/theme';
import { getEventBySlug, formatDate } from '@/lib/api';
import { Event } from '@/lib/types';

function safeOpen(url: string) {
  try {
    const parsed = new URL(url);
    if (!['http:', 'https:', 'tel:', 'mailto:'].includes(parsed.protocol)) return;
    Linking.openURL(url).catch(() => Alert.alert('Error', 'Could not open link.'));
  } catch {
    Alert.alert('Error', 'Invalid link.');
  }
}

export default function EventDetailScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    getEventBySlug(slug)
      .then(({ event }) => setEvent(event))
      .catch(e => Alert.alert('Error', e.message))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return <View style={styles.loader}><ActivityIndicator size="large" color={Colors.primary} /></View>;
  if (!event) return <View style={styles.loader}><Text>Event not found.</Text></View>;

  const imageUrl = event.image_url ?? `https://picsum.photos/seed/${event.slug}/800/400`;
  const startDate = new Date(event.start_date);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Image source={{ uri: imageUrl }} style={styles.heroImage} />

      <View style={styles.content}>
        {event.categories && (
          <Text style={styles.category}>{event.categories.icon} {event.categories.name}</Text>
        )}
        <Text style={styles.title}>{event.title}</Text>

        {/* Date / price / location */}
        <View style={styles.metaCard}>
          <View style={styles.metaRow}>
            <Ionicons name="calendar" size={20} color={Colors.primary} />
            <View>
              <Text style={styles.metaLabel}>Date & Time</Text>
              <Text style={styles.metaValue}>{formatDate(event.start_date)}</Text>
              {event.end_date && <Text style={styles.metaSubValue}>Ends {formatDate(event.end_date)}</Text>}
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.metaRow}>
            <Ionicons name={event.is_online ? 'globe' : 'location'} size={20} color={Colors.primary} />
            <View>
              <Text style={styles.metaLabel}>{event.is_online ? 'Online Event' : 'Location'}</Text>
              <Text style={styles.metaValue}>{event.is_online ? 'Virtual Event' : (event.address ?? event.city)}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.metaRow}>
            <Ionicons name="ticket" size={20} color={Colors.primary} />
            <View>
              <Text style={styles.metaLabel}>Admission</Text>
              <Text style={[styles.metaValue, event.is_free && styles.freeText]}>
                {event.is_free ? 'Free' : `$${event.price}`}
              </Text>
            </View>
          </View>
        </View>

        {/* Description */}
        {event.description && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About this Event</Text>
            <Text style={styles.description}>{event.description}</Text>
          </View>
        )}

        {/* CTA */}
        {event.is_online && event.online_url ? (
          <TouchableOpacity style={styles.ctaBtn} onPress={() => safeOpen(event.online_url!)}>
            <Ionicons name="globe" size={18} color="#fff" />
            <Text style={styles.ctaBtnText}>Join Online Event</Text>
          </TouchableOpacity>
        ) : !event.is_free ? (
          <TouchableOpacity style={styles.ctaBtn}>
            <Ionicons name="ticket" size={18} color="#fff" />
            <Text style={styles.ctaBtnText}>Get Tickets — ${event.price}</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.freeCtaBox}>
            <Text style={styles.freeCtaText}>🎉 This is a free event! Mark your calendar.</Text>
          </View>
        )}

        <View style={{ height: Spacing.xxl }} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.surfaceSecondary },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  heroImage: { width: '100%', height: 240, resizeMode: 'cover', backgroundColor: Colors.border },
  content: { padding: Spacing.md },
  category: { fontSize: FontSize.sm, color: Colors.primary, fontWeight: '600', marginBottom: 4 },
  title: { fontSize: FontSize.xl, fontWeight: '800', color: Colors.text, marginBottom: Spacing.md, lineHeight: 30 },
  metaCard: { backgroundColor: Colors.surface, borderRadius: Radius.lg, padding: Spacing.md, ...Shadow.sm, marginBottom: Spacing.lg, gap: Spacing.md },
  metaRow: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.md },
  metaLabel: { fontSize: FontSize.xs, color: Colors.textMuted, fontWeight: '600', marginBottom: 2 },
  metaValue: { fontSize: FontSize.base, color: Colors.text, fontWeight: '600' },
  metaSubValue: { fontSize: FontSize.sm, color: Colors.textMuted },
  freeText: { color: Colors.success },
  divider: { height: 1, backgroundColor: Colors.borderLight },
  section: { marginBottom: Spacing.lg },
  sectionTitle: { fontSize: FontSize.lg, fontWeight: '800', color: Colors.text, marginBottom: Spacing.sm },
  description: { fontSize: FontSize.base, color: Colors.textSecondary, lineHeight: 24 },
  ctaBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: Colors.primary, borderRadius: Radius.full, paddingVertical: 14,
  },
  ctaBtnText: { color: '#fff', fontWeight: '700', fontSize: FontSize.base },
  freeCtaBox: { backgroundColor: Colors.primaryBg, borderRadius: Radius.lg, padding: Spacing.md, alignItems: 'center' },
  freeCtaText: { color: Colors.primary, fontWeight: '600', fontSize: FontSize.base },
});
