import React, { useState } from "react";
import { View, TextInput, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Search, Plus, Bus, Armchair, ChevronRight } from "lucide-react-native";
import { useVehicles } from "@modules/vehicle/hooks/useVehicles";
import { Vehicle } from "@modules/vehicle/types";
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

export default function VehiclesScreen() {
  const navigation = useNavigation<any>();
  const hasPermission = useAuthStore((s) => s.hasPermission);
  const canWrite = hasPermission(PERMISSIONS.VEHICLES_MANAGE);
  const [search, setSearch] = useState("");
  const { data, isLoading, refetch, isRefetching } = useVehicles(
    search.trim() ? { search: search.trim() } : undefined,
  );
  const vehicles = data?.data ?? [];

  return (
    <Screen
      overline="Fleet"
      title="Vehicles"
      subtitle={`${data?.meta?.total ?? 0} vehicles`}
      refreshing={isRefetching || isLoading}
      onRefresh={refetch}
      right={
        canWrite ? (
          <Button
            label="Add vehicle"
            size="sm"
            fullWidth={false}
            icon={<Plus size={18} color="#FFFFFF" strokeWidth={2.2} />}
            onPress={() => navigation.navigate("VehicleForm")}
          />
        ) : undefined
      }
    >
      <View style={styles.searchWrap}>
        <Search size={18} color={palette.text.tertiary} strokeWidth={1.8} />
        <TextInput
          placeholder="Search by number or model"
          placeholderTextColor={palette.text.tertiary}
          value={search}
          onChangeText={setSearch}
          style={styles.searchInput}
          autoCapitalize="characters"
        />
      </View>

      {vehicles.length === 0 ? (
        <EmptyState
          icon={Bus}
          title={isLoading ? "Loading…" : "No vehicles yet"}
          message="Add vehicles to assign drivers and routes."
        />
      ) : (
        <VStack gap={12} style={{ marginTop: 16 }}>
          {vehicles.map((v) => (
            <VehicleRow
              key={v.id}
              vehicle={v}
              onPress={() => navigation.navigate("VehicleForm", { id: v.id })}
            />
          ))}
        </VStack>
      )}
    </Screen>
  );
}

function VehicleRow({
  vehicle,
  onPress,
}: {
  vehicle: Vehicle;
  onPress: () => void;
}) {
  return (
    <Card onPress={onPress} elevation="base">
      <HStack gap={14} align="center">
        <View style={styles.iconWrap}>
          <Bus size={22} color={palette.teal[600]} strokeWidth={1.8} />
        </View>
        <VStack gap={4} flex={1}>
          <Text variant="label-lg" tone="primary" numberOfLines={1}>
            {vehicle.vehicleNumber}
          </Text>
          <HStack gap={6} align="center">
            {vehicle.model ? (
              <Text variant="body-sm" tone="tertiary">
                {vehicle.model}
              </Text>
            ) : (
              <Text variant="body-sm" tone="tertiary">
                No model
              </Text>
            )}
          </HStack>
          {vehicle.seatingCapacity ? (
            <HStack gap={5} align="center">
              <Armchair
                size={13}
                color={palette.text.tertiary}
                strokeWidth={1.9}
              />
              <Text variant="body-sm" tone="tertiary">
                {vehicle.seatingCapacity} seats
              </Text>
            </HStack>
          ) : null}
        </VStack>
        {!vehicle.isActive ? (
          <StatusChip label="Inactive" tone="danger" />
        ) : null}
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
