import React, { useEffect, useState } from "react";
import { View, Platform, Alert } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Bus, Car, Armchair, Trash2 } from "lucide-react-native";
import {
  useVehicle,
  useCreateVehicle,
  useUpdateVehicle,
  useRemoveVehicle,
} from "@modules/vehicle/hooks/useVehicles";
import { apiErrorMessage } from "@api/apiClient";
import { useAuthStore } from "@shared/store/useAuthStore";
import { PERMISSIONS } from "@shared/permissions";
import { palette, radius } from "@shared/designSystem";
import {
  Screen,
  Text,
  VStack,
  Card,
  Button,
  TextField,
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

export default function VehicleFormScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const id = route.params?.id as string | undefined;
  const editing = Boolean(id);

  const { data: vehicle } = useVehicle(id || "");
  const createMut = useCreateVehicle();
  const updateMut = useUpdateVehicle(id || "");
  const removeMut = useRemoveVehicle();
  const mut = editing ? updateMut : createMut;

  const hasPermission = useAuthStore((s) => s.hasPermission);
  const canManage = hasPermission(PERMISSIONS.VEHICLES_MANAGE);

  const [f, setF] = useState({
    vehicleNumber: "",
    model: "",
    seatingCapacity: "",
  });

  useEffect(() => {
    if (vehicle)
      setF({
        vehicleNumber: vehicle.vehicleNumber,
        model: vehicle.model,
        seatingCapacity: vehicle.seatingCapacity
          ? String(vehicle.seatingCapacity)
          : "",
      });
  }, [vehicle]);

  const set = (k: keyof typeof f) => (v: string) =>
    setF((s) => ({ ...s, [k]: v }));

  const submit = () => {
    if (!f.vehicleNumber.trim()) return;
    const seats = parseInt(f.seatingCapacity, 10);
    mut.mutate(
      {
        vehicleNumber: f.vehicleNumber.trim(),
        model: f.model.trim() || undefined,
        seatingCapacity: Number.isFinite(seats) ? seats : undefined,
      },
      { onSuccess: () => navigation.goBack() },
    );
  };

  return (
    <Screen
      overline="Vehicles"
      title={editing ? "Edit vehicle" : "Add vehicle"}
      onBack={() => navigation.goBack()}
    >

      {mut.isError && (
        <View style={errorBox}>
          <Text variant="body-sm" tone="danger">
            {apiErrorMessage(mut.error)}
          </Text>
        </View>
      )}

      <Card style={{ marginBottom: 16 }}>
        <VStack gap={16}>
          <TextField
            label="Vehicle number"
            leading={
              <Bus size={18} color={palette.text.tertiary} strokeWidth={1.8} />
            }
            value={f.vehicleNumber}
            onChangeText={set("vehicleNumber")}
            autoCapitalize="characters"
            placeholder="KA01AB1234"
          />
          <TextField
            label="Model (optional)"
            leading={
              <Car size={18} color={palette.text.tertiary} strokeWidth={1.8} />
            }
            value={f.model}
            onChangeText={set("model")}
            placeholder="Tata Winger"
          />
          <TextField
            label="Seating capacity (optional)"
            leading={
              <Armchair
                size={18}
                color={palette.text.tertiary}
                strokeWidth={1.8}
              />
            }
            value={f.seatingCapacity}
            onChangeText={set("seatingCapacity")}
            keyboardType="number-pad"
            placeholder="15"
          />
        </VStack>
      </Card>

      <Button
        label={editing ? "Save changes" : "Add vehicle"}
        size="lg"
        loading={mut.isPending}
        onPress={submit}
      />

      {editing && canManage && vehicle?.isActive && (
        <Button
          label="Deactivate vehicle"
          variant="destructive"
          icon={<Trash2 size={16} color="#FFFFFF" strokeWidth={2} />}
          style={{ marginTop: 16 }}
          loading={removeMut.isPending}
          onPress={() =>
            confirm("Deactivate this vehicle?", () =>
              removeMut.mutate(id!, { onSuccess: () => navigation.goBack() }),
            )
          }
        />
      )}
    </Screen>
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
