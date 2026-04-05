import React, { useEffect, useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  StyleSheet, Alert, ActivityIndicator, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/lib/auth';
import { getMyCoupons, updateVendorCoupon, getMyListings } from '@/lib/api';
import { Listing, VendorCoupon } from '@/lib/types';
import { Colors, FontSize, Radius, Shadow, Spacing } from '@/constants/theme';

const DISCOUNT_TYPES = [
  { value: 'percentage', label: '% Off', icon: 'trending-down-outline' },
  { value: 'fixed', label: '$ Off', icon: 'cash-outline' },
  { value: 'bogo', label: 'BOGO', icon: 'gift-outline' },
  { value: 'other', label: 'Other', icon: 'pricetag-outline' },
] as const;

type DiscountType = 'percentage' | 'fixed' | 'bogo' | 'other';

export default function EditCouponScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { session } = useAuth();

  const [coupon, setCoupon] = useState<VendorCoupon | null>(null);
  const [listings, setListings] = useState<Listing[]>([]);
  const [listingId, setListingId] = useState('');
  const [showListingPicker, setShowListingPicker] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [discountType, setDiscountType] = useState<DiscountType>('percentage');
  const [discountValue, setDiscountValue] = useState('');
  const [code, setCode] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!session?.access_token || !id) return;
    Promise.all([
      getMyCoupons(session.access_token),
      getMyListings(session.access_token),
    ]).then(([couponsRes, listingsRes]) => {
      setListings(listingsRes.listings ?? []);
      const found = couponsRes.coupons.find(c => c.id === id);
      if (!found) { setNotFound(true); return; }
      setCoupon(found);
      setTitle(found.title ?? '');
      setDescription(found.description ?? '');
      setDiscountType((found.discount_type as DiscountType) ?? 'percentage');
      setDiscountValue(found.discount_value != null ? String(found.discount_value) : '');
      setCode(found.code ?? '');
      setStartDate(found.start_date ? found.start_date.slice(0, 10) : '');
      setEndDate(found.end_date ? found.end_date.slice(0, 10) : '');
      setListingId(found.listing_id ?? '');
    }).catch(e => Alert.alert('Error', e.message ?? 'Failed to load coupon'))
      .finally(() => setLoading(false));
  }, [session, id]);

  async function handleSave() {
    if (!title.trim()) { Alert.alert('Required', 'Coupon title is required.'); return; }
    if (!session?.access_token) return;

    setSaving(true);
    try {
      await updateVendorCoupon(session.access_token, id!, {
        title: title.trim(),
        description: description.trim() || undefined,
        discount_type: discountType,
        discount_value: discountType !== 'bogo' && discountValue ? parseFloat(discountValue) : undefined,
        code: code.trim().toUpperCase() || undefined,
        start_date: startDate.trim() || undefined,
        end_date: endDate.trim() || undefined,
        listing_id: listingId || undefined,
      });
      Alert.alert('Saved!', 'Coupon updated successfully.', [{ text: 'OK', onPress: () => router.back() }]);
    } catch (e: any) {
      Alert.alert('Error', e.message ?? 'Failed to update coupon');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <View style={styles.loader}><ActivityIndicator size="large" color={Colors.primary} /></View>;
  }
  if (notFound) {
    return (
      <View style={styles.loader}>
        <Text style={{ color: Colors.textMuted }}>Coupon not found.</Text>
        <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 16 }}>
          <Text style={{ color: Colors.primary, fontWeight: '600' }}>Go back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const selectedListing = listings.find(l => l.id === listingId);

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Coupon</Text>
        <TouchableOpacity style={styles.saveIconBtn} onPress={handleSave} disabled={saving}>
          {saving ? <ActivityIndicator size="small" color={Colors.primary} /> : <Ionicons name="checkmark" size={22} color={Colors.primary} />}
        </TouchableOpacity>
      </View>

      {coupon?.status === 'rejected' && (
        <View style={styles.rejectedBanner}>
          <Ionicons name="warning-outline" size={16} color="#991b1b" />
          <Text style={styles.rejectedText}>This coupon was rejected. Update and save to resubmit for review.</Text>
        </View>
      )}

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Coupon Details</Text>
          <View style={styles.field}>
            <Text style={styles.label}>Title <Text style={styles.required}>*</Text></Text>
            <TextInput style={styles.input} value={title} onChangeText={setTitle} placeholder="e.g. 20% off all mains" placeholderTextColor={Colors.textMuted} autoCapitalize="sentences" />
          </View>
          <View style={styles.field}>
            <Text style={styles.label}>Business Listing</Text>
            <TouchableOpacity style={[styles.input, styles.pickerTrigger]} onPress={() => setShowListingPicker(!showListingPicker)}>
              <Text style={[styles.pickerText, !listingId && styles.pickerPlaceholder]}>
                {selectedListing ? selectedListing.name : (coupon?.business_listings?.name ?? 'Select a listing')}
              </Text>
              <Ionicons name={showListingPicker ? 'chevron-up' : 'chevron-down'} size={18} color={Colors.textMuted} />
            </TouchableOpacity>
            {showListingPicker && (
              <View style={styles.dropdown}>
                <ScrollView style={styles.dropdownScroll} nestedScrollEnabled>
                  {listings.length === 0 ? (
                    <View style={styles.dropdownEmpty}>
                      <Text style={styles.dropdownEmptyText}>No listings found</Text>
                    </View>
                  ) : listings.map(l => (
                    <TouchableOpacity key={l.id} style={[styles.dropdownItem, listingId === l.id && styles.dropdownItemSelected]} onPress={() => { setListingId(l.id); setShowListingPicker(false); }}>
                      <Text style={[styles.dropdownItemText, listingId === l.id && styles.dropdownItemTextSelected]}>{l.name}</Text>
                      {listingId === l.id && <Ionicons name="checkmark" size={16} color={Colors.primary} />}
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}
          </View>
          <View style={styles.field}>
            <Text style={styles.label}>Description</Text>
            <TextInput style={[styles.input, styles.textarea]} value={description} onChangeText={setDescription} placeholder="Terms and conditions, what's included..." placeholderTextColor={Colors.textMuted} multiline numberOfLines={3} textAlignVertical="top" />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Discount</Text>
          <View style={styles.field}>
            <Text style={styles.label}>Discount Type</Text>
            <View style={styles.typeRow}>
              {DISCOUNT_TYPES.map(dt => (
                <TouchableOpacity
                  key={dt.value}
                  style={[styles.typeBtn, discountType === dt.value && styles.typeBtnSelected]}
                  onPress={() => setDiscountType(dt.value)}
                >
                  <Ionicons name={dt.icon as any} size={16} color={discountType === dt.value ? Colors.primary : Colors.textMuted} />
                  <Text style={[styles.typeBtnText, discountType === dt.value && styles.typeBtnTextSelected]}>{dt.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          {discountType !== 'bogo' && discountType !== 'other' && (
            <View style={styles.field}>
              <Text style={styles.label}>{discountType === 'percentage' ? 'Percentage (%)' : 'Amount ($)'}</Text>
              <TextInput style={styles.input} value={discountValue} onChangeText={setDiscountValue} placeholder={discountType === 'percentage' ? '20' : '10.00'} placeholderTextColor={Colors.textMuted} keyboardType="decimal-pad" />
            </View>
          )}
          <View style={styles.field}>
            <Text style={styles.label}>Coupon Code</Text>
            <TextInput
              style={styles.input}
              value={code}
              onChangeText={t => setCode(t.toUpperCase())}
              placeholder="SAVE20 (optional)"
              placeholderTextColor={Colors.textMuted}
              autoCapitalize="characters"
              autoCorrect={false}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Validity</Text>
          <View style={styles.field}>
            <Text style={styles.label}>Start Date</Text>
            <TextInput style={styles.input} value={startDate} onChangeText={setStartDate} placeholder="YYYY-MM-DD (optional)" placeholderTextColor={Colors.textMuted} autoCapitalize="none" />
          </View>
          <View style={styles.field}>
            <Text style={styles.label}>End Date</Text>
            <TextInput style={styles.input} value={endDate} onChangeText={setEndDate} placeholder="YYYY-MM-DD (optional)" placeholderTextColor={Colors.textMuted} autoCapitalize="none" />
          </View>
        </View>

        <TouchableOpacity style={[styles.saveBtn, saving && { opacity: 0.6 }]} onPress={handleSave} disabled={saving}>
          {saving ? <ActivityIndicator color="#fff" /> : <><Ionicons name="save-outline" size={20} color="#fff" /><Text style={styles.saveBtnText}>Save Changes</Text></>}
        </TouchableOpacity>

        <View style={{ height: insets.bottom + Spacing.xl }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: Colors.surfaceSecondary },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.md, paddingBottom: Spacing.sm, backgroundColor: Colors.surface, borderBottomWidth: 1, borderBottomColor: Colors.border, ...Shadow.sm },
  backBtn: { width: 36, height: 36, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: FontSize.md, fontWeight: '700', color: Colors.text },
  saveIconBtn: { width: 36, height: 36, justifyContent: 'center', alignItems: 'center' },
  rejectedBanner: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, backgroundColor: '#fef2f2', padding: Spacing.md, borderBottomWidth: 1, borderBottomColor: '#fecaca' },
  rejectedText: { flex: 1, fontSize: FontSize.sm, color: '#991b1b', lineHeight: 19 },
  scroll: { flex: 1 },
  scrollContent: { padding: Spacing.md },
  section: { backgroundColor: Colors.surface, borderRadius: Radius.lg, padding: Spacing.md, marginBottom: Spacing.md, ...Shadow.sm },
  sectionTitle: { fontSize: FontSize.sm, fontWeight: '700', color: Colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: Spacing.md },
  field: { marginBottom: Spacing.md },
  label: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.text, marginBottom: 6 },
  required: { color: Colors.error },
  input: { borderWidth: 1, borderColor: Colors.border, borderRadius: Radius.md, paddingHorizontal: Spacing.md, paddingVertical: 11, fontSize: FontSize.base, color: Colors.text, backgroundColor: Colors.surfaceSecondary },
  textarea: { minHeight: 80, paddingTop: 11 },
  pickerTrigger: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  pickerText: { fontSize: FontSize.base, color: Colors.text },
  pickerPlaceholder: { color: Colors.textMuted },
  dropdown: { marginTop: 4, borderWidth: 1, borderColor: Colors.border, borderRadius: Radius.md, backgroundColor: Colors.surface, overflow: 'hidden', ...Shadow.md, zIndex: 10 },
  dropdownScroll: { maxHeight: 200 },
  dropdownItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.md, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: Colors.borderLight },
  dropdownItemSelected: { backgroundColor: Colors.primaryBg },
  dropdownItemText: { fontSize: FontSize.base, color: Colors.text },
  dropdownItemTextSelected: { color: Colors.primary, fontWeight: '600' },
  dropdownEmpty: { padding: Spacing.md, alignItems: 'center' },
  dropdownEmptyText: { fontSize: FontSize.sm, color: Colors.textMuted },
  typeRow: { flexDirection: 'row', gap: Spacing.sm },
  typeBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, paddingVertical: 10, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.surfaceSecondary },
  typeBtnSelected: { borderColor: Colors.primary, backgroundColor: Colors.primaryBg },
  typeBtnText: { fontSize: FontSize.xs, fontWeight: '600', color: Colors.textMuted },
  typeBtnTextSelected: { color: Colors.primary },
  saveBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.sm, backgroundColor: Colors.primary, borderRadius: Radius.full, paddingVertical: 15, marginBottom: Spacing.md, ...Shadow.md },
  saveBtnText: { color: '#fff', fontWeight: '700', fontSize: FontSize.base },
});
