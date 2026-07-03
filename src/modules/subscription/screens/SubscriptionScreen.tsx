/**
 * SubscriptionScreen — the operator's plan (deck: Revenue Model). Midnight
 * hero shows the current state (trial countdown / active plan / expired);
 * below it, the plan cards. In test mode "choosing" a plan completes the
 * checkout instantly — with live Razorpay keys the payment sheet takes over.
 */
import React from "react";
import { View, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Crown, CheckCircle2, Sparkles } from "lucide-react-native";
import {
  useSubscription,
  useUpgradePlan,
} from "@modules/subscription/hooks/useSubscription";
import type { PlanInfo } from "@modules/subscription/api/subscriptionApi";
import { apiErrorMessage } from "@api/apiClient";
import { palette, radius, tints, gradients, glass } from "@shared/designSystem";
import {
  Screen,
  Text,
  VStack,
  HStack,
  Card,
  Button,
  StatusChip,
} from "@shared/ui";

function daysLeft(iso: string | null): number {
  if (!iso) return 0;
  return Math.max(
    0,
    Math.ceil((new Date(iso).getTime() - Date.now()) / 86_400_000),
  );
}

export default function SubscriptionScreen() {
  const { data: sub, isLoading, refetch, isRefetching } = useSubscription();
  const upgrade = useUpgradePlan();

  const headline =
    sub?.status === "trial"
      ? `${daysLeft(sub.trialEndsAt)} days`
      : sub?.status === "active"
        ? sub.plan === "premium"
          ? "Premium"
          : "Basic"
        : "Expired";
  const caption =
    sub?.status === "trial"
      ? "left in your free trial — everything unlocked"
      : sub?.status === "active"
        ? `active until ${sub.currentPeriodEnd ? new Date(sub.currentPeriodEnd).toLocaleDateString() : "—"}`
        : "choose a plan to keep premium features";

  return (
    <Screen refreshing={isRefetching || isLoading} onRefresh={refetch}>
      {/* Midnight hero — current plan state */}
      <View style={styles.heroWrap}>
        <LinearGradient
          colors={[...gradients.hero] as [string, string, ...string[]]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.hero}
        >
          <HStack align="center" justify="space-between">
            <Text variant="overline" style={{ color: palette.brand[400] }}>
              Your subscription
            </Text>
            {sub?.testMode ? (
              <View style={[styles.testChip, glass.light]}>
                <Text
                  variant="label-sm"
                  weight="700"
                  style={{ color: palette.brand[300] }}
                >
                  TEST MODE
                </Text>
              </View>
            ) : null}
          </HStack>
          <Text variant="display-sm" style={{ color: "#FFFFFF", marginTop: 8 }}>
            {headline}
          </Text>
          <Text variant="body-sm" style={{ color: "rgba(255,255,255,0.72)" }}>
            {caption}
          </Text>
        </LinearGradient>
      </View>

      {upgrade.isError ? (
        <Text variant="body-sm" tone="danger" style={{ marginTop: 12 }}>
          {apiErrorMessage(upgrade.error, "Could not complete the upgrade")}
        </Text>
      ) : null}

      <Text
        variant="h3"
        tone="primary"
        style={{ marginTop: 24, marginBottom: 12 }}
      >
        Plans
      </Text>
      <VStack gap={12}>
        {(sub?.catalog ?? []).map((plan) => (
          <PlanCard
            key={plan.key}
            plan={plan}
            current={
              sub?.status === "active" && sub.plan === plan.key
            }
            busy={upgrade.isPending}
            onChoose={() => upgrade.mutate(plan.key)}
          />
        ))}
      </VStack>

      <Text
        variant="caption"
        tone="tertiary"
        style={{ marginTop: 16 }}
        align="center"
      >
        Billing is monthly. In test mode payments complete instantly without a
        gateway; add Razorpay keys to go live.
      </Text>
    </Screen>
  );
}

function PlanCard({
  plan,
  current,
  busy,
  onChoose,
}: {
  plan: PlanInfo;
  current?: boolean;
  busy: boolean;
  onChoose: () => void;
}) {
  const isPremium = plan.key === "premium";
  return (
    <Card
      style={
        isPremium
          ? { borderColor: palette.brand[300], borderWidth: 1.5 }
          : undefined
      }
    >
      <VStack gap={12}>
        <HStack align="center" justify="space-between">
          <HStack gap={8} align="center">
            {isPremium ? (
              <Crown size={18} color={palette.brand[600]} strokeWidth={2.2} />
            ) : (
              <Sparkles
                size={18}
                color={palette.text.tertiary}
                strokeWidth={2}
              />
            )}
            <Text variant="h3" tone="primary">
              {plan.label}
            </Text>
            {isPremium ? (
              <StatusChip label="Recommended" tone="warning" />
            ) : null}
          </HStack>
          <HStack gap={2} align="flex-end">
            <Text variant="h2" tone="primary">
              ₹{plan.price}
            </Text>
            <Text variant="caption" tone="tertiary">
              /mo
            </Text>
          </HStack>
        </HStack>

        <VStack gap={8}>
          {plan.features.map((f) => (
            <HStack key={f} gap={8} align="center">
              <CheckCircle2
                size={15}
                color={tints.green.icon}
                strokeWidth={2.2}
              />
              <Text variant="body-sm" tone="secondary">
                {f}
              </Text>
            </HStack>
          ))}
        </VStack>

        {current ? (
          <StatusChip label="Current plan" tone="success" />
        ) : (
          <Button
            label={`Choose ${plan.label}`}
            variant={isPremium ? "accent" : "secondary"}
            loading={busy}
            onPress={onChoose}
          />
        )}
      </VStack>
    </Card>
  );
}

const styles = StyleSheet.create({
  heroWrap: { borderRadius: radius.xl, overflow: "hidden" },
  hero: { padding: 22 },
  testChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.full,
  },
});
