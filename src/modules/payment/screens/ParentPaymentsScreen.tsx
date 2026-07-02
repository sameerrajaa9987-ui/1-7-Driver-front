import React, { useState } from "react";
import { View } from "react-native";
import { useQuery } from "@tanstack/react-query";
import {
  ReceiptIndianRupee,
  ShieldCheck,
  Clock,
  CreditCard,
  CheckCircle2,
} from "lucide-react-native";
import { apiClient, apiErrorMessage } from "@api/apiClient";
import {
  usePayments,
  useProrationPreview,
  useCreateOnlineOrder,
  useConfirmTestPayment,
} from "@modules/payment/hooks/usePayments";
import { Payment, PaymentStatus } from "@modules/payment/types";
import { palette, tints } from "@shared/designSystem";
import {
  Screen,
  Text,
  VStack,
  HStack,
  Card,
  Button,
  StatTile,
  StatusChip,
  GradientHero,
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

const STATUS_TONE: Record<PaymentStatus, "warning" | "success" | "danger"> = {
  pending: "warning",
  verified: "success",
  rejected: "danger",
};

const STATUS_LABEL: Record<PaymentStatus, string> = {
  pending: "Awaiting verification",
  verified: "Verified",
  rejected: "Rejected",
};

interface StudentLite {
  id: string;
  name: string;
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
      overline="Fees"
      title="Payments"
      subtitle="Your child's transport fee history"
      refreshing={isRefetching}
      onRefresh={refetch}
    >
      <GradientHero variant="cobalt">
        <VStack gap={8}>
          <StatusChip label="Online payment · Razorpay" tone="info" />
          <HStack gap={10} align="center">
            <CreditCard size={22} color="#FFFFFF" strokeWidth={2} />
            <Text variant="h3" tone="inverse">
              Pay online via Razorpay
            </Text>
          </HStack>
          <Text variant="body-sm" style={{ color: "rgba(255,255,255,0.86)" }}>
            Pay this month's transport fee in one tap. Your receipt appears
            below the moment the payment is confirmed.
          </Text>
        </VStack>
      </GradientHero>

      {(children ?? []).length > 0 ? (
        <VStack gap={12} style={{ marginTop: 20 }}>
          {(children ?? []).map((c) => (
            <PayOnlineCard key={c.id} studentId={c.id} childName={c.name} />
          ))}
        </VStack>
      ) : null}

      <View
        style={{
          flexDirection: "row",
          flexWrap: "wrap",
          marginTop: 20,
          marginHorizontal: -6,
        }}
      >
        <View style={{ width: "50%", padding: 6 }}>
          <StatTile
            label="Paid (verified)"
            value={money(paid)}
            icon={ShieldCheck}
            tone="teal"
          />
        </View>
        <View style={{ width: "50%", padding: 6 }}>
          <StatTile
            label="Pending"
            value={money(pending)}
            icon={Clock}
            tone="light"
          />
        </View>
      </View>

      <Text
        variant="h3"
        tone="primary"
        style={{ marginTop: 28, marginBottom: 12 }}
      >
        Payment history
      </Text>
      {payments.length === 0 ? (
        <EmptyState
          icon={ReceiptIndianRupee}
          title={isLoading ? "Loading…" : "No payments yet"}
          message="Your fee payments and receipts will appear here."
        />
      ) : (
        <VStack gap={12}>
          {payments.map((p) => (
            <ParentPaymentCard key={p.id} payment={p} />
          ))}
        </VStack>
      )}
    </Screen>
  );
}

function PayOnlineCard({
  studentId,
  childName,
}: {
  studentId: string;
  childName: string;
}) {
  const forMonth = currentMonth();
  const { data: preview } = useProrationPreview(studentId, forMonth);
  const createOrder = useCreateOnlineOrder();
  const confirmTest = useConfirmTestPayment();
  const [receipt, setReceipt] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const busy = createOrder.isPending || confirmTest.isPending;

  const pay = () => {
    setError(null);
    createOrder.mutate(
      { studentId, forMonth },
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
            {childName}'s fee for {monthName(forMonth)} is paid via Razorpay.
          </Text>
          <Text variant="body-sm" style={{ color: tints.green.fg }}>
            Receipt {receipt}
          </Text>
        </VStack>
      </Card>
    );
  }

  const amount = preview?.amount;

  return (
    <Card>
      <VStack gap={12}>
        <HStack align="center" justify="space-between">
          <VStack gap={2} flex={1}>
            <Text variant="label-lg" tone="primary" numberOfLines={1}>
              {childName}
            </Text>
            <Text variant="body-sm" tone="tertiary">
              {monthName(forMonth)} transport fee
              {preview?.prorated ? " · prorated" : ""}
            </Text>
          </VStack>
          {amount != null ? (
            <Text variant="h3" tone="primary">
              {money(amount)}
            </Text>
          ) : null}
        </HStack>
        {error ? (
          <Text variant="body-sm" tone="danger">
            {error}
          </Text>
        ) : null}
        <Button
          label={
            amount != null
              ? `Pay ${money(amount)} for ${monthName(forMonth)}`
              : "Pay this month online"
          }
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

function ParentPaymentCard({ payment }: { payment: Payment }) {
  return (
    <Card>
      <VStack gap={10}>
        <HStack align="center" justify="space-between">
          <VStack gap={3} flex={1}>
            <Text variant="h3" tone="primary">
              {money(payment.amount)}
            </Text>
            <Text variant="body-sm" tone="tertiary">
              {payment.mode === "cash"
                ? "Cash"
                : payment.mode === "online"
                  ? "Online · Razorpay"
                  : "Transfer"}
              {payment.forMonth ? ` · ${payment.forMonth}` : ""}
            </Text>
          </VStack>
          <StatusChip
            label={STATUS_LABEL[payment.status]}
            tone={STATUS_TONE[payment.status]}
          />
        </HStack>
        {payment.status === "verified" && payment.receiptNumber ? (
          <HStack gap={6} align="center">
            <ReceiptIndianRupee
              size={14}
              color={palette.text.tertiary}
              strokeWidth={1.9}
            />
            <Text variant="body-sm" tone="secondary">
              Receipt {payment.receiptNumber}
            </Text>
          </HStack>
        ) : null}
      </VStack>
    </Card>
  );
}
