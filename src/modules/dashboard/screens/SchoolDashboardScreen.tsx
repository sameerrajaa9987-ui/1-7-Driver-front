/**
 * SchoolDashboardScreen — the partner school's read-only window (deck:
 * Schools Dashboard). Live student status for today, transport safety at a
 * glance. No money, no editing — pure visibility.
 */
import React from "react";
import { View, StyleSheet, useWindowDimensions } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import {
  UserCheck,
  MapPinCheck,
  UserX,
  Bus,
  Truck,
  School,
} from "lucide-react-native";
import { useAuthStore } from "@shared/store/useAuthStore";
import { useDashboardSummary } from "@modules/dashboard/hooks/useDashboard";
import { palette, radius, gradients, glass } from "@shared/designSystem";
import { useSectionNav } from "@navigation/AppNavigator";
import {
  Screen,
  Text,
  VStack,
  HStack,
  Card,
  TintTile,
  LiveBadge,
  HeroGlow,
} from "@shared/ui";

export default function SchoolDashboardScreen() {
  const { width } = useWindowDimensions();
  const cols = width >= 900 ? 3 : 2;
  const go = useSectionNav();
  const organization = useAuthStore((s) => s.organization);
  const { data, isLoading, refetch, isRefetching } = useDashboardSummary();

  const today = data?.today;
  const activeTrips = today?.activeTrips ?? 0;

  const tiles = [
    {
      label: "Picked up",
      value: String(today?.pickedUp ?? 0),
      icon: UserCheck,
      tint: "teal" as const,
    },
    {
      label: "Reached / dropped",
      value: String(today?.dropped ?? 0),
      icon: MapPinCheck,
      tint: "green" as const,
    },
    {
      label: "Absent",
      value: String(today?.noShow ?? 0),
      icon: UserX,
      tint: "red" as const,
    },
    {
      label: "Vehicles on road",
      value: String(today?.activeVehicles ?? 0),
      icon: Truck,
      tint: "violet" as const,
    },
  ];
  const tileWidth = `${100 / cols}%` as const;

  return (
    <Screen refreshing={isRefetching || isLoading} onRefresh={refetch}>
      {/* Midnight hero — live student status. */}
      <View style={styles.heroWrap}>
        <LinearGradient
          colors={[...gradients.hero] as [string, string, ...string[]]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.hero}
        >
          <HeroGlow />
          <HStack align="center" justify="space-between">
            <VStack gap={2} flex={1}>
              <Text variant="overline" style={{ color: palette.brand[400] }}>
                Transport today
              </Text>
              <Text variant="h1" style={{ color: "#FFFFFF" }} numberOfLines={1}>
                {organization?.name || "School transport"}
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
              icon={School}
              label="Attendance report"
              onPress={() => go("Attendance")}
            />
          </HStack>
        </LinearGradient>
      </View>

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

      <View style={styles.note}>
        <Text variant="body-sm" style={{ color: palette.text.secondary }}>
          This dashboard is provided by your transport operator. Live positions
          are on the Live Map; emergencies appear in Alerts instantly.
        </Text>
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
    <Card
      onPress={onPress}
      padded={false}
      style={[styles.heroChip, glass.light]}
    >
      <HStack
        gap={8}
        align="center"
        style={{ paddingHorizontal: 13, paddingVertical: 9 }}
      >
        <Icon size={15} color={palette.brand[300]} strokeWidth={2.2} />
        <Text variant="label" weight="600" style={{ color: "#FFFFFF" }}>
          {label}
        </Text>
      </HStack>
    </Card>
  );
}

const styles = StyleSheet.create({
  heroWrap: { borderRadius: radius.xl, overflow: "hidden" },
  hero: { padding: 22 },
  heroChip: {
    borderRadius: radius.full,
    borderWidth: 1,
  },
  note: {
    marginTop: 24,
    padding: 14,
    borderRadius: radius.md,
    backgroundColor: palette.surface.tertiary,
    borderWidth: 0,
  },
});
