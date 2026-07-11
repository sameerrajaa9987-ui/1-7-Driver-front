/**
 * DashboardScreen — operator home (client mockup): a compact midnight greeting
 * banner, a 3×2 grid of the day's headline numbers, and a standing "Attention
 * Required" list (approvals, unverified fees, expiring compliance, service due)
 * where each row deep-links to the screen that resolves it.
 */
import React from "react";
import { View, Pressable, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import {
  Bell,
  UserCheck,
  IndianRupee,
  IdCard,
  FileText,
  Wrench,
  ChevronRight,
  type LucideIcon,
} from "lucide-react-native";
import { useAuthStore } from "@shared/store/useAuthStore";
import { useDashboardSummary } from "@modules/dashboard/hooks/useDashboard";
import { useDrivers } from "@modules/driver/hooks/useDrivers";
import { useVehicles } from "@modules/vehicle/hooks/useVehicles";
import { useMaintenanceSummary } from "@modules/maintenance/hooks/useMaintenance";
import { useUnreadCount } from "@modules/notification/hooks/useNotifications";
import {
  palette,
  tints,
  radius,
  gradients,
  accent,
} from "@shared/designSystem";
import { useSectionNav } from "@navigation/AppNavigator";
import {
  Screen,
  Text,
  VStack,
  HStack,
  Card,
  Avatar,
  HeaderIconButton,
} from "@shared/ui";

const money = (n: number) => `₹${Number(n || 0).toLocaleString("en-IN")}`;

const SOON_MS = 30 * 86_400_000;

/** Drivers whose licence is expired or expires within 30 days. */
function countExpiringLicences(drivers: { licenseExpiry: string | null }[]) {
  const cutoff = Date.now() + SOON_MS;
  return drivers.filter(
    (d) => d.licenseExpiry && new Date(d.licenseExpiry).getTime() < cutoff,
  ).length;
}

/** Vehicle compliance documents expiring within 30 days (or expired). */
function countExpiringDocs(
  vehicles: {
    documents?: Record<string, { expiryDate: string | null }>;
  }[],
) {
  const cutoff = Date.now() + SOON_MS;
  return vehicles.reduce((count, v) => {
    const docs = v.documents ? Object.values(v.documents) : [];
    return (
      count +
      docs.filter(
        (doc) => doc?.expiryDate && new Date(doc.expiryDate).getTime() < cutoff,
      ).length
    );
  }, 0);
}

/** Whether a vehicle service falls due within the coming week (or is overdue). */
function isServiceDueSoon(nextServiceDue: string | null | undefined) {
  return Boolean(
    nextServiceDue &&
    new Date(nextServiceDue).getTime() < Date.now() + 7 * 86_400_000,
  );
}

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good Morning";
  if (h < 17) return "Good Afternoon";
  return "Good Evening";
}

type TintKey = keyof typeof tints;

export default function DashboardScreen() {
  const go = useSectionNav();
  const user = useAuthStore((s) => s.user);
  const unread = useUnreadCount();
  const { data, isLoading, refetch, isRefetching } = useDashboardSummary();

  const today = data?.today;
  const pending = today?.pendingApproval ?? 0;
  const overdue = data?.finance.pending ?? 0;

  const { data: driversData } = useDrivers();
  const { data: vehiclesData } = useVehicles();
  const { data: maint } = useMaintenanceSummary();

  const expiringLicences = countExpiringLicences(driversData?.data ?? []);
  const expiringDocs = countExpiringDocs(vehiclesData?.data ?? []);
  const serviceDue = isServiceDueSoon(maint?.nextServiceDue) ? 1 : 0;

  const stats: {
    label: string;
    value: string;
    sub?: string;
    tint: TintKey;
  }[] = [
    {
      label: "Students",
      value: String(today?.totalStudents ?? 0),
      sub: "Enrolled",
      tint: "violet",
    },
    {
      label: "Live Trips",
      value: String(today?.activeTrips ?? 0),
      sub: "On the road",
      tint: "blue",
    },
    {
      label: "Picked Up",
      value: String(today?.pickedUp ?? 0),
      sub: "Today",
      tint: "green",
    },
    {
      label: "Dropped",
      value: String(today?.dropped ?? 0),
      sub: "Today",
      tint: "teal",
    },
    {
      label: "Absent",
      value: String(today?.noShow ?? 0),
      sub: "Today",
      tint: "red",
    },
    {
      label: "Vehicles",
      value: String(today?.activeVehicles ?? 0),
      sub: "On road",
      tint: "amber",
    },
  ];

  const attention: {
    icon: LucideIcon;
    label: string;
    value: string;
    tint: TintKey;
    go: string;
  }[] = [
    {
      icon: UserCheck,
      label: "Students Awaiting Approval",
      value: String(pending),
      tint: "green",
      go: "Students",
    },
    {
      icon: IndianRupee,
      label: "Fees Awaiting Verification",
      value: money(overdue),
      tint: "amber",
      go: "Payments",
    },
    {
      icon: IdCard,
      label: "Driver Licenses Expiring",
      value: String(expiringLicences),
      tint: "red",
      go: "Drivers",
    },
    {
      icon: FileText,
      label: "Vehicle Documents Expiring",
      value: String(expiringDocs),
      tint: "blue",
      go: "Vehicles",
    },
    {
      icon: Wrench,
      label: "Vehicle Service Due",
      value: String(serviceDue),
      tint: "violet",
      go: "Maintenance",
    },
  ];

  return (
    <Screen
      title="Dashboard"
      right={
        <HeaderIconButton
          icon={Bell}
          badge={(unread.data ?? 0) > 0 ? unread.data : undefined}
          onPress={() => go("Notifications")}
        />
      }
      refreshing={isRefetching || isLoading}
      onRefresh={refetch}
    >
      {/* Greeting banner */}
      <View style={styles.bannerWrap}>
        <LinearGradient
          colors={[...gradients.hero] as [string, string, ...string[]]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.banner}
        >
          <Avatar name={user?.fullName || "A"} seed={user?.id} size={44} />
          <VStack gap={2} flex={1}>
            <Text variant="label-lg" weight="700" style={{ color: "#FFFFFF" }}>
              {greeting()}, {user?.fullName?.split(" ")[0] || "Operator"}!
            </Text>
            <Text variant="body-sm" style={{ color: "rgba(255,255,255,0.72)" }}>
              Here’s what’s happening today.
            </Text>
          </VStack>
        </LinearGradient>
      </View>

      {/* Headline stat grid (3 × 2) */}
      <View style={styles.grid}>
        {stats.map((s) => {
          const t = tints[s.tint];
          return (
            <View key={s.label} style={styles.statTile}>
              <Text variant="h1" style={{ color: t.icon }}>
                {s.value}
              </Text>
              <Text
                variant="label"
                weight="600"
                tone="primary"
                numberOfLines={1}
              >
                {s.label}
              </Text>
              {s.sub ? (
                <Text variant="caption" tone="tertiary" numberOfLines={1}>
                  {s.sub}
                </Text>
              ) : null}
            </View>
          );
        })}
      </View>

      {/* Attention Required */}
      <HStack
        align="center"
        justify="space-between"
        style={{ marginTop: 26, marginBottom: 12 }}
      >
        <Text variant="h3" tone="primary">
          Attention Required
        </Text>
        <Pressable onPress={() => go("Notifications")} hitSlop={8}>
          <Text variant="label" weight="600" tone="accent">
            View All
          </Text>
        </Pressable>
      </HStack>

      <VStack gap={10}>
        {attention.map((a) => {
          const t = tints[a.tint];
          return (
            <Card key={a.label} onPress={() => go(a.go)} elevation="base">
              <HStack gap={12} align="center">
                <View style={[styles.attnIcon, { backgroundColor: t.bg }]}>
                  <a.icon size={18} color={t.icon} strokeWidth={2} />
                </View>
                <Text
                  variant="label-lg"
                  tone="primary"
                  style={{ flex: 1 }}
                  numberOfLines={1}
                >
                  {a.label}
                </Text>
                <Text variant="label-lg" weight="700" style={{ color: t.icon }}>
                  {a.value}
                </Text>
                <ChevronRight
                  size={18}
                  color={palette.text.tertiary}
                  strokeWidth={2}
                />
              </HStack>
            </Card>
          );
        })}
      </VStack>
    </Screen>
  );
}

const styles = StyleSheet.create({
  bannerWrap: { borderRadius: radius.lg, overflow: "hidden" },
  banner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 16,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 16,
  },
  statTile: {
    flexBasis: "31%",
    flexGrow: 1,
    minWidth: 100,
    backgroundColor: palette.surface.primary,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: palette.border.default,
    paddingVertical: 16,
    paddingHorizontal: 14,
    gap: 2,
  },
  attnIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  accent: { color: accent.main },
});
