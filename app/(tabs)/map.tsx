import React, { useEffect, useRef, useState } from 'react';
import {
  View, Text, StyleSheet, ActivityIndicator, TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import type { Href } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MapView, { Marker, Callout, Region } from 'react-native-maps';
import { getListings } from '@/lib/api';
import { Listing } from '@/lib/types';
import { Colors, FontSize, Radius, Shadow, Spacing } from '@/constants/theme';

const GTA_REGION: Region = {
  latitude: 43.72,
  longitude: -79.42,
  latitudeDelta: 0.35,
  longitudeDelta: 0.35,
};

export default function MapScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const mapRef = useRef<MapView>(null);

  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getListings({ limit: 100 })
      .then(data => setListings(data.listings))
      .catch(e => setError(e.message ?? 'Failed to load businesses'))
      .finally(() => setLoading(false));
  }, []);

  // Only markers where lat/lng are available
  const mapped = listings.filter(l => l.latitude != null && l.longitude != null);

  if (loading) {
    return (
      <View style={[styles.center, { paddingTop: insets.top }]}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Loading map…</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.center, { paddingTop: insets.top }]}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={GTA_REGION}
        showsUserLocation
        showsMyLocationButton
      >
        {mapped.map(listing => (
          <Marker
            key={listing.id}
            coordinate={{ latitude: listing.latitude!, longitude: listing.longitude! }}
            title={listing.name}
            description={listing.city}
            pinColor={Colors.primary}
          >
            <Callout onPress={() => router.push(`/business/${listing.slug}` as Href)} tooltip={false}>
              <View style={styles.callout}>
                <Text style={styles.calloutName} numberOfLines={1}>{listing.name}</Text>
                <Text style={styles.calloutCity}>{listing.city}</Text>
                {listing.avg_rating > 0 && (
                  <Text style={styles.calloutRating}>⭐ {Number(listing.avg_rating).toFixed(1)}</Text>
                )}
                <Text style={styles.calloutLink}>View Details →</Text>
              </View>
            </Callout>
          </Marker>
        ))}
      </MapView>

      {/* Count badge */}
      <View style={[styles.badge, { top: insets.top + 12 }]}>
        <Text style={styles.badgeText}>{mapped.length} businesses</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.surfaceSecondary, gap: 12 },
  loadingText: { fontSize: FontSize.sm, color: Colors.textMuted },
  errorText: { fontSize: FontSize.base, color: Colors.textMuted, textAlign: 'center', paddingHorizontal: 32 },
  callout: { minWidth: 160, maxWidth: 220, padding: 10 },
  calloutName: { fontSize: 14, fontWeight: '700', color: '#111', marginBottom: 2 },
  calloutCity: { fontSize: 12, color: '#666', marginBottom: 2 },
  calloutRating: { fontSize: 12, color: '#666', marginBottom: 4 },
  calloutLink: { fontSize: 12, color: Colors.primary, fontWeight: '600' },
  badge: {
    position: 'absolute', alignSelf: 'center',
    backgroundColor: 'rgba(255,255,255,0.95)',
    paddingHorizontal: 14, paddingVertical: 6,
    borderRadius: Radius.full, ...Shadow.md,
  },
  badgeText: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.text },
});
