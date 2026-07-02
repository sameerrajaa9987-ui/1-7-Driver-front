import React, { useState } from "react";
import { View, Pressable, StyleSheet } from "react-native";
import { ShieldAlert, CheckCircle2, X, Phone } from "lucide-react-native";
import { useTriggerSos } from "@modules/sos/hooks/useSos";
import { getCurrentCoord } from "@modules/trip/utils";
import { apiErrorMessage } from "@api/apiClient";
import { palette, tints, radius } from "@shared/designSystem";
import {
  Screen,
  Text,
  VStack,
  HStack,
  Card,
  Button,
  TextField,
} from "@shared/ui";

type Phase = "idle" | "arming" | "sent";

export default function DriverSosScreen() {
  const trigger = useTriggerSos();
  const [phase, setPhase] = useState<Phase>("idle");
  const [message, setMessage] = useState("");

  const send = async () => {
    // Guarded GPS — falls back to a demo coord on web / denied permission.
    const coord = await getCurrentCoord();
    trigger.mutate(
      {
        lat: coord.lat,
        lng: coord.lng,
        message: message.trim() || undefined,
      },
      {
        onSuccess: () => setPhase("sent"),
      },
    );
  };

  const reset = () => {
    setPhase("idle");
    setMessage("");
    trigger.reset();
  };

  return (
    <Screen
      overline="Emergency"
      title="SOS"
      subtitle="Raise an emergency alert to your operator"
    >
      {phase === "sent" ? (
        <Card
          style={{
            backgroundColor: tints.red.bg,
            borderColor: tints.red.ring,
          }}
        >
          <VStack gap={12} align="center">
            <View style={[styles.sentIcon, { backgroundColor: "#FFFFFF" }]}>
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
              Your operator has been notified. Stay where you are if it is safe
              — help is being coordinated.
            </Text>
            <Button
              label="Done"
              variant="secondary"
              onPress={reset}
              style={{ marginTop: 8 }}
            />
          </VStack>
        </Card>
      ) : (
        <VStack gap={20} align="center">
          <Text variant="body-sm" tone="tertiary" align="center">
            Press the button below in an emergency. Your live location is shared
            with your operator so they can reach you fast.
          </Text>

          <Pressable
            onPress={() => setPhase("arming")}
            disabled={phase === "arming"}
            style={({ pressed }) => [
              styles.sosButton,
              pressed && { opacity: 0.85 },
              phase === "arming" && { opacity: 0.6 },
            ]}
          >
            <ShieldAlert size={54} color="#FFFFFF" strokeWidth={2.2} />
            <Text
              variant="display-sm"
              style={{ color: "#FFFFFF", marginTop: 8 }}
            >
              SOS
            </Text>
          </Pressable>

          {phase === "arming" ? (
            <Card
              style={{
                backgroundColor: tints.red.bg,
                borderColor: tints.red.ring,
                width: "100%",
              }}
            >
              <VStack gap={14}>
                <HStack align="center" justify="space-between">
                  <Text variant="h4" style={{ color: tints.red.fg }}>
                    Confirm emergency
                  </Text>
                  <Pressable onPress={reset} hitSlop={8}>
                    <X size={20} color={tints.red.fg} strokeWidth={2} />
                  </Pressable>
                </HStack>
                <Text variant="body-sm" style={{ color: tints.red.fg }}>
                  This sends an emergency alert with your location to your
                  operator. Only use it in a real emergency.
                </Text>
                <TextField
                  label="Message (optional)"
                  value={message}
                  onChangeText={setMessage}
                  placeholder="Briefly describe the situation"
                />
                {trigger.isError ? (
                  <Text variant="body-sm" tone="danger">
                    {apiErrorMessage(trigger.error)}
                  </Text>
                ) : null}
                <Button
                  label="Confirm emergency"
                  variant="destructive"
                  icon={<Phone size={16} color="#FFFFFF" strokeWidth={2} />}
                  loading={trigger.isPending}
                  onPress={send}
                />
              </VStack>
            </Card>
          ) : (
            <Text variant="caption" tone="tertiary" align="center">
              Tap SOS, then confirm — a two-step to avoid accidental alerts.
            </Text>
          )}
        </VStack>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  sosButton: {
    width: 220,
    height: 220,
    borderRadius: radius.full,
    backgroundColor: tints.red.icon,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 8,
    borderColor: tints.red.ring,
    shadowColor: palette.danger.text,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.28,
    shadowRadius: 22,
    elevation: 10,
  },
  sentIcon: {
    width: 64,
    height: 64,
    borderRadius: radius.full,
    alignItems: "center",
    justifyContent: "center",
  },
});
