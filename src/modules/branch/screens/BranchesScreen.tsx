import React, { useState } from "react";
import { View, Pressable, Platform, Alert, StyleSheet } from "react-native";
import { Building2, MapPin, Plus, Trash2, Pencil } from "lucide-react-native";
import {
  useBranches,
  useCreateBranch,
  useUpdateBranch,
  useDeleteBranch,
} from "@modules/branch/hooks/useBranches";
import { Branch } from "@modules/branch/types";
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

export default function BranchesScreen() {
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const { data, isLoading, refetch, isRefetching } = useBranches();
  const branches = data?.data ?? [];
  const deleteMut = useDeleteBranch();

  return (
    <Screen
      overline="Network"
      title="Cities & branches"
      subtitle={`${data?.meta?.total ?? 0} locations`}
      refreshing={isRefetching || isLoading}
      onRefresh={refetch}
      right={
        !adding ? (
          <Button
            label="Add city/branch"
            size="sm"
            fullWidth={false}
            icon={<Plus size={18} color="#FFFFFF" strokeWidth={2.2} />}
            onPress={() => {
              setEditingId(null);
              setAdding(true);
            }}
          />
        ) : undefined
      }
    >
      {adding ? (
        <BranchForm
          onClose={() => setAdding(false)}
          onSaved={() => setAdding(false)}
        />
      ) : null}

      {branches.length === 0 ? (
        <EmptyState
          icon={Building2}
          title={isLoading ? "Loading…" : "No branches yet"}
          message="Add cities and branches to operate across locations."
        />
      ) : (
        <VStack gap={12} style={{ marginTop: adding ? 0 : 4 }}>
          {branches.map((b) =>
            editingId === b.id ? (
              <BranchForm
                key={b.id}
                branch={b}
                onClose={() => setEditingId(null)}
                onSaved={() => setEditingId(null)}
              />
            ) : (
              <BranchRow
                key={b.id}
                branch={b}
                onEdit={() => {
                  setAdding(false);
                  setEditingId(b.id);
                }}
                onDelete={() =>
                  confirm(`Remove ${b.name}?`, () => deleteMut.mutate(b.id))
                }
              />
            ),
          )}
        </VStack>
      )}
    </Screen>
  );
}

function BranchRow({
  branch,
  onEdit,
  onDelete,
}: {
  branch: Branch;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <Card onPress={onEdit} elevation="base">
      <HStack gap={14} align="center">
        <View style={styles.icon}>
          <Building2 size={20} color={tints.violet.icon} strokeWidth={2} />
        </View>
        <VStack gap={4} flex={1}>
          <Text variant="label-lg" tone="primary" numberOfLines={1}>
            {branch.name}
          </Text>
          <HStack gap={6} align="center">
            <MapPin size={13} color={palette.text.tertiary} strokeWidth={1.9} />
            <Text variant="body-sm" tone="tertiary">
              {branch.city || "No city"}
            </Text>
          </HStack>
        </VStack>
        <StatusChip
          label={branch.isActive ? "Active" : "Inactive"}
          tone={branch.isActive ? "success" : "neutral"}
        />
        <Pressable onPress={onDelete} hitSlop={8}>
          <Trash2 size={18} color={palette.danger.text} strokeWidth={2} />
        </Pressable>
      </HStack>
    </Card>
  );
}

function BranchForm({
  branch,
  onClose,
  onSaved,
}: {
  branch?: Branch;
  onClose: () => void;
  onSaved: () => void;
}) {
  const editing = Boolean(branch);
  const createMut = useCreateBranch();
  const updateMut = useUpdateBranch(branch?.id || "");
  const mut = editing ? updateMut : createMut;

  const [name, setName] = useState(branch?.name ?? "");
  const [city, setCity] = useState(branch?.city ?? "");

  const submit = () => {
    if (!name.trim() || !city.trim()) return;
    mut.mutate(
      { name: name.trim(), city: city.trim() },
      { onSuccess: onSaved },
    );
  };

  return (
    <Card style={{ marginBottom: 16 }}>
      <VStack gap={14}>
        <HStack gap={8} align="center">
          <Pencil size={16} color={tints.violet.icon} strokeWidth={2} />
          <Text variant="h4" tone="primary">
            {editing ? "Edit branch" : "New city / branch"}
          </Text>
        </HStack>

        {mut.isError && (
          <View style={errorBox}>
            <Text variant="body-sm" tone="danger">
              {apiErrorMessage(mut.error)}
            </Text>
          </View>
        )}

        <TextField
          label="Branch name"
          leading={
            <Building2
              size={18}
              color={palette.text.tertiary}
              strokeWidth={1.8}
            />
          }
          value={name}
          onChangeText={setName}
          placeholder="e.g. Central depot"
        />
        <TextField
          label="City"
          leading={
            <MapPin size={18} color={palette.text.tertiary} strokeWidth={1.8} />
          }
          value={city}
          onChangeText={setCity}
          placeholder="e.g. Bengaluru"
        />

        <HStack gap={12}>
          <Button label="Cancel" variant="secondary" onPress={onClose} />
          <View style={{ flex: 1 }}>
            <Button
              label={editing ? "Save changes" : "Add branch"}
              loading={mut.isPending}
              onPress={submit}
            />
          </View>
        </HStack>
      </VStack>
    </Card>
  );
}

const errorBox = {
  padding: 14,
  borderRadius: radius.md,
  backgroundColor: palette.danger.bg,
  borderWidth: 1,
  borderColor: palette.danger.border,
} as const;

const styles = StyleSheet.create({
  icon: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: tints.violet.bg,
    alignItems: "center",
    justifyContent: "center",
  },
});
