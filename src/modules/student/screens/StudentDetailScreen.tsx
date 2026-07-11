/**
 * StudentDetailScreen — operator "Student Details" (client mockup): a profile
 * header with a Call-Driver action, then an Overview / Attendance / Payments /
 * Bus Pass tab bar. Overview carries Contact & Pickup and Transport Details;
 * the other tabs hold the attendance rollup, payment rollup and QR bus pass.
 */
import React, { useState } from "react";
import {
  View,
  Pressable,
  Platform,
  Alert,
  Image,
  Linking,
  StyleSheet,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import {
  Pencil,
  Phone,
  MapPin,
  School,
  Users,
  Bus,
  Route as RouteIcon,
  Wallet,
  UserCheck,
  Trash2,
  QrCode,
  CalendarClock,
} from "lucide-react-native";
import {
  useStudent,
  useRemoveStudent,
  useStudentQr,
} from "@modules/student/hooks/useStudents";
import {
  useAttendanceSummary,
  useAttendanceList,
} from "@modules/attendance/hooks/useAttendance";
import { useStudentPaymentSummary } from "@modules/payment/hooks/usePayments";
import { useDrivers } from "@modules/driver/hooks/useDrivers";
import { useVehicles } from "@modules/vehicle/hooks/useVehicles";
import { useRoutes } from "@modules/route/hooks/useRoutes";
import { useAuthStore } from "@shared/store/useAuthStore";
import { palette, radius, accent } from "@shared/designSystem";
import { childAvatarSvg } from "@shared/avatars";
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
  StatTile,
  HeaderIconButton,
} from "@shared/ui";

const money = (n: number) => `₹${Math.round(n).toLocaleString("en-IN")}`;

const STATUS_TONE = {
  active: "success",
  pending: "warning",
  inactive: "neutral",
} as const;

type Tab = "overview" | "attendance" | "payments" | "buspass";
const TABS: { key: Tab; label: string }[] = [
  { key: "overview", label: "Overview" },
  { key: "attendance", label: "Attendance" },
  { key: "payments", label: "Payments" },
  { key: "buspass", label: "Bus Pass" },
];

function confirm(msg: string, onYes: () => void) {
  if (Platform.OS === "web") {
    if (window.confirm(msg)) onYes();
  } else {
    Alert.alert("Please confirm", msg, [
      { text: "Cancel", style: "cancel" },
      { text: "Remove", style: "destructive", onPress: onYes },
    ]);
  }
}

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: any;
  label: string;
  value?: string | null;
}) {
  if (!value) return null;
  return (
    <HStack gap={10} align="flex-start">
      <Icon size={16} color={palette.text.tertiary} strokeWidth={1.9} />
      <Text variant="body-sm" tone="tertiary" style={{ width: 96 }}>
        {label}
      </Text>
      <Text variant="body-sm" tone="secondary" style={{ flex: 1 }}>
        {value}
      </Text>
    </HStack>
  );
}

export default function StudentDetailScreen() {
  const navigation = useNavigation<any>();
  const nav = useRoute<any>();
  const id = nav.params?.id as string;
  const [tab, setTab] = useState<Tab>("overview");

  const { data: student } = useStudent(id);
  const { data: qr } = useStudentQr(id);
  const { data: attendance } = useAttendanceSummary(id);
  const { data: attHistory } = useAttendanceList({ studentId: id, limit: 5 });
  const { data: paySummary } = useStudentPaymentSummary(id);
  const removeMut = useRemoveStudent();

  const isAdmin = useAuthStore((s) => s.isAdmin);
  const admin = isAdmin();

  const { data: driversData } = useDrivers({ enabled: admin });
  const { data: vehiclesData } = useVehicles({ enabled: admin });
  const { data: routesData } = useRoutes({ enabled: admin });

  const driverName =
    student?.driverName ||
    (driversData?.data ?? []).find((d) => d.id === student?.driverId)
      ?.fullName ||
    null;
  const vehicleNumber =
    student?.vehicleNumber ||
    (vehiclesData?.data ?? []).find((v) => v.id === student?.vehicleId)
      ?.vehicleNumber ||
    null;
  const routeName =
    student?.routeName ||
    (routesData?.data ?? []).find((r) => r.id === student?.routeId)?.name ||
    null;

  const parentName =
    [student?.fatherName, student?.motherName].filter(Boolean).join(" / ") ||
    null;

  const classLine = [
    student?.className && `Class ${student.className}`,
    student?.section && `Section ${student.section}`,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <Screen
      title="Student Details"
      onBack={() => navigation.goBack()}
      right={
        admin ? (
          <HeaderIconButton
            icon={Pencil}
            onPress={() => navigation.navigate("StudentForm", { id })}
          />
        ) : undefined
      }
    >
      {/* Profile header */}
      <Card>
        <HStack gap={14} align="center">
          <Avatar
            name={student?.name || "?"}
            size={58}
            photo={student?.photo ? mediaUrl(student.photo) : undefined}
            svgXml={student?.photo ? undefined : childAvatarSvg(id)}
            seed={id}
          />
          <VStack gap={5} flex={1}>
            <HStack gap={8} align="center">
              <Text variant="h3" tone="primary" numberOfLines={1}>
                {student?.name || "Student"}
              </Text>
              {student ? (
                <StatusChip
                  label={student.status}
                  tone={STATUS_TONE[student.status]}
                />
              ) : null}
            </HStack>
            {classLine ? (
              <Text variant="body-sm" tone="tertiary">
                {classLine}
              </Text>
            ) : null}
            {student?.driverMobile ? (
              <Pressable
                onPress={() => Linking.openURL(`tel:${student.driverMobile}`)}
                style={styles.callBtn}
              >
                <Phone size={13} color={accent.main} strokeWidth={2.2} />
                <Text
                  variant="label-sm"
                  weight="700"
                  style={{ color: accent.dark }}
                >
                  Call Driver
                </Text>
              </Pressable>
            ) : null}
          </VStack>
        </HStack>
      </Card>

      {/* Tab bar */}
      <View style={styles.tabBar}>
        {TABS.map((t) => {
          const active = tab === t.key;
          return (
            <Pressable
              key={t.key}
              onPress={() => setTab(t.key)}
              style={styles.tab}
            >
              <Text
                variant="label"
                weight={active ? "700" : "600"}
                style={{
                  color: active ? accent.main : palette.text.tertiary,
                }}
              >
                {t.label}
              </Text>
              <View
                style={[
                  styles.tabUnderline,
                  active && { backgroundColor: accent.main },
                ]}
              />
            </Pressable>
          );
        })}
      </View>

      {tab === "overview" ? (
        <VStack gap={16}>
          <Card>
            <VStack gap={12}>
              <Text variant="h4" tone="primary">
                Contact & Pickup
              </Text>
              <InfoRow icon={Users} label="Parent" value={parentName} />
              <InfoRow icon={Phone} label="Mobile" value={student?.mobile} />
              <InfoRow
                icon={MapPin}
                label="Home"
                value={student?.homeAddress}
              />
              <InfoRow
                icon={MapPin}
                label="Pickup pt"
                value={
                  student?.pickupPoint
                    ? `${student.pickupPoint.lat}, ${student.pickupPoint.lng}`
                    : null
                }
              />
              <InfoRow
                icon={School}
                label="Pickup"
                value={student?.pickupTime}
              />
              <InfoRow icon={School} label="Drop" value={student?.dropTime} />
            </VStack>
          </Card>

          <Card>
            <VStack gap={12}>
              <Text variant="h4" tone="primary">
                Transport Details
              </Text>
              <InfoRow icon={RouteIcon} label="Route" value={routeName} />
              <InfoRow icon={UserCheck} label="Driver" value={driverName} />
              <InfoRow icon={Bus} label="Vehicle" value={vehicleNumber} />
              <InfoRow
                icon={Wallet}
                label="Monthly fee"
                value={money(student?.monthlyFee ?? 0)}
              />
              <InfoRow
                icon={CalendarClock}
                label="Due day"
                value={student?.dueDate ? String(student.dueDate) : null}
              />
            </VStack>
          </Card>

          {admin && student?.status !== "inactive" ? (
            <VStack gap={12}>
              <Button
                label={
                  student?.status === "pending"
                    ? "Approve / Assign transport"
                    : "Reassign transport"
                }
                size="lg"
                icon={<Wallet size={18} color="#FFFFFF" strokeWidth={2} />}
                onPress={() => navigation.navigate("StudentApprove", { id })}
              />
              <Button
                label="Remove student"
                variant="destructive"
                icon={<Trash2 size={16} color="#FFFFFF" strokeWidth={2} />}
                loading={removeMut.isPending}
                onPress={() =>
                  confirm("Remove this student?", () =>
                    removeMut.mutate(id, {
                      onSuccess: () => navigation.goBack(),
                    }),
                  )
                }
              />
            </VStack>
          ) : null}
        </VStack>
      ) : null}

      {tab === "attendance" ? (
        <Card>
          <VStack gap={12}>
            <Text variant="h4" tone="primary">
              Attendance
            </Text>
            <HStack gap={12}>
              <View style={{ flex: 1 }}>
                <StatTile
                  label="Pickups"
                  value={String(attendance?.pickups ?? 0)}
                  tone="light"
                />
              </View>
              <View style={{ flex: 1 }}>
                <StatTile
                  label="Drops"
                  value={String(attendance?.drops ?? 0)}
                  tone="light"
                />
              </View>
              <View style={{ flex: 1 }}>
                <StatTile
                  label="Absences"
                  value={String(attendance?.absences ?? 0)}
                  tone={attendance?.absences ? "slate" : "light"}
                />
              </View>
            </HStack>
            {(attHistory?.data ?? []).length > 0 ? (
              <VStack gap={8}>
                <Text variant="caption" tone="tertiary">
                  Recent verified attendance
                </Text>
                {(attHistory?.data ?? []).map((r) => (
                  <HStack key={r.id} gap={8} align="center">
                    <StatusChip
                      label={r.type === "pickup" ? "Picked up" : "Dropped"}
                      tone={r.type === "pickup" ? "info" : "success"}
                    />
                    <Text variant="body-sm" tone="tertiary">
                      {new Date(r.createdAt).toLocaleString([], {
                        day: "2-digit",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                      {" · "}
                      {r.method.toUpperCase()}
                    </Text>
                  </HStack>
                ))}
              </VStack>
            ) : (
              <Text variant="body-sm" tone="tertiary">
                No verified attendance yet.
              </Text>
            )}
          </VStack>
        </Card>
      ) : null}

      {tab === "payments" ? (
        <Card>
          <VStack gap={12}>
            <Text variant="h4" tone="primary">
              Payments
            </Text>
            <HStack gap={12}>
              <View style={{ flex: 1 }}>
                <StatTile
                  label={`Paid · ${paySummary?.verifiedCount ?? 0} receipt${(paySummary?.verifiedCount ?? 0) === 1 ? "" : "s"}`}
                  value={money(paySummary?.paid ?? 0)}
                  tone="light"
                />
              </View>
              <View style={{ flex: 1 }}>
                <StatTile
                  label={`Pending · ${paySummary?.pendingCount ?? 0}`}
                  value={money(paySummary?.pending ?? 0)}
                  tone={paySummary?.pending ? "teal" : "light"}
                />
              </View>
            </HStack>
          </VStack>
        </Card>
      ) : null}

      {tab === "buspass" ? (
        qr?.token ? (
          <Card>
            <VStack gap={14}>
              <HStack gap={8} align="center">
                <QrCode size={18} color={palette.text.accent} strokeWidth={2} />
                <Text variant="h4" tone="primary">
                  Bus Pass
                </Text>
              </HStack>
              <VStack align="center" gap={10}>
                <View style={styles.qrFrame}>
                  <Image
                    source={{
                      uri: `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(
                        qr.token,
                      )}`,
                    }}
                    style={{ width: 220, height: 220 }}
                    resizeMode="contain"
                  />
                </View>
                <Text
                  variant="caption"
                  tone="tertiary"
                  align="center"
                  style={{ fontFamily: qrFont }}
                  numberOfLines={2}
                >
                  {qr.token}
                </Text>
                <Text variant="body-sm" tone="secondary" align="center">
                  Show this at pickup for verified attendance.
                </Text>
              </VStack>
            </VStack>
          </Card>
        ) : (
          <Card>
            <Text variant="body-sm" tone="tertiary" align="center">
              No bus pass issued yet.
            </Text>
          </Card>
        )
      ) : null}
    </Screen>
  );
}

const qrFont = Platform.select({
  ios: "Menlo",
  android: "monospace",
  default: "monospace",
});

const styles = StyleSheet.create({
  callBtn: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: radius.full,
    backgroundColor: accent.soft,
    marginTop: 2,
  },
  tabBar: {
    flexDirection: "row",
    marginTop: 18,
    marginBottom: 18,
    borderBottomWidth: 1,
    borderBottomColor: palette.border.subtle,
  },
  tab: {
    flex: 1,
    alignItems: "center",
    paddingBottom: 10,
    gap: 8,
  },
  tabUnderline: {
    height: 2,
    width: "70%",
    borderRadius: 2,
    backgroundColor: "transparent",
  },
  qrFrame: {
    padding: 12,
    borderRadius: radius.lg,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: palette.border.default,
  },
});
