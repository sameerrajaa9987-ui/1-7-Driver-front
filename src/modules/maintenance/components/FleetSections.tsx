/**
 * Fleet health sections (deck: Vehicle & Inventory Management):
 *  - ComplianceSection — statutory documents per vehicle with traffic-light
 *    expiry status (valid / expiring ≤30d / expired).
 *  - InventorySection — safety assets with stock status + quick add.
 *  - AnalyticsSection — per-vehicle profitability for the current month.
 */
import React, { useState } from "react";
import { View, Pressable, StyleSheet } from "react-native";
import {
  ShieldCheck,
  PackageOpen,
  TrendingUp,
  Trash2,
  Plus,
} from "lucide-react-native";
import type { Vehicle, VehicleDocKey } from "@modules/vehicle/types";
import {
  useInventory,
  useInventoryCounts,
  useAddInventory,
  useUpdateInventory,
  useDeleteInventory,
} from "@modules/inventory/hooks/useInventory";
import type {
  InventoryItem,
  InventoryStatus,
} from "@modules/inventory/api/inventoryApi";
import { useFleetAnalytics } from "@modules/maintenance/hooks/useMaintenance";
import { useSubscription } from "@modules/subscription/hooks/useSubscription";
import { UpsellCard } from "@modules/subscription/components/UpsellCard";
import { palette, radius, tints } from "@shared/designSystem";
import {
  Text,
  VStack,
  HStack,
  Card,
  Button,
  TextField,
  Select,
  StatusChip,
} from "@shared/ui";

const money = (n: number) => `₹${(n ?? 0).toLocaleString("en-IN")}`;

const DOC_LABEL: Record<VehicleDocKey, string> = {
  rc: "RC",
  insurance: "Insurance",
  fitness: "Fitness",
  puc: "PUC",
  permit: "Permit",
};
const DOC_KEYS: VehicleDocKey[] = [
  "rc",
  "insurance",
  "fitness",
  "puc",
  "permit",
];

function docState(expiry: string | null): {
  tone: "success" | "warning" | "danger" | "neutral";
  label: string;
} {
  if (!expiry) return { tone: "neutral", label: "—" };
  const days = Math.floor(
    (new Date(expiry).getTime() - Date.now()) / 86_400_000,
  );
  if (days < 0) return { tone: "danger", label: "Expired" };
  if (days <= 30) return { tone: "warning", label: `${days}d left` };
  return { tone: "success", label: "Valid" };
}

// ---------------------------------------------------------------------------
export function ComplianceSection({ vehicles }: { vehicles: Vehicle[] }) {
  if (vehicles.length === 0) return null;
  return (
    <VStack gap={12} style={{ marginBottom: 16 }}>
      <HStack gap={8} align="center">
        <ShieldCheck size={18} color={palette.text.accent} strokeWidth={2} />
        <Text variant="h3" tone="primary">
          Compliance
        </Text>
      </HStack>
      {vehicles.map((v) => (
        <Card key={v.id} elevation="base">
          <Text variant="label-lg" tone="primary" style={{ marginBottom: 10 }}>
            {v.vehicleNumber}
          </Text>
          <View style={styles.docGrid}>
            {DOC_KEYS.map((key) => {
              const st = docState(v.documents?.[key]?.expiryDate ?? null);
              return (
                <View key={key} style={styles.docCell}>
                  <Text variant="caption" tone="tertiary">
                    {DOC_LABEL[key]}
                  </Text>
                  <StatusChip label={st.label} tone={st.tone} />
                </View>
              );
            })}
          </View>
        </Card>
      ))}
    </VStack>
  );
}

// ---------------------------------------------------------------------------
const INV_TONE: Record<
  InventoryStatus,
  "success" | "warning" | "danger" | "neutral"
> = { ok: "success", low: "warning", replace: "danger", expired: "danger" };

const INV_LABEL: Record<InventoryStatus, string> = {
  ok: "Available",
  low: "Low stock",
  replace: "Replace",
  expired: "Expired",
};

export function InventorySection({ vehicles }: { vehicles: Vehicle[] }) {
  const sub = useSubscription();
  const locked = Boolean(sub.data && !sub.data.premium);
  const [showAdd, setShowAdd] = useState(false);
  const [name, setName] = useState("");
  const [vehicleId, setVehicleId] = useState<string | null>(null);

  const { data } = useInventory();
  const { data: counts } = useInventoryCounts();
  const addMut = useAddInventory();
  const updateMut = useUpdateInventory();
  const deleteMut = useDeleteInventory();
  const items = data?.data ?? [];

  const vehicleNo = (id: string | null) =>
    vehicles.find((v) => v.id === id)?.vehicleNumber || "Org-wide";

  const cycleStatus = (item: InventoryItem) => {
    const order: InventoryStatus[] = ["ok", "low", "replace", "expired"];
    const next = order[(order.indexOf(item.status) + 1) % order.length];
    updateMut.mutate({ id: item.id, status: next });
  };

  if (locked) {
    return (
      <View style={{ marginBottom: 16 }}>
        <UpsellCard feature="Safety inventory" />
      </View>
    );
  }

  return (
    <VStack gap={12} style={{ marginBottom: 16 }}>
      <HStack gap={8} align="center" justify="space-between">
        <HStack gap={8} align="center">
          <PackageOpen size={18} color={palette.text.accent} strokeWidth={2} />
          <Text variant="h3" tone="primary">
            Safety inventory
          </Text>
        </HStack>
        <Text variant="caption" tone="tertiary">
          {counts
            ? `${counts.ok} ok · ${counts.low} low · ${counts.replace + counts.expired} action`
            : ""}
        </Text>
      </HStack>

      {items.map((item) => (
        <Card key={item.id} elevation="base">
          <HStack gap={12} align="center">
            <VStack gap={2} flex={1}>
              <Text variant="label" tone="primary" numberOfLines={1}>
                {item.name}
              </Text>
              <Text variant="caption" tone="tertiary">
                {vehicleNo(item.vehicleId)}
                {item.expiryDate
                  ? ` · expires ${String(item.expiryDate).slice(0, 10)}`
                  : ""}
              </Text>
            </VStack>
            <Pressable onPress={() => cycleStatus(item)} hitSlop={6}>
              <StatusChip
                label={INV_LABEL[item.status]}
                tone={INV_TONE[item.status]}
              />
            </Pressable>
            <Pressable onPress={() => deleteMut.mutate(item.id)} hitSlop={8}>
              <Trash2 size={17} color={palette.danger.text} strokeWidth={2} />
            </Pressable>
          </HStack>
        </Card>
      ))}

      {showAdd ? (
        <Card>
          <VStack gap={12}>
            <TextField
              label="Item"
              value={name}
              onChangeText={setName}
              placeholder="First aid kit, fire extinguisher…"
            />
            <Select
              label="Vehicle (optional)"
              placeholder="Org-wide"
              value={vehicleId}
              options={vehicles.map((v) => ({
                value: v.id,
                label: v.vehicleNumber,
              }))}
              onChange={setVehicleId}
              allowClear
            />
            <HStack gap={12}>
              <Button
                label="Cancel"
                variant="secondary"
                onPress={() => setShowAdd(false)}
              />
              <View style={{ flex: 1 }}>
                <Button
                  label="Add item"
                  loading={addMut.isPending}
                  disabled={!name.trim()}
                  onPress={() =>
                    addMut.mutate(
                      {
                        name: name.trim(),
                        vehicleId: vehicleId || undefined,
                      },
                      {
                        onSuccess: () => {
                          setName("");
                          setShowAdd(false);
                        },
                      },
                    )
                  }
                />
              </View>
            </HStack>
          </VStack>
        </Card>
      ) : (
        <Button
          label="Add inventory item"
          variant="secondary"
          icon={<Plus size={16} color={palette.text.primary} strokeWidth={2} />}
          onPress={() => setShowAdd(true)}
        />
      )}
    </VStack>
  );
}

// ---------------------------------------------------------------------------
export function AnalyticsSection() {
  const sub = useSubscription();
  const { data } = useFleetAnalytics();

  if (sub.data && !sub.data.premium) {
    return (
      <View style={{ marginBottom: 16 }}>
        <UpsellCard feature="Fleet profitability" />
      </View>
    );
  }
  if (!data || data.vehicles.length === 0) return null;

  return (
    <VStack gap={12} style={{ marginBottom: 16 }}>
      <HStack gap={8} align="center">
        <TrendingUp size={18} color={palette.text.accent} strokeWidth={2} />
        <Text variant="h3" tone="primary">
          Profitability · {data.month}
        </Text>
      </HStack>
      <Card>
        <VStack gap={12}>
          {data.vehicles.map((v) => (
            <HStack key={v.vehicleId} gap={10} align="center">
              <VStack gap={1} flex={1}>
                <Text variant="label" tone="primary">
                  {v.vehicleNumber}
                </Text>
                <Text variant="caption" tone="tertiary">
                  {v.students} students · collected{" "}
                  {money(v.collectedThisMonth)} · costs {money(v.costThisMonth)}
                </Text>
              </VStack>
              <Text
                variant="label-lg"
                weight="700"
                style={{
                  color: v.marginThisMonth >= 0 ? tints.green.fg : tints.red.fg,
                }}
              >
                {v.marginThisMonth >= 0 ? "+" : ""}
                {money(v.marginThisMonth)}
              </Text>
            </HStack>
          ))}
          <View style={styles.totalsRule} />
          <HStack justify="space-between" align="center">
            <Text variant="label" tone="secondary">
              Fleet margin this month
            </Text>
            <Text
              variant="h3"
              style={{
                color:
                  data.totals.marginThisMonth >= 0
                    ? tints.green.fg
                    : tints.red.fg,
              }}
            >
              {money(data.totals.marginThisMonth)}
            </Text>
          </HStack>
        </VStack>
      </Card>
    </VStack>
  );
}

const styles = StyleSheet.create({
  docGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  docCell: {
    minWidth: 86,
    gap: 4,
  },
  totalsRule: {
    height: 1,
    backgroundColor: palette.border.default,
    borderRadius: radius.full,
  },
});
