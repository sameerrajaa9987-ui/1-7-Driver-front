import React, { useEffect, useState } from "react";
import { View } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Wallet } from "lucide-react-native";
import {
  useStudent,
  useApproveStudent,
} from "@modules/student/hooks/useStudents";
import { useDrivers } from "@modules/driver/hooks/useDrivers";
import { useVehicles } from "@modules/vehicle/hooks/useVehicles";
import { useRoutes } from "@modules/route/hooks/useRoutes";
import { ApprovePayload } from "@modules/student/types";
import { apiErrorMessage } from "@api/apiClient";
import { palette, radius } from "@shared/designSystem";
import {
  Screen,
  Text,
  VStack,
  Card,
  Button,
  TextField,
  Select,
} from "@shared/ui";

export default function StudentApproveScreen() {
  const navigation = useNavigation<any>();
  const nav = useRoute<any>();
  const id = nav.params?.id as string;

  const { data: student } = useStudent(id);
  const approveMut = useApproveStudent(id);

  const { data: driversData } = useDrivers();
  const { data: vehiclesData } = useVehicles();
  const { data: routesData } = useRoutes();

  const driverOptions = (driversData?.data ?? []).map((d) => ({
    value: d.id,
    label: d.fullName,
  }));
  const vehicleOptions = (vehiclesData?.data ?? []).map((v) => ({
    value: v.id,
    label: v.vehicleNumber + (v.model ? ` · ${v.model}` : ""),
  }));
  const routeOptions = (routesData?.data ?? []).map((r) => ({
    value: r.id,
    label: r.name,
  }));

  const [driverId, setDriverId] = useState<string | null>(null);
  const [vehicleId, setVehicleId] = useState<string | null>(null);
  const [routeId, setRouteId] = useState<string | null>(null);
  const [monthlyFee, setMonthlyFee] = useState("");
  const [dueDate, setDueDate] = useState("");

  useEffect(() => {
    if (student) {
      setDriverId(student.driverId);
      setVehicleId(student.vehicleId);
      setRouteId(student.routeId);
      setMonthlyFee(student.monthlyFee ? String(student.monthlyFee) : "");
      setDueDate(student.dueDate ? String(student.dueDate) : "");
    }
  }, [student]);

  const submit = () => {
    const fee = parseFloat(monthlyFee);
    const due = parseInt(dueDate, 10);
    const payload: ApprovePayload = {
      driverId: driverId ?? undefined,
      vehicleId: vehicleId ?? undefined,
      routeId: routeId ?? undefined,
      monthlyFee: Number.isFinite(fee) ? fee : undefined,
      dueDate: Number.isFinite(due) ? due : undefined,
    };
    approveMut.mutate(payload, { onSuccess: () => navigation.goBack() });
  };

  return (
    <Screen
      overline="Student"
      title="Approve & assign"
      onBack={() => navigation.goBack()}
    >

      <Text variant="body-sm" tone="tertiary" style={{ marginBottom: 16 }}>
        Assign transport for {student?.name || "this student"} and set the fee.
      </Text>

      {approveMut.isError && (
        <View style={errorBox}>
          <Text variant="body-sm" tone="danger">
            {apiErrorMessage(approveMut.error)}
          </Text>
        </View>
      )}

      <Card style={{ marginBottom: 16 }}>
        <VStack gap={16}>
          <Select
            label="Driver"
            placeholder="Select driver"
            value={driverId}
            options={driverOptions}
            onChange={setDriverId}
            allowClear
          />
          <Select
            label="Vehicle"
            placeholder="Select vehicle"
            value={vehicleId}
            options={vehicleOptions}
            onChange={setVehicleId}
            allowClear
          />
          <Select
            label="Route"
            placeholder="Select route"
            value={routeId}
            options={routeOptions}
            onChange={setRouteId}
            allowClear
          />
          <TextField
            label="Monthly fee (₹)"
            value={monthlyFee}
            onChangeText={setMonthlyFee}
            keyboardType="numeric"
            placeholder="2500"
          />
          <TextField
            label="Due day of month (1–28)"
            value={dueDate}
            onChangeText={setDueDate}
            keyboardType="number-pad"
            placeholder="5"
          />
        </VStack>
      </Card>

      <Button
        label="Approve student"
        size="lg"
        icon={<Wallet size={18} color="#FFFFFF" strokeWidth={2} />}
        loading={approveMut.isPending}
        onPress={submit}
      />
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
