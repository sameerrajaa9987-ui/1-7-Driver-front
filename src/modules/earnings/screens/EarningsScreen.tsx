import React from "react";
import { Wallet, Users } from "lucide-react-native";
import { useEarnings } from "@modules/earnings/hooks/useEarnings";
import { EarningItem } from "@modules/earnings/types";
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

export default function EarningsScreen() {
  const { data, isLoading, refetch, isRefetching } = useEarnings();
  const items = data?.items ?? [];
  const summary = data?.summary;

  return (
    <Screen
      overline="Payroll"
      title="Earnings"
      subtitle={`${summary?.drivers ?? 0} drivers on payroll`}
      refreshing={isRefetching || isLoading}
      onRefresh={refetch}
    >
      <HStack gap={12}>
        <TintTile
          label="Monthly payroll"
          value={money(summary?.monthlyPayroll ?? 0)}
          icon={Wallet}
          tint="teal"
        />
        <TintTile
          label="Drivers"
          value={String(summary?.drivers ?? 0)}
          icon={Users}
          tint="blue"
        />
      </HStack>

      {items.length === 0 ? (
        <EmptyState
          icon={Wallet}
          title={isLoading ? "Loading…" : "No payroll yet"}
          message="Driver earnings appear here once pay profiles are set."
        />
      ) : (
        <VStack gap={12} style={{ marginTop: 16 }}>
          {items.map((it) => (
            <EarningRow key={it.driverId} item={it} />
          ))}
        </VStack>
      )}
    </Screen>
  );
}

function EarningRow({ item }: { item: EarningItem }) {
  return (
    <Card elevation="base">
      <VStack gap={12}>
        <HStack gap={8} align="center" justify="space-between">
          <Text variant="label-lg" tone="primary" numberOfLines={1}>
            {item.driverName}
          </Text>
          <StatusChip
            label={SALARY_LABEL[item.salaryType] ?? item.salaryType}
            tone="neutral"
          />
        </HStack>

        <HStack gap={8} align="center" justify="space-between">
          <Text variant="body-sm" tone="tertiary">
            Active students
          </Text>
          <Text variant="body-sm" tone="secondary">
            {item.activeStudents}
          </Text>
        </HStack>
        <HStack gap={8} align="center" justify="space-between">
          <Text variant="body-sm" tone="tertiary">
            Fixed
          </Text>
          <Text variant="body-sm" tone="secondary">
            {money(item.fixed)}
          </Text>
        </HStack>
        <HStack gap={8} align="center" justify="space-between">
          <Text variant="body-sm" tone="tertiary">
            Commission
          </Text>
          <Text variant="body-sm" tone="secondary">
            {money(item.commission)}
          </Text>
        </HStack>
        <HStack gap={8} align="center" justify="space-between">
          <Text variant="label" tone="primary">
            Total
          </Text>
          <Text variant="h4" tone="accent">
            {money(item.total)}
          </Text>
        </HStack>
      </VStack>
    </Card>
  );
}
