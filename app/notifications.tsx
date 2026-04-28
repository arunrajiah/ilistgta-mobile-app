import React, { useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, FontSize, Radius, Spacing, Shadow } from '@/constants/theme';

type Notification = {
  id: string;
  avatar: string;
  message: string;
  time: string;
  type: 'sold' | 'saved' | 'rating' | 'enquiry' | 'deal';
  read: boolean;
};

const MOCK_NOTIFICATIONS: Notification[] = [
  { id: '1', avatar: 'J', message: 'Jane Mole has sold 43 Bourke Street, Newbridge NSW 837', time: '34 minutes ago', type: 'sold', read: false },
  { id: '2', avatar: 'P', message: 'Patrick Hazard saved your listing at 284 Flemming Street', time: '2 hours ago', type: 'saved', read: false },
  { id: '3', avatar: 'B', message: 'Bucky Mawez gave 284 Flemming Street a 5-star rating', time: '4 hours ago', type: 'rating', read: true },
  { id: '4', avatar: 'D', message: 'Diana Chan has sold 452 Rose Street, CA 734', time: 'A day ago', type: 'sold', read: true },
  { id: '5', avatar: 'M', message: 'Merry Vestro bought 454 Barito Street, NY 384', time: '2 weeks ago', type: 'enquiry', read: true },
  { id: '6', avatar: 'A', message: 'New deal available from Sparkle Cleaners — 50% off first cleaning!', time: '3 days ago', type: 'deal', read: true },
];

const ICON_MAP: Record<Notification['type'], React.ComponentProps<typeof Ionicons>['name']> = {
  sold: 'home',
  saved: 'heart',
  rating: 'star',
  enquiry: 'mail',
  deal: 'pricetag',
};
const COLOR_MAP: Record<Notification['type'], string> = {
  sold: Colors.primary,
  saved: '#ef4444',
  rating: Colors.star,
  enquiry: Colors.info,
  deal: '#FF6B35',
};

export default function NotificationsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);

  function markAllRead() {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }

  const unread = notifications.filter(n => !n.read).length;

  return (
    <View style={[s.root, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color={Colors.text} />
        </TouchableOpacity>
        <Text style={s.title}>Notifications</Text>
        {unread > 0 ? (
          <TouchableOpacity onPress={markAllRead} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Text style={s.markRead}>Mark all read</Text>
          </TouchableOpacity>
        ) : (
          <View style={{ width: 80 }} />
        )}
      </View>

      {unread > 0 && (
        <View style={s.unreadBanner}>
          <Text style={s.unreadText}>{unread} unread notification{unread > 1 ? 's' : ''}</Text>
        </View>
      )}

      <FlatList
        data={notifications}
        keyExtractor={n => n.id}
        contentContainerStyle={s.listContent}
        ItemSeparatorComponent={() => <View style={s.separator} />}
        ListEmptyComponent={
          <View style={s.empty}>
            <Ionicons name="notifications-off-outline" size={56} color={Colors.border} />
            <Text style={s.emptyTitle}>No notifications</Text>
            <Text style={s.emptyText}>You're all caught up!</Text>
          </View>
        }
        renderItem={({ item }) => <NotificationRow item={item} />}
      />
    </View>
  );
}

function NotificationRow({ item }: { item: Notification }) {
  const iconName = ICON_MAP[item.type];
  const iconColor = COLOR_MAP[item.type];

  return (
    <TouchableOpacity style={[s.row, !item.read && s.rowUnread]} activeOpacity={0.7}>
      {/* Avatar */}
      <View style={[s.avatar, { backgroundColor: iconColor + '18' }]}>
        <Text style={[s.avatarText, { color: iconColor }]}>{item.avatar}</Text>
      </View>

      {/* Content */}
      <View style={s.rowContent}>
        <Text style={[s.message, !item.read && s.messageUnread]} numberOfLines={3}>
          {item.message}
        </Text>
        <View style={s.metaRow}>
          <Ionicons name={iconName} size={12} color={iconColor} />
          <Text style={s.time}>{item.time}</Text>
        </View>
      </View>

      {/* Unread dot */}
      {!item.read && <View style={s.unreadDot} />}
    </TouchableOpacity>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.surface },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.md,
    borderBottomWidth: 1, borderBottomColor: Colors.borderLight,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: Colors.surfaceSecondary,
    justifyContent: 'center', alignItems: 'center',
  },
  title: { fontSize: FontSize.lg, fontWeight: '800', color: Colors.text },
  markRead: { fontSize: FontSize.sm, color: Colors.primary, fontWeight: '700' },

  unreadBanner: {
    backgroundColor: Colors.primaryBg,
    paddingHorizontal: Spacing.md, paddingVertical: 8,
    borderBottomWidth: 1, borderBottomColor: Colors.primary + '20',
  },
  unreadText: { fontSize: FontSize.sm, color: Colors.primary, fontWeight: '600' },

  listContent: { paddingBottom: Spacing.xxl },
  separator: { height: 1, backgroundColor: Colors.borderLight, marginLeft: 72 },

  row: {
    flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.md,
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.md,
    backgroundColor: Colors.surface,
  },
  rowUnread: { backgroundColor: Colors.primaryBg + '60' },

  avatar: {
    width: 48, height: 48, borderRadius: 24,
    justifyContent: 'center', alignItems: 'center',
  },
  avatarText: { fontSize: FontSize.lg, fontWeight: '800' },

  rowContent: { flex: 1, gap: 6 },
  message: {
    fontSize: FontSize.base, color: Colors.textSecondary,
    lineHeight: 20,
  },
  messageUnread: { color: Colors.text, fontWeight: '500' },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  time: { fontSize: FontSize.xs, color: Colors.textMuted },

  unreadDot: {
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: Colors.primary,
    marginTop: 6,
  },

  empty: { alignItems: 'center', paddingTop: 80, gap: Spacing.sm },
  emptyTitle: { fontSize: FontSize.lg, fontWeight: '700', color: Colors.text },
  emptyText: { fontSize: FontSize.base, color: Colors.textMuted },
});
