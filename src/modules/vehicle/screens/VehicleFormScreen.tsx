import React, { useEffect, useState } from "react";
import { View, Platform, Alert } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Bus, Car, Armchair, Trash2, ShieldCheck } from "lucide-react-native";
import {
  useVehicle,
  useCreateVehicle,
  useUpdateVehicle,
  useRemoveVehicle,
} from "@modules/vehicle/hooks/useVehicles";
import type { VehicleDocKey } from "@modules/vehicle/types";
import { apiErrorMessage } from "@api/apiClient";
import { useAuthStore } from "@shared/store/useAuthStore";
import { PERMISSIONS } from "@shared/permissions";
import { palette, radius } from "@shared/designSystem";
import {
  Screen,
  Text,
  VStack,
  HStack,
  Card,
  Button,
  TextField,
} from "@shared/ui";

/** The five statutory documents tracked per vehicle (Compliance Center). */
const DOC_META: { key: VehicleDocKey; label: string }[] = [
  { key: "rc", label: "RC book" },
  { key: "insurance", label: "Insurance" },
  { key: "fitness", label: "Fitness certificate" },
  { key: "puc", label: "PUC certificate" },
  { key: "permit", label: "Permit" },
];

type DocForm = Record<VehicleDocKey, { number: string; expiry: string }>;

const emptyDocs = (): DocForm => ({
  rc: { number: "", expiry: "" },
  insurance: { number: "", expiry: "" },
  fitness: { number: "", expiry: "" },
  puc: { number: "", expiry: "" },
  permit: { number: "", expiry: "" },
});

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
  const [docs, setDocs] = useState<DocForm>(emptyDocs());

  useEffect(() => {
    if (vehicle) {
      setF({
        vehicleNumber: vehicle.vehicleNumber,
        model: vehicle.model,
        seatingCapacity: vehicle.seatingCapacity
          ? String(vehicle.seatingCapacity)
          : "",
      });
      const next = emptyDocs();
      for (const { key } of DOC_META) {
        const d = vehicle.documents?.[key];
        next[key] = {
          number: d?.number || "",
          expiry: d?.expiryDate ? d.expiryDate.slice(0, 10) : "",
        };
      }
      setDocs(next);
    }
  }, [vehicle]);

  const set = (k: keyof typeof f) => (v: string) =>
    setF((s) => ({ ...s, [k]: v }));
  const setDoc =
    (key: VehicleDocKey, field: "number" | "expiry") => (v: string) =>
      setDocs((s) => ({ ...s, [key]: { ...s[key], [field]: v } }));

  const submit = () => {
    if (!f.vehicleNumber.trim()) return;
    const seats = parseInt(f.seatingCapacity, 10);
    const documents: Partial<
      Record<VehicleDocKey, { number: string; expiryDate: string | null }>
    > = {};
    for (const { key } of DOC_META) {
      documents[key] = {
        number: docs[key].number.trim(),
        expiryDate: docs[key].expiry.trim() || null,
      };
    }
    mut.mutate(
      {
        vehicleNumber: f.vehicleNumber.trim(),
        model: f.model.trim() || undefined,
        seatingCapacity: Number.isFinite(seats) ? seats : undefined,
        documents,
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

      {/* Compliance Center — statutory documents with expiry (fleet alerts). */}
      <Card style={{ marginBottom: 16 }}>
        <VStack gap={16}>
          <HStack gap={8} align="center">
            <ShieldCheck
              size={18}
              color={palette.text.accent}
              strokeWidth={2}
            />
            <Text variant="h4" tone="primary">
              Compliance documents
            </Text>
          </HStack>
          <Text variant="body-sm" tone="tertiary">
            Add expiry dates and the fleet screen will warn you before any
            document lapses.
          </Text>
          {DOC_META.map(({ key, label }) => (
            <HStack key={key} gap={10}>
              <View style={{ flex: 1.2 }}>
                <TextField
                  label={label}
                  value={docs[key].number}
                  onChangeText={setDoc(key, "number")}
                  placeholder="Number"
                  autoCapitalize="characters"
                />
              </View>
              <View style={{ flex: 1 }}>
                <TextField
                  label="Expiry"
                  value={docs[key].expiry}
                  onChangeText={setDoc(key, "expiry")}
                  placeholder="YYYY-MM-DD"
                  autoCapitalize="none"
                />
              </View>
            </HStack>
          ))}
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
