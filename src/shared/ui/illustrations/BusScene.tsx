/**
 * BusScene — a flat, on-brand school-bus illustration (Storyset/Icons8 style)
 * for "No Active Ride / No Active Trip" empty states. Pure inline SVG so it
 * ships with the bundle (no asset host, works under the Artifact CSP too).
 * Swap for the client's exact asset later by replacing this component only.
 */
import React from "react";
import Svg, {
  Defs,
  LinearGradient,
  Stop,
  Ellipse,
  Rect,
  Circle,
  Path,
  G,
} from "react-native-svg";

// Brand indigo + a warm school-bus amber (functional, like the real thing).
const INK = "#1E2B4D";
const INDIGO = "#4F46E5";
const INDIGO_SOFT = "#EEF2FF";
const INDIGO_200 = "#C7D2FE";
const AMBER = "#FDB022";
const AMBER_DARK = "#F79009";

export function BusScene({ size = 150 }: { size?: number }) {
  const h = size * 0.8;
  return (
    <Svg width={size} height={h} viewBox="0 0 220 176" fill="none">
      <Defs>
        <LinearGradient id="body" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={AMBER} />
          <Stop offset="1" stopColor={AMBER_DARK} />
        </LinearGradient>
      </Defs>

      {/* Soft backdrop blob + floating accents */}
      <Ellipse cx="110" cy="86" rx="98" ry="78" fill={INDIGO_SOFT} />
      <Circle cx="30" cy="42" r="6" fill={INDIGO_200} />
      <Circle cx="192" cy="54" r="8" fill={INDIGO_200} />
      <Path
        d="M168 30h20M178 20v20"
        stroke={INDIGO_200}
        strokeWidth="3"
        strokeLinecap="round"
      />

      {/* Ground shadow */}
      <Ellipse cx="110" cy="150" rx="82" ry="11" fill={INDIGO} opacity={0.1} />

      {/* Bus body */}
      <Rect x="30" y="58" width="150" height="62" rx="14" fill="url(#body)" />
      {/* Roof stripe */}
      <Rect x="30" y="58" width="150" height="13" rx="13" fill={AMBER_DARK} />
      {/* Side band */}
      <Rect x="30" y="104" width="150" height="9" fill={INK} opacity={0.15} />

      {/* Windows */}
      <Rect x="43" y="76" width="27" height="21" rx="5" fill="#FFFFFF" />
      <Rect x="78" y="76" width="27" height="21" rx="5" fill="#FFFFFF" />
      <Rect x="113" y="76" width="27" height="21" rx="5" fill="#FFFFFF" />
      {/* Windshield */}
      <Rect x="148" y="76" width="24" height="21" rx="5" fill={INDIGO_SOFT} />

      {/* Door */}
      <Rect x="152" y="100" width="18" height="20" rx="3" fill={INDIGO} />
      <Rect
        x="160"
        y="100"
        width="2"
        height="20"
        fill="#FFFFFF"
        opacity={0.7}
      />

      {/* Headlight + bumper */}
      <Circle cx="176" cy="112" r="4" fill="#FFFFFF" />
      <Rect x="30" y="116" width="150" height="6" rx="3" fill={AMBER_DARK} />

      {/* Wheels */}
      <G>
        <Circle cx="66" cy="122" r="15" fill={INK} />
        <Circle cx="66" cy="122" r="6" fill={INDIGO_200} />
        <Circle cx="146" cy="122" r="15" fill={INK} />
        <Circle cx="146" cy="122" r="6" fill={INDIGO_200} />
      </G>
    </Svg>
  );
}
