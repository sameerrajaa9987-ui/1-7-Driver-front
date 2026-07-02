import React from "react";
import { View, Pressable, Platform, Alert, Image } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import {
  ArrowLeft,
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
} from "lucide-react-native";
import {
  useStudent,
  useRemoveStudent,
  useStudentQr,
} from "@modules/student/hooks/useStudents";
import { useDrivers } from "@modules/driver/hooks/useDrivers";
import { useVehicles } from "@modules/vehicle/hooks/useVehicles";
import { useRoutes } from "@modules/route/hooks/useRoutes";
import { useAuthStore } from "@shared/store/useAuthStore";
import { PERMISSIONS } from "@shared/permissions";
import { palette, radius } from "@shared/designSystem";
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
} from "@shared/ui";

const money = (n: number) => `₹${Math.round(n).toLocaleString("en-IN")}`;

const STATUS_TONE = {
  active: "success",
  pending: "warning",
  inactive: "neutral",
} as const;

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
    <HStack gap={10} align="center">
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
  const { data: student } = useStudent(id);
  const { data: qr } = useStudentQr(id);
  const removeMut = useRemoveStudent();

  const isAdmin = useAuthStore((s) => s.isAdmin);
  const admin = isAdmin();

  const { data: driversData } = useDrivers();
  const { data: vehiclesData } = useVehicles();
  const { data: routesData } = useRoutes();

  const driverName =
    (driversData?.data ?? []).find((d) => d.id === student?.driverId)
      ?.fullName || null;
  const vehicleNumber =
    (vehiclesData?.data ?? []).find((v) => v.id === student?.vehicleId)
      ?.vehicleNumber || null;
  const routeName =
    (routesData?.data ?? []).find((r) => r.id === student?.routeId)?.name ||
    null;

  const parentName =
    [student?.fatherName, student?.motherName].filter(Boolean).join(" / ") ||
    null;

  return (
    <Screen
      overline="Student"
      title={student?.name || "Student"}
      subtitle={student?.mobile || ""}
    >
      <Pressable
        onPress={() => navigation.goBack()}
        hitSlop={6}
        style={{ marginBottom: 16 }}
      >
        <HStack gap={6} align="center">
          <ArrowLeft size={18} color={palette.text.link} strokeWidth={2} />
          <Text variant="label" tone="link">
            Back to students
          </Text>
        </HStack>
      </Pressable>

      <Card style={{ marginBottom: 16 }}>
        <HStack gap={14} align="center">
          <Avatar name={student?.name || "?"} size={54} />
          <VStack gap={6} flex={1}>
            {student ? (
              <StatusChip
                label={student.status}
                tone={STATUS_TONE[student.status]}
              />
            ) : null}
            {student?.className || student?.schoolName ? (
              <HStack gap={6} align="center">
                <School
                  size={14}
                  color={palette.text.tertiary}
                  strokeWidth={1.9}
                />
                <Text variant="body-sm" tone="secondary">
                  {[student?.className, student?.schoolName]
                    .filter(Boolean)
                    .join(" · ")}
                </Text>
              </HStack>
            ) : null}
          </VStack>
          {admin && (
            <Button
              label="Edit"
              variant="secondary"
              fullWidth={false}
              icon={
                <Pencil
                  size={15}
                  color={palette.text.primary}
                  strokeWidth={2}
                />
              }
              onPress={() => navigation.navigate("StudentForm", { id })}
            />
          )}
        </HStack>
      </Card>

      <Card style={{ marginBottom: 16 }}>
        <VStack gap={12}>
          <Text variant="h4" tone="primary">
            Contact & pickup
          </Text>
          <InfoRow icon={Phone} label="Mobile" value={student?.mobile} />
          <InfoRow
            icon={Phone}
            label="WhatsApp"
            value={student?.whatsappNumber}
          />
          <InfoRow icon={Users} label="Parent" value={parentName} />
          <InfoRow icon={MapPin} label="Home" value={student?.homeAddress} />
          <InfoRow
            icon={MapPin}
            label="Pickup pt"
            value={
              student?.pickupPoint
                ? `${student.pickupPoint.lat}, ${student.pickupPoint.lng}`
                : null
            }
          />
          <InfoRow icon={School} label="Pickup" value={student?.pickupTime} />
          <InfoRow icon={School} label="Drop" value={student?.dropTime} />
        </VStack>
      </Card>

      <Card style={{ marginBottom: 16 }}>
        <VStack gap={12}>
          <Text variant="h4" tone="primary">
            Transport
          </Text>
          <HStack gap={12}>
            <View style={{ flex: 1 }}>
              <StatTile
                label="Monthly fee"
                value={money(student?.monthlyFee ?? 0)}
                tone="teal"
              />
            </View>
            <View style={{ flex: 1 }}>
              <StatTile
                label="Due day"
                value={student?.dueDate ? String(student.dueDate) : "—"}
                tone="light"
              />
            </View>
          </HStack>
          <InfoRow icon={RouteIcon} label="Route" value={routeName} />
          <InfoRow icon={UserCheck} label="Driver" value={driverName} />
          <InfoRow icon={Bus} label="Vehicle" value={vehicleNumber} />
        </VStack>
      </Card>

      {qr?.token ? (
        <Card style={{ marginBottom: 16 }}>
          <VStack gap={14}>
            <HStack gap={8} align="center">
              <QrCode size={18} color={palette.text.accent} strokeWidth={2} />
              <Text variant="h4" tone="primary">
                Bus pass (QR)
              </Text>
            </HStack>
            <VStack align="center" gap={10}>
              <View style={qrFrame}>
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
      ) : null}

      {admin && student?.status !== "inactive" && (
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
      )}

      {admin && student?.status !== "inactive" && (
        <Button
          label="Remove student"
          variant="destructive"
          icon={<Trash2 size={16} color="#FFFFFF" strokeWidth={2} />}
          style={{ marginTop: 16 }}
          loading={removeMut.isPending}
          onPress={() =>
            confirm("Remove this student?", () =>
              removeMut.mutate(id, { onSuccess: () => navigation.goBack() }),
            )
          }
        />
      )}
    </Screen>
  );
}

const qrFont = Platform.select({
  ios: "Menlo",
  android: "monospace",
  default: "monospace",
});

const qrFrame = {
  padding: 12,
  borderRadius: radius.lg,
  backgroundColor: "#FFFFFF",
  borderWidth: 1,
  borderColor: palette.border.default,
} as const;
