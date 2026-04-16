import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import { Colors, Radius, Shadow, Spacing, FontSize } from '@/constants/theme';
import { Coupon } from '@/lib/types';
import { formatDiscount } from '@/lib/api';

interface Props {
  coupon: Coupon;
}

export default function CouponCard({ coupon }: Props) {
  const [copied, setCopied] = useState(false);

  const discount = formatDiscount(coupon.discount_type, coupon.discount_value);

  async function copyCode() {
    if (!coupon.code) return;
    await Clipboard.setStringAsync(coupon.code);
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  }

  const expiryStr = coupon.end_date
    ? `Expires ${new Intl.DateTimeFormat('en-CA', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(coupon.end_date))}`
    : 'No expiry';

  return (
    <View style={[styles.card, coupon.is_featured && styles.featured]}>
      {coupon.is_featured && (
        <View style={styles.featuredBanner}>
          <Text style={styles.featuredText}>⭐ FEATURED DEAL</Text>
        </View>
      )}
      <View style={styles.body}>
        <View style={styles.discountBadge}>
          <Text style={styles.discountText}>{discount}</Text>
        </View>
        <View style={styles.content}>
          <Text style={styles.title} numberOfLines={2}>{coupon.title}</Text>
          {coupon.business_listings && (
            <Text style={styles.business}>🏪 {coupon.business_listings.name}</Text>
          )}
          <Text style={styles.description} numberOfLines={2}>{coupon.description}</Text>
          <Text style={styles.expiry}>{expiryStr}</Text>
        </View>
      </View>
      {coupon.code && (
        <TouchableOpacity style={styles.codeRow} onPress={copyCode} activeOpacity={0.7}>
          <View style={styles.codeDashed}>
            <Text style={styles.codeText}>{coupon.code}</Text>
          </View>
          <View style={[styles.copyBtn, copied && styles.copiedBtn]}>
            <Text style={styles.copyBtnText}>{copied ? '✓ Copied!' : 'Copy Code'}</Text>
          </View>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface, borderRadius: Radius.lg,
    overflow: 'hidden', ...Shadow.md, marginBottom: Spacing.md,
    borderWidth: 1, borderColor: Colors.border,
  },
  featured: { borderColor: Colors.primary, borderWidth: 2 },
  featuredBanner: {
    backgroundColor: Colors.primary, paddingVertical: 4, paddingHorizontal: Spacing.md,
  },
  featuredText: { color: '#fff', fontSize: FontSize.xs, fontWeight: '700', letterSpacing: 0.5 },
  body: { flexDirection: 'row', padding: Spacing.md, gap: Spacing.md },
  discountBadge: {
    backgroundColor: Colors.primary, borderRadius: Radius.md,
    width: 72, height: 72, justifyContent: 'center', alignItems: 'center',
    flexShrink: 0,
  },
  discountText: { color: '#fff', fontSize: FontSize.sm, fontWeight: '800', textAlign: 'center' },
  content: { flex: 1 },
  title: { fontSize: FontSize.base, fontWeight: '700', color: Colors.text, marginBottom: 2 },
  business: { fontSize: FontSize.sm, color: Colors.primary, marginBottom: 4 },
  description: { fontSize: FontSize.sm, color: Colors.textSecondary, lineHeight: 18, marginBottom: 4 },
  expiry: { fontSize: FontSize.xs, color: Colors.textMuted },
  codeRow: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: Spacing.md, paddingBottom: Spacing.md,
  },
  codeDashed: {
    flex: 1, borderWidth: 1.5, borderColor: Colors.primary, borderStyle: 'dashed',
    borderRadius: Radius.sm, paddingVertical: 8, paddingHorizontal: 12,
  },
  codeText: { color: Colors.primary, fontWeight: '700', letterSpacing: 1, fontSize: FontSize.base },
  copyBtn: {
    backgroundColor: Colors.primary, borderRadius: Radius.sm,
    paddingVertical: 8, paddingHorizontal: 14,
  },
  copiedBtn: { backgroundColor: Colors.success },
  copyBtnText: { color: '#fff', fontWeight: '700', fontSize: FontSize.sm },
});
