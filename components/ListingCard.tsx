import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Radius, Shadow, Spacing, FontSize } from '@/constants/theme';
import { Listing } from '@/lib/types';
import { getPrimaryImage } from '@/lib/api';

interface Props {
  listing: Listing;
  onPress: () => void;
  /** horizontal = compact side-by-side card (home featured row) */
  horizontal?: boolean;
  /** compact = narrow card for horizontal featured scroll */
  compact?: boolean;
}

function Stars({ rating, count }: { rating: number; count: number }) {
  if (count === 0) return null;
  return (
    <View style={s.ratingRow}>
      <Ionicons name="star" size={12} color={Colors.star} />
      <Text style={s.ratingText}>{rating.toFixed(1)}</Text>
      <Text style={s.reviewCount}>({count})</Text>
    </View>
  );
}

export default React.memo(function ListingCard({ listing, onPress, horizontal, compact }: Props) {
  const imageUrl =
    getPrimaryImage(listing.listing_images) ??
    `https://picsum.photos/seed/${listing.slug}/400/300`;

  /* ── Compact card — for home "Featured" horizontal scroll ─── */
  if (compact) {
    return (
      <TouchableOpacity style={s.compactCard} onPress={onPress} activeOpacity={0.88}>
        <View style={s.compactImgWrap}>
          <Image source={{ uri: imageUrl }} style={s.compactImg} resizeMode="cover" />
          {listing.is_featured && (
            <View style={s.featuredPill}>
              <Ionicons name="star" size={10} color="#fff" />
              <Text style={s.featuredPillText}>Featured</Text>
            </View>
          )}
          {listing.categories && (
            <View style={s.compactCatOverlay}>
              <Text style={s.compactCatText} numberOfLines={1}>
                {listing.categories.icon} {listing.categories.name}
              </Text>
            </View>
          )}
        </View>
        <View style={s.compactBody}>
          <Text style={s.compactName} numberOfLines={2}>{listing.name}</Text>
          <View style={s.locRow}>
            <Ionicons name="location-sharp" size={11} color={Colors.textMuted} />
            <Text style={s.locText} numberOfLines={1}>{listing.city}</Text>
          </View>
          <Stars rating={Number(listing.avg_rating)} count={listing.review_count} />
        </View>
      </TouchableOpacity>
    );
  }

  /* ── Horizontal card — list row with image on left ──────────── */
  if (horizontal) {
    return (
      <TouchableOpacity style={s.hCard} onPress={onPress} activeOpacity={0.88}>
        <Image source={{ uri: imageUrl }} style={s.hImg} resizeMode="cover" />
        <View style={s.hBody}>
          {listing.categories && (
            <Text style={s.catPill} numberOfLines={1}>
              {listing.categories.icon} {listing.categories.name}
            </Text>
          )}
          <Text style={s.hName} numberOfLines={2}>{listing.name}</Text>
          <View style={s.locRow}>
            <Ionicons name="location-sharp" size={11} color={Colors.textMuted} />
            <Text style={s.locText} numberOfLines={1}>{listing.city}</Text>
          </View>
          <Stars rating={Number(listing.avg_rating)} count={listing.review_count} />
          {listing.is_verified && (
            <View style={s.verifiedRow}>
              <Ionicons name="checkmark-circle" size={12} color={Colors.primary} />
              <Text style={s.verifiedText}>Verified</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  }

  /* ── Vertical card — default full-width ─────────────────────── */
  return (
    <TouchableOpacity style={s.card} onPress={onPress} activeOpacity={0.88}>
      {/* Image block */}
      <View style={s.imgWrap}>
        <Image source={{ uri: imageUrl }} style={s.image} resizeMode="cover" />
        {listing.is_featured && (
          <View style={s.featuredBadge}>
            <Ionicons name="star" size={11} color="#fff" />
            <Text style={s.featuredBadgeText}>Featured</Text>
          </View>
        )}
        {listing.categories && (
          <View style={s.catOverlay}>
            <Text style={s.catOverlayText}>
              {listing.categories.icon} {listing.categories.name}
            </Text>
          </View>
        )}
      </View>

      {/* Text block */}
      <View style={s.body}>
        <Text style={s.name} numberOfLines={1}>{listing.name}</Text>

        {!!listing.short_description && (
          <Text style={s.desc} numberOfLines={2}>{listing.short_description}</Text>
        )}

        <View style={s.metaRow}>
          <View style={[s.locRow, { flex: 1 }]}>
            <Ionicons name="location-sharp" size={13} color={Colors.textMuted} />
            <Text style={s.locText} numberOfLines={1}>
              {listing.address ?? listing.city}
            </Text>
          </View>
          <Stars rating={Number(listing.avg_rating)} count={listing.review_count} />
        </View>

        {listing.is_verified && (
          <View style={s.verifiedRow}>
            <Ionicons name="checkmark-circle" size={12} color={Colors.primary} />
            <Text style={s.verifiedText}>Verified Business</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
});

const s = StyleSheet.create({
  /* ── Vertical ── */
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    overflow: 'hidden',
    ...Shadow.md,
    marginBottom: Spacing.md,
  },
  imgWrap: { position: 'relative' },
  image: { width: '100%', height: 190, backgroundColor: Colors.border },
  featuredBadge: {
    position: 'absolute', top: 10, left: 10,
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: Colors.primary,
    borderRadius: Radius.full, paddingHorizontal: 10, paddingVertical: 4,
  },
  featuredBadgeText: { color: '#fff', fontSize: FontSize.xs, fontWeight: '700' },
  catOverlay: {
    position: 'absolute', bottom: 10, left: 10,
    backgroundColor: 'rgba(0,0,0,0.55)',
    borderRadius: Radius.full, paddingHorizontal: 10, paddingVertical: 4,
  },
  catOverlayText: { color: '#fff', fontSize: FontSize.xs, fontWeight: '600' },
  body: { padding: Spacing.md, gap: 6 },
  name: { fontSize: FontSize.md, fontWeight: '700', color: Colors.text },
  desc: { fontSize: FontSize.sm, color: Colors.textSecondary, lineHeight: 19 },
  metaRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 2 },

  /* ── Shared ── */
  locRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  locText: { fontSize: FontSize.xs, color: Colors.textMuted, flex: 1 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  ratingText: { fontSize: FontSize.xs, fontWeight: '700', color: Colors.text },
  reviewCount: { fontSize: FontSize.xs, color: Colors.textMuted },
  catPill: {
    fontSize: FontSize.xs, color: Colors.primary, fontWeight: '600',
    backgroundColor: Colors.primaryBg, alignSelf: 'flex-start',
    paddingHorizontal: 8, paddingVertical: 3, borderRadius: Radius.full, marginBottom: 4,
  },
  verifiedRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  verifiedText: { fontSize: FontSize.xs, color: Colors.primary, fontWeight: '600' },

  /* ── Horizontal ── */
  hCard: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    overflow: 'hidden',
    ...Shadow.md,
    marginBottom: Spacing.md,
  },
  hImg: { width: 110, minHeight: 130, backgroundColor: Colors.border },
  hBody: { flex: 1, padding: Spacing.md, gap: 4, justifyContent: 'center' },
  hName: { fontSize: FontSize.base, fontWeight: '700', color: Colors.text },

  /* ── Compact ── */
  compactCard: {
    width: 200,
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    overflow: 'hidden',
    ...Shadow.md,
    marginRight: Spacing.md,
  },
  compactImgWrap: { position: 'relative' },
  compactImg: { width: '100%', height: 130, backgroundColor: Colors.border },
  featuredPill: {
    position: 'absolute', top: 8, right: 8,
    flexDirection: 'row', alignItems: 'center', gap: 3,
    backgroundColor: Colors.primary,
    borderRadius: Radius.full, paddingHorizontal: 8, paddingVertical: 3,
  },
  featuredPillText: { color: '#fff', fontSize: 10, fontWeight: '700' },
  compactCatOverlay: {
    position: 'absolute', bottom: 8, left: 8,
    backgroundColor: 'rgba(0,0,0,0.55)',
    borderRadius: Radius.full, paddingHorizontal: 8, paddingVertical: 3,
  },
  compactCatText: { color: '#fff', fontSize: 10, fontWeight: '600' },
  compactBody: { padding: Spacing.sm, gap: 4 },
  compactName: { fontSize: FontSize.sm, fontWeight: '700', color: Colors.text },
});
