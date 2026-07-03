import React, { useState } from "react";
import { View, Pressable, StyleSheet } from "react-native";
import {
  ShieldCheck,
  Gauge,
  Zap,
  TriangleAlert,
  Activity,
  ChevronDown,
  ChevronRight,
} from "lucide-react-native";
import {
  useDriverScores,
  useTelematicsEvents,
} from "@modules/telematics/hooks/useTelematics";
import { useSubscription } from "@modules/subscription/hooks/useSubscription";
import { UpsellCard } from "@modules/subscription/components/UpsellCard";
import { DriverScore, BehaviourRating } from "@modules/telematics/types";
import { palette, radius, tints, TintName } from "@shared/designSystem";
import {
  Screen,
  Text,
  VStack,
  HStack,
  Card,
  StatusChip,
  EmptyState,
} from "@shared/ui";

const RATING_TINT: Record<BehaviourRating, TintName> = {
  excellent: "green",
  good: "teal",
  fair: "amber",
  poor: "red",
};

const RATING_CHIP: Record<
  BehaviourRating,
  "success" | "info" | "warning" | "danger"
> = {
  excellent: "success",
  good: "info",
  fair: "warning",
  poor: "danger",
};

const RATING_LABEL: Record<BehaviourRating, string> = {
  excellent: "Excellent",
  good: "Good",
  fair: "Fair",
  poor: "Poor",
};

export default function BehaviourScreen() {
  const sub = useSubscription();
  const { data, isLoading, refetch, isRefetching } = useDriverScores();
  const scores = [...(data ?? [])].sort((a, b) => a.score - b.score);

  if (sub.data && !sub.data.premium) {
    return (
      <Screen overline="Safety" title="Driver behaviour">
        <UpsellCard feature="Driver safety scorecards" />
      </Screen>
    );
  }

  return (
    <Screen
      overline="Safety"
      title="Driver behaviour"
      subtitle={`${scores.length} scorecards`}
      refreshing={isRefetching || isLoading}
      onRefresh={refetch}
    >
      {scores.length === 0 ? (
        <EmptyState
          icon={ShieldCheck}
          title={isLoading ? "Loading…" : "No behaviour data yet"}
          message="It builds as trips run — safety scores appear here once drivers start logging trips."
        />
      ) : (
        <VStack gap={12}>
          {scores.map((s) => (
            <ScoreCard key={s.driverId} score={s} />
          ))}
        </VStack>
      )}
    </Screen>
  );
}

function ScoreCard({ score }: { score: DriverScore }) {
  const [open, setOpen] = useState(false);
  const t = tints[RATING_TINT[score.rating]];
  const { data: eventsData, isLoading: eventsLoading } = useTelematicsEvents(
    open ? score.driverId : undefined,
  );
  const events = eventsData?.data ?? [];

  return (
    <Card elevation="base">
      <Pressable onPress={() => setOpen((o) => !o)}>
        <HStack gap={16} align="center">
          <View style={[styles.scoreWrap, { backgroundColor: t.bg }]}>
            <Text variant="h1" style={{ color: t.fg }}>
              {score.score}
            </Text>
          </View>
          <VStack gap={6} flex={1}>
            <Text variant="label-lg" tone="primary" numberOfLines={1}>
              {score.driverName}
            </Text>
            <StatusChip
              label={RATING_LABEL[score.rating]}
              tone={RATING_CHIP[score.rating]}
            />
          </VStack>
          {open ? (
            <ChevronDown
              size={18}
              color={palette.text.tertiary}
              strokeWidth={2}
            />
          ) : (
            <ChevronRight
              size={18}
              color={palette.text.tertiary}
              strokeWidth={2}
            />
          )}
        </HStack>
      </Pressable>

      <HStack gap={10} style={{ marginTop: 14 }} wrap>
        <Counter
          icon={Gauge}
          label="Overspeed"
          value={score.overspeed}
          tint="amber"
        />
        <Counter
          icon={Zap}
          label="Harsh accel"
          value={score.harshAccel}
          tint="blue"
        />
        <Counter
          icon={TriangleAlert}
          label="Harsh brake"
          value={score.harshBrake}
          tint="red"
        />
        <Counter
          icon={Activity}
          label="Total events"
          value={score.totalEvents}
          tint="neutral"
        />
      </HStack>

      {open ? (
        <View style={styles.eventsBox}>
          {eventsLoading ? (
            <Text variant="body-sm" tone="tertiary">
              Loading events…
            </Text>
          ) : events.length === 0 ? (
            <Text variant="body-sm" tone="tertiary">
              No recent events.
            </Text>
          ) : (
            <VStack gap={8}>
              {events.slice(0, 8).map((ev) => (
                <HStack key={ev.id} gap={8} align="center">
                  <View style={styles.dot} />
                  <Text variant="body-sm" tone="secondary" numberOfLines={1}>
                    {ev.type}
                    {ev.value != null ? ` · ${ev.value}` : ""}
                    {ev.location ? ` · ${ev.location}` : ""}
                  </Text>
                  <Text variant="caption" tone="tertiary">
                    {String(ev.occurredAt).slice(0, 16).replace("T", " ")}
                  </Text>
                </HStack>
              ))}
            </VStack>
          )}
        </View>
      ) : null}
    </Card>
  );
}

function Counter({
  icon: Icon,
  label,
  value,
  tint,
}: {
  icon: typeof Gauge;
  label: string;
  value: number;
  tint: TintName;
}) {
  const t = tints[tint];
  return (
    <View
      style={[styles.counter, { backgroundColor: t.bg, borderColor: t.ring }]}
    >
      <HStack gap={6} align="center">
        <Icon size={14} color={t.icon} strokeWidth={2.2} />
        <Text variant="label" style={{ color: t.fg }}>
          {value}
        </Text>
      </HStack>
      <Text variant="caption" style={{ color: t.fg, opacity: 0.8 }}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  scoreWrap: {
    width: 64,
    height: 64,
    borderRadius: radius.lg,
    alignItems: "center",
    justifyContent: "center",
  },
  counter: {
    borderRadius: radius.md,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 2,
    minWidth: 92,
  },
  eventsBox: {
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: palette.border.default,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: radius.full,
    backgroundColor: palette.text.tertiary,
  },
});
