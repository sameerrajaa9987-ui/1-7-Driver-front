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
import { tints, TintName, radius, motion, outline } from "../designSystem";
import { Text } from "./Text";

interface Props {
  label: string;
  value: string;
  icon?: LucideIcon;
  tint?: TintName;
  hint?: string;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}

/**
 * TintTile — a 2026 bento metric tile with a soft category tint (blue analytics,
 * green healthy, amber attention, red problem…). Soft tinted surface + matching
 * icon chip; large value first for at-a-glance scanning.
 */
export function TintTile({
  label,
  value,
  icon: Icon,
  tint = "neutral",
  hint,
  onPress,
  style,
}: Props) {
  const t = tints[tint];
  const scale = useSharedValue(1);
  const anim = useAnimatedStyle(() => ({
    transform: [{ scale: scale.get() }],
  }));

  const body = (
    <View
      style={[
        styles.tile,
        { backgroundColor: t.bg, borderColor: t.ring },
        style,
      ]}
    >
      {Icon ? (
        <View style={[styles.iconWrap, { backgroundColor: "#FFFFFF" }]}>
          <Icon size={18} color={t.icon} strokeWidth={2.2} />
        </View>
      ) : null}
      <View style={{ marginTop: Icon ? 14 : 0 }}>
        <Text
          variant="display-sm"
          numberOfLines={1}
          adjustsFontSizeToFit
          style={{ color: t.fg }}
        >
          {value}
        </Text>
        <Text
          variant="caption"
          style={{ color: t.fg, opacity: 0.8, marginTop: 2 }}
        >
          {label}
        </Text>
        {hint ? (
          <Text
            variant="label-sm"
            style={{ color: t.fg, opacity: 0.7, marginTop: 6 }}
          >
            {hint}
          </Text>
        ) : null}
      </View>
    </View>
  );

  if (!onPress) return body;
  return (
    <Animated.View style={[anim, style ? undefined : { flex: 1 }]}>
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
    minHeight: 108,
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
