import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, FontSize } from '@/constants/theme';
import { useAppConfig } from '@/lib/appConfig';
import { useLang } from '@/lib/i18n';
import { Platform } from 'react-native';

const BUILT_IN_MAPS_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY ?? '';

export default function TabsLayout() {
  const config = useAppConfig();
  const { t } = useLang();
  const mapConfigured = !!(BUILT_IN_MAPS_KEY || config.apiKeys?.googleMaps);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textMuted,
        tabBarStyle: {
          borderTopWidth: 1,
          borderTopColor: Colors.border,
          paddingBottom: Platform.OS === 'ios' ? 20 : 8,
          paddingTop: 8,
          height: Platform.OS === 'ios' ? 84 : 64,
          backgroundColor: Colors.surface,
          elevation: 12,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.06,
          shadowRadius: 8,
        },
        tabBarLabelStyle: {
          fontSize: FontSize.xs,
          fontWeight: '600',
          marginTop: 2,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t('tabs.home'),
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'home' : 'home-outline'} size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: t('tabs.explore'),
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'search' : 'search-outline'} size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="events"
        options={{
          title: t('tabs.events'),
          href: config.features.events ? undefined : null,
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'calendar' : 'calendar-outline'} size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="coupons"
        options={{
          title: t('tabs.deals'),
          href: config.features.coupons ? undefined : null,
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'pricetag' : 'pricetag-outline'} size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="map"
        options={{
          title: t('tabs.map'),
          href: (config.features.map && mapConfigured) ? undefined : null,
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'map' : 'map-outline'} size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: t('tabs.profile'),
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'person' : 'person-outline'} size={24} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
