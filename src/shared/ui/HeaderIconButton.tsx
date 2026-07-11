/**
 * HeaderIconButton — a nav-bar action icon (bell / filter / + / refresh) as in
 * the client mockup. Plain by default; `filled` gives a soft accent chip. An
 * optional red badge (dot or count) sits top-right.
 */
import React from "react";
import { View, Pressable, StyleSheet } from "react-native";
import type { LucideIcon } from "lucide-react-native";
import { palette, radius, accent } from "../designSystem";
import { Text } from "./Text";

interface Props {
  icon: LucideIcon;
  onPress?: () => void;
  filled?: boolean;
  tint?: boolean;
  badge?: number | boolean;
}

export function HeaderIconButton({
  icon: Icon,
  onPress,
  filled,
  tint,
  badge,
}: Props) {
  const color = tint ? accent.main : palette.text.secondary;
  const showCount = typeof badge === "number" && badge > 0;
  const showDot = badge === true;

  return (
    <Pressable
      onPress={onPress}
      hitSlop={10}
      style={({ pressed }) => [
        styles.btn,
        filled && { backgroundColor: accent.soft },
        pressed && { opacity: 0.55 },
      ]}
    >
      <Icon size={22} color={color} strokeWidth={2.1} />
      {showCount ? (
        <View style={styles.badge}>
          <Text
            style={{ color: "#FFFFFF", fontSize: 10, fontWeight: "700" }}
            numberOfLines={1}
          >
            {badge > 9 ? "9+" : badge}
          </Text>
        </View>
      ) : showDot ? (
        <View style={styles.dot} />
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    alignItems: "center",
    justifyContent: "center",
  },
  badge: {
    position: "absolute",
    top: 2,
    right: 0,
    minWidth: 17,
    height: 17,
    borderRadius: 9,
    paddingHorizontal: 4,
    backgroundColor: palette.danger.text,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: palette.surface.secondary,
  },
  dot: {
    position: "absolute",
    top: 6,
    right: 6,
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: palette.danger.text,
    borderWidth: 1.5,
    borderColor: palette.surface.secondary,
  },
});
