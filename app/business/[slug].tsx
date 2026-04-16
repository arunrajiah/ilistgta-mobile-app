import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Image, Linking, ActivityIndicator, Alert, TextInput, Modal, Platform,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, FontSize, Radius, Shadow, Spacing } from '@/constants/theme';
import { getListingBySlug, getPrimaryImage, submitEnquiry, checkSaved, saveListing, unsaveListing, submitReview } from '@/lib/api';
import { Listing, Review } from '@/lib/types';
import { useAuth } from '@/lib/auth';

function safeOpen(url: string) {
  try {
    const parsed = new URL(url);
    if (!['http:', 'https:', 'tel:', 'mailto:'].includes(parsed.protocol)) return;
    Linking.openURL(url).catch(() => Alert.alert('Error', 'Could not open link.'));
  } catch {
    Alert.alert('Error', 'Invalid link.');
  }
}

export default function BusinessDetailScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const { user, session } = useAuth();
  const [listing, setListing] = useState<Listing | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [enquiryVisible, setEnquiryVisible] = useState(false);

  // Save / favourites state
  const [isSaved, setIsSaved] = useState(false);
  const [savedId, setSavedId] = useState<string | null>(null);
  const [savingFav, setSavingFav] = useState(false);

  // Enquiry form state
  const [eName, setEName] = useState(user?.user_metadata?.full_name ?? '');
  const [eEmail, setEEmail] = useState(user?.email ?? '');
  const [ePhone, setEPhone] = useState('');
  const [eMessage, setEMessage] = useState('');
  const [sending, setSending] = useState(false);

  // Review modal state
  const [reviewVisible, setReviewVisible] = useState(false);
  const [rRating, setRRating] = useState(0);
  const [rTitle, setRTitle] = useState('');
  const [rBody, setRBody] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  // Hero image error state
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    if (!slug) return;
    getListingBySlug(slug)
      .then(({ listing, reviews }) => { setListing(listing); setReviews(reviews); })
      .catch(e => Alert.alert('Error', e.message))
      .finally(() => setLoading(false));
  }, [slug]);

  // Check saved status once listing and session are available
  useEffect(() => {
    if (!listing || !session?.access_token) return;
    checkSaved(session.access_token, listing.id)
      .then(({ saved, savedId: sid }) => { setIsSaved(saved); setSavedId(sid); })
      .catch(() => { /* silently ignore — non-critical */ });
  }, [listing, session]);

  async function toggleSave() {
    if (!listing) return;

    if (!user || !session?.access_token) {
      Alert.alert('Sign in required', 'Please sign in to save businesses to your favourites.');
      return;
    }

    setSavingFav(true);
    try {
      if (isSaved && savedId) {
        await unsaveListing(session.access_token, savedId);
        setIsSaved(false);
        setSavedId(null);
      } else {
        const result = await saveListing(session.access_token, listing.id);
        setIsSaved(true);
        // Some API implementations return the new row id; use it if available.
        if (result && typeof (result as any).id === 'string') {
          setSavedId((result as any).id);
        } else {
          // Re-fetch to get the savedId for future unsave
          const check = await checkSaved(session.access_token, listing.id);
          setSavedId(check.savedId);
        }
      }
    } catch (e: any) {
      Alert.alert('Error', e.message ?? 'Could not update saved status. Please try again.');
    } finally {
      setSavingFav(false);
    }
  }

  async function sendReview() {
    if (rRating === 0) {
      Alert.alert('Select a rating', 'Please tap a star to rate this business.');
      return;
    }
    if (rBody.trim().length < 10) {
      Alert.alert('Review too short', 'Please write at least 10 characters.');
      return;
    }
    if (!user || !session?.access_token) {
      Alert.alert('Sign in required', 'Please sign in to leave a review.');
      return;
    }
    setSubmittingReview(true);
    try {
      await submitReview(session.access_token, {
        listing_id: listing!.id,
        rating: rRating,
        title: rTitle.trim() || undefined,
        body: rBody.trim(),
      });
      setReviewVisible(false);
      setRRating(0); setRTitle(''); setRBody('');
      Alert.alert('Review submitted!', 'Thank you — your review will appear once approved.');
    } catch (e: any) {
      Alert.alert('Error', e.message ?? 'Could not submit review.');
    } finally {
      setSubmittingReview(false);
    }
  }

  async function sendEnquiry() {
    if (!listing || !eName.trim() || !eEmail.trim() || !eMessage.trim()) {
      Alert.alert('Missing fields', 'Please fill in name, email and message.');
      return;
    }
    const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!EMAIL_RE.test(eEmail.trim())) {
      Alert.alert('Invalid email', 'Please enter a valid email address.');
      return;
    }
    setSending(true);
    try {
      await submitEnquiry({ listing_id: listing.id, name: eName, email: eEmail, phone: ePhone, message: eMessage });
      setEnquiryVisible(false);
      Alert.alert('Sent!', 'Your enquiry has been sent. The business will get back to you soon.');
      setEMessage('');
    } catch (e: any) {
      Alert.alert('Error', e.message);
    } finally {
      setSending(false);
    }
  }

  if (loading) return <View style={styles.loader}><ActivityIndicator size="large" color={Colors.primary} /></View>;
  if (!listing) return <View style={styles.loader}><Text>Listing not found.</Text></View>;

  const imageUrl = getPrimaryImage(listing.listing_images) ?? `https://picsum.photos/seed/${listing.slug}/800/500`;
  const avgRating = Number(listing.avg_rating).toFixed(1);

  return (
    <>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Hero image */}
        {imgError ? (
          <View style={[styles.heroImage, styles.heroFallback]}>
            <Ionicons name="image-outline" size={48} color={Colors.border} />
            <Text style={styles.heroFallbackText}>{listing.name[0]?.toUpperCase()}</Text>
          </View>
        ) : (
          <Image
            source={{ uri: imageUrl }}
            style={styles.heroImage}
            onError={() => setImgError(true)}
          />
        )}

        <View style={styles.content}>
          {/* Title row */}
          <View style={styles.titleRow}>
            <View style={{ flex: 1 }}>
              {listing.categories && (
                <Text style={styles.category}>{listing.categories.icon} {listing.categories.name}</Text>
              )}
              <Text style={styles.name}>{listing.name}</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              {listing.is_verified && (
                <View style={styles.verifiedBadge}>
                  <Ionicons name="checkmark-circle" size={16} color={Colors.primary} />
                  <Text style={styles.verifiedText}>Verified</Text>
                </View>
              )}
              <TouchableOpacity
                onPress={toggleSave}
                disabled={savingFav}
                accessibilityLabel={isSaved ? 'Remove from saved businesses' : 'Save this business'}
                accessibilityRole="button"
                accessibilityState={{ checked: isSaved }}
                style={styles.saveBtn}
              >
                <Text style={styles.saveHeart}>{isSaved ? '❤️' : '🤍'}</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Rating — only shown when reviews exist */}
          {listing.review_count > 0 && (
            <View style={styles.ratingRow}>
              {[1,2,3,4,5].map(s => (
                <Ionicons key={s} name={s <= Math.round(listing.avg_rating) ? 'star' : 'star-outline'} size={18} color={Colors.star} />
              ))}
              <Text style={styles.ratingNum}>{avgRating}</Text>
              <Text style={styles.ratingCount}>({listing.review_count} reviews)</Text>
            </View>
          )}

          {/* Action buttons */}
          <View style={styles.actions}>
            {listing.phone && (
              <TouchableOpacity style={styles.actionBtn} onPress={() => safeOpen(`tel:${listing.phone}`)}>
                <Ionicons name="call" size={18} color={Colors.primary} />
                <Text style={styles.actionBtnText}>Call</Text>
              </TouchableOpacity>
            )}
            {listing.website && (
              <TouchableOpacity style={styles.actionBtn} onPress={() => safeOpen(listing.website!)}>
                <Ionicons name="globe" size={18} color={Colors.primary} />
                <Text style={styles.actionBtnText}>Website</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity style={[styles.actionBtn, styles.actionBtnPrimary]} onPress={() => setEnquiryVisible(true)}>
              <Ionicons name="mail" size={18} color="#fff" />
              <Text style={[styles.actionBtnText, { color: '#fff' }]}>Enquire</Text>
            </TouchableOpacity>
            {listing.address && (
              <TouchableOpacity
                style={styles.actionBtn}
                onPress={() => {
                  const q = encodeURIComponent(`${listing.address}, ${listing.city}, Ontario, Canada`);
                  const url = Platform.OS === 'ios'
                    ? `maps://maps.apple.com/?q=${q}`
                    : `https://maps.google.com/?q=${q}`;
                  Linking.openURL(url).catch(() =>
                    Linking.openURL(`https://maps.google.com/?q=${q}`)
                  );
                }}
              >
                <Ionicons name="navigate" size={18} color={Colors.primary} />
                <Text style={styles.actionBtnText}>Directions</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Details */}
          <View style={styles.detailsCard}>
            {listing.address && (
              <View style={styles.detailRow}>
                <Ionicons name="location" size={18} color={Colors.primary} />
                <Text style={styles.detailText}>{listing.address}, {listing.city}</Text>
              </View>
            )}
            {listing.phone && (
              <View style={styles.detailRow}>
                <Ionicons name="call" size={18} color={Colors.primary} />
                <Text style={styles.detailText}>{listing.phone}</Text>
              </View>
            )}
            {listing.website && (
              <View style={styles.detailRow}>
                <Ionicons name="globe" size={18} color={Colors.primary} />
                <Text style={[styles.detailText, styles.link]} onPress={() => safeOpen(listing.website!)}>
                  {listing.website}
                </Text>
              </View>
            )}
          </View>

          {/* Description */}
          {listing.description && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>About</Text>
              <Text style={styles.description}>{listing.description}</Text>
            </View>
          )}

          {/* Reviews */}
          <View style={styles.section}>
            <View style={styles.reviewsHeader}>
              <Text style={styles.sectionTitle}>Reviews</Text>
              <TouchableOpacity
                style={styles.writeReviewBtn}
                onPress={() => {
                  if (!user) {
                    Alert.alert('Sign in required', 'Please sign in to leave a review.');
                    return;
                  }
                  setReviewVisible(true);
                }}
              >
                <Ionicons name="pencil" size={14} color={Colors.primary} />
                <Text style={styles.writeReviewText}>Write a Review</Text>
              </TouchableOpacity>
            </View>
          {reviews.length === 0 && (
            <Text style={styles.noReviews}>No reviews yet. Be the first!</Text>
          )}
          {reviews.map(review => (
            <View key={review.id} style={styles.reviewCard}>
              <View style={styles.reviewHeader}>
                <View style={styles.reviewAvatar}>
                  <Text style={styles.reviewAvatarText}>
                    {(review.user_profiles?.full_name ?? 'U')[0].toUpperCase()}
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.reviewName}>{review.user_profiles?.full_name ?? 'Anonymous'}</Text>
                  <View style={{ flexDirection: 'row', gap: 2 }}>
                    {[1,2,3,4,5].map(s => (
                      <Ionicons key={s} name={s <= review.rating ? 'star' : 'star-outline'} size={12} color={Colors.star} />
                    ))}
                  </View>
                </View>
              </View>
              {review.title && <Text style={styles.reviewTitle}>{review.title}</Text>}
              <Text style={styles.reviewBody}>{review.body}</Text>
            </View>
          ))}
          </View>

          <View style={{ height: Spacing.xxl }} />
        </View>
      </ScrollView>

      {/* Review modal */}
      <Modal visible={reviewVisible} animationType="slide" presentationStyle="pageSheet">
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Write a Review</Text>
          <TouchableOpacity onPress={() => setReviewVisible(false)}>
            <Ionicons name="close" size={24} color={Colors.text} />
          </TouchableOpacity>
        </View>
        <ScrollView style={styles.modalContent} keyboardShouldPersistTaps="handled">
          <Text style={styles.inputLabel}>Rating *</Text>
          <View style={styles.starRow}>
            {[1,2,3,4,5].map(s => (
              <TouchableOpacity key={s} onPress={() => setRRating(s)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Ionicons name={s <= rRating ? 'star' : 'star-outline'} size={36} color={Colors.star} />
              </TouchableOpacity>
            ))}
          </View>
          <Text style={styles.inputLabel}>Title (optional)</Text>
          <TextInput style={styles.input} value={rTitle} onChangeText={setRTitle} placeholder="Summarise your experience" maxLength={120} />
          <Text style={styles.inputLabel}>Review *</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={rBody}
            onChangeText={setRBody}
            placeholder="Share details of your experience (min 10 characters)"
            multiline
            numberOfLines={5}
            textAlignVertical="top"
          />
          <TouchableOpacity
            style={[styles.sendBtn, submittingReview && { opacity: 0.7 }]}
            onPress={sendReview}
            disabled={submittingReview}
          >
            {submittingReview
              ? <ActivityIndicator color="#fff" />
              : <Text style={styles.sendBtnText}>Submit Review</Text>
            }
          </TouchableOpacity>
          <Text style={styles.reviewDisclaimer}>
            Reviews are moderated and will appear once approved by our team.
          </Text>
        </ScrollView>
      </Modal>

      {/* Enquiry modal */}
      <Modal visible={enquiryVisible} animationType="slide" presentationStyle="pageSheet">
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Send Enquiry</Text>
          <TouchableOpacity onPress={() => setEnquiryVisible(false)}>
            <Ionicons name="close" size={24} color={Colors.text} />
          </TouchableOpacity>
        </View>
        <ScrollView style={styles.modalContent} keyboardShouldPersistTaps="handled">
          <Text style={styles.inputLabel}>Name *</Text>
          <TextInput style={styles.input} value={eName} onChangeText={setEName} placeholder="Your name" />
          <Text style={styles.inputLabel}>Email *</Text>
          <TextInput style={styles.input} value={eEmail} onChangeText={setEEmail} placeholder="your@email.com" keyboardType="email-address" autoCapitalize="none" />
          <Text style={styles.inputLabel}>Phone</Text>
          <TextInput style={styles.input} value={ePhone} onChangeText={setEPhone} placeholder="+1 (416) 000-0000" keyboardType="phone-pad" />
          <Text style={styles.inputLabel}>Message *</Text>
          <TextInput style={[styles.input, styles.textArea]} value={eMessage} onChangeText={setEMessage} placeholder="How can this business help you?" multiline numberOfLines={4} textAlignVertical="top" />
          <TouchableOpacity style={[styles.sendBtn, sending && { opacity: 0.7 }]} onPress={sendEnquiry} disabled={sending}>
            {sending ? <ActivityIndicator color="#fff" /> : <Text style={styles.sendBtnText}>Send Enquiry</Text>}
          </TouchableOpacity>
        </ScrollView>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.surfaceSecondary },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  heroImage: { width: '100%', height: 260, resizeMode: 'cover', backgroundColor: Colors.border },
  heroFallback: {
    justifyContent: 'center', alignItems: 'center', gap: 8,
    backgroundColor: Colors.surfaceSecondary,
  },
  heroFallbackText: {
    fontSize: FontSize.xxxl, fontWeight: '800', color: Colors.textMuted,
  },
  content: { padding: Spacing.md },
  titleRow: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.sm, marginBottom: 8 },
  category: { fontSize: FontSize.sm, color: Colors.primary, fontWeight: '600', marginBottom: 4 },
  name: { fontSize: FontSize.xl, fontWeight: '800', color: Colors.text },
  verifiedBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: Colors.primaryBg, borderRadius: Radius.full, paddingHorizontal: 10, paddingVertical: 4 },
  verifiedText: { fontSize: FontSize.xs, color: Colors.primary, fontWeight: '600' },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: Spacing.md },
  ratingNum: { fontSize: FontSize.base, fontWeight: '700', color: Colors.text, marginLeft: 4 },
  ratingCount: { fontSize: FontSize.sm, color: Colors.textMuted },
  actions: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.md },
  actionBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    borderWidth: 1.5, borderColor: Colors.primary, borderRadius: Radius.full, paddingVertical: 10,
  },
  actionBtnPrimary: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  actionBtnText: { color: Colors.primary, fontWeight: '700', fontSize: FontSize.sm },
  detailsCard: { backgroundColor: Colors.surface, borderRadius: Radius.lg, padding: Spacing.md, ...Shadow.sm, marginBottom: Spacing.md, gap: 10 },
  detailRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  detailText: { flex: 1, fontSize: FontSize.base, color: Colors.text, lineHeight: 22 },
  link: { color: Colors.primary },
  section: { marginBottom: Spacing.lg },
  sectionTitle: { fontSize: FontSize.lg, fontWeight: '800', color: Colors.text, marginBottom: Spacing.sm },
  description: { fontSize: FontSize.base, color: Colors.textSecondary, lineHeight: 24 },
  reviewCard: { backgroundColor: Colors.surface, borderRadius: Radius.lg, padding: Spacing.md, ...Shadow.sm, marginBottom: Spacing.sm },
  reviewHeader: { flexDirection: 'row', gap: Spacing.sm, marginBottom: 8 },
  reviewAvatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.primary, justifyContent: 'center', alignItems: 'center' },
  reviewAvatarText: { color: '#fff', fontWeight: '700', fontSize: FontSize.base },
  reviewName: { fontSize: FontSize.base, fontWeight: '700', color: Colors.text, marginBottom: 2 },
  reviewTitle: { fontSize: FontSize.base, fontWeight: '700', color: Colors.text, marginBottom: 4 },
  reviewBody: { fontSize: FontSize.sm, color: Colors.textSecondary, lineHeight: 20 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: Spacing.md, borderBottomWidth: 1, borderBottomColor: Colors.border },
  modalTitle: { fontSize: FontSize.lg, fontWeight: '800', color: Colors.text },
  modalContent: { padding: Spacing.md },
  inputLabel: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.text, marginBottom: 4, marginTop: Spacing.md },
  input: { backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border, borderRadius: Radius.md, padding: Spacing.md, fontSize: FontSize.base, color: Colors.text },
  textArea: { height: 120, textAlignVertical: 'top' },
  sendBtn: { backgroundColor: Colors.primary, borderRadius: Radius.full, paddingVertical: 14, alignItems: 'center', marginTop: Spacing.lg },
  sendBtnText: { color: '#fff', fontWeight: '700', fontSize: FontSize.base },
  saveBtn: { padding: 6, borderRadius: Radius.full },
  saveHeart: { fontSize: 24, lineHeight: 28 },
  reviewsHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: Spacing.sm },
  writeReviewBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: Colors.primaryBg, paddingHorizontal: 12, paddingVertical: 6, borderRadius: Radius.full, borderWidth: 1, borderColor: Colors.primary + '40' },
  writeReviewText: { fontSize: FontSize.sm, color: Colors.primary, fontWeight: '600' },
  noReviews: { fontSize: FontSize.sm, color: Colors.textMuted, textAlign: 'center', paddingVertical: Spacing.md },
  starRow: { flexDirection: 'row', gap: Spacing.sm, marginVertical: Spacing.sm },
  reviewDisclaimer: { fontSize: FontSize.xs, color: Colors.textMuted, textAlign: 'center', marginTop: Spacing.sm, lineHeight: 17 },
});
