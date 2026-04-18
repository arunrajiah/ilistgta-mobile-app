import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
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
    try {
      await Clipboard.setStringAsync(coupon.code);
    } catch {
      try {
        await navigator.clipboard.writeText(coupon.code);
      } catch {
        Alert.alert('Copy failed', 'Please copy the code manually: ' + coupon.code);
        return;
      }
    }
    try { await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); } catch {}
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  }

  const expiryStr = coupon.end_date
    ? `Expires ${new Intl.DateTimeFormat('en-CA', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(coupon.end_date))}`
    : 'No expiry';

  return (
    <View style={[s.card, coupon.is_featured && s.featured]}>
      {coupon.is_featured && (
        <View style={s.featuredBanner}>
          <Ionicons name="star" size={12} color="#fff" />
          <Text style={s.featuredText}>FEATURED DEAL</Text>
        </View>
      )}

      <View style={s.body}>
        {/* Discount badge */}
        <View style={s.discountBadge}>
          <Text style={s.discountText}>{discount}</Text>
          <Text style={s.discountOff}>OFF</Text>
        </View>

        {/* Content */}
        <View style={s.content}>
          <Text style={s.title} numberOfLines={2}>{coupon.title}</Text>
          {coupon.business_listings && (
            <View style={s.bizRow}>
              <Ionicons name="storefront-outline" size={12} color={Colors.primary} />
              <Text style={s.bizName} numberOfLines={1}>{coupon.business_listings.name}</Text>
            </View>
          )}
          <Text style={s.description} numberOfLines={2}>{coupon.description}</Text>
          <View style={s.expiryRow}>
            <Ionicons name="time-outline" size={12} color={Colors.textMuted} />
            <Text style={s.expiry}>{expiryStr}</Text>
          </View>
        </View>
      </View>

      {/* Code row */}
      {coupon.code && (
        <TouchableOpacity style={s.codeRow} onPress={copyCode} activeOpacity={0.7}>
          <View style={s.codeDashed}>
            <Text style={s.codeText}>{coupon.code}</Text>
          </View>
          <View style={[s.copyBtn, copied && s.copiedBtn]}>
            <Ionicons
              name={copied ? 'checkmark' : 'copy-outline'}
              size={14}
              color="#fff"
            />
            <Text style={s.copyBtnText}>{copied ? 'Copied!' : 'Copy'}</Text>
          </View>
        </TouchableOpacity>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    overflow: 'hidden',
    ...Shadow.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  featured: { borderColor: Colors.primary, borderWidth: 2 },
  featuredBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: Colors.primary,
    paddingVertical: 6, paddingHorizontal: Spacing.md,
  },
  featuredText: { color: '#fff', fontSize: FontSize.xs, fontWeight: '700', letterSpacing: 0.5 },
  body: { flexDirection: 'row', padding: Spacing.md, gap: Spacing.md },
  discountBadge: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.lg,
    width: 72, height: 72,
    justifyContent: 'center', alignItems: 'center',
    flexShrink: 0,
  },
  discountText: { color: '#fff', fontSize: FontSize.md, fontWeight: '800', textAlign: 'center' },
  discountOff: { color: 'rgba(255,255,255,0.8)', fontSize: FontSize.xs, fontWeight: '600' },
  content: { flex: 1, gap: 4 },
  title: { fontSize: FontSize.base, fontWeight: '700', color: Colors.text },
  bizRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  bizName: { fontSize: FontSize.xs, color: Colors.primary, fontWeight: '600', flex: 1 },
  description: { fontSize: FontSize.sm, color: Colors.textSecondary, lineHeight: 18 },
  expiryRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  expiry: { fontSize: FontSize.xs, color: Colors.textMuted },
  codeRow: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: Spacing.md, paddingBottom: Spacing.md,
  },
  codeDashed: {
    flex: 1, borderWidth: 1.5, borderColor: Colors.primary,
    borderStyle: 'dashed', borderRadius: Radius.md,
    paddingVertical: 8, paddingHorizontal: 12,
  },
  codeText: { color: Colors.primary, fontWeight: '700', letterSpacing: 1.5, fontSize: FontSize.base },
  copyBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: Colors.primary, borderRadius: Radius.md,
    paddingVertical: 8, paddingHorizontal: 14,
  },
  copiedBtn: { backgroundColor: Colors.success },
  copyBtnText: { color: '#fff', fontWeight: '700', fontSize: FontSize.sm },
});
