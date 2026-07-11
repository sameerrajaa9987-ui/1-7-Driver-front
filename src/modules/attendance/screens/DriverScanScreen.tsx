/**
 * DriverScanScreen — "Scan QR" (client mockup): a dark scan panel with a framed
 * viewfinder + Flash, then manual 8-char code entry (the cross-platform path;
 * a native camera would auto-fill the code on device). Below: the expected
 * students and their live scan status.
 */
import React, { useState } from "react";
import { View, Pressable, StyleSheet } from "react-native";
import { QrCode, CheckCircle2, Bus, Zap, Keyboard } from "lucide-react-native";
import { useScanAttendance } from "@modules/attendance/hooks/useAttendance";
import { useTrips } from "@modules/trip/hooks/useTrips";
import { getCurrentCoord, todayISO } from "@modules/trip/utils";
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
  const { data: tripsData } = useTrips({
    date: todayISO(),
    status: "in_progress",
  });
  const trip = tripsData?.data?.[0];
  const scanMut = useScanAttendance();
  const [token, setToken] = useState("");
  const [flash, setFlash] = useState(false);

  const verify = async () => {
    if (!trip || !token.trim()) return;
    const gps = await getCurrentCoord();
    scanMut.mutate(
      { tripId: trip.id, token: token.trim(), gps },
      { onSuccess: () => setToken("") },
    );
  };

  if (!trip) {
    return (
      <Screen title="Scan QR">
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
    <Screen title="Scan QR">
      {/* Dark scan panel */}
      <View style={styles.scanner}>
        <Text variant="h3" align="center" style={{ color: "#FFFFFF" }}>
          Scan Student Bus Pass
        </Text>
        <Text
          variant="body-sm"
          align="center"
          style={{ color: "rgba(255,255,255,0.6)", marginTop: 4 }}
        >
          Align QR code within the frame
        </Text>

        <View style={styles.frame}>
          <View style={styles.qrPlaceholder}>
            <QrCode size={72} color={palette.ink[300]} strokeWidth={1.4} />
          </View>
          {/* corner brackets */}
          <View style={[styles.corner, styles.tl]} />
          <View style={[styles.corner, styles.tr]} />
          <View style={[styles.corner, styles.bl]} />
          <View style={[styles.corner, styles.br]} />
        </View>

        <Pressable
          onPress={() => setFlash((f) => !f)}
          style={[
            styles.flashBtn,
            flash && { backgroundColor: "rgba(255,255,255,0.25)" },
          ]}
        >
          <Zap
            size={16}
            color={flash ? "#FDB022" : "#FFFFFF"}
            strokeWidth={2.2}
          />
          <Text variant="label" weight="600" style={{ color: "#FFFFFF" }}>
            {flash ? "Flash Off" : "Flash On"}
          </Text>
        </Pressable>
      </View>

      {/* Result / error */}
      {result ? (
        <Card
          style={{
            marginTop: 16,
            backgroundColor: tints.green.bg,
            borderColor: tints.green.ring,
          }}
        >
          <HStack gap={10} align="center">
            <CheckCircle2
              size={22}
              color={tints.green.icon}
              strokeWidth={2.2}
            />
            <VStack gap={2} flex={1}>
              <Text variant="label-lg" style={{ color: tints.green.fg }}>
                {result.type} recorded
              </Text>
              <Text variant="body-sm" style={{ color: tints.green.fg }}>
                {result.studentName}
              </Text>
            </VStack>
          </HStack>
        </Card>
      ) : null}
      {scanMut.isError ? (
        <Text variant="body-sm" tone="danger" style={{ marginTop: 12 }}>
          {apiErrorMessage(scanMut.error)}
        </Text>
      ) : null}

      {/* Manual entry */}
      <Text
        variant="label"
        weight="600"
        tone="tertiary"
        align="center"
        style={{ marginTop: 18, marginBottom: 10 }}
      >
        or Enter Code Manually
      </Text>
      <TextField
        label=""
        value={token}
        onChangeText={setToken}
        placeholder="Enter pass code"
        autoCapitalize="none"
        autoCorrect={false}
        leading={
          <Keyboard size={18} color={palette.text.tertiary} strokeWidth={1.8} />
        }
        onSubmitEditing={verify}
      />
      <Button
        label="Verify Attendance"
        loading={scanMut.isPending}
        disabled={!token.trim()}
        onPress={verify}
        style={{ marginTop: 12 }}
      />

      {/* Students on this trip */}
      <Text
        variant="h3"
        tone="primary"
        style={{ marginTop: 24, marginBottom: 12 }}
      >
        Students on this trip
      </Text>
      <VStack gap={10}>
        {trip.stops
          .slice()
          .sort((a, b) => a.order - b.order)
          .map((stop) => {
            const done =
              stop.status === "picked_up" || stop.status === "dropped";
            return (
              <Card key={stop.studentId}>
                <HStack gap={12} align="center">
                  <Text variant="label" tone="tertiary" style={{ width: 22 }}>
                    {stop.order}
                  </Text>
                  <Text variant="label-lg" tone="primary" style={{ flex: 1 }}>
                    {stop.studentName}
                  </Text>
                  <StatusChip
                    label={
                      done
                        ? "Verified"
                        : stop.status === "no_show"
                          ? "No show"
                          : "Pending"
                    }
                    tone={
                      done
                        ? "success"
                        : stop.status === "no_show"
                          ? "danger"
                          : "neutral"
                    }
                  />
                </HStack>
              </Card>
            );
          })}
      </VStack>
    </Screen>
  );
}

const BRK = "#22C55E";
const styles = StyleSheet.create({
  scanner: {
    backgroundColor: "#1E2B4D",
    borderRadius: radius.xl,
    padding: 22,
    alignItems: "center",
  },
  frame: {
    marginTop: 18,
    width: 210,
    height: 210,
    alignItems: "center",
    justifyContent: "center",
  },
  qrPlaceholder: {
    width: 176,
    height: 176,
    borderRadius: radius.md,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  corner: {
    position: "absolute",
    width: 30,
    height: 30,
    borderColor: BRK,
  },
  tl: {
    top: 0,
    left: 0,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderTopLeftRadius: 8,
  },
  tr: {
    top: 0,
    right: 0,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderTopRightRadius: 8,
  },
  bl: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderBottomLeftRadius: 8,
  },
  br: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderBottomRightRadius: 8,
  },
  flashBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 20,
    paddingHorizontal: 20,
    paddingVertical: 11,
    borderRadius: radius.full,
    backgroundColor: "rgba(255,255,255,0.12)",
  },
});
