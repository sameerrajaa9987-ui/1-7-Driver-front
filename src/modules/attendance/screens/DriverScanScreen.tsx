import React, { useState } from "react";
import { View } from "react-native";
import {
  ScanLine,
  QrCode,
  CheckCircle2,
  Users,
  Bus,
} from "lucide-react-native";
import { useScanAttendance } from "@modules/attendance/hooks/useAttendance";
import { useTrips } from "@modules/trip/hooks/useTrips";
import {
  getCurrentCoord,
  todayISO,
  TRIP_TYPE_LABEL,
} from "@modules/trip/utils";
import { apiErrorMessage } from "@api/apiClient";
import { palette, radius, tints } from "@shared/designSystem";
import {
  Screen,
  Text,
  VStack,
  HStack,
  Card,
  Button,
  TextField,
  EmptyState,
  StatusChip,
} from "@shared/ui";

export default function DriverScanScreen() {
  // Today's active trip (first in-progress trip for this driver).
  const { data: tripsData } = useTrips({
    date: todayISO(),
    status: "in_progress",
  });
  const trip = tripsData?.data?.[0];

  const scanMut = useScanAttendance();
  const [token, setToken] = useState("");

  const verify = async () => {
    if (!trip || !token.trim()) return;
    // On native a camera scanner (expo-camera / expo-barcode-scanner) would fill
    // the code automatically; the manual field below is the cross-platform
    // fallback that also works on web.
    const gps = await getCurrentCoord();
    scanMut.mutate(
      { tripId: trip.id, token: token.trim(), gps },
      { onSuccess: () => setToken("") },
    );
  };

  if (!trip) {
    return (
      <Screen overline="Attendance" title="Scan bus pass">
        <EmptyState
          icon={Bus}
          title="Start a trip first"
          message="You need an in-progress trip today before you can scan attendance."
        />
      </Screen>
    );
  }

  const result = scanMut.data;

  return (
    <Screen
      overline="Attendance"
      title="Scan bus pass"
      subtitle="Verify each student at pickup or drop"
    >
      <Card style={{ marginBottom: 16 }}>
        <HStack gap={12} align="center">
          <View style={iconWrap}>
            <Bus size={20} color={tints.teal.icon} strokeWidth={2} />
          </View>
          <VStack gap={4} flex={1}>
            <Text variant="label-lg" tone="primary">
              Active trip · {TRIP_TYPE_LABEL[trip.type]}
            </Text>
            <Text variant="body-sm" tone="tertiary">
              {trip.date} · {trip.stops.length} students
            </Text>
          </VStack>
          <StatusChip label="In progress" tone="info" />
        </HStack>
      </Card>

      {scanMut.isError && (
        <View style={errorBox}>
          <Text variant="body-sm" tone="danger">
            {apiErrorMessage(scanMut.error)}
          </Text>
        </View>
      )}

      {result ? (
        <Card style={[successCard, { marginBottom: 16 }]}>
          <HStack gap={10} align="center">
            <CheckCircle2
              size={22}
              color={tints.green.icon}
              strokeWidth={2.2}
            />
            <VStack gap={2} flex={1}>
              <Text variant="label-lg" style={{ color: tints.green.fg }}>
                ✓ {result.type} attendance recorded
              </Text>
              <Text variant="body-sm" style={{ color: tints.green.fg }}>
                {result.studentName}
              </Text>
            </VStack>
          </HStack>
        </Card>
      ) : null}

      <Card style={{ marginBottom: 16 }}>
        <VStack gap={14}>
          <HStack gap={8} align="center">
            <ScanLine size={18} color={palette.text.accent} strokeWidth={2} />
            <Text variant="h4" tone="primary">
              Scan or enter code
            </Text>
          </HStack>
          <Text variant="body-sm" tone="tertiary">
            Point your camera at the student&apos;s QR, or paste the code
            (STU.xxx…) below.
          </Text>
          <TextField
            label="Bus pass code"
            value={token}
            onChangeText={setToken}
            placeholder="STU.xxxxxxxx"
            autoCapitalize="none"
            autoCorrect={false}
            leading={
              <QrCode
                size={18}
                color={palette.text.tertiary}
                strokeWidth={1.8}
              />
            }
            onSubmitEditing={verify}
          />
          <Button
            label="Verify attendance"
            size="lg"
            loading={scanMut.isPending}
            disabled={!token.trim()}
            onPress={verify}
          />
        </VStack>
      </Card>

      <HStack align="center" gap={8} style={{ marginBottom: 12 }}>
        <Users size={18} color={palette.text.tertiary} strokeWidth={2} />
        <Text variant="h4" tone="primary">
          Expected students
        </Text>
      </HStack>

      <VStack gap={10}>
        {trip.stops
          .slice()
          .sort((a, b) => a.order - b.order)
          .map((stop) => (
            <Card key={stop.studentId} elevation="base">
              <HStack gap={12} align="center">
                <Text variant="label" tone="tertiary" style={{ width: 24 }}>
                  {stop.order}
                </Text>
                <Text variant="label-lg" tone="primary" style={{ flex: 1 }}>
                  {stop.studentName}
                </Text>
                <StatusChip
                  label={stop.status.replace("_", " ")}
                  tone={
                    stop.status === "picked_up" || stop.status === "dropped"
                      ? "success"
                      : stop.status === "no_show"
                        ? "danger"
                        : "neutral"
                  }
                />
              </HStack>
            </Card>
          ))}
      </VStack>
    </Screen>
  );
}

const iconWrap = {
  width: 40,
  height: 40,
  borderRadius: radius.md,
  backgroundColor: tints.teal.bg,
  alignItems: "center",
  justifyContent: "center",
} as const;

const successCard = {
  backgroundColor: tints.green.bg,
  borderColor: tints.green.ring,
  borderWidth: 1,
} as const;

const errorBox = {
  padding: 14,
  borderRadius: radius.md,
  backgroundColor: palette.danger.bg,
  borderWidth: 1,
  borderColor: palette.danger.border,
  marginBottom: 16,
} as const;
