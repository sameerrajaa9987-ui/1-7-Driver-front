import React, { useEffect, useState } from "react";
import { View, Platform, Alert } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import {
  User,
  Phone,
  Lock,
  IdCard,
  MapPin,
  Trash2,
} from "lucide-react-native";
import {
  useDriver,
  useCreateDriver,
  useUpdateDriver,
  useRemoveDriver,
} from "@modules/driver/hooks/useDrivers";
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

export default function DriverFormScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const id = route.params?.id as string | undefined;
  const editing = Boolean(id);

  const { data: driver } = useDriver(id || "");
  const createMut = useCreateDriver();
  const updateMut = useUpdateDriver(id || "");
  const removeMut = useRemoveDriver();
  const mut = editing ? updateMut : createMut;

  const hasPermission = useAuthStore((s) => s.hasPermission);
  const canManage = hasPermission(PERMISSIONS.DRIVERS_MANAGE);

  const [f, setF] = useState({
    fullName: "",
    mobile: "",
    password: "",
    licenseNumber: "",
    address: "",
    licenseExpiry: "",
  });

  useEffect(() => {
    if (driver)
      setF({
        fullName: driver.fullName,
        mobile: driver.mobile,
        password: "",
        licenseNumber: driver.licenseNumber,
        address: driver.address,
        licenseExpiry: driver.licenseExpiry
          ? String(driver.licenseExpiry).slice(0, 10)
          : "",
      });
  }, [driver]);

  const set = (k: keyof typeof f) => (v: string) =>
    setF((s) => ({ ...s, [k]: v }));

  const submit = () => {
    if (!f.fullName.trim()) return;
    mut.mutate(
      {
        fullName: f.fullName.trim(),
        mobile: f.mobile.trim() || undefined,
        password: !editing && f.password.trim() ? f.password.trim() : undefined,
        licenseNumber: f.licenseNumber.trim() || undefined,
        address: f.address.trim() || undefined,
        licenseExpiry: f.licenseExpiry.trim() || undefined,
      },
      { onSuccess: () => navigation.goBack() },
    );
  };

  return (
    <Screen
      overline="Drivers"
      title={editing ? "Edit driver" : "Add driver"}
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
            label="Full name"
            leading={
              <User size={18} color={palette.text.tertiary} strokeWidth={1.8} />
            }
            value={f.fullName}
            onChangeText={set("fullName")}
            placeholder="Driver name"
          />
          <TextField
            label="Mobile"
            leading={
              <Phone
                size={18}
                color={palette.text.tertiary}
                strokeWidth={1.8}
              />
            }
            value={f.mobile}
            onChangeText={set("mobile")}
            keyboardType="phone-pad"
            placeholder="9876543210"
          />
          {!editing && (
            <TextField
              label="Password"
              leading={
                <Lock
                  size={18}
                  color={palette.text.tertiary}
                  strokeWidth={1.8}
                />
              }
              value={f.password}
              onChangeText={set("password")}
              secureTextEntry
              autoCapitalize="none"
              placeholder="Login password for the driver"
            />
          )}
          <TextField
            label="License number (optional)"
            leading={
              <IdCard
                size={18}
                color={palette.text.tertiary}
                strokeWidth={1.8}
              />
            }
            value={f.licenseNumber}
            onChangeText={set("licenseNumber")}
            autoCapitalize="characters"
          />
          <TextField
            label="License expiry (optional)"
            value={f.licenseExpiry}
            onChangeText={set("licenseExpiry")}
            placeholder="YYYY-MM-DD"
            autoCapitalize="none"
          />
          <TextField
            label="Address (optional)"
            leading={
              <MapPin
                size={18}
                color={palette.text.tertiary}
                strokeWidth={1.8}
              />
            }
            value={f.address}
            onChangeText={set("address")}
            placeholder="Address"
          />
        </VStack>
      </Card>

      <Button
        label={editing ? "Save changes" : "Add driver"}
        size="lg"
        loading={mut.isPending}
        onPress={submit}
      />

      {editing && canManage && driver?.isActive && (
        <Button
          label="Deactivate driver"
          variant="destructive"
          icon={<Trash2 size={16} color="#FFFFFF" strokeWidth={2} />}
          style={{ marginTop: 16 }}
          loading={removeMut.isPending}
          onPress={() =>
            confirm("Deactivate this driver?", () =>
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
