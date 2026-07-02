import React from "react";
import { Wallet } from "lucide-react-native";
import { useMyEarnings } from "@modules/earnings/hooks/useEarnings";
import {
  Screen,
  Text,
  VStack,
  HStack,
  Card,
  TintTile,
  StatusChip,
  EmptyState,
} from "@shared/ui";

const money = (n: number) => `₹${(n ?? 0).toLocaleString("en-IN")}`;

const SALARY_LABEL: Record<string, string> = {
  fixed: "Fixed",
  commission: "Commission",
  hybrid: "Hybrid",
};

export default function DriverEarningsScreen() {
  const { data, isLoading, isError, refetch, isRefetching } = useMyEarnings();

  return (
    <Screen
      overline="Payroll"
      title="My earnings"
      refreshing={isRefetching || isLoading}
      onRefresh={refetch}
    >
      {isError || !data ? (
        <EmptyState
          icon={Wallet}
          title={isLoading ? "Loading…" : "No pay profile"}
          message="No pay profile set yet — ask your operator."
        />
      ) : (
        <VStack gap={16}>
          <TintTile
            label="This month"
            value={money(data.total)}
            icon={Wallet}
            tint="teal"
            hint={SALARY_LABEL[data.salaryType] ?? data.salaryType}
          />

          <Card>
            <VStack gap={12}>
              <HStack gap={8} align="center" justify="space-between">
                <Text variant="label" tone="primary">
                  Breakdown
                </Text>
                <StatusChip
                  label={SALARY_LABEL[data.salaryType] ?? data.salaryType}
                  tone="neutral"
                />
              </HStack>

              <Row label="Fixed salary" value={money(data.fixed)} />
              <Row
                label={`Commission (${data.activeStudents} × ${money(
                  data.perStudentCommission,
                )})`}
                value={money(data.commission)}
              />
              <HStack gap={8} align="center" justify="space-between">
                <Text variant="label" tone="primary">
                  Total
                </Text>
                <Text variant="h4" tone="accent">
                  {money(data.total)}
                </Text>
              </HStack>
            </VStack>
          </Card>
        </VStack>
      )}
    </Screen>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <HStack gap={8} align="center" justify="space-between">
      <Text variant="body-sm" tone="tertiary">
        {label}
      </Text>
      <Text variant="body-sm" tone="secondary">
        {value}
      </Text>
    </HStack>
  );
}
