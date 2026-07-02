/**
 * ActivityLogScreen — the spec §14 audit trail viewer (admin). Every recorded
 * event with who / what / when, searchable and filterable by entity type.
 */
import React, { useState } from "react";
import { View } from "react-native";
import { Search, History } from "lucide-react-native";
import { useActivityLogs } from "@modules/activity-log/hooks/useActivityLogs";
import type { ActivityLog } from "@modules/activity-log/types";
import { palette, tints, radius, type TintName } from "@shared/designSystem";
import {
  Screen,
  Text,
  VStack,
  HStack,
  Card,
  ChipsRow,
  TextField,
  EmptyState,
  StatusChip,
} from "@shared/ui";

const ENTITY_CHIPS = [
  { key: "", label: "All" },
  { key: "student", label: "Students" },
  { key: "trip", label: "Trips" },
  { key: "payment", label: "Payments" },
  { key: "driver", label: "Drivers" },
  { key: "vehicle", label: "Vehicles" },
  { key: "route", label: "Routes" },
  { key: "complaint", label: "Complaints" },
];

/** Colour-code events by their action prefix so the log scans at a glance. */
function actionTint(action: string): TintName {
  if (action.startsWith("payment")) return "green";
  if (action.startsWith("trip") || action.startsWith("attendance"))
    return "teal";
  if (action.startsWith("sos")) return "red";
  if (action.startsWith("complaint")) return "amber";
  if (action.startsWith("auth") || action.startsWith("user")) return "violet";
  return "blue";
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString();
}

export default function ActivityLogScreen() {
  const [entityType, setEntityType] = useState("");
  const [search, setSearch] = useState("");

  const { data, isLoading, refetch, isRefetching } = useActivityLogs({
    limit: 50,
    ...(entityType ? { entityType } : {}),
    ...(search.trim() ? { search: search.trim() } : {}),
  });
  const logs = data?.data ?? [];

  return (
    <Screen
      overline="Audit"
      title="Activity log"
      subtitle="Every action, permanently recorded"
      refreshing={isRefetching || isLoading}
      onRefresh={refetch}
    >
      <TextField
        placeholder="Search actions or descriptions…"
        value={search}
        onChangeText={setSearch}
        leading={<Search size={18} color={palette.text.tertiary} />}
      />

      <View style={{ marginHorizontal: -20, marginTop: 12 }}>
        <ChipsRow
          chips={ENTITY_CHIPS}
          active={entityType}
          onChange={setEntityType}
        />
      </View>

      <VStack gap={10} style={{ marginTop: 8 }}>
        {logs.length === 0 ? (
          <EmptyState
            icon={History}
            title={isLoading ? "Loading…" : "No activity yet"}
            message="Actions across the platform appear here as they happen."
          />
        ) : (
          logs.map((log) => <LogRow key={log.id} log={log} />)
        )}
      </VStack>
    </Screen>
  );
}

function LogRow({ log }: { log: ActivityLog }) {
  const tint = tints[actionTint(log.action)];
  return (
    <Card elevation="base">
      <HStack gap={12} align="center">
        <View
          style={{
            width: 38,
            height: 38,
            borderRadius: radius.md,
            backgroundColor: tint.bg,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <History size={17} color={tint.icon} strokeWidth={2} />
        </View>
        <VStack gap={2} flex={1}>
          <Text variant="label" tone="primary" numberOfLines={1}>
            {log.description || log.action}
          </Text>
          <Text variant="caption" tone="tertiary" numberOfLines={1}>
            {[log.userName, log.action, timeAgo(log.createdAt)]
              .filter(Boolean)
              .join(" · ")}
          </Text>
        </VStack>
        {log.userRole ? (
          <StatusChip label={log.userRole} tone="neutral" />
        ) : null}
      </HStack>
    </Card>
  );
}
