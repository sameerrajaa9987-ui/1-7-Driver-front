/**
 * TabDock — the floating midnight dock (2026 pattern; replaces the old
 * hamburger + slide-over sidebar on phones). Four role-specific primary
 * destinations plus a Menu hub. Active tab lights up bus-amber on a glass
 * pill; the dock itself is a floating midnight-navy capsule.
 */
import React from "react";
import { Platform, View, Pressable, StyleSheet } from "react-native";
import * as Haptics from "expo-haptics";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { LayoutGrid } from "lucide-react-native";
import type { LucideIcon } from "lucide-react-native";
import { palette, radius, shadows, motion } from "@shared/designSystem";
import { Text } from "@shared/ui";
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
  const unread = useUnreadCount();
  const hasUnread = (unread.data ?? 0) > 0;
  // The dot sits on the Alerts tab when it's in the dock, else on Menu.
  const alertsInDock = items.some((i) => i.name === "Notifications");

  return (
    <View
      pointerEvents="box-none"
      style={[styles.wrap, { paddingBottom: Math.max(insets.bottom, 12) }]}
    >
      <View style={[styles.dock, shadows.lg]}>
        {items.map((item) => (
          <DockTab
            key={item.name}
            icon={item.icon}
            label={item.label}
            active={active === item.name}
            badge={hasUnread && item.name === "Notifications"}
            onPress={() => onNavigate(item.name)}
          />
        ))}
        <DockTab
          icon={LayoutGrid}
          label="Menu"
          active={active === MENU_ROUTE}
          badge={hasUnread && !alertsInDock}
          onPress={() => onNavigate(MENU_ROUTE)}
        />
      </View>
    </View>
  );
}

function DockTab({
  icon: Icon,
  label,
  active,
  badge,
  onPress,
}: {
  icon: LucideIcon;
  label: string;
  active: boolean;
  badge?: boolean;
  onPress: () => void;
}) {
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.get() }],
  }));

  return (
    <Animated.View style={[{ flex: 1 }, animStyle]}>
      <Pressable
        onPress={() => {
          if (Platform.OS !== "web") {
            Haptics.selectionAsync().catch(() => {});
          }
          onPress();
        }}
        onPressIn={() => scale.set(withSpring(0.92, motion.spring.crisp))}
        onPressOut={() => scale.set(withSpring(1, motion.spring.gentle))}
        style={[styles.tab, active && styles.tabActive]}
      >
        <View>
          <Icon
            size={21}
            color={active ? palette.brand[400] : "rgba(255,255,255,0.62)"}
            strokeWidth={active ? 2.4 : 2}
          />
          {badge ? <View style={styles.badge} /> : null}
        </View>
        <Text
          variant="label-sm"
          weight={active ? "700" : "500"}
          numberOfLines={1}
          style={{
            color: active ? palette.brand[300] : "rgba(255,255,255,0.62)",
            fontSize: 10,
            marginTop: 3,
          }}
        >
          {label}
        </Text>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 14,
    alignItems: "center",
  },
  dock: {
    flexDirection: "row",
    alignItems: "stretch",
    width: "100%",
    maxWidth: 480,
    backgroundColor: palette.surface.dark,
    borderRadius: radius["3xl"],
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    paddingVertical: 8,
    paddingHorizontal: 8,
  },
  tab: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 7,
    borderRadius: radius.xl,
  },
  tabActive: {
    backgroundColor: "rgba(240,167,10,0.14)",
  },
  badge: {
    position: "absolute",
    top: -2,
    right: -4,
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: palette.brand[500],
    borderWidth: 1.5,
    borderColor: palette.surface.dark,
  },
});
