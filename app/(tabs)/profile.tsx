import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  Alert, ActivityIndicator, Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import type { Href } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/lib/auth';
import { getMyListings, getMySaved } from '@/lib/api';
import { Colors, FontSize, Radius, Shadow, Spacing } from '@/constants/theme';
import { useLang } from '@/lib/i18n';

type MenuItem = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  count?: number;
  onPress: () => void;
  danger?: boolean;
};
type MenuSection = { title: string; items: MenuItem[] };

export default function ProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user, session, signOut, loading } = useAuth();
  const { t, lang, setLang } = useLang();
  const [myListings, setMyListings] = useState(0);
  const [mySaved, setMySaved] = useState(0);
  const [statsLoading, setStatsLoading] = useState(false);

  useEffect(() => {
    if (session?.access_token) {
      setStatsLoading(true);
      Promise.all([
        getMyListings(session.access_token),
        getMySaved(session.access_token),
      ]).then(([l, sv]) => {
        setMyListings(l.listings.length);
        setMySaved(sv.saved.length);
      }).catch(console.error).finally(() => setStatsLoading(false));
    }
  }, [session]);

  async function handleSignOut() {
    Alert.alert(t('auth.signOut'), t('auth.signOutConfirm'), [
      { text: t('auth.cancel'), style: 'cancel' },
      {
        text: t('auth.signOut'), style: 'destructive',
        onPress: async () => {
          try { await signOut(); }
          catch { Alert.alert(t('auth.error'), 'Failed to sign out'); }
        },
      },
    ]);
  }

  if (loading) {
    return (
      <View style={s.loader}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  /* ── Guest screen ──────────────────────────────────────────── */
  if (!user) {
    return (
      <View style={[s.container, { paddingTop: insets.top }]}>
        <LinearGradient colors={[Colors.primary, Colors.primaryDark]} style={s.guestHeader}>
          <View style={s.guestAvatarWrap}>
            <Ionicons name="person" size={44} color="rgba(255,255,255,0.7)" />
          </View>
          <Text style={s.guestTitle}>{t('profile.welcome')}</Text>
          <Text style={s.guestSub}>{t('profile.signInPrompt')}</Text>
        </LinearGradient>

        <View style={s.guestActions}>
          <TouchableOpacity style={s.signInBtn} onPress={() => router.push('/auth/login')}>
            <Ionicons name="log-in-outline" size={20} color="#fff" />
            <Text style={s.signInBtnText}>{t('auth.signIn')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.registerBtn} onPress={() => router.push('/auth/register')}>
            <Ionicons name="person-add-outline" size={20} color={Colors.primary} />
            <Text style={s.registerBtnText}>{t('auth.createAccount')}</Text>
          </TouchableOpacity>
        </View>

        <View style={s.guestMenuCard}>
          {[
            { icon: 'search-outline' as const, label: 'Browse Businesses', onPress: () => router.push('/(tabs)/explore') },
            { icon: 'calendar-outline' as const, label: 'Upcoming Events', onPress: () => router.push('/(tabs)/events') },
            { icon: 'pricetag-outline' as const, label: 'Hot Deals', onPress: () => router.push('/(tabs)/coupons') },
            { icon: 'information-circle-outline' as const, label: t('profile.about'), onPress: () => router.push('/about') },
            { icon: 'help-circle-outline' as const, label: t('profile.help'), onPress: () => router.push('/help') },
          ].map((item, i) => (
            <TouchableOpacity key={i} style={s.menuItem} onPress={item.onPress} activeOpacity={0.7}>
              <View style={s.menuIconWrap}>
                <Ionicons name={item.icon} size={20} color={Colors.primary} />
              </View>
              <Text style={s.menuLabel}>{item.label}</Text>
              <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  }

  /* ── Signed-in screen ─────────────────────────────────────── */
  const displayName = user.user_metadata?.full_name ?? user.email?.split('@')[0] ?? 'User';
  const avatarUrl = user.user_metadata?.avatar_url;
  const isVendor = user.app_metadata?.role === 'vendor' || user.user_metadata?.role === 'vendor';

  const sections: MenuSection[] = [
    {
      title: 'My Activity',
      items: [
        { icon: 'bookmark-outline', label: t('profile.savedBusinesses'), count: mySaved, onPress: () => router.push('/saved' as Href) },
        { icon: 'business-outline', label: t('profile.myListings'), count: myListings, onPress: () => router.push('/my-listings' as Href) },
        { icon: 'mail-outline', label: t('profile.myEnquiries'), onPress: () => router.push('/enquiries' as Href) },
      ],
    },
    {
      title: 'General',
      items: [
        { icon: 'chatbubbles-outline', label: 'Q&A Participation', onPress: () => {} },
        { icon: 'star-outline', label: 'Ratings & Review', onPress: () => {} },
        { icon: 'headset-outline', label: 'Customer Support', onPress: () => router.push('/help' as Href) },
        { icon: 'help-circle-outline', label: 'Help & Feedback', onPress: () => router.push('/help' as Href) },
        { icon: 'information-circle-outline', label: t('profile.about'), onPress: () => router.push('/about' as Href) },
      ],
    },
    {
      title: 'Options',
      items: [
        { icon: 'newspaper-outline', label: 'Newsletter', onPress: () => {} },
        { icon: 'chatbubble-outline', label: 'Text Messages', onPress: () => {} },
        { icon: 'call-outline', label: 'Phone Calls', onPress: () => {} },
      ],
    },
    ...(isVendor ? [{
      title: 'Vendor Tools',
      items: [
        { icon: 'storefront-outline' as const, label: t('profile.vendorProfile'), onPress: () => router.push('/vendor-profile' as Href) },
        { icon: 'calendar-outline' as const, label: t('profile.myEvents'), onPress: () => router.push('/my-events' as Href) },
        { icon: 'pricetags-outline' as const, label: t('profile.myCoupons'), onPress: () => router.push('/my-coupons' as Href) },
        { icon: 'bar-chart-outline' as const, label: t('profile.analytics'), onPress: () => router.push('/analytics' as Href) },
      ],
    }] : []),
    {
      title: 'Settings & Info',
      items: [
        { icon: 'settings-outline', label: t('profile.accountSettings'), onPress: () => router.push('/account-settings' as Href) },
        { icon: 'cash-outline', label: 'Currency: USD', onPress: () => {} },
        { icon: 'globe-outline', label: `Language: ${lang === 'en' ? 'English' : 'Tamil'}`, onPress: () => router.push('/onboarding/language' as any) },
        { icon: 'link-outline', label: 'Linked Accounts', onPress: () => {} },
        { icon: 'newspaper-outline', label: t('profile.blogArticles'), onPress: () => router.push('/blog' as Href) },
        { icon: 'chatbubble-ellipses-outline', label: t('profile.contact'), onPress: () => router.push('/contact' as Href) },
      ],
    },
    {
      title: 'More',
      items: [
        { icon: 'shield-outline', label: 'Privacy Policy', onPress: () => {} },
        { icon: 'accessibility-outline', label: 'Accessibility', onPress: () => {} },
        { icon: 'document-text-outline', label: 'Terms of Use', onPress: () => {} },
      ],
    },
  ];

  return (
    <ScrollView
      style={s.container}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: Spacing.xxl }}
    >
      {/* ── Profile Header ─────────────────────────────────── */}
      <LinearGradient
        colors={[Colors.primary, Colors.primaryDark]}
        style={[s.profileHeader, { paddingTop: insets.top + 16 }]}
      >
        {avatarUrl
          ? <Image source={{ uri: avatarUrl }} style={s.avatar} />
          : (
            <View style={s.avatarFallback}>
              <Text style={s.avatarInitial}>{displayName[0].toUpperCase()}</Text>
            </View>
          )
        }
        <Text style={s.displayName}>{displayName}</Text>
        <Text style={s.email}>{user.email}</Text>
        {isVendor && (
          <View style={s.vendorBadge}>
            <Ionicons name="storefront" size={12} color={Colors.primary} />
            <Text style={s.vendorBadgeText}>Vendor</Text>
          </View>
        )}
      </LinearGradient>

      {/* ── Stats row ──────────────────────────────────────── */}
      <View style={s.statsCard}>
        <View style={s.statBox}>
          {statsLoading
            ? <ActivityIndicator color={Colors.primary} />
            : <Text style={s.statNum}>{myListings}</Text>
          }
          <Text style={s.statLabel}>Listings</Text>
        </View>
        <View style={s.statDivider} />
        <View style={s.statBox}>
          {statsLoading
            ? <ActivityIndicator color={Colors.primary} />
            : <Text style={s.statNum}>{mySaved}</Text>
          }
          <Text style={s.statLabel}>Saved</Text>
        </View>
        <View style={s.statDivider} />
        <TouchableOpacity style={s.statBox} onPress={() => router.push('/listing/new' as Href)}>
          <View style={s.addListingIcon}>
            <Ionicons name="add" size={20} color={Colors.primary} />
          </View>
          <Text style={s.statLabel}>Add Listing</Text>
        </TouchableOpacity>
      </View>

      {/* ── Language toggle ────────────────────────────────── */}
      <View style={s.langCard}>
        <Text style={s.langLabel}>{t('profile.language')}</Text>
        <View style={s.langRow}>
          {(['en', 'ta'] as const).map(l => (
            <TouchableOpacity
              key={l}
              style={[s.langBtn, lang === l && s.langBtnActive]}
              onPress={() => setLang(l)}
              activeOpacity={0.8}
            >
              <Text style={[s.langBtnText, lang === l && s.langBtnTextActive]}>
                {l === 'en' ? 'English' : 'தமிழ்'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* ── Menu sections ──────────────────────────────────── */}
      {sections.map((section, si) => (
        <View key={si} style={s.menuSection}>
          <Text style={s.sectionLabel}>{section.title}</Text>
          <View style={s.menuCard}>
            {section.items.map((item, ii) => (
              <TouchableOpacity
                key={ii}
                style={[s.menuItem, ii < section.items.length - 1 && s.menuItemBorder]}
                onPress={item.onPress}
                activeOpacity={0.7}
              >
                <View style={s.menuIconWrap}>
                  <Ionicons name={item.icon} size={20} color={item.danger ? Colors.error : Colors.primary} />
                </View>
                <Text style={[s.menuLabel, item.danger && { color: Colors.error }]}>{item.label}</Text>
                <View style={s.menuRight}>
                  {item.count !== undefined && (
                    <View style={s.countBadge}>
                      <Text style={s.countText}>{item.count}</Text>
                    </View>
                  )}
                  <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      ))}

      {/* ── Sign out ───────────────────────────────────────── */}
      <TouchableOpacity style={s.signOutBtn} onPress={handleSignOut} activeOpacity={0.8}>
        <Ionicons name="log-out-outline" size={20} color={Colors.error} />
        <Text style={s.signOutText}>{t('auth.signOut')}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.surfaceSecondary },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  /* ── Guest ── */
  guestHeader: {
    alignItems: 'center',
    paddingBottom: Spacing.xl,
    paddingHorizontal: Spacing.lg,
  },
  guestAvatarWrap: {
    width: 88, height: 88, borderRadius: 44,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center', alignItems: 'center',
    marginBottom: Spacing.md,
    marginTop: Spacing.lg,
  },
  guestTitle: { fontSize: FontSize.xl, fontWeight: '800', color: '#fff', marginBottom: 6 },
  guestSub: { fontSize: FontSize.sm, color: 'rgba(255,255,255,0.8)', textAlign: 'center', lineHeight: 20 },
  guestActions: {
    flexDirection: 'row', gap: Spacing.sm,
    marginHorizontal: Spacing.md, marginTop: Spacing.md,
  },
  signInBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: Colors.primary, borderRadius: Radius.full, paddingVertical: 13,
  },
  signInBtnText: { color: '#fff', fontWeight: '700', fontSize: FontSize.base },
  registerBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: Colors.surface, borderRadius: Radius.full, paddingVertical: 13,
    borderWidth: 2, borderColor: Colors.primary,
  },
  registerBtnText: { color: Colors.primary, fontWeight: '700', fontSize: FontSize.base },
  guestMenuCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    marginHorizontal: Spacing.md, marginTop: Spacing.md,
    ...Shadow.sm,
  },

  /* ── Signed-in header ── */
  profileHeader: {
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xl + 8,
  },
  avatar: { width: 90, height: 90, borderRadius: 45, marginBottom: Spacing.md, borderWidth: 3, borderColor: 'rgba(255,255,255,0.4)' },
  avatarFallback: {
    width: 90, height: 90, borderRadius: 45,
    backgroundColor: 'rgba(255,255,255,0.25)',
    justifyContent: 'center', alignItems: 'center', marginBottom: Spacing.md,
  },
  avatarInitial: { color: '#fff', fontSize: FontSize.xxl, fontWeight: '800' },
  displayName: { fontSize: FontSize.lg, fontWeight: '800', color: '#fff', marginBottom: 4 },
  email: { fontSize: FontSize.sm, color: 'rgba(255,255,255,0.8)' },
  vendorBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: '#fff', borderRadius: Radius.full,
    paddingHorizontal: 10, paddingVertical: 4, marginTop: 8,
  },
  vendorBadgeText: { fontSize: FontSize.xs, color: Colors.primary, fontWeight: '700' },

  /* ── Stats ── */
  statsCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.surface,
    marginHorizontal: Spacing.md, marginTop: -20,
    borderRadius: Radius.xl, ...Shadow.md,
    overflow: 'hidden',
  },
  statBox: { flex: 1, alignItems: 'center', paddingVertical: 14 },
  statDivider: { width: 1, height: 36, backgroundColor: Colors.border },
  statNum: { fontSize: FontSize.xl, fontWeight: '800', color: Colors.primary, marginBottom: 2 },
  statLabel: { fontSize: FontSize.xs, color: Colors.textMuted, fontWeight: '500' },
  addListingIcon: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: Colors.primaryBg,
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 2,
  },

  /* ── Language ── */
  langCard: {
    backgroundColor: Colors.surface,
    marginHorizontal: Spacing.md, marginTop: Spacing.md,
    borderRadius: Radius.xl, padding: Spacing.md, ...Shadow.sm,
  },
  langLabel: { fontSize: FontSize.sm, fontWeight: '700', color: Colors.textMuted, marginBottom: Spacing.sm },
  langRow: { flexDirection: 'row', gap: Spacing.sm },
  langBtn: {
    flex: 1, paddingVertical: 10, borderRadius: Radius.md,
    alignItems: 'center', borderWidth: 1.5, borderColor: Colors.border,
    backgroundColor: Colors.surfaceSecondary,
  },
  langBtnActive: { borderColor: Colors.primary, backgroundColor: Colors.primaryBg },
  langBtnText: { fontSize: FontSize.base, fontWeight: '600', color: Colors.textMuted },
  langBtnTextActive: { color: Colors.primary },

  /* ── Menu ── */
  menuSection: { marginHorizontal: Spacing.md, marginTop: Spacing.md },
  sectionLabel: {
    fontSize: FontSize.xs, fontWeight: '700', color: Colors.textMuted,
    textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: Spacing.sm,
    marginLeft: 4,
  },
  menuCard: {
    backgroundColor: Colors.surface, borderRadius: Radius.xl, ...Shadow.sm, overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: Spacing.md, paddingVertical: 14, gap: Spacing.md,
  },
  menuItemBorder: { borderBottomWidth: 1, borderBottomColor: Colors.borderLight },
  menuIconWrap: {
    width: 36, height: 36, borderRadius: Radius.md,
    backgroundColor: Colors.primaryBg,
    justifyContent: 'center', alignItems: 'center',
  },
  menuLabel: { flex: 1, fontSize: FontSize.base, color: Colors.text, fontWeight: '500' },
  menuRight: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  countBadge: {
    backgroundColor: Colors.primaryBg, borderRadius: Radius.full,
    paddingHorizontal: 8, paddingVertical: 2,
  },
  countText: { fontSize: FontSize.xs, color: Colors.primary, fontWeight: '700' },

  /* ── Sign out ── */
  signOutBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    marginHorizontal: Spacing.md, marginTop: Spacing.md,
    paddingVertical: 14,
    backgroundColor: Colors.surface, borderRadius: Radius.xl,
    borderWidth: 1.5, borderColor: '#fecaca',
    ...Shadow.sm,
  },
  signOutText: { color: Colors.error, fontWeight: '700', fontSize: FontSize.base },
});
