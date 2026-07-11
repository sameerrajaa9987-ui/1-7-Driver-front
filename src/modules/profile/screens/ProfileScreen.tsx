/**
 * ProfileScreen — account hub (mockup): identity header, a menu of account /
 * legal rows that open in-place info sheets, and a Logout action.
 */
import React, { useState } from "react";
import { View, Modal, Pressable, ScrollView, StyleSheet } from "react-native";
import {
  LogOut,
  ChevronRight,
  User,
  Smartphone,
  Bell,
  ShieldCheck,
  LifeBuoy,
  Info,
  X,
} from "lucide-react-native";
import type { LucideIcon } from "lucide-react-native";
import { useAuthStore } from "@shared/store/useAuthStore";
import { useLogout } from "@modules/auth/hooks/useAuth";
import { ROLE_LABELS } from "@shared/permissions";
import { palette, radius, accent } from "@shared/designSystem";
import { Screen, Text, VStack, HStack, Card, Avatar } from "@shared/ui";

interface Sheet {
  title: string;
  body: string;
}

export default function ProfileScreen() {
  const user = useAuthStore((s) => s.user);
  const organization = useAuthStore((s) => s.organization);
  const logout = useLogout();
  const [sheet, setSheet] = useState<Sheet | null>(null);

  const roleLabel = ROLE_LABELS[user?.role ?? "parent"];
  const orgName = organization?.name || "your transport operator";

  const rows: { icon: LucideIcon; label: string; sheet: Sheet }[] = [
    {
      icon: User,
      label: "My Profile",
      sheet: {
        title: "My Profile",
        body: `Name: ${user?.fullName || "—"}\nRole: ${roleLabel}\nPhone: ${
          user?.phone || "Not set"
        }\nEmail: ${user?.email || "Not set"}\nOperator: ${orgName}`,
      },
    },
    {
      icon: Smartphone,
      label: "Change Mobile Number",
      sheet: {
        title: "Change Mobile Number",
        body: `Your login is tied to your registered mobile number. To change it, contact ${orgName} and they will update it for you — your children and history stay linked.`,
      },
    },
    {
      icon: Bell,
      label: "Notification Settings",
      sheet: {
        title: "Notification Settings",
        body: "You'll receive alerts for trip start, vehicle arriving, boarding, safe drop-off, fee reminders and emergencies. Manage system push permissions from your phone's Settings › Notifications.",
      },
    },
    {
      icon: ShieldCheck,
      label: "Privacy Policy",
      sheet: {
        title: "Privacy Policy",
        body: "We collect only what's needed to run your child's transport — profile, route, live location during active trips, attendance and fee records. Location is shared with you only while a trip is active. We never sell your data.",
      },
    },
    {
      icon: LifeBuoy,
      label: "Help & Support",
      sheet: {
        title: "Help & Support",
        body: `Need help? Reach ${orgName} through the Complaints tab, or call your child's driver from the Children screen. For app issues, raise a complaint and our team will follow up.`,
      },
    },
    {
      icon: Info,
      label: "About Us",
      sheet: {
        title: "About SchoolRide Connect",
        body: "SchoolRide Connect keeps parents, drivers, schools and operators in sync — live tracking, verified attendance, digital bus passes and simple fee payments, all in one place.",
      },
    },
  ];

  return (
    <Screen title="Profile">
      {/* Identity */}
      <Card style={{ marginBottom: 18 }}>
        <HStack gap={14} align="center">
          <Avatar name={user?.fullName || "U"} seed={user?.id} size={56} />
          <VStack gap={3} flex={1}>
            <Text variant="h2" tone="primary" numberOfLines={1}>
              {user?.fullName || "—"}
            </Text>
            <Text variant="body-sm" tone="tertiary">
              {user?.phone || user?.email || roleLabel}
            </Text>
          </VStack>
        </HStack>
      </Card>

      {/* Menu */}
      <Card style={{ padding: 6, marginBottom: 18 }}>
        {rows.map((r, i) => (
          <Pressable
            key={r.label}
            onPress={() => setSheet(r.sheet)}
            style={({ pressed }) => [
              styles.row,
              i < rows.length - 1 && styles.rowDivider,
              pressed && { backgroundColor: palette.surface.secondary },
            ]}
          >
            <View style={styles.rowIcon}>
              <r.icon size={18} color={accent.main} strokeWidth={2} />
            </View>
            <Text variant="label-lg" tone="primary" style={{ flex: 1 }}>
              {r.label}
            </Text>
            <ChevronRight
              size={18}
              color={palette.text.tertiary}
              strokeWidth={2}
            />
          </Pressable>
        ))}
      </Card>

      <Pressable
        onPress={() => logout()}
        style={({ pressed }) => [styles.logout, pressed && { opacity: 0.85 }]}
      >
        <LogOut size={18} color={palette.danger.text} strokeWidth={2} />
        <Text
          variant="label-lg"
          weight="600"
          style={{ color: palette.danger.text }}
        >
          Logout
        </Text>
      </Pressable>

      {/* Info sheet */}
      <Modal
        visible={!!sheet}
        transparent
        animationType="fade"
        onRequestClose={() => setSheet(null)}
      >
        <Pressable style={styles.backdrop} onPress={() => setSheet(null)}>
          <Pressable style={styles.sheet} onPress={() => {}}>
            <HStack
              align="center"
              justify="space-between"
              style={{ marginBottom: 12 }}
            >
              <Text variant="h3" tone="primary" style={{ flex: 1 }}>
                {sheet?.title}
              </Text>
              <Pressable onPress={() => setSheet(null)} style={styles.close}>
                <X size={18} color={palette.text.secondary} strokeWidth={2} />
              </Pressable>
            </HStack>
            <ScrollView style={{ maxHeight: 340 }}>
              <Text variant="body" tone="secondary" style={{ lineHeight: 22 }}>
                {sheet?.body}
              </Text>
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 10,
    borderRadius: radius.md,
  },
  rowDivider: {
    borderBottomWidth: 1,
    borderBottomColor: palette.border.subtle,
    borderRadius: 0,
  },
  rowIcon: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    backgroundColor: accent.soft,
    alignItems: "center",
    justifyContent: "center",
  },
  logout: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 15,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: palette.danger.border,
    backgroundColor: palette.danger.bg,
  },
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(16,24,40,0.45)",
    justifyContent: "center",
    padding: 24,
  },
  sheet: {
    backgroundColor: palette.surface.primary,
    borderRadius: radius.lg,
    padding: 20,
  },
  close: {
    width: 30,
    height: 30,
    borderRadius: radius.full,
    backgroundColor: palette.surface.secondary,
    alignItems: "center",
    justifyContent: "center",
  },
});
