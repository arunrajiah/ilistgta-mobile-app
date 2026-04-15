/**
 * app.config.js — Dynamic Expo config
 *
 * Reads EXPO_PUBLIC_GOOGLE_MAPS_API_KEY from the environment and injects it
 * into the native iOS and Android configs at build time.
 *
 * react-native-maps uses the native Google Maps SDK which requires the API key
 * to be embedded in the native binary — it cannot be set at JS runtime.
 * This file allows the key to live in .env / EAS secret environment variables
 * rather than being hard-coded in app.json.
 *
 * Usage:
 *   • Local dev:   set EXPO_PUBLIC_GOOGLE_MAPS_API_KEY in .env, then `npx expo start`
 *   • EAS Build:   set EXPO_PUBLIC_GOOGLE_MAPS_API_KEY as an EAS secret in eas.json
 *                  or via `eas secret:create`
 *
 * The Map tab degrades gracefully when the key is empty — users see an info screen
 * rather than a crash.
 */

const mapsKey = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY ?? '';

module.exports = ({ config }) => ({
  ...config,

  ios: {
    ...config.ios,
    config: {
      ...config.ios?.config,
      // Injected into Info.plist → GMSApiKey at build time
      googleMapsApiKey: mapsKey,
    },
  },

  android: {
    ...config.android,
    config: {
      ...config.android?.config,
      // Injected into AndroidManifest.xml → com.google.android.geo.API_KEY
      googleMaps: {
        apiKey: mapsKey,
      },
    },
  },
});
