/**
 * SupportScene — flat "have an issue?" illustration (phone + chat bubbles) for
 * the Complaints empty state, on-brand indigo. Inline SVG (see BusScene).
 */
import React from "react";
import Svg, { Ellipse, Rect, Circle, Path, G } from "react-native-svg";

const INK = "#1E2B4D";
const INDIGO = "#4F46E5";
const INDIGO_500 = "#6366F1";
const INDIGO_SOFT = "#EEF2FF";
const INDIGO_200 = "#C7D2FE";

export function SupportScene({ size = 150 }: { size?: number }) {
  return (
    <Svg width={size} height={size * 0.9} viewBox="0 0 200 180" fill="none">
      {/* Backdrop */}
      <Ellipse cx="100" cy="92" rx="90" ry="80" fill={INDIGO_SOFT} />
      <Circle cx="26" cy="52" r="6" fill={INDIGO_200} />
      <Circle cx="176" cy="120" r="7" fill={INDIGO_200} />
      <Path
        d="M158 34h18M167 25v18"
        stroke={INDIGO_200}
        strokeWidth="3"
        strokeLinecap="round"
      />

      {/* Ground shadow */}
      <Ellipse cx="100" cy="156" rx="66" ry="9" fill={INDIGO} opacity={0.1} />

      {/* Phone */}
      <G>
        <Rect x="66" y="42" width="68" height="112" rx="14" fill={INK} />
        <Rect x="72" y="52" width="56" height="92" rx="8" fill="#FFFFFF" />
        <Circle cx="100" cy="150" r="3" fill="#FFFFFF" opacity={0.5} />
      </G>

      {/* Chat bubbles on screen */}
      <Rect x="80" y="64" width="30" height="16" rx="8" fill={INDIGO_SOFT} />
      <Rect x="98" y="86" width="24" height="16" rx="8" fill={INDIGO} />

      {/* Floating question bubble */}
      <G>
        <Path
          d="M120 40c0-9 7-16 16-16h20c9 0 16 7 16 16s-7 16-16 16h-4l-8 9v-9h-8c-9 0-16-7-16-16z"
          fill={INDIGO_500}
        />
        <Path
          d="M146 33c0-3 2.4-5 5.4-5 2.8 0 5 1.8 5 4.4 0 3.4-3.6 3.4-3.6 6"
          stroke="#FFFFFF"
          strokeWidth="2.4"
          strokeLinecap="round"
          fill="none"
        />
        <Circle cx="152.6" cy="45" r="1.6" fill="#FFFFFF" />
      </G>
    </Svg>
  );
}
