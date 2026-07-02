import React, { useEffect, useState } from "react";
import { View, Pressable } from "react-native";
import { useQueryClient } from "@tanstack/react-query";
import { ShieldAlert, MapPin, CheckCircle2, Clock } from "lucide-react-native";
import { useSosAlerts, useResolveSos } from "@modules/sos/hooks/useSos";
import {
  SosAlert,
  SosStatus,
  SosAlertEvent,
  SosResolvedEvent,
} from "@modules/sos/types";
import { onSocket } from "@shared/api/socket";
import { palette, tints, radius } from "@shared/designSystem";
import {
  Screen,
  Text,
  VStack,
  HStack,
  Card,
  Button,
  StatusChip,
  LiveBadge,
  EmptyState,
} from "@shared/ui";

const FILTERS: { value: SosStatus; label: string }[] = [
  { value: "active", label: "Active" },
  { value: "resolved", label: "Resolved" },
];

function timeAgo(iso: string): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "";
  const s = Math.max(0, Math.floor((Date.now() - then) / 1000));
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return new Date(iso).toLocaleDateString();
}

export default function SosScreen() {
  const qc = useQueryClient();
  const [status, setStatus] = useState<SosStatus>("active");
  const { data, isLoading, refetch, isRefetching } = useSosAlerts({
    status,
    limit: 50,
  });
  const resolveMut = useResolveSos();

  // Live: new alerts prepend / invalidate; resolutions refresh the list.
  useEffect(() => {
    const offAlert = onSocket<SosAlertEvent>("sos:alert", () => {
      qc.invalidateQueries({ queryKey: ["sos"] });
    });
    const offResolved = onSocket<SosResolvedEvent>("sos:resolved", () => {
      qc.invalidateQueries({ queryKey: ["sos"] });
    });
    return () => {
      offAlert();
      offResolved();
    };
  }, [qc]);

  const alerts = data?.data ?? [];

  return (
    <Screen
      overline="Emergency"
      title="SOS alerts"
      subtitle="Live emergency alerts from your drivers"
      refreshing={isRefetching}
      onRefresh={refetch}
    >
      <HStack gap={8} style={{ marginBottom: 20 }}>
        {FILTERS.map((f) => {
          const on = status === f.value;
          return (
            <Pressable
              key={f.value}
              onPress={() => setStatus(f.value)}
              style={[
                chip,
                on
                  ? {
                      backgroundColor: palette.teal[600],
                      borderColor: palette.teal[600],
                    }
                  : undefined,
              ]}
            >
              <Text
                variant="label"
                weight="600"
                style={{ color: on ? "#FFFFFF" : palette.text.secondary }}
              >
                {f.label}
              </Text>
            </Pressable>
          );
        })}
      </HStack>

      {alerts.length === 0 ? (
        <EmptyState
          icon={ShieldAlert}
          title={isLoading ? "Loading…" : "No alerts"}
          message={
            status === "active"
              ? "No active emergencies right now."
              : "No resolved alerts yet."
          }
        />
      ) : (
        <VStack gap={12}>
          {alerts.map((a) => (
            <SosCard
              key={a.id}
              alert={a}
              onResolve={() => resolveMut.mutate(a.id)}
              resolving={resolveMut.isPending && resolveMut.variables === a.id}
            />
          ))}
        </VStack>
      )}
    </Screen>
  );
}

function SosCard({
  alert,
  onResolve,
  resolving,
}: {
  alert: SosAlert;
  onResolve: () => void;
  resolving: boolean;
}) {
  const active = alert.status === "active";
  return (
    <Card
      style={
        active
          ? { backgroundColor: tints.red.bg, borderColor: tints.red.ring }
          : {
              backgroundColor: tints.neutral.bg,
              borderColor: tints.neutral.ring,
            }
      }
    >
      <VStack gap={12}>
        <HStack align="center" justify="space-between">
          <HStack gap={10} align="center" flex={1}>
            <View
              style={[
                iconWrap,
                {
                  backgroundColor: active ? tints.red.icon : tints.neutral.icon,
                },
              ]}
            >
              <ShieldAlert size={18} color="#FFFFFF" strokeWidth={2.2} />
            </View>
            <VStack gap={2} flex={1}>
              <Text variant="label-lg" tone="primary" numberOfLines={1}>
                {alert.driverName || "Driver"}
              </Text>
              <HStack gap={6} align="center">
                <Clock
                  size={12}
                  color={palette.text.tertiary}
                  strokeWidth={1.9}
                />
                <Text variant="body-sm" tone="tertiary">
                  {timeAgo(alert.createdAt)}
                </Text>
              </HStack>
            </VStack>
          </HStack>
          {active ? (
            <LiveBadge label="SOS" />
          ) : (
            <StatusChip label="Resolved" tone="success" />
          )}
        </HStack>

        {alert.message ? (
          <Text variant="body" tone="secondary">
            {alert.message}
          </Text>
        ) : null}

        <HStack gap={6} align="center">
          <MapPin size={14} color={palette.text.tertiary} strokeWidth={1.9} />
          <Text variant="body-sm" tone="tertiary">
            {alert.lat.toFixed(5)}, {alert.lng.toFixed(5)}
          </Text>
        </HStack>

        {active ? (
          <Button
            label="Resolve"
            variant="destructive"
            icon={<CheckCircle2 size={16} color="#FFFFFF" strokeWidth={2} />}
            loading={resolving}
            onPress={onResolve}
          />
        ) : null}
      </VStack>
    </Card>
  );
}

const chip = {
  paddingHorizontal: 16,
  height: 40,
  borderRadius: radius.full,
  borderWidth: 1,
  borderColor: palette.border.default,
  backgroundColor: palette.surface.primary,
  alignItems: "center" as const,
  justifyContent: "center" as const,
};

const iconWrap = {
  width: 38,
  height: 38,
  borderRadius: radius.md,
  alignItems: "center" as const,
  justifyContent: "center" as const,
};
