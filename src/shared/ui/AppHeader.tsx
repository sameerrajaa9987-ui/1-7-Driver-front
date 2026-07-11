/**
 * AppHeader — a compact mobile nav bar (client mockup): a plain back chevron
 * (or a left slot), a small title, and an optional right action icon. No
 * editorial overline — the mockup screens are titled simply. tone="dark"
 * renders light controls for use over dark heroes.
 */
import React from "react";
import { View, Pressable } from "react-native";
import { ChevronLeft } from "lucide-react-native";
import { palette, layout } from "../designSystem";
import { Text } from "./Text";
import { HStack, VStack } from "./Stack";

interface Props {
  title?: string;
  subtitle?: string;
  /** Kept for API compatibility — no longer rendered (mockup has no overline). */
  overline?: string;
  onBack?: () => void;
  /** Custom left control (e.g. a menu button). Overrides the back chevron. */
  left?: React.ReactNode;
  right?: React.ReactNode;
  tone?: "light" | "dark";
}

export function AppHeader({
  title,
  subtitle,
  onBack,
  left,
  right,
  tone = "light",
}: Props) {
  const isDark = tone === "dark";
  const titleColor = isDark ? palette.text.inverse : palette.text.primary;

  return (
    <View style={{ paddingHorizontal: 16, paddingTop: 6, paddingBottom: 10 }}>
      <HStack
        align="center"
        gap={8}
        style={{
          width: "100%",
          maxWidth: layout.contentMaxWidth,
          alignSelf: "center",
          minHeight: 40,
        }}
      >
        {left ? (
          left
        ) : onBack ? (
          <Pressable
            onPress={onBack}
            hitSlop={14}
            style={({ pressed }) => ({
              width: 32,
              height: 40,
              alignItems: "center",
              justifyContent: "center",
              marginLeft: -6,
              opacity: pressed ? 0.5 : 1,
            })}
          >
            <ChevronLeft size={26} color={titleColor} strokeWidth={2.4} />
          </Pressable>
        ) : null}

        <VStack gap={1} flex={1}>
          {title ? (
            <Text
              variant="h2"
              weight="700"
              numberOfLines={1}
              style={{ color: titleColor }}
            >
              {title}
            </Text>
          ) : null}
          {subtitle ? (
            <Text
              variant="caption"
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
