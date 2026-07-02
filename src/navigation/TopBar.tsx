/**
 * TopBar — wide-layout navigation (replaces the old desktop sidebar). A slim
 * midnight bar: amber bus mark + org name on the left, primary sections as
 * pills in the middle, Menu + identity on the right. Content below stays
 * full-width and centered — no rail eating horizontal space.
 */
import React from "react";
import { View, Pressable, StyleSheet, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Bus, LayoutGrid } from "lucide-react-native";
import { palette, radius } from "@shared/designSystem";
import { Text, HStack, Avatar } from "@shared/ui";
import { useAuthStore } from "@shared/store/useAuthStore";
import type { NavItem } from "./navItems";
import { MENU_ROUTE } from "./TabDock";

interface Props {
  items: NavItem[]; // primary items
  active: string;
  onNavigate: (name: string) => void;
}

export function TopBar({ items, active, onNavigate }: Props) {
  const user = useAuthStore((s) => s.user);
  const organization = useAuthStore((s) => s.organization);

  return (
    <SafeAreaView edges={["top"]} style={styles.safe}>
      <View style={styles.bar}>
        <HStack gap={10} align="center" style={{ flexShrink: 0 }}>
          <View style={styles.logo}>
            <Bus size={17} color={palette.ink[900]} strokeWidth={2.4} />
          </View>
          <Text
            variant="label-lg"
            weight="700"
            numberOfLines={1}
            style={{ color: "#FFFFFF", maxWidth: 220 }}
          >
            {organization?.name || "SchoolRide"}
          </Text>
        </HStack>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.pills}
          style={{ flex: 1, marginHorizontal: 18 }}
        >
          {items.map((item) => {
            const Icon = item.icon;
            const isActive = active === item.name;
            return (
              <Pressable
                key={item.name}
                onPress={() => onNavigate(item.name)}
                style={[styles.pill, isActive && styles.pillActive]}
              >
                <Icon
                  size={16}
                  color={isActive ? palette.ink[900] : "rgba(255,255,255,0.72)"}
                  strokeWidth={2.2}
                />
                <Text
                  variant="label"
                  weight={isActive ? "700" : "500"}
                  style={{
                    color: isActive
                      ? palette.ink[900]
                      : "rgba(255,255,255,0.72)",
                  }}
                >
                  {item.label}
                </Text>
              </Pressable>
            );
          })}
          <Pressable
            onPress={() => onNavigate(MENU_ROUTE)}
            style={[styles.pill, active === MENU_ROUTE && styles.pillActive]}
          >
            <LayoutGrid
              size={16}
              color={
                active === MENU_ROUTE
                  ? palette.ink[900]
                  : "rgba(255,255,255,0.72)"
              }
              strokeWidth={2.2}
            />
            <Text
              variant="label"
              weight={active === MENU_ROUTE ? "700" : "500"}
              style={{
                color:
                  active === MENU_ROUTE
                    ? palette.ink[900]
                    : "rgba(255,255,255,0.72)",
              }}
            >
              Menu
            </Text>
          </Pressable>
        </ScrollView>

        <Pressable
          onPress={() => onNavigate(MENU_ROUTE)}
          style={{ flexShrink: 0 }}
        >
          <Avatar name={user?.fullName || "U"} size={34} />
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { backgroundColor: palette.surface.dark },
  bar: {
    height: 60,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    backgroundColor: palette.surface.dark,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.08)",
  },
  logo: {
    width: 32,
    height: 32,
    borderRadius: radius.sm,
    backgroundColor: palette.brand[500],
    alignItems: "center",
    justifyContent: "center",
  },
  pills: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    paddingHorizontal: 14,
    height: 36,
    borderRadius: radius.full,
  },
  pillActive: { backgroundColor: palette.brand[500] },
});
