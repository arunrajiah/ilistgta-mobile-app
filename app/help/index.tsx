import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors, FontSize, Radius, Shadow, Spacing } from '@/constants/theme';
import ScreenHeader from '@/components/ScreenHeader';

const FAQS = [
  { q: 'How do I add my business?', a: 'Go to your Profile tab and tap "Add a Listing". Fill in your business details and submit for review. We\'ll review it within 1-2 business days.' },
  { q: 'How long does listing approval take?', a: 'Most listings are reviewed and approved within 1-2 business days. You\'ll receive an email confirmation once it\'s live.' },
  { q: 'Can I edit my listing after submission?', a: 'Yes! Go to Profile → My Listings, and tap Edit on any listing. Changes may require re-review before going live.' },
  { q: 'How do I save a business?', a: 'Tap the heart icon (🤍) on any business detail page to save it. Find all saved businesses under Profile → Saved Businesses.' },
  { q: 'Why can\'t I see my review?', a: 'Reviews go through moderation before being published to ensure quality. This usually takes 24-48 hours.' },
  { q: 'How do I contact a business?', a: 'Open a business page and tap "Enquire" to send a message, or tap "Call" to dial directly.' },
];

export default function HelpScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <ScreenHeader title="Help & FAQ" />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.contactCard}>
          <Ionicons name="mail" size={24} color={Colors.primary} />
          <View style={{ flex: 1 }}>
            <Text style={styles.contactTitle}>Contact Support</Text>
            <Text style={styles.contactSub}>We typically respond within 24 hours</Text>
          </View>
          <TouchableOpacity onPress={() => Linking.openURL('mailto:support@ilistgta.com')}>
            <Text style={styles.contactLink}>Email Us</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.faqTitle}>Frequently Asked Questions</Text>

        {FAQS.map((faq, i) => (
          <View key={i} style={styles.faqCard}>
            <Text style={styles.faqQ}>{faq.q}</Text>
            <Text style={styles.faqA}>{faq.a}</Text>
          </View>
        ))}

        <View style={{ height: insets.bottom + Spacing.xl }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.surfaceSecondary },
  content: { padding: Spacing.md },
  contactCard: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.md,
    backgroundColor: Colors.primaryBg, borderRadius: Radius.lg, padding: Spacing.md,
    borderWidth: 1, borderColor: '#c3e0c3', marginBottom: Spacing.lg, ...Shadow.sm,
  },
  contactTitle: { fontSize: FontSize.base, fontWeight: '700', color: Colors.text },
  contactSub: { fontSize: FontSize.xs, color: Colors.textMuted, marginTop: 2 },
  contactLink: { fontSize: FontSize.sm, color: Colors.primary, fontWeight: '700' },
  faqTitle: { fontSize: FontSize.base, fontWeight: '700', color: Colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: Spacing.sm },
  faqCard: { backgroundColor: Colors.surface, borderRadius: Radius.lg, padding: Spacing.md, marginBottom: Spacing.sm, ...Shadow.sm },
  faqQ: { fontSize: FontSize.base, fontWeight: '700', color: Colors.text, marginBottom: 6 },
  faqA: { fontSize: FontSize.sm, color: Colors.textSecondary, lineHeight: 20 },
});
