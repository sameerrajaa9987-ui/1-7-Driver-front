/**
 * OnboardingScenes — flat, on-brand illustrations for the intro carousel, drawn
 * with react-native-svg primitives (like SupportScene) so they render correctly
 * on web without the SvgXml/absolute-disc z-order caveat. Swappable for the
 * client's exact 3D art.
 */
import React from "react";
import Svg, { Ellipse, Rect, Circle, Path, G, Line } from "react-native-svg";

const INK = "#1E2B4D";
const INDIGO = "#4F46E5";
const INDIGO_500 = "#6366F1";
const INDIGO_SOFT = "#EEF2FF";
const INDIGO_200 = "#C7D2FE";
const AMBER = "#FDB022";
const AMBER_DK = "#F79009";
const GREEN = "#22C55E";
const RED = "#F04438";
const SKY = "#7CC8F5";

/** Slide 1 — a friendly school bus. */
export function WelcomeBusScene({ size = 220 }: { size?: number }) {
  return (
    <Svg width={size} height={size * 0.82} viewBox="0 0 220 180" fill="none">
      <Ellipse cx="110" cy="100" rx="100" ry="78" fill={INDIGO_SOFT} />
      <Circle cx="30" cy="46" r="6" fill={INDIGO_200} />
      <Circle cx="192" cy="60" r="7" fill={INDIGO_200} />
      <Ellipse cx="110" cy="150" rx="82" ry="10" fill={INDIGO} opacity={0.1} />
      {/* bus body */}
      <Rect x="34" y="70" width="152" height="62" rx="16" fill={AMBER} />
      <Rect x="34" y="112" width="152" height="20" rx="8" fill={AMBER_DK} />
      {/* windows */}
      <Rect x="46" y="82" width="24" height="20" rx="5" fill={SKY} />
      <Rect x="78" y="82" width="24" height="20" rx="5" fill={SKY} />
      <Rect x="110" y="82" width="24" height="20" rx="5" fill={SKY} />
      <Rect x="142" y="82" width="30" height="20" rx="5" fill="#FFFFFF" />
      {/* door */}
      <Rect
        x="160"
        y="106"
        width="14"
        height="24"
        rx="3"
        fill={INDIGO}
        opacity={0.25}
      />
      {/* headlight + stripe */}
      <Circle cx="180" cy="120" r="4" fill="#FFF478" />
      {/* wheels */}
      <Circle cx="66" cy="134" r="14" fill={INK} />
      <Circle cx="66" cy="134" r="6" fill="#D3D3D3" />
      <Circle cx="154" cy="134" r="14" fill={INK} />
      <Circle cx="154" cy="134" r="6" fill="#D3D3D3" />
      {/* pin */}
      <Path
        d="M110 30c-8 0-14 6-14 14 0 10 14 22 14 22s14-12 14-22c0-8-6-14-14-14z"
        fill={INDIGO}
      />
      <Circle cx="110" cy="44" r="5" fill="#FFFFFF" />
    </Svg>
  );
}

/** Slide 2 — live tracking: a phone with a map, route and an ETA chip. */
export function TrackingScene({ size = 220 }: { size?: number }) {
  return (
    <Svg width={size} height={size * 0.82} viewBox="0 0 220 180" fill="none">
      <Ellipse cx="110" cy="98" rx="100" ry="76" fill={INDIGO_SOFT} />
      <Ellipse cx="110" cy="152" rx="70" ry="9" fill={INDIGO} opacity={0.1} />
      {/* phone */}
      <Rect x="60" y="20" width="92" height="140" rx="18" fill={INK} />
      <Rect x="67" y="30" width="78" height="120" rx="11" fill={INDIGO_SOFT} />
      {/* roads */}
      <Line x1="67" y1="72" x2="145" y2="72" stroke="#DCE3F2" strokeWidth="7" />
      <Line
        x1="106"
        y1="30"
        x2="106"
        y2="150"
        stroke="#DCE3F2"
        strokeWidth="7"
      />
      {/* route */}
      <Path
        d="M82 130 C 82 104 120 112 120 84"
        stroke={INDIGO}
        strokeWidth="4"
        strokeLinecap="round"
        fill="none"
      />
      <Circle cx="82" cy="130" r="6" fill={GREEN} />
      <Circle cx="82" cy="130" r="2.5" fill="#FFFFFF" />
      {/* destination pin */}
      <Path
        d="M120 72c-6 0-10 4-10 9 0 7 10 15 10 15s10-8 10-15c0-5-4-9-10-9z"
        fill={AMBER}
      />
      <Circle cx="120" cy="81" r="3.4" fill="#FFFFFF" />
      {/* ETA chip */}
      <G>
        <Rect x="120" y="34" width="72" height="40" rx="10" fill="#FFFFFF" />
        <Circle cx="136" cy="54" r="9" fill={INDIGO} />
        <Path
          d="M136 49v5l3 2"
          stroke="#FFFFFF"
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
        />
        <Rect x="150" y="46" width="34" height="5" rx="2.5" fill={INK} />
        <Rect x="150" y="56" width="24" height="4" rx="2" fill={INDIGO_200} />
      </G>
      {/* little bus */}
      <Rect x="86" y="150" width="48" height="20" rx="6" fill={AMBER} />
      <Rect x="90" y="154" width="10" height="9" rx="2" fill={SKY} />
      <Rect x="104" y="154" width="10" height="9" rx="2" fill={SKY} />
      <Circle cx="98" cy="170" r="5" fill={INK} />
      <Circle cx="122" cy="170" r="5" fill={INK} />
    </Svg>
  );
}

/** Slide 3 — safety first: a shield with a check and floating status badges. */
export function SafetyScene({ size = 220 }: { size?: number }) {
  return (
    <Svg width={size} height={size * 0.82} viewBox="0 0 220 180" fill="none">
      <Ellipse cx="110" cy="96" rx="98" ry="76" fill={INDIGO_SOFT} />
      <Ellipse cx="110" cy="150" rx="60" ry="8" fill={INDIGO} opacity={0.1} />
      {/* shield */}
      <Path
        d="M110 34l44 16v34c0 28-19 44-44 52-25-8-44-24-44-52V50z"
        fill={INDIGO}
      />
      <Path
        d="M110 44l34 12v26c0 21-14 33-34 40-20-7-34-19-34-40V56z"
        fill={INDIGO_500}
        opacity={0.5}
      />
      <Path
        d="M96 92l10 10 20-22"
        stroke="#FFFFFF"
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      {/* bell badge */}
      <Circle cx="52" cy="60" r="15" fill={AMBER} />
      <Path
        d="M52 53c-3 0-5 2-5 5v3l-1 2h12l-1-2v-3c0-3-2-5-5-5zM50 67a2 2 0 004 0"
        fill="#FFFFFF"
      />
      {/* SOS badge */}
      <Circle cx="172" cy="58" r="16" fill={RED} />
      <Path
        d="M166 62v-4a2 2 0 014 0M170 58v4a2 2 0 004 0M176 55v7"
        stroke="#FFFFFF"
        strokeWidth="2.4"
        strokeLinecap="round"
        fill="none"
      />
      {/* small check badge */}
      <Circle cx="176" cy="112" r="13" fill={SKY} />
      <Path
        d="M170 112l4 4 8-8"
        stroke="#FFFFFF"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </Svg>
  );
}

/** Slide 4 — easy payments: a wallet with a card and a success check. */
export function PaymentScene({ size = 220 }: { size?: number }) {
  return (
    <Svg width={size} height={size * 0.82} viewBox="0 0 220 180" fill="none">
      <Ellipse cx="110" cy="96" rx="98" ry="76" fill={INDIGO_SOFT} />
      <Ellipse cx="110" cy="150" rx="66" ry="9" fill={INDIGO} opacity={0.1} />
      {/* receipt peeking */}
      <Rect x="86" y="40" width="40" height="52" rx="5" fill="#FFFFFF" />
      <Rect x="92" y="50" width="28" height="4" rx="2" fill={INDIGO_200} />
      <Rect x="92" y="60" width="28" height="4" rx="2" fill={INDIGO_200} />
      <Rect x="92" y="70" width="18" height="4" rx="2" fill={INDIGO_200} />
      {/* wallet body */}
      <Rect x="52" y="74" width="116" height="70" rx="14" fill={INDIGO} />
      <Rect
        x="52"
        y="74"
        width="116"
        height="70"
        rx="14"
        fill={INDIGO_500}
        opacity={0.35}
      />
      <Rect x="52" y="86" width="116" height="58" rx="14" fill={INDIGO} />
      {/* card slot */}
      <Rect x="120" y="98" width="60" height="34" rx="8" fill="#FFFFFF" />
      <Circle cx="150" cy="115" r="10" fill={GREEN} />
      <Path
        d="M145 115l4 4 6-7"
        stroke="#FFFFFF"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      {/* coins */}
      <Ellipse cx="66" cy="150" rx="16" ry="6" fill={AMBER_DK} />
      <Rect x="50" y="140" width="32" height="10" fill={AMBER} />
      <Ellipse cx="66" cy="140" rx="16" ry="6" fill={AMBER} />
      <Path
        d="M62 137v6M70 137v6"
        stroke={AMBER_DK}
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </Svg>
  );
}
