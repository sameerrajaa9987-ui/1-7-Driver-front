import React, { useState } from "react";
import { View, TextInput, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import {
  Search,
  Plus,
  GraduationCap,
  School,
  ChevronRight,
} from "lucide-react-native";
import { useStudents } from "@modules/student/hooks/useStudents";
import { Student, StudentStatus } from "@modules/student/types";
import { useAuthStore } from "@shared/store/useAuthStore";
import { PERMISSIONS } from "@shared/permissions";
import { palette, radius, outline } from "@shared/designSystem";
import {
  Screen,
  Text,
  VStack,
  HStack,
  Card,
  Avatar,
  Button,
  StatusChip,
  ChipsRow,
  EmptyState,
} from "@shared/ui";

const STATUS_TONE: Record<
  StudentStatus,
  "success" | "warning" | "danger" | "neutral"
> = {
  active: "success",
  pending: "warning",
  inactive: "neutral",
};

const FILTERS = [
  { key: "all", label: "All" },
  { key: "pending", label: "Pending" },
  { key: "active", label: "Active" },
  { key: "inactive", label: "Inactive" },
];

export default function StudentsScreen() {
  const navigation = useNavigation<any>();
  const hasPermission = useAuthStore((s) => s.hasPermission);
  const canAdd = hasPermission(PERMISSIONS.STUDENTS_ADD);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<StudentStatus | "all">("all");

  const { data, isLoading, refetch, isRefetching } = useStudents({
    search: search.trim() || undefined,
    status: status === "all" ? undefined : status,
  });
  const students = data?.data ?? [];

  return (
    <Screen
      overline="People"
      title="Students"
      subtitle={`${data?.meta?.total ?? 0} students`}
      refreshing={isRefetching || isLoading}
      onRefresh={refetch}
      right={
        canAdd ? (
          <Button
            label="Add student"
            size="sm"
            fullWidth={false}
            icon={<Plus size={18} color="#FFFFFF" strokeWidth={2.2} />}
            onPress={() => navigation.navigate("StudentForm")}
          />
        ) : undefined
      }
    >
      <View style={styles.searchWrap}>
        <Search size={18} color={palette.text.tertiary} strokeWidth={1.8} />
        <TextInput
          placeholder="Search by name or mobile"
          placeholderTextColor={palette.text.tertiary}
          value={search}
          onChangeText={setSearch}
          style={styles.searchInput}
          autoCapitalize="none"
        />
      </View>

      <View style={{ marginTop: 12 }}>
        <ChipsRow
          chips={FILTERS}
          active={status}
          onChange={(v) => setStatus(v as StudentStatus | "all")}
        />
      </View>

      {students.length === 0 ? (
        <EmptyState
          icon={GraduationCap}
          title={isLoading ? "Loading…" : "No students yet"}
          message="Add students, then approve them to assign transport."
        />
      ) : (
        <VStack gap={12} style={{ marginTop: 16 }}>
          {students.map((s) => (
            <StudentRow
              key={s.id}
              student={s}
              onPress={() => navigation.navigate("StudentDetail", { id: s.id })}
            />
          ))}
        </VStack>
      )}
    </Screen>
  );
}

function StudentRow({
  student,
  onPress,
}: {
  student: Student;
  onPress: () => void;
}) {
  const sub = [student.className, student.schoolName]
    .filter(Boolean)
    .join(" · ");
  return (
    <Card onPress={onPress} elevation="base">
      <HStack gap={14} align="center">
        <Avatar name={student.name} size={46} />
        <VStack gap={4} flex={1}>
          <Text variant="label-lg" tone="primary" numberOfLines={1}>
            {student.name}
          </Text>
          {sub ? (
            <HStack gap={6} align="center">
              <School
                size={13}
                color={palette.text.tertiary}
                strokeWidth={1.9}
              />
              <Text variant="body-sm" tone="tertiary" numberOfLines={1}>
                {sub}
              </Text>
            </HStack>
          ) : student.mobile ? (
            <Text variant="body-sm" tone="tertiary">
              {student.mobile}
            </Text>
          ) : null}
          <StatusChip
            label={student.status}
            tone={STATUS_TONE[student.status]}
          />
        </VStack>
        <ChevronRight size={18} color={palette.text.tertiary} strokeWidth={2} />
      </HStack>
    </Card>
  );
}

const styles = StyleSheet.create({
  searchWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 16,
    height: 48,
    borderRadius: radius.md,
    borderWidth: outline.width,
    borderColor: outline.color,
    backgroundColor: palette.surface.primary,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: palette.text.primary,
    paddingVertical: 0,
  },
});
