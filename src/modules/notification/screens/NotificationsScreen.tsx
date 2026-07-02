import React from "react";
import { View, Pressable, StyleSheet } from "react-native";
import { Bell, BellRing, CheckCheck } from "lucide-react-native";
import {
  useNotifications,
  useMarkAllRead,
  useMarkRead,
} from "@modules/notification/hooks/useNotifications";
import { Notification } from "@modules/notification/api/notificationApi";
import { palette, radius, outline } from "@shared/designSystem";
import { Screen, Text, VStack, HStack, Button, EmptyState } from "@shared/ui";

function timeAgo(iso: string) {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "";
  const diff = Math.max(0, Date.now() - then);
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString("en-IN");
}

export default function NotificationsScreen() {
  const { data, isLoading, refetch, isRefetching } = useNotifications({
    limit: 50,
  });
  const markAll = useMarkAllRead();
  const markRead = useMarkRead();

  const items = data?.data ?? [];
  const hasUnread = items.some((n) => !n.read);

  return (
    <Screen
      overline="Alerts"
      title="Notifications"
      subtitle={`${data?.meta?.total ?? 0} total`}
      refreshing={isRefetching || isLoading}
      onRefresh={refetch}
      right={
        hasUnread ? (
          <Button
            label="Mark all read"
            variant="secondary"
            fullWidth={false}
            icon={
              <CheckCheck
                size={18}
                color={palette.text.primary}
                strokeWidth={2}
              />
            }
            loading={markAll.isPending}
            onPress={() => markAll.mutate()}
          />
        ) : undefined
      }
    >
      {items.length === 0 ? (
        <EmptyState
          icon={Bell}
          title={isLoading ? "Loading…" : "You're all caught up"}
          message="Trip updates, payment receipts and alerts will show up here."
        />
      ) : (
        <VStack gap={10}>
          {items.map((n) => (
            <NotificationRow
              key={n.id}
              notification={n}
              onPress={() => {
                if (!n.read) markRead.mutate(n.id);
              }}
            />
          ))}
        </VStack>
      )}
    </Screen>
  );
}

function NotificationRow({
  notification,
  onPress,
}: {
  notification: Notification;
  onPress: () => void;
}) {
  const unread = !notification.read;
  const Icon = unread ? BellRing : Bell;
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        unread && styles.rowUnread,
        pressed && { opacity: 0.85 },
      ]}
    >
      <HStack gap={12} align="flex-start">
        <View style={[styles.iconWrap, unread && styles.iconWrapUnread]}>
          <Icon
            size={18}
            color={unread ? palette.teal[600] : palette.text.tertiary}
            strokeWidth={2}
          />
        </View>
        <VStack gap={3} flex={1}>
          <HStack justify="space-between" align="center" gap={8}>
            <Text
              variant="label-lg"
              tone="primary"
              weight={unread ? "700" : "600"}
              numberOfLines={1}
              style={{ flex: 1 }}
            >
              {notification.title}
            </Text>
            {unread ? <View style={styles.dot} /> : null}
          </HStack>
          {notification.body ? (
            <Text variant="body-sm" tone="secondary">
              {notification.body}
            </Text>
          ) : null}
          <Text variant="caption" tone="tertiary">
            {timeAgo(notification.createdAt)}
          </Text>
        </VStack>
      </HStack>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    backgroundColor: palette.surface.primary,
    borderRadius: radius.lg,
    borderWidth: outline.width,
    borderColor: outline.color,
    padding: 16,
  },
  rowUnread: {
    backgroundColor: palette.teal[50],
    borderColor: palette.teal[200],
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: palette.ink[100],
    alignItems: "center",
    justifyContent: "center",
  },
  iconWrapUnread: {
    backgroundColor: palette.teal[100],
  },
  dot: {
    width: 9,
    height: 9,
    borderRadius: 9999,
    backgroundColor: palette.teal[600],
  },
});
