/**
 * SchoolSettingsScreen — the school account hub (client mockup): School Profile
 * / Notification Settings / Manage Users / Change Password / Help & Support /
 * About rows that open in-place info sheets, plus Logout. Schools are read-only
 * partners, so account changes route through the transport operator.
 */
import React, { useState } from "react";
import { View, Modal, Pressable, ScrollView, StyleSheet } from "react-native";
import {
  School,
  Bell,
  Users,
  KeyRound,
  LifeBuoy,
  Info,
  LogOut,
  ChevronRight,
  X,
  type LucideIcon,
} from "lucide-react-native";
import { useAuthStore } from "@shared/store/useAuthStore";
import { useLogout } from "@modules/auth/hooks/useAuth";
import { palette, radius, accent } from "@shared/designSystem";
import { Screen, Text, VStack, HStack, Card, Avatar } from "@shared/ui";

interface Sheet {
  title: string;
  body: string;
}

export default function SchoolSettingsScreen() {
  const user = useAuthStore((s) => s.user);
  const organization = useAuthStore((s) => s.organization);
  const logout = useLogout();
  const [sheet, setSheet] = useState<Sheet | null>(null);

  const schoolName = user?.fullName || organization?.name || "Your School";
  const orgName = organization?.name || "your transport operator";

  const rows: { icon: LucideIcon; label: string; sub: string; sheet: Sheet }[] =
    [
      {
        icon: School,
        label: "School Profile",
        sub: schoolName,
        sheet: {
          title: "School Profile",
          body: `Name: ${schoolName}\nEmail: ${user?.email || "—"}\nOperator: ${orgName}\n\nThis dashboard is provided by your transport operator for real-time visibility of your students' transport.`,
        },
      },
      {
        icon: Bell,
        label: "Notification Settings",
        sub: "Manage alert preferences",
        sheet: {
          title: "Notification Settings",
          body: "You'll receive alerts for trip start, vehicle arriving, student boarding, safe drop-off at school and emergency SOS. Manage system push permissions from your phone's Settings › Notifications.",
        },
      },
      {
        icon: Users,
        label: "Manage Users",
        sub: "Add or manage school users",
        sheet: {
          title: "Manage Users",
          body: `School staff logins are provisioned by ${orgName}. Contact them to add coordinators or remove access — every login sees the same read-only transport view.`,
        },
      },
      {
        icon: KeyRound,
        label: "Change Password",
        sub: "Update your password",
        sheet: {
          title: "Change Password",
          body: `To reset your dashboard password, contact ${orgName}. For security, password changes for partner-school logins are handled by your operator.`,
        },
      },
      {
        icon: LifeBuoy,
        label: "Help & Support",
        sub: "Get help and contact support",
        sheet: {
          title: "Help & Support",
          body: `Questions about a trip, a student's status or the dashboard? Reach ${orgName} directly. Emergency SOS alerts from drivers appear instantly under Alerts.`,
        },
      },
      {
        icon: Info,
        label: "About School Dashboard",
        sub: "Version 1.0.0",
        sheet: {
          title: "About School Dashboard",
          body: "School Dashboard gives your school real-time visibility of student transport — live map, verified attendance, trip status and instant safety alerts. Version 1.0.0.",
        },
      },
    ];

  return (
    <Screen title="Settings">
      {/* Identity */}
      <Card style={{ marginBottom: 18 }}>
        <HStack gap={14} align="center">
          <View style={styles.schoolAvatar}>
            <School size={26} color={accent.main} strokeWidth={2} />
          </View>
          <VStack gap={3} flex={1}>
            <Text variant="h3" tone="primary" numberOfLines={1}>
              {schoolName}
            </Text>
            <Text variant="body-sm" tone="tertiary" numberOfLines={1}>
              {user?.email || "Transport Dashboard"}
            </Text>
          </VStack>
          <Avatar name={schoolName} seed={user?.id} size={44} />
        </HStack>
      </Card>

      {/* Rows */}
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
            <VStack gap={1} flex={1}>
              <Text variant="label-lg" tone="primary">
                {r.label}
              </Text>
              <Text variant="caption" tone="tertiary" numberOfLines={1}>
                {r.sub}
              </Text>
            </VStack>
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
  schoolAvatar: {
    width: 52,
    height: 52,
    borderRadius: radius.md,
    backgroundColor: accent.soft,
    alignItems: "center",
    justifyContent: "center",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
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
