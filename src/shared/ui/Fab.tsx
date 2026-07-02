import React from "react";
import { View, StyleSheet, Pressable, useWindowDimensions } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";
import { palette, radius, shadows, layout } from "../designSystem";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface Props {
  onPress: () => void;
  icon: React.ReactNode;
}

/** Fab — floating action button: midnight circle, soft elevation. */
export function Fab({ onPress, icon }: Props) {
  const press = useSharedValue(0);
  const { width } = useWindowDimensions();
  const isWide = width >= layout.wideBreakpoint;
  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 1 - press.get() * 0.06 }],
  }));

  return (
    <View
      style={[styles.wrap, { bottom: isWide ? 28 : layout.tabBarClearance }]}
      pointerEvents="box-none"
    >
      <AnimatedPressable
        onPress={onPress}
        onPressIn={() => press.set(withTiming(1, { duration: 80 }))}
        onPressOut={() => press.set(withTiming(0, { duration: 140 }))}
        style={[styles.fab, animStyle]}
      >
        {icon}
      </AnimatedPressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: "absolute", right: 24 },
  fab: {
    width: 58,
    height: 58,
    borderRadius: radius.full,
    backgroundColor: palette.ink[900],
    alignItems: "center",
    justifyContent: "center",
    ...shadows.lg,
  },
});
