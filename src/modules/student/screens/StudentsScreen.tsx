import React, { useState } from "react";
import { View, TextInput, StyleSheet, Pressable, Linking } from "react-native";
import { useNavigation } from "@react-navigation/native";
import {
  Search,
  Plus,
  GraduationCap,
  School,
  ChevronRight,
  Route as RouteIcon,
  UserCog,
  Bus,
  Phone,
} from "lucide-react-native";
import { useStudents } from "@modules/student/hooks/useStudents";
import { Student, StudentStatus } from "@modules/student/types";
import { useAuthStore } from "@shared/store/useAuthStore";
import { PERMISSIONS } from "@shared/permissions";
import { palette, radius, outline, accentFor } from "@shared/designSystem";
import { mediaUrl } from "@shared/media";
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
  const role = useAuthStore((s) => s.user?.role);
  const hasPermission = useAuthStore((s) => s.hasPermission);
  const canAdd = hasPermission(PERMISSIONS.STUDENTS_ADD);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<StudentStatus | "all">("all");

  const { data, isLoading, refetch, isRefetching } = useStudents({
    search: search.trim() || undefined,
    status: status === "all" ? undefined : status,
  });
  const students = data?.data ?? [];

  // Parents get the client-kit "My Children" view — one rich card per child
  // (photo, route/driver/vehicle, Call Driver) instead of an admin roster.
  if (role === "parent") {
    return (
      <Screen
        title="My Children"
        refreshing={isRefetching || isLoading}
        onRefresh={refetch}
        right={
          canAdd ? (
            <Button
              label="Add Child"
              size="sm"
              fullWidth={false}
              tint={accentFor("parent").main}
              icon={<Plus size={16} color="#FFFFFF" strokeWidth={2.2} />}
              onPress={() => navigation.navigate("StudentForm")}
            />
          ) : undefined
        }
      >
        {students.length === 0 ? (
          <EmptyState
            icon={GraduationCap}
            title={isLoading ? "Loading…" : "No children added yet"}
            message="Add your child to get them assigned to a route."
          />
        ) : (
          <VStack gap={14}>
            {students.map((s) => (
              <ChildCard
                key={s.id}
                student={s}
                onPress={() =>
                  navigation.navigate("StudentDetail", { id: s.id })
                }
              />
            ))}
          </VStack>
        )}
      </Screen>
    );
  }

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

/** Client-kit child card — photo, class chip, transport rows, Call Driver. */
function ChildCard({
  student,
  onPress,
}: {
  student: Student;
  onPress: () => void;
}) {
  const accent = accentFor("parent");
  const rows = [
    { icon: RouteIcon, label: "Route", value: student.routeName },
    { icon: UserCog, label: "Driver", value: student.driverName },
    {
      icon: Bus,
      label: "Vehicle",
      value: [student.vehicleNumber, student.vehicleModel]
        .filter(Boolean)
        .join(" · "),
    },
  ].filter((r) => r.value);

  const sub = [student.className, student.schoolName]
    .filter(Boolean)
    .join(" · ");

  return (
    <Card onPress={onPress} elevation="base">
      <HStack gap={14} align="center">
        <Avatar
          name={student.name}
          size={52}
          photo={student.photo ? mediaUrl(student.photo) : undefined}
          seed={student.id}
        />
        <VStack gap={3} flex={1}>
          <Text variant="label-lg" tone="primary" numberOfLines={1}>
            {student.name}
          </Text>
          {sub ? (
            <Text variant="body-sm" tone="tertiary" numberOfLines={1}>
              {sub}
            </Text>
          ) : null}
        </VStack>
        <StatusChip
          label={student.status === "active" ? "Active" : student.status}
          tone={STATUS_TONE[student.status]}
        />
      </HStack>

      {rows.length > 0 ? (
        <VStack gap={10} style={childStyles.rows}>
          {rows.map((r) => (
            <HStack key={r.label} gap={10} align="center">
              <View
                style={[childStyles.rowIcon, { backgroundColor: accent.soft }]}
              >
                <r.icon size={14} color={accent.main} strokeWidth={2} />
              </View>
              <Text variant="body-sm" tone="tertiary" style={{ width: 58 }}>
                {r.label}
              </Text>
              <Text
                variant="label"
                weight="600"
                tone="primary"
                numberOfLines={1}
                style={{ flex: 1 }}
              >
                {r.value}
              </Text>
            </HStack>
          ))}
        </VStack>
      ) : (
        <Text variant="body-sm" tone="tertiary" style={childStyles.rows}>
          {student.status === "pending"
            ? "Waiting for the operator to approve and assign transport."
            : "Transport not assigned yet."}
        </Text>
      )}

      {student.driverMobile ? (
        <Pressable
          onPress={() => Linking.openURL(`tel:${student.driverMobile}`)}
          style={[childStyles.callBtn, { backgroundColor: accent.soft }]}
        >
          <Phone size={15} color={accent.main} strokeWidth={2.1} />
          <Text variant="label" weight="600" style={{ color: accent.dark }}>
            Call Driver
          </Text>
        </Pressable>
      ) : null}
    </Card>
  );
}

const childStyles = StyleSheet.create({
  rows: {
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: palette.border.subtle,
  },
  rowIcon: {
    width: 28,
    height: 28,
    borderRadius: radius.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  callBtn: {
    marginTop: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    borderRadius: radius.md,
  },
});

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
