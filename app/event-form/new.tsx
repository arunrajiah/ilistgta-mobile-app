import React, { useEffect, useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  StyleSheet, Alert, ActivityIndicator, KeyboardAvoidingView, Platform, Switch,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/lib/auth';
import { createVendorEvent, getCategories } from '@/lib/api';
import { Category } from '@/lib/types';
import { Colors, FontSize, Radius, Shadow, Spacing } from '@/constants/theme';

const CITIES = [
  'Toronto', 'Mississauga', 'Brampton', 'Markham', 'Vaughan',
  'Richmond Hill', 'Oakville', 'Burlington', 'Ajax', 'Pickering',
  'Whitby', 'Oshawa', 'Milton', 'Newmarket', 'Aurora',
];

export default function NewEventScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { session } = useAuth();

  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryId, setCategoryId] = useState('');
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [city, setCity] = useState('');
  const [address, setAddress] = useState('');
  const [showCityPicker, setShowCityPicker] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isFree, setIsFree] = useState(true);
  const [price, setPrice] = useState('');
  const [isOnline, setIsOnline] = useState(false);
  const [ticketUrl, setTicketUrl] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    getCategories('event').then(setCategories).catch(console.error);
  }, []);

  async function handleSubmit() {
    if (!title.trim()) { Alert.alert('Required', 'Event title is required.'); return; }
    if (!startDate.trim()) { Alert.alert('Required', 'Start date is required (YYYY-MM-DD).'); return; }
    if (!session?.access_token) { Alert.alert('Error', 'You must be signed in.'); return; }

    setSubmitting(true);
    try {
      await createVendorEvent(session.access_token, {
        title: title.trim(),
        description: description.trim() || undefined,
        category_id: categoryId || undefined,
        city: city || undefined,
        address: address.trim() || undefined,
        start_date: startDate.trim(),
        end_date: endDate.trim() || undefined,
        is_free: isFree,
        price: !isFree && price ? parseFloat(price) : undefined,
        is_online: isOnline,
        ticket_url: ticketUrl.trim() || undefined,
        image_url: imageUrl.trim() || undefined,
      });
      Alert.alert('Submitted!', 'Your event has been submitted for review.', [{ text: 'OK', onPress: () => router.back() }]);
    } catch (e: any) {
      Alert.alert('Error', e.message ?? 'Failed to create event');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>New Event</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        {/* Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Event Details</Text>
          <View style={styles.field}>
            <Text style={styles.label}>Title <Text style={styles.required}>*</Text></Text>
            <TextInput style={styles.input} value={title} onChangeText={setTitle} placeholder="Event name" placeholderTextColor={Colors.textMuted} autoCapitalize="words" />
          </View>
          <View style={styles.field}>
            <Text style={styles.label}>Category</Text>
            <TouchableOpacity style={[styles.input, styles.pickerTrigger]} onPress={() => setShowCategoryPicker(!showCategoryPicker)}>
              <Text style={[styles.pickerText, !categoryId && styles.pickerPlaceholder]}>
                {categoryId ? (categories.find(c => c.id === categoryId)?.name ?? 'Select category') : 'Select category'}
              </Text>
              <Ionicons name={showCategoryPicker ? 'chevron-up' : 'chevron-down'} size={18} color={Colors.textMuted} />
            </TouchableOpacity>
            {showCategoryPicker && (
              <View style={styles.dropdown}>
                <ScrollView style={styles.dropdownScroll} nestedScrollEnabled>
                  {categories.map(cat => (
                    <TouchableOpacity key={cat.id} style={[styles.dropdownItem, categoryId === cat.id && styles.dropdownItemSelected]} onPress={() => { setCategoryId(cat.id); setShowCategoryPicker(false); }}>
                      <Text style={[styles.dropdownItemText, categoryId === cat.id && styles.dropdownItemTextSelected]}>{cat.icon} {cat.name}</Text>
                      {categoryId === cat.id && <Ionicons name="checkmark" size={16} color={Colors.primary} />}
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}
          </View>
          <View style={styles.field}>
            <Text style={styles.label}>Description</Text>
            <TextInput style={[styles.input, styles.textarea]} value={description} onChangeText={setDescription} placeholder="Tell people what this event is about" placeholderTextColor={Colors.textMuted} multiline numberOfLines={4} textAlignVertical="top" />
          </View>
        </View>

        {/* Date & Location */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Date & Location</Text>
          <View style={styles.field}>
            <Text style={styles.label}>Start Date <Text style={styles.required}>*</Text></Text>
            <TextInput style={styles.input} value={startDate} onChangeText={setStartDate} placeholder="YYYY-MM-DD or YYYY-MM-DDTHH:MM" placeholderTextColor={Colors.textMuted} autoCapitalize="none" />
          </View>
          <View style={styles.field}>
            <Text style={styles.label}>End Date</Text>
            <TextInput style={styles.input} value={endDate} onChangeText={setEndDate} placeholder="YYYY-MM-DD (optional)" placeholderTextColor={Colors.textMuted} autoCapitalize="none" />
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
            <Text style={styles.label}>Address</Text>
            <TextInput style={styles.input} value={address} onChangeText={setAddress} placeholder="123 Main St" placeholderTextColor={Colors.textMuted} autoCapitalize="words" />
          </View>
        </View>

        {/* Pricing & Format */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Pricing & Format</Text>
          <View style={styles.toggleRow}>
            <Text style={styles.label}>Free Event</Text>
            <Switch value={isFree} onValueChange={setIsFree} trackColor={{ true: Colors.primary }} thumbColor="#fff" />
          </View>
          {!isFree && (
            <View style={styles.field}>
              <Text style={styles.label}>Price ($)</Text>
              <TextInput style={styles.input} value={price} onChangeText={setPrice} placeholder="e.g. 25.00" placeholderTextColor={Colors.textMuted} keyboardType="decimal-pad" />
            </View>
          )}
          <View style={styles.toggleRow}>
            <Text style={styles.label}>Online Event</Text>
            <Switch value={isOnline} onValueChange={setIsOnline} trackColor={{ true: Colors.primary }} thumbColor="#fff" />
          </View>
          {isOnline && (
            <View style={styles.field}>
              <Text style={styles.label}>Online Event URL</Text>
              <TextInput style={styles.input} value={ticketUrl} onChangeText={setTicketUrl} placeholder="https://zoom.us/j/..." placeholderTextColor={Colors.textMuted} keyboardType="url" autoCapitalize="none" />
            </View>
          )}
          {!isOnline && (
            <View style={styles.field}>
              <Text style={styles.label}>Ticket URL</Text>
              <TextInput style={styles.input} value={ticketUrl} onChangeText={setTicketUrl} placeholder="https://eventbrite.com/..." placeholderTextColor={Colors.textMuted} keyboardType="url" autoCapitalize="none" />
            </View>
          )}
          <View style={styles.field}>
            <Text style={styles.label}>Cover Image URL</Text>
            <TextInput style={styles.input} value={imageUrl} onChangeText={setImageUrl} placeholder="https://..." placeholderTextColor={Colors.textMuted} keyboardType="url" autoCapitalize="none" />
          </View>
        </View>

        <TouchableOpacity style={[styles.submitBtn, submitting && { opacity: 0.6 }]} onPress={handleSubmit} disabled={submitting}>
          {submitting ? <ActivityIndicator color="#fff" /> : <><Ionicons name="checkmark-circle-outline" size={20} color="#fff" /><Text style={styles.submitBtnText}>Submit Event for Review</Text></>}
        </TouchableOpacity>

        <View style={{ height: insets.bottom + Spacing.xl }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: Colors.surfaceSecondary },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.md, paddingBottom: Spacing.sm, backgroundColor: Colors.surface, borderBottomWidth: 1, borderBottomColor: Colors.border, ...Shadow.sm },
  backBtn: { width: 36, height: 36, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: FontSize.md, fontWeight: '700', color: Colors.text },
  scroll: { flex: 1 },
  scrollContent: { padding: Spacing.md },
  section: { backgroundColor: Colors.surface, borderRadius: Radius.lg, padding: Spacing.md, marginBottom: Spacing.md, ...Shadow.sm },
  sectionTitle: { fontSize: FontSize.sm, fontWeight: '700', color: Colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: Spacing.md },
  field: { marginBottom: Spacing.md },
  label: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.text, marginBottom: 6 },
  required: { color: Colors.error },
  input: { borderWidth: 1, borderColor: Colors.border, borderRadius: Radius.md, paddingHorizontal: Spacing.md, paddingVertical: 11, fontSize: FontSize.base, color: Colors.text, backgroundColor: Colors.surfaceSecondary },
  textarea: { minHeight: 90, paddingTop: 11 },
  pickerTrigger: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  pickerText: { fontSize: FontSize.base, color: Colors.text },
  pickerPlaceholder: { color: Colors.textMuted },
  dropdown: { marginTop: 4, borderWidth: 1, borderColor: Colors.border, borderRadius: Radius.md, backgroundColor: Colors.surface, overflow: 'hidden', ...Shadow.md, zIndex: 10 },
  dropdownScroll: { maxHeight: 200 },
  dropdownItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.md, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: Colors.borderLight },
  dropdownItemSelected: { backgroundColor: Colors.primaryBg },
  dropdownItemText: { fontSize: FontSize.base, color: Colors.text },
  dropdownItemTextSelected: { color: Colors.primary, fontWeight: '600' },
  toggleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: Spacing.md },
  submitBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.sm, backgroundColor: Colors.primary, borderRadius: Radius.full, paddingVertical: 15, marginBottom: Spacing.md, ...Shadow.md },
  submitBtnText: { color: '#fff', fontWeight: '700', fontSize: FontSize.base },
});
