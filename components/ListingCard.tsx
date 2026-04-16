import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Radius, Shadow, Spacing, FontSize } from '@/constants/theme';
import { Listing } from '@/lib/types';
import { getPrimaryImage } from '@/lib/api';

interface Props {
  listing: Listing;
  onPress: () => void;
  horizontal?: boolean;
}

export default React.memo(function ListingCard({ listing, onPress, horizontal }: Props) {
  const imageUrl = getPrimaryImage(listing.listing_images) ??
    `https://picsum.photos/seed/${listing.slug}/400/300`;

  if (horizontal) {
    return (
      <TouchableOpacity style={[styles.card, styles.horizontal]} onPress={onPress} activeOpacity={0.85}>
        <Image source={{ uri: imageUrl }} style={styles.hImage} />
        <View style={styles.hBody}>
          {listing.categories && (
            <Text style={styles.categoryLabel}>{listing.categories.icon} {listing.categories.name}</Text>
          )}
          <Text style={styles.name} numberOfLines={1}>{listing.name}</Text>
          <Text style={styles.address} numberOfLines={1}>📍 {listing.city}</Text>
          <View style={styles.ratingRow}>
            {listing.review_count > 0 && (
              <>
                <Ionicons name="star" size={13} color={Colors.star} />
                <Text style={styles.ratingText}>{Number(listing.avg_rating).toFixed(1)}</Text>
                <Text style={styles.reviewCount}>({listing.review_count})</Text>
              </>
            )}
            {listing.is_verified && (
              <View style={styles.verifiedBadge}>
                <Text style={styles.verifiedText}>✓ Verified</Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
      <View style={styles.imageContainer}>
        <Image source={{ uri: imageUrl }} style={styles.image} />
        {listing.is_featured && (
          <View style={styles.featuredBadge}>
            <Text style={styles.featuredText}>⭐ Featured</Text>
          </View>
        )}
      </View>
      <View style={styles.body}>
        {listing.categories && (
          <Text style={styles.categoryLabel}>{listing.categories.icon} {listing.categories.name}</Text>
        )}
        <Text style={styles.name} numberOfLines={2}>{listing.name}</Text>
        <Text style={styles.description} numberOfLines={2}>{listing.short_description}</Text>
        <Text style={styles.address} numberOfLines={1}>📍 {listing.address ?? listing.city}</Text>
        <View style={styles.ratingRow}>
          {listing.review_count > 0 && (
            <>
              <Ionicons name="star" size={13} color={Colors.star} />
              <Text style={styles.ratingText}>{Number(listing.avg_rating).toFixed(1)}</Text>
              <Text style={styles.reviewCount}>({listing.review_count} reviews)</Text>
            </>
          )}
          {listing.is_verified && (
            <View style={styles.verifiedBadge}>
              <Text style={styles.verifiedText}>✓</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    overflow: 'hidden',
    ...Shadow.md,
    marginBottom: Spacing.md,
  },
  horizontal: {
    flexDirection: 'row',
    width: 300,
    marginBottom: 0,
    marginRight: Spacing.md,
  },
  imageContainer: { position: 'relative' },
  image: { width: '100%', height: 180, resizeMode: 'cover', backgroundColor: Colors.border },
  hImage: { width: 110, height: '100%', resizeMode: 'cover', backgroundColor: Colors.border },
  featuredBadge: {
    position: 'absolute', top: 8, left: 8,
    backgroundColor: 'rgba(0,0,0,0.65)',
    borderRadius: Radius.full, paddingHorizontal: 10, paddingVertical: 4,
  },
  featuredText: { color: '#fff', fontSize: FontSize.xs, fontWeight: '600' },
  body: { padding: Spacing.md },
  hBody: { flex: 1, padding: Spacing.sm },
  categoryLabel: { fontSize: FontSize.xs, color: Colors.primary, fontWeight: '600', marginBottom: 4 },
  name: { fontSize: FontSize.md, fontWeight: '700', color: Colors.text, marginBottom: 4 },
  description: { fontSize: FontSize.sm, color: Colors.textSecondary, marginBottom: 6, lineHeight: 19 },
  address: { fontSize: FontSize.sm, color: Colors.textMuted, marginBottom: 8 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  ratingText: { fontSize: FontSize.sm, fontWeight: '700', color: Colors.text },
  reviewCount: { fontSize: FontSize.xs, color: Colors.textMuted },
  verifiedBadge: {
    backgroundColor: Colors.primaryBg, borderRadius: Radius.full,
    paddingHorizontal: 6, paddingVertical: 2, marginLeft: 4,
  },
  verifiedText: { fontSize: FontSize.xs, color: Colors.primary, fontWeight: '600' },
});
