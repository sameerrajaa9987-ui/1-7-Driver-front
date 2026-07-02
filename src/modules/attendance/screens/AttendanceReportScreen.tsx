/**
 * AttendanceReportScreen — verified attendance history (deck: Schools
 * Dashboard reports). Every QR-verified pickup/drop, newest first, with an
 * optional per-student filter. Read-only; used by schools and operators.
 */
import React, { useMemo, useState } from "react";
import { View, StyleSheet } from "react-native";
import { ClipboardCheck, ArrowUpRight, ArrowDownLeft } from "lucide-react-native";
import { useAttendanceList } from "@modules/attendance/hooks/useAttendance";
import { useStudents } from "@modules/student/hooks/useStudents";
import { radius, tints } from "@shared/designSystem";
import {
  Screen,
  Text,
  VStack,
  HStack,
  Card,
  Select,
  StatusChip,
  EmptyState,
} from "@shared/ui";

export default function AttendanceReportScreen() {
  const [studentId, setStudentId] = useState<string | null>(null);

  const students = useStudents();
  const { data, isLoading, refetch, isRefetching } = useAttendanceList({
    ...(studentId ? { studentId } : {}),
    limit: 50,
  });

  const nameById = useMemo(
    () =>
      new Map((students.data?.data ?? []).map((s) => [s.id, s.name] as const)),
    [students.data],
  );

  const records = data?.data ?? [];

  return (
    <Screen
      overline="Reports"
      title="Attendance"
      subtitle="QR-verified pickups and drops"
      refreshing={isRefetching || isLoading}
      onRefresh={refetch}
    >
      <View style={{ marginBottom: 16 }}>
        <Select
          label="Student"
          placeholder="All students"
          value={studentId}
          options={(students.data?.data ?? []).map((s) => ({
            value: s.id,
            label: s.name,
          }))}
          onChange={setStudentId}
          allowClear
        />
      </View>

      {records.length === 0 ? (
        <EmptyState
          icon={ClipboardCheck}
          title={isLoading ? "Loading…" : "No verified attendance yet"}
          message="Records appear here when drivers verify students by QR at pickup or drop."
        />
      ) : (
        <VStack gap={10}>
          {records.map((r) => {
            const isPickup = r.type === "pickup";
            const t = isPickup ? tints.teal : tints.green;
            const Icon = isPickup ? ArrowUpRight : ArrowDownLeft;
            return (
              <Card key={r.id} elevation="base">
                <HStack gap={12} align="center">
                  <View style={[styles.icon, { backgroundColor: t.bg }]}>
                    <Icon size={17} color={t.icon} strokeWidth={2.2} />
                  </View>
                  <VStack gap={2} flex={1}>
                    <Text variant="label" tone="primary" numberOfLines={1}>
                      {(r.studentId && nameById.get(r.studentId)) || "Student"}
                    </Text>
                    <Text variant="caption" tone="tertiary">
                      {new Date(r.createdAt).toLocaleString([], {
                        day: "2-digit",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                      {" · "}
                      {r.method.toUpperCase()}
                    </Text>
                  </VStack>
                  <StatusChip
                    label={isPickup ? "Picked up" : "Dropped"}
                    tone={isPickup ? "info" : "success"}
                  />
                </HStack>
              </Card>
            );
          })}
        </VStack>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  icon: {
    width: 38,
    height: 38,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
  },
});
