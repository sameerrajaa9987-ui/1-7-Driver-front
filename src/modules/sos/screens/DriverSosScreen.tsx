/**
 * DriverSosScreen — the driver's emergency screen (client mockup): concentric
 * pulse rings around a big SOS button, the list of who gets notified, and a
 * safety note. Two-step (tap → confirm) to avoid accidental alerts.
 */
import React, { useState } from "react";
import { View, Pressable, Platform, Alert, StyleSheet } from "react-native";
import {
  ShieldAlert,
  CheckCircle2,
  UserCog,
  Users,
  School,
  Info,
} from "lucide-react-native";
import { useTriggerSos } from "@modules/sos/hooks/useSos";
import { getCurrentCoord } from "@modules/trip/utils";
import { apiErrorMessage } from "@api/apiClient";
import { palette, tints, radius } from "@shared/designSystem";
import { Screen, Text, VStack, HStack, Card, Button } from "@shared/ui";

export default function DriverSosScreen() {
  const trigger = useTriggerSos();
  const [sent, setSent] = useState(false);

  const doSend = async () => {
    const coord = await getCurrentCoord();
    trigger.mutate(
      { lat: coord.lat, lng: coord.lng },
      { onSuccess: () => setSent(true) },
    );
  };

  const confirmSend = () => {
    if (Platform.OS === "web") {
      if (window.confirm("Send an emergency alert with your live location?"))
        doSend();
    } else {
      Alert.alert(
        "Emergency SOS",
        "This sends an emergency alert with your live location to the operator, parents and school. Use only in a real emergency.",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Send SOS", style: "destructive", onPress: doSend },
        ],
      );
    }
  };

  if (sent) {
    return (
      <Screen title="SOS Alert">
        <Card
          style={{ backgroundColor: tints.red.bg, borderColor: tints.red.ring }}
        >
          <VStack gap={12} align="center">
            <View style={styles.sentIcon}>
              <CheckCircle2
                size={30}
                color={tints.red.icon}
                strokeWidth={2.2}
              />
            </View>
            <Text variant="h3" align="center" style={{ color: tints.red.fg }}>
              Emergency alert sent
            </Text>
            <Text
              variant="body-sm"
              align="center"
              style={{ color: tints.red.fg }}
            >
              Your operator, parents and school have been notified with your
              live location. Stay where you are if it is safe.
            </Text>
            <Button
              label="Done"
              variant="secondary"
              onPress={() => {
                setSent(false);
                trigger.reset();
              }}
              style={{ marginTop: 8 }}
            />
          </VStack>
        </Card>
      </Screen>
    );
  }

  return (
    <Screen title="SOS Alert">
      {/* Pulsing SOS button */}
      <View style={styles.pulseArea}>
        <View style={[styles.ring, styles.ring3]} />
        <View style={[styles.ring, styles.ring2]} />
        <View style={[styles.ring, styles.ring1]} />
        <Pressable
          onPress={confirmSend}
          disabled={trigger.isPending}
          style={({ pressed }) => [
            styles.sosButton,
            pressed && { opacity: 0.85 },
            trigger.isPending && { opacity: 0.6 },
          ]}
        >
          <ShieldAlert size={40} color="#FFFFFF" strokeWidth={2.2} />
          <Text variant="h2" style={{ color: "#FFFFFF", marginTop: 2 }}>
            SOS
          </Text>
        </Pressable>
      </View>

      <Text
        variant="h3"
        align="center"
        style={{ color: palette.danger.text, marginTop: 8 }}
      >
        Emergency Alert
      </Text>
      <Text
        variant="body-sm"
        tone="tertiary"
        align="center"
        style={{ marginTop: 4 }}
      >
        Tap the button in case of any emergency.
      </Text>

      {trigger.isError ? (
        <Text
          variant="body-sm"
          tone="danger"
          align="center"
          style={{ marginTop: 10 }}
        >
          {apiErrorMessage(trigger.error)}
        </Text>
      ) : null}

      {/* Who gets notified */}
      <View style={styles.shareCard}>
        <Text
          variant="label"
          weight="600"
          align="center"
          style={{ color: "rgba(255,255,255,0.9)", marginBottom: 14 }}
        >
          Your location will be shared with
        </Text>
        <HStack justify="space-between">
          <ShareTarget icon={UserCog} label="Operator" />
          <ShareTarget icon={Users} label="All Parents" />
          <ShareTarget icon={School} label="School" />
        </HStack>
      </View>

      <HStack gap={8} align="center" justify="center" style={{ marginTop: 16 }}>
        <Info size={14} color={palette.text.tertiary} strokeWidth={2} />
        <Text variant="caption" tone="tertiary">
          Use only in real emergencies.
        </Text>
      </HStack>
    </Screen>
  );
}

function ShareTarget({
  icon: Icon,
  label,
}: {
  icon: typeof UserCog;
  label: string;
}) {
  return (
    <VStack gap={7} align="center" flex={1}>
      <View style={styles.shareIcon}>
        <Icon size={20} color="#FFFFFF" strokeWidth={2} />
      </View>
      <Text variant="label-sm" weight="600" style={{ color: "#FFFFFF" }}>
        {label}
      </Text>
    </VStack>
  );
}

const RED = "#F04438";
const styles = StyleSheet.create({
  pulseArea: {
    height: 260,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 16,
  },
  ring: { position: "absolute", borderRadius: 9999 },
  ring1: { width: 190, height: 190, backgroundColor: "rgba(240,68,56,0.18)" },
  ring2: { width: 224, height: 224, backgroundColor: "rgba(240,68,56,0.12)" },
  ring3: { width: 258, height: 258, backgroundColor: "rgba(240,68,56,0.07)" },
  sosButton: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: RED,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: RED,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 24,
    elevation: 12,
  },
  sentIcon: {
    width: 64,
    height: 64,
    borderRadius: radius.full,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  shareCard: {
    marginTop: 24,
    backgroundColor: RED,
    borderRadius: radius.lg,
    padding: 18,
  },
  shareIcon: {
    width: 44,
    height: 44,
    borderRadius: radius.full,
    backgroundColor: "rgba(255,255,255,0.18)",
    alignItems: "center",
    justifyContent: "center",
  },
});
