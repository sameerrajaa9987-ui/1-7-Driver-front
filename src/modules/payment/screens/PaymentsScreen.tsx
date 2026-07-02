import React, { useState } from "react";
import { View } from "react-native";
import {
  ReceiptIndianRupee,
  Wallet,
  CheckCircle2,
  XCircle,
  User,
} from "lucide-react-native";
import {
  usePayments,
  useLedger,
  useVerifyPayment,
  useRejectPayment,
} from "@modules/payment/hooks/usePayments";
import { Payment, PaymentStatus } from "@modules/payment/types";
import { apiErrorMessage } from "@api/apiClient";
import { palette } from "@shared/designSystem";
import {
  Screen,
  Text,
  VStack,
  HStack,
  Card,
  Button,
  StatusChip,
  ChipsRow,
  EmptyState,
} from "@shared/ui";

const money = (n: number) => `₹${Number(n || 0).toLocaleString("en-IN")}`;

const STATUS_TONE: Record<PaymentStatus, "warning" | "success" | "danger"> = {
  pending: "warning",
  verified: "success",
  rejected: "danger",
};

const STATUS_FILTERS: { key: "all" | PaymentStatus; label: string }[] = [
  { key: "all", label: "All" },
  { key: "pending", label: "Pending" },
  { key: "verified", label: "Verified" },
  { key: "rejected", label: "Rejected" },
];

export default function PaymentsScreen() {
  const [status, setStatus] = useState<"all" | PaymentStatus>("all");

  const {
    data: pendingData,
    isLoading: pendingLoading,
    refetch: refetchPending,
    isRefetching: pendingRefetching,
  } = usePayments({ status: "pending", limit: 50 });

  const {
    data: listData,
    isLoading: listLoading,
    refetch: refetchList,
  } = usePayments(status === "all" ? { limit: 50 } : { status, limit: 50 });

  const {
    data: ledger,
    isLoading: ledgerLoading,
    refetch: refetchLedger,
  } = useLedger();

  const verify = useVerifyPayment();
  const reject = useRejectPayment();

  const pending = pendingData?.data ?? [];
  const list = listData?.data ?? [];

  const refetch = () => {
    refetchPending();
    refetchList();
    refetchLedger();
  };

  return (
    <Screen
      overline="Finance"
      title="Payments"
      subtitle="Verify collections and reconcile driver cash"
      refreshing={pendingRefetching}
      onRefresh={refetch}
    >
      {(verify.isError || reject.isError) && (
        <Card style={{ marginBottom: 16 }}>
          <Text variant="body-sm" tone="danger">
            {apiErrorMessage(verify.error || reject.error)}
          </Text>
        </Card>
      )}

      {/* Pending verification */}
      <Text variant="h3" tone="primary" style={{ marginBottom: 12 }}>
        Pending verification
      </Text>
      {pending.length === 0 ? (
        <EmptyState
          icon={CheckCircle2}
          title={pendingLoading ? "Loading…" : "All caught up"}
          message="No payments are waiting to be verified right now."
        />
      ) : (
        <VStack gap={12}>
          {pending.map((p) => (
            <PendingRow
              key={p.id}
              payment={p}
              onVerify={() => verify.mutate(p.id)}
              onReject={() => reject.mutate({ id: p.id })}
              busy={verify.isPending || reject.isPending}
            />
          ))}
        </VStack>
      )}

      {/* Driver cash ledger */}
      <Text
        variant="h3"
        tone="primary"
        style={{ marginTop: 28, marginBottom: 12 }}
      >
        Driver cash ledger
      </Text>
      {ledger && ledger.length > 0 ? (
        <VStack gap={12}>
          {ledger.map((row, i) => (
            <Card key={row.driverUserId ?? `row-${i}`}>
              <HStack align="center" justify="space-between">
                <HStack gap={12} align="center" flex={1}>
                  <View style={iconWrap}>
                    <Wallet
                      size={18}
                      color={palette.teal[600]}
                      strokeWidth={2}
                    />
                  </View>
                  <VStack gap={2} flex={1}>
                    <Text variant="label-lg" tone="primary" numberOfLines={1}>
                      {row.driverName || "Unassigned"}
                    </Text>
                    <Text variant="body-sm" tone="tertiary">
                      {row.payments} pending{" "}
                      {row.payments === 1 ? "collection" : "collections"}
                    </Text>
                  </VStack>
                </HStack>
                <Text variant="h3" tone="primary">
                  {money(row.amountHeld)}
                </Text>
              </HStack>
            </Card>
          ))}
        </VStack>
      ) : (
        <EmptyState
          icon={Wallet}
          title={ledgerLoading ? "Loading…" : "No cash held"}
          message="Drivers have no unreconciled cash collections."
        />
      )}

      {/* All payments (filterable) */}
      <Text
        variant="h3"
        tone="primary"
        style={{ marginTop: 28, marginBottom: 12 }}
      >
        All payments
      </Text>
      <ChipsRow
        chips={STATUS_FILTERS.map((f) => ({ key: f.key, label: f.label }))}
        active={status}
        onChange={(key) => setStatus(key as "all" | PaymentStatus)}
      />
      {list.length === 0 ? (
        <EmptyState
          icon={ReceiptIndianRupee}
          title={listLoading ? "Loading…" : "No payments"}
          message="Payments will appear here as they are recorded."
        />
      ) : (
        <VStack gap={12} style={{ marginTop: 12 }}>
          {list.map((p) => (
            <PaymentCard key={p.id} payment={p} />
          ))}
        </VStack>
      )}
    </Screen>
  );
}

function PendingRow({
  payment,
  onVerify,
  onReject,
  busy,
}: {
  payment: Payment;
  onVerify: () => void;
  onReject: () => void;
  busy: boolean;
}) {
  return (
    <Card elevation="raised">
      <VStack gap={12}>
        <HStack align="center" justify="space-between">
          <VStack gap={3} flex={1}>
            <Text variant="h3" tone="primary">
              {money(payment.amount)}
            </Text>
            <HStack gap={6} align="center">
              <User size={13} color={palette.text.tertiary} strokeWidth={1.9} />
              <Text variant="body-sm" tone="tertiary">
                {payment.receivedByName
                  ? `Collected by ${payment.receivedByName}`
                  : "Collected offline"}
                {payment.receivedByRole ? ` · ${payment.receivedByRole}` : ""}
              </Text>
            </HStack>
          </VStack>
          <StatusChip
            label={payment.mode === "cash" ? "Cash" : "Transfer"}
            tone="neutral"
          />
        </HStack>
        {payment.forMonth ? (
          <Text variant="body-sm" tone="tertiary">
            For {payment.forMonth}
          </Text>
        ) : null}
        {payment.notes ? (
          <Text variant="body-sm" tone="secondary">
            {payment.notes}
          </Text>
        ) : null}
        <HStack gap={10}>
          <View style={{ flex: 1 }}>
            <Button
              label="Verify"
              icon={<CheckCircle2 size={18} color="#FFFFFF" strokeWidth={2} />}
              loading={busy}
              onPress={onVerify}
            />
          </View>
          <View style={{ flex: 1 }}>
            <Button
              label="Reject"
              variant="destructive"
              icon={<XCircle size={18} color="#FFFFFF" strokeWidth={2} />}
              disabled={busy}
              onPress={onReject}
            />
          </View>
        </HStack>
      </VStack>
    </Card>
  );
}

function PaymentCard({ payment }: { payment: Payment }) {
  return (
    <Card>
      <HStack align="center" justify="space-between">
        <VStack gap={3} flex={1}>
          <Text variant="label-lg" tone="primary">
            {money(payment.amount)}
          </Text>
          <Text variant="body-sm" tone="tertiary">
            {payment.mode === "cash" ? "Cash" : "Transfer"}
            {payment.receivedByName ? ` · ${payment.receivedByName}` : ""}
            {payment.receiptNumber ? ` · ${payment.receiptNumber}` : ""}
          </Text>
        </VStack>
        <StatusChip label={payment.status} tone={STATUS_TONE[payment.status]} />
      </HStack>
    </Card>
  );
}

const iconWrap = {
  width: 40,
  height: 40,
  borderRadius: 12,
  backgroundColor: palette.teal[50],
  alignItems: "center" as const,
  justifyContent: "center" as const,
};
