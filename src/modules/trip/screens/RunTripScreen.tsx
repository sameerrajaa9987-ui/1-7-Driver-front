import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Linking, Pressable, View } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import {
  CheckCircle2,
  Flag,
  MapPin,
  Phone,
  School,
  Timer,
  UserX,
} from "lucide-react-native";
import { apiClient, apiErrorMessage } from "@api/apiClient";
import { onSocket } from "@shared/api/socket";
import LiveMap from "@shared/ui/MapView";
import type { MapMarker } from "@shared/ui/map.types";
import { palette, radius, tints } from "@shared/designSystem";
import { useSettings } from "@modules/settings/hooks/useSettings";
import {
  Screen,
  Text,
  VStack,
  HStack,
  Card,
  Button,
  StatusChip,
  EmptyState,
} from "@shared/ui";
import {
  useArriveStop,
  useCompleteTrip,
  useDropStop,
  useNoShowStop,
  usePickupStop,
  useReachSchool,
  useStudents,
  useTrip,
} from "@modules/trip/hooks/useTrips";
import { Trip, TripStop, TripUpdateEvent } from "@modules/trip/types";
import {
  DEMO_COORD,
  STOP_STATUS_META,
  getCurrentCoord,
  isStopDone,
} from "@modules/trip/utils";

const PING_INTERVAL_MS = 5000;

export default function RunTripScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const tripId: string = route.params?.tripId;

  const { data: trip, isLoading, refetch } = useTrip(tripId);
  const students = useStudents(
    trip?.routeId ? { routeId: trip.routeId } : undefined,
  );

  const [error, setError] = useState<string | null>(null);

  // Refetch on live trip:update for this trip (e.g. geofence auto-arrive).
  useEffect(() => {
    const unsub = onSocket<TripUpdateEvent>("trip:update", (payload) => {
      if (payload?.id === tripId) refetch();
    });
    return unsub;
  }, [tripId, refetch]);

  // Periodically push the driver's GPS so admins/parents see live movement.
  useEffect(() => {
    if (!tripId || trip?.status !== "in_progress") return;
    let cancelled = false;

    const ping = async () => {
      try {
        const coord = await getCurrentCoord();
        if (cancelled) return;
        await apiClient.post("/tracking/ingest", {
          tripId,
          lat: coord.lat,
          lng: coord.lng,
        });
      } catch {
        // Non-fatal — keep the run going even if a frame fails.
      }
    };

    ping();
    const timer = setInterval(ping, PING_INTERVAL_MS);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [tripId, trip?.status]);

  // Pickup-point markers for the map.
  const markers: MapMarker[] = useMemo(() => {
    const list = students.data?.data ?? [];
    return list
      .filter((s) => s.pickupPoint && typeof s.pickupPoint.lat === "number")
      .map((s) => ({
        id: s.id,
        lat: s.pickupPoint!.lat,
        lng: s.pickupPoint!.lng,
        label: s.name,
        kind: "student" as const,
      }));
  }, [students.data]);

  const mapCenter = markers.length
    ? { lat: markers[0].lat, lng: markers[0].lng }
    : DEMO_COORD;

  if (!trip) {
    return (
      <Screen overline="Driver" title="Run trip">
        <EmptyState
          icon={MapPin}
          title={isLoading ? "Loading trip…" : "Trip not found"}
          message="This trip may have been completed or removed."
        />
      </Screen>
    );
  }

  const isPickup = trip.type === "pickup";
  const sorted = trip.stops.slice().sort((a, b) => a.order - b.order);
  // Parent contact per student — powers the per-stop "Call parent" action.
  const phoneByStudent = new Map(
    (students.data?.data ?? []).map((s) => [s.id, s.mobile || ""]),
  );
  const allDone =
    sorted.length > 0 && sorted.every((s) => isStopDone(s.status));
  const isDone = trip.status === "completed";

  return (
    <Screen
      overline={isPickup ? "Pickup run" : "Drop run"}
      title="Run trip"
      subtitle={`${sorted.filter((s) => isStopDone(s.status)).length}/${sorted.length} stops done`}
      refreshing={isLoading}
      onRefresh={refetch}
    >
      <LiveMap markers={markers} center={mapCenter} height={220} />

      {/* Route progress — the driver's "how far along am I" at a glance. */}
      {sorted.length > 0 ? (
        <View style={{ marginTop: 14 }}>
          <View
            style={{
              height: 8,
              borderRadius: 4,
              backgroundColor: palette.ink[100],
              overflow: "hidden",
            }}
          >
            <View
              style={{
                width: `${Math.round(
                  (sorted.filter((s) => isStopDone(s.status)).length /
                    sorted.length) *
                    100,
                )}%`,
                height: "100%",
                borderRadius: 4,
                backgroundColor: palette.brand[500],
              }}
            />
          </View>
        </View>
      ) : null}

      {error ? (
        <Text variant="body-sm" tone="danger" style={{ marginTop: 12 }}>
          {error}
        </Text>
      ) : null}

      <VStack gap={12} style={{ marginTop: 16 }}>
        {sorted.length === 0 ? (
          <EmptyState
            icon={MapPin}
            title="No stops"
            message="This trip has no student stops."
          />
        ) : (
          sorted.map((s) => (
            <StopCard
              key={s.studentId}
              trip={trip}
              stop={s}
              isPickup={isPickup}
              parentMobile={phoneByStudent.get(s.studentId) || ""}
              onError={setError}
            />
          ))
        )}
      </VStack>

      {!isDone ? (
        <View style={{ marginTop: 20 }}>
          <FinishButton
            trip={trip}
            isPickup={isPickup}
            allDone={allDone}
            onError={setError}
            onDone={() => navigation.goBack()}
          />
        </View>
      ) : (
        <View style={{ marginTop: 20 }}>
          <StatusChip label="Trip completed" tone="success" />
        </View>
      )}
    </Screen>
  );
}

function StopCard({
  trip,
  stop,
  isPickup,
  parentMobile,
  onError,
}: {
  trip: Trip;
  stop: TripStop;
  isPickup: boolean;
  parentMobile: string;
  onError: (msg: string | null) => void;
}) {
  const arrive = useArriveStop(trip.id);
  const pickup = usePickupStop(trip.id);
  const noShow = useNoShowStop(trip.id);
  const drop = useDropStop(trip.id);
  const meta = STOP_STATUS_META[stop.status];
  const done = isStopDone(stop.status);

  const run = useCallback(
    async (fn: (gps: { lat: number; lng: number }) => Promise<unknown>) => {
      onError(null);
      try {
        const gps = await getCurrentCoord();
        await fn(gps);
      } catch (e) {
        onError(apiErrorMessage(e, "Action failed"));
      }
    },
    [onError],
  );

  const busy =
    arrive.isPending || pickup.isPending || noShow.isPending || drop.isPending;

  return (
    <Card elevation="base">
      <HStack gap={12} align="center">
        <View
          style={{
            width: 34,
            height: 34,
            borderRadius: 10,
            backgroundColor: palette.teal[50],
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text variant="label" tone="accent">
            {stop.order}
          </Text>
        </View>
        <VStack gap={3} flex={1}>
          <Text variant="label-lg" tone="primary" numberOfLines={1}>
            {stop.studentName || "Student"}
          </Text>
          {stop.status === "arrived" && !done ? (
            <WaitingTimer arrivedAt={stop.arrivedAt} />
          ) : null}
        </VStack>
        {parentMobile ? (
          <Pressable
            onPress={() => Linking.openURL(`tel:${parentMobile}`)}
            hitSlop={8}
            style={{
              width: 36,
              height: 36,
              borderRadius: radius.full,
              backgroundColor: tints.green.bg,
              borderWidth: 1,
              borderColor: tints.green.ring,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Phone size={16} color={tints.green.icon} strokeWidth={2.2} />
          </Pressable>
        ) : null}
        <StatusChip label={meta.label} tone={meta.tone} />
      </HStack>

      {!done ? (
        <HStack gap={8} style={{ marginTop: 14 }} wrap>
          {stop.status === "pending" ? (
            <View style={{ flex: 1, minWidth: 120 }}>
              <Button
                label="Arrived"
                variant="secondary"
                size="sm"
                loading={arrive.isPending}
                disabled={busy}
                icon={
                  <MapPin
                    size={15}
                    color={palette.text.primary}
                    strokeWidth={2}
                  />
                }
                onPress={() =>
                  run((gps) =>
                    arrive.mutateAsync({ studentId: stop.studentId, gps }),
                  )
                }
              />
            </View>
          ) : null}

          {isPickup ? (
            <>
              <View style={{ flex: 1, minWidth: 120 }}>
                <Button
                  label="Picked up"
                  size="sm"
                  loading={pickup.isPending}
                  disabled={busy}
                  icon={
                    <CheckCircle2 size={15} color="#FFFFFF" strokeWidth={2.2} />
                  }
                  onPress={() =>
                    run((gps) =>
                      pickup.mutateAsync({ studentId: stop.studentId, gps }),
                    )
                  }
                />
              </View>
              <View style={{ flex: 1, minWidth: 120 }}>
                <Button
                  label="No show"
                  variant="destructive"
                  size="sm"
                  loading={noShow.isPending}
                  disabled={busy}
                  icon={<UserX size={15} color="#FFFFFF" strokeWidth={2.2} />}
                  onPress={() =>
                    run((gps) =>
                      noShow.mutateAsync({ studentId: stop.studentId, gps }),
                    )
                  }
                />
              </View>
            </>
          ) : (
            <View style={{ flex: 1, minWidth: 120 }}>
              <Button
                label="Dropped"
                size="sm"
                loading={drop.isPending}
                disabled={busy}
                icon={
                  <CheckCircle2 size={15} color="#FFFFFF" strokeWidth={2.2} />
                }
                onPress={() =>
                  run((gps) =>
                    drop.mutateAsync({ studentId: stop.studentId, gps }),
                  )
                }
              />
            </View>
          )}
        </HStack>
      ) : null}
    </Card>
  );
}

/**
 * WaitingTimer — the spec §7 waiting window. Counts down from the org's
 * configured waiting minutes after the van arrives; turns red when time is up
 * so the driver knows a No-show is now fair.
 */
function WaitingTimer({ arrivedAt }: { arrivedAt: string | null }) {
  const settings = useSettings();
  const minutes = settings.data?.waitingTimerMinutes ?? 5;
  const [now, setNow] = useState(0);

  useEffect(() => {
    setNow(Date.now());
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  if (!arrivedAt || now === 0) return null;
  const deadline = new Date(arrivedAt).getTime() + minutes * 60_000;
  const remaining = Math.max(0, deadline - now);
  const expired = remaining === 0;
  const mm = Math.floor(remaining / 60_000);
  const ss = Math.floor((remaining % 60_000) / 1000);

  return (
    <HStack gap={5} align="center">
      <Timer
        size={13}
        color={expired ? tints.red.icon : tints.amber.icon}
        strokeWidth={2.2}
      />
      <Text
        variant="caption"
        weight="600"
        style={{ color: expired ? tints.red.fg : tints.amber.fg }}
      >
        {expired
          ? "Waiting time over"
          : `Waiting ${mm}:${String(ss).padStart(2, "0")}`}
      </Text>
    </HStack>
  );
}

function FinishButton({
  trip,
  isPickup,
  allDone,
  onError,
  onDone,
}: {
  trip: Trip;
  isPickup: boolean;
  allDone: boolean;
  onError: (msg: string | null) => void;
  onDone: () => void;
}) {
  const reachSchool = useReachSchool(trip.id);
  const complete = useCompleteTrip(trip.id);

  const finish = async () => {
    onError(null);
    try {
      if (isPickup) await reachSchool.mutateAsync();
      else await complete.mutateAsync();
      onDone();
    } catch (e) {
      onError(apiErrorMessage(e, "Could not finish trip"));
    }
  };

  return (
    <Button
      label={isPickup ? "Reached school" : "Complete trip"}
      variant={isPickup ? "accent" : "primary"}
      loading={reachSchool.isPending || complete.isPending}
      disabled={!allDone}
      icon={
        isPickup ? (
          <School size={17} color={palette.ink[900]} strokeWidth={2.2} />
        ) : (
          <Flag size={17} color="#FFFFFF" strokeWidth={2.2} />
        )
      }
      onPress={finish}
    />
  );
}
