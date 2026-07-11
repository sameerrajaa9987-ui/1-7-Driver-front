/**
 * SettingsScreen — operator "Settings" (client mockup): a read-only list of
 * billing/operations/notification policy rows showing each current value with a
 * chevron. Tapping a row (or the header pencil) flips to the full edit form.
 */
import React, { useEffect, useState } from "react";
import { View, Switch, StyleSheet } from "react-native";
import {
  CalendarDays,
  Clock,
  UserMinus,
  Armchair,
  Bell,
  CalendarClock,
  Timer,
  Percent,
  Pencil,
  ChevronRight,
  type LucideIcon,
} from "lucide-react-native";
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
import { palette, radius, tints, type TintName } from "@shared/designSystem";
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
  HeaderIconButton,
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

const HOLIDAY_LABEL: Record<HolidayBilling, string> = {
  pause: "Pause",
  prorate: "Prorate",
  continue: "Continue",
};
const LEAVING_LABEL: Record<MidMonthLeaving, string> = {
  refund: "Refund",
  prorate: "Prorate",
  none: "No adjustment",
};

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
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    if (data) setF(toForm(data));
  }, [data]);

  const set =
    <K extends keyof FormState>(k: K) =>
    (v: FormState[K]) =>
      setF((s) => (s ? { ...s, [k]: v } : s));

  const save = () => {
    if (!f) return;
    updateMut.mutate(
      {
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
      },
      { onSuccess: () => setEditing(false) },
    );
  };

  const rows: {
    icon: LucideIcon;
    tint: TintName;
    label: string;
    value: string;
  }[] = data
    ? [
        {
          icon: CalendarDays,
          tint: "green",
          label: "Holiday Billing",
          value: HOLIDAY_LABEL[data.holidayBilling],
        },
        {
          icon: Clock,
          tint: "amber",
          label: "Suspend After Overdue",
          value: `${data.suspendAfterOverdueDays ?? 0} Days`,
        },
        {
          icon: UserMinus,
          tint: "violet",
          label: "Mid-month Leaving",
          value: LEAVING_LABEL[data.midMonthLeaving],
        },
        {
          icon: Armchair,
          tint: "blue",
          label: "Vehicle Capacity",
          value: data.enforceVehicleCapacity ? "Enforce" : "Allow over",
        },
        {
          icon: Bell,
          tint: "amber",
          label: "Push Notifications",
          value: data.pushEnabled ? "Enabled" : "Disabled",
        },
        {
          icon: CalendarClock,
          tint: "blue",
          label: "Reminder Days Before Due",
          value: (data.reminderDaysBefore ?? []).join(", ") || "—",
        },
        {
          icon: Timer,
          tint: "violet",
          label: "Waiting Timer (Driver)",
          value: `${data.waitingTimerMinutes ?? 0} Minutes`,
        },
        {
          icon: Percent,
          tint: "green",
          label: "Prorate First/Last Month",
          value: data.prorateFirstLastMonth ? "Enabled" : "Disabled",
        },
      ]
    : [];

  return (
    <Screen
      title="Settings"
      refreshing={isRefetching || isLoading}
      onRefresh={refetch}
      right={
        data && !editing ? (
          <HeaderIconButton icon={Pencil} onPress={() => setEditing(true)} />
        ) : undefined
      }
    >
      {!f || !data ? (
        <Text variant="body-sm" tone="tertiary">
          {isLoading ? "Loading…" : "Settings unavailable."}
        </Text>
      ) : editing ? (
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
                label="WhatsApp notifications (coming soon)"
                value={f.whatsappEnabled}
                onValueChange={set("whatsappEnabled")}
                disabled
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
            <View style={styles.errorBox}>
              <Text variant="body-sm" tone="danger">
                {apiErrorMessage(updateMut.error)}
              </Text>
            </View>
          )}

          <HStack gap={12}>
            <View style={{ flex: 1 }}>
              <Button
                label="Cancel"
                variant="secondary"
                onPress={() => {
                  setF(toForm(data));
                  setEditing(false);
                }}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Button
                label="Save"
                loading={updateMut.isPending}
                onPress={save}
              />
            </View>
          </HStack>
        </VStack>
      ) : (
        <Card padded={false} style={{ paddingVertical: 4 }}>
          {rows.map((r, i) => {
            const t = tints[r.tint];
            return (
              <View key={r.label}>
                {i > 0 ? <View style={styles.divider} /> : null}
                <HStack gap={12} align="center" style={styles.row}>
                  <View style={[styles.icon, { backgroundColor: t.bg }]}>
                    <r.icon size={17} color={t.icon} strokeWidth={2} />
                  </View>
                  <Text
                    variant="label-lg"
                    tone="primary"
                    style={{ flex: 1 }}
                    numberOfLines={1}
                  >
                    {r.label}
                  </Text>
                  <Text variant="label" weight="600" tone="tertiary">
                    {r.value}
                  </Text>
                  <ChevronRight
                    size={16}
                    color={palette.text.tertiary}
                    strokeWidth={2}
                  />
                </HStack>
              </View>
            );
          })}
        </Card>
      )}
    </Screen>
  );
}

function ToggleRow({
  label,
  value,
  onValueChange,
  disabled,
}: {
  label: string;
  value: boolean;
  onValueChange: (v: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <HStack
      gap={12}
      align="center"
      justify="space-between"
      style={disabled ? { opacity: 0.5 } : undefined}
    >
      <Text variant="body" tone="secondary" style={{ flex: 1 }}>
        {label}
      </Text>
      <Switch
        value={value}
        onValueChange={onValueChange}
        disabled={disabled}
        trackColor={{ false: palette.neutral[300], true: palette.teal[400] }}
        thumbColor={value ? palette.teal[600] : palette.neutral[50]}
      />
    </HStack>
  );
}

const styles = StyleSheet.create({
  row: { paddingVertical: 14, paddingHorizontal: 14 },
  icon: {
    width: 38,
    height: 38,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  divider: { height: 1, backgroundColor: palette.border.subtle },
  errorBox: {
    padding: 14,
    borderRadius: radius.md,
    backgroundColor: palette.danger.bg,
    borderWidth: 1,
    borderColor: palette.danger.border,
  },
});
