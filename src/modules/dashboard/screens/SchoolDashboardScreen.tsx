/**
 * SchoolDashboardScreen — the partner school's read-only window (client
 * mockup): a school identity row, a midnight greeting banner with a school
 * illustration, a 3×2 grid of today's headline numbers, and a "Today at a
 * Glance" list. Pure visibility — no money, no editing.
 */
import React, { useMemo } from "react";
import { View, Pressable, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import {
  Bell,
  School,
  CalendarDays,
  PlayCircle,
  Navigation2,
  MapPinCheck,
  UserX,
  ChevronRight,
  type LucideIcon,
} from "lucide-react-native";
import { useAuthStore } from "@shared/store/useAuthStore";
import { useDashboardSummary } from "@modules/dashboard/hooks/useDashboard";
import { useTrips } from "@modules/trip/hooks/useTrips";
import { todayISO } from "@modules/trip/utils";
import { useUnreadCount } from "@modules/notification/hooks/useNotifications";
import {
  palette,
  radius,
  gradients,
  tints,
  accent,
} from "@shared/designSystem";
import { useSectionNav } from "@navigation/AppNavigator";
import {
  Screen,
  Text,
  VStack,
  HStack,
  Card,
  SchoolScene,
  HeaderIconButton,
} from "@shared/ui";

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good Morning";
  if (h < 17) return "Good Afternoon";
  return "Good Evening";
}

type TintKey = keyof typeof tints;

export default function SchoolDashboardScreen() {
  const go = useSectionNav();
  const organization = useAuthStore((s) => s.organization);
  const unread = useUnreadCount();
  const { data, isLoading, refetch, isRefetching } = useDashboardSummary();
  const activeTripsQuery = useTrips({
    date: todayISO(),
    status: "in_progress",
  });

  const today = data?.today;

  // Students currently on board = picked-up stops on in-progress trips.
  const onBoard = useMemo(() => {
    let n = 0;
    for (const t of activeTripsQuery.data?.data ?? [])
      for (const s of t.stops) if (s.status === "picked_up") n += 1;
    return n;
  }, [activeTripsQuery.data]);

  const stats: { label: string; value: string; sub?: string; tint: TintKey }[] =
    [
      {
        label: "Total Students",
        value: String(today?.totalStudents ?? 0),
        sub: "Enrolled",
        tint: "violet",
      },
      {
        label: "On Board",
        value: String(onBoard),
        sub: "Riding now",
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

  const glance: {
    icon: LucideIcon;
    label: string;
    value: string;
    tint: TintKey;
    go?: string;
  }[] = [
    {
      icon: PlayCircle,
      label: "Trips Active",
      value: String(today?.activeTrips ?? 0),
      tint: "violet",
      go: "Tracking",
    },
    {
      icon: Navigation2,
      label: "Students on the way",
      value: String(onBoard),
      tint: "blue",
      go: "Tracking",
    },
    {
      icon: MapPinCheck,
      label: "Students Reached School",
      value: String(today?.dropped ?? 0),
      tint: "green",
      go: "Attendance",
    },
    {
      icon: UserX,
      label: "Students Absent",
      value: String(today?.noShow ?? 0),
      tint: "red",
      go: "Attendance",
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
      {/* School identity row */}
      <HStack gap={12} align="center">
        <View style={styles.schoolTile}>
          <School size={20} color={accent.main} strokeWidth={2} />
        </View>
        <VStack gap={1} flex={1}>
          <Text
            variant="label-lg"
            weight="700"
            tone="primary"
            numberOfLines={1}
          >
            {organization?.name || "Your School"}
          </Text>
          <Text variant="body-sm" tone="tertiary">
            Transport Dashboard
          </Text>
        </VStack>
        <View style={styles.todayPill}>
          <CalendarDays
            size={13}
            color={palette.text.secondary}
            strokeWidth={2}
          />
          <Text variant="label-sm" weight="600" tone="secondary">
            Today
          </Text>
        </View>
      </HStack>

      {/* Greeting banner */}
      <View style={[styles.bannerWrap, { marginTop: 16 }]}>
        <LinearGradient
          colors={[...gradients.hero] as [string, string, ...string[]]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.banner}
        >
          <VStack gap={4} flex={1}>
            <Text variant="h3" style={{ color: "#FFFFFF" }}>
              {greeting()}, School!
            </Text>
            <Text variant="body-sm" style={{ color: "rgba(255,255,255,0.72)" }}>
              Here’s what’s happening with your students today.
            </Text>
          </VStack>
          <SchoolScene size={96} />
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

      {/* Today at a Glance */}
      <Text
        variant="h3"
        tone="primary"
        style={{ marginTop: 26, marginBottom: 12 }}
      >
        Today at a Glance
      </Text>
      <Card padded={false} style={{ paddingVertical: 4 }}>
        {glance.map((g, i) => {
          const t = tints[g.tint];
          return (
            <View key={g.label}>
              {i > 0 ? <View style={styles.divider} /> : null}
              <Pressable
                onPress={g.go ? () => go(g.go!) : undefined}
                style={({ pressed }) => [
                  styles.glanceRow,
                  pressed && { opacity: 0.7 },
                ]}
              >
                <HStack gap={12} align="center">
                  <View style={[styles.glanceIcon, { backgroundColor: t.bg }]}>
                    <g.icon size={17} color={t.icon} strokeWidth={2} />
                  </View>
                  <Text
                    variant="label-lg"
                    tone="primary"
                    style={{ flex: 1 }}
                    numberOfLines={1}
                  >
                    {g.label}
                  </Text>
                  <Text
                    variant="label-lg"
                    weight="700"
                    style={{ color: t.icon }}
                  >
                    {g.value}
                  </Text>
                  <ChevronRight
                    size={16}
                    color={palette.text.tertiary}
                    strokeWidth={2}
                  />
                </HStack>
              </Pressable>
            </View>
          );
        })}
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  schoolTile: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: accent.soft,
    alignItems: "center",
    justifyContent: "center",
  },
  todayPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: palette.surface.primary,
    borderWidth: 1,
    borderColor: palette.border.default,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: radius.full,
  },
  bannerWrap: { borderRadius: radius.lg, overflow: "hidden" },
  banner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingLeft: 18,
    paddingRight: 8,
    paddingVertical: 10,
    minHeight: 104,
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
  glanceRow: { paddingVertical: 14, paddingHorizontal: 14 },
  glanceIcon: {
    width: 38,
    height: 38,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  divider: { height: 1, backgroundColor: palette.border.subtle },
});
