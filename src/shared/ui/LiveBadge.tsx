import React, { useEffect } from "react";
import { View, StyleSheet } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  withSequence,
} from "react-native-reanimated";
import { radius, palette } from "../designSystem";
import { Text } from "./Text";

/**
 * LiveBadge — a pulsing "LIVE" pill for active tracking (transport-app trust
 * signal: parents want to know the position is real-time, not stale).
 */
export function LiveBadge({
  label = "LIVE",
  tone = "#DC2626",
}: {
  label?: string;
  tone?: string;
}) {
  const pulse = useSharedValue(1);
  useEffect(() => {
    pulse.set(
      withRepeat(
        withSequence(
          withTiming(0.4, { duration: 700 }),
          withTiming(1, { duration: 700 }),
        ),
        -1,
        false,
      ),
    );
  }, [pulse]);
  const dotStyle = useAnimatedStyle(() => ({ opacity: pulse.get() }));

  return (
    <View style={[styles.badge, { borderColor: tone + "55" }]}>
      <Animated.View
        style={[styles.dot, { backgroundColor: tone }, dotStyle]}
      />
      <Text
        variant="label-sm"
        weight="700"
        style={{ color: tone, letterSpacing: 0.6 }}
      >
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.full,
    borderWidth: 1,
    backgroundColor: palette.surface.primary,
    alignSelf: "flex-start",
  },
  dot: { width: 8, height: 8, borderRadius: 4 },
});
