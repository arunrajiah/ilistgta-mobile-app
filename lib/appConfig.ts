import { createContext, useContext } from 'react';

const BASE_URL = (process.env.EXPO_PUBLIC_API_BASE_URL ?? '').replace(/\/$/, '');

export interface AppConfig {
  // ── Version & store links ─────────────────────────────────────
  minVersion: string;
  currentVersion: string;
  iosUrl: string;
  androidUrl: string;

  // ── Maintenance ───────────────────────────────────────────────
  maintenance: boolean;
  maintenanceMessage: string;

  // ── Feature flags ─────────────────────────────────────────────
  features: {
    map: boolean;
    blog: boolean;
    events: boolean;
    coupons: boolean;
    newsletter: boolean;
  };

  // ── Home screen section order ──────────────────────────────────
  homeSections: string[];

  // ── Backend API ───────────────────────────────────────────────
  /** Override API base URL served from admin. Null = use EXPO_PUBLIC_API_BASE_URL */
  apiBaseUrl: string | null;

  // ── Third-party API keys ──────────────────────────────────────
  apiKeys: {
    /** Google Maps SDK key (also used for Places if googlePlaces is null) */
    googleMaps: string | null;
    /** Google Places API key for address autocomplete */
    googlePlaces: string | null;
    /** OneSignal App ID for push notifications */
    oneSignalAppId: string | null;
  };

  // ── Deep linking ──────────────────────────────────────────────
  deeplinkScheme: string;
}

export const DEFAULT_CONFIG: AppConfig = {
  minVersion: '1.0.0',
  currentVersion: '1.0.0',
  iosUrl: '',
  androidUrl: '',
  maintenance: false,
  maintenanceMessage: '',
  features: { map: true, blog: true, events: true, coupons: true, newsletter: true },
  homeSections: ['banners', 'categories', 'listings', 'events', 'coupons', 'newsletter'],
  apiBaseUrl: null,
  apiKeys: {
    googleMaps: null,
    googlePlaces: null,
    oneSignalAppId: null,
  },
  deeplinkScheme: 'ilistgta',
};

export const AppConfigContext = createContext<AppConfig>(DEFAULT_CONFIG);

export function useAppConfig() {
  return useContext(AppConfigContext);
}

/**
 * Deep-merge a partial remote config onto the defaults.
 * Any field missing from the remote response falls back to DEFAULT_CONFIG.
 */
function mergeConfig(remote: Record<string, any>): AppConfig {
  return {
    minVersion:         remote.minVersion         ?? DEFAULT_CONFIG.minVersion,
    currentVersion:     remote.currentVersion     ?? DEFAULT_CONFIG.currentVersion,
    iosUrl:             remote.iosUrl             ?? DEFAULT_CONFIG.iosUrl,
    androidUrl:         remote.androidUrl         ?? DEFAULT_CONFIG.androidUrl,
    maintenance:        remote.maintenance        ?? DEFAULT_CONFIG.maintenance,
    maintenanceMessage: remote.maintenanceMessage ?? DEFAULT_CONFIG.maintenanceMessage,
    features: {
      map:        remote.features?.map        ?? DEFAULT_CONFIG.features.map,
      blog:       remote.features?.blog       ?? DEFAULT_CONFIG.features.blog,
      events:     remote.features?.events     ?? DEFAULT_CONFIG.features.events,
      coupons:    remote.features?.coupons    ?? DEFAULT_CONFIG.features.coupons,
      newsletter: remote.features?.newsletter ?? DEFAULT_CONFIG.features.newsletter,
    },
    homeSections:   Array.isArray(remote.homeSections) && remote.homeSections.length > 0
      ? remote.homeSections
      : DEFAULT_CONFIG.homeSections,
    apiBaseUrl:     remote.apiBaseUrl  ?? DEFAULT_CONFIG.apiBaseUrl,
    apiKeys: {
      googleMaps:    remote.apiKeys?.googleMaps    ?? DEFAULT_CONFIG.apiKeys.googleMaps,
      googlePlaces:  remote.apiKeys?.googlePlaces  ?? DEFAULT_CONFIG.apiKeys.googlePlaces,
      oneSignalAppId: remote.apiKeys?.oneSignalAppId ?? DEFAULT_CONFIG.apiKeys.oneSignalAppId,
    },
    deeplinkScheme: remote.deeplinkScheme ?? DEFAULT_CONFIG.deeplinkScheme,
  };
}

export async function fetchAppConfig(): Promise<AppConfig> {
  // On web/browser, the config endpoint is on a different origin — skip the
  // fetch entirely to avoid a CORS error in the dev overlay. The app works
  // fine with DEFAULT_CONFIG while running via `expo start --web`.
  if (typeof window !== 'undefined' && typeof document !== 'undefined' &&
      window.location?.hostname === 'localhost') {
    return DEFAULT_CONFIG;
  }
  try {
    const signal = typeof AbortSignal?.timeout === 'function'
      ? AbortSignal.timeout(5000)
      : undefined;
    const res = await fetch(`${BASE_URL}/api/mobile/config`, { signal });
    if (!res.ok) return DEFAULT_CONFIG;
    const body = await res.json();
    const remote = body?.config;
    if (!remote || typeof remote !== 'object') return DEFAULT_CONFIG;
    return mergeConfig(remote);
  } catch {
    return DEFAULT_CONFIG;
  }
}
