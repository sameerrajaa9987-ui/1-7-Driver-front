/**
 * TabDock — flat bottom tab bar per the client kit: white surface, hairline
 * top border, 4 role destinations + Menu, active item in the role's accent
 * colour. Unread alerts show as a small accent dot.
 */
import React from "react";
import { Platform, View, Pressable, StyleSheet } from "react-native";
import * as Haptics from "expo-haptics";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LayoutGrid } from "lucide-react-native";
import type { LucideIcon } from "lucide-react-native";
import { palette, accentFor } from "@shared/designSystem";
import { Text } from "@shared/ui";
import { useAuthStore } from "@shared/store/useAuthStore";
import { useUnreadCount } from "@modules/notification/hooks/useNotifications";
import type { NavItem } from "./navItems";

export const MENU_ROUTE = "__menu__";

interface Props {
  items: NavItem[]; // primary items only (max 4)
  active: string;
  onNavigate: (name: string) => void;
}

export function TabDock({ items, active, onNavigate }: Props) {
  const insets = useSafeAreaInsets();
  const role = useAuthStore((s) => s.user?.role);
  const accent = accentFor(role);
  const unread = useUnreadCount();
  const hasUnread = (unread.data ?? 0) > 0;
  const alertsInDock = items.some((i) => i.name === "Notifications");

  return (
    <View style={[styles.bar, { paddingBottom: Math.max(insets.bottom, 8) }]}>
      {items.map((item) => (
        <DockTab
          key={item.name}
          icon={item.icon}
          label={item.label}
          accent={accent.main}
          active={active === item.name}
          badge={hasUnread && item.name === "Notifications"}
          onPress={() => onNavigate(item.name)}
        />
      ))}
      <DockTab
        icon={LayoutGrid}
        label="Menu"
        accent={accent.main}
        active={active === MENU_ROUTE}
        badge={hasUnread && !alertsInDock}
        onPress={() => onNavigate(MENU_ROUTE)}
      />
    </View>
  );
}

function DockTab({
  icon: Icon,
  label,
  accent,
  active,
  badge,
  onPress,
}: {
  icon: LucideIcon;
  label: string;
  accent: string;
  active: boolean;
  badge?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={() => {
        if (Platform.OS !== "web") Haptics.selectionAsync().catch(() => {});
        onPress();
      }}
      style={styles.tab}
    >
      <View>
        <Icon
          size={22}
          color={active ? accent : palette.ink[400]}
          strokeWidth={active ? 2.3 : 2}
        />
        {badge ? (
          <View style={[styles.badge, { backgroundColor: accent }]} />
        ) : null}
      </View>
      <Text
        variant="label-sm"
        weight={active ? "700" : "500"}
        numberOfLines={1}
        style={{
          color: active ? accent : palette.ink[500],
          fontSize: 10,
          marginTop: 3,
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  bar: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: "row",
    backgroundColor: palette.surface.primary,
    borderTopWidth: 1,
    borderTopColor: palette.border.default,
    paddingTop: 8,
    paddingHorizontal: 4,
  },
  tab: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 4,
  },
  badge: {
    position: "absolute",
    top: -2,
    right: -4,
    width: 8,
    height: 8,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: "#FFFFFF",
  },
});
