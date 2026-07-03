/**
 * MenuHubScreen — the "everything" hub behind the dock's Menu tab (2026 bento
 * pattern; replaces the old sidebar list). Identity card up top, then a
 * two-column bento grid of every section with tinted icon chips, and sign-out.
 */
import React from "react";
import { View, Pressable, StyleSheet } from "react-native";
import { LogOut, ChevronRight } from "lucide-react-native";
import { palette, radius, tints, gradients, glass } from "@shared/designSystem";
import { LinearGradient } from "expo-linear-gradient";
import {
  Screen,
  Text,
  VStack,
  HStack,
  Card,
  Avatar,
  HeroGlow,
} from "@shared/ui";
import { useAuthStore } from "@shared/store/useAuthStore";
import { ROLE_LABELS } from "@shared/permissions";
import { useLogout } from "@modules/auth/hooks/useAuth";
import type { NavItem } from "./navItems";

interface Props {
  items: NavItem[]; // every section for this role
  onNavigate: (name: string) => void;
}

export function MenuHubScreen({ items, onNavigate }: Props) {
  const user = useAuthStore((s) => s.user);
  const organization = useAuthStore((s) => s.organization);
  const logout = useLogout();

  return (
    <Screen scroll>
      {/* Identity — midnight hero card */}
      <View style={[styles.heroWrap]}>
        <LinearGradient
          colors={[...gradients.hero] as [string, string, ...string[]]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.hero}
        >
          <HeroGlow />
          <HStack gap={14} align="center">
            <Avatar name={user?.fullName || "U"} size={52} />
            <VStack gap={2} flex={1}>
              <Text variant="h3" style={{ color: "#FFFFFF" }} numberOfLines={1}>
                {user?.fullName}
              </Text>
              <Text
                variant="body-sm"
                style={{ color: "rgba(255,255,255,0.72)" }}
                numberOfLines={1}
              >
                {organization?.name}
              </Text>
            </VStack>
            <View style={[styles.roleChip, glass.light]}>
              <Text
                variant="label-sm"
                weight="700"
                style={{ color: palette.brand[300] }}
              >
                {user ? ROLE_LABELS[user.role] : ""}
              </Text>
            </View>
          </HStack>
        </LinearGradient>
      </View>

      {/* Bento grid of every section */}
      <View style={styles.grid}>
        {items.map((item) => {
          const Icon = item.icon;
          const tint = tints[item.tint || "neutral"];
          return (
            <Card
              key={item.name}
              onPress={() => onNavigate(item.name)}
              style={styles.tile}
            >
              <HStack align="center" justify="space-between">
                <View style={[styles.iconChip, { backgroundColor: tint.bg }]}>
                  <Icon size={20} color={tint.icon} strokeWidth={2} />
                </View>
                <ChevronRight
                  size={16}
                  color={palette.text.tertiary}
                  strokeWidth={2}
                />
              </HStack>
              <Text
                variant="label-lg"
                tone="primary"
                numberOfLines={1}
                style={{ marginTop: 12 }}
              >
                {item.label}
              </Text>
            </Card>
          );
        })}
      </View>

      {/* Sign out */}
      <Pressable onPress={logout} style={styles.logout}>
        <LogOut size={17} color={palette.danger.text} strokeWidth={2} />
        <Text
          variant="label"
          weight="600"
          style={{ color: palette.danger.text }}
        >
          Sign out
        </Text>
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  heroWrap: {
    borderRadius: radius.xl,
    overflow: "hidden",
    marginBottom: 20,
  },
  hero: { padding: 20 },
  roleChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radius.full,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  tile: {
    flexBasis: "47%",
    flexGrow: 1,
    minWidth: 150,
    maxWidth: 260,
  },
  iconChip: {
    width: 42,
    height: 42,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  logout: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 24,
    paddingVertical: 13,
    borderRadius: radius.md,
    backgroundColor: palette.danger.bg,
    borderWidth: 1,
    borderColor: palette.danger.border,
  },
});
