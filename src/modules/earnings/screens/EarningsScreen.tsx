/**
 * EarningsScreen — operator "Driver Pay" (client mockup): Total Drivers / Total
 * Pay This Month headline tiles, a ranked Top Earners list, and a "View All
 * Driver Pay" toggle that reveals the full per-driver payroll breakdown.
 */
import React, { useMemo, useState } from "react";
import { View, StyleSheet } from "react-native";
import { CalendarDays } from "lucide-react-native";
import { useEarnings } from "@modules/earnings/hooks/useEarnings";
import { EarningItem } from "@modules/earnings/types";
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

const money = (n: number) => `₹${(n ?? 0).toLocaleString("en-IN")}`;

function thisMonth() {
  return new Date().toLocaleString("en-US", { month: "long", year: "numeric" });
}

const SALARY_LABEL: Record<string, string> = {
  fixed: "Fixed",
  commission: "Commission",
  hybrid: "Hybrid",
};

export default function EarningsScreen() {
  const { data, isLoading, refetch, isRefetching } = useEarnings();
  const summary = data?.summary;
  const [showAll, setShowAll] = useState(false);

  const ranked = useMemo(
    () => [...(data?.items ?? [])].sort((a, b) => b.total - a.total),
    [data?.items],
  );
  const topEarners = ranked.slice(0, 5);

  return (
    <Screen
      title="Driver Pay"
      right={
        <View style={styles.monthPill}>
          <CalendarDays
            size={13}
            color={palette.text.secondary}
            strokeWidth={2}
          />
          <Text variant="label-sm" weight="600" tone="secondary">
            This Month
          </Text>
        </View>
      }
      refreshing={isRefetching || isLoading}
      onRefresh={refetch}
    >
      {/* Headline totals */}
      <HStack gap={12}>
        <View style={styles.totalCard}>
          <Text variant="caption" tone="tertiary">
            Total Drivers
          </Text>
          <Text variant="h1" tone="primary" style={{ marginTop: 6 }}>
            {summary?.drivers ?? 0}
          </Text>
        </View>
        <View style={[styles.totalCard, styles.payCard]}>
          <Text variant="caption" style={{ color: "rgba(255,255,255,0.8)" }}>
            Total Pay This Month
          </Text>
          <Text variant="h1" style={{ color: "#FFFFFF", marginTop: 6 }}>
            {money(summary?.monthlyPayroll ?? 0)}
          </Text>
        </View>
      </HStack>

      {ranked.length === 0 ? (
        <EmptyState
          icon={CalendarDays}
          title={isLoading ? "Loading…" : "No payroll yet"}
          message="Driver earnings appear here once pay profiles are set."
        />
      ) : (
        <>
          <Text
            variant="h3"
            tone="primary"
            style={{ marginTop: 24, marginBottom: 12 }}
          >
            Top Earners
          </Text>
          <Card padded={false} style={{ paddingVertical: 4 }}>
            {topEarners.map((it, i) => (
              <View key={it.driverId}>
                {i > 0 ? <View style={styles.divider} /> : null}
                <TopEarnerRow rank={i + 1} item={it} />
              </View>
            ))}
          </Card>

          {showAll ? (
            <>
              <Text
                variant="h3"
                tone="primary"
                style={{ marginTop: 24, marginBottom: 12 }}
              >
                Full Payroll · {thisMonth()}
              </Text>
              <VStack gap={12}>
                {ranked.map((it) => (
                  <EarningRow key={it.driverId} item={it} />
                ))}
              </VStack>
            </>
          ) : (
            <View style={{ marginTop: 16 }}>
              <Button
                label="View All Driver Pay"
                onPress={() => setShowAll(true)}
              />
            </View>
          )}
        </>
      )}
    </Screen>
  );
}

function TopEarnerRow({ rank, item }: { rank: number; item: EarningItem }) {
  return (
    <HStack gap={12} align="center" style={styles.row}>
      <View style={styles.rank}>
        <Text variant="label-sm" weight="700" tone="accent">
          {rank}
        </Text>
      </View>
      <Avatar name={item.driverName} seed={item.driverId} size={38} />
      <VStack gap={1} flex={1}>
        <Text variant="label-lg" weight="600" tone="primary" numberOfLines={1}>
          {item.driverName}
        </Text>
        <Text variant="caption" tone="tertiary">
          {item.activeStudents} student{item.activeStudents === 1 ? "" : "s"}
        </Text>
      </VStack>
      <Text variant="label-lg" weight="700" tone="primary">
        {money(item.total)}
      </Text>
    </HStack>
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
            Fixed salary
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
        <View style={styles.divider} />
        <HStack gap={8} align="center" justify="space-between">
          <Text variant="label" weight="700" tone="primary">
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

const styles = StyleSheet.create({
  monthPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: palette.surface.primary,
    borderWidth: 1,
    borderColor: palette.border.default,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: radius.full,
  },
  totalCard: {
    flex: 1,
    backgroundColor: palette.surface.primary,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: palette.border.default,
    padding: 16,
    minHeight: 92,
    justifyContent: "center",
  },
  payCard: {
    backgroundColor: accent.main,
    borderColor: accent.main,
  },
  row: { paddingVertical: 12, paddingHorizontal: 14 },
  rank: {
    width: 24,
    height: 24,
    borderRadius: radius.full,
    backgroundColor: accent.soft,
    alignItems: "center",
    justifyContent: "center",
  },
  divider: { height: 1, backgroundColor: palette.border.subtle },
});
