import React, { useEffect, useMemo, useState } from "react";
import { View } from "react-native";
import { Bus, Navigation } from "lucide-react-native";
import { onSocket } from "@shared/api/socket";
import LiveMap from "@shared/ui/MapView";
import type { MapMarker } from "@shared/ui/map.types";
import { palette } from "@shared/designSystem";
import {
  Screen,
  Text,
  VStack,
  HStack,
  Card,
  StatusChip,
  EmptyState,
} from "@shared/ui";
import { useTrips } from "@modules/trip/hooks/useTrips";
import { Trip } from "@modules/trip/types";
import { TRIP_TYPE_LABEL, DEMO_COORD, todayISO } from "@modules/trip/utils";

interface VehicleFrame {
  tripId: string;
  driverId: string | null;
  vehicleId: string | null;
  lat: number;
  lng: number;
  speed: number;
  heading: number;
  at: string;
}

export default function TrackingScreen() {
  const date = todayISO();
  const { data, isLoading, refetch, isRefetching } = useTrips({
    date,
    status: "in_progress",
  });
  const trips = useMemo(() => data?.data ?? [], [data]);

  // Live vehicle positions keyed by tripId.
  const [positions, setPositions] = useState<Record<string, VehicleFrame>>({});

  useEffect(() => {
    const unsub = onSocket<VehicleFrame>("vehicle:position", (frame) => {
      if (!frame?.tripId) return;
      setPositions((cur) => ({ ...cur, [frame.tripId]: frame }));
    });
    return unsub;
  }, []);

  // Drop stale positions for trips that are no longer active.
  useEffect(() => {
    const activeIds = new Set(trips.map((t) => t.id));
    setPositions((cur) => {
      const next: Record<string, VehicleFrame> = {};
      for (const [id, frame] of Object.entries(cur)) {
        if (activeIds.has(id)) next[id] = frame;
      }
      return next;
    });
  }, [trips]);

  const markers: MapMarker[] = useMemo(
    () =>
      Object.values(positions).map((p) => ({
        id: p.tripId,
        lat: p.lat,
        lng: p.lng,
        label: "Vehicle",
        kind: "vehicle" as const,
      })),
    [positions],
  );

  const center = markers.length
    ? { lat: markers[0].lat, lng: markers[0].lng }
    : DEMO_COORD;

  return (
    <Screen
      overline="Live"
      title="Fleet tracking"
      subtitle={`${trips.length} active trips · ${markers.length} vehicles reporting`}
      refreshing={isRefetching || isLoading}
      onRefresh={refetch}
    >
      <LiveMap markers={markers} center={center} height={300} />

      <Text
        variant="h3"
        tone="primary"
        style={{ marginTop: 20, marginBottom: 12 }}
      >
        Active trips
      </Text>

      {trips.length === 0 ? (
        <EmptyState
          icon={Bus}
          title={isLoading ? "Loading…" : "No active trips"}
          message="Live vehicle positions appear here while drivers are on their routes."
        />
      ) : (
        <VStack gap={12}>
          {trips.map((t) => (
            <ActiveTripRow key={t.id} trip={t} frame={positions[t.id]} />
          ))}
        </VStack>
      )}
    </Screen>
  );
}

function ActiveTripRow({ trip, frame }: { trip: Trip; frame?: VehicleFrame }) {
  const reporting = !!frame;
  return (
    <Card elevation="base">
      <HStack gap={12} align="center">
        <View
          style={{
            width: 40,
            height: 40,
            borderRadius: 12,
            backgroundColor: palette.cobalt[50],
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Navigation size={18} color={palette.cobalt[600]} strokeWidth={2} />
        </View>
        <VStack gap={4} flex={1}>
          <Text variant="label-lg" tone="primary">
            {TRIP_TYPE_LABEL[trip.type]} trip
          </Text>
          <Text variant="body-sm" tone="tertiary">
            {reporting
              ? `${Math.round(frame!.speed)} km/h · updated live`
              : "Awaiting GPS…"}
          </Text>
        </VStack>
        <StatusChip
          label={reporting ? "Live" : "Waiting"}
          tone={reporting ? "success" : "neutral"}
        />
      </HStack>
    </Card>
  );
}
