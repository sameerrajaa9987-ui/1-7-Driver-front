import React, { useEffect, useMemo, useState } from "react";
import { Alert, Linking, Platform, Pressable, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Bus, Gauge, Navigation2, Phone, ShieldAlert } from "lucide-react-native";
import { emitSocket, onSocket } from "@shared/api/socket";
import LiveMap from "@shared/ui/MapView";
import type { MapMarker } from "@shared/ui/map.types";
import { useAuthStore } from "@shared/store/useAuthStore";
import { useStudent } from "@modules/student/hooks/useStudents";
import { useTriggerSos } from "@modules/sos/hooks/useSos";
import {
  palette,
  tints,
  tripStatusMeta,
  gradients,
  radius,
  glass,
} from "@shared/designSystem";
import {
  Screen,
  Text,
  VStack,
  HStack,
  Card,
  EmptyState,
  StatusTimeline,
  LiveBadge,
  type TimelineStep,
} from "@shared/ui";
import { useStudents, useTrips } from "@modules/trip/hooks/useTrips";
import { Trip, TripStop } from "@modules/trip/types";
import { DEMO_COORD, TRIP_TYPE_LABEL, todayISO } from "@modules/trip/utils";

interface VehicleFrame {
  tripId: string;
  lat: number;
  lng: number;
  speed: number;
  heading: number;
  at: string;
}

/** Haversine metres — for a client-side ETA to the pickup point. */
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

export default function ParentTrackScreen() {
  const userId = useAuthStore((s) => s.user?.id ?? null);
  const date = todayISO();

  const { data, isLoading, refetch, isRefetching } = useTrips({
    date,
    status: "in_progress",
  });
  const students = useStudents();
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

  const pickup = useMemo(() => {
    if (!myStop) return null;
    const child = (students.data?.data ?? []).find(
      (s) => s.id === myStop.studentId,
    );
    if (!child?.pickupPoint || typeof child.pickupPoint.lat !== "number")
      return null;
    return {
      lat: child.pickupPoint.lat,
      lng: child.pickupPoint.lng,
      name: child.name,
    };
  }, [myStop, students.data]);

  const markers: MapMarker[] = useMemo(() => {
    const m: MapMarker[] = [];
    if (frame)
      m.push({
        id: "vehicle",
        lat: frame.lat,
        lng: frame.lng,
        label: "Van",
        kind: "vehicle",
      });
    if (pickup)
      m.push({
        id: "pickup",
        lat: pickup.lat,
        lng: pickup.lng,
        label: `${pickup.name} pickup`,
        kind: "home",
      });
    return m;
  }, [frame, pickup]);

  const center = frame
    ? { lat: frame.lat, lng: frame.lng }
    : pickup
      ? { lat: pickup.lat, lng: pickup.lng }
      : DEMO_COORD;

  // Client-side ETA to pickup, shown only before the child boards.
  const eta = useMemo(() => {
    if (!frame || !pickup) return null;
    const beforeBoard =
      myStop?.status === "pending" || myStop?.status === "arrived";
    if (!beforeBoard) return null;
    const d = distanceM(frame, pickup);
    if (d < 80) return "Arriving now";
    const speed = frame.speed > 1 ? frame.speed : 18; // km/h fallback
    const mins = Math.max(1, Math.round(d / ((speed * 1000) / 60)));
    return `Arriving in ~${mins} min`;
  }, [frame, pickup, myStop?.status]);

  if (!trip || !myStop) {
    return (
      <Screen
        overline="Live"
        title="Track ride"
        refreshing={isRefetching || isLoading}
        onRefresh={refetch}
      >
        <EmptyState
          icon={Bus}
          title={isLoading ? "Checking for rides…" : "No active ride right now"}
          message="You'll see your child's live location here the moment their trip starts."
        />
      </Screen>
    );
  }

  const meta = tripStatusMeta[trip.status] ?? tripStatusMeta.in_progress;
  const steps = buildSteps(trip, myStop);

  return (
    <TrackContent
      trip={trip}
      myStop={myStop}
      meta={meta}
      steps={steps}
      frame={frame}
      eta={eta}
      markers={markers}
      center={center}
      refreshing={isRefetching || isLoading}
      onRefresh={refetch}
    />
  );
}

function TrackContent({
  trip,
  myStop,
  meta,
  steps,
  frame,
  eta,
  markers,
  center,
  refreshing,
  onRefresh,
}: {
  trip: Trip;
  myStop: TripStop;
  meta: { label: string };
  steps: TimelineStep[];
  frame: VehicleFrame | null;
  eta: string | null;
  markers: MapMarker[];
  center: { lat: number; lng: number };
  refreshing: boolean;
  onRefresh: () => void;
}) {
  // Assigned driver contact (enriched student detail) + parent-side SOS.
  const { data: child } = useStudent(myStop.studentId);
  const sos = useTriggerSos();

  const raiseSos = () => {
    const send = () =>
      sos.mutate({
        tripId: trip.id,
        lat: frame?.lat ?? 0,
        lng: frame?.lng ?? 0,
        message: `Parent emergency about ${myStop.studentName}`,
      });
    if (Platform.OS === "web") {
      if (window.confirm("Send an emergency alert to the operator?")) send();
    } else {
      Alert.alert(
        "Emergency SOS",
        "Alert the operator and driver about your child?",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Send SOS", style: "destructive", onPress: send },
        ],
      );
    }
  };

  return (
    <Screen
      overline="Live"
      title="Track ride"
      subtitle={`${TRIP_TYPE_LABEL[trip.type]} · ${myStop.studentName}`}
      refreshing={refreshing}
      onRefresh={onRefresh}
    >
      {/* Status-first midnight hero — the one thing a parent wants to know. */}
      <View style={{ borderRadius: radius.xl, overflow: "hidden" }}>
        <LinearGradient
          colors={[...gradients.hero] as [string, string, ...string[]]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ padding: 22 }}
        >
          <HStack justify="space-between" align="flex-start">
            <VStack gap={6} flex={1}>
              <Text variant="overline" style={{ color: palette.brand[400] }}>
                {myStop.studentName}
              </Text>
              <Text variant="display-sm" style={{ color: "#FFFFFF" }}>
                {meta.label}
              </Text>
              {eta ? (
                <View
                  style={[
                    glass.light,
                    {
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 7,
                      alignSelf: "flex-start",
                      paddingHorizontal: 12,
                      paddingVertical: 6,
                      borderRadius: radius.full,
                      marginTop: 4,
                    },
                  ]}
                >
                  <Navigation2
                    size={14}
                    color={palette.brand[300]}
                    strokeWidth={2.2}
                  />
                  <Text
                    variant="label"
                    weight="700"
                    style={{ color: "#FFFFFF" }}
                  >
                    {eta}
                  </Text>
                </View>
              ) : (
                <Text
                  variant="body-sm"
                  style={{ color: "rgba(255,255,255,0.72)" }}
                >
                  {frame ? "Van is on the move" : "Waiting for the van's GPS…"}
                </Text>
              )}
              {child?.vehicleNumber || child?.driverName ? (
                <Text
                  variant="caption"
                  style={{ color: "rgba(255,255,255,0.56)", marginTop: 6 }}
                  numberOfLines={1}
                >
                  {[child?.vehicleNumber, child?.driverName]
                    .filter(Boolean)
                    .join(" · ")}
                </Text>
              ) : null}
            </VStack>
            {frame ? <LiveBadge tone={palette.brand[400]} /> : null}
          </HStack>
        </LinearGradient>
      </View>

      {/* Quick actions — call the assigned driver, or raise an emergency. */}
      <HStack gap={10} style={{ marginTop: 12 }}>
        {child?.driverMobile ? (
          <Pressable
            onPress={() => Linking.openURL(`tel:${child.driverMobile}`)}
            style={{
              flex: 1,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              paddingVertical: 12,
              borderRadius: radius.md,
              backgroundColor: tints.green.bg,
              borderWidth: 1,
              borderColor: tints.green.ring,
            }}
          >
            <Phone size={16} color={tints.green.icon} strokeWidth={2.2} />
            <Text variant="label" weight="600" style={{ color: tints.green.fg }}>
              Call driver
            </Text>
          </Pressable>
        ) : null}
        <Pressable
          onPress={raiseSos}
          disabled={sos.isPending}
          style={{
            flex: 1,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            paddingVertical: 12,
            borderRadius: radius.md,
            backgroundColor: tints.red.bg,
            borderWidth: 1,
            borderColor: tints.red.ring,
            opacity: sos.isPending ? 0.6 : 1,
          }}
        >
          <ShieldAlert size={16} color={tints.red.icon} strokeWidth={2.2} />
          <Text variant="label" weight="600" style={{ color: tints.red.fg }}>
            {sos.isSuccess ? "SOS sent" : "Emergency SOS"}
          </Text>
        </Pressable>
      </HStack>

      <View style={{ marginTop: 16 }}>
        <LiveMap markers={markers} center={center} height={300} />
      </View>

      {frame ? (
        <HStack gap={8} align="center" style={{ marginTop: 10 }}>
          <Gauge size={14} color={palette.text.tertiary} strokeWidth={2} />
          <Text variant="caption" tone="tertiary">
            Moving at {Math.round(frame.speed || 0)} km/h · updated live
          </Text>
        </HStack>
      ) : null}

      <Text
        variant="h3"
        tone="primary"
        style={{ marginTop: 22, marginBottom: 12 }}
      >
        Journey
      </Text>
      <Card>
        <StatusTimeline steps={steps} />
      </Card>
    </Screen>
  );
}

/** Builds the journey timeline with done/active/pending states from stop status. */
function buildSteps(trip: Trip, stop: TripStop): TimelineStep[] {
  const s = stop.status;
  const boarded = s === "picked_up" || s === "dropped";
  const arrivedOrLater = s === "arrived" || boarded;
  const isDrop = trip.type === "drop";

  const time = (d?: string | null) =>
    d
      ? new Date(d).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })
      : undefined;

  const raw: TimelineStep[] = [
    {
      key: "start",
      label: "Trip started",
      state: trip.startedAt ? "done" : "pending",
      time: time(trip.startedAt),
    },
    {
      key: "arrive",
      label: "Van arriving at pickup",
      state: arrivedOrLater ? "done" : "pending",
      time: time(stop.arrivedAt),
    },
    {
      key: "board",
      label: isDrop ? "Dropped home safely" : "Boarded the van",
      state: boarded ? "done" : "pending",
      time: time(stop.completedAt),
      tint: s === "no_show" ? "red" : undefined,
    },
    isDrop
      ? {
          key: "done",
          label: "Trip completed",
          state: trip.completedAt ? "done" : "pending",
          time: time(trip.completedAt),
        }
      : {
          key: "school",
          label: "Reached school safely",
          state: trip.reachedSchoolAt ? "done" : "pending",
          time: time(trip.reachedSchoolAt),
        },
  ];

  if (s === "no_show") {
    raw[2] = {
      key: "board",
      label: "Marked absent",
      state: "done",
      tint: "red",
      time: time(stop.completedAt),
    };
  }

  // Mark the first not-done step as the active one.
  const firstPending = raw.findIndex((r) => r.state === "pending");
  if (firstPending >= 0) raw[firstPending].state = "active";
  return raw;
}
