import React, { useMemo, useState } from "react";
import { View } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { IndianRupee, ReceiptIndianRupee, Wallet } from "lucide-react-native";
import { apiClient, apiErrorMessage } from "@api/apiClient";
import {
  usePayments,
  useRecordPayment,
} from "@modules/payment/hooks/usePayments";
import { Payment, PaymentStatus } from "@modules/payment/types";
import { useAuthStore } from "@shared/store/useAuthStore";
import {
  Screen,
  Text,
  VStack,
  HStack,
  Card,
  Button,
  TextField,
  Select,
  StatusChip,
  EmptyState,
} from "@shared/ui";
import type { SelectOption } from "@shared/ui";

const money = (n: number) => `₹${Number(n || 0).toLocaleString("en-IN")}`;

const STATUS_TONE: Record<PaymentStatus, "warning" | "success" | "danger"> = {
  pending: "warning",
  verified: "success",
  rejected: "danger",
};

interface StudentLite {
  id: string;
  name: string;
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

export default function DriverPaymentsScreen() {
  const user = useAuthStore((s) => s.user);
  const { data: students } = useStudentOptions();
  const record = useRecordPayment();
  const {
    data: myPayments,
    isLoading,
    refetch,
    isRefetching,
  } = usePayments({ limit: 50 });

  const [studentId, setStudentId] = useState<string | null>(null);
  const [amount, setAmount] = useState("");
  const [mode, setMode] = useState<string | null>("cash");
  const [forMonth, setForMonth] = useState("");
  const [notes, setNotes] = useState("");

  const studentOptions: SelectOption[] = useMemo(
    () => (students ?? []).map((s) => ({ value: s.id, label: s.name })),
    [students],
  );

  const parsedAmount = Number(amount);
  const canSubmit =
    !!studentId && parsedAmount > 0 && (mode === "cash" || mode === "transfer");

  const submit = () => {
    if (!canSubmit || !studentId) return;
    record.mutate(
      {
        studentId,
        amount: parsedAmount,
        mode: mode as "cash" | "transfer",
        forMonth: forMonth.trim() || undefined,
        notes: notes.trim() || undefined,
      },
      {
        onSuccess: () => {
          setStudentId(null);
          setAmount("");
          setMode("cash");
          setForMonth("");
          setNotes("");
        },
      },
    );
  };

  const payments = myPayments?.data ?? [];

  return (
    <Screen
      overline="Finance"
      title="Collect payment"
      subtitle={`Record an offline collection${user?.fullName ? ` · ${user.fullName}` : ""}`}
      refreshing={isRefetching}
      onRefresh={refetch}
    >
      <Card style={{ marginBottom: 24 }}>
        <VStack gap={16}>
          {record.isError && (
            <Text variant="caption" tone="danger">
              {apiErrorMessage(record.error)}
            </Text>
          )}
          {record.isSuccess && (
            <Text variant="caption" tone="success">
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

          <TextField
            label="Amount"
            leading={
              <IndianRupee size={18} color="#64748B" strokeWidth={1.8} />
            }
            value={amount}
            onChangeText={setAmount}
            keyboardType="numeric"
            placeholder="0"
          />

          <Select
            label="Mode"
            value={mode}
            options={[
              { value: "cash", label: "Cash" },
              { value: "transfer", label: "Bank transfer" },
            ]}
            onChange={setMode}
          />

          <TextField
            label="For month (optional)"
            value={forMonth}
            onChangeText={setForMonth}
            placeholder="YYYY-MM"
            autoCapitalize="none"
          />

          <TextField
            label="Notes (optional)"
            value={notes}
            onChangeText={setNotes}
            placeholder="Any reference or note"
          />

          <Button
            label="Record payment"
            loading={record.isPending}
            disabled={!canSubmit}
            onPress={submit}
          />
        </VStack>
      </Card>

      <Text variant="h3" tone="primary" style={{ marginBottom: 12 }}>
        Recent collections
      </Text>
      {payments.length === 0 ? (
        <EmptyState
          icon={ReceiptIndianRupee}
          title={isLoading ? "Loading…" : "No collections yet"}
          message="Payments you record will appear here with their status."
        />
      ) : (
        <VStack gap={12}>
          {payments.map((p) => (
            <RecordedRow key={p.id} payment={p} />
          ))}
        </VStack>
      )}
    </Screen>
  );
}

function RecordedRow({ payment }: { payment: Payment }) {
  return (
    <Card>
      <HStack align="center" justify="space-between">
        <HStack gap={12} align="center" flex={1}>
          <View style={iconWrap}>
            <Wallet size={18} color="#0E7C7B" strokeWidth={2} />
          </View>
          <VStack gap={2} flex={1}>
            <Text variant="label-lg" tone="primary">
              {money(payment.amount)}
            </Text>
            <Text variant="body-sm" tone="tertiary">
              {payment.mode === "cash" ? "Cash" : "Transfer"}
              {payment.forMonth ? ` · ${payment.forMonth}` : ""}
            </Text>
          </VStack>
        </HStack>
        <StatusChip label={payment.status} tone={STATUS_TONE[payment.status]} />
      </HStack>
    </Card>
  );
}

const iconWrap = {
  width: 40,
  height: 40,
  borderRadius: 12,
  backgroundColor: "#ECFBF9",
  alignItems: "center" as const,
  justifyContent: "center" as const,
};
