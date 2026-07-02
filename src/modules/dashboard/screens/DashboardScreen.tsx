import React from "react";
import { View, useWindowDimensions } from "react-native";
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
} from "lucide-react-native";
import { useAuthStore } from "@shared/store/useAuthStore";
import { useDashboardSummary } from "@modules/dashboard/hooks/useDashboard";
import { palette, tints } from "@shared/designSystem";
import { useSectionNav } from "@navigation/AppNavigator";
import { Screen, Text, VStack, HStack, Card, TintTile } from "@shared/ui";

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
      label: "Active students",
      value: String(today?.totalStudents ?? 0),
      icon: Users,
      tint: "teal" as const,
    },
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
      label: "Active trips",
      value: String(today?.activeTrips ?? 0),
      icon: Bus,
      tint: "blue" as const,
    },
    {
      label: "Active vehicles",
      value: String(today?.activeVehicles ?? 0),
      icon: Truck,
      tint: "violet" as const,
    },
  ];
  const tileWidth = `${100 / cols}%` as const;

  const operations = [
    { label: "Drivers", value: data?.operations.drivers ?? 0, icon: IdCard },
    { label: "Routes", value: data?.operations.routes ?? 0, icon: Route },
    { label: "Vehicles", value: data?.operations.vehicles ?? 0, icon: Truck },
  ];

  return (
    <Screen
      overline={greeting()}
      title={
        user?.fullName ? `Hello, ${user.fullName.split(" ")[0]}` : "Dashboard"
      }
      subtitle="Today's operations at a glance"
      refreshing={isRefetching || isLoading}
      onRefresh={refetch}
    >
      {/* Status-first banner — answers "is everything okay?" in one glance. */}
      <Card
        style={{
          backgroundColor: allGood ? tints.green.bg : tints.amber.bg,
          borderColor: allGood ? tints.green.ring : tints.amber.ring,
        }}
      >
        <HStack gap={14} align="center">
          <View
            style={{
              width: 46,
              height: 46,
              borderRadius: 14,
              backgroundColor: "#FFFFFF",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
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
          <View style={iconWrap}>
            <IndianRupee size={22} color={palette.teal[600]} strokeWidth={2} />
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
                <View style={iconWrap}>
                  <o.icon size={20} color={palette.teal[600]} strokeWidth={2} />
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

const iconWrap = {
  width: 44,
  height: 44,
  borderRadius: 12,
  backgroundColor: palette.teal[50],
  alignItems: "center" as const,
  justifyContent: "center" as const,
};
