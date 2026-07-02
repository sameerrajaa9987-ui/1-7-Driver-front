import React, { useEffect, useMemo, useState } from "react";
import { View } from "react-native";
import { Bus, ChevronRight, MapPin } from "lucide-react-native";
import { useQueryClient } from "@tanstack/react-query";
import { onSocket } from "@shared/api/socket";
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
import { Trip, TripStop, TripUpdateEvent } from "@modules/trip/types";
import {
  STOP_STATUS_META,
  TRIP_STATUS_META,
  TRIP_TYPE_LABEL,
  isStopDone,
  todayISO,
} from "@modules/trip/utils";

export default function AdminTripsScreen() {
  const qc = useQueryClient();
  const date = todayISO();
  const { data, isLoading, refetch, isRefetching } = useTrips({ date });
  const trips = data?.data ?? [];
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Live-refresh the board on any trip:update.
  useEffect(() => {
    const unsub = onSocket<TripUpdateEvent>("trip:update", () => {
      qc.invalidateQueries({ queryKey: ["trips"] });
    });
    return unsub;
  }, [qc]);

  const active = useMemo(
    () => trips.filter((t) => t.status === "in_progress").length,
    [trips],
  );

  return (
    <Screen
      overline="Operations"
      title="Today's trips"
      subtitle={`${trips.length} trips · ${active} in progress`}
      refreshing={isRefetching || isLoading}
      onRefresh={refetch}
    >
      {trips.length === 0 ? (
        <EmptyState
          icon={Bus}
          title={isLoading ? "Loading…" : "No trips today"}
          message="Trips appear here as drivers start their pickup and drop routes."
        />
      ) : (
        <VStack gap={12} style={{ marginTop: 4 }}>
          {trips.map((t) => (
            <TripBoardCard
              key={t.id}
              trip={t}
              expanded={expandedId === t.id}
              onPress={() =>
                setExpandedId((cur) => (cur === t.id ? null : t.id))
              }
            />
          ))}
        </VStack>
      )}
    </Screen>
  );
}

function TripBoardCard({
  trip,
  expanded,
  onPress,
}: {
  trip: Trip;
  expanded: boolean;
  onPress: () => void;
}) {
  const meta = TRIP_STATUS_META[trip.status];
  const done = trip.stops.filter((s) => isStopDone(s.status)).length;
  const total = trip.stops.length;

  return (
    <Card onPress={onPress} elevation="base">
      <HStack gap={12} align="center">
        <View
          style={{
            width: 40,
            height: 40,
            borderRadius: 12,
            backgroundColor: palette.teal[50],
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Bus size={20} color={palette.teal[600]} strokeWidth={2} />
        </View>
        <VStack gap={4} flex={1}>
          <Text variant="label-lg" tone="primary">
            {TRIP_TYPE_LABEL[trip.type]} trip
          </Text>
          <Text variant="body-sm" tone="tertiary">
            {done}/{total} stops done
          </Text>
        </VStack>
        <StatusChip label={meta.label} tone={meta.tone} />
        <ChevronRight size={18} color={palette.text.tertiary} strokeWidth={2} />
      </HStack>

      {expanded ? (
        <VStack gap={10} style={{ marginTop: 14 }}>
          {trip.stops.length === 0 ? (
            <Text variant="body-sm" tone="tertiary">
              No stops on this trip.
            </Text>
          ) : (
            trip.stops
              .slice()
              .sort((a, b) => a.order - b.order)
              .map((s) => <StopTimelineRow key={s.studentId} stop={s} />)
          )}
        </VStack>
      ) : null}
    </Card>
  );
}

function StopTimelineRow({ stop }: { stop: TripStop }) {
  const meta = STOP_STATUS_META[stop.status];
  return (
    <HStack gap={10} align="center">
      <MapPin size={15} color={palette.text.tertiary} strokeWidth={1.9} />
      <Text
        variant="body-sm"
        tone="secondary"
        numberOfLines={1}
        style={{ flex: 1 }}
      >
        {stop.order}. {stop.studentName || "Student"}
      </Text>
      <StatusChip label={meta.label} tone={meta.tone} />
    </HStack>
  );
}
