/**
 * RolePickerScreen — "Choose your role to continue" (client mockup): four role
 * cards (Operator/Admin, Driver, Parent, School) that open Login with the right
 * sign-in mode preselected, plus a "Log in" link for returning users.
 */
import React from "react";
import { View, Pressable, ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  UserCog,
  Bus,
  Users,
  GraduationCap,
  ChevronRight,
  type LucideIcon,
} from "lucide-react-native";
import { useNavigation } from "@react-navigation/native";
import {
  palette,
  radius,
  tints,
  accent,
  type TintName,
} from "@shared/designSystem";
import { Text, VStack, HStack, BrandLogo } from "@shared/ui";

type LoginRole = "staff" | "parent";

interface RoleCard {
  key: string;
  role: LoginRole;
  icon: LucideIcon;
  tint: TintName;
  title: string;
  sub: string;
}

const ROLES: RoleCard[] = [
  {
    key: "operator",
    role: "staff",
    icon: UserCog,
    tint: "violet",
    title: "Operator / Admin",
    sub: "Manage drivers, vehicles, students, routes and everything from one dashboard.",
  },
  {
    key: "driver",
    role: "staff",
    icon: Bus,
    tint: "green",
    title: "Driver",
    sub: "Manage trips, pickup & drop, attendance and stay connected with parents.",
  },
  {
    key: "parent",
    role: "parent",
    icon: Users,
    tint: "red",
    title: "Parent",
    sub: "Track your child’s journey, receive alerts and pay fees with ease.",
  },
  {
    key: "school",
    role: "staff",
    icon: GraduationCap,
    tint: "blue",
    title: "School",
    sub: "View attendance, live trips and transport reports for your students.",
  },
];

export default function RolePickerScreen() {
  const navigation = useNavigation<any>();

  return (
    <View style={{ flex: 1, backgroundColor: palette.surface.secondary }}>
      <SafeAreaView style={{ flex: 1 }} edges={["top", "bottom"]}>
        <ScrollView
          contentContainerStyle={styles.container}
          showsVerticalScrollIndicator={false}
        >
          {/* Brand */}
          <HStack gap={10} align="center" style={{ marginBottom: 26 }}>
            <View style={styles.logo}>
              <BrandLogo size={22} tone="ink" />
            </View>
            <Text variant="label-lg" weight="700" tone="primary">
              SchoolRide Connect
            </Text>
          </HStack>

          <Text variant="h1" tone="primary">
            Choose your role
          </Text>
          <Text
            variant="body"
            tone="tertiary"
            style={{ marginTop: 6, marginBottom: 22 }}
          >
            Select how you’ll be using SchoolRide Connect to continue.
          </Text>

          <VStack gap={12}>
            {ROLES.map((r) => (
              <Pressable
                key={r.key}
                onPress={() =>
                  navigation.navigate("Login", { role: r.role, roleKey: r.key })
                }
                style={({ pressed }) => [
                  styles.card,
                  pressed && { backgroundColor: palette.surface.secondary },
                ]}
              >
                <View
                  style={[
                    styles.iconTile,
                    { backgroundColor: tints[r.tint].bg },
                  ]}
                >
                  <r.icon
                    size={24}
                    color={tints[r.tint].icon}
                    strokeWidth={2}
                  />
                </View>
                <VStack gap={3} flex={1}>
                  <Text variant="label-lg" weight="700" tone="primary">
                    {r.title}
                  </Text>
                  <Text variant="body-sm" tone="tertiary">
                    {r.sub}
                  </Text>
                </VStack>
                <ChevronRight
                  size={20}
                  color={palette.text.tertiary}
                  strokeWidth={2}
                />
              </Pressable>
            ))}
          </VStack>

          <HStack gap={5} justify="center" style={{ marginTop: 26 }}>
            <Text variant="body-sm" tone="tertiary">
              Already have an account?
            </Text>
            <Pressable onPress={() => navigation.navigate("Login")} hitSlop={8}>
              <Text
                variant="body-sm"
                weight="700"
                style={{ color: accent.main }}
              >
                Log in
              </Text>
            </Pressable>
          </HStack>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 24,
    maxWidth: 480,
    width: "100%",
    alignSelf: "center",
  },
  logo: {
    width: 30,
    height: 30,
    borderRadius: radius.sm,
    backgroundColor: palette.brand[500],
    alignItems: "center",
    justifyContent: "center",
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    backgroundColor: palette.surface.primary,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: palette.border.default,
    padding: 16,
  },
  iconTile: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
  },
});
