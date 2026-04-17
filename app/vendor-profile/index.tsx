import React, { useCallback, useEffect, useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  StyleSheet, Alert, ActivityIndicator, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/lib/auth';
import { getVendorProfile, updateVendorProfile } from '@/lib/api';
import { VendorProfile } from '@/lib/types';
import { Colors, FontSize, Radius, Shadow, Spacing } from '@/constants/theme';
import ScreenHeader from '@/components/ScreenHeader';

const CITIES = [
  'Toronto', 'Mississauga', 'Brampton', 'Markham', 'Vaughan',
  'Richmond Hill', 'Oakville', 'Burlington', 'Ajax', 'Pickering',
  'Whitby', 'Oshawa', 'Milton', 'Newmarket', 'Aurora',
];

const SOCIAL_FIELDS = [
  { key: 'instagram', label: 'Instagram', placeholder: 'https://instagram.com/yourpage' },
  { key: 'facebook',  label: 'Facebook',  placeholder: 'https://facebook.com/yourpage' },
  { key: 'twitter',   label: 'Twitter / X', placeholder: 'https://twitter.com/yourpage' },
  { key: 'linkedin',  label: 'LinkedIn',  placeholder: 'https://linkedin.com/company/yourpage' },
  { key: 'youtube',   label: 'YouTube',   placeholder: 'https://youtube.com/@yourchannel' },
  { key: 'tiktok',    label: 'TikTok',    placeholder: 'https://tiktok.com/@yourpage' },
] as const;

const STATUS_CONFIG: Record<string, { bg: string; color: string; label: string; icon: string }> = {
  approved:     { bg: '#dcfce7', color: '#166534', label: 'Live — your profile is visible to the public', icon: 'checkmark-circle' },
  pending_review: { bg: '#fef9c3', color: '#854d0e', label: 'Under Review — awaiting admin approval', icon: 'time' },
  rejected:     { bg: '#fee2e2', color: '#991b1b', label: 'Rejected — see reason below and resubmit', icon: 'close-circle' },
  draft:        { bg: '#f3f4f6', color: '#374151', label: 'Draft — submit for review when ready', icon: 'document' },
};

export default function VendorProfileScreen() {
  const insets = useSafeAreaInsets();
  const { session } = useAuth();

  const [profile, setProfile] = useState<VendorProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showCityPicker, setShowCityPicker] = useState(false);

  // Form state
  const [businessName, setBusinessName] = useState('');
  const [tagline, setTagline] = useState('');
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [website, setWebsite] = useState('');
  const [social, setSocial] = useState<Record<string, string>>({});

  const load = useCallback(async () => {
    if (!session?.access_token) return;
    try {
      const { profile: p } = await getVendorProfile(session.access_token);
      setProfile(p);
      if (p) {
        setBusinessName(p.business_name ?? '');
        setTagline(p.tagline ?? '');
        setDescription(p.description ?? '');
        setAddress(p.address ?? '');
        setCity(p.city ?? '');
        setPostalCode(p.postal_code ?? '');
        setPhone(p.phone ?? '');
        setEmail(p.email ?? '');
        setWebsite(p.website ?? '');
        setSocial(p.social_media ?? {});
      }
    } catch (e: any) {
      Alert.alert('Error', e.message ?? 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  }, [session]);

  useEffect(() => { load(); }, [load]);

  async function handleSave(submit = false) {
    if (!session?.access_token) return;
    setSaving(true);
    try {
      await updateVendorProfile(session.access_token, {
        business_name: businessName.trim() || undefined,
        tagline: tagline.trim() || undefined,
        description: description.trim() || undefined,
        address: address.trim() || undefined,
        city: city || undefined,
        postal_code: postalCode.trim() || undefined,
        phone: phone.trim() || undefined,
        email: email.trim() || undefined,
        website: website.trim() || undefined,
        social_media: Object.fromEntries(Object.entries(social).filter(([, v]) => v.trim())),
        ...(submit ? { action: 'submit' as const } : {}),
      });
      Alert.alert(
        submit ? 'Submitted for Review' : 'Saved',
        submit
          ? 'Your profile has been submitted. We\'ll review it within 1-2 business days.'
          : 'Your profile has been saved.',
        [{ text: 'OK', onPress: () => { if (submit) load(); } }],
      );
    } catch (e: any) {
      Alert.alert('Error', e.message ?? 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  const status = profile?.status ?? 'draft';
  const statusCfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.draft;

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScreenHeader
        title="Vendor Profile"
        rightElement={
          <TouchableOpacity onPress={() => handleSave(false)} disabled={saving}>
            {saving
              ? <ActivityIndicator size="small" color={Colors.primary} />
              : <Text style={{ color: Colors.primary, fontWeight: '700' }}>Save</Text>
            }
          </TouchableOpacity>
        }
      />

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        {/* Status banner */}
        <View style={[styles.statusBanner, { backgroundColor: statusCfg.bg }]}>
          <Ionicons name={statusCfg.icon as any} size={18} color={statusCfg.color} />
          <View style={{ flex: 1 }}>
            <Text style={[styles.statusText, { color: statusCfg.color }]}>{statusCfg.label}</Text>
            {status === 'rejected' && profile?.rejection_reason && (
              <Text style={[styles.statusReason, { color: statusCfg.color }]}>Reason: {profile.rejection_reason}</Text>
            )}
          </View>
        </View>

        {/* Business Identity */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Business Identity</Text>
          <View style={styles.field}>
            <Text style={styles.label}>Business Name</Text>
            <TextInput style={styles.input} value={businessName} onChangeText={setBusinessName} placeholder="Your business name" placeholderTextColor={Colors.textMuted} autoCapitalize="words" />
          </View>
          <View style={styles.field}>
            <Text style={styles.label}>Tagline</Text>
            <TextInput style={styles.input} value={tagline} onChangeText={setTagline} placeholder="Short catchy description" placeholderTextColor={Colors.textMuted} maxLength={100} />
          </View>
          <View style={styles.field}>
            <Text style={styles.label}>Description</Text>
            <TextInput style={[styles.input, styles.textarea]} value={description} onChangeText={setDescription} placeholder="Tell customers about your business..." placeholderTextColor={Colors.textMuted} multiline numberOfLines={5} textAlignVertical="top" />
          </View>
        </View>

        {/* Location */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Location</Text>
          <View style={styles.field}>
            <Text style={styles.label}>Street Address</Text>
            <TextInput style={styles.input} value={address} onChangeText={setAddress} placeholder="123 Main St" placeholderTextColor={Colors.textMuted} autoCapitalize="words" />
          </View>
          <View style={styles.field}>
            <Text style={styles.label}>City</Text>
            <TouchableOpacity style={[styles.input, styles.pickerTrigger]} onPress={() => setShowCityPicker(!showCityPicker)}>
              <Text style={[styles.pickerText, !city && styles.pickerPlaceholder]}>{city || 'Select a city'}</Text>
              <Ionicons name={showCityPicker ? 'chevron-up' : 'chevron-down'} size={18} color={Colors.textMuted} />
            </TouchableOpacity>
            {showCityPicker && (
              <View style={styles.dropdown}>
                <ScrollView style={styles.dropdownScroll} nestedScrollEnabled>
                  {CITIES.map(c => (
                    <TouchableOpacity key={c} style={[styles.dropdownItem, city === c && styles.dropdownItemSelected]} onPress={() => { setCity(c); setShowCityPicker(false); }}>
                      <Text style={[styles.dropdownItemText, city === c && styles.dropdownItemTextSelected]}>{c}</Text>
                      {city === c && <Ionicons name="checkmark" size={16} color={Colors.primary} />}
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}
          </View>
          <View style={styles.field}>
            <Text style={styles.label}>Postal Code</Text>
            <TextInput style={styles.input} value={postalCode} onChangeText={setPostalCode} placeholder="M5V 2T6" placeholderTextColor={Colors.textMuted} autoCapitalize="characters" maxLength={7} />
          </View>
        </View>

        {/* Contact */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact</Text>
          <View style={styles.field}>
            <Text style={styles.label}>Phone</Text>
            <TextInput style={styles.input} value={phone} onChangeText={setPhone} placeholder="(416) 555-0123" placeholderTextColor={Colors.textMuted} keyboardType="phone-pad" />
          </View>
          <View style={styles.field}>
            <Text style={styles.label}>Email</Text>
            <TextInput style={styles.input} value={email} onChangeText={setEmail} placeholder="hello@yourbusiness.com" placeholderTextColor={Colors.textMuted} keyboardType="email-address" autoCapitalize="none" />
          </View>
          <View style={styles.field}>
            <Text style={styles.label}>Website</Text>
            <TextInput style={styles.input} value={website} onChangeText={setWebsite} placeholder="https://yourbusiness.com" placeholderTextColor={Colors.textMuted} keyboardType="url" autoCapitalize="none" />
          </View>
        </View>

        {/* Social Media */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Social Media</Text>
          {SOCIAL_FIELDS.map(f => (
            <View key={f.key} style={styles.field}>
              <Text style={styles.label}>{f.label}</Text>
              <TextInput
                style={styles.input}
                value={social[f.key] ?? ''}
                onChangeText={v => setSocial(prev => ({ ...prev, [f.key]: v }))}
                placeholder={f.placeholder}
                placeholderTextColor={Colors.textMuted}
                keyboardType="url"
                autoCapitalize="none"
              />
            </View>
          ))}
        </View>

        {/* Actions */}
        <TouchableOpacity style={styles.saveBtn} onPress={() => handleSave(false)} disabled={saving}>
          {saving ? <ActivityIndicator color="#fff" /> : <><Ionicons name="save-outline" size={18} color="#fff" /><Text style={styles.saveBtnText}>Save Changes</Text></>}
        </TouchableOpacity>

        {(status === 'draft' || status === 'rejected') && (
          <TouchableOpacity style={styles.submitBtn} onPress={() => handleSave(true)} disabled={saving}>
            <Ionicons name="send-outline" size={18} color={Colors.primary} />
            <Text style={styles.submitBtnText}>Submit for Review</Text>
          </TouchableOpacity>
        )}

        <View style={{ height: insets.bottom + Spacing.xl }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: Colors.surfaceSecondary },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scroll: { flex: 1 },
  scrollContent: { padding: Spacing.md },
  statusBanner: {
    flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.sm,
    borderRadius: Radius.md, padding: Spacing.md, marginBottom: Spacing.md,
  },
  statusText: { fontSize: FontSize.sm, fontWeight: '600', lineHeight: 20 },
  statusReason: { fontSize: FontSize.sm, marginTop: 4, fontStyle: 'italic' },
  section: { backgroundColor: Colors.surface, borderRadius: Radius.lg, padding: Spacing.md, marginBottom: Spacing.md, ...Shadow.sm },
  sectionTitle: { fontSize: FontSize.sm, fontWeight: '700', color: Colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: Spacing.md },
  field: { marginBottom: Spacing.md },
  label: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.text, marginBottom: 6 },
  input: { borderWidth: 1, borderColor: Colors.border, borderRadius: Radius.md, paddingHorizontal: Spacing.md, paddingVertical: 11, fontSize: FontSize.base, color: Colors.text, backgroundColor: Colors.surfaceSecondary },
  textarea: { minHeight: 100, paddingTop: 11 },
  pickerTrigger: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  pickerText: { fontSize: FontSize.base, color: Colors.text },
  pickerPlaceholder: { color: Colors.textMuted },
  dropdown: { marginTop: 4, borderWidth: 1, borderColor: Colors.border, borderRadius: Radius.md, backgroundColor: Colors.surface, overflow: 'hidden', ...Shadow.md, zIndex: 10 },
  dropdownScroll: { maxHeight: 200 },
  dropdownItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.md, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: Colors.borderLight },
  dropdownItemSelected: { backgroundColor: Colors.primaryBg },
  dropdownItemText: { fontSize: FontSize.base, color: Colors.text },
  dropdownItemTextSelected: { color: Colors.primary, fontWeight: '600' },
  saveBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: Colors.primary, borderRadius: Radius.full, paddingVertical: 14, marginBottom: Spacing.sm, ...Shadow.md },
  saveBtnText: { color: '#fff', fontWeight: '700', fontSize: FontSize.base },
  submitBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderWidth: 2, borderColor: Colors.primary, borderRadius: Radius.full, paddingVertical: 13, marginBottom: Spacing.sm },
  submitBtnText: { color: Colors.primary, fontWeight: '700', fontSize: FontSize.base },
});
