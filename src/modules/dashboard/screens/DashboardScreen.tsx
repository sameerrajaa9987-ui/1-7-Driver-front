import React from "react";
import { View, StyleSheet, useWindowDimensions } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import {
  Users,
  UserCheck,
  MapPinCheck,
  UserX,
  Bus,
  Truck,
  Route,
  IdCard,
  IndianRupee,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
  Navigation,
} from "lucide-react-native";
import { useAuthStore } from "@shared/store/useAuthStore";
import { useDashboardSummary } from "@modules/dashboard/hooks/useDashboard";
import {
  palette,
  tints,
  radius,
  gradients,
  glass,
} from "@shared/designSystem";
import { useSectionNav } from "@navigation/AppNavigator";
import {
  Screen,
  Text,
  VStack,
  HStack,
  Card,
  TintTile,
  LiveBadge,
} from "@shared/ui";

const money = (n: number) => `₹${Number(n || 0).toLocaleString("en-IN")}`;

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

export default function DashboardScreen() {
  const { width } = useWindowDimensions();
  const cols = width >= 900 ? 3 : 2;
  const go = useSectionNav();
  const user = useAuthStore((s) => s.user);
  const { data, isLoading, refetch, isRefetching } = useDashboardSummary();

  const today = data?.today;
  const pending = today?.pendingApproval ?? 0;
  const overdue = data?.finance.pending ?? 0;
  const activeTrips = today?.activeTrips ?? 0;

  // Progressive disclosure: surface the "is everything okay?" answer first.
  const attention: { label: string; tint: "amber" | "red"; go: string }[] = [];
  if (pending > 0)
    attention.push({
      label: `${pending} student${pending === 1 ? "" : "s"} awaiting approval`,
      tint: "amber",
      go: "Students",
    });
  if (overdue > 0)
    attention.push({
      label: `${money(overdue)} in fees awaiting verification`,
      tint: "amber",
      go: "Payments",
    });
  const allGood = attention.length === 0;

  const tiles = [
    {
      label: "Picked up",
      value: String(today?.pickedUp ?? 0),
      icon: UserCheck,
      tint: "teal" as const,
    },
    {
      label: "Dropped safely",
      value: String(today?.dropped ?? 0),
      icon: MapPinCheck,
      tint: "green" as const,
    },
    {
      label: "No shows",
      value: String(today?.noShow ?? 0),
      icon: UserX,
      tint: "red" as const,
    },
    {
      label: "Active vehicles",
      value: String(today?.activeVehicles ?? 0),
      icon: Truck,
      tint: "violet" as const,
    },
    {
      label: "Active trips",
      value: String(activeTrips),
      icon: Bus,
      tint: "blue" as const,
    },
    {
      label: "Pending approval",
      value: String(pending),
      icon: Users,
      tint: "amber" as const,
    },
  ];
  const tileWidth = `${100 / cols}%` as const;

  const operations = [
    { label: "Drivers", value: data?.operations.drivers ?? 0, icon: IdCard },
    { label: "Routes", value: data?.operations.routes ?? 0, icon: Route },
    { label: "Vehicles", value: data?.operations.vehicles ?? 0, icon: Truck },
  ];

  return (
    <Screen refreshing={isRefetching || isLoading} onRefresh={refetch}>
      {/* Midnight hero — greeting, north-star metric, live glass chips. */}
      <View style={styles.heroWrap}>
        <LinearGradient
          colors={[...gradients.hero] as [string, string, ...string[]]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.hero}
        >
          <HStack align="center" justify="space-between">
            <VStack gap={2} flex={1}>
              <Text
                variant="overline"
                style={{ color: palette.brand[400] }}
              >
                {greeting()}
              </Text>
              <Text variant="h1" style={{ color: "#FFFFFF" }}>
                {user?.fullName
                  ? `Hello, ${user.fullName.split(" ")[0]}`
                  : "Dashboard"}
              </Text>
            </VStack>
            {activeTrips > 0 ? <LiveBadge tone={palette.brand[400]} /> : null}
          </HStack>

          <HStack gap={20} align="flex-end" style={{ marginTop: 20 }}>
            <VStack gap={2}>
              <Text variant="display-lg" style={{ color: "#FFFFFF" }}>
                {today?.totalStudents ?? 0}
              </Text>
              <Text
                variant="caption"
                style={{ color: "rgba(255,255,255,0.66)" }}
              >
                Students riding today
              </Text>
            </VStack>
          </HStack>

          <HStack gap={10} style={{ marginTop: 18 }}>
            <HeroChip
              icon={Bus}
              label={`${activeTrips} live trip${activeTrips === 1 ? "" : "s"}`}
              onPress={() => go("Tracking")}
            />
            <HeroChip
              icon={Navigation}
              label="Open live map"
              onPress={() => go("Tracking")}
            />
          </HStack>
        </LinearGradient>
      </View>

      {/* Status-first banner — answers "is everything okay?" in one glance. */}
      <Card
        style={{
          marginTop: 16,
          backgroundColor: allGood ? tints.green.bg : tints.amber.bg,
          borderColor: allGood ? tints.green.ring : tints.amber.ring,
        }}
      >
        <HStack gap={14} align="center">
          <View style={styles.statusIcon}>
            {allGood ? (
              <CheckCircle2
                size={24}
                color={tints.green.icon}
                strokeWidth={2.2}
              />
            ) : (
              <AlertTriangle
                size={24}
                color={tints.amber.icon}
                strokeWidth={2.2}
              />
            )}
          </View>
          <VStack gap={2} flex={1}>
            <Text
              variant="label-lg"
              weight="700"
              style={{ color: allGood ? tints.green.fg : tints.amber.fg }}
            >
              {allGood ? "All running smoothly" : "A few things need attention"}
            </Text>
            <Text
              variant="body-sm"
              style={{
                color: allGood ? tints.green.fg : tints.amber.fg,
                opacity: 0.85,
              }}
            >
              {allGood
                ? "No pending approvals or unverified fees right now."
                : `${attention.length} item${attention.length === 1 ? "" : "s"} to review below.`}
            </Text>
          </VStack>
        </HStack>
      </Card>

      {attention.length > 0 && (
        <VStack gap={10} style={{ marginTop: 12 }}>
          {attention.map((a) => (
            <Card
              key={a.label}
              onPress={() => go(a.go)}
              style={{ borderColor: tints[a.tint].ring }}
            >
              <HStack align="center" justify="space-between">
                <HStack gap={10} align="center" flex={1}>
                  <View
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: 4,
                      backgroundColor: tints[a.tint].icon,
                    }}
                  />
                  <Text variant="label" tone="primary">
                    {a.label}
                  </Text>
                </HStack>
                <ChevronRight size={18} color={palette.text.tertiary} />
              </HStack>
            </Card>
          ))}
        </VStack>
      )}

      {/* Today — tinted bento (2026) */}
      <Text
        variant="h3"
        tone="primary"
        style={{ marginTop: 24, marginBottom: 4 }}
      >
        Today
      </Text>
      <View
        style={{
          flexDirection: "row",
          flexWrap: "wrap",
          marginTop: 12,
          marginHorizontal: -6,
        }}
      >
        {tiles.map((t) => (
          <View key={t.label} style={{ width: tileWidth, padding: 6 }}>
            <TintTile
              label={t.label}
              value={t.value}
              icon={t.icon}
              tint={t.tint}
            />
          </View>
        ))}
      </View>

      {/* Finance */}
      <Text
        variant="h3"
        tone="primary"
        style={{ marginTop: 24, marginBottom: 12 }}
      >
        Finance
      </Text>
      <Card onPress={() => go("Payments")}>
        <HStack gap={16} align="center">
          <View style={styles.iconWrap}>
            <IndianRupee size={22} color={palette.brand[600]} strokeWidth={2} />
          </View>
          <HStack flex={1} justify="space-between">
            <VStack gap={3}>
              <Text variant="body-sm" tone="tertiary">
                Collected
              </Text>
              <Text variant="h2" tone="primary">
                {money(data?.finance.totalCollected ?? 0)}
              </Text>
              <Text variant="caption" tone="tertiary">
                Verified
              </Text>
            </VStack>
            <VStack gap={3} align="flex-end">
              <Text variant="body-sm" tone="tertiary">
                Pending
              </Text>
              <Text variant="h2" style={{ color: tints.amber.fg }}>
                {money(overdue)}
              </Text>
              <Text variant="caption" tone="tertiary">
                Awaiting verification
              </Text>
            </VStack>
          </HStack>
        </HStack>
      </Card>

      {/* Operations */}
      <Text
        variant="h3"
        tone="primary"
        style={{ marginTop: 24, marginBottom: 12 }}
      >
        Operations
      </Text>
      <View
        style={{ flexDirection: "row", flexWrap: "wrap", marginHorizontal: -6 }}
      >
        {operations.map((o) => (
          <View key={o.label} style={{ width: "33.33%", padding: 6 }}>
            <Card>
              <VStack gap={8} align="center">
                <View style={styles.iconWrap}>
                  <o.icon
                    size={20}
                    color={palette.brand[600]}
                    strokeWidth={2}
                  />
                </View>
                <Text variant="h2" tone="primary">
                  {o.value}
                </Text>
                <Text variant="caption" tone="tertiary">
                  {o.label}
                </Text>
              </VStack>
            </Card>
          </View>
        ))}
      </View>
    </Screen>
  );
}

function HeroChip({
  icon: Icon,
  label,
  onPress,
}: {
  icon: React.ComponentType<{
    size?: number;
    color?: string;
    strokeWidth?: number;
  }>;
  label: string;
  onPress?: () => void;
}) {
  return (
    <Card onPress={onPress} padded={false} style={[styles.heroChip, glass.light]}>
      <HStack gap={8} align="center" style={{ paddingHorizontal: 13, paddingVertical: 9 }}>
        <Icon size={15} color={palette.brand[300]} strokeWidth={2.2} />
        <Text variant="label" weight="600" style={{ color: "#FFFFFF" }}>
          {label}
        </Text>
      </HStack>
    </Card>
  );
}

const styles = StyleSheet.create({
  heroWrap: {
    borderRadius: radius.xl,
    overflow: "hidden",
  },
  hero: { padding: 22 },
  heroChip: {
    borderRadius: radius.full,
    borderWidth: 1,
  },
  statusIcon: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: palette.brand[50],
    alignItems: "center",
    justifyContent: "center",
  },
});
