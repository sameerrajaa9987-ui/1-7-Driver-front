/**
 * SchoolAttendanceScreen — the school's live attendance feed (client mockup):
 * an All / Pickups / Drops / Absent segmented control, a "Today" timeline of
 * QR-verified pickups & drops (plus today's absences from no-show stops), and a
 * "Recent History" list. Read-only. A header action opens the fuller report.
 */
import React, { useMemo, useState } from "react";
import { View, Pressable, StyleSheet } from "react-native";
import { useSectionNav } from "@navigation/AppNavigator";
import {
  ArrowUpRight,
  ArrowDownLeft,
  UserX,
  ClipboardList,
  ShieldCheck,
  CalendarRange,
} from "lucide-react-native";
import { useAttendanceList } from "@modules/attendance/hooks/useAttendance";
import { useStudents } from "@modules/student/hooks/useStudents";
import { useTrips } from "@modules/trip/hooks/useTrips";
import { todayISO } from "@modules/trip/utils";
import { palette, radius, tints, accent } from "@shared/designSystem";
import {
  Screen,
  Text,
  VStack,
  HStack,
  Card,
  EmptyState,
  HeaderIconButton,
} from "@shared/ui";

type Tab = "all" | "pickup" | "drop" | "absent";
type Row = {
  id: string;
  kind: "pickup" | "drop" | "absent";
  name: string;
  at: number; // epoch ms (0 for absences with no timestamp)
};

const TABS: { key: Tab; label: string }[] = [
  { key: "all", label: "All" },
  { key: "pickup", label: "Pickups" },
  { key: "drop", label: "Drops" },
  { key: "absent", label: "Absent" },
];

const isToday = (ms: number) => {
  if (!ms) return true; // undated absences count as today
  const d = new Date(ms);
  const n = new Date();
  return (
    d.getFullYear() === n.getFullYear() &&
    d.getMonth() === n.getMonth() &&
    d.getDate() === n.getDate()
  );
};

const clock = (ms: number) =>
  ms
    ? new Date(ms).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "—";
const dayLabel = (ms: number) =>
  new Date(ms).toLocaleDateString("en-IN", { day: "numeric", month: "short" });

export default function SchoolAttendanceScreen() {
  const go = useSectionNav();
  const [tab, setTab] = useState<Tab>("all");

  const { data, isLoading, refetch, isRefetching } = useAttendanceList({
    limit: 100,
  });
  const students = useStudents();
  const activeTrips = useTrips({ date: todayISO(), status: "in_progress" });

  const nameById = useMemo(
    () =>
      new Map((students.data?.data ?? []).map((s) => [s.id, s.name] as const)),
    [students.data],
  );

  const rows: Row[] = useMemo(() => {
    const events: Row[] = (data?.data ?? []).map((r) => ({
      id: r.id,
      kind: r.type === "drop" ? "drop" : "pickup",
      name: (r.studentId && nameById.get(r.studentId)) || "Student",
      at: new Date(r.createdAt).getTime(),
    }));
    // Today's no-shows → absent rows.
    for (const t of activeTrips.data?.data ?? [])
      for (const s of t.stops)
        if (s.status === "no_show")
          events.push({
            id: `absent-${s.studentId}`,
            kind: "absent",
            name: s.studentName || nameById.get(s.studentId) || "Student",
            at: 0,
          });
    return events.sort((a, b) => b.at - a.at);
  }, [data, nameById, activeTrips.data]);

  const filtered = tab === "all" ? rows : rows.filter((r) => r.kind === tab);
  const todays = filtered.filter((r) => isToday(r.at));
  const history = filtered.filter((r) => !isToday(r.at));

  return (
    <Screen
      title="Attendance"
      right={
        <HeaderIconButton
          icon={CalendarRange}
          onPress={() => go("AttendanceReport")}
        />
      }
      refreshing={isRefetching || isLoading}
      onRefresh={refetch}
    >
      {/* Segmented control */}
      <HStack gap={8}>
        {TABS.map((t) => {
          const on = tab === t.key;
          return (
            <Pressable
              key={t.key}
              onPress={() => setTab(t.key)}
              style={[styles.seg, on && styles.segOn]}
            >
              <Text
                variant="label-sm"
                weight="700"
                style={{ color: on ? "#FFFFFF" : palette.text.secondary }}
              >
                {t.label}
              </Text>
            </Pressable>
          );
        })}
      </HStack>

      {todays.length === 0 && history.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title={isLoading ? "Loading…" : "No attendance yet"}
          message="QR-verified pickups and drops appear here as they happen."
        />
      ) : (
        <VStack gap={20} style={{ marginTop: 18 }}>
          {todays.length > 0 ? (
            <VStack gap={10}>
              <Text variant="label" weight="700" tone="tertiary">
                Today
              </Text>
              {todays.map((r) => (
                <AttendanceRow key={r.id} row={r} showDate={false} />
              ))}
            </VStack>
          ) : null}
          {history.length > 0 ? (
            <VStack gap={10}>
              <Text variant="label" weight="700" tone="tertiary">
                Recent History
              </Text>
              {history.map((r) => (
                <AttendanceRow key={r.id} row={r} showDate />
              ))}
            </VStack>
          ) : null}
        </VStack>
      )}
    </Screen>
  );
}

function AttendanceRow({ row, showDate }: { row: Row; showDate: boolean }) {
  const meta =
    row.kind === "pickup"
      ? { icon: ArrowUpRight, tint: tints.teal, label: "Picked Up" }
      : row.kind === "drop"
        ? { icon: ArrowDownLeft, tint: tints.green, label: "Reached School" }
        : { icon: UserX, tint: tints.red, label: "Absent" };
  const Icon = meta.icon;
  return (
    <Card elevation="base">
      <HStack gap={12} align="center">
        <View style={[styles.icon, { backgroundColor: meta.tint.bg }]}>
          <Icon size={17} color={meta.tint.icon} strokeWidth={2.2} />
        </View>
        <VStack gap={2} flex={1}>
          <Text variant="label-lg" tone="primary" numberOfLines={1}>
            {row.name}
          </Text>
          <HStack gap={5} align="center">
            <Text
              variant="caption"
              weight="600"
              style={{ color: meta.tint.fg }}
            >
              {meta.label}
            </Text>
            {row.kind !== "absent" ? (
              <HStack gap={3} align="center">
                <ShieldCheck
                  size={11}
                  color={palette.text.tertiary}
                  strokeWidth={2}
                />
                <Text variant="caption" tone="tertiary">
                  QR Verified
                </Text>
              </HStack>
            ) : null}
          </HStack>
        </VStack>
        <Text variant="label-sm" weight="600" tone="secondary">
          {showDate && row.at ? dayLabel(row.at) : clock(row.at)}
        </Text>
      </HStack>
    </Card>
  );
}

const styles = StyleSheet.create({
  seg: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 9,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: palette.border.default,
    backgroundColor: palette.surface.primary,
  },
  segOn: { backgroundColor: accent.main, borderColor: accent.main },
  icon: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
  },
});
