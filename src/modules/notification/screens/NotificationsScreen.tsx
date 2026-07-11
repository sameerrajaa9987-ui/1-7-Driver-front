/**
 * NotificationsScreen — client-kit Alerts: filter tabs (All / Trips / Fees /
 * Others), Today / Yesterday / Earlier grouping, and icon-tile rows whose
 * icon + tint follow the notification type.
 */
import React, { useMemo, useState } from "react";
import { View, Pressable, StyleSheet } from "react-native";
import {
  Bell,
  CheckCheck,
  Bus,
  Wallet,
  ShieldAlert,
  MessageSquareWarning,
} from "lucide-react-native";
import type { LucideIcon } from "lucide-react-native";
import {
  useNotifications,
  useMarkAllRead,
  useMarkRead,
} from "@modules/notification/hooks/useNotifications";
import { Notification } from "@modules/notification/api/notificationApi";
import { palette, radius, outline, tints, accent } from "@shared/designSystem";
import {
  Screen,
  Text,
  VStack,
  HStack,
  EmptyState,
  HeaderIconButton,
} from "@shared/ui";

function timeAgo(iso: string) {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "";
  const diff = Math.max(0, Date.now() - then);
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return new Date(iso).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

type FilterKey = "all" | "trips" | "fees" | "others";

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: "all", label: "All" },
  { key: "trips", label: "Trips" },
  { key: "fees", label: "Fees" },
  { key: "others", label: "Others" },
];

function bucket(n: Notification): Exclude<FilterKey, "all"> {
  if (n.type.startsWith("trip")) return "trips";
  if (n.type.startsWith("fee") || n.type.startsWith("payment")) return "fees";
  return "others";
}

/** Icon + tint per notification type (mockup icon tiles). */
function typeMeta(n: Notification): {
  icon: LucideIcon;
  tint: keyof typeof tints;
} {
  if (n.type === "sos") return { icon: ShieldAlert, tint: "red" };
  if (n.type.startsWith("complaint"))
    return { icon: MessageSquareWarning, tint: "amber" };
  const b = bucket(n);
  if (b === "trips") return { icon: Bus, tint: "violet" };
  if (b === "fees") return { icon: Wallet, tint: "green" };
  return { icon: Bell, tint: "blue" };
}

/** Groups by calendar day → "Today" / "Yesterday" / date label. */
function dayLabel(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const startOf = (x: Date) =>
    new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime();
  const diffDays = Math.round((startOf(now) - startOf(d)) / 86400000);
  if (diffDays <= 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "long" });
}

export default function NotificationsScreen() {
  const [filter, setFilter] = useState<FilterKey>("all");

  const { data, isLoading, refetch, isRefetching } = useNotifications({
    limit: 50,
  });
  const markAll = useMarkAllRead();
  const markRead = useMarkRead();

  const items = useMemo(() => data?.data ?? [], [data]);
  const hasUnread = items.some((n) => !n.read);

  const groups = useMemo(() => {
    const filtered =
      filter === "all" ? items : items.filter((n) => bucket(n) === filter);
    const out: { label: string; items: Notification[] }[] = [];
    for (const n of filtered) {
      const label = dayLabel(n.createdAt);
      const last = out[out.length - 1];
      if (last && last.label === label) last.items.push(n);
      else out.push({ label, items: [n] });
    }
    return out;
  }, [items, filter]);

  return (
    <Screen
      title="Alerts"
      refreshing={isRefetching || isLoading}
      onRefresh={refetch}
      right={
        hasUnread ? (
          <HeaderIconButton
            icon={CheckCheck}
            tint
            onPress={() => markAll.mutate()}
          />
        ) : undefined
      }
    >
      {/* Filter tabs */}
      <HStack gap={8}>
        {FILTERS.map((f) => {
          const active = filter === f.key;
          return (
            <Pressable
              key={f.key}
              onPress={() => setFilter(f.key)}
              style={[
                styles.filter,
                active
                  ? { backgroundColor: accent.main, borderColor: accent.main }
                  : null,
              ]}
            >
              <Text
                variant="label"
                weight="600"
                style={{
                  color: active ? "#FFFFFF" : palette.text.secondary,
                }}
              >
                {f.label}
              </Text>
            </Pressable>
          );
        })}
      </HStack>

      {groups.length === 0 ? (
        <EmptyState
          icon={Bell}
          title={isLoading ? "Loading…" : "You're all caught up"}
          message="Trip updates, payment receipts and alerts will show up here."
        />
      ) : (
        <VStack gap={18} style={{ marginTop: 18 }}>
          {groups.map((g) => (
            <VStack key={g.label} gap={10}>
              <Text variant="label" weight="700" tone="tertiary">
                {g.label}
              </Text>
              {g.items.map((n) => (
                <NotificationRow
                  key={n.id}
                  notification={n}
                  accent={accent.main}
                  onPress={() => {
                    if (!n.read) markRead.mutate(n.id);
                  }}
                />
              ))}
            </VStack>
          ))}
        </VStack>
      )}
    </Screen>
  );
}

function NotificationRow({
  notification,
  accent,
  onPress,
}: {
  notification: Notification;
  accent: string;
  onPress: () => void;
}) {
  const unread = !notification.read;
  const meta = typeMeta(notification);
  const t = tints[meta.tint];
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && { opacity: 0.85 }]}
    >
      <HStack gap={12} align="flex-start">
        <View style={[styles.iconWrap, { backgroundColor: t.bg }]}>
          <meta.icon size={17} color={t.icon} strokeWidth={2} />
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
            {unread ? (
              <View style={[styles.dot, { backgroundColor: accent }]} />
            ) : null}
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
  filter: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: radius.full,
    borderWidth: outline.width,
    borderColor: outline.color,
    backgroundColor: palette.surface.primary,
  },
  row: {
    backgroundColor: palette.surface.primary,
    borderRadius: radius.lg,
    borderWidth: outline.width,
    borderColor: outline.color,
    padding: 14,
  },
  iconWrap: {
    width: 38,
    height: 38,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  dot: {
    width: 9,
    height: 9,
    borderRadius: 9999,
  },
});
