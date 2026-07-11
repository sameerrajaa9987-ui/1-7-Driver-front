/**
 * DriverEarningsScreen — "My Earnings" (client mockup): Total Earnings + Active
 * Students headline cards, an earnings breakdown, and payout history. Values
 * come from the driver's live pay profile (GET /earnings/me).
 */
import React from "react";
import { View, StyleSheet } from "react-native";
import { Wallet, CalendarDays, Users } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useMyEarnings } from "@modules/earnings/hooks/useEarnings";
import { palette, radius, gradients, tints } from "@shared/designSystem";
import { Screen, Text, VStack, HStack, Card, EmptyState } from "@shared/ui";

const money = (n: number) => `₹${(n ?? 0).toLocaleString("en-IN")}`;

function thisMonth() {
  return new Date().toLocaleString("en-US", { month: "long", year: "numeric" });
}

export default function DriverEarningsScreen() {
  const { data, isLoading, isError, refetch, isRefetching } = useMyEarnings();

  return (
    <Screen
      title="My Earnings"
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
      {isError || !data ? (
        <EmptyState
          icon={Wallet}
          title={isLoading ? "Loading…" : "No pay profile"}
          message="No pay profile set yet — ask your operator."
        />
      ) : (
        <>
          {/* Headline cards */}
          <HStack gap={12}>
            <View style={styles.totalWrap}>
              <LinearGradient
                colors={[...gradients.violet] as [string, string, ...string[]]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.total}
              >
                <Text
                  variant="caption"
                  style={{ color: "rgba(255,255,255,0.8)" }}
                >
                  Total Earnings
                </Text>
                <Text variant="h1" style={{ color: "#FFFFFF", marginTop: 4 }}>
                  {money(data.total)}
                </Text>
              </LinearGradient>
            </View>
            <View style={styles.activeCard}>
              <View style={styles.activeIcon}>
                <Users size={16} color={tints.blue.icon} strokeWidth={2} />
              </View>
              <Text variant="h1" tone="primary" style={{ marginTop: 8 }}>
                {data.activeStudents}
              </Text>
              <Text variant="caption" tone="tertiary">
                Active Students
              </Text>
            </View>
          </HStack>

          {/* Breakdown */}
          <Text
            variant="h3"
            tone="primary"
            style={{ marginTop: 24, marginBottom: 12 }}
          >
            Earnings Breakdown
          </Text>
          <Card>
            <VStack gap={14}>
              <Row label="Fixed Salary" value={money(data.fixed)} />
              <Divider />
              <Row
                label="Per Student Commission"
                value={money(data.commission)}
              />
              <Divider />
              <Row label="Other Incentives" value={money(0)} />
              <Divider />
              <HStack align="center" justify="space-between">
                <Text variant="label-lg" weight="700" tone="primary">
                  Total
                </Text>
                <Text variant="h3" style={{ color: palette.text.accent }}>
                  {money(data.total)}
                </Text>
              </HStack>
            </VStack>
          </Card>

          {/* Payout history */}
          <Text
            variant="h3"
            tone="primary"
            style={{ marginTop: 24, marginBottom: 12 }}
          >
            Payout History
          </Text>
          <Card>
            <HStack gap={10} align="center">
              <View style={styles.payIcon}>
                <Wallet size={16} color={tints.green.icon} strokeWidth={2} />
              </View>
              <VStack gap={2} flex={1}>
                <Text variant="label-lg" tone="primary">
                  {thisMonth()}
                </Text>
                <Text variant="body-sm" tone="tertiary">
                  Current cycle · not yet paid out
                </Text>
              </VStack>
              <Text variant="label-lg" weight="700" tone="primary">
                {money(data.total)}
              </Text>
            </HStack>
          </Card>
          <Text
            variant="caption"
            tone="tertiary"
            style={{ marginTop: 10, textAlign: "center" }}
          >
            Past payouts will appear here after your first payout.
          </Text>
        </>
      )}
    </Screen>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <HStack align="center" justify="space-between">
      <Text variant="body" tone="secondary">
        {label}
      </Text>
      <Text variant="label-lg" weight="600" tone="primary">
        {value}
      </Text>
    </HStack>
  );
}

function Divider() {
  return <View style={styles.divider} />;
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
  totalWrap: { flex: 1.3, borderRadius: radius.lg, overflow: "hidden" },
  total: { padding: 16, minHeight: 92, justifyContent: "center" },
  activeCard: {
    flex: 1,
    backgroundColor: palette.surface.primary,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: palette.border.default,
    padding: 16,
  },
  activeIcon: {
    width: 32,
    height: 32,
    borderRadius: radius.md,
    backgroundColor: tints.blue.bg,
    alignItems: "center",
    justifyContent: "center",
  },
  payIcon: {
    width: 38,
    height: 38,
    borderRadius: radius.md,
    backgroundColor: tints.green.bg,
    alignItems: "center",
    justifyContent: "center",
  },
  divider: { height: 1, backgroundColor: palette.border.subtle },
});
