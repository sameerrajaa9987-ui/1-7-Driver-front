import React, { useState } from "react";
import { View, Pressable, Platform, Alert, StyleSheet } from "react-native";
import {
  Fuel,
  Wrench,
  Trash2,
  Gauge,
  CalendarClock,
  Plus,
} from "lucide-react-native";
import {
  useMaintenance,
  useMaintenanceSummary,
  useAddMaintenance,
  useDeleteMaintenance,
} from "@modules/maintenance/hooks/useMaintenance";
import { MaintenanceRecord } from "@modules/maintenance/types";
import { useVehicles } from "@modules/vehicle/hooks/useVehicles";
import { apiErrorMessage } from "@api/apiClient";
import { palette, radius, tints } from "@shared/designSystem";
import {
  Screen,
  Text,
  VStack,
  HStack,
  Card,
  Button,
  TextField,
  Select,
  TintTile,
  StatusChip,
  EmptyState,
} from "@shared/ui";

function confirm(msg: string, onYes: () => void) {
  if (Platform.OS === "web") {
     
    if (window.confirm(msg)) onYes();
  } else {
    Alert.alert("Please confirm", msg, [
      { text: "Cancel", style: "cancel" },
      { text: "Remove", style: "destructive", onPress: onYes },
    ]);
  }
}

const money = (n: number) => `₹${(n ?? 0).toLocaleString("en-IN")}`;

export default function MaintenanceScreen() {
  const [vehicleId, setVehicleId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  const { data: vehicleData } = useVehicles();
  const vehicles = vehicleData?.data ?? [];
  const vehicleOptions = vehicles.map((v) => ({
    value: v.id,
    label: v.vehicleNumber + (v.model ? ` · ${v.model}` : ""),
  }));

  const listParams = vehicleId ? { vehicleId } : undefined;
  const { data, isLoading, refetch, isRefetching } = useMaintenance(listParams);
  const { data: summary } = useMaintenanceSummary(vehicleId ?? undefined);
  const records = data?.data ?? [];

  const addMut = useAddMaintenance();
  const deleteMut = useDeleteMaintenance();

  const [f, setF] = useState({
    kind: "fuel" as "fuel" | "service",
    date: new Date().toISOString().slice(0, 10),
    cost: "",
    odometer: "",
    litres: "",
    serviceType: "",
    notes: "",
    nextDueDate: "",
  });
  const set = (k: keyof typeof f) => (v: string) =>
    setF((s) => ({ ...s, [k]: v }));

  const submit = () => {
    if (!vehicleId) return;
    const cost = Number(f.cost);
    if (!f.date.trim() || !cost) return;
    addMut.mutate(
      {
        vehicleId,
        kind: f.kind,
        date: f.date.trim(),
        cost,
        odometer: f.odometer.trim() ? Number(f.odometer) : undefined,
        litres:
          f.kind === "fuel" && f.litres.trim() ? Number(f.litres) : undefined,
        serviceType:
          f.kind === "service" && f.serviceType.trim()
            ? f.serviceType.trim()
            : undefined,
        notes: f.notes.trim() || undefined,
        nextDueDate:
          f.kind === "service" && f.nextDueDate.trim()
            ? f.nextDueDate.trim()
            : undefined,
      },
      {
        onSuccess: () => {
          setShowForm(false);
          setF((s) => ({
            ...s,
            cost: "",
            odometer: "",
            litres: "",
            serviceType: "",
            notes: "",
            nextDueDate: "",
          }));
        },
      },
    );
  };

  return (
    <Screen
      overline="Fleet"
      title="Maintenance & fuel"
      subtitle={`${summary?.records ?? 0} records`}
      refreshing={isRefetching || isLoading}
      onRefresh={refetch}
    >
      <View style={{ marginBottom: 16 }}>
        <Select
          label="Vehicle"
          placeholder="All vehicles"
          value={vehicleId}
          options={vehicleOptions}
          onChange={setVehicleId}
          allowClear
        />
      </View>

      <HStack gap={12} style={{ marginBottom: 16 }}>
        <TintTile
          label="Fuel cost"
          value={money(summary?.fuelCost ?? 0)}
          icon={Fuel}
          tint="amber"
        />
        <TintTile
          label="Service cost"
          value={money(summary?.serviceCost ?? 0)}
          icon={Wrench}
          tint="blue"
        />
        <TintTile
          label="Litres"
          value={(summary?.litres ?? 0).toLocaleString("en-IN")}
          icon={Gauge}
          tint="teal"
        />
      </HStack>

      {summary?.nextServiceDue ? (
        <View style={styles.dueBanner}>
          <CalendarClock size={16} color={tints.amber.icon} strokeWidth={2} />
          <Text variant="label" style={{ color: tints.amber.fg }}>
            Next service due: {String(summary.nextServiceDue).slice(0, 10)}
          </Text>
        </View>
      ) : null}

      {addMut.isError && (
        <View style={errorBox}>
          <Text variant="body-sm" tone="danger">
            {apiErrorMessage(addMut.error)}
          </Text>
        </View>
      )}

      {showForm ? (
        <Card style={{ marginBottom: 16 }}>
          <VStack gap={14}>
            <HStack gap={8}>
              <Pressable
                style={{ flex: 1 }}
                onPress={() => setF((s) => ({ ...s, kind: "fuel" }))}
              >
                <View
                  style={[
                    styles.toggle,
                    f.kind === "fuel" && {
                      backgroundColor: tints.amber.bg,
                      borderColor: tints.amber.ring,
                    },
                  ]}
                >
                  <Fuel
                    size={16}
                    color={
                      f.kind === "fuel"
                        ? tints.amber.icon
                        : palette.text.tertiary
                    }
                    strokeWidth={2}
                  />
                  <Text
                    variant="label"
                    style={{
                      color:
                        f.kind === "fuel"
                          ? tints.amber.fg
                          : palette.text.tertiary,
                    }}
                  >
                    Log fuel
                  </Text>
                </View>
              </Pressable>
              <Pressable
                style={{ flex: 1 }}
                onPress={() => setF((s) => ({ ...s, kind: "service" }))}
              >
                <View
                  style={[
                    styles.toggle,
                    f.kind === "service" && {
                      backgroundColor: tints.blue.bg,
                      borderColor: tints.blue.ring,
                    },
                  ]}
                >
                  <Wrench
                    size={16}
                    color={
                      f.kind === "service"
                        ? tints.blue.icon
                        : palette.text.tertiary
                    }
                    strokeWidth={2}
                  />
                  <Text
                    variant="label"
                    style={{
                      color:
                        f.kind === "service"
                          ? tints.blue.fg
                          : palette.text.tertiary,
                    }}
                  >
                    Log service
                  </Text>
                </View>
              </Pressable>
            </HStack>

            {!vehicleId ? (
              <Text variant="body-sm" tone="tertiary">
                Select a vehicle above to log a record.
              </Text>
            ) : null}

            <TextField
              label="Date"
              value={f.date}
              onChangeText={set("date")}
              placeholder="YYYY-MM-DD"
              autoCapitalize="none"
            />
            <TextField
              label="Cost (₹)"
              value={f.cost}
              onChangeText={set("cost")}
              keyboardType="numeric"
              placeholder="0"
            />
            <TextField
              label="Odometer (optional)"
              value={f.odometer}
              onChangeText={set("odometer")}
              keyboardType="numeric"
              placeholder="km"
            />
            {f.kind === "fuel" ? (
              <TextField
                label="Litres"
                value={f.litres}
                onChangeText={set("litres")}
                keyboardType="numeric"
                placeholder="0"
              />
            ) : (
              <>
                <TextField
                  label="Service type"
                  value={f.serviceType}
                  onChangeText={set("serviceType")}
                  placeholder="Oil change, tyres…"
                />
                <TextField
                  label="Next due date (optional)"
                  value={f.nextDueDate}
                  onChangeText={set("nextDueDate")}
                  placeholder="YYYY-MM-DD"
                  autoCapitalize="none"
                />
              </>
            )}
            <TextField
              label="Notes (optional)"
              value={f.notes}
              onChangeText={set("notes")}
              placeholder="Notes"
            />

            <HStack gap={12}>
              <Button
                label="Cancel"
                variant="secondary"
                onPress={() => setShowForm(false)}
              />
              <View style={{ flex: 1 }}>
                <Button
                  label="Save record"
                  loading={addMut.isPending}
                  disabled={!vehicleId}
                  onPress={submit}
                />
              </View>
            </HStack>
          </VStack>
        </Card>
      ) : (
        <Button
          label="Log fuel / service"
          icon={<Plus size={18} color="#FFFFFF" strokeWidth={2.2} />}
          style={{ marginBottom: 16 }}
          onPress={() => setShowForm(true)}
        />
      )}

      {records.length === 0 ? (
        <EmptyState
          icon={Wrench}
          title={isLoading ? "Loading…" : "No records yet"}
          message="Log fuel fill-ups and services to track running costs."
        />
      ) : (
        <VStack gap={12}>
          {records.map((r) => (
            <RecordRow
              key={r.id}
              record={r}
              onDelete={() =>
                confirm("Delete this record?", () => deleteMut.mutate(r.id))
              }
            />
          ))}
        </VStack>
      )}
    </Screen>
  );
}

function RecordRow({
  record,
  onDelete,
}: {
  record: MaintenanceRecord;
  onDelete: () => void;
}) {
  const isFuel = record.kind === "fuel";
  const t = isFuel ? tints.amber : tints.blue;
  const Icon = isFuel ? Fuel : Wrench;
  return (
    <Card elevation="base">
      <HStack gap={14} align="center">
        <View style={[styles.recordIcon, { backgroundColor: t.bg }]}>
          <Icon size={18} color={t.icon} strokeWidth={2.2} />
        </View>
        <VStack gap={4} flex={1}>
          <HStack gap={8} align="center">
            <Text variant="label-lg" tone="primary">
              ₹{(record.cost ?? 0).toLocaleString("en-IN")}
            </Text>
            <StatusChip
              label={isFuel ? "Fuel" : "Service"}
              tone={isFuel ? "warning" : "info"}
            />
          </HStack>
          <Text variant="body-sm" tone="tertiary">
            {String(record.date).slice(0, 10)}
            {record.odometer != null ? ` · ${record.odometer} km` : ""}
            {isFuel && record.litres != null ? ` · ${record.litres} L` : ""}
            {!isFuel && record.serviceType ? ` · ${record.serviceType}` : ""}
          </Text>
          {record.notes ? (
            <Text variant="body-sm" tone="secondary" numberOfLines={2}>
              {record.notes}
            </Text>
          ) : null}
          {!isFuel && record.nextDueDate ? (
            <Text variant="caption" tone="warning">
              Next due: {String(record.nextDueDate).slice(0, 10)}
            </Text>
          ) : null}
        </VStack>
        <Pressable onPress={onDelete} hitSlop={8}>
          <Trash2 size={18} color={palette.danger.text} strokeWidth={2} />
        </Pressable>
      </HStack>
    </Card>
  );
}

const errorBox = {
  padding: 14,
  borderRadius: radius.md,
  backgroundColor: palette.danger.bg,
  borderWidth: 1,
  borderColor: palette.danger.border,
  marginBottom: 16,
} as const;

const styles = StyleSheet.create({
  dueBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 12,
    borderRadius: radius.md,
    backgroundColor: tints.amber.bg,
    borderWidth: 1,
    borderColor: tints.amber.ring,
    marginBottom: 16,
  },
  toggle: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    height: 44,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: palette.border.default,
    backgroundColor: palette.surface.primary,
  },
  recordIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
  },
});
