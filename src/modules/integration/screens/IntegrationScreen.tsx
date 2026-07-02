import React, { useEffect, useState } from "react";
import { View, Switch, Platform } from "react-native";
import {
  Plug,
  KeyRound,
  Copy,
  RefreshCw,
  Webhook,
  CheckCircle2,
  XCircle,
} from "lucide-react-native";
import {
  useIntegration,
  useUpdateIntegration,
  useRegenerateKey,
} from "@modules/integration/hooks/useIntegration";
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
} from "@shared/ui";

/** Cross-platform confirm (web window.confirm, native Alert). */
function confirm(msg: string, onYes: () => void) {
  if (Platform.OS === "web") {
    // eslint-disable-next-line no-alert
    if (window.confirm(msg)) onYes();
  } else {
    const { Alert } = require("react-native");
    Alert.alert("Please confirm", msg, [
      { text: "Cancel", style: "cancel" },
      { text: "Regenerate", style: "destructive", onPress: onYes },
    ]);
  }
}

/** Copy text to the clipboard: expo-clipboard on native, navigator on web. */
async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (Platform.OS === "web") {
      const nav = (globalThis as any)?.navigator;
      if (nav?.clipboard?.writeText) {
        await nav.clipboard.writeText(text);
        return true;
      }
      return false;
    }
    const Clipboard = await import("expo-clipboard");
    await Clipboard.setStringAsync(text);
    return true;
  } catch {
    return false;
  }
}

export default function IntegrationScreen() {
  const { data: integration } = useIntegration();
  const updateMut = useUpdateIntegration();
  const regenMut = useRegenerateKey();

  const [webhookUrl, setWebhookUrl] = useState("");
  const [enabled, setEnabled] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (integration) {
      setWebhookUrl(integration.webhookUrl ?? "");
      setEnabled(integration.enabled);
    }
  }, [integration]);

  const onCopy = async () => {
    if (!integration?.apiKey) return;
    const ok = await copyToClipboard(integration.apiKey);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const save = () =>
    updateMut.mutate({ webhookUrl: webhookUrl.trim(), enabled });

  const lastOk = integration?.lastDeliveryOk;

  return (
    <Screen
      overline="Settings"
      title="School-system integration"
      subtitle="Connect your school software to verified attendance"
    >
      <Card style={{ marginBottom: 16 }}>
        <VStack gap={14}>
          <HStack gap={8} align="center">
            <Plug size={18} color={tints.blue.icon} strokeWidth={2} />
            <Text variant="h4" tone="primary">
              How it works
            </Text>
          </HStack>
          <Text variant="body-sm" tone="tertiary">
            Give this API key to your school&apos;s system to pull verified
            attendance, or set a webhook we&apos;ll call on every scan.
          </Text>
        </VStack>
      </Card>

      {(updateMut.isError || regenMut.isError) && (
        <View style={errorBox}>
          <Text variant="body-sm" tone="danger">
            {apiErrorMessage(updateMut.error || regenMut.error)}
          </Text>
        </View>
      )}

      <Card style={{ marginBottom: 16 }}>
        <VStack gap={14}>
          <HStack gap={8} align="center">
            <KeyRound size={18} color={palette.text.tertiary} strokeWidth={2} />
            <Text variant="h4" tone="primary">
              API key
            </Text>
          </HStack>
          <View style={keyBox}>
            <Text
              variant="body-sm"
              tone="primary"
              style={{ fontFamily: keyFont, letterSpacing: 0.3 }}
            >
              {integration?.apiKey ?? "••••••••••••••••••••"}
            </Text>
          </View>
          <HStack gap={10} align="center">
            <View style={{ flex: 1 }}>
              <Button
                label={copied ? "Copied!" : "Copy"}
                variant="secondary"
                icon={
                  <Copy
                    size={15}
                    color={palette.text.primary}
                    strokeWidth={2}
                  />
                }
                onPress={onCopy}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Button
                label="Regenerate key"
                variant="secondary"
                loading={regenMut.isPending}
                icon={
                  <RefreshCw
                    size={15}
                    color={palette.text.primary}
                    strokeWidth={2}
                  />
                }
                onPress={() =>
                  confirm(
                    "Regenerate the API key? The old key will stop working immediately.",
                    () => regenMut.mutate(),
                  )
                }
              />
            </View>
          </HStack>
        </VStack>
      </Card>

      <Card style={{ marginBottom: 16 }}>
        <VStack gap={16}>
          <HStack gap={8} align="center">
            <Webhook size={18} color={palette.text.tertiary} strokeWidth={2} />
            <Text variant="h4" tone="primary">
              Webhook
            </Text>
          </HStack>
          <TextField
            label="Webhook URL"
            value={webhookUrl}
            onChangeText={setWebhookUrl}
            placeholder="https://your-school.example.com/hooks/attendance"
            autoCapitalize="none"
            keyboardType="url"
          />
          <HStack align="center" justify="space-between">
            <VStack gap={2} flex={1}>
              <Text variant="label-lg" tone="primary">
                Enabled
              </Text>
              <Text variant="caption" tone="tertiary">
                Call the webhook on every verified scan.
              </Text>
            </VStack>
            <Switch
              value={enabled}
              onValueChange={setEnabled}
              trackColor={{
                false: palette.border.strong,
                true: palette.teal[400],
              }}
              thumbColor={palette.surface.primary}
            />
          </HStack>

          {integration?.lastDeliveryAt ? (
            <HStack gap={6} align="center">
              {lastOk ? (
                <CheckCircle2
                  size={16}
                  color={tints.green.icon}
                  strokeWidth={2.2}
                />
              ) : (
                <XCircle size={16} color={tints.red.icon} strokeWidth={2.2} />
              )}
              <Text
                variant="body-sm"
                style={{ color: lastOk ? tints.green.fg : tints.red.fg }}
              >
                Last delivery {lastOk ? "succeeded" : "failed"} ·{" "}
                {new Date(integration.lastDeliveryAt).toLocaleString()}
              </Text>
            </HStack>
          ) : (
            <Text variant="body-sm" tone="tertiary">
              No deliveries yet.
            </Text>
          )}

          <Button
            label="Save changes"
            size="lg"
            loading={updateMut.isPending}
            onPress={save}
          />
        </VStack>
      </Card>
    </Screen>
  );
}

const keyFont = Platform.select({
  ios: "Menlo",
  android: "monospace",
  default: "monospace",
});

const keyBox = {
  padding: 14,
  borderRadius: radius.md,
  backgroundColor: palette.surface.sunken,
  borderWidth: 1,
  borderColor: palette.border.default,
} as const;

const errorBox = {
  padding: 14,
  borderRadius: radius.md,
  backgroundColor: palette.danger.bg,
  borderWidth: 1,
  borderColor: palette.danger.border,
  marginBottom: 16,
} as const;
