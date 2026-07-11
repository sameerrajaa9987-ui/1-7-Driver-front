/**
 * DriverTodayScreen — the driver's home (client mockup): navy greeting with an
 * Online chip, an indigo "Today's Trip" card with a live progress bar (or a
 * start-route card when idle), a stat grid, and a quick-actions grid.
 */
import React, { useMemo, useState } from "react";
import { View, Pressable, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import {
  Bus,
  Play,
  Bell,
  MapPin,
  Users,
  CheckCircle2,
  Clock,
  ScanLine,
  Coins,
  ShieldAlert,
  GraduationCap,
} from "lucide-react-native";
import { apiErrorMessage } from "@api/apiClient";
import { useAuthStore } from "@shared/store/useAuthStore";
import { useSectionNav } from "@navigation/AppNavigator";
import { useUnreadCount } from "@modules/notification/hooks/useNotifications";
import {
  palette,
  radius,
  gradients,
  accent,
  glass,
  tints,
} from "@shared/designSystem";
import {
  Screen,
  Text,
  VStack,
  HStack,
  Card,
  Avatar,
  Button,
  Select,
  BusScene,
  HeaderIconButton,
} from "@shared/ui";
import type { SelectOption } from "@shared/ui";
import {
  useRoutes,
  useStartTrip,
  useTrips,
} from "@modules/trip/hooks/useTrips";
import { Trip, TripType } from "@modules/trip/types";
import { TRIP_TYPE_LABEL, todayISO } from "@modules/trip/utils";

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good Morning";
  if (h < 17) return "Good Afternoon";
  return "Good Evening";
}

export default function DriverTodayScreen() {
  const navigation = useNavigation<any>();
  const go = useSectionNav();
  const user = useAuthStore((s) => s.user);
  const driverId = useAuthStore((s) => s.user?.driverId ?? null);
  const unread = useUnreadCount();
  const date = todayISO();

  const routesQuery = useRoutes();
  const tripsQuery = useTrips({ date });
  const startTrip = useStartTrip();

  const [routeId, setRouteId] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  const myRoutes = useMemo(() => {
    const all = routesQuery.data?.data ?? [];
    const mine = driverId ? all.filter((r) => r.driverId === driverId) : all;
    return mine.length ? mine : all;
  }, [routesQuery.data, driverId]);

  const routeOptions: SelectOption[] = myRoutes.map((r) => ({
    label: `${r.name} · ${r.studentCount} students`,
    value: r.id,
  }));

  const myTrips = useMemo(() => {
    const trips = tripsQuery.data?.data ?? [];
    return driverId ? trips.filter((t) => t.driverId === driverId) : trips;
  }, [tripsQuery.data, driverId]);

  const active = useMemo(
    () => myTrips.find((t) => t.status === "in_progress") ?? null,
    [myTrips],
  );

  const routeName = (t: Trip | null) =>
    myRoutes.find((r) => r.id === t?.routeId)?.name || "Route";

  const start = async (type: TripType) => {
    setError(null);
    if (!routeId) return setError("Select a route first.");
    try {
      const trip = await startTrip.mutateAsync({ routeId, type });
      navigation.navigate("RunTrip", { tripId: trip.id });
    } catch (e) {
      setError(apiErrorMessage(e, "Could not start trip"));
    }
  };

  // Live progress for the active trip.
  const stops = active?.stops ?? [];
  const done = stops.filter(
    (s) => s.status === "picked_up" || s.status === "dropped",
  ).length;
  const total = stops.length;
  const pct = total ? Math.round((done / total) * 100) : 0;
  const nextStop = [...stops]
    .sort((a, b) => a.order - b.order)
    .find((s) => s.status === "pending" || s.status === "arrived");
  const remaining = total - done;

  return (
    <Screen
      title="Today"
      right={
        <HeaderIconButton
          icon={Bell}
          badge={(unread.data ?? 0) > 0 ? unread.data : undefined}
          onPress={() => go("Notifications")}
        />
      }
      refreshing={tripsQuery.isRefetching || tripsQuery.isLoading}
      onRefresh={() => {
        tripsQuery.refetch();
        routesQuery.refetch();
      }}
    >
      {/* Greeting banner */}
      <View style={styles.bannerWrap}>
        <LinearGradient
          colors={[...gradients.hero] as [string, string, ...string[]]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.banner}
        >
          <Avatar name={user?.fullName || "D"} seed={user?.id} size={44} />
          <VStack gap={2} flex={1}>
            <Text variant="label-lg" weight="700" style={{ color: "#FFFFFF" }}>
              {greeting()}, {user?.fullName?.split(" ")[0] || "Driver"}!
            </Text>
            <Text variant="body-sm" style={{ color: "rgba(255,255,255,0.72)" }}>
              {active ? routeName(active) : "Ready to start your run"}
            </Text>
          </VStack>
          <View style={styles.onlineChip}>
            <View style={styles.onlineDot} />
            <Text variant="label-sm" weight="700" style={{ color: "#86EFAC" }}>
              Online
            </Text>
          </View>
        </LinearGradient>
      </View>

      {/* Today's Trip — active (progress) or start-route (idle) */}
      {active ? (
        <Pressable
          onPress={() => navigation.navigate("RunTrip", { tripId: active.id })}
          style={styles.tripCardWrap}
        >
          <LinearGradient
            colors={[...gradients.violet] as [string, string, ...string[]]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.tripCard}
          >
            <HStack align="flex-start" justify="space-between">
              <VStack gap={3} flex={1}>
                <Text
                  variant="overline"
                  style={{ color: "rgba(255,255,255,0.7)" }}
                >
                  Today’s Trip
                </Text>
                <Text variant="h2" style={{ color: "#FFFFFF" }}>
                  {routeName(active)}
                </Text>
                <Text
                  variant="body-sm"
                  style={{ color: "rgba(255,255,255,0.82)" }}
                >
                  {TRIP_TYPE_LABEL[active.type]} in progress
                </Text>
              </VStack>
              <View style={[styles.busTile, glass.light]}>
                <Bus size={26} color="#FFFFFF" strokeWidth={2} />
              </View>
            </HStack>

            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${pct}%` }]} />
            </View>
            <Text
              variant="label"
              weight="700"
              style={{ color: "#FFFFFF", marginTop: 8 }}
            >
              {done} / {total}{" "}
              {active.type === "pickup" ? "Picked Up" : "Dropped"}
            </Text>
          </LinearGradient>
        </Pressable>
      ) : (
        <Card style={{ marginTop: 14 }}>
          <VStack gap={14}>
            <Text variant="h3" tone="primary">
              Start a route
            </Text>
            {routeOptions.length === 0 ? (
              <Text variant="body-sm" tone="tertiary">
                {routesQuery.isLoading
                  ? "Loading routes…"
                  : "No routes assigned to you yet."}
              </Text>
            ) : (
              <Select
                label="Route"
                placeholder="Select a route"
                value={routeId}
                options={routeOptions}
                onChange={(v) => {
                  setRouteId(String(v));
                  setError(null);
                }}
              />
            )}
            {error ? (
              <Text variant="body-sm" tone="danger">
                {error}
              </Text>
            ) : null}
            <HStack gap={12}>
              <View style={{ flex: 1 }}>
                <Button
                  label="Start Pickup"
                  icon={<Play size={16} color="#FFFFFF" strokeWidth={2.4} />}
                  loading={startTrip.isPending}
                  disabled={!routeId}
                  onPress={() => start("pickup")}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Button
                  label="Start Drop"
                  variant="secondary"
                  icon={
                    <Play
                      size={16}
                      color={palette.text.primary}
                      strokeWidth={2.4}
                    />
                  }
                  loading={startTrip.isPending}
                  disabled={!routeId}
                  onPress={() => start("drop")}
                />
              </View>
            </HStack>
          </VStack>
        </Card>
      )}

      {/* Stat grid (live) */}
      {active ? (
        <View style={styles.grid}>
          <StatTile
            icon={MapPin}
            tint="violet"
            label="Next Stop"
            value={nextStop ? nextStop.studentName.split(" ")[0] : "All done"}
          />
          <StatTile
            icon={Users}
            tint="blue"
            label="On Board"
            value={`${done}`}
          />
          <StatTile
            icon={CheckCircle2}
            tint="green"
            label={active.type === "pickup" ? "Picked Up" : "Dropped"}
            value={`${done}/${total}`}
          />
          <StatTile
            icon={Clock}
            tint="amber"
            label="Remaining"
            value={`${remaining}`}
          />
        </View>
      ) : null}

      {/* Quick actions */}
      <Text
        variant="h3"
        tone="primary"
        style={{ marginTop: 22, marginBottom: 12 }}
      >
        Quick Actions
      </Text>
      <View style={styles.grid}>
        <ActionTile
          icon={ScanLine}
          tint="violet"
          label="Scan QR"
          sub="Scan student pass"
          onPress={() => go("Scan")}
        />
        <ActionTile
          icon={Coins}
          tint="green"
          label="Collect Cash"
          sub="Record payments"
          onPress={() => go("Payments")}
        />
        <ActionTile
          icon={ShieldAlert}
          tint="red"
          label="SOS"
          sub="Emergency alert"
          onPress={() => go("Sos")}
        />
        <ActionTile
          icon={GraduationCap}
          tint="blue"
          label="My Students"
          sub="View list"
          onPress={() => go("Students")}
        />
      </View>

      {/* Idle empty illustration */}
      {!active ? (
        <View style={styles.emptyCard}>
          <BusScene size={150} />
          <Text
            variant="h3"
            align="center"
            style={{ color: accent.main, marginTop: 6 }}
          >
            No Active Trip
          </Text>
          <Text
            variant="body-sm"
            tone="tertiary"
            align="center"
            style={{ marginTop: 4, maxWidth: 300 }}
          >
            Start your pickup or drop route above when it’s time to begin.
          </Text>
        </View>
      ) : null}
    </Screen>
  );
}

function StatTile({
  icon: Icon,
  tint,
  label,
  value,
}: {
  icon: typeof MapPin;
  tint: keyof typeof tints;
  label: string;
  value: string;
}) {
  const t = tints[tint];
  return (
    <View style={styles.tile}>
      <View style={[styles.tileIcon, { backgroundColor: t.bg }]}>
        <Icon size={18} color={t.icon} strokeWidth={2} />
      </View>
      <Text
        variant="h3"
        tone="primary"
        numberOfLines={1}
        style={{ marginTop: 10 }}
      >
        {value}
      </Text>
      <Text variant="body-sm" tone="tertiary" numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

function ActionTile({
  icon: Icon,
  tint,
  label,
  sub,
  onPress,
}: {
  icon: typeof ScanLine;
  tint: keyof typeof tints;
  label: string;
  sub: string;
  onPress: () => void;
}) {
  const t = tints[tint];
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.tile, pressed && { opacity: 0.85 }]}
    >
      <View style={[styles.tileIcon, { backgroundColor: t.bg }]}>
        <Icon size={20} color={t.icon} strokeWidth={2} />
      </View>
      <Text variant="label-lg" tone="primary" style={{ marginTop: 10 }}>
        {label}
      </Text>
      <Text variant="caption" tone="tertiary">
        {sub}
      </Text>
    </Pressable>
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
  onlineChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "rgba(134,239,172,0.14)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radius.full,
  },
  onlineDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: "#22C55E",
  },
  tripCardWrap: {
    marginTop: 14,
    borderRadius: radius.lg,
    overflow: "hidden",
  },
  tripCard: { padding: 18 },
  busTile: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  progressTrack: {
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(255,255,255,0.25)",
    marginTop: 16,
    overflow: "hidden",
  },
  progressFill: {
    height: 8,
    borderRadius: 4,
    backgroundColor: "#FDB022",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginTop: 14,
  },
  tile: {
    flexBasis: "47%",
    flexGrow: 1,
    minWidth: 150,
    backgroundColor: palette.surface.primary,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: palette.border.default,
    padding: 14,
  },
  tileIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyCard: {
    marginTop: 18,
    alignItems: "center",
    paddingVertical: 10,
  },
});
