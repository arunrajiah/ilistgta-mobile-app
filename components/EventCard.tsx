import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Colors, Radius, Shadow, Spacing, FontSize } from '@/constants/theme';
import { Event } from '@/lib/types';
import { formatDate } from '@/lib/api';

interface Props {
  event: Event;
  onPress: () => void;
}

export default function EventCard({ event, onPress }: Props) {
  const imageUrl = event.image_url ?? `https://picsum.photos/seed/${event.slug}/400/200`;
  const startDate = new Date(event.start_date);
  const month = startDate.toLocaleString('default', { month: 'short' }).toUpperCase();
  const day   = startDate.getDate();

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
      <Image source={{ uri: imageUrl }} style={styles.image} />
      <View style={styles.dateBadge}>
        <Text style={styles.dateMonth}>{month}</Text>
        <Text style={styles.dateDay}>{day}</Text>
      </View>
      <View style={styles.body}>
        {event.categories && (
          <Text style={styles.category}>{event.categories.icon} {event.categories.name}</Text>
        )}
        <Text style={styles.title} numberOfLines={2}>{event.title}</Text>
        <View style={styles.meta}>
          <Text style={styles.metaText}>📍 {event.city}</Text>
          {event.is_free
            ? <View style={styles.freeBadge}><Text style={styles.freeBadgeText}>FREE</Text></View>
            : <Text style={styles.price}>${event.price}</Text>
          }
          {event.is_online && (
            <View style={styles.onlineBadge}><Text style={styles.onlineBadgeText}>🌐 Online</Text></View>
          )}
        </View>
        <Text style={styles.date}>{formatDate(event.start_date)}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface, borderRadius: Radius.lg,
    overflow: 'hidden', ...Shadow.md, marginBottom: Spacing.md,
  },
  image: { width: '100%', height: 160, resizeMode: 'cover', backgroundColor: Colors.border },
  dateBadge: {
    position: 'absolute', top: 12, right: 12,
    backgroundColor: Colors.primary, borderRadius: Radius.md,
    paddingHorizontal: 10, paddingVertical: 6, alignItems: 'center',
  },
  dateMonth: { color: '#fff', fontSize: FontSize.xs, fontWeight: '600' },
  dateDay: { color: '#fff', fontSize: FontSize.lg, fontWeight: '800', lineHeight: 24 },
  body: { padding: Spacing.md },
  category: { fontSize: FontSize.xs, color: Colors.primary, fontWeight: '600', marginBottom: 4 },
  title: { fontSize: FontSize.md, fontWeight: '700', color: Colors.text, marginBottom: 8 },
  meta: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 8, marginBottom: 6 },
  metaText: { fontSize: FontSize.sm, color: Colors.textMuted },
  freeBadge: {
    backgroundColor: '#dcfce7', borderRadius: Radius.full, paddingHorizontal: 8, paddingVertical: 2,
  },
  freeBadgeText: { color: '#166534', fontSize: FontSize.xs, fontWeight: '700' },
  price: { fontSize: FontSize.sm, fontWeight: '700', color: Colors.primary },
  onlineBadge: {
    backgroundColor: '#eff6ff', borderRadius: Radius.full, paddingHorizontal: 8, paddingVertical: 2,
  },
  onlineBadgeText: { color: '#1d4ed8', fontSize: FontSize.xs, fontWeight: '600' },
  date: { fontSize: FontSize.xs, color: Colors.textMuted },
});
