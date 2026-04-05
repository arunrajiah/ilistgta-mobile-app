import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  Alert, ActivityIndicator, Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import type { Href } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/lib/auth';
import { getMyListings, getMySaved } from '@/lib/api';
import { Colors, FontSize, Radius, Shadow, Spacing } from '@/constants/theme';

export default function ProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user, session, signOut, loading } = useAuth();
  const [myListings, setMyListings] = useState<number>(0);
  const [mySaved, setMySaved] = useState<number>(0);
  const [statsLoading, setStatsLoading] = useState(false);

  useEffect(() => {
    if (session?.access_token) {
      setStatsLoading(true);
      Promise.all([
        getMyListings(session.access_token),
        getMySaved(session.access_token),
      ]).then(([l, s]) => {
        setMyListings(l.listings.length);
        setMySaved(s.saved.length);
      }).catch(console.error).finally(() => setStatsLoading(false));
    }
  }, [session]);

  async function handleSignOut() {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out', style: 'destructive',
        onPress: async () => { try { await signOut(); } catch (e) { Alert.alert('Error', 'Failed to sign out'); } },
      },
    ]);
  }

  if (loading) {
    return <View style={styles.loader}><ActivityIndicator size="large" color={Colors.primary} /></View>;
  }

  // Guest state
  if (!user) {
    return (
      <View style={[styles.container, { paddingTop: insets.top + 20 }]}>
        <View style={styles.guestHero}>
          <View style={styles.avatarPlaceholder}>
            <Ionicons name="person" size={48} color={Colors.textMuted} />
          </View>
          <Text style={styles.guestTitle}>Welcome to iListGTA</Text>
          <Text style={styles.guestSub}>Sign in to save businesses, track your listings, and more.</Text>
          <TouchableOpacity style={styles.signInBtn} onPress={() => router.push('/auth/login')}>
            <Text style={styles.signInBtnText}>Sign In</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.registerBtn} onPress={() => router.push('/auth/register')}>
            <Text style={styles.registerBtnText}>Create Account</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const displayName = user.user_metadata?.full_name ?? user.email?.split('@')[0] ?? 'User';
  const avatarUrl = user.user_metadata?.avatar_url;

  const menuItems = [
    { icon: 'bookmark-outline', label: 'Saved Businesses', count: mySaved, onPress: () => router.push('/saved' as Href) },
    { icon: 'business-outline', label: 'My Listings', count: myListings, onPress: () => router.push('/my-listings' as Href) },
    { icon: 'mail-outline', label: 'Enquiries', onPress: () => router.push('/enquiries' as Href) },
    { icon: 'settings-outline', label: 'Account Settings', onPress: () => router.push('/account-settings' as Href) },
    { icon: 'help-circle-outline', label: 'Help & Support', onPress: () => router.push('/help' as Href) },
    { icon: 'information-circle-outline', label: 'About iListGTA', onPress: () => router.push('/about' as Href) },
  ];


  return (
    <ScrollView style={[styles.container, { paddingTop: insets.top }]} showsVerticalScrollIndicator={false}>
      {/* Profile header */}
      <View style={styles.profileHeader}>
        {avatarUrl
          ? <Image source={{ uri: avatarUrl }} style={styles.avatar} />
          : (
            <View style={styles.avatarFallback}>
              <Text style={styles.avatarInitial}>{displayName[0].toUpperCase()}</Text>
            </View>
          )
        }
        <Text style={styles.displayName}>{displayName}</Text>
        <Text style={styles.email}>{user.email}</Text>
      </View>

      {/* Stats */}
      <View style={styles.statsRow}>
        <View style={styles.statBox}>
          {statsLoading ? <ActivityIndicator color={Colors.primary} />
            : <Text style={styles.statNumber}>{myListings}</Text>}
          <Text style={styles.statLabel}>Listings</Text>
        </View>
        <View style={[styles.statBox, styles.statBoxBorder]}>
          {statsLoading ? <ActivityIndicator color={Colors.primary} />
            : <Text style={styles.statNumber}>{mySaved}</Text>}
          <Text style={styles.statLabel}>Saved</Text>
        </View>
      </View>

      {/* Quick Actions */}
      <TouchableOpacity
        style={styles.addListingCard}
        onPress={() => router.push('/listing/new' as Href)}
        activeOpacity={0.85}
      >
        <View style={styles.addListingIconWrap}>
          <Ionicons name="add-circle" size={28} color={Colors.primary} />
        </View>
        <View style={styles.addListingText}>
          <Text style={styles.addListingTitle}>Add a Listing</Text>
          <Text style={styles.addListingSubtitle}>Submit your business to iListGTA</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={Colors.primary} />
      </TouchableOpacity>

      {/* Menu */}
      <View style={styles.menu}>
        {menuItems.map((item, i) => (
          <TouchableOpacity key={i} style={styles.menuItem} onPress={item.onPress} activeOpacity={0.7}>
            <Ionicons name={item.icon as any} size={22} color={Colors.primary} />
            <Text style={styles.menuLabel}>{item.label}</Text>
            <View style={styles.menuRight}>
              {item.count !== undefined && (
                <View style={styles.countBadge}><Text style={styles.countText}>{item.count}</Text></View>
              )}
              <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* Sign out */}
      <TouchableOpacity style={styles.signOutBtn} onPress={handleSignOut}>
        <Ionicons name="log-out-outline" size={20} color={Colors.error} />
        <Text style={styles.signOutText}>Sign Out</Text>
      </TouchableOpacity>

      <View style={{ height: Spacing.xxl }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.surfaceSecondary },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  guestHero: { alignItems: 'center', padding: Spacing.xl },
  avatarPlaceholder: {
    width: 100, height: 100, borderRadius: 50,
    backgroundColor: Colors.border, justifyContent: 'center', alignItems: 'center', marginBottom: Spacing.lg,
  },
  guestTitle: { fontSize: FontSize.xl, fontWeight: '800', color: Colors.text, marginBottom: 8 },
  guestSub: { fontSize: FontSize.base, color: Colors.textSecondary, textAlign: 'center', marginBottom: Spacing.xl, lineHeight: 22 },
  signInBtn: {
    width: '100%', backgroundColor: Colors.primary, borderRadius: Radius.full,
    paddingVertical: 14, alignItems: 'center', marginBottom: Spacing.sm,
  },
  signInBtnText: { color: '#fff', fontWeight: '700', fontSize: FontSize.base },
  registerBtn: {
    width: '100%', borderWidth: 2, borderColor: Colors.primary, borderRadius: Radius.full,
    paddingVertical: 14, alignItems: 'center',
  },
  registerBtnText: { color: Colors.primary, fontWeight: '700', fontSize: FontSize.base },
  profileHeader: { backgroundColor: Colors.surface, alignItems: 'center', padding: Spacing.xl, ...Shadow.sm },
  avatar: { width: 90, height: 90, borderRadius: 45, marginBottom: Spacing.md },
  avatarFallback: {
    width: 90, height: 90, borderRadius: 45, backgroundColor: Colors.primary,
    justifyContent: 'center', alignItems: 'center', marginBottom: Spacing.md,
  },
  avatarInitial: { color: '#fff', fontSize: FontSize.xxl, fontWeight: '800' },
  displayName: { fontSize: FontSize.lg, fontWeight: '800', color: Colors.text },
  email: { fontSize: FontSize.sm, color: Colors.textMuted, marginTop: 2 },
  statsRow: { flexDirection: 'row', backgroundColor: Colors.surface, marginTop: 1 },
  statBox: { flex: 1, alignItems: 'center', paddingVertical: Spacing.md },
  statBoxBorder: { borderLeftWidth: 1, borderLeftColor: Colors.border },
  statNumber: { fontSize: FontSize.xl, fontWeight: '800', color: Colors.primary },
  statLabel: { fontSize: FontSize.xs, color: Colors.textMuted, marginTop: 2 },
  addListingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primaryBg,
    marginHorizontal: Spacing.md,
    marginTop: Spacing.md,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: '#c3e0c3',
    gap: Spacing.md,
    ...Shadow.sm,
  },
  addListingIconWrap: {
    width: 44,
    height: 44,
    borderRadius: Radius.md,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadow.sm,
  },
  addListingText: { flex: 1 },
  addListingTitle: { fontSize: FontSize.base, fontWeight: '700', color: Colors.primary },
  addListingSubtitle: { fontSize: FontSize.xs, color: Colors.textSecondary, marginTop: 2 },
  menu: { backgroundColor: Colors.surface, marginTop: Spacing.md, marginHorizontal: Spacing.md, borderRadius: Radius.lg, overflow: 'hidden', ...Shadow.sm },
  menuItem: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.md,
    paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: Colors.borderLight, gap: Spacing.md,
  },
  menuLabel: { flex: 1, fontSize: FontSize.base, color: Colors.text, fontWeight: '500' },
  menuRight: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  countBadge: { backgroundColor: Colors.primaryBg, borderRadius: Radius.full, paddingHorizontal: 8, paddingVertical: 2 },
  countText: { fontSize: FontSize.xs, color: Colors.primary, fontWeight: '700' },
  signOutBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    margin: Spacing.md, padding: Spacing.md, backgroundColor: Colors.surface,
    borderRadius: Radius.lg, borderWidth: 1, borderColor: '#fecaca',
  },
  signOutText: { color: Colors.error, fontWeight: '700', fontSize: FontSize.base },
});
