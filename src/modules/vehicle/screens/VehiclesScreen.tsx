import React, { useState } from "react";
import { View, TextInput, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import {
  Search,
  Plus,
  Bus,
  Armchair,
  ChevronRight,
  FileText,
} from "lucide-react-native";
import { useVehicles } from "@modules/vehicle/hooks/useVehicles";
import { Vehicle } from "@modules/vehicle/types";
import { useAuthStore } from "@shared/store/useAuthStore";
import { PERMISSIONS } from "@shared/permissions";
import { palette, radius, outline, tints } from "@shared/designSystem";
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

const SOON_MS = 30 * 86_400_000;

/** Soonest document expiry → an at-a-glance compliance chip. */
function docStatus(vehicle: Vehicle): {
  label: string;
  tone: "success" | "warning" | "danger";
  soonName?: string;
} {
  const docs = vehicle.documents ? Object.entries(vehicle.documents) : [];
  let soonest: { name: string; ms: number } | null = null;
  for (const [name, doc] of docs) {
    if (!doc?.expiryDate) continue;
    const ms = new Date(doc.expiryDate).getTime();
    if (!soonest || ms < soonest.ms) soonest = { name, ms };
  }
  if (!soonest) return { label: "Active", tone: "success" };
  const now = Date.now();
  if (soonest.ms < now)
    return { label: "Docs Expired", tone: "danger", soonName: soonest.name };
  if (soonest.ms < now + SOON_MS)
    return { label: "Expiring Soon", tone: "warning", soonName: soonest.name };
  return { label: "Active", tone: "success" };
}

function VehicleRow({
  vehicle,
  onPress,
}: {
  vehicle: Vehicle;
  onPress: () => void;
}) {
  const compliance = !vehicle.isActive
    ? { label: "Inactive", tone: "danger" as const, soonName: undefined }
    : docStatus(vehicle);
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
          <Text variant="body-sm" tone="tertiary">
            {vehicle.model || "No model"}
          </Text>
          <HStack gap={12} align="center">
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
            {compliance.soonName ? (
              <HStack gap={5} align="center">
                <FileText
                  size={13}
                  color={tints.amber.icon}
                  strokeWidth={1.9}
                />
                <Text
                  variant="body-sm"
                  style={{ color: tints.amber.fg }}
                  numberOfLines={1}
                >
                  {compliance.soonName}
                </Text>
              </HStack>
            ) : null}
          </HStack>
        </VStack>
        <StatusChip label={compliance.label} tone={compliance.tone} />
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
