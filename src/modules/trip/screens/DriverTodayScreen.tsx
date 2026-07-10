import React, { useMemo, useState } from "react";
import { View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Bus, Route as RouteIcon, Play } from "lucide-react-native";
import { apiErrorMessage } from "@api/apiClient";
import { useAuthStore } from "@shared/store/useAuthStore";
import { palette } from "@shared/designSystem";
import {
  Screen,
  Text,
  VStack,
  HStack,
  Card,
  Button,
  Select,
  StatusChip,
  EmptyState,
} from "@shared/ui";
import type { SelectOption } from "@shared/ui";
import {
  useRoutes,
  useStartTrip,
  useTrips,
} from "@modules/trip/hooks/useTrips";
import { Trip, TripType } from "@modules/trip/types";
import {
  TRIP_STATUS_META,
  TRIP_TYPE_LABEL,
  todayISO,
} from "@modules/trip/utils";

export default function DriverTodayScreen() {
  const navigation = useNavigation<any>();
  const driverId = useAuthStore((s) => s.user?.driverId ?? null);
  const date = todayISO();

  const routesQuery = useRoutes();
  const tripsQuery = useTrips({ date });
  const startTrip = useStartTrip();

  const [routeId, setRouteId] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  // Routes assigned to this driver (fall back to all if none matched).
  const myRoutes = useMemo(() => {
    const all = routesQuery.data?.data ?? [];
    const mine = driverId ? all.filter((r) => r.driverId === driverId) : all;
    return mine.length ? mine : all;
  }, [routesQuery.data, driverId]);

  const routeOptions: SelectOption[] = myRoutes.map((r) => ({
    label: `${r.name} · ${r.studentCount} students`,
    value: r.id,
  }));

  const trips = tripsQuery.data?.data ?? [];
  const myTrips = driverId
    ? trips.filter((t) => t.driverId === driverId)
    : trips;

  const start = async (type: TripType) => {
    setError(null);
    if (!routeId) {
      setError("Select a route first.");
      return;
    }
    try {
      const trip = await startTrip.mutateAsync({ routeId, type });
      navigation.navigate("RunTrip", { tripId: trip.id });
    } catch (e) {
      setError(apiErrorMessage(e, "Could not start trip"));
    }
  };

  return (
    <Screen
      overline="Driver"
      title="Today"
      subtitle="Pick a route and start your run"
      refreshing={tripsQuery.isRefetching || tripsQuery.isLoading}
      onRefresh={() => {
        tripsQuery.refetch();
        routesQuery.refetch();
      }}
    >
      <Card elevation="raised">
        <VStack gap={14}>
          <HStack gap={8} align="center">
            <RouteIcon size={18} color={palette.teal[600]} strokeWidth={2} />
            <Text variant="h3" tone="primary">
              Start a route
            </Text>
          </HStack>

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

      <View style={{ height: 24 }} />

      <Text variant="h3" tone="primary" style={{ marginBottom: 12 }}>
        Today&apos;s trips
      </Text>

      {myTrips.length === 0 ? (
        <EmptyState
          icon={Bus}
          title="No trips yet"
          message="Start a pickup or drop route above to begin your day."
        />
      ) : (
        <VStack gap={12}>
          {myTrips.map((t) => (
            <DriverTripCard
              key={t.id}
              trip={t}
              onPress={() => navigation.navigate("RunTrip", { tripId: t.id })}
            />
          ))}
        </VStack>
      )}
    </Screen>
  );
}

function DriverTripCard({
  trip,
  onPress,
}: {
  trip: Trip;
  onPress: () => void;
}) {
  const meta = TRIP_STATUS_META[trip.status];
  const isActive = trip.status === "in_progress";
  return (
    <Card onPress={onPress} elevation="base">
      <HStack gap={12} align="center">
        <VStack gap={4} flex={1}>
          <Text variant="label-lg" tone="primary">
            {TRIP_TYPE_LABEL[trip.type]} trip
          </Text>
          <Text variant="body-sm" tone="tertiary">
            {trip.stops.length} stops
          </Text>
        </VStack>
        <StatusChip label={meta.label} tone={meta.tone} />
        {isActive ? (
          <Button
            label="Resume"
            size="sm"
            fullWidth={false}
            onPress={onPress}
          />
        ) : null}
      </HStack>
    </Card>
  );
}
