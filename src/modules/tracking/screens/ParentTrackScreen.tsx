import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Linking,
  Platform,
  Pressable,
  View,
  StyleSheet,
} from "react-native";
import {
  Bus,
  Gauge,
  Phone,
  ShieldAlert,
  RefreshCw,
  Check,
} from "lucide-react-native";
import { emitSocket, onSocket } from "@shared/api/socket";
import LiveMap from "@shared/ui/MapView";
import type { MapMarker } from "@shared/ui/map.types";
import { useAuthStore } from "@shared/store/useAuthStore";
import { useStudent } from "@modules/student/hooks/useStudents";
import { useTripPosition } from "@modules/tracking/hooks/useTracking";
import { useTriggerSos } from "@modules/sos/hooks/useSos";
import {
  palette,
  tints,
  accent,
  tripStatusMeta,
  radius,
} from "@shared/designSystem";
import {
  Screen,
  Text,
  VStack,
  HStack,
  Card,
  Avatar,
  EmptyState,
  BusScene,
  HeaderIconButton,
  type TimelineStep,
} from "@shared/ui";
import { useStudents, useTrips } from "@modules/trip/hooks/useTrips";
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
          illustration={<BusScene size={180} />}
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

  const pickupName = child?.homeAddress
    ? child.homeAddress.split(",")[0]
    : "Pickup point";

  return (
    <Screen
      title="Live Tracking"
      right={<HeaderIconButton icon={RefreshCw} onPress={onRefresh} />}
      refreshing={refreshing}
      onRefresh={onRefresh}
    >
      {/* Light status banner */}
      <View style={styles.banner}>
        <VStack gap={4} flex={1}>
          <Text variant="h1" tone="primary">
            {meta.label}
          </Text>
          <Text variant="body-sm" tone="tertiary">
            {eta ||
              (frame ? "Van is on the move" : "Waiting for the van's GPS…")}
          </Text>
        </VStack>
        <BusScene size={94} />
      </View>

      {/* Driver row */}
      {child?.driverName ? (
        <Card style={{ marginTop: 12 }}>
          <HStack gap={12} align="center">
            <Avatar
              name={child.driverName}
              seed={child.driverId || myStop.studentId}
              size={44}
            />
            <VStack gap={2} flex={1}>
              <Text
                variant="label-lg"
                weight="700"
                tone="primary"
                numberOfLines={1}
              >
                {child.driverName}
              </Text>
              <Text variant="body-sm" tone="tertiary" numberOfLines={1}>
                {[child.vehicleNumber, child.routeName]
                  .filter(Boolean)
                  .join(" · ")}
              </Text>
            </VStack>
            {child.driverMobile ? (
              <Pressable
                onPress={() => Linking.openURL(`tel:${child.driverMobile}`)}
                style={styles.callBtn}
              >
                <Phone size={18} color={accent.main} strokeWidth={2.2} />
              </Pressable>
            ) : null}
          </HStack>
        </Card>
      ) : null}

      {/* Map with pickup callout */}
      <View style={styles.mapWrap}>
        <LiveMap markers={markers} center={center} height={300} />
        <View style={styles.callout} pointerEvents="none">
          <Text variant="caption" tone="tertiary">
            Pickup Point
          </Text>
          <Text variant="label" weight="700" tone="primary" numberOfLines={1}>
            {pickupName}
          </Text>
          {child?.pickupTime ? (
            <Text variant="caption" tone="tertiary">
              {child.pickupTime}
            </Text>
          ) : null}
        </View>
      </View>
      {frame ? (
        <HStack gap={8} align="center" style={{ marginTop: 10 }}>
          <Gauge size={14} color={palette.text.tertiary} strokeWidth={2} />
          <Text variant="caption" tone="tertiary">
            Moving at {Math.round(frame.speed || 0)} km/h · updated live
          </Text>
        </HStack>
      ) : null}

      {/* Journey Timeline • Live */}
      <HStack
        align="center"
        justify="space-between"
        style={{ marginTop: 22, marginBottom: 12 }}
      >
        <Text variant="h3" tone="primary">
          Journey Timeline
        </Text>
        {frame ? (
          <HStack gap={6} align="center">
            <View style={styles.liveDot} />
            <Text
              variant="label"
              weight="700"
              style={{ color: tints.green.fg }}
            >
              Live
            </Text>
          </HStack>
        ) : null}
      </HStack>
      <Card>
        <VerticalTimeline steps={steps} />
      </Card>

      {/* Emergency SOS */}
      <Pressable
        onPress={raiseSos}
        disabled={sos.isPending}
        style={[styles.sosBtn, sos.isPending && { opacity: 0.6 }]}
      >
        <ShieldAlert size={16} color={tints.red.icon} strokeWidth={2.2} />
        <Text variant="label" weight="600" style={{ color: tints.red.fg }}>
          {sos.isSuccess ? "SOS sent" : "Emergency SOS"}
        </Text>
      </Pressable>
    </Screen>
  );
}

/** Vertical journey timeline (dots + connecting rail) per the mockup. */
function VerticalTimeline({ steps }: { steps: TimelineStep[] }) {
  return (
    <View>
      {steps.map((s, i) => {
        const done = s.state === "done";
        const active = s.state === "active";
        const last = i === steps.length - 1;
        const on = done || active;
        return (
          <HStack key={s.key} gap={14} align="flex-start">
            <View style={{ alignItems: "center", width: 20 }}>
              <View
                style={[
                  styles.tlDot,
                  on
                    ? { backgroundColor: accent.main, borderColor: accent.main }
                    : {
                        backgroundColor: palette.surface.primary,
                        borderColor: palette.border.strong,
                      },
                ]}
              >
                {done ? (
                  <Check size={10} color="#FFFFFF" strokeWidth={3} />
                ) : null}
              </View>
              {!last ? (
                <View
                  style={{
                    width: 2,
                    flex: 1,
                    minHeight: 26,
                    marginVertical: 2,
                    backgroundColor: done
                      ? accent.main
                      : palette.border.default,
                  }}
                />
              ) : null}
            </View>
            <VStack gap={1} style={{ flex: 1, paddingBottom: last ? 0 : 20 }}>
              <Text
                variant="label-lg"
                weight={active ? "700" : "600"}
                tone={on ? "primary" : "tertiary"}
              >
                {s.label}
              </Text>
              <Text variant="body-sm" tone="tertiary">
                {s.time || "—"}
              </Text>
            </VStack>
          </HStack>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: accent.soft,
    borderRadius: radius.lg,
    paddingLeft: 18,
    paddingRight: 12,
    paddingVertical: 8,
  },
  callBtn: {
    width: 42,
    height: 42,
    borderRadius: radius.full,
    backgroundColor: accent.soft,
    alignItems: "center",
    justifyContent: "center",
  },
  mapWrap: {
    marginTop: 14,
    borderRadius: radius.lg,
    overflow: "hidden",
    position: "relative",
  },
  callout: {
    position: "absolute",
    top: 12,
    right: 12,
    backgroundColor: palette.surface.primary,
    borderRadius: radius.md,
    paddingHorizontal: 12,
    paddingVertical: 8,
    maxWidth: 180,
    shadowColor: "#101828",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: tints.green.icon,
  },
  tlDot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  sosBtn: {
    marginTop: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 13,
    borderRadius: radius.md,
    backgroundColor: tints.red.bg,
    borderWidth: 1,
    borderColor: tints.red.ring,
  },
});

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
