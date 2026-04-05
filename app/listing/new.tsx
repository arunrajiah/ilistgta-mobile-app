import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/lib/auth';
import { createListing, getCategories } from '@/lib/api';
import { Category } from '@/lib/types';
import { Colors, FontSize, Radius, Shadow, Spacing } from '@/constants/theme';

const CITIES = [
  'Toronto',
  'Mississauga',
  'Brampton',
  'Markham',
  'Vaughan',
  'Richmond Hill',
  'Oakville',
  'Burlington',
  'Ajax',
  'Pickering',
  'Whitby',
  'Oshawa',
  'Milton',
  'Newmarket',
  'Aurora',
];

export default function NewListingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { session } = useAuth();

  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryId, setCategoryId] = useState('');
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [name, setName] = useState('');
  const [city, setCity] = useState('');
  const [address, setAddress] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [website, setWebsite] = useState('');
  const [showCityPicker, setShowCityPicker] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    getCategories('business').then(setCategories).catch(console.error);
  }, []);

  async function handleSubmit() {
    if (!name.trim()) {
      Alert.alert('Validation Error', 'Business name is required.');
      return;
    }
    if (!city.trim()) {
      Alert.alert('Validation Error', 'Please select or enter a city.');
      return;
    }
    if (!session?.access_token) {
      Alert.alert('Error', 'You must be signed in to add a listing.');
      return;
    }

    setSubmitting(true);
    try {
      await createListing(session.access_token, {
        name: name.trim(),
        category_id: categoryId || undefined,
        city: city.trim(),
        address: address.trim() || undefined,
        postal_code: postalCode.trim() || undefined,
        short_description: shortDescription.trim() || undefined,
        phone: phone.trim() || undefined,
        email: email.trim() || undefined,
        website: website.trim() || undefined,
      });
      Alert.alert(
        'Submitted!',
        'Your listing has been submitted for review. We\'ll notify you once it\'s approved.',
        [{ text: 'OK', onPress: () => router.back() }],
      );
    } catch (err: any) {
      Alert.alert('Submission Failed', err?.message ?? 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} activeOpacity={0.7}>
          <Ionicons name="chevron-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add a Listing</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Info Banner */}
        <View style={styles.infoBanner}>
          <Ionicons name="information-circle-outline" size={18} color={Colors.primary} />
          <Text style={styles.infoText}>
            Your listing will be reviewed by our team before going live. This usually takes 1-2 business days.
          </Text>
        </View>

        {/* Form */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Business Details</Text>

          {/* Business Name */}
          <View style={styles.field}>
            <Text style={styles.label}>
              Business Name <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="e.g. Toronto Eats Restaurant"
              placeholderTextColor={Colors.textMuted}
              returnKeyType="next"
              autoCapitalize="words"
            />
          </View>

          {/* Category */}
          <View style={styles.field}>
            <Text style={styles.label}>Category</Text>
            <TouchableOpacity
              style={[styles.input, styles.pickerTrigger]}
              onPress={() => setShowCategoryPicker(!showCategoryPicker)}
              activeOpacity={0.7}
            >
              <Text style={[styles.pickerText, !categoryId && styles.pickerPlaceholder]}>
                {categoryId
                  ? categories.find(c => c.id === categoryId)
                      ? `${categories.find(c => c.id === categoryId)!.icon ?? ''} ${categories.find(c => c.id === categoryId)!.name}`.trim()
                      : 'Select a category'
                  : 'Select a category'}
              </Text>
              <Ionicons
                name={showCategoryPicker ? 'chevron-up' : 'chevron-down'}
                size={18}
                color={Colors.textMuted}
              />
            </TouchableOpacity>

            {showCategoryPicker && (
              <View style={styles.dropdown}>
                <ScrollView style={styles.dropdownScroll} nestedScrollEnabled>
                  {categories.map((cat) => (
                    <TouchableOpacity
                      key={cat.id}
                      style={[styles.dropdownItem, categoryId === cat.id && styles.dropdownItemSelected]}
                      onPress={() => {
                        setCategoryId(cat.id);
                        setShowCategoryPicker(false);
                      }}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.dropdownItemText, categoryId === cat.id && styles.dropdownItemTextSelected]}>
                        {cat.icon ? `${cat.icon} ${cat.name}` : cat.name}
                      </Text>
                      {categoryId === cat.id && <Ionicons name="checkmark" size={16} color={Colors.primary} />}
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}
          </View>

          {/* City */}
          <View style={styles.field}>
            <Text style={styles.label}>
              City <Text style={styles.required}>*</Text>
            </Text>
            <TouchableOpacity
              style={[styles.input, styles.pickerTrigger]}
              onPress={() => setShowCityPicker(!showCityPicker)}
              activeOpacity={0.7}
            >
              <Text style={[styles.pickerText, !city && styles.pickerPlaceholder]}>
                {city || 'Select a city'}
              </Text>
              <Ionicons
                name={showCityPicker ? 'chevron-up' : 'chevron-down'}
                size={18}
                color={Colors.textMuted}
              />
            </TouchableOpacity>

            {showCityPicker && (
              <View style={styles.dropdown}>
                <ScrollView style={styles.dropdownScroll} nestedScrollEnabled>
                  {CITIES.map((c) => (
                    <TouchableOpacity
                      key={c}
                      style={[styles.dropdownItem, city === c && styles.dropdownItemSelected]}
                      onPress={() => {
                        setCity(c);
                        setShowCityPicker(false);
                      }}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.dropdownItemText, city === c && styles.dropdownItemTextSelected]}>
                        {c}
                      </Text>
                      {city === c && <Ionicons name="checkmark" size={16} color={Colors.primary} />}
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}
          </View>

          {/* Address */}
          <View style={styles.field}>
            <Text style={styles.label}>Street Address</Text>
            <TextInput
              style={styles.input}
              value={address}
              onChangeText={setAddress}
              placeholder="Street address e.g. 123 Main St"
              placeholderTextColor={Colors.textMuted}
              returnKeyType="next"
              autoCapitalize="words"
            />
          </View>

          {/* Postal Code */}
          <View style={styles.field}>
            <Text style={styles.label}>Postal Code</Text>
            <TextInput
              style={styles.input}
              value={postalCode}
              onChangeText={setPostalCode}
              placeholder="e.g. M5V 2T6"
              placeholderTextColor={Colors.textMuted}
              returnKeyType="next"
              autoCapitalize="characters"
              maxLength={7}
            />
          </View>

          {/* Short Description */}
          <View style={styles.field}>
            <Text style={styles.label}>Short Description</Text>
            <TextInput
              style={[styles.input, styles.textarea]}
              value={shortDescription}
              onChangeText={setShortDescription}
              placeholder="Brief description of your business (max 160 characters)"
              placeholderTextColor={Colors.textMuted}
              multiline
              numberOfLines={3}
              maxLength={160}
              textAlignVertical="top"
            />
            <Text style={styles.charCount}>{shortDescription.length}/160</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Information</Text>

          {/* Phone */}
          <View style={styles.field}>
            <Text style={styles.label}>Phone Number</Text>
            <TextInput
              style={styles.input}
              value={phone}
              onChangeText={setPhone}
              placeholder="e.g. (416) 555-0123"
              placeholderTextColor={Colors.textMuted}
              keyboardType="phone-pad"
              returnKeyType="next"
            />
          </View>

          {/* Email */}
          <View style={styles.field}>
            <Text style={styles.label}>Email Address</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="e.g. hello@yourbusiness.com"
              placeholderTextColor={Colors.textMuted}
              keyboardType="email-address"
              autoCapitalize="none"
              returnKeyType="next"
            />
          </View>

          {/* Website */}
          <View style={styles.field}>
            <Text style={styles.label}>Website</Text>
            <TextInput
              style={styles.input}
              value={website}
              onChangeText={setWebsite}
              placeholder="e.g. https://yourbusiness.com"
              placeholderTextColor={Colors.textMuted}
              keyboardType="url"
              autoCapitalize="none"
              returnKeyType="done"
            />
          </View>
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={[styles.submitBtn, submitting && styles.submitBtnDisabled]}
          onPress={handleSubmit}
          activeOpacity={0.8}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Ionicons name="checkmark-circle-outline" size={20} color="#fff" />
              <Text style={styles.submitBtnText}>Submit for Review</Text>
            </>
          )}
        </TouchableOpacity>

        <Text style={styles.disclaimer}>
          By submitting, you confirm that the information provided is accurate and relates to a real business operating in the GTA.
        </Text>

        <View style={{ height: insets.bottom + Spacing.xl }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: Colors.surfaceSecondary },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.sm,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    ...Shadow.sm,
  },
  backBtn: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: FontSize.md,
    fontWeight: '700',
    color: Colors.text,
  },
  headerSpacer: { width: 36 },

  scroll: { flex: 1 },
  scrollContent: { padding: Spacing.md },

  infoBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    backgroundColor: Colors.primaryBg,
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: '#c3e0c3',
  },
  infoText: {
    flex: 1,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    lineHeight: 20,
  },

  section: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    ...Shadow.sm,
  },
  sectionTitle: {
    fontSize: FontSize.sm,
    fontWeight: '700',
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: Spacing.md,
  },

  field: { marginBottom: Spacing.md },
  label: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 6,
  },
  required: { color: Colors.error },
  input: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: 11,
    fontSize: FontSize.base,
    color: Colors.text,
    backgroundColor: Colors.surfaceSecondary,
  },
  textarea: {
    minHeight: 80,
    paddingTop: 11,
  },
  charCount: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    textAlign: 'right',
    marginTop: 4,
  },

  pickerTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  pickerText: { fontSize: FontSize.base, color: Colors.text },
  pickerPlaceholder: { color: Colors.textMuted },

  dropdown: {
    marginTop: 4,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    backgroundColor: Colors.surface,
    overflow: 'hidden',
    ...Shadow.md,
    zIndex: 10,
  },
  dropdownScroll: { maxHeight: 220 },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  dropdownItemSelected: { backgroundColor: Colors.primaryBg },
  dropdownItemText: { fontSize: FontSize.base, color: Colors.text },
  dropdownItemTextSelected: { color: Colors.primary, fontWeight: '600' },

  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.primary,
    borderRadius: Radius.full,
    paddingVertical: 15,
    marginBottom: Spacing.md,
    ...Shadow.md,
  },
  submitBtnDisabled: { opacity: 0.6 },
  submitBtnText: { color: '#fff', fontWeight: '700', fontSize: FontSize.base },

  disclaimer: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: 17,
    paddingHorizontal: Spacing.md,
  },
});
