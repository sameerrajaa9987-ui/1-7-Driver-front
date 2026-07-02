import React, { useEffect, useState } from "react";
import { View, Switch } from "react-native";
import {
  useSettings,
  useUpdateSettings,
} from "@modules/settings/hooks/useSettings";
import {
  Settings,
  HolidayBilling,
  MidMonthLeaving,
} from "@modules/settings/types";
import { apiErrorMessage } from "@api/apiClient";
import { palette, radius } from "@shared/designSystem";
import {
  Screen,
  Text,
  VStack,
  HStack,
  Card,
  Button,
  TextField,
  Select,
  SelectOption,
} from "@shared/ui";

const HOLIDAY_OPTIONS: SelectOption[] = [
  { value: "pause", label: "Pause billing" },
  { value: "prorate", label: "Prorate" },
  { value: "continue", label: "Continue billing" },
];

const LEAVING_OPTIONS: SelectOption[] = [
  { value: "refund", label: "Refund" },
  { value: "prorate", label: "Prorate" },
  { value: "none", label: "No adjustment" },
];

type FormState = {
  holidayBilling: HolidayBilling;
  suspendAfterOverdueDays: string;
  midMonthLeaving: MidMonthLeaving;
  enforceVehicleCapacity: boolean;
  whatsappEnabled: boolean;
  pushEnabled: boolean;
  waitingTimerMinutes: string;
  reminderDaysBefore: string;
  prorateFirstLastMonth: boolean;
};

function toForm(s: Settings): FormState {
  return {
    holidayBilling: s.holidayBilling,
    suspendAfterOverdueDays: String(s.suspendAfterOverdueDays ?? 0),
    midMonthLeaving: s.midMonthLeaving,
    enforceVehicleCapacity: s.enforceVehicleCapacity,
    whatsappEnabled: s.whatsappEnabled,
    pushEnabled: s.pushEnabled,
    waitingTimerMinutes: String(s.waitingTimerMinutes ?? 0),
    reminderDaysBefore: (s.reminderDaysBefore ?? []).join(", "),
    prorateFirstLastMonth: s.prorateFirstLastMonth,
  };
}

export default function SettingsScreen() {
  const { data, isLoading, refetch, isRefetching } = useSettings();
  const updateMut = useUpdateSettings();
  const [f, setF] = useState<FormState | null>(null);

  useEffect(() => {
    if (data) setF(toForm(data));
  }, [data]);

  const set =
    <K extends keyof FormState>(k: K) =>
    (v: FormState[K]) =>
      setF((s) => (s ? { ...s, [k]: v } : s));

  const save = () => {
    if (!f) return;
    updateMut.mutate({
      holidayBilling: f.holidayBilling,
      suspendAfterOverdueDays: Number(f.suspendAfterOverdueDays) || 0,
      midMonthLeaving: f.midMonthLeaving,
      enforceVehicleCapacity: f.enforceVehicleCapacity,
      whatsappEnabled: f.whatsappEnabled,
      pushEnabled: f.pushEnabled,
      waitingTimerMinutes: Number(f.waitingTimerMinutes) || 0,
      reminderDaysBefore: f.reminderDaysBefore
        .split(",")
        .map((x) => Number(x.trim()))
        .filter((n) => !Number.isNaN(n) && n > 0),
      prorateFirstLastMonth: f.prorateFirstLastMonth,
    });
  };

  return (
    <Screen
      overline="Configuration"
      title="Settings"
      subtitle="Billing, operations & notifications"
      refreshing={isRefetching || isLoading}
      onRefresh={refetch}
    >
      {!f ? (
        <Text variant="body-sm" tone="tertiary">
          {isLoading ? "Loading…" : "Settings unavailable."}
        </Text>
      ) : (
        <VStack gap={16}>
          <Card>
            <VStack gap={16}>
              <Text variant="h4" tone="primary">
                Billing
              </Text>
              <Select
                label="Holiday billing"
                value={f.holidayBilling}
                options={HOLIDAY_OPTIONS}
                onChange={(v) =>
                  set("holidayBilling")((v as HolidayBilling) ?? "pause")
                }
              />
              <Select
                label="Mid-month leaving"
                value={f.midMonthLeaving}
                options={LEAVING_OPTIONS}
                onChange={(v) =>
                  set("midMonthLeaving")((v as MidMonthLeaving) ?? "none")
                }
              />
              <TextField
                label="Suspend after overdue (days)"
                value={f.suspendAfterOverdueDays}
                onChangeText={set("suspendAfterOverdueDays")}
                keyboardType="number-pad"
                placeholder="0"
              />
              <ToggleRow
                label="Prorate first & last month"
                value={f.prorateFirstLastMonth}
                onValueChange={set("prorateFirstLastMonth")}
              />
            </VStack>
          </Card>

          <Card>
            <VStack gap={16}>
              <Text variant="h4" tone="primary">
                Operations
              </Text>
              <TextField
                label="Waiting timer (minutes)"
                value={f.waitingTimerMinutes}
                onChangeText={set("waitingTimerMinutes")}
                keyboardType="number-pad"
                placeholder="0"
              />
              <ToggleRow
                label="Enforce vehicle capacity"
                value={f.enforceVehicleCapacity}
                onValueChange={set("enforceVehicleCapacity")}
              />
            </VStack>
          </Card>

          <Card>
            <VStack gap={16}>
              <Text variant="h4" tone="primary">
                Notifications
              </Text>
              <ToggleRow
                label="WhatsApp notifications"
                value={f.whatsappEnabled}
                onValueChange={set("whatsappEnabled")}
              />
              <ToggleRow
                label="Push notifications"
                value={f.pushEnabled}
                onValueChange={set("pushEnabled")}
              />
              <TextField
                label="Reminder days before (comma separated)"
                value={f.reminderDaysBefore}
                onChangeText={set("reminderDaysBefore")}
                keyboardType="numbers-and-punctuation"
                placeholder="7, 3, 1"
                autoCapitalize="none"
                hint="e.g. 7, 3, 1"
              />
            </VStack>
          </Card>

          {updateMut.isError && (
            <View style={errorBox}>
              <Text variant="body-sm" tone="danger">
                {apiErrorMessage(updateMut.error)}
              </Text>
            </View>
          )}
          {updateMut.isSuccess && (
            <Text variant="body-sm" tone="success">
              Settings saved.
            </Text>
          )}

          <Button
            label="Save changes"
            size="lg"
            loading={updateMut.isPending}
            onPress={save}
          />
        </VStack>
      )}
    </Screen>
  );
}

function ToggleRow({
  label,
  value,
  onValueChange,
}: {
  label: string;
  value: boolean;
  onValueChange: (v: boolean) => void;
}) {
  return (
    <HStack gap={12} align="center" justify="space-between">
      <Text variant="body" tone="secondary" style={{ flex: 1 }}>
        {label}
      </Text>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: palette.neutral[300], true: palette.teal[400] }}
        thumbColor={value ? palette.teal[600] : palette.neutral[50]}
      />
    </HStack>
  );
}

const errorBox = {
  padding: 14,
  borderRadius: radius.md,
  backgroundColor: palette.danger.bg,
  borderWidth: 1,
  borderColor: palette.danger.border,
} as const;
