import React from "react";
import { View, Pressable, StyleSheet, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Bus, LogOut } from "lucide-react-native";
import { palette, radius, layout } from "@shared/designSystem";
import { Text, VStack, HStack, Avatar } from "@shared/ui";
import { useAuthStore } from "@shared/store/useAuthStore";
import { ROLE_LABELS } from "@shared/permissions";
import { useLogout } from "@modules/auth/hooks/useAuth";
import { NAV_BY_ROLE, NavItem } from "./navItems";

export function Sidebar({
  activeRoute,
  onNavigate,
}: {
  activeRoute: string;
  onNavigate: (name: string) => void;
}) {
  const user = useAuthStore((s) => s.user);
  const organization = useAuthStore((s) => s.organization);
  const logout = useLogout();
  const items = user ? NAV_BY_ROLE[user.role] : [];

  return (
    <SafeAreaView edges={["top", "bottom"]} style={styles.root}>
      <View style={styles.brand}>
        <View style={styles.logo}>
          <Bus size={20} color="#FFFFFF" strokeWidth={2.2} />
        </View>
        <VStack gap={1} flex={1}>
          <Text variant="label-lg" tone="primary" numberOfLines={1}>
            {organization?.name || "SchoolRide"}
          </Text>
          <Text variant="caption" tone="tertiary">
            {user ? ROLE_LABELS[user.role] : ""}
          </Text>
        </VStack>
      </View>

      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        <VStack gap={4} style={{ paddingHorizontal: 12 }}>
          {items.map((item) => (
            <NavRow
              key={item.name}
              item={item}
              active={activeRoute === item.name}
              onPress={() => onNavigate(item.name)}
            />
          ))}
        </VStack>
      </ScrollView>

      <View style={styles.footer}>
        <HStack gap={10} align="center" style={{ marginBottom: 10 }}>
          <Avatar name={user?.fullName || "U"} size={36} />
          <VStack gap={0} flex={1}>
            <Text variant="label" tone="primary" numberOfLines={1}>
              {user?.fullName}
            </Text>
            <Text variant="caption" tone="tertiary" numberOfLines={1}>
              {user?.email || user?.phone}
            </Text>
          </VStack>
        </HStack>
        <Pressable onPress={logout} style={styles.logout}>
          <LogOut size={16} color={palette.danger.text} strokeWidth={2} />
          <Text
            variant="label"
            weight="600"
            style={{ color: palette.danger.text }}
          >
            Sign out
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

function NavRow({
  item,
  active,
  onPress,
}: {
  item: NavItem;
  active: boolean;
  onPress: () => void;
}) {
  const Icon = item.icon;
  return (
    <Pressable
      onPress={onPress}
      style={[styles.row, active && styles.rowActive]}
    >
      <Icon
        size={19}
        color={active ? palette.teal[600] : palette.text.tertiary}
        strokeWidth={2}
      />
      <Text
        variant="label"
        weight={active ? "600" : "500"}
        tone={active ? "accent" : "secondary"}
      >
        {item.label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: {
    width: layout.sidebarWidth,
    backgroundColor: palette.surface.primary,
    borderRightWidth: 1,
    borderRightColor: palette.border.default,
  },
  brand: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 18,
  },
  logo: {
    width: 38,
    height: 38,
    borderRadius: radius.md,
    backgroundColor: palette.teal[600],
    alignItems: "center",
    justifyContent: "center",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 11,
    paddingHorizontal: 12,
    borderRadius: radius.md,
  },
  rowActive: { backgroundColor: palette.teal[50] },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: palette.border.default,
  },
  logout: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 10,
    borderRadius: radius.md,
    backgroundColor: palette.danger.bg,
  },
});
