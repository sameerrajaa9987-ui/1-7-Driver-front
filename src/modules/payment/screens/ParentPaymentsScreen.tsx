/**
 * ParentPaymentsScreen — "Fees & Payments" (client mockup): an Overview /
 * Transactions segmented control; Overview shows Paid/Pending summary cards, a
 * "This Month Fee" card per child with Due Date + Pay Now, and Recent
 * Transactions (with View All). Transactions shows the full history.
 */
import React, { useState } from "react";
import { View, Pressable, StyleSheet } from "react-native";
import { useQuery } from "@tanstack/react-query";
import {
  ReceiptIndianRupee,
  ReceiptText,
  ShieldCheck,
  Clock,
  CreditCard,
  CheckCircle2,
  XCircle,
  CalendarDays,
} from "lucide-react-native";
import { apiClient, apiErrorMessage } from "@api/apiClient";
import {
  usePayments,
  useProrationPreview,
  useCreateOnlineOrder,
  useConfirmTestPayment,
} from "@modules/payment/hooks/usePayments";
import { Payment, PaymentStatus } from "@modules/payment/types";
import { palette, radius, tints, accent } from "@shared/designSystem";
import {
  Screen,
  Text,
  VStack,
  HStack,
  Card,
  Button,
  EmptyState,
  HeaderIconButton,
} from "@shared/ui";

const money = (n: number) => `₹${Number(n || 0).toLocaleString("en-IN")}`;

function currentMonth(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}
function monthName(ym: string): string {
  const [y, m] = ym.split("-").map(Number);
  if (!y || !m) return ym;
  return new Date(y, m - 1, 1).toLocaleString("en-US", { month: "long" });
}
function dueLabel(day: number, ym: string): string {
  const [y, m] = ym.split("-").map(Number);
  const d = new Date(y, (m || 1) - 1, Math.max(1, day || 5));
  return d.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

const STATUS_LABEL: Record<PaymentStatus, string> = {
  pending: "Pending",
  verified: "Paid",
  rejected: "Rejected",
};

interface StudentLite {
  id: string;
  name: string;
  monthlyFee?: number;
  dueDate?: number;
}

function useMyChildren() {
  return useQuery({
    queryKey: ["students", "my-children"],
    queryFn: async () => {
      const res = await apiClient.get<{
        success: boolean;
        data: StudentLite[];
      }>("/students", { params: { limit: 50 } });
      return res.data.data;
    },
  });
}

export default function ParentPaymentsScreen() {
  const [tab, setTab] = useState<"overview" | "transactions">("overview");
  const { data, isLoading, refetch, isRefetching } = usePayments({ limit: 50 });
  const { data: children } = useMyChildren();
  const payments = data?.data ?? [];

  const thisMonth = currentMonth();
  const paidThisMonth = payments
    .filter((p) => p.status === "verified" && p.forMonth === thisMonth)
    .reduce((s, p) => s + (p.amount || 0), 0);
  const pending = payments
    .filter((p) => p.status === "pending")
    .reduce((s, p) => s + (p.amount || 0), 0);

  const recent = payments.slice(0, 3);

  return (
    <Screen
      title="Fees & Payments"
      right={
        <HeaderIconButton
          icon={ReceiptText}
          onPress={() => setTab("transactions")}
        />
      }
      refreshing={isRefetching}
      onRefresh={refetch}
    >
      {/* Segmented control */}
      <View style={styles.segment}>
        {(["overview", "transactions"] as const).map((k) => {
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
                {k === "overview" ? "Overview" : "Transactions"}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {tab === "overview" ? (
        <>
          {/* Paid / Pending */}
          <HStack gap={12} style={{ marginTop: 16 }}>
            <View style={[styles.summary, { backgroundColor: tints.green.bg }]}>
              <Text variant="h2" style={{ color: tints.green.fg }}>
                {money(paidThisMonth)}
              </Text>
              <Text variant="body-sm" style={{ color: tints.green.fg }}>
                Paid (This Month)
              </Text>
            </View>
            <View style={[styles.summary, { backgroundColor: tints.amber.bg }]}>
              <Text variant="h2" style={{ color: tints.amber.fg }}>
                {money(pending)}
              </Text>
              <Text variant="body-sm" style={{ color: tints.amber.fg }}>
                Pending
              </Text>
            </View>
          </HStack>

          {/* This Month Fee per child */}
          <VStack gap={12} style={{ marginTop: 16 }}>
            {(children ?? []).map((c) => (
              <PayOnlineCard key={c.id} child={c} />
            ))}
          </VStack>

          {/* Recent Transactions + View All */}
          <HStack
            align="center"
            justify="space-between"
            style={{ marginTop: 26, marginBottom: 12 }}
          >
            <Text variant="h3" tone="primary">
              Recent Transactions
            </Text>
            {payments.length > 3 ? (
              <Pressable onPress={() => setTab("transactions")}>
                <Text
                  variant="label"
                  weight="700"
                  style={{ color: accent.main }}
                >
                  View All
                </Text>
              </Pressable>
            ) : null}
          </HStack>
          {recent.length === 0 ? (
            <EmptyState
              icon={ReceiptIndianRupee}
              title={isLoading ? "Loading…" : "No payments yet"}
              message="Your fee payments and receipts will appear here."
            />
          ) : (
            <VStack gap={10}>
              {recent.map((p) => (
                <TransactionRow key={p.id} payment={p} />
              ))}
            </VStack>
          )}
        </>
      ) : (
        <View style={{ marginTop: 16 }}>
          {payments.length === 0 ? (
            <EmptyState
              icon={ReceiptIndianRupee}
              title={isLoading ? "Loading…" : "No payments yet"}
              message="Your fee payments and receipts will appear here."
            />
          ) : (
            <VStack gap={10}>
              {payments.map((p) => (
                <TransactionRow key={p.id} payment={p} />
              ))}
            </VStack>
          )}
        </View>
      )}
    </Screen>
  );
}

function PayOnlineCard({ child }: { child: StudentLite }) {
  const forMonth = currentMonth();
  const { data: preview } = useProrationPreview(child.id, forMonth);
  const createOrder = useCreateOnlineOrder();
  const confirmTest = useConfirmTestPayment();
  const [receipt, setReceipt] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const busy = createOrder.isPending || confirmTest.isPending;

  const pay = () => {
    setError(null);
    createOrder.mutate(
      { studentId: child.id, forMonth },
      {
        onSuccess: (order) => {
          if (order.testMode) {
            confirmTest.mutate(
              { orderId: order.orderId },
              {
                onSuccess: (payment) =>
                  setReceipt(payment.receiptNumber || "confirmed"),
                onError: (e) => setError(apiErrorMessage(e)),
              },
            );
          } else {
            setError("Online checkout is not available in this build.");
          }
        },
        onError: (e) => setError(apiErrorMessage(e)),
      },
    );
  };

  if (receipt) {
    return (
      <Card
        style={{
          backgroundColor: tints.green.bg,
          borderColor: tints.green.ring,
        }}
      >
        <HStack gap={8} align="center">
          <CheckCircle2 size={18} color={tints.green.icon} strokeWidth={2.2} />
          <Text variant="body-sm" style={{ color: tints.green.fg, flex: 1 }}>
            {child.name}&apos;s {monthName(forMonth)} fee is paid · Receipt{" "}
            {receipt}
          </Text>
        </HStack>
      </Card>
    );
  }

  const amount = preview?.amount ?? child.monthlyFee;
  return (
    <Card>
      <HStack align="center" justify="space-between">
        <VStack gap={2} flex={1}>
          <Text variant="body-sm" tone="tertiary">
            This Month Fee · {child.name}
          </Text>
          <Text variant="h2" tone="primary">
            {amount != null ? money(amount) : "—"}
          </Text>
        </VStack>
        <VStack gap={2} align="flex-end">
          <Text variant="caption" tone="tertiary">
            Due Date
          </Text>
          <HStack gap={5} align="center">
            <CalendarDays
              size={13}
              color={palette.text.tertiary}
              strokeWidth={2}
            />
            <Text variant="label" weight="600" tone="primary">
              {dueLabel(child.dueDate ?? 5, forMonth)}
            </Text>
          </HStack>
        </VStack>
      </HStack>
      {error ? (
        <Text variant="body-sm" tone="danger" style={{ marginTop: 8 }}>
          {error}
        </Text>
      ) : null}
      <Button
        label="Pay Now"
        loading={busy}
        icon={<CreditCard size={16} color="#FFFFFF" strokeWidth={2} />}
        onPress={pay}
        style={{ marginTop: 14 }}
      />
    </Card>
  );
}

function TransactionRow({ payment }: { payment: Payment }) {
  const t =
    payment.status === "verified"
      ? tints.green
      : payment.status === "pending"
        ? tints.amber
        : tints.red;
  const Icon =
    payment.status === "verified"
      ? CheckCircle2
      : payment.status === "pending"
        ? Clock
        : XCircle;
  const dateStr = payment.paidAt
    ? new Date(payment.paidAt).toLocaleString("en-IN", {
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      })
    : payment.forMonth
      ? monthName(payment.forMonth)
      : "";

  return (
    <Card>
      <HStack gap={12} align="center">
        <View style={[styles.txIcon, { backgroundColor: t.bg }]}>
          <Icon size={17} color={t.icon} strokeWidth={2.1} />
        </View>
        <VStack gap={2} flex={1}>
          <Text variant="label-lg" tone="primary">
            {payment.mode === "cash"
              ? "Cash Payment"
              : payment.mode === "online"
                ? "Online Payment"
                : "Bank Transfer"}
          </Text>
          <Text variant="body-sm" weight="600" style={{ color: t.fg }}>
            {STATUS_LABEL[payment.status]}
          </Text>
        </VStack>
        <VStack gap={2} align="flex-end">
          <Text variant="label-lg" weight="700" tone="primary">
            {money(payment.amount)}
          </Text>
          <Text variant="caption" tone="tertiary" numberOfLines={1}>
            {dateStr}
          </Text>
        </VStack>
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
  summary: {
    flex: 1,
    borderRadius: radius.lg,
    padding: 16,
  },
  txIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
  },
});
