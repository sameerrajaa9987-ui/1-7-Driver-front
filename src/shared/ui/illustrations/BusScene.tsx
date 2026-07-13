/**
 * BusScene — the client's 3D school-bus illustration (background removed,
 * cropped to content). Rendered as a plain transparent Image so it floats on
 * any surface — lavender hero headers, indigo gradients, empty states.
 * `size` is the rendered width; height follows the art's 1.6:1 aspect.
 */
import React from "react";
import { Image, type StyleProp, type ImageStyle } from "react-native";

const ART = require("../../../../assets/illustrations/bus-illustration.png");
/** Source art is 587×366. */
const ASPECT = 587 / 366;

export function BusScene({
  size = 150,
  style,
}: {
  size?: number;
  style?: StyleProp<ImageStyle>;
}) {
  return (
    <Image
      source={ART}
      style={[{ width: size, height: size / ASPECT }, style]}
      resizeMode="contain"
    />
  );
}
