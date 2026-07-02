import React from "react";
import {
  View,
  StyleSheet,
  ViewStyle,
  StyleProp,
  Pressable,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import type { LucideIcon } from "lucide-react-native";
import { palette, radius, shadows, motion, outline } from "../designSystem";
import { Text } from "./Text";

type Tone = "light" | "teal" | "cobalt" | "slate";

interface Props {
  label: string;
  value: string;
  icon?: LucideIcon;
  hint?: string;
  tone?: Tone;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}

/**
 * StatTile — a bento metric block (2026 bento-grid). `tone` switches between a
 * light surface and accent fills; press gives a soft spring.
 */
export function StatTile({
  label,
  value,
  icon: Icon,
  hint,
  tone = "light",
  onPress,
  style,
}: Props) {
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.get() }],
  }));

  // "teal" is the brand slot — a bus-amber tile with ink text (livery style);
  // cobalt/slate are dark fills with white text; light is the paper tile.
  const amber = tone === "teal";
  const dark = tone === "cobalt" || tone === "slate";
  const valueColor = dark
    ? "#FFFFFF"
    : amber
      ? palette.ink[900]
      : palette.text.primary;
  const labelColor = dark
    ? "rgba(255,255,255,0.82)"
    : amber
      ? "rgba(11,21,38,0.72)"
      : palette.text.tertiary;
  const iconColor = dark
    ? "#FFFFFF"
    : amber
      ? palette.ink[900]
      : palette.brand[600];
  const iconBg = dark
    ? "rgba(255,255,255,0.18)"
    : amber
      ? "rgba(11,21,38,0.10)"
      : palette.brand[50];

  const fill =
    tone === "teal"
      ? palette.brand[400]
      : tone === "cobalt"
        ? palette.cobalt[600]
        : tone === "slate"
          ? palette.ink[900]
          : palette.surface.primary;

  const inner = (
    <>
      {Icon ? (
        <View style={[styles.iconWrap, { backgroundColor: iconBg }]}>
          <Icon size={18} color={iconColor} strokeWidth={2} />
        </View>
      ) : null}
      <View style={{ marginTop: Icon ? 14 : 0 }}>
        <Text
          variant="display-sm"
          numberOfLines={1}
          adjustsFontSizeToFit
          style={{ color: valueColor }}
        >
          {value}
        </Text>
        <Text variant="caption" style={{ color: labelColor, marginTop: 2 }}>
          {label}
        </Text>
        {hint ? (
          <Text
            variant="label-sm"
            style={{
              color: dark
                ? "rgba(255,255,255,0.75)"
                : amber
                  ? "rgba(11,21,38,0.66)"
                  : palette.text.tertiary,
              marginTop: 6,
            }}
          >
            {hint}
          </Text>
        ) : null}
      </View>
    </>
  );

  const body = (
    <View
      style={[
        styles.tile,
        {
          backgroundColor: fill,
          borderColor: dark || amber ? "transparent" : outline.color,
        },
        shadows.sm,
        style,
      ]}
    >
      {inner}
    </View>
  );

  if (!onPress) return body;

  return (
    <Animated.View style={[animStyle, style ? undefined : { flex: 1 }]}>
      <Pressable
        onPress={onPress}
        onPressIn={() => scale.set(withSpring(0.97, motion.spring.crisp))}
        onPressOut={() => scale.set(withSpring(1, motion.spring.gentle))}
      >
        {body}
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  tile: {
    flex: 1,
    borderRadius: radius.lg,
    borderWidth: outline.width,
    padding: 18,
    minHeight: 104,
    justifyContent: "space-between",
  },
  iconWrap: {
    width: 38,
    height: 38,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
  },
});
