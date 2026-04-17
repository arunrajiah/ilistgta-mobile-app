import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors, FontSize, Radius, Shadow, Spacing } from '@/constants/theme';
import ScreenHeader from '@/components/ScreenHeader';

export default function AboutScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <ScreenHeader title="About iListGTA" />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Logo / Hero */}
        <View style={styles.hero}>
          <View style={styles.logoCircle}>
            <Text style={styles.logoText}>iL</Text>
          </View>
          <Text style={styles.appName}>iListGTA</Text>
          <Text style={styles.version}>Version 1.0.0</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About the App</Text>
          <Text style={styles.body}>
            iListGTA is the Greater Toronto Area's premier business directory. We connect locals with the best restaurants, services, shops, and events across Toronto, Mississauga, Brampton, and all GTA communities.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Our Mission</Text>
          <Text style={styles.body}>
            To make it easy for people to discover local businesses and for business owners to reach their community — all in one place.
          </Text>
        </View>

        <View style={styles.links}>
          {[
            { icon: 'globe-outline', label: 'Visit Website', url: 'https://ilistgta.com' },
            { icon: 'mail-outline', label: 'Contact Us', url: 'mailto:hello@ilistgta.com' },
            { icon: 'document-text-outline', label: 'Privacy Policy', url: 'https://ilistgta.com/privacy' },
            { icon: 'shield-checkmark-outline', label: 'Terms of Service', url: 'https://ilistgta.com/terms' },
          ].map((item, i) => (
            <TouchableOpacity key={i} style={styles.linkItem} onPress={() => Linking.openURL(item.url)}>
              <Ionicons name={item.icon as any} size={20} color={Colors.primary} />
              <Text style={styles.linkLabel}>{item.label}</Text>
              <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.footer}>Made with ❤️ for the GTA community</Text>

        <View style={{ height: insets.bottom + Spacing.xl }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.surfaceSecondary },
  content: { padding: Spacing.md },
  hero: { alignItems: 'center', paddingVertical: Spacing.xl },
  logoCircle: {
    width: 80, height: 80, borderRadius: 20, backgroundColor: Colors.primary,
    justifyContent: 'center', alignItems: 'center', marginBottom: Spacing.md,
  },
  logoText: { fontSize: FontSize.xxl, fontWeight: '900', color: '#fff' },
  appName: { fontSize: FontSize.xl, fontWeight: '800', color: Colors.text },
  version: { fontSize: FontSize.sm, color: Colors.textMuted, marginTop: 4 },
  section: { backgroundColor: Colors.surface, borderRadius: Radius.lg, padding: Spacing.md, marginBottom: Spacing.md, ...Shadow.sm },
  sectionTitle: { fontSize: FontSize.sm, fontWeight: '700', color: Colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: Spacing.sm },
  body: { fontSize: FontSize.base, color: Colors.textSecondary, lineHeight: 23 },
  links: { backgroundColor: Colors.surface, borderRadius: Radius.lg, overflow: 'hidden', ...Shadow.sm, marginBottom: Spacing.md },
  linkItem: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.md,
    paddingHorizontal: Spacing.md, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: Colors.borderLight,
  },
  linkLabel: { flex: 1, fontSize: FontSize.base, color: Colors.text },
  footer: { textAlign: 'center', fontSize: FontSize.sm, color: Colors.textMuted, marginTop: Spacing.md },
});
