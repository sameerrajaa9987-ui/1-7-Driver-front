import React, { useEffect, useMemo, useState } from "react";
import { View } from "react-native";
import { Bus, Gauge, Navigation2 } from "lucide-react-native";
import { emitSocket, onSocket } from "@shared/api/socket";
import LiveMap from "@shared/ui/MapView";
import type { MapMarker } from "@shared/ui/map.types";
import { useAuthStore } from "@shared/store/useAuthStore";
import { palette, tints, tripStatusMeta } from "@shared/designSystem";
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
  const t = tints[meta.tint];
  const steps = buildSteps(trip, myStop);

  return (
    <Screen
      overline="Live"
      title="Track ride"
      subtitle={`${TRIP_TYPE_LABEL[trip.type]} · ${myStop.studentName}`}
      refreshing={isRefetching || isLoading}
      onRefresh={refetch}
    >
      {/* Status-first hero — the one thing a parent wants to know. */}
      <Card style={{ backgroundColor: t.bg, borderColor: t.ring }}>
        <HStack justify="space-between" align="flex-start">
          <VStack gap={6} flex={1}>
            <Text variant="overline" style={{ color: t.fg, opacity: 0.8 }}>
              {myStop.studentName}
            </Text>
            <Text variant="h1" style={{ color: t.fg }}>
              {meta.label}
            </Text>
            {eta ? (
              <HStack gap={6} align="center">
                <Navigation2 size={14} color={t.fg} strokeWidth={2.2} />
                <Text variant="label" weight="600" style={{ color: t.fg }}>
                  {eta}
                </Text>
              </HStack>
            ) : (
              <Text variant="body-sm" style={{ color: t.fg, opacity: 0.85 }}>
                {frame ? "Van is on the move" : "Waiting for the van's GPS…"}
              </Text>
            )}
          </VStack>
          {frame ? <LiveBadge /> : null}
        </HStack>
      </Card>

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
