/**
 * BusPassScreen — the child's digital bus pass (mockup): an indigo gradient
 * card with the child's identity, a signed QR the driver scans at pickup/drop,
 * and the bus-pass id. Switches between children when a parent has more than one.
 */
import React, { useMemo, useState } from "react";
import { View, Pressable, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import QRCode from "react-native-qrcode-svg";
import { QrCode, ShieldCheck } from "lucide-react-native";
import { useStudents } from "@modules/student/hooks/useStudents";
import { useStudentQr } from "@modules/attendance/hooks/useAttendance";
import {
  palette,
  radius,
  gradients,
  accent,
  glass,
} from "@shared/designSystem";
import {
  Screen,
  Text,
  VStack,
  HStack,
  Avatar,
  childEmoji,
  EmptyState,
} from "@shared/ui";
import { mediaUrl } from "@shared/media";

/** Stable, human-readable pass id from the student id. */
function passId(id: string) {
  return (
    "SC" +
    id
      .replace(/[^a-z0-9]/gi, "")
      .slice(-10)
      .toUpperCase()
  );
}

export default function BusPassScreen() {
  const { data, isLoading, refetch, isRefetching } = useStudents({ limit: 50 });
  const children = useMemo(() => data?.data ?? [], [data]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const child =
    children.find((c) => c.id === selectedId) ?? children[0] ?? null;

  const qr = useStudentQr(child?.id);
  const classLine = child
    ? [child.className && `Class ${child.className}`, child.section]
        .filter(Boolean)
        .join(" - ")
    : "";

  return (
    <Screen
      title="Bus Pass"
      refreshing={isRefetching || isLoading}
      onRefresh={refetch}
    >
      {!child ? (
        <EmptyState
          icon={QrCode}
          title={isLoading ? "Loading…" : "No child added yet"}
          message="Add your child to get their digital bus pass."
        />
      ) : (
        <>
          {/* Child switcher (only with more than one child) */}
          {children.length > 1 ? (
            <HStack gap={8} style={{ marginBottom: 14 }} wrap>
              {children.map((c) => {
                const active = c.id === child.id;
                return (
                  <Pressable
                    key={c.id}
                    onPress={() => setSelectedId(c.id)}
                    style={[
                      styles.chip,
                      active && {
                        backgroundColor: accent.main,
                        borderColor: accent.main,
                      },
                    ]}
                  >
                    <Text
                      variant="label"
                      weight="600"
                      style={{
                        color: active ? "#FFFFFF" : palette.text.secondary,
                      }}
                    >
                      {c.name.split(" ")[0]}
                    </Text>
                  </Pressable>
                );
              })}
            </HStack>
          ) : null}

          <View style={styles.card}>
            <LinearGradient
              colors={[...gradients.violet] as [string, string, ...string[]]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.cardHead}
            >
              <HStack gap={12} align="center">
                <Avatar
                  name={child.name}
                  seed={child.id}
                  size={46}
                  photo={child.photo ? mediaUrl(child.photo) : undefined}
                  fallbackEmoji={childEmoji(child.gender)}
                />
                <VStack gap={2} flex={1}>
                  <Text
                    variant="label-lg"
                    weight="700"
                    style={{ color: "#FFFFFF" }}
                  >
                    {child.name}
                  </Text>
                  <Text
                    variant="body-sm"
                    style={{ color: "rgba(255,255,255,0.82)" }}
                  >
                    {classLine}
                    {child.routeName ? ` · ${child.routeName}` : ""}
                  </Text>
                </VStack>
              </HStack>
            </LinearGradient>

            {/* QR */}
            <View style={styles.qrArea}>
              <View style={styles.qrBox}>
                {qr.data?.token ? (
                  <QRCode
                    value={qr.data.token}
                    size={196}
                    color={palette.ink[900]}
                    backgroundColor="#FFFFFF"
                  />
                ) : (
                  <View style={styles.qrPlaceholder}>
                    <QrCode
                      size={48}
                      color={palette.ink[300]}
                      strokeWidth={1.5}
                    />
                  </View>
                )}
              </View>

              <HStack gap={8} align="center" style={{ marginTop: 18 }}>
                <Text variant="caption" tone="tertiary">
                  Bus Pass ID
                </Text>
                <Text variant="label" weight="700" tone="primary">
                  {passId(child.id)}
                </Text>
              </HStack>
            </View>

            {/* Footer instruction */}
            <View style={styles.footer}>
              <View style={[styles.footerIcon, glass.dark]}>
                <ShieldCheck size={16} color={accent.main} strokeWidth={2} />
              </View>
              <Text
                variant="body-sm"
                align="center"
                style={{ color: accent.dark, flex: 1 }}
              >
                Show this QR code to the driver for pickup and drop
                verification.
              </Text>
            </View>
          </View>
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: palette.border.default,
    backgroundColor: palette.surface.primary,
  },
  card: {
    backgroundColor: palette.surface.primary,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: palette.border.default,
    overflow: "hidden",
  },
  cardHead: { padding: 18 },
  qrArea: { alignItems: "center", paddingVertical: 26 },
  qrBox: {
    padding: 16,
    backgroundColor: "#FFFFFF",
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: palette.border.default,
  },
  qrPlaceholder: {
    width: 196,
    height: 196,
    alignItems: "center",
    justifyContent: "center",
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: accent.soft,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  footerIcon: {
    width: 30,
    height: 30,
    borderRadius: radius.full,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
});
