/**
 * ParentPaymentsScreen — client-kit Fees screen: Paid (green) / Pending
 * (orange) summary cards, a "This Month Fee" card per child with Due Date and
 * a violet Pay Now button, then Recent Transactions as icon-tile rows.
 */
import React, { useState } from "react";
import { View, StyleSheet } from "react-native";
import { useQuery } from "@tanstack/react-query";
import {
  ReceiptIndianRupee,
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
import { palette, radius, tints, accentFor } from "@shared/designSystem";
import {
  Screen,
  Text,
  VStack,
  HStack,
  Card,
  Button,
  StatusChip,
  EmptyState,
} from "@shared/ui";

const money = (n: number) => `₹${Number(n || 0).toLocaleString("en-IN")}`;

/** Current month as YYYY-MM (local). */
function currentMonth(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

/** "2026-08" → "August" for friendly copy. */
function monthName(ym: string): string {
  const [y, m] = ym.split("-").map(Number);
  if (!y || !m) return ym;
  return new Date(y, m - 1, 1).toLocaleString("en-US", { month: "long" });
}

/** Due date like "5 Aug" from the student's due day-of-month. */
function dueLabel(day: number, ym: string): string {
  const [y, m] = ym.split("-").map(Number);
  const d = new Date(y, (m || 1) - 1, Math.max(1, day || 5));
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

const STATUS_TONE: Record<PaymentStatus, "warning" | "success" | "danger"> = {
  pending: "warning",
  verified: "success",
  rejected: "danger",
};

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

/** The parent's own children (the API scopes /students to the parent). */
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
  const accent = accentFor("parent");
  const { data, isLoading, refetch, isRefetching } = usePayments({ limit: 50 });
  const { data: children } = useMyChildren();
  const payments = data?.data ?? [];

  const paid = payments
    .filter((p) => p.status === "verified")
    .reduce((sum, p) => sum + (p.amount || 0), 0);
  const pending = payments
    .filter((p) => p.status === "pending")
    .reduce((sum, p) => sum + (p.amount || 0), 0);

  return (
    <Screen
      title="Fees & Payments"
      refreshing={isRefetching}
      onRefresh={refetch}
    >
      {/* Paid / Pending summary — soft green + orange cards per the kit */}
      <HStack gap={12}>
        <View style={[styles.summary, { backgroundColor: tints.green.bg }]}>
          <View style={[styles.summaryIcon, { backgroundColor: "#FFFFFF" }]}>
            <ShieldCheck size={16} color={tints.green.icon} strokeWidth={2.1} />
          </View>
          <Text variant="h3" style={{ color: tints.green.fg, marginTop: 10 }}>
            {money(paid)}
          </Text>
          <Text variant="body-sm" style={{ color: tints.green.fg }}>
            Paid
          </Text>
        </View>
        <View style={[styles.summary, { backgroundColor: tints.amber.bg }]}>
          <View style={[styles.summaryIcon, { backgroundColor: "#FFFFFF" }]}>
            <Clock size={16} color={tints.amber.icon} strokeWidth={2.1} />
          </View>
          <Text variant="h3" style={{ color: tints.amber.fg, marginTop: 10 }}>
            {money(pending)}
          </Text>
          <Text variant="body-sm" style={{ color: tints.amber.fg }}>
            Pending
          </Text>
        </View>
      </HStack>

      {/* This-month fee card per child, violet Pay Now */}
      {(children ?? []).length > 0 ? (
        <VStack gap={12} style={{ marginTop: 16 }}>
          {(children ?? []).map((c) => (
            <PayOnlineCard key={c.id} child={c} accent={accent} />
          ))}
        </VStack>
      ) : null}

      <Text
        variant="h3"
        tone="primary"
        style={{ marginTop: 24, marginBottom: 12 }}
      >
        Recent Transactions
      </Text>
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
    </Screen>
  );
}

function PayOnlineCard({
  child,
  accent,
}: {
  child: StudentLite;
  accent: ReturnType<typeof accentFor>;
}) {
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
          // In dev testMode is true (no real Razorpay keys), so we confirm the
          // order immediately via the test endpoint. If testMode were false we
          // would open Razorpay Checkout with order.keyId / order.orderId here
          // and confirm on the checkout success callback instead.
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
        <VStack gap={8}>
          <HStack gap={8} align="center">
            <CheckCircle2
              size={18}
              color={tints.green.icon}
              strokeWidth={2.2}
            />
            <Text variant="label-lg" style={{ color: tints.green.fg }}>
              Payment successful
            </Text>
          </HStack>
          <Text variant="body-sm" style={{ color: tints.green.fg }}>
            {child.name}&apos;s fee for {monthName(forMonth)} is paid via
            Razorpay · Receipt {receipt}
          </Text>
        </VStack>
      </Card>
    );
  }

  const amount = preview?.amount ?? child.monthlyFee;

  return (
    <Card>
      <VStack gap={12}>
        <HStack align="center" justify="space-between">
          <VStack gap={2} flex={1}>
            <Text variant="body-sm" tone="tertiary">
              This Month Fee · {child.name}
            </Text>
            <Text variant="h2" tone="primary">
              {amount != null ? money(amount) : "—"}
            </Text>
          </VStack>
          <HStack gap={6} align="center">
            <CalendarDays
              size={14}
              color={palette.text.tertiary}
              strokeWidth={2}
            />
            <Text variant="body-sm" tone="tertiary">
              Due {dueLabel(child.dueDate ?? 5, forMonth)}
            </Text>
          </HStack>
        </HStack>
        {error ? (
          <Text variant="body-sm" tone="danger">
            {error}
          </Text>
        ) : null}
        <Button
          label="Pay Now"
          tint={accent.main}
          icon={<CreditCard size={16} color="#FFFFFF" strokeWidth={2} />}
          loading={busy}
          onPress={pay}
        />
        <Text variant="caption" tone="tertiary" align="center">
          Secured online payment via Razorpay
        </Text>
      </VStack>
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

  return (
    <Card>
      <HStack gap={12} align="center">
        <View style={[styles.txIcon, { backgroundColor: t.bg }]}>
          <Icon size={17} color={t.icon} strokeWidth={2.1} />
        </View>
        <VStack gap={2} flex={1}>
          <Text variant="label-lg" tone="primary">
            {money(payment.amount)}
          </Text>
          <Text variant="body-sm" tone="tertiary" numberOfLines={1}>
            {payment.mode === "cash"
              ? "Cash"
              : payment.mode === "online"
                ? "Online · Razorpay"
                : "Transfer"}
            {payment.forMonth ? ` · ${monthName(payment.forMonth)}` : ""}
            {payment.status === "verified" && payment.receiptNumber
              ? ` · ${payment.receiptNumber}`
              : ""}
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
  summary: {
    flex: 1,
    borderRadius: radius.lg,
    padding: 14,
  },
  summaryIcon: {
    width: 30,
    height: 30,
    borderRadius: radius.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  txIcon: {
    width: 38,
    height: 38,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
  },
});
