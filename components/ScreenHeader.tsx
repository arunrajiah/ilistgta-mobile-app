import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, FontSize, Shadow, Spacing } from '@/constants/theme';

interface Props {
  title: string;
  /** Called when back is pressed. Defaults to router.back() */
  onBack?: () => void;
  /** Render something custom on the right side instead of the home icon */
  rightElement?: React.ReactNode;
  /** Hide the home button (e.g. when you're already on a root-level flow) */
  hideHome?: boolean;
}

export default function ScreenHeader({ title, onBack, rightElement, hideHome }: Props) {
  const router = useRouter();

  return (
    <View style={styles.header}>
      <TouchableOpacity style={styles.iconBtn} onPress={onBack ?? (() => router.back())}>
        <Ionicons name="chevron-back" size={24} color={Colors.text} />
      </TouchableOpacity>

      <Text style={styles.title} numberOfLines={1}>{title}</Text>

      {rightElement ? (
        <View style={styles.iconBtn}>{rightElement}</View>
      ) : hideHome ? (
        <View style={styles.iconBtn} />
      ) : (
        <TouchableOpacity
          style={styles.iconBtn}
          onPress={() => router.push('/(tabs)/')}
          accessibilityLabel="Go to Home"
          accessibilityRole="button"
        >
          <Ionicons name="home-outline" size={22} color={Colors.primary} />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
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
  iconBtn: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    flex: 1,
    textAlign: 'center',
    fontSize: FontSize.md,
    fontWeight: '700',
    color: Colors.text,
  },
});
