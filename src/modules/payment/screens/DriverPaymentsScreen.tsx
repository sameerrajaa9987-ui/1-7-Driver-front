/**
 * DriverPaymentsScreen — "Collect Cash" (client mockup): a Record Payment /
 * My Collections segmented control. Record shows the chosen student, amount,
 * month, payment-mode pills and remarks; My Collections lists what was logged.
 */
import React, { useMemo, useState } from "react";
import { View, Pressable, StyleSheet } from "react-native";
import { useQuery } from "@tanstack/react-query";
import {
  IndianRupee,
  ReceiptIndianRupee,
  Wallet,
  Banknote,
  Smartphone,
  MoreHorizontal,
} from "lucide-react-native";
import type { LucideIcon } from "lucide-react-native";
import { apiClient, apiErrorMessage } from "@api/apiClient";
import {
  usePayments,
  useRecordPayment,
} from "@modules/payment/hooks/usePayments";
import { Payment, PaymentStatus } from "@modules/payment/types";
import { palette, radius, tints, accent } from "@shared/designSystem";
import {
  Screen,
  Text,
  VStack,
  HStack,
  Card,
  Avatar,
  Button,
  TextField,
  Select,
  StatusChip,
  EmptyState,
} from "@shared/ui";
import type { SelectOption } from "@shared/ui";
import { childAvatarSvg } from "@shared/avatars";

const money = (n: number) => `₹${Number(n || 0).toLocaleString("en-IN")}`;

const STATUS_TONE: Record<PaymentStatus, "warning" | "success" | "danger"> = {
  pending: "warning",
  verified: "success",
  rejected: "danger",
};
const STATUS_LABEL: Record<PaymentStatus, string> = {
  pending: "Pending",
  verified: "Verified",
  rejected: "Rejected",
};

interface StudentLite {
  id: string;
  name: string;
  className?: string;
  section?: string;
  routeName?: string;
  monthlyFee?: number;
}

function useStudentOptions() {
  return useQuery({
    queryKey: ["students", "options"],
    queryFn: async () => {
      const res = await apiClient.get<{
        success: boolean;
        data: StudentLite[];
      }>("/students", { params: { limit: 200 } });
      return res.data.data;
    },
  });
}

function monthOptions(): SelectOption[] {
  const out: SelectOption[] = [];
  const d = new Date();
  for (let i = 0; i < 6; i++) {
    const m = new Date(d.getFullYear(), d.getMonth() - i, 1);
    const value = `${m.getFullYear()}-${String(m.getMonth() + 1).padStart(2, "0")}`;
    out.push({
      value,
      label: m.toLocaleString("en-US", { month: "long", year: "numeric" }),
    });
  }
  return out;
}

const MODES: {
  key: "cash" | "upi" | "other";
  label: string;
  icon: LucideIcon;
}[] = [
  { key: "cash", label: "Cash", icon: Banknote },
  { key: "upi", label: "UPI / Transfer", icon: Smartphone },
  { key: "other", label: "Other", icon: MoreHorizontal },
];

export default function DriverPaymentsScreen() {
  const [tab, setTab] = useState<"record" | "collections">("record");
  const { data: students } = useStudentOptions();
  const record = useRecordPayment();
  const {
    data: myPayments,
    isLoading,
    refetch,
    isRefetching,
  } = usePayments({
    limit: 50,
  });

  const months = useMemo(() => monthOptions(), []);
  const [studentId, setStudentId] = useState<string | null>(null);
  const [amount, setAmount] = useState("");
  const [modePill, setModePill] = useState<"cash" | "upi" | "other">("cash");
  const [forMonth, setForMonth] = useState(months[0]?.value ?? "");
  const [notes, setNotes] = useState("");

  const studentOptions: SelectOption[] = useMemo(
    () => (students ?? []).map((s) => ({ value: s.id, label: s.name })),
    [students],
  );
  const selected = (students ?? []).find((s) => s.id === studentId) || null;

  const parsedAmount = Number(amount);
  const canSubmit = !!studentId && parsedAmount > 0;

  const submit = () => {
    if (!canSubmit || !studentId) return;
    record.mutate(
      {
        studentId,
        amount: parsedAmount,
        mode: modePill === "cash" ? "cash" : "transfer",
        forMonth: forMonth || undefined,
        notes: notes.trim() || undefined,
      },
      {
        onSuccess: () => {
          setStudentId(null);
          setAmount("");
          setModePill("cash");
          setNotes("");
          refetch();
        },
      },
    );
  };

  const payments = myPayments?.data ?? [];

  return (
    <Screen title="Collect Cash" refreshing={isRefetching} onRefresh={refetch}>
      {/* Segmented control */}
      <View style={styles.segment}>
        {(["record", "collections"] as const).map((k) => {
          const active = tab === k;
          return (
            <Pressable
              key={k}
              onPress={() => setTab(k)}
              style={[
                styles.segmentBtn,
                active && { backgroundColor: accent.main },
              ]}
            >
              <Text
                variant="label"
                weight="700"
                style={{ color: active ? "#FFFFFF" : palette.text.secondary }}
              >
                {k === "record" ? "Record Payment" : "My Collections"}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {tab === "record" ? (
        <VStack gap={16} style={{ marginTop: 16 }}>
          {record.isError && (
            <Text variant="body-sm" tone="danger">
              {apiErrorMessage(record.error)}
            </Text>
          )}
          {record.isSuccess && (
            <Text variant="body-sm" tone="success">
              Payment recorded — pending admin verification.
            </Text>
          )}

          <Select
            label="Student"
            placeholder="Choose a student"
            value={studentId}
            options={studentOptions}
            onChange={setStudentId}
          />

          {selected ? (
            <Card style={{ paddingVertical: 12 }}>
              <HStack gap={12} align="center">
                <Avatar
                  name={selected.name}
                  seed={selected.id}
                  size={44}
                  svgXml={childAvatarSvg(selected.id)}
                />
                <VStack gap={2} flex={1}>
                  <Text variant="label-lg" weight="700" tone="primary">
                    {selected.name}
                  </Text>
                  <Text variant="body-sm" tone="tertiary" numberOfLines={1}>
                    {[
                      selected.className && `Class ${selected.className}`,
                      selected.routeName,
                    ]
                      .filter(Boolean)
                      .join(" · ")}
                  </Text>
                </VStack>
              </HStack>
            </Card>
          ) : null}

          <TextField
            label="Amount (₹)"
            leading={
              <IndianRupee size={18} color="#64748B" strokeWidth={1.8} />
            }
            value={amount}
            onChangeText={setAmount}
            keyboardType="numeric"
            placeholder={
              selected?.monthlyFee ? String(selected.monthlyFee) : "0"
            }
          />

          <Select
            label="Month"
            value={forMonth}
            options={months}
            onChange={(v) => setForMonth(String(v))}
          />

          {/* Payment mode pills */}
          <VStack gap={8}>
            <Text variant="label" weight="600" tone="secondary">
              Payment Mode
            </Text>
            <HStack gap={10}>
              {MODES.map((m) => {
                const on = modePill === m.key;
                return (
                  <Pressable
                    key={m.key}
                    onPress={() => setModePill(m.key)}
                    style={[
                      styles.modePill,
                      on
                        ? {
                            borderColor: accent.main,
                            backgroundColor: accent.soft,
                          }
                        : null,
                    ]}
                  >
                    <m.icon
                      size={16}
                      color={on ? accent.main : palette.text.tertiary}
                      strokeWidth={2}
                    />
                    <Text
                      variant="label-sm"
                      weight="600"
                      style={{
                        color: on ? accent.dark : palette.text.secondary,
                      }}
                    >
                      {m.label}
                    </Text>
                  </Pressable>
                );
              })}
            </HStack>
          </VStack>

          <TextField
            label="Remarks (optional)"
            value={notes}
            onChangeText={setNotes}
            placeholder="Enter note…"
          />

          <Button
            label="Record Payment"
            loading={record.isPending}
            disabled={!canSubmit}
            onPress={submit}
          />
        </VStack>
      ) : (
        <View style={{ marginTop: 16 }}>
          {payments.length === 0 ? (
            <EmptyState
              icon={ReceiptIndianRupee}
              title={isLoading ? "Loading…" : "No collections yet"}
              message="Payments you record will appear here with their status."
            />
          ) : (
            <VStack gap={10}>
              {payments.map((p) => (
                <RecordedRow key={p.id} payment={p} />
              ))}
            </VStack>
          )}
        </View>
      )}
    </Screen>
  );
}

function RecordedRow({ payment }: { payment: Payment }) {
  return (
    <Card>
      <HStack align="center" gap={12}>
        <View style={styles.rowIcon}>
          <Wallet size={18} color={tints.amber.icon} strokeWidth={2} />
        </View>
        <VStack gap={2} flex={1}>
          <Text variant="label-lg" weight="700" tone="primary">
            {money(payment.amount)}
          </Text>
          <Text variant="body-sm" tone="tertiary">
            {payment.mode === "cash" ? "Cash" : "Transfer"}
            {payment.forMonth ? ` · ${payment.forMonth}` : ""}
          </Text>
        </VStack>
        <StatusChip
          label={STATUS_LABEL[payment.status]}
          tone={STATUS_TONE[payment.status]}
        />
      </HStack>
    </Card>
  );
}

const styles = StyleSheet.create({
  segment: {
    flexDirection: "row",
    backgroundColor: palette.surface.secondary,
    borderRadius: radius.full,
    padding: 4,
    borderWidth: 1,
    borderColor: palette.border.default,
  },
  segmentBtn: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 9,
    borderRadius: radius.full,
  },
  modePill: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 11,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: palette.border.default,
    backgroundColor: palette.surface.primary,
  },
  rowIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: tints.amber.bg,
    alignItems: "center",
    justifyContent: "center",
  },
});
