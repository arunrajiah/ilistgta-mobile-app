import React, { useEffect, useRef, useState } from 'react';
import {
  View, Text, StyleSheet, ActivityIndicator, TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import type { Href } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MapView, { Marker, Callout, Region } from 'react-native-maps';
import { getListings } from '@/lib/api';
import { useAppConfig } from '@/lib/appConfig';
import { Listing } from '@/lib/types';
import { Colors, FontSize, Radius, Shadow, Spacing } from '@/constants/theme';

const GTA_REGION: Region = {
  latitude: 43.72,
  longitude: -79.42,
  latitudeDelta: 0.35,
  longitudeDelta: 0.35,
};

// The Google Maps key is baked into the native binary via app.config.js + EXPO_PUBLIC_GOOGLE_MAPS_API_KEY.
// We read the same env var here so we can show a graceful fallback in development
// when no key is configured, rather than crashing or showing a blank map.
const BUILT_IN_MAPS_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY ?? '';

export default function MapScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const mapRef = useRef<MapView>(null);
  const appConfig = useAppConfig();

  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Map is considered configured if:
  //   1. A key was baked into the binary via EXPO_PUBLIC_GOOGLE_MAPS_API_KEY, OR
  //   2. The admin has set a Google Maps key in the remote config (apiKeys.googleMaps)
  // Note: the remote config key does NOT update the native SDK (that requires a rebuild),
  // but it signals admin intent and is shown in the "not configured" message for diagnosis.
  const mapsKey = BUILT_IN_MAPS_KEY || appConfig.apiKeys?.googleMaps || '';
  const mapEnabled = appConfig.features?.map !== false;
  const mapConfigured = !!mapsKey;

  useEffect(() => {
    // Only fetch listings if the map will actually render
    if (!mapEnabled || !mapConfigured) {
      setLoading(false);
      return;
    }

    getListings({ limit: 100 })
      .then(data => setListings(data.listings))
      .catch(e => setError(e.message ?? 'Failed to load businesses'))
      .finally(() => setLoading(false));
  }, [mapEnabled, mapConfigured]);

  // Feature disabled by admin
  if (!mapEnabled) {
    return (
      <View style={[styles.center, { paddingTop: insets.top }]}>
        <Text style={styles.emptyIcon}>🗺️</Text>
        <Text style={styles.emptyTitle}>Map Unavailable</Text>
        <Text style={styles.emptyMessage}>
          The map feature is currently disabled. Please check back later.
        </Text>
      </View>
    );
  }

  // No Google Maps API key configured — show helpful setup screen instead of crashing
  if (!mapConfigured) {
    return (
      <View style={[styles.center, { paddingTop: insets.top }]}>
        <Text style={styles.emptyIcon}>📍</Text>
        <Text style={styles.emptyTitle}>Map Not Configured</Text>
        <Text style={styles.emptyMessage}>
          A Google Maps API key is required to display the map.{'\n\n'}
          To set it up:{'\n'}
          {'  '}1. Go to the Admin Panel → Mobile → API Keys{'\n'}
          {'  '}2. Enter your Google Maps API key{'\n'}
          {'  '}3. Rebuild the app with EXPO_PUBLIC_GOOGLE_MAPS_API_KEY set
        </Text>
      </View>
    );
  }

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
        <Text style={styles.emptyIcon}>⚠️</Text>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => {
            setError('');
            setLoading(true);
            getListings({ limit: 100 })
              .then(data => setListings(data.listings))
              .catch(e => setError(e.message ?? 'Failed to load businesses'))
              .finally(() => setLoading(false));
          }}
        >
          <Text style={styles.retryText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Only markers where lat/lng are available
  const mapped = listings.filter(l => l.latitude != null && l.longitude != null);

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
        <Text style={styles.badgeText}>
          {mapped.length > 0 ? `${mapped.length} businesses` : 'No locations yet'}
        </Text>
      </View>

      {/* No lat/lng overlay (B4) */}
      {mapped.length === 0 && (
        <View style={styles.noLocationsOverlay}>
          <Text style={styles.emptyIcon}>📍</Text>
          <Text style={styles.emptyTitle}>No Business Locations Yet</Text>
          <Text style={styles.emptyMessage}>
            Business locations will appear on the map once vendors add their addresses.
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.surfaceSecondary,
    gap: 12,
    paddingHorizontal: 32,
  },
  loadingText: { fontSize: FontSize.sm, color: Colors.textMuted },
  emptyIcon: { fontSize: 48, marginBottom: 4 },
  emptyTitle: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: Colors.text,
    textAlign: 'center',
  },
  emptyMessage: {
    fontSize: FontSize.sm,
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: 20,
    marginTop: 4,
  },
  errorText: {
    fontSize: FontSize.base,
    color: Colors.textMuted,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 8,
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: Radius.full,
  },
  retryText: { color: '#fff', fontWeight: '600', fontSize: FontSize.sm },
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
  noLocationsOverlay: {
    position: 'absolute', bottom: 40, left: 20, right: 20,
    backgroundColor: 'rgba(255,255,255,0.96)',
    borderRadius: Radius.lg, padding: Spacing.lg,
    alignItems: 'center', ...Shadow.lg,
  },
});
