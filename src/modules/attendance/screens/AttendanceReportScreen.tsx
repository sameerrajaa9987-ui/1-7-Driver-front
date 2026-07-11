/**
 * AttendanceReportScreen — the school's daily attendance report (client
 * mockup): a date chip, Picked Up / Dropped / Absent / Total stat cards, and a
 * per-student table (Name / Pickup / Drop / Status) with a CSV export. Built
 * from today's QR-verified events + no-show stops; read-only.
 */
import React, { useMemo } from "react";
import { View, Platform, StyleSheet } from "react-native";
import { CalendarDays, Download, ClipboardCheck } from "lucide-react-native";
import { useAttendanceList } from "@modules/attendance/hooks/useAttendance";
import { useStudents } from "@modules/student/hooks/useStudents";
import { useTrips } from "@modules/trip/hooks/useTrips";
import { useDashboardSummary } from "@modules/dashboard/hooks/useDashboard";
import { todayISO } from "@modules/trip/utils";
import { palette, radius, tints } from "@shared/designSystem";
import {
  Screen,
  Text,
  VStack,
  HStack,
  Card,
  Button,
  StatusChip,
  EmptyState,
} from "@shared/ui";

type RowStatus = "Dropped" | "On Board" | "Absent" | "—";
type Row = {
  id: string;
  name: string;
  className: string;
  pickup: string;
  drop: string;
  status: RowStatus;
};

const STATUS_TONE: Record<
  RowStatus,
  "success" | "info" | "danger" | "neutral"
> = {
  Dropped: "success",
  "On Board": "info",
  Absent: "danger",
  "—": "neutral",
};

const clock = (ms?: number) =>
  ms
    ? new Date(ms).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "—";

const isToday = (ms: number) => {
  const d = new Date(ms);
  const n = new Date();
  return (
    d.getFullYear() === n.getFullYear() &&
    d.getMonth() === n.getMonth() &&
    d.getDate() === n.getDate()
  );
};

function downloadCsv(rows: Row[]) {
  const header = ["Student", "Class", "Pickup Time", "Drop Time", "Status"];
  const body = rows.map((r) =>
    [r.name, r.className, r.pickup, r.drop, r.status]
      .map((c) => `"${String(c).replace(/"/g, '""')}"`)
      .join(","),
  );
  const csv = [header.join(","), ...body].join("\n");
  if (Platform.OS === "web" && typeof document !== "undefined") {
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `attendance-${todayISO()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }
}

export default function AttendanceReportScreen() {
  const summary = useDashboardSummary();
  const today = summary.data?.today;
  const students = useStudents();
  const attendance = useAttendanceList({ limit: 200 });
  const trips = useTrips({ date: todayISO() });

  const isLoading =
    students.isLoading || attendance.isLoading || summary.isLoading;

  const rows: Row[] = useMemo(() => {
    // Today's pickup/drop timestamps per student.
    const byStudent = new Map<string, { pickup?: number; drop?: number }>();
    for (const r of attendance.data?.data ?? []) {
      const ms = new Date(r.createdAt).getTime();
      if (!r.studentId || !isToday(ms)) continue;
      const cur = byStudent.get(r.studentId) ?? {};
      if (r.type === "drop") cur.drop = ms;
      else cur.pickup = ms;
      byStudent.set(r.studentId, cur);
    }
    // Today's no-shows.
    const absent = new Set<string>();
    for (const t of trips.data?.data ?? [])
      for (const s of t.stops)
        if (s.status === "no_show") absent.add(s.studentId);

    return (students.data?.data ?? []).map((s) => {
      const ev = byStudent.get(s.id);
      const status: RowStatus = ev?.drop
        ? "Dropped"
        : ev?.pickup
          ? "On Board"
          : absent.has(s.id)
            ? "Absent"
            : "—";
      return {
        id: s.id,
        name: s.name,
        className: [s.className, s.section].filter(Boolean).join("-"),
        pickup: clock(ev?.pickup),
        drop: clock(ev?.drop),
        status,
      };
    });
  }, [students.data, attendance.data, trips.data]);

  const dateLabel = new Date().toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  const cards = [
    {
      label: "Picked Up",
      value: today?.pickedUp ?? 0,
      tint: tints.teal,
    },
    { label: "Dropped", value: today?.dropped ?? 0, tint: tints.green },
    { label: "Absent", value: today?.noShow ?? 0, tint: tints.red },
    {
      label: "Total",
      value: today?.totalStudents ?? 0,
      tint: tints.violet,
    },
  ];

  return (
    <Screen
      title="Attendance Report"
      refreshing={students.isRefetching}
      onRefresh={() => {
        students.refetch();
        attendance.refetch();
        summary.refetch();
      }}
    >
      {/* Date chip */}
      <View style={styles.datePill}>
        <CalendarDays
          size={15}
          color={palette.text.secondary}
          strokeWidth={2}
        />
        <Text variant="label" weight="600" tone="primary">
          {dateLabel}
        </Text>
      </View>

      {/* Stat cards */}
      <HStack gap={10} style={{ marginTop: 14 }}>
        {cards.map((c) => (
          <View
            key={c.label}
            style={[styles.statCard, { backgroundColor: c.tint.bg }]}
          >
            <Text variant="h2" style={{ color: c.tint.fg }}>
              {c.value}
            </Text>
            <Text variant="caption" weight="600" style={{ color: c.tint.fg }}>
              {c.label}
            </Text>
          </View>
        ))}
      </HStack>

      {/* Table header + export */}
      <HStack
        align="center"
        justify="space-between"
        style={{ marginTop: 24, marginBottom: 12 }}
      >
        <Text variant="h3" tone="primary">
          Student Attendance
        </Text>
        <Button
          label="Export"
          variant="secondary"
          size="sm"
          fullWidth={false}
          icon={
            <Download size={15} color={palette.text.primary} strokeWidth={2} />
          }
          onPress={() => downloadCsv(rows)}
        />
      </HStack>

      {rows.length === 0 ? (
        <EmptyState
          icon={ClipboardCheck}
          title={isLoading ? "Loading…" : "No students"}
          message="Attendance rows appear here once students are enrolled."
        />
      ) : (
        <Card padded={false} style={{ paddingVertical: 2 }}>
          {/* Column header */}
          <HStack gap={8} align="center" style={styles.headRow}>
            <Text
              variant="caption"
              weight="700"
              tone="tertiary"
              style={{ flex: 2 }}
            >
              Student
            </Text>
            <Text
              variant="caption"
              weight="700"
              tone="tertiary"
              style={styles.colTime}
            >
              Pickup
            </Text>
            <Text
              variant="caption"
              weight="700"
              tone="tertiary"
              style={styles.colTime}
            >
              Drop
            </Text>
            <View style={styles.colStatus} />
          </HStack>
          {rows.map((r, i) => (
            <View key={r.id}>
              {i > 0 ? <View style={styles.divider} /> : null}
              <HStack gap={8} align="center" style={styles.dataRow}>
                <VStack gap={1} flex={2}>
                  <Text
                    variant="label-sm"
                    weight="600"
                    tone="primary"
                    numberOfLines={1}
                  >
                    {r.name}
                  </Text>
                  {r.className ? (
                    <Text variant="caption" tone="tertiary">
                      {r.className}
                    </Text>
                  ) : null}
                </VStack>
                <Text variant="caption" tone="secondary" style={styles.colTime}>
                  {r.pickup}
                </Text>
                <Text variant="caption" tone="secondary" style={styles.colTime}>
                  {r.drop}
                </Text>
                <View style={styles.colStatus}>
                  <StatusChip label={r.status} tone={STATUS_TONE[r.status]} />
                </View>
              </HStack>
            </View>
          ))}
        </Card>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  datePill: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    backgroundColor: palette.surface.primary,
    borderWidth: 1,
    borderColor: palette.border.default,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: radius.md,
  },
  statCard: {
    flex: 1,
    borderRadius: radius.lg,
    paddingVertical: 14,
    paddingHorizontal: 10,
    alignItems: "center",
    gap: 2,
  },
  headRow: {
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 10,
  },
  dataRow: { paddingHorizontal: 14, paddingVertical: 11 },
  colTime: { width: 52, textAlign: "center" },
  colStatus: { width: 74, alignItems: "flex-end" },
  divider: { height: 1, backgroundColor: palette.border.subtle },
});
