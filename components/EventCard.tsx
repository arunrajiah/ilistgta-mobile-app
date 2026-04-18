import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Radius, Shadow, Spacing, FontSize } from '@/constants/theme';
import { Event } from '@/lib/types';
import { formatDate } from '@/lib/api';

interface Props {
  event: Event;
  onPress: () => void;
  /** compact = narrower card for horizontal scroll */
  compact?: boolean;
}

export default function EventCard({ event, onPress, compact }: Props) {
  const imageUrl = event.image_url ?? `https://picsum.photos/seed/${event.slug}/400/200`;
  const startDate = new Date(event.start_date);
  const month = startDate.toLocaleString('default', { month: 'short' }).toUpperCase();
  const day = startDate.getDate();

  if (compact) {
    return (
      <TouchableOpacity style={s.compactCard} onPress={onPress} activeOpacity={0.88}>
        <View style={s.compactImgWrap}>
          <Image source={{ uri: imageUrl }} style={s.compactImg} resizeMode="cover" />
          <View style={s.dateBadge}>
            <Text style={s.dateMonth}>{month}</Text>
            <Text style={s.dateDay}>{day}</Text>
          </View>
          {event.is_free && (
            <View style={s.freePill}>
              <Text style={s.freePillText}>FREE</Text>
            </View>
          )}
        </View>
        <View style={s.compactBody}>
          {event.categories && (
            <Text style={s.catPill} numberOfLines={1}>
              {event.categories.icon} {event.categories.name}
            </Text>
          )}
          <Text style={s.compactTitle} numberOfLines={2}>{event.title}</Text>
          <View style={s.locRow}>
            <Ionicons name="location-sharp" size={11} color={Colors.textMuted} />
            <Text style={s.locText} numberOfLines={1}>{event.city}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity style={s.card} onPress={onPress} activeOpacity={0.88}>
      {/* Image + overlays */}
      <View style={s.imgWrap}>
        <Image source={{ uri: imageUrl }} style={s.image} resizeMode="cover" />
        <View style={s.dateBadge}>
          <Text style={s.dateMonth}>{month}</Text>
          <Text style={s.dateDay}>{day}</Text>
        </View>
        {event.is_online && (
          <View style={s.onlineBadge}>
            <Ionicons name="globe-outline" size={11} color="#1d4ed8" />
            <Text style={s.onlineBadgeText}>Online</Text>
          </View>
        )}
      </View>

      {/* Body */}
      <View style={s.body}>
        {event.categories && (
          <Text style={s.catPill} numberOfLines={1}>
            {event.categories.icon} {event.categories.name}
          </Text>
        )}

        <Text style={s.title} numberOfLines={2}>{event.title}</Text>

        <View style={s.metaRow}>
          <View style={s.locRow}>
            <Ionicons name="location-sharp" size={13} color={Colors.textMuted} />
            <Text style={s.locText} numberOfLines={1}>{event.city}</Text>
          </View>

          {event.is_free ? (
            <View style={s.freeBadge}><Text style={s.freeBadgeText}>FREE</Text></View>
          ) : (
            <Text style={s.price}>${event.price}</Text>
          )}
        </View>

        <View style={s.dateRow}>
          <Ionicons name="calendar-outline" size={13} color={Colors.textMuted} />
          <Text style={s.dateText}>{formatDate(event.start_date)}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const s = StyleSheet.create({
  /* ── Full card ── */
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    overflow: 'hidden',
    ...Shadow.md,
    marginBottom: Spacing.md,
  },
  imgWrap: { position: 'relative' },
  image: { width: '100%', height: 160, backgroundColor: Colors.border },
  dateBadge: {
    position: 'absolute', top: 12, right: 12,
    backgroundColor: Colors.primary,
    borderRadius: Radius.md, paddingHorizontal: 10, paddingVertical: 6,
    alignItems: 'center', minWidth: 42,
  },
  dateMonth: { color: '#fff', fontSize: FontSize.xs, fontWeight: '600' },
  dateDay: { color: '#fff', fontSize: FontSize.lg, fontWeight: '800', lineHeight: 24 },
  onlineBadge: {
    position: 'absolute', bottom: 10, left: 10,
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: '#eff6ff',
    borderRadius: Radius.full, paddingHorizontal: 8, paddingVertical: 4,
  },
  onlineBadgeText: { color: '#1d4ed8', fontSize: FontSize.xs, fontWeight: '600' },
  body: { padding: Spacing.md, gap: 6 },
  catPill: {
    fontSize: FontSize.xs, color: Colors.primary, fontWeight: '600',
    backgroundColor: Colors.primaryBg, alignSelf: 'flex-start',
    paddingHorizontal: 8, paddingVertical: 3, borderRadius: Radius.full,
  },
  title: { fontSize: FontSize.md, fontWeight: '700', color: Colors.text },
  metaRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 2 },
  locRow: { flexDirection: 'row', alignItems: 'center', gap: 3, flex: 1 },
  locText: { fontSize: FontSize.xs, color: Colors.textMuted, flex: 1 },
  freeBadge: {
    backgroundColor: '#dcfce7', borderRadius: Radius.full, paddingHorizontal: 8, paddingVertical: 3,
  },
  freeBadgeText: { color: '#166534', fontSize: FontSize.xs, fontWeight: '700' },
  price: { fontSize: FontSize.sm, fontWeight: '700', color: Colors.primary },
  dateRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  dateText: { fontSize: FontSize.xs, color: Colors.textMuted },

  /* ── Compact ── */
  compactCard: {
    width: 190,
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    overflow: 'hidden',
    ...Shadow.md,
    marginRight: Spacing.md,
  },
  compactImgWrap: { position: 'relative' },
  compactImg: { width: '100%', height: 120, backgroundColor: Colors.border },
  freePill: {
    position: 'absolute', bottom: 8, left: 8,
    backgroundColor: '#dcfce7', borderRadius: Radius.full, paddingHorizontal: 8, paddingVertical: 3,
  },
  freePillText: { color: '#166534', fontSize: 10, fontWeight: '700' },
  compactBody: { padding: Spacing.sm, gap: 4 },
  compactTitle: { fontSize: FontSize.sm, fontWeight: '700', color: Colors.text },
});
