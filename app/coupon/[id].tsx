import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Clipboard from 'expo-clipboard';
import { Colors, FontSize, Radius, Spacing, Shadow } from '@/constants/theme';
import { getCoupons } from '@/lib/api';
import { Coupon } from '@/lib/types';

export default function CouponDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [coupon, setCoupon] = useState<Coupon | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    getCoupons({ limit: 100 })
      .then(data => {
        const found = data.coupons.find(c => c.id === id);
        setCoupon(found ?? null);
      })
      .catch(e => Alert.alert('Error', e.message))
      .finally(() => setLoading(false));
  }, [id]);

  async function handleCopy() {
    if (coupon?.code) {
      await Clipboard.setStringAsync(coupon.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  if (loading) return (
    <View style={[s.center, { paddingTop: insets.top }]}>
      <ActivityIndicator size="large" color={Colors.primary} />
    </View>
  );

  if (!coupon) return (
    <View style={[s.center, { paddingTop: insets.top }]}>
      <Ionicons name="alert-circle-outline" size={48} color={Colors.textMuted} />
      <Text style={s.notFound}>Coupon not found</Text>
      <TouchableOpacity style={s.backBtn2} onPress={() => router.back()}>
        <Text style={s.backBtn2Text}>Go Back</Text>
      </TouchableOpacity>
    </View>
  );

  const discount = coupon.discount_type === 'percentage'
    ? `${coupon.discount_value}% Off`
    : `$${coupon.discount_value} Off`;

  const TERMS = [
    coupon.end_date ? `Expires on ${coupon.end_date}` : null,
    'Valid for first-time customers only',
    'Cannot be combined with other promotions',
  ].filter(Boolean) as string[];

  return (
    <>
      <ScrollView style={[s.root]} showsVerticalScrollIndicator={false}>
        {/* Back + header */}
        <View style={[s.topBar, { paddingTop: insets.top + 8 }]}>
          <TouchableOpacity style={s.backBtn} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={22} color={Colors.text} />
          </TouchableOpacity>
          <Text style={s.screenTitle}>Coupon Details</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Hero banner */}
        <LinearGradient colors={[Colors.primary, Colors.primaryDark]} style={s.hero}>
          <View style={s.heroBadge}>
            <Text style={s.heroBadgeText}>Limited Time Offer</Text>
          </View>
          <Text style={s.heroDiscount}>{discount}</Text>
          <Text style={s.heroTitle}>{coupon.title}</Text>
          <Text style={s.heroSub}>Valid for all new residential bookings</Text>
        </LinearGradient>

        <View style={s.content}>
          {/* Code row */}
          {coupon.code && (
            <View style={s.codeCard}>
              <Text style={s.codeLabel}>Promo Code</Text>
              <View style={s.codeRow}>
                <Text style={s.code}>{coupon.code}</Text>
                <TouchableOpacity
                  style={[s.copyBtn, copied && s.copyBtnDone]}
                  onPress={handleCopy}
                  activeOpacity={0.85}
                >
                  <Ionicons name={copied ? 'checkmark' : 'copy-outline'} size={16} color={copied ? '#fff' : Colors.primary} />
                  <Text style={[s.copyBtnText, copied && { color: '#fff' }]}>
                    {copied ? 'Copied!' : 'Copy Code'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* About */}
          {coupon.description && (
            <View style={s.section}>
              <Text style={s.sectionTitle}>About this offer</Text>
              <Text style={s.bodyText}>{coupon.description}</Text>
            </View>
          )}

          {/* Terms */}
          {TERMS.length > 0 && (
            <View style={s.section}>
              <Text style={s.sectionTitle}>Terms & Conditions</Text>
              {TERMS.map((term, i) => (
                <View key={i} style={s.termRow}>
                  <View style={s.termDot} />
                  <Text style={s.termText}>{term}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Provided by */}
          {coupon.business_listings?.name && (
            <View style={s.section}>
              <Text style={s.sectionTitle}>Provided by</Text>
              <TouchableOpacity
                style={s.businessCard}
                onPress={() => coupon.business_listings?.slug && router.push(`/business/${coupon.business_listings.slug}`)}
                activeOpacity={0.85}
              >
                <View style={s.bizAvatar}>
                  <Text style={s.bizAvatarText}>{coupon.business_listings.name[0]?.toUpperCase()}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.bizName}>{coupon.business_listings.name}</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
              </TouchableOpacity>
            </View>
          )}

          {/* Eligible services placeholder */}
          <View style={[s.section, { paddingBottom: Spacing.xxl }]}>
            <Text style={s.sectionTitle}>Eligible Services</Text>
            <View style={s.serviceRow}>
              <View style={{ flex: 1 }}>
                <Text style={s.serviceName}>Deep Residential Cleaning</Text>
              </View>
              <Text style={s.servicePrice}>Starting at $150</Text>
            </View>
            <View style={s.serviceRow}>
              <View style={{ flex: 1 }}>
                <Text style={s.serviceName}>Post-Renovation Clean</Text>
              </View>
              <Text style={s.servicePrice}>Starting at $200</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Bottom CTA */}
      <View style={[s.bottomBar, { paddingBottom: insets.bottom + 12 }]}>
        <TouchableOpacity
          style={s.enquireBtn}
          onPress={() => coupon.business_listings?.slug && router.push(`/business/${coupon.business_listings.slug}`)}
          activeOpacity={0.85}
        >
          <Text style={s.enquireBtnText}>Enquire Now</Text>
        </TouchableOpacity>
      </View>
    </>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.surfaceSecondary },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: Spacing.md },
  notFound: { fontSize: FontSize.lg, fontWeight: '700', color: Colors.text },
  backBtn2: {
    backgroundColor: Colors.primary, borderRadius: Radius.full,
    paddingHorizontal: Spacing.xl, paddingVertical: 10,
  },
  backBtn2Text: { color: '#fff', fontWeight: '700' },

  topBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.md, paddingBottom: Spacing.md,
    backgroundColor: Colors.surface,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: Colors.surfaceSecondary,
    justifyContent: 'center', alignItems: 'center',
  },
  screenTitle: { fontSize: FontSize.base, fontWeight: '700', color: Colors.text },

  hero: {
    padding: Spacing.xl,
    gap: 8,
  },
  heroBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: Radius.full,
    paddingHorizontal: 12, paddingVertical: 4,
  },
  heroBadgeText: { color: '#fff', fontSize: FontSize.xs, fontWeight: '700' },
  heroDiscount: { fontSize: FontSize.xxxl, fontWeight: '900', color: '#fff' },
  heroTitle: { fontSize: FontSize.lg, fontWeight: '700', color: '#fff' },
  heroSub: { fontSize: FontSize.sm, color: 'rgba(255,255,255,0.8)' },

  content: { padding: Spacing.md, gap: 0 },

  codeCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    ...Shadow.sm,
  },
  codeLabel: { fontSize: FontSize.xs, color: Colors.textMuted, marginBottom: 8 },
  codeRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  code: {
    flex: 1, fontSize: FontSize.xl, fontWeight: '900',
    color: Colors.text, letterSpacing: 1.5,
  },
  copyBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 14, paddingVertical: 10,
    borderRadius: Radius.md, borderWidth: 1.5, borderColor: Colors.primary,
  },
  copyBtnDone: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  copyBtnText: { fontSize: FontSize.sm, fontWeight: '700', color: Colors.primary },

  section: { marginBottom: Spacing.lg },
  sectionTitle: { fontSize: FontSize.md, fontWeight: '800', color: Colors.text, marginBottom: Spacing.sm },
  bodyText: { fontSize: FontSize.base, color: Colors.textSecondary, lineHeight: 24 },

  termRow: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.sm, marginBottom: 8 },
  termDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.primary, marginTop: 7 },
  termText: { flex: 1, fontSize: FontSize.sm, color: Colors.textSecondary, lineHeight: 20 },

  businessCard: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.md,
    backgroundColor: Colors.surface, borderRadius: Radius.xl,
    padding: Spacing.md, ...Shadow.sm,
  },
  bizAvatar: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: Colors.primaryBg,
    justifyContent: 'center', alignItems: 'center',
  },
  bizAvatarText: { fontSize: FontSize.lg, fontWeight: '800', color: Colors.primary },
  bizName: { fontSize: FontSize.base, fontWeight: '700', color: Colors.text },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  rating: { fontSize: FontSize.sm, fontWeight: '700', color: Colors.text },

  serviceRow: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.md,
    backgroundColor: Colors.surface, borderRadius: Radius.lg,
    padding: Spacing.md, marginBottom: Spacing.sm, ...Shadow.sm,
  },
  serviceName: { fontSize: FontSize.base, fontWeight: '600', color: Colors.text },
  servicePrice: { fontSize: FontSize.sm, fontWeight: '700', color: Colors.primary },

  bottomBar: {
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.xl, paddingTop: Spacing.md,
    borderTopWidth: 1, borderTopColor: Colors.borderLight,
    ...Shadow.lg,
  },
  enquireBtn: {
    backgroundColor: Colors.primary, borderRadius: Radius.full,
    paddingVertical: 15, alignItems: 'center',
  },
  enquireBtnText: { color: '#fff', fontWeight: '700', fontSize: FontSize.base },
});
