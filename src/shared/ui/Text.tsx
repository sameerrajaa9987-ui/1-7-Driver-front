/** Text — all typography routes through here. Resolves the Editorial Ledger
 *  type system: each variant picks Fraunces (serif) or Inter (sans) at the
 *  right weight; display/number variants use tabular "ledger" figures. */
import React from "react";
import { Text as RNText, TextStyle, StyleProp } from "react-native";
import { typography, palette, resolveFont } from "../designSystem";

type Variant =
  | "display-lg"
  | "display-md"
  | "display-sm"
  | "h1"
  | "h2"
  | "h3"
  | "h4"
  | "body-lg"
  | "body"
  | "body-sm"
  | "label-lg"
  | "label"
  | "label-sm"
  | "caption"
  | "overline";

type Tone =
  | "primary"
  | "secondary"
  | "tertiary"
  | "disabled"
  | "inverse"
  | "accent"
  | "link"
  | "danger"
  | "success"
  | "warning";

interface Props {
  variant?: Variant;
  tone?: Tone;
  weight?: "400" | "500" | "600" | "700";
  align?: "left" | "center" | "right";
  /** Force tabular (monospaced) figures — for money, counts, times. */
  numeric?: boolean;
  numberOfLines?: number;
  adjustsFontSizeToFit?: boolean;
  style?: StyleProp<TextStyle>;
  children: React.ReactNode;
}

const variantMap = {
  "display-lg": typography.display.large,
  "display-md": typography.display.medium,
  "display-sm": typography.display.small,
  h1: typography.heading.h1,
  h2: typography.heading.h2,
  h3: typography.heading.h3,
  h4: typography.heading.h4,
  "body-lg": typography.body.large,
  body: typography.body.default,
  "body-sm": typography.body.small,
  "label-lg": typography.label.large,
  label: typography.label.medium,
  "label-sm": typography.label.small,
  caption: typography.caption,
  overline: typography.overline,
} as const;

// Display headlines are almost always numeric heroes → tabular by default.
const TABULAR_VARIANTS = new Set<Variant>([
  "display-lg",
  "display-md",
  "display-sm",
]);

const toneMap: Record<Tone, string> = {
  primary: palette.text.primary,
  secondary: palette.text.secondary,
  tertiary: palette.text.tertiary,
  disabled: palette.text.disabled,
  inverse: palette.text.inverse,
  accent: palette.text.accent,
  link: palette.text.link,
  danger: palette.danger.text,
  success: palette.success.text,
  warning: palette.warning.text,
};

export function Text({
  variant = "body",
  tone = "primary",
  weight,
  align,
  numeric,
  numberOfLines,
  adjustsFontSizeToFit,
  style,
  children,
}: Props) {
  const base = variantMap[variant] as {
    fontSize: number;
    lineHeight: number;
    letterSpacing?: number;
    textTransform?: TextStyle["textTransform"];
    family: "serif" | "sans";
    weight: number;
  };
  // A caller `weight` prop overrides the variant's default weight, but the
  // FAMILY (serif vs sans) stays fixed to the variant so headlines stay serif.
  const effectiveWeight = weight ? Number(weight) : base.weight;
  const fontFamily = resolveFont(base.family, effectiveWeight);
  const tabular = numeric || TABULAR_VARIANTS.has(variant);

  return (
    <RNText
      numberOfLines={numberOfLines}
      adjustsFontSizeToFit={adjustsFontSizeToFit}
      style={[
        {
          fontSize: base.fontSize,
          lineHeight: base.lineHeight,
          letterSpacing: base.letterSpacing,
          textTransform: base.textTransform,
          fontFamily,
          color: toneMap[tone],
        },
        tabular ? { fontVariant: ["tabular-nums"] } : undefined,
        align ? { textAlign: align } : undefined,
        style,
      ]}
    >
      {children}
    </RNText>
  );
}
