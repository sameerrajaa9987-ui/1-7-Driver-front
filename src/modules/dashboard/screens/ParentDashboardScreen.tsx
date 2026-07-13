/**
 * ParentDashboardScreen — matches the client's "No Active Ride" mockup:
 *   navy greeting · child selector (▾) · live-status hero OR an illustrated
 *   "No Active Ride" card · Today's Schedule · Quick Actions · Stay Updated.
 * Everything reflects the currently-selected child.
 */
import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Linking,
  Platform,
  Pressable,
  View,
  StyleSheet,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import {
  Phone,
  ShieldAlert,
  PlayCircle,
  MapPin,
  UserCheck,
  School,
  ChevronRight,
  ChevronDown,
  CalendarDays,
  BellRing,
  Bell,
  Check,
} from "lucide-react-native";
import { emitSocket, onSocket } from "@shared/api/socket";
import { useAuthStore } from "@shared/store/useAuthStore";
import { useStudents } from "@modules/student/hooks/useStudents";
import { useTrips } from "@modules/trip/hooks/useTrips";
import { useTripPosition } from "@modules/tracking/hooks/useTracking";
import { useUnreadCount } from "@modules/notification/hooks/useNotifications";
import { useTriggerSos } from "@modules/sos/hooks/useSos";
import { useSectionNav } from "@navigation/AppNavigator";
import { palette, radius, gradients, accent } from "@shared/designSystem";
import {
  Screen,
  Text,
  VStack,
  HStack,
  Card,
  Avatar,
  BusScene,
  HeaderIconButton,
} from "@shared/ui";
import { childAvatarSvg } from "@shared/avatars";
import { mediaUrl } from "@shared/media";
import { Trip, TripStop } from "@modules/trip/types";
import { DEMO_COORD, todayISO } from "@modules/trip/utils";

interface VehicleFrame {
  tripId: string;
  lat: number;
  lng: number;
  speed: number;
  heading: number;
  at: string;
}

function distanceM(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number },
) {
  const R = 6371000;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
}

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good Morning";
  if (h < 17) return "Good Afternoon";
  return "Good Evening";
}

const fmtTime = (d?: string | null) =>
  d
    ? new Date(d).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : "—";

export default function ParentDashboardScreen() {
  const go = useSectionNav();
  const user = useAuthStore((s) => s.user);
  const date = todayISO();

  const childrenQuery = useStudents({ limit: 50 });
  const children = useMemo(
    () => childrenQuery.data?.data ?? [],
    [childrenQuery.data],
  );

  // Selected child (default first). The whole screen reflects this child.
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const child = useMemo(
    () => children.find((c) => c.id === selectedId) ?? children[0] ?? null,
    [children, selectedId],
  );

  const tripsQuery = useTrips({ date, status: "in_progress" });
  const trips = useMemo(() => tripsQuery.data?.data ?? [], [tripsQuery.data]);

  // The active trip + this child's stop, if a ride is currently running.
  const { trip, myStop } = useMemo(() => {
    if (!child)
      return { trip: null as Trip | null, myStop: null as TripStop | null };
    for (const t of trips) {
      const stop = t.stops.find((s) => s.studentId === child.id);
      if (stop) return { trip: t, myStop: stop };
    }
    return { trip: null as Trip | null, myStop: null as TripStop | null };
  }, [trips, child]);

  const sos = useTriggerSos();
  const unread = useUnreadCount();

  // Live GPS frame for the ETA — socket push, seeded/fallen-back by a GET so it
  // shows the moment the screen opens mid-trip.
  const [socketFrame, setSocketFrame] = useState<VehicleFrame | null>(null);
  const lastKnown = useTripPosition(trip?.id);
  const frame = socketFrame ?? (lastKnown.data as VehicleFrame | null) ?? null;
  useEffect(() => {
    if (!trip?.id) return;
    setSocketFrame(null);
    emitSocket("trip:subscribe", trip.id);
    const unsub = onSocket<VehicleFrame>("vehicle:position", (f) => {
      if (f?.tripId === trip.id) setSocketFrame(f);
    });
    return unsub;
  }, [trip?.id]);

  const eta = useMemo(() => {
    if (!frame || !child?.pickupPoint) return null;
    const before = myStop?.status === "pending" || myStop?.status === "arrived";
    if (!before) return null;
    const d = distanceM(frame, {
      lat: child.pickupPoint.lat ?? DEMO_COORD.lat,
      lng: child.pickupPoint.lng ?? DEMO_COORD.lng,
    });
    if (d < 80) return "Arriving now";
    const speed = frame.speed > 1 ? frame.speed : 18;
    return `Arriving in ~ ${Math.max(1, Math.round(d / ((speed * 1000) / 60)))} min`;
  }, [frame, child?.pickupPoint, myStop?.status]);

  const boarded =
    myStop?.status === "picked_up" || myStop?.status === "dropped";

  // While the trip is live and the child hasn't boarded, the van is "On the
  // way" — only switch to boarded/absent once the stop actually transitions.
  const status = !trip
    ? null
    : myStop?.status === "dropped"
      ? "Dropped safely"
      : myStop?.status === "picked_up"
        ? "On board"
        : myStop?.status === "no_show"
          ? "Absent"
          : "On the way";
  const steps = [
    {
      label: "Trip Started",
      icon: PlayCircle,
      time: fmtTime(trip?.startedAt),
      done: Boolean(trip?.startedAt),
    },
    {
      label: "Vehicle Arriving",
      icon: MapPin,
      time: fmtTime(myStop?.arrivedAt),
      done: Boolean(myStop?.arrivedAt) || boarded,
    },
    {
      label: "On Board",
      icon: UserCheck,
      time: boarded ? fmtTime(myStop?.completedAt) : "—",
      done: boarded,
    },
    {
      label: "Reached School",
      icon: School,
      time: fmtTime(trip?.reachedSchoolAt),
      done: Boolean(trip?.reachedSchoolAt),
    },
  ];

  const raiseSos = () => {
    const send = () =>
      sos.mutate({
        tripId: trip?.id,
        lat: frame?.lat ?? 0,
        lng: frame?.lng ?? 0,
        message: `Parent emergency${child ? ` about ${child.name}` : ""}`,
      });
    if (Platform.OS === "web") {
      if (window.confirm("Send an emergency alert to the operator?")) send();
    } else {
      Alert.alert("Emergency SOS", "Alert the operator and driver?", [
        { text: "Cancel", style: "cancel" },
        { text: "Send SOS", style: "destructive", onPress: send },
      ]);
    }
  };

  const classLine = child
    ? [child.className && `Class ${child.className}`, child.section]
        .filter(Boolean)
        .join(" · ") || child.schoolName
    : "";

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
      refreshing={childrenQuery.isLoading || tripsQuery.isRefetching}
      onRefresh={() => {
        childrenQuery.refetch();
        tripsQuery.refetch();
      }}
    >
      {/* Navy greeting banner */}
      <View style={styles.bannerWrap}>
        <LinearGradient
          colors={[...gradients.hero] as [string, string, ...string[]]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.banner}
        >
          <HStack gap={12} align="center">
            <Avatar
              name={user?.fullName || "P"}
              seed={user?.id || "parent"}
              size={40}
            />
            <VStack gap={2} flex={1}>
              <Text
                variant="label-lg"
                weight="700"
                style={{ color: "#FFFFFF" }}
              >
                {greeting()}, {user?.fullName?.split(" ")[0] || "there"}! 👋
              </Text>
              <Text
                variant="body-sm"
                style={{ color: "rgba(255,255,255,0.75)" }}
              >
                Here’s your child’s update for today.
              </Text>
            </VStack>
          </HStack>
        </LinearGradient>
      </View>

      {/* Child selector */}
      {child ? (
        <View style={{ marginTop: 14 }}>
          <Pressable
            onPress={() => children.length > 1 && setPickerOpen((o) => !o)}
            style={styles.selector}
          >
            <Avatar
              name={child.name}
              seed={child.id}
              size={44}
              photo={child.photo ? mediaUrl(child.photo) : undefined}
              svgXml={child.photo ? undefined : childAvatarSvg(child.id)}
            />
            <VStack gap={2} flex={1}>
              <Text variant="label-lg" tone="primary" numberOfLines={1}>
                {child.name}
              </Text>
              {classLine ? (
                <Text variant="body-sm" tone="tertiary" numberOfLines={1}>
                  {classLine}
                </Text>
              ) : null}
            </VStack>
            {children.length > 1 ? (
              <ChevronDown
                size={20}
                color={palette.text.tertiary}
                strokeWidth={2}
                style={{
                  transform: [{ rotate: pickerOpen ? "180deg" : "0deg" }],
                }}
              />
            ) : null}
          </Pressable>

          {pickerOpen && children.length > 1 ? (
            <Card style={{ marginTop: 8, padding: 6 }}>
              {children.map((c) => {
                const active = c.id === child.id;
                return (
                  <Pressable
                    key={c.id}
                    onPress={() => {
                      setSelectedId(c.id);
                      setPickerOpen(false);
                    }}
                    style={[
                      styles.pickerRow,
                      active && { backgroundColor: accent.soft },
                    ]}
                  >
                    <Avatar
                      name={c.name}
                      seed={c.id}
                      size={32}
                      photo={c.photo ? mediaUrl(c.photo) : undefined}
                      svgXml={c.photo ? undefined : childAvatarSvg(c.id)}
                    />
                    <Text
                      variant="label"
                      weight={active ? "700" : "500"}
                      tone="primary"
                      style={{ flex: 1 }}
                      numberOfLines={1}
                    >
                      {c.name}
                    </Text>
                    {active ? (
                      <Check size={16} color={accent.main} strokeWidth={2.4} />
                    ) : null}
                  </Pressable>
                );
              })}
            </Card>
          ) : null}
        </View>
      ) : null}

      {/* Live 'On the way' card (mockup) OR illustrated No Active Ride */}
      {trip && myStop ? (
        <Pressable onPress={() => go("Track")} style={styles.liveCard}>
          {/* Lavender header — status + bus illustration */}
          <View style={styles.liveHeader}>
            <VStack gap={4} flex={1}>
              <Text variant="h1" tone="primary">
                {status}
              </Text>
              <Text variant="body-sm" tone="tertiary">
                {eta ||
                  (boarded
                    ? "Your child is on the vehicle"
                    : "Waiting for the vehicle…")}
              </Text>
            </VStack>
            <BusScene size={124} />
          </View>

          {/* Route / driver / vehicle + journey timeline */}
          <View style={styles.liveBody}>
            <HStack align="center" justify="space-between">
              <VStack gap={2} flex={1}>
                <Text
                  variant="label-lg"
                  weight="700"
                  tone="primary"
                  numberOfLines={1}
                >
                  {child?.routeName || "Route"}
                </Text>
                <Text variant="body-sm" tone="tertiary" numberOfLines={1}>
                  {child?.driverName || "Driver"}
                </Text>
              </VStack>
              {child?.vehicleNumber ? (
                <View style={styles.vehicleChipLight}>
                  <Text
                    variant="label-sm"
                    weight="700"
                    style={{ color: palette.text.secondary }}
                  >
                    {child.vehicleNumber}
                  </Text>
                </View>
              ) : null}
            </HStack>

            <View style={styles.timeline}>
              {steps.map((s, i) => (
                <View key={s.label} style={styles.tlCol}>
                  <View style={styles.tlIconRow}>
                    <View
                      style={[
                        styles.tlLine,
                        {
                          opacity: i === 0 ? 0 : 1,
                          backgroundColor: s.done
                            ? accent.main
                            : palette.ink[200],
                        },
                      ]}
                    />
                    <View
                      style={[
                        styles.tlCircle,
                        {
                          backgroundColor: s.done
                            ? accent.main
                            : palette.ink[100],
                        },
                      ]}
                    >
                      <s.icon
                        size={15}
                        color={s.done ? "#FFFFFF" : palette.ink[400]}
                        strokeWidth={2}
                      />
                    </View>
                    <View
                      style={[
                        styles.tlLine,
                        {
                          opacity: i === steps.length - 1 ? 0 : 1,
                          backgroundColor: steps[i + 1]?.done
                            ? accent.main
                            : palette.ink[200],
                        },
                      ]}
                    />
                  </View>
                  <Text
                    variant="label-sm"
                    weight="600"
                    align="center"
                    style={{
                      color: palette.ink[600],
                      fontSize: 10,
                      marginTop: 6,
                    }}
                  >
                    {s.label}
                  </Text>
                  <Text
                    variant="caption"
                    align="center"
                    style={{ color: palette.ink[400], fontSize: 10 }}
                  >
                    {s.time}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        </Pressable>
      ) : (
        <View style={[styles.emptyCard, { marginTop: 14 }]}>
          <BusScene size={170} />
          <Text
            variant="h2"
            align="center"
            style={{ color: accent.main, marginTop: 10 }}
          >
            No Active Ride
          </Text>
          <Text
            variant="body-sm"
            tone="tertiary"
            align="center"
            style={{ marginTop: 6, maxWidth: 300 }}
          >
            There is no active trip right now. The next trip will appear here
            once the driver starts the route.
          </Text>
        </View>
      )}

      {/* Today's Schedule */}
      {child ? (
        <Card style={{ marginTop: 14 }}>
          <HStack gap={8} align="center" style={{ marginBottom: 12 }}>
            <CalendarDays size={17} color={accent.main} strokeWidth={2} />
            <Text variant="h3" tone="primary">
              Today’s Schedule
            </Text>
          </HStack>
          <HStack gap={12}>
            <View style={styles.scheduleCol}>
              <Text variant="caption" tone="tertiary">
                Pickup Time
              </Text>
              <Text variant="h3" tone="primary" style={{ marginTop: 4 }}>
                {child.pickupTime || "—"}
              </Text>
            </View>
            <View style={styles.scheduleCol}>
              <Text variant="caption" tone="tertiary">
                Drop Time
              </Text>
              <Text variant="h3" tone="primary" style={{ marginTop: 4 }}>
                {child.dropTime || "—"}
              </Text>
            </View>
          </HStack>
        </Card>
      ) : null}

      {/* Quick actions */}
      <Text
        variant="h3"
        tone="primary"
        style={{ marginTop: 20, marginBottom: 10 }}
      >
        Quick Actions
      </Text>
      <HStack gap={12}>
        <Pressable
          onPress={() =>
            child?.driverMobile && Linking.openURL(`tel:${child.driverMobile}`)
          }
          style={[styles.quick, { backgroundColor: accent.soft }]}
        >
          <Phone size={17} color={accent.main} strokeWidth={2.1} />
          <Text variant="label" weight="600" style={{ color: accent.dark }}>
            Call Driver
          </Text>
        </Pressable>
        <Pressable
          onPress={raiseSos}
          style={[styles.quick, { backgroundColor: palette.danger.bg }]}
        >
          <ShieldAlert
            size={17}
            color={palette.danger.text}
            strokeWidth={2.1}
          />
          <Text
            variant="label"
            weight="600"
            style={{ color: palette.danger.text }}
          >
            Emergency SOS
          </Text>
        </Pressable>
      </HStack>

      {/* Stay Updated */}
      <Pressable onPress={() => go("Notifications")} style={styles.stayCard}>
        <View style={styles.stayIcon}>
          <BellRing size={18} color={accent.main} strokeWidth={2} />
        </View>
        <VStack gap={2} flex={1}>
          <Text variant="label-lg" tone="primary">
            Stay Updated
          </Text>
          <Text variant="body-sm" tone="tertiary">
            You’ll receive alerts at every step of your child’s journey.
          </Text>
        </VStack>
        <ChevronRight size={18} color={palette.text.tertiary} strokeWidth={2} />
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  bannerWrap: { borderRadius: radius.lg, overflow: "hidden" },
  banner: { padding: 16 },
  selector: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: palette.surface.primary,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: palette.border.default,
    padding: 12,
  },
  pickerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 8,
    borderRadius: radius.md,
  },
  liveCard: {
    marginTop: 14,
    backgroundColor: palette.surface.primary,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: palette.border.default,
    overflow: "hidden",
  },
  liveHeader: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: accent.soft,
    paddingHorizontal: 18,
    paddingVertical: 14,
  },
  liveBody: { padding: 16 },
  vehicleChipLight: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: palette.border.default,
    backgroundColor: palette.surface.secondary,
  },
  timeline: { flexDirection: "row", marginTop: 18 },
  tlCol: { flex: 1, alignItems: "center" },
  tlIconRow: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "stretch",
    justifyContent: "center",
  },
  tlLine: { flex: 1, height: 2 },
  tlCircle: {
    width: 32,
    height: 32,
    borderRadius: radius.full,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyCard: {
    backgroundColor: palette.surface.primary,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: palette.border.default,
    paddingVertical: 28,
    paddingHorizontal: 20,
    alignItems: "center",
  },
  scheduleCol: {
    flex: 1,
    backgroundColor: palette.surface.secondary,
    borderRadius: radius.md,
    padding: 14,
  },
  quick: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: radius.md,
  },
  stayCard: {
    marginTop: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: palette.surface.primary,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: palette.border.default,
    padding: 14,
  },
  stayIcon: {
    width: 38,
    height: 38,
    borderRadius: radius.md,
    backgroundColor: accent.soft,
    alignItems: "center",
    justifyContent: "center",
  },
});
