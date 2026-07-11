/**
 * BusScene — a detailed, hand-authored school-bus scene (Storyset-quality):
 * soft sky disc, clouds, roadside greenery, a road, and a classic yellow
 * school bus with shaded body, tinted windows + reflections, door, wheels with
 * hubcaps, headlight and motion lines. Pure inline SVG (no asset host / CSP
 * issues). Reads well on light lavender cards and on the indigo hero banner.
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
  Line,
  G,
} from "react-native-svg";

export function BusScene({ size = 150 }: { size?: number }) {
  const h = size * 0.75;
  return (
    <Svg width={size} height={h} viewBox="0 0 220 165" fill="none">
      <Defs>
        <LinearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#F1F4FF" />
          <Stop offset="1" stopColor="#E5EAFF" />
        </LinearGradient>
        <LinearGradient id="body" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#FFD15C" />
          <Stop offset="0.55" stopColor="#FDB022" />
          <Stop offset="1" stopColor="#F79009" />
        </LinearGradient>
        <LinearGradient id="win" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#DCEBFF" />
          <Stop offset="1" stopColor="#B9D5FB" />
        </LinearGradient>
        <LinearGradient id="leaf" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#86EFAC" />
          <Stop offset="1" stopColor="#4ADE80" />
        </LinearGradient>
      </Defs>

      {/* Scene disc */}
      <Ellipse cx="110" cy="84" rx="104" ry="74" fill="url(#sky)" />

      {/* Soft city skyline peeking behind the bus */}
      <G opacity={0.5}>
        <Rect x="60" y="48" width="15" height="60" rx="3" fill="#CBD5FB" />
        <Rect x="78" y="40" width="13" height="68" rx="3" fill="#DCE1FB" />
        <Rect x="118" y="44" width="15" height="64" rx="3" fill="#CBD5FB" />
        <Rect x="136" y="52" width="12" height="56" rx="3" fill="#DCE1FB" />
        <Rect x="150" y="46" width="11" height="62" rx="3" fill="#CBD5FB" />
        {/* tiny windows */}
        <Rect x="64" y="54" width="3" height="3" rx="1" fill="#FFFFFF" />
        <Rect x="70" y="54" width="3" height="3" rx="1" fill="#FFFFFF" />
        <Rect x="82" y="48" width="3" height="3" rx="1" fill="#FFFFFF" />
        <Rect x="122" y="50" width="3" height="3" rx="1" fill="#FFFFFF" />
        <Rect x="128" y="50" width="3" height="3" rx="1" fill="#FFFFFF" />
      </G>

      {/* Clouds */}
      <G opacity={0.9}>
        <Ellipse cx="46" cy="40" rx="15" ry="8" fill="#FFFFFF" />
        <Ellipse cx="58" cy="37" rx="11" ry="7" fill="#FFFFFF" />
        <Ellipse cx="176" cy="34" rx="13" ry="7" fill="#FFFFFF" />
        <Ellipse cx="166" cy="37" rx="9" ry="6" fill="#FFFFFF" />
      </G>

      {/* Roadside greenery (behind the bus) */}
      <G>
        <Rect x="30" y="104" width="5" height="16" rx="2" fill="#B45309" />
        <Circle cx="32.5" cy="100" r="15" fill="url(#leaf)" />
        <Circle cx="24" cy="106" r="10" fill="url(#leaf)" />
        <Circle cx="41" cy="106" r="10" fill="url(#leaf)" />
        <Ellipse cx="192" cy="112" rx="16" ry="12" fill="url(#leaf)" />
        <Ellipse cx="203" cy="115" rx="11" ry="9" fill="#4ADE80" />
      </G>

      {/* Road */}
      <Rect x="6" y="122" width="208" height="20" rx="10" fill="#E4E7EC" />
      <Line
        x1="24"
        y1="132"
        x2="52"
        y2="132"
        stroke="#FFFFFF"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <Line
        x1="70"
        y1="132"
        x2="98"
        y2="132"
        stroke="#FFFFFF"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <Line
        x1="150"
        y1="132"
        x2="178"
        y2="132"
        stroke="#FFFFFF"
        strokeWidth="3"
        strokeLinecap="round"
      />

      {/* Ground shadow */}
      <Ellipse cx="108" cy="128" rx="80" ry="8" fill="#1E293B" opacity={0.09} />

      {/* Motion lines */}
      <G opacity={0.85}>
        <Rect x="4" y="80" width="14" height="3.4" rx="1.7" fill="#C7D2FE" />
        <Rect x="2" y="92" width="18" height="3.4" rx="1.7" fill="#C7D2FE" />
        <Rect x="6" y="104" width="12" height="3.4" rx="1.7" fill="#C7D2FE" />
      </G>

      {/* ---- Bus (side view, facing right) ---- */}
      {/* Body */}
      <Rect x="40" y="58" width="132" height="58" rx="15" fill="url(#body)" />
      {/* Top highlight */}
      <Rect
        x="46"
        y="61"
        width="120"
        height="9"
        rx="4.5"
        fill="#FFE199"
        opacity={0.7}
      />
      {/* Black school-bus stripe */}
      <Rect x="40" y="99" width="132" height="7" fill="#1F2937" opacity={0.9} />
      {/* Lower body shade */}
      <Rect x="40" y="106" width="132" height="10" rx="4" fill="#E08600" />

      {/* Windows */}
      <G>
        <Rect x="50" y="72" width="25" height="21" rx="5" fill="url(#win)" />
        <Rect x="80" y="72" width="25" height="21" rx="5" fill="url(#win)" />
        <Rect x="110" y="72" width="25" height="21" rx="5" fill="url(#win)" />
        {/* Windshield (front, slightly taller) */}
        <Rect x="141" y="72" width="23" height="21" rx="5" fill="url(#win)" />
        {/* Reflections */}
        <Path d="M54 92l9-18h5l-9 18z" fill="#FFFFFF" opacity={0.45} />
        <Path d="M84 92l9-18h5l-9 18z" fill="#FFFFFF" opacity={0.45} />
        <Path d="M114 92l9-18h5l-9 18z" fill="#FFFFFF" opacity={0.45} />
        <Path d="M145 92l7-18h4l-7 18z" fill="#FFFFFF" opacity={0.4} />
      </G>

      {/* Door */}
      <Rect x="145" y="98" width="18" height="17" rx="3" fill="#9FC0EC" />
      <Line
        x1="154"
        y1="98"
        x2="154"
        y2="115"
        stroke="#FFFFFF"
        strokeWidth="1.4"
      />

      {/* Headlight + mirror + bumper */}
      <Circle cx="169" cy="105" r="3.4" fill="#FFF3C4" />
      <Rect x="170" y="86" width="4" height="9" rx="2" fill="#E08600" />
      <Rect x="166" y="113" width="8" height="6" rx="3" fill="#C2710A" />

      {/* Wheels */}
      <G>
        <Circle cx="68" cy="118" r="15" fill="#1F2937" />
        <Circle cx="68" cy="118" r="7" fill="#CBD5E1" />
        <Circle cx="68" cy="118" r="2.6" fill="#64748B" />
        <Circle cx="146" cy="118" r="15" fill="#1F2937" />
        <Circle cx="146" cy="118" r="7" fill="#CBD5E1" />
        <Circle cx="146" cy="118" r="2.6" fill="#64748B" />
      </G>
    </Svg>
  );
}
