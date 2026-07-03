import React from "react";
import { View, StyleSheet } from "react-native";
import type { LucideIcon } from "lucide-react-native";
import { palette, radius } from "../designSystem";
import { Text } from "./Text";
import { VStack } from "./Stack";

interface Props {
  icon: LucideIcon;
  title: string;
  message?: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon: Icon, title, message, action }: Props) {
  return (
    <VStack
      align="center"
      gap={12}
      style={{ marginTop: 64, paddingHorizontal: 24 }}
    >
      {/* Layered disc — a soft halo behind the icon reads premium vs flat. */}
      <View style={styles.halo}>
        <View style={styles.icon}>
          <Icon size={30} color={palette.brand[600]} strokeWidth={1.7} />
        </View>
      </View>
      <Text variant="h3" tone="secondary" align="center">
        {title}
      </Text>
      {message ? (
        <Text variant="body-sm" tone="tertiary" align="center">
          {message}
        </Text>
      ) : null}
      {action ? <View style={{ marginTop: 8 }}>{action}</View> : null}
    </VStack>
  );
}

const styles = StyleSheet.create({
  halo: {
    width: 96,
    height: 96,
    borderRadius: radius.full,
    backgroundColor: "rgba(240,167,10,0.08)",
    alignItems: "center",
    justifyContent: "center",
  },
  icon: {
    width: 68,
    height: 68,
    borderRadius: radius.full,
    backgroundColor: palette.brand[50],
    borderWidth: 1,
    borderColor: palette.brand[100],
    alignItems: "center",
    justifyContent: "center",
  },
});
