import React, { useMemo, useState } from "react";
import { View, TextInput, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import {
  Search,
  Plus,
  Route as RouteIcon,
  Users,
  UserCog,
  ChevronRight,
} from "lucide-react-native";
import { useRoutes } from "@modules/route/hooks/useRoutes";
import { useDrivers } from "@modules/driver/hooks/useDrivers";
import { Route } from "@modules/route/types";
import { useAuthStore } from "@shared/store/useAuthStore";
import { PERMISSIONS } from "@shared/permissions";
import { palette, radius, outline } from "@shared/designSystem";
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

export default function RoutesScreen() {
  const navigation = useNavigation<any>();
  const hasPermission = useAuthStore((s) => s.hasPermission);
  const canWrite = hasPermission(PERMISSIONS.ROUTES_MANAGE);
  const [search, setSearch] = useState("");
  const { data, isLoading, refetch, isRefetching } = useRoutes(
    search.trim() ? { search: search.trim() } : undefined,
  );
  const driversQuery = useDrivers();
  const driversById = useMemo(() => {
    const m = new Map<string, string>();
    for (const d of driversQuery.data?.data ?? []) m.set(d.id, d.fullName);
    return m;
  }, [driversQuery.data]);
  const routes = data?.data ?? [];

  return (
    <Screen
      overline="Operations"
      title="Routes"
      subtitle={`${data?.meta?.total ?? 0} routes`}
      refreshing={isRefetching || isLoading}
      onRefresh={refetch}
      right={
        canWrite ? (
          <Button
            label="Add route"
            size="sm"
            fullWidth={false}
            icon={<Plus size={18} color="#FFFFFF" strokeWidth={2.2} />}
            onPress={() => navigation.navigate("RouteForm")}
          />
        ) : undefined
      }
    >
      <View style={styles.searchWrap}>
        <Search size={18} color={palette.text.tertiary} strokeWidth={1.8} />
        <TextInput
          placeholder="Search routes"
          placeholderTextColor={palette.text.tertiary}
          value={search}
          onChangeText={setSearch}
          style={styles.searchInput}
        />
      </View>

      {routes.length === 0 ? (
        <EmptyState
          icon={RouteIcon}
          title={isLoading ? "Loading…" : "No routes yet"}
          message="Create routes to group students with a driver and vehicle."
        />
      ) : (
        <VStack gap={12} style={{ marginTop: 16 }}>
          {routes.map((r) => (
            <RouteRow
              key={r.id}
              route={r}
              driverName={r.driverId ? driversById.get(r.driverId) : undefined}
              onPress={() => navigation.navigate("RouteForm", { id: r.id })}
            />
          ))}
        </VStack>
      )}
    </Screen>
  );
}

function RouteRow({
  route,
  driverName,
  onPress,
}: {
  route: Route;
  driverName?: string;
  onPress: () => void;
}) {
  return (
    <Card onPress={onPress} elevation="base">
      <HStack gap={14} align="center">
        <View style={styles.iconWrap}>
          <RouteIcon size={22} color={palette.teal[600]} strokeWidth={1.8} />
        </View>
        <VStack gap={4} flex={1}>
          <Text variant="label-lg" tone="primary" numberOfLines={1}>
            {route.name}
          </Text>
          <HStack gap={5} align="center">
            <UserCog
              size={13}
              color={palette.text.tertiary}
              strokeWidth={1.9}
            />
            <Text variant="body-sm" tone="tertiary" numberOfLines={1}>
              {driverName || "No driver assigned"}
            </Text>
          </HStack>
          <HStack gap={5} align="center">
            <Users size={13} color={palette.text.tertiary} strokeWidth={1.9} />
            <Text variant="body-sm" tone="tertiary">
              {route.studentCount} student{route.studentCount === 1 ? "" : "s"}
            </Text>
          </HStack>
        </VStack>
        <StatusChip
          label={route.isActive ? "Active" : "Inactive"}
          tone={route.isActive ? "success" : "danger"}
        />
        <ChevronRight size={18} color={palette.text.tertiary} strokeWidth={2} />
      </HStack>
    </Card>
  );
}

const styles = StyleSheet.create({
  searchWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 16,
    height: 48,
    borderRadius: radius.md,
    borderWidth: outline.width,
    borderColor: outline.color,
    backgroundColor: palette.surface.primary,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: palette.text.primary,
    paddingVertical: 0,
  },
  iconWrap: {
    width: 46,
    height: 46,
    borderRadius: radius.full,
    backgroundColor: palette.teal[50],
    alignItems: "center",
    justifyContent: "center",
  },
});
