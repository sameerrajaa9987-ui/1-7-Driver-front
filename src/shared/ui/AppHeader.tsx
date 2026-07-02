/**
 * AppHeader — the doctor-app header pattern, in Midnight Transit. A fixed
 * (non-scrolling) header row: iOS-style circular chevron back button, overline
 * + title + subtitle, and an optional right action. tone="dark" renders glass
 * controls for use over midnight heroes.
 */
import React from "react";
import { View, Pressable } from "react-native";
import { ChevronLeft } from "lucide-react-native";
import { palette, radius, layout } from "../designSystem";
import { Text } from "./Text";
import { HStack, VStack } from "./Stack";

interface Props {
  title?: string;
  subtitle?: string;
  overline?: string;
  onBack?: () => void;
  right?: React.ReactNode;
  tone?: "light" | "dark";
}

export function AppHeader({
  title,
  subtitle,
  overline,
  onBack,
  right,
  tone = "light",
}: Props) {
  const isDark = tone === "dark";

  return (
    <View style={{ paddingHorizontal: 20, paddingTop: 8, paddingBottom: 14 }}>
      <HStack
        align="center"
        gap={12}
        style={{
          width: "100%",
          maxWidth: layout.contentMaxWidth,
          alignSelf: "center",
        }}
      >
        {onBack && (
          <Pressable
            onPress={onBack}
            hitSlop={12}
            style={({ pressed }) => ({
              width: 40,
              height: 40,
              borderRadius: radius.full,
              backgroundColor: isDark
                ? "rgba(255,255,255,0.08)"
                : palette.surface.primary,
              borderWidth: 1,
              borderColor: isDark
                ? "rgba(255,255,255,0.12)"
                : palette.border.default,
              alignItems: "center",
              justifyContent: "center",
              opacity: pressed ? 0.6 : 1,
            })}
          >
            <ChevronLeft
              size={20}
              color={isDark ? palette.text.inverse : palette.text.primary}
              strokeWidth={2.2}
            />
          </Pressable>
        )}
        <VStack gap={2} flex={1}>
          {overline ? (
            <Text
              variant="overline"
              style={{
                color: isDark ? palette.brand[400] : palette.text.accent,
              }}
            >
              {overline}
            </Text>
          ) : null}
          {title ? (
            <Text
              variant="h1"
              numberOfLines={1}
              style={{
                color: isDark ? palette.text.inverse : palette.text.primary,
              }}
            >
              {title}
            </Text>
          ) : null}
          {subtitle ? (
            <Text
              variant="body-sm"
              numberOfLines={1}
              style={{
                color: isDark
                  ? "rgba(255,255,255,0.66)"
                  : palette.text.tertiary,
              }}
            >
              {subtitle}
            </Text>
          ) : null}
        </VStack>
        {right ? <View>{right}</View> : null}
      </HStack>
    </View>
  );
}
