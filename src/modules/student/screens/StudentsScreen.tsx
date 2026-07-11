import React, { useMemo, useState } from "react";
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
import { useTrips } from "@modules/trip/hooks/useTrips";
import { todayISO } from "@modules/trip/utils";
import { childAvatarSvg } from "@shared/avatars";
import { Student, StudentStatus } from "@modules/student/types";
import { useAuthStore } from "@shared/store/useAuthStore";
import { PERMISSIONS } from "@shared/permissions";
import { palette, radius, outline, accent } from "@shared/designSystem";
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
  HeaderIconButton,
} from "@shared/ui";

type ChipTone = "success" | "warning" | "danger" | "info" | "neutral";
interface LiveStatus {
  label: string;
  tone: ChipTone;
}

const STATUS_TONE: Record<StudentStatus, ChipTone> = {
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
  const [schoolFilter, setSchoolFilter] = useState("all");

  const { data, isLoading, refetch, isRefetching } = useStudents({
    search: search.trim() || undefined,
    status: status === "all" ? undefined : status,
  });
  const students = data?.data ?? [];

  // Live per-child status from today's in-progress trips (parent cards).
  const activeTrips = useTrips({ date: todayISO(), status: "in_progress" });
  const liveByStudent = useMemo(() => {
    const map: Record<string, LiveStatus> = {};
    for (const t of activeTrips.data?.data ?? []) {
      for (const s of t.stops) {
        let label = "On the way";
        let tone: ChipTone = "success";
        if (t.reachedSchoolAt) {
          label = "Reached School";
          tone = "info";
        } else if (s.status === "picked_up" || s.status === "dropped") {
          label = "On Board";
          tone = "info";
        } else if (s.status === "no_show") {
          label = "Absent";
          tone = "danger";
        }
        map[s.studentId] = { label, tone };
      }
    }
    return map;
  }, [activeTrips.data]);

  // Drivers get a "My Students" roster — illustrated avatar, class/pickup and a
  // live On-Board / Waiting / Absent pill from their in-progress trip, plus a
  // one-tap call to the parent. (Not the admin approve-and-assign roster.)
  if (role === "driver") {
    const q = search.trim().toLowerCase();
    const roster = q
      ? students.filter(
          (s) =>
            s.name.toLowerCase().includes(q) ||
            (s.mobile ?? "").includes(q) ||
            (s.className ?? "").toLowerCase().includes(q),
        )
      : students;
    const onBoard = students.filter(
      (s) => liveByStudent[s.id]?.label === "On Board",
    ).length;
    return (
      <Screen
        title="My Students"
        refreshing={isRefetching || isLoading}
        onRefresh={refetch}
      >
        {/* Count strip */}
        <HStack gap={12}>
          <CountTile label="Total" value={students.length} tint="violet" />
          <CountTile label="On Board" value={onBoard} tint="green" />
        </HStack>

        <View style={[styles.searchWrap, { marginTop: 16 }]}>
          <Search size={18} color={palette.text.tertiary} strokeWidth={1.8} />
          <TextInput
            placeholder="Search by name, class or mobile"
            placeholderTextColor={palette.text.tertiary}
            value={search}
            onChangeText={setSearch}
            style={styles.searchInput}
            autoCapitalize="none"
          />
        </View>

        {roster.length === 0 ? (
          <EmptyState
            icon={GraduationCap}
            title={isLoading ? "Loading…" : "No students on your route"}
            message="Students assigned to your route will appear here."
          />
        ) : (
          <VStack gap={12} style={{ marginTop: 16 }}>
            {roster.map((s) => (
              <DriverStudentRow
                key={s.id}
                student={s}
                live={liveByStudent[s.id]}
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

  // Schools get a read-only roster filtered by LIVE status (On Board / Reached
  // / Absent) — no lifecycle chips, no editing. Live status comes from today's
  // in-progress trips (same [[liveByStudent]] map the parent cards use).
  if (role === "school") {
    const q = search.trim().toLowerCase();
    const withStatus = students.map((s) => ({
      student: s,
      live: liveByStudent[s.id],
    }));
    const searched = q
      ? withStatus.filter(
          ({ student }) =>
            student.name.toLowerCase().includes(q) ||
            (student.className ?? "").toLowerCase().includes(q),
        )
      : withStatus;
    const byKey = (key: string) =>
      searched.filter(({ live }) => {
        if (key === "onboard") return live?.label === "On Board";
        if (key === "reached") return live?.label === "Reached School";
        if (key === "absent") return live?.label === "Absent";
        return true;
      });
    const CHIPS = [
      { key: "all", label: "All", count: searched.length },
      { key: "onboard", label: "On Board", count: byKey("onboard").length },
      { key: "reached", label: "Reached", count: byKey("reached").length },
      { key: "absent", label: "Absent", count: byKey("absent").length },
    ];
    const shown = byKey(schoolFilter);
    return (
      <Screen
        title="Students"
        refreshing={isRefetching || isLoading}
        onRefresh={refetch}
      >
        <View style={styles.searchWrap}>
          <Search size={18} color={palette.text.tertiary} strokeWidth={1.8} />
          <TextInput
            placeholder="Search students…"
            placeholderTextColor={palette.text.tertiary}
            value={search}
            onChangeText={setSearch}
            style={styles.searchInput}
            autoCapitalize="none"
          />
        </View>

        <HStack gap={8} style={{ marginTop: 14 }}>
          {CHIPS.map((c) => {
            const on = schoolFilter === c.key;
            return (
              <Pressable
                key={c.key}
                onPress={() => setSchoolFilter(c.key)}
                style={[styles.statusChip, on && styles.statusChipOn]}
              >
                <Text
                  variant="label-sm"
                  weight="700"
                  style={{ color: on ? "#FFFFFF" : palette.text.secondary }}
                >
                  {c.label}
                </Text>
                <View style={[styles.chipCount, on && styles.chipCountOn]}>
                  <Text
                    variant="caption"
                    weight="700"
                    style={{ color: on ? "#FFFFFF" : palette.text.tertiary }}
                  >
                    {c.count}
                  </Text>
                </View>
              </Pressable>
            );
          })}
        </HStack>

        {shown.length === 0 ? (
          <EmptyState
            icon={GraduationCap}
            title={isLoading ? "Loading…" : "No students here"}
            message="Students matching this status will appear here."
          />
        ) : (
          <VStack gap={12} style={{ marginTop: 16 }}>
            {shown.map(({ student, live }) => (
              <SchoolStudentRow
                key={student.id}
                student={student}
                live={live}
                onPress={() =>
                  navigation.navigate("StudentDetail", { id: student.id })
                }
              />
            ))}
          </VStack>
        )}
      </Screen>
    );
  }

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
            <HeaderIconButton
              icon={Plus}
              filled
              tint
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
                live={liveByStudent[s.id]}
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
        <Avatar
          name={student.name}
          size={46}
          photo={student.photo ? mediaUrl(student.photo) : undefined}
          svgXml={student.photo ? undefined : childAvatarSvg(student.id)}
          seed={student.id}
        />
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

/** School roster row — illustrated avatar, class, live status pill (read-only). */
function SchoolStudentRow({
  student,
  live,
  onPress,
}: {
  student: Student;
  live?: LiveStatus;
  onPress: () => void;
}) {
  return (
    <Card onPress={onPress} elevation="base">
      <HStack gap={14} align="center">
        <Avatar
          name={student.name}
          size={46}
          photo={student.photo ? mediaUrl(student.photo) : undefined}
          svgXml={student.photo ? undefined : childAvatarSvg(student.id)}
          seed={student.id}
        />
        <VStack gap={3} flex={1}>
          <Text variant="label-lg" tone="primary" numberOfLines={1}>
            {student.name}
          </Text>
          <Text variant="body-sm" tone="tertiary" numberOfLines={1}>
            {[
              student.className && `Class ${student.className}`,
              student.section,
            ]
              .filter(Boolean)
              .join(" - ")}
          </Text>
        </VStack>
        {live ? (
          <StatusChip label={live.label} tone={live.tone} />
        ) : (
          <ChevronRight
            size={18}
            color={palette.text.tertiary}
            strokeWidth={2}
          />
        )}
      </HStack>
    </Card>
  );
}

/** Driver "My Students" row — illustrated avatar, class/pickup, live pill, call. */
function DriverStudentRow({
  student,
  live,
  onPress,
}: {
  student: Student;
  live?: LiveStatus;
  onPress: () => void;
}) {
  const sub = [
    student.className && `Class ${student.className}`,
    student.routeName,
  ]
    .filter(Boolean)
    .join(" · ");
  return (
    <Card onPress={onPress} elevation="base">
      <HStack gap={14} align="center">
        <Avatar
          name={student.name}
          size={48}
          photo={student.photo ? mediaUrl(student.photo) : undefined}
          svgXml={student.photo ? undefined : childAvatarSvg(student.id)}
          seed={student.id}
        />
        <VStack gap={4} flex={1}>
          <Text variant="label-lg" tone="primary" numberOfLines={1}>
            {student.name}
          </Text>
          {sub ? (
            <Text variant="body-sm" tone="tertiary" numberOfLines={1}>
              {sub}
            </Text>
          ) : null}
          {live ? (
            <View style={{ alignSelf: "flex-start", marginTop: 2 }}>
              <StatusChip label={live.label} tone={live.tone} />
            </View>
          ) : null}
        </VStack>
        {student.mobile ? (
          <Pressable
            onPress={() => Linking.openURL(`tel:${student.mobile}`)}
            hitSlop={8}
            style={styles.callIcon}
          >
            <Phone size={16} color={accent.main} strokeWidth={2.1} />
          </Pressable>
        ) : (
          <ChevronRight
            size={18}
            color={palette.text.tertiary}
            strokeWidth={2}
          />
        )}
      </HStack>
    </Card>
  );
}

/** Small headline count tile for the driver roster. */
function CountTile({
  label,
  value,
  tint,
}: {
  label: string;
  value: number;
  tint: "violet" | "green";
}) {
  const c = tint === "violet" ? accent : { main: "#16A34A", soft: "#DCFCE7" };
  return (
    <View style={[styles.countTile, { backgroundColor: c.soft }]}>
      <Text variant="h2" style={{ color: c.main }}>
        {value}
      </Text>
      <Text variant="body-sm" tone="secondary">
        {label}
      </Text>
    </View>
  );
}

/** Client-kit child card — photo, class chip, transport rows, Call Driver. */
function ChildCard({
  student,
  live,
  onPress,
}: {
  student: Student;
  live?: LiveStatus;
  onPress: () => void;
}) {
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
          svgXml={student.photo ? undefined : childAvatarSvg(student.id)}
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
          label={
            live?.label ??
            (student.status === "active" ? "Active" : student.status)
          }
          tone={live?.tone ?? STATUS_TONE[student.status]}
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
  callIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    backgroundColor: accent.soft,
    alignItems: "center",
    justifyContent: "center",
  },
  countTile: {
    flex: 1,
    borderRadius: radius.lg,
    paddingVertical: 16,
    paddingHorizontal: 16,
    gap: 2,
  },
  statusChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: palette.border.default,
    backgroundColor: palette.surface.primary,
  },
  statusChipOn: { backgroundColor: accent.main, borderColor: accent.main },
  chipCount: {
    minWidth: 18,
    paddingHorizontal: 4,
    borderRadius: radius.full,
    backgroundColor: palette.surface.secondary,
    alignItems: "center",
  },
  chipCountOn: { backgroundColor: "rgba(255,255,255,0.22)" },
});
