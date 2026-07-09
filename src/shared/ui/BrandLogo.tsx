/**
 * BrandLogo — the SchoolRide Connect monoline mark. Replaces the old emoji.
 * `tone`: "ink" (on paper) · "paper" (on ink panels) · "marigold".
 */
import React from "react";
import { Image, ImageStyle, StyleProp } from "react-native";

const SRC = {
  ink: require("../../../assets/brand/logo.png"),
  paper: require("../../../assets/brand/logo-inverse.png"),
  marigold: require("../../../assets/brand/logo-marigold.png"),
};

export function BrandLogo({
  size = 40,
  tone = "ink",
  style,
}: {
  size?: number;
  tone?: keyof typeof SRC;
  style?: StyleProp<ImageStyle>;
}) {
  return (
    <Image
      source={SRC[tone]}
      style={[{ width: size, height: size }, style]}
      resizeMode="contain"
    />
  );
}
