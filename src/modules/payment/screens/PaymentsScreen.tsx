/**
 * PaymentsScreen — operator "Fees & Payments" (client mockup): an Overview /
 * Cash Ledger segmented control. Overview shows Collected / Pending headline
 * cards and a recent-transactions feed; Cash Ledger holds the verify/reject
 * queue and each driver's unreconciled cash.
 */
import React, { useMemo, useState } from "react";
import { View, Pressable, StyleSheet } from "react-native";
import {
  ReceiptIndianRupee,
  Wallet,
  CheckCircle2,
  XCircle,
  User,
  Banknote,
  Smartphone,
} from "lucide-react-native";
import {
  usePayments,
  useLedger,
  useVerifyPayment,
  useRejectPayment,
} from "@modules/payment/hooks/usePayments";
import { useDashboardSummary } from "@modules/dashboard/hooks/useDashboard";
import { Payment, PaymentStatus } from "@modules/payment/types";
import { apiErrorMessage } from "@api/apiClient";
import { palette, radius, tints, accent } from "@shared/designSystem";
import {
  Screen,
  Text,
  VStack,
  HStack,
  Card,
  Avatar,
  Button,
  StatusChip,
  EmptyState,
} from "@shared/ui";

const money = (n: number) => `₹${Number(n || 0).toLocaleString("en-IN")}`;

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

export default function PaymentsScreen() {
  const [tab, setTab] = useState<"overview" | "ledger">("overview");

  const summary = useDashboardSummary();
  const finance = summary.data?.finance;

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
  } = usePayments({ limit: 50 });

  const {
    data: ledger,
    isLoading: ledgerLoading,
    refetch: refetchLedger,
  } = useLedger();

  const verify = useVerifyPayment();
  const reject = useRejectPayment();

  const pending = pendingData?.data ?? [];
  const transactions = useMemo(
    () =>
      [...(listData?.data ?? [])]
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        )
        .slice(0, 8),
    [listData],
  );

  const refetch = () => {
    summary.refetch();
    refetchPending();
    refetchList();
    refetchLedger();
  };

  return (
    <Screen
      title="Fees & Payments"
      refreshing={pendingRefetching}
      onRefresh={refetch}
    >
      {/* Segmented control */}
      <View style={styles.segment}>
        {(["overview", "ledger"] as const).map((k) => {
          const active = tab === k;
          return (
            <Pressable
              key={k}
              onPress={() => setTab(k)}
              style={[
                styles.segBtn,
                active && { backgroundColor: accent.main },
              ]}
            >
              <Text
                variant="label"
                weight="700"
                style={{ color: active ? "#FFFFFF" : palette.text.secondary }}
              >
                {k === "overview" ? "Overview" : "Cash Ledger"}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {(verify.isError || reject.isError) && (
        <Card style={{ marginTop: 16 }}>
          <Text variant="body-sm" tone="danger">
            {apiErrorMessage(verify.error || reject.error)}
          </Text>
        </Card>
      )}

      {tab === "overview" ? (
        <>
          {/* Headline cards */}
          <HStack gap={12} style={{ marginTop: 16 }}>
            <View
              style={[styles.headCard, { backgroundColor: tints.green.bg }]}
            >
              <Text variant="h2" style={{ color: tints.green.fg }}>
                {money(finance?.totalCollected ?? 0)}
              </Text>
              <Text variant="body-sm" style={{ color: tints.green.fg }}>
                Collected
              </Text>
              <Text
                variant="caption"
                style={{ color: tints.green.fg, opacity: 0.8 }}
              >
                This Month
              </Text>
            </View>
            <View
              style={[styles.headCard, { backgroundColor: tints.amber.bg }]}
            >
              <Text variant="h2" style={{ color: tints.amber.fg }}>
                {money(finance?.pending ?? 0)}
              </Text>
              <Text variant="body-sm" style={{ color: tints.amber.fg }}>
                Pending
              </Text>
              <Text
                variant="caption"
                style={{ color: tints.amber.fg, opacity: 0.8 }}
              >
                Verification
              </Text>
            </View>
          </HStack>

          {/* Recent transactions */}
          <HStack
            align="center"
            justify="space-between"
            style={{ marginTop: 26, marginBottom: 12 }}
          >
            <Text variant="h3" tone="primary">
              Recent Transactions
            </Text>
            {pending.length > 0 ? (
              <Pressable onPress={() => setTab("ledger")} hitSlop={8}>
                <Text variant="label" weight="600" tone="accent">
                  View All
                </Text>
              </Pressable>
            ) : null}
          </HStack>

          {transactions.length === 0 ? (
            <EmptyState
              icon={ReceiptIndianRupee}
              title={listLoading ? "Loading…" : "No transactions yet"}
              message="Payments will appear here as they are recorded."
            />
          ) : (
            <Card padded={false} style={{ paddingVertical: 4 }}>
              {transactions.map((p, i) => (
                <View key={p.id}>
                  {i > 0 ? <View style={styles.divider} /> : null}
                  <TransactionRow payment={p} />
                </View>
              ))}
            </Card>
          )}
        </>
      ) : (
        <>
          {/* Pending verification queue */}
          <Text
            variant="h3"
            tone="primary"
            style={{ marginTop: 20, marginBottom: 12 }}
          >
            Pending Verification
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
            Driver Cash Held
          </Text>
          {ledger && ledger.length > 0 ? (
            <VStack gap={12}>
              {ledger.map((row, i) => (
                <Card key={row.driverUserId ?? `row-${i}`}>
                  <HStack align="center" justify="space-between">
                    <HStack gap={12} align="center" flex={1}>
                      <View style={styles.walletIcon}>
                        <Wallet
                          size={18}
                          color={tints.amber.icon}
                          strokeWidth={2}
                        />
                      </View>
                      <VStack gap={2} flex={1}>
                        <Text
                          variant="label-lg"
                          tone="primary"
                          numberOfLines={1}
                        >
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
        </>
      )}
    </Screen>
  );
}

function TransactionRow({ payment }: { payment: Payment }) {
  const isCash = payment.mode === "cash";
  const title = payment.receivedByName || "Fee payment";
  return (
    <HStack gap={12} align="center" style={styles.txRow}>
      <Avatar name={title} seed={payment.id} size={38} />
      <VStack gap={2} flex={1}>
        <Text variant="label-lg" weight="600" tone="primary" numberOfLines={1}>
          {title}
        </Text>
        <HStack gap={5} align="center">
          {isCash ? (
            <Banknote size={12} color={palette.text.tertiary} strokeWidth={2} />
          ) : (
            <Smartphone
              size={12}
              color={palette.text.tertiary}
              strokeWidth={2}
            />
          )}
          <Text variant="caption" tone="tertiary">
            {isCash ? "Cash Payment" : "Online Payment"}
            {payment.forMonth ? ` · ${payment.forMonth}` : ""}
          </Text>
        </HStack>
      </VStack>
      <VStack gap={3} align="flex-end">
        <Text variant="label-lg" weight="700" tone="primary">
          {money(payment.amount)}
        </Text>
        <StatusChip
          label={STATUS_LABEL[payment.status]}
          tone={STATUS_TONE[payment.status]}
        />
      </VStack>
    </HStack>
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

const styles = StyleSheet.create({
  segment: {
    flexDirection: "row",
    backgroundColor: palette.surface.secondary,
    borderRadius: radius.full,
    padding: 4,
    borderWidth: 1,
    borderColor: palette.border.default,
  },
  segBtn: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 9,
    borderRadius: radius.full,
  },
  headCard: {
    flex: 1,
    borderRadius: radius.lg,
    padding: 16,
    gap: 2,
    minHeight: 96,
    justifyContent: "center",
  },
  txRow: { paddingVertical: 12, paddingHorizontal: 14 },
  walletIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: tints.amber.bg,
    alignItems: "center",
    justifyContent: "center",
  },
  divider: { height: 1, backgroundColor: palette.border.subtle },
});
