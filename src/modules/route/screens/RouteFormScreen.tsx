import React, { useEffect, useState } from "react";
import { View, Platform, Alert } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import {
  Route as RouteIcon,
  Check,
  Users,
  Trash2,
  UserCog,
  CheckCircle2,
  Sparkles,
} from "lucide-react-native";
import {
  useRoute as useRouteQuery,
  useCreateRoute,
  useUpdateRoute,
  useRemoveRoute,
  useSubstituteDriver,
  useOptimizeRoute,
} from "@modules/route/hooks/useRoutes";
import { useDrivers } from "@modules/driver/hooks/useDrivers";
import { useVehicles } from "@modules/vehicle/hooks/useVehicles";
import { useStudents } from "@modules/student/hooks/useStudents";
import { apiErrorMessage } from "@api/apiClient";
import { useAuthStore } from "@shared/store/useAuthStore";
import { PERMISSIONS } from "@shared/permissions";
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

export default function RouteFormScreen() {
  const navigation = useNavigation<any>();
  const nav = useRoute<any>();
  const id = nav.params?.id as string | undefined;
  const editing = Boolean(id);

  const { data: routeData } = useRouteQuery(id || "");
  const createMut = useCreateRoute();
  const updateMut = useUpdateRoute(id || "");
  const removeMut = useRemoveRoute();
  const substituteMut = useSubstituteDriver(id || "");
  const optimizeMut = useOptimizeRoute(id || "");
  const mut = editing ? updateMut : createMut;

  const [subDriverId, setSubDriverId] = useState<string | null>(null);

  const hasPermission = useAuthStore((s) => s.hasPermission);
  const canManage = hasPermission(PERMISSIONS.ROUTES_MANAGE);

  const { data: driversData } = useDrivers();
  const { data: vehiclesData } = useVehicles();
  const { data: studentsData } = useStudents();

  const driverOptions = (driversData?.data ?? []).map((d) => ({
    value: d.id,
    label: d.fullName,
  }));
  const vehicleOptions = (vehiclesData?.data ?? []).map((v) => ({
    value: v.id,
    label: v.vehicleNumber + (v.model ? ` · ${v.model}` : ""),
  }));
  const students = studentsData?.data ?? [];

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [driverId, setDriverId] = useState<string | null>(null);
  const [vehicleId, setVehicleId] = useState<string | null>(null);
  const [studentIds, setStudentIds] = useState<string[]>([]);

  useEffect(() => {
    if (routeData) {
      setName(routeData.name);
      setDescription(routeData.description);
      setDriverId(routeData.driverId);
      setVehicleId(routeData.vehicleId);
      setStudentIds(routeData.studentIds);
    }
  }, [routeData]);

  const toggleStudent = (sid: string) =>
    setStudentIds((prev) =>
      prev.includes(sid) ? prev.filter((x) => x !== sid) : [...prev, sid],
    );

  const submit = () => {
    if (!name.trim()) return;
    mut.mutate(
      {
        name: name.trim(),
        description: description.trim() || undefined,
        driverId: driverId ?? undefined,
        vehicleId: vehicleId ?? undefined,
        studentIds,
      },
      { onSuccess: () => navigation.goBack() },
    );
  };

  return (
    <Screen
      overline="Routes"
      title={editing ? "Edit route" : "Add route"}
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
            label="Route name"
            leading={
              <RouteIcon
                size={18}
                color={palette.text.tertiary}
                strokeWidth={1.8}
              />
            }
            value={name}
            onChangeText={setName}
            placeholder="Morning · North zone"
          />
          <TextField
            label="Description (optional)"
            value={description}
            onChangeText={setDescription}
            placeholder="Notes about this route"
          />
          <Select
            label="Driver (optional)"
            placeholder="Assign a driver"
            value={driverId}
            options={driverOptions}
            onChange={setDriverId}
            allowClear
          />
          <Select
            label="Vehicle (optional)"
            placeholder="Assign a vehicle"
            value={vehicleId}
            options={vehicleOptions}
            onChange={setVehicleId}
            allowClear
          />
        </VStack>
      </Card>

      <HStack
        align="center"
        justify="space-between"
        style={{ marginBottom: 12 }}
      >
        <Text variant="h4" tone="primary">
          Students
        </Text>
        <Text variant="body-sm" tone="tertiary">
          {studentIds.length} selected
        </Text>
      </HStack>

      {students.length === 0 ? (
        <EmptyState icon={Users} title="No students to assign" />
      ) : (
        <VStack gap={10}>
          {students.map((s) => {
            const on = studentIds.includes(s.id);
            return (
              <Card
                key={s.id}
                elevation="base"
                onPress={() => toggleStudent(s.id)}
                style={on ? selectedCard : undefined}
              >
                <HStack gap={12} align="center">
                  <View style={[checkbox, on && checkboxOn]}>
                    {on ? (
                      <Check size={14} color="#FFFFFF" strokeWidth={3} />
                    ) : null}
                  </View>
                  <VStack gap={2} flex={1}>
                    <Text variant="label-lg" tone="primary" numberOfLines={1}>
                      {s.name}
                    </Text>
                    {s.className || s.schoolName ? (
                      <Text variant="body-sm" tone="tertiary" numberOfLines={1}>
                        {[s.className, s.schoolName]
                          .filter(Boolean)
                          .join(" · ")}
                      </Text>
                    ) : null}
                  </VStack>
                </HStack>
              </Card>
            );
          })}
        </VStack>
      )}

      <Button
        label={editing ? "Save changes" : "Add route"}
        size="lg"
        loading={mut.isPending}
        onPress={submit}
        style={{ marginTop: 20 }}
      />

      {editing && canManage && (
        <Card style={{ marginTop: 24 }}>
          <VStack gap={14}>
            <HStack gap={8} align="center">
              <Sparkles size={18} color={tints.blue.icon} strokeWidth={2} />
              <Text variant="h4" tone="primary">
                AI route optimisation
              </Text>
            </HStack>
            <Text variant="body-sm" tone="tertiary">
              Reorder this route&apos;s stops to cut total driving distance.
            </Text>
            {optimizeMut.isError && (
              <Text variant="body-sm" tone="danger">
                {apiErrorMessage(optimizeMut.error)}
              </Text>
            )}
            {optimizeMut.data ? (
              <View style={optimizeResult}>
                <HStack gap={8} align="center">
                  <CheckCircle2
                    size={18}
                    color={tints.green.icon}
                    strokeWidth={2.2}
                  />
                  <Text variant="label-lg" style={{ color: tints.green.fg }}>
                    Saved {Math.round(optimizeMut.data.savedM)} m across{" "}
                    {optimizeMut.data.stops} stops
                  </Text>
                </HStack>
                <Text
                  variant="body-sm"
                  style={{ color: tints.green.fg, marginTop: 6 }}
                >
                  Before {Math.round(optimizeMut.data.distanceBeforeM)} m ·
                  After {Math.round(optimizeMut.data.distanceAfterM)} m
                </Text>
              </View>
            ) : null}
            <Button
              label="Optimise stop order"
              variant="accent"
              loading={optimizeMut.isPending}
              icon={
                <Sparkles size={16} color={palette.ink[900]} strokeWidth={2} />
              }
              onPress={() => optimizeMut.mutate(undefined)}
            />
          </VStack>
        </Card>
      )}

      {editing && canManage && (
        <Card style={{ marginTop: 24 }}>
          <VStack gap={14}>
            <HStack gap={8} align="center">
              <UserCog size={18} color={tints.violet.icon} strokeWidth={2} />
              <Text variant="h4" tone="primary">
                Substitute driver (today)
              </Text>
            </HStack>
            <Text variant="body-sm" tone="tertiary">
              Assign a stand-in driver for today&apos;s trips on this route.
              Parents are notified automatically.
            </Text>
            <Select
              label="Substitute driver"
              placeholder="Choose a driver"
              value={subDriverId}
              options={driverOptions}
              onChange={setSubDriverId}
              allowClear
            />
            {substituteMut.isError && (
              <Text variant="body-sm" tone="danger">
                {apiErrorMessage(substituteMut.error)}
              </Text>
            )}
            {substituteMut.isSuccess && (
              <HStack gap={6} align="center">
                <CheckCircle2
                  size={16}
                  color={tints.green.icon}
                  strokeWidth={2.2}
                />
                <Text variant="body-sm" style={{ color: tints.green.fg }}>
                  Substitute assigned — parents notified.
                </Text>
              </HStack>
            )}
            <Button
              label="Assign substitute"
              variant="accent"
              disabled={!subDriverId}
              loading={substituteMut.isPending}
              onPress={() =>
                subDriverId && substituteMut.mutate({ driverId: subDriverId })
              }
            />
          </VStack>
        </Card>
      )}

      {editing && canManage && routeData?.isActive && (
        <Button
          label="Deactivate route"
          variant="destructive"
          icon={<Trash2 size={16} color="#FFFFFF" strokeWidth={2} />}
          style={{ marginTop: 16 }}
          loading={removeMut.isPending}
          onPress={() =>
            confirm("Deactivate this route?", () =>
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

const selectedCard = {
  borderColor: palette.teal[500],
  borderWidth: 1.5,
} as const;

const optimizeResult = {
  padding: 14,
  borderRadius: radius.md,
  backgroundColor: tints.green.bg,
  borderWidth: 1,
  borderColor: tints.green.ring,
} as const;

const checkbox = {
  width: 24,
  height: 24,
  borderRadius: radius.sm,
  borderWidth: 2,
  borderColor: palette.border.default,
  alignItems: "center",
  justifyContent: "center",
} as const;

const checkboxOn = {
  backgroundColor: palette.teal[600],
  borderColor: palette.teal[600],
} as const;
