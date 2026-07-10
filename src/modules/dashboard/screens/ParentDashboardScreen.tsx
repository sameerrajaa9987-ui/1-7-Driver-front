/**
 * ParentDashboardScreen — per the client kit: navy greeting banner, violet
 * live-status hero ("On the way · Arriving in ~ 6 min") with route/driver/
 * vehicle, journey step icons with times, and Call Driver / Emergency SOS
 * quick actions.
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
  Bus,
  Phone,
  ShieldAlert,
  PlayCircle,
  MapPin,
  UserCheck,
  School,
  ChevronRight,
} from "lucide-react-native";
import { emitSocket, onSocket } from "@shared/api/socket";
import { useAuthStore } from "@shared/store/useAuthStore";
import { useStudents, useTrips } from "@modules/trip/hooks/useTrips";
import { useStudent } from "@modules/student/hooks/useStudents";
import { useTriggerSos } from "@modules/sos/hooks/useSos";
import { useSectionNav } from "@navigation/AppNavigator";
import {
  palette,
  radius,
  gradients,
  glass,
  accentFor,
  tripStatusMeta,
} from "@shared/designSystem";
import { Screen, Text, VStack, HStack, Card, Avatar } from "@shared/ui";
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
  const accent = accentFor("parent");
  const date = todayISO();
  const userId = user?.id ?? null;

  const { data, isLoading, refetch, isRefetching } = useTrips({
    date,
    status: "in_progress",
  });
  useStudents(); // warms the cache used by Track
  const trips = useMemo(() => data?.data ?? [], [data]);

  const { trip, myStop } = useMemo(() => {
    for (const t of trips) {
      const stop = t.stops.find(
        (s) => s.parentUserId && s.parentUserId === userId,
      );
      if (stop) return { trip: t, myStop: stop };
    }
    return { trip: null as Trip | null, myStop: null as TripStop | null };
  }, [trips, userId]);

  const { data: child } = useStudent(myStop?.studentId || "");
  const sos = useTriggerSos();

  // Live GPS frame for the ETA.
  const [frame, setFrame] = useState<VehicleFrame | null>(null);
  useEffect(() => {
    if (!trip?.id) return;
    setFrame(null);
    emitSocket("trip:subscribe", trip.id);
    const unsub = onSocket<VehicleFrame>("vehicle:position", (f) => {
      if (f?.tripId === trip.id) setFrame(f);
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

  const status = trip
    ? (tripStatusMeta[myStop?.status || trip.status]?.label ?? "On the way")
    : null;

  const boarded =
    myStop?.status === "picked_up" || myStop?.status === "dropped";
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
        message: `Parent emergency${myStop ? ` about ${myStop.studentName}` : ""}`,
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

  return (
    <Screen
      title="Dashboard"
      refreshing={isRefetching || isLoading}
      onRefresh={refetch}
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

      {/* Live status hero — violet (tap → Live Tracking) */}
      {trip && myStop ? (
        <Pressable onPress={() => go("Track")} style={styles.heroWrap}>
          <LinearGradient
            colors={[...gradients.violet] as [string, string, ...string[]]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.hero}
          >
            <HStack align="center" justify="space-between">
              <VStack gap={3} flex={1}>
                <Text variant="display-sm" style={{ color: "#FFFFFF" }}>
                  {status}
                </Text>
                <Text
                  variant="body"
                  style={{ color: "rgba(255,255,255,0.85)" }}
                >
                  {eta ||
                    (boarded
                      ? "Your child is on the vehicle"
                      : "Waiting for the vehicle…")}
                </Text>
              </VStack>
              <View style={[styles.busTile, glass.light]}>
                <Bus size={30} color="#FFFFFF" strokeWidth={1.8} />
              </View>
            </HStack>

            <HStack
              gap={8}
              align="center"
              justify="space-between"
              style={{ marginTop: 16 }}
            >
              <VStack gap={1} flex={1}>
                <Text
                  variant="label"
                  weight="700"
                  style={{ color: "#FFFFFF" }}
                  numberOfLines={1}
                >
                  {child?.routeName || "Route"}
                </Text>
                <Text
                  variant="caption"
                  style={{ color: "rgba(255,255,255,0.8)" }}
                  numberOfLines={1}
                >
                  {child?.driverName || "Driver"}
                </Text>
              </VStack>
              {child?.vehicleNumber ? (
                <View style={[styles.vehicleChip, glass.light]}>
                  <Text
                    variant="label-sm"
                    weight="700"
                    style={{ color: "#FFFFFF" }}
                  >
                    {child.vehicleNumber}
                  </Text>
                </View>
              ) : null}
              <ChevronRight size={18} color="rgba(255,255,255,0.8)" />
            </HStack>
          </LinearGradient>
        </Pressable>
      ) : (
        <Card style={{ marginTop: 14 }}>
          <HStack gap={12} align="center">
            <View style={[styles.busTileLight]}>
              <Bus size={24} color={accent.main} strokeWidth={1.9} />
            </View>
            <VStack gap={2} flex={1}>
              <Text variant="h3" tone="primary">
                No active ride right now
              </Text>
              <Text variant="body-sm" tone="tertiary">
                Live updates appear here the moment the trip starts.
              </Text>
            </VStack>
          </HStack>
        </Card>
      )}

      {/* Journey steps */}
      {trip && myStop ? (
        <Card style={{ marginTop: 14 }}>
          <HStack gap={4}>
            {steps.map((s) => (
              <VStack key={s.label} gap={6} align="center" flex={1}>
                <View
                  style={[
                    styles.stepIcon,
                    {
                      backgroundColor: s.done ? accent.soft : palette.ink[100],
                    },
                  ]}
                >
                  <s.icon
                    size={17}
                    color={s.done ? accent.main : palette.ink[400]}
                    strokeWidth={2}
                  />
                </View>
                <Text
                  variant="label-sm"
                  weight="600"
                  align="center"
                  style={{ color: palette.ink[600], fontSize: 10 }}
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
              </VStack>
            ))}
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
    </Screen>
  );
}

const styles = StyleSheet.create({
  bannerWrap: { borderRadius: radius.lg, overflow: "hidden" },
  banner: { padding: 16 },
  heroWrap: {
    borderRadius: radius.lg,
    overflow: "hidden",
    marginTop: 14,
  },
  hero: { padding: 18 },
  busTile: {
    width: 56,
    height: 56,
    borderRadius: radius.lg,
    alignItems: "center",
    justifyContent: "center",
  },
  busTileLight: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    backgroundColor: palette.brand[50],
    alignItems: "center",
    justifyContent: "center",
  },
  vehicleChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radius.sm,
  },
  stepIcon: {
    width: 38,
    height: 38,
    borderRadius: radius.full,
    alignItems: "center",
    justifyContent: "center",
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
});
