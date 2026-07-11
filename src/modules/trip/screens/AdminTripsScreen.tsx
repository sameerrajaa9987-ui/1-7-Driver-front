/**
 * AdminTripsScreen — operator "Trips" board (client mockup): an All / On the
 * way / Completed segmented control over today's trips, each card showing the
 * route, driver, a live progress bar and a status chip; tap to expand the
 * per-student stop timeline.
 */
import React, { useEffect, useMemo, useState } from "react";
import { View, Pressable, StyleSheet } from "react-native";
import { Bus, ChevronRight, MapPin } from "lucide-react-native";
import { useQueryClient } from "@tanstack/react-query";
import { onSocket } from "@shared/api/socket";
import { palette, radius, accent, tints } from "@shared/designSystem";
import {
  Screen,
  Text,
  VStack,
  HStack,
  Card,
  StatusChip,
  EmptyState,
} from "@shared/ui";
import { useTrips, useRoutes } from "@modules/trip/hooks/useTrips";
import { useDrivers } from "@modules/driver/hooks/useDrivers";
import { Trip, TripStop, TripUpdateEvent } from "@modules/trip/types";
import {
  STOP_STATUS_META,
  TRIP_STATUS_META,
  TRIP_TYPE_LABEL,
  isStopDone,
  todayISO,
} from "@modules/trip/utils";

type Tab = "all" | "active" | "completed";

export default function AdminTripsScreen() {
  const qc = useQueryClient();
  const date = todayISO();
  const { data, isLoading, refetch, isRefetching } = useTrips({ date });
  const routesQuery = useRoutes();
  const driversQuery = useDrivers();
  const trips = data?.data ?? [];
  const [tab, setTab] = useState<Tab>("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Live-refresh the board on any trip:update.
  useEffect(() => {
    const unsub = onSocket<TripUpdateEvent>("trip:update", () => {
      qc.invalidateQueries({ queryKey: ["trips"] });
    });
    return unsub;
  }, [qc]);

  const routesById = useMemo(() => {
    const m = new Map<string, { name: string; driverId: string | null }>();
    for (const r of routesQuery.data?.data ?? [])
      m.set(r.id, { name: r.name, driverId: r.driverId });
    return m;
  }, [routesQuery.data]);

  const driversById = useMemo(() => {
    const m = new Map<string, string>();
    for (const d of driversQuery.data?.data ?? []) m.set(d.id, d.fullName);
    return m;
  }, [driversQuery.data]);

  const counts = useMemo(
    () => ({
      all: trips.length,
      active: trips.filter((t) => t.status === "in_progress").length,
      completed: trips.filter((t) => t.status === "completed").length,
    }),
    [trips],
  );

  const filtered = useMemo(() => {
    if (tab === "active")
      return trips.filter((t) => t.status === "in_progress");
    if (tab === "completed")
      return trips.filter((t) => t.status === "completed");
    return trips;
  }, [trips, tab]);

  const TABS: { key: Tab; label: string }[] = [
    { key: "all", label: "All Trips" },
    { key: "active", label: "On the way" },
    { key: "completed", label: "Completed" },
  ];

  return (
    <Screen
      title="Trips"
      refreshing={isRefetching || isLoading}
      onRefresh={refetch}
    >
      {/* Segmented control */}
      <HStack gap={8}>
        {TABS.map((t) => {
          const active = tab === t.key;
          return (
            <Pressable
              key={t.key}
              onPress={() => setTab(t.key)}
              style={[styles.seg, active && styles.segOn]}
            >
              <Text
                variant="label"
                weight="700"
                style={{ color: active ? "#FFFFFF" : palette.text.secondary }}
              >
                {t.label}
              </Text>
              {t.key !== "all" ? (
                <View style={[styles.segCount, active && styles.segCountOn]}>
                  <Text
                    variant="caption"
                    weight="700"
                    style={{
                      color: active ? "#FFFFFF" : palette.text.tertiary,
                    }}
                  >
                    {counts[t.key]}
                  </Text>
                </View>
              ) : null}
            </Pressable>
          );
        })}
      </HStack>

      {filtered.length === 0 ? (
        <EmptyState
          icon={Bus}
          title={isLoading ? "Loading…" : "No trips here"}
          message="Trips appear as drivers start their pickup and drop routes."
        />
      ) : (
        <VStack gap={12} style={{ marginTop: 16 }}>
          {filtered.map((t) => {
            const route = t.routeId ? routesById.get(t.routeId) : undefined;
            const driverName = route?.driverId
              ? driversById.get(route.driverId)
              : undefined;
            return (
              <TripBoardCard
                key={t.id}
                trip={t}
                routeName={route?.name}
                driverName={driverName}
                expanded={expandedId === t.id}
                onPress={() =>
                  setExpandedId((cur) => (cur === t.id ? null : t.id))
                }
              />
            );
          })}
        </VStack>
      )}
    </Screen>
  );
}

function TripBoardCard({
  trip,
  routeName,
  driverName,
  expanded,
  onPress,
}: {
  trip: Trip;
  routeName?: string;
  driverName?: string;
  expanded: boolean;
  onPress: () => void;
}) {
  const meta = TRIP_STATUS_META[trip.status];
  const done = trip.stops.filter((s) => isStopDone(s.status)).length;
  const total = trip.stops.length;
  const pct = total ? Math.round((done / total) * 100) : 0;

  return (
    <Card onPress={onPress} elevation="base">
      <HStack gap={12} align="center">
        <View style={styles.busTile}>
          <Bus size={20} color={accent.main} strokeWidth={2} />
        </View>
        <VStack gap={2} flex={1}>
          <Text
            variant="label-lg"
            weight="700"
            tone="primary"
            numberOfLines={1}
          >
            {routeName || `${TRIP_TYPE_LABEL[trip.type]} trip`}
          </Text>
          <Text variant="body-sm" tone="tertiary" numberOfLines={1}>
            {driverName || "Unassigned"}
          </Text>
        </VStack>
        <VStack gap={4} align="flex-end">
          <Text variant="label" weight="700" tone="primary">
            {done}/{total}
          </Text>
          <StatusChip label={meta.label} tone={meta.tone} />
        </VStack>
      </HStack>

      {/* Progress bar */}
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${pct}%` }]} />
      </View>

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
      ) : (
        <HStack justify="flex-end" style={{ marginTop: 8 }}>
          <HStack gap={2} align="center">
            <Text variant="caption" tone="tertiary">
              {expanded ? "Hide" : "View stops"}
            </Text>
            <ChevronRight
              size={14}
              color={palette.text.tertiary}
              strokeWidth={2}
            />
          </HStack>
        </HStack>
      )}
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

const styles = StyleSheet.create({
  seg: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 9,
    paddingHorizontal: 12,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: palette.border.default,
    backgroundColor: palette.surface.primary,
  },
  segOn: { backgroundColor: accent.main, borderColor: accent.main },
  segCount: {
    minWidth: 20,
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: radius.full,
    backgroundColor: palette.surface.secondary,
    alignItems: "center",
  },
  segCountOn: { backgroundColor: "rgba(255,255,255,0.22)" },
  busTile: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: accent.soft,
    alignItems: "center",
    justifyContent: "center",
  },
  track: {
    height: 7,
    borderRadius: 4,
    backgroundColor: tints.violet.bg,
    marginTop: 14,
    overflow: "hidden",
  },
  fill: { height: 7, borderRadius: 4, backgroundColor: accent.main },
});
