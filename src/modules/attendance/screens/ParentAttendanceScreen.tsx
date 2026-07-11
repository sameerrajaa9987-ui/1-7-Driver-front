/**
 * ParentAttendanceScreen — the child's pickup/drop history (mockup): filter
 * tabs (All / Pickups / Drops / Absent), a QR-verified list grouped by week,
 * and a child switcher for multi-child parents.
 */
import React, { useMemo, useState } from "react";
import { View, Pressable, StyleSheet } from "react-native";
import {
  ArrowUp,
  ArrowDown,
  CalendarCheck,
  ShieldCheck,
} from "lucide-react-native";
import { useStudents } from "@modules/student/hooks/useStudents";
import {
  useAttendanceList,
  useAttendanceSummary,
} from "@modules/attendance/hooks/useAttendance";
import { AttendanceRecord } from "@modules/attendance/api/attendanceApi";
import { palette, radius, tints, accent } from "@shared/designSystem";
import { Screen, Text, VStack, HStack, Card, EmptyState } from "@shared/ui";

type Tab = "all" | "pickup" | "drop" | "absent";
const TABS: { key: Tab; label: string }[] = [
  { key: "all", label: "All" },
  { key: "pickup", label: "Pickups" },
  { key: "drop", label: "Drops" },
  { key: "absent", label: "Absent" },
];

function dayLabel(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const startOf = (x: Date) =>
    new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime();
  const diff = Math.round((startOf(now) - startOf(d)) / 86400000);
  const date = d.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
  });
  const wk = d.toLocaleDateString("en-IN", { weekday: "short" });
  if (diff <= 0) return `Today, ${date}`;
  if (diff === 1) return `Yesterday, ${date}`;
  return `${date}, ${wk}`;
}
const fmtTime = (iso: string) =>
  new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

export default function ParentAttendanceScreen() {
  const { data: kids } = useStudents({ limit: 50 });
  const children = useMemo(() => kids?.data ?? [], [kids]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const child =
    children.find((c) => c.id === selectedId) ?? children[0] ?? null;
  const [tab, setTab] = useState<Tab>("all");

  const list = useAttendanceList({ studentId: child?.id, limit: 100 });
  const summary = useAttendanceSummary(child?.id ?? "");
  const records = useMemo(() => {
    const rows = (list.data?.data ?? []) as AttendanceRecord[];
    const sorted = [...rows].sort(
      (a, b) => new Date(b.at).getTime() - new Date(a.at).getTime(),
    );
    if (tab === "all") return sorted;
    if (tab === "absent") return [];
    return sorted.filter((r) => r.type === tab);
  }, [list.data, tab]);

  return (
    <Screen
      title="Attendance"
      refreshing={list.isRefetching}
      onRefresh={list.refetch}
    >
      {/* Child switcher */}
      {children.length > 1 ? (
        <HStack gap={8} style={{ marginBottom: 12 }} wrap>
          {children.map((c) => {
            const active = c.id === child?.id;
            return (
              <Pressable
                key={c.id}
                onPress={() => setSelectedId(c.id)}
                style={[
                  styles.pill,
                  active && {
                    backgroundColor: accent.main,
                    borderColor: accent.main,
                  },
                ]}
              >
                <Text
                  variant="label"
                  weight="600"
                  style={{ color: active ? "#FFFFFF" : palette.text.secondary }}
                >
                  {c.name.split(" ")[0]}
                </Text>
              </Pressable>
            );
          })}
        </HStack>
      ) : null}

      {/* Filter tabs */}
      <HStack gap={8} wrap>
        {TABS.map((t) => {
          const active = tab === t.key;
          return (
            <Pressable
              key={t.key}
              onPress={() => setTab(t.key)}
              style={[
                styles.pill,
                active && {
                  backgroundColor: accent.main,
                  borderColor: accent.main,
                },
              ]}
            >
              <Text
                variant="label"
                weight="600"
                style={{ color: active ? "#FFFFFF" : palette.text.secondary }}
              >
                {t.label}
              </Text>
            </Pressable>
          );
        })}
      </HStack>

      {tab === "absent" ? (
        <EmptyState
          icon={CalendarCheck}
          title={
            summary.data?.absences
              ? `${summary.data.absences} absences on record`
              : "No absences 🎉"
          }
          message="Days your child missed the van will appear here."
        />
      ) : records.length === 0 ? (
        <EmptyState
          icon={CalendarCheck}
          title={list.isLoading ? "Loading…" : "No attendance yet"}
          message="Verified pickups and drops will show up here."
        />
      ) : (
        <>
          <Text
            variant="label"
            weight="700"
            tone="tertiary"
            style={{ marginTop: 18, marginBottom: 10 }}
          >
            This Week
          </Text>
          <VStack gap={10}>
            {records.map((r) => (
              <AttendanceRow key={r.id} record={r} />
            ))}
          </VStack>
        </>
      )}
    </Screen>
  );
}

function AttendanceRow({ record }: { record: AttendanceRecord }) {
  const isPickup = record.type === "pickup";
  const t = isPickup ? tints.green : tints.violet;
  const Icon = isPickup ? ArrowUp : ArrowDown;
  return (
    <Card>
      <HStack gap={12} align="center">
        <View style={[styles.icon, { backgroundColor: t.bg }]}>
          <Icon size={17} color={t.icon} strokeWidth={2.4} />
        </View>
        <VStack gap={2} flex={1}>
          <Text variant="label-lg" tone="primary">
            {isPickup ? "Picked Up" : "Dropped"}
          </Text>
          <Text variant="body-sm" tone="tertiary">
            {dayLabel(record.at)}
          </Text>
        </VStack>
        <VStack gap={4} align="flex-end">
          <Text variant="label" weight="600" tone="primary">
            {fmtTime(record.at)}
          </Text>
          {record.verified ? (
            <HStack gap={4} align="center">
              <ShieldCheck
                size={12}
                color={tints.green.icon}
                strokeWidth={2.4}
              />
              <Text
                variant="caption"
                weight="600"
                style={{ color: tints.green.fg }}
              >
                QR Verified
              </Text>
            </HStack>
          ) : null}
        </VStack>
      </HStack>
    </Card>
  );
}

const styles = StyleSheet.create({
  pill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: palette.border.default,
    backgroundColor: palette.surface.primary,
  },
  icon: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
  },
});
