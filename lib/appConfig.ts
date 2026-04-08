import { createContext, useContext, useEffect, useState } from 'react';

const BASE_URL = (process.env.EXPO_PUBLIC_API_BASE_URL ?? '').replace(/\/$/, '');

export interface AppConfig {
  minVersion: string;
  currentVersion: string;
  iosUrl: string;
  androidUrl: string;
  maintenance: boolean;
  maintenanceMessage: string;
  features: {
    map: boolean;
    blog: boolean;
    events: boolean;
    coupons: boolean;
    newsletter: boolean;
  };
  homeSections: string[];
}

const DEFAULT_CONFIG: AppConfig = {
  minVersion: '1.0.0',
  currentVersion: '1.0.0',
  iosUrl: '',
  androidUrl: '',
  maintenance: false,
  maintenanceMessage: '',
  features: { map: true, blog: true, events: true, coupons: true, newsletter: true },
  homeSections: ['banners', 'categories', 'listings', 'events', 'coupons', 'newsletter'],
};

export const AppConfigContext = createContext<AppConfig>(DEFAULT_CONFIG);

export function useAppConfig() {
  return useContext(AppConfigContext);
}

export async function fetchAppConfig(): Promise<AppConfig> {
  try {
    const res = await fetch(`${BASE_URL}/api/mobile/config`);
    if (!res.ok) return DEFAULT_CONFIG;
    const { config } = await res.json();
    return config ?? DEFAULT_CONFIG;
  } catch {
    return DEFAULT_CONFIG;
  }
}

export { DEFAULT_CONFIG };
