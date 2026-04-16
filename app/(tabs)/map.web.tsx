// Web stub — react-native-maps is native-only. The map tab is hidden on web.
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, FontSize } from '@/constants/theme';

export default function MapScreenWeb() {
  return (
    <View style={styles.center}>
      <Text style={styles.icon}>🗺️</Text>
      <Text style={styles.title}>Map</Text>
      <Text style={styles.msg}>The interactive map is available in the mobile app.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8f9fa', gap: 12, padding: 32 },
  icon: { fontSize: 48 },
  title: { fontSize: FontSize.xl, fontWeight: '700', color: Colors.text },
  msg: { fontSize: FontSize.base, color: Colors.textMuted, textAlign: 'center' },
});
