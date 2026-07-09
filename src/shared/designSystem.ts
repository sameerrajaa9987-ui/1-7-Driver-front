/**
 * SchoolRide Connect — "Editorial Ledger" (2026 design system).
 *
 * A deliberately human, non-generic identity that reads as *designed*, not
 * AI-generated: warm paper surfaces, near-black warm ink, and ONE disciplined
 * marigold accent (school-bus livery, used only as solid blocks / underlines
 * — never gradients or glow). Typography is the hero — Fraunces (editorial
 * serif) for headlines and big numerals, Inter (clean grotesque) for UI, with
 * tabular "ledger" figures for money and counts. Flat surfaces, hairline
 * borders, restraint over decoration.
 *
 * Token KEYS are stable across re-skins so the whole kit re-themes centrally;
 * `palette.brand` is the accent ramp, `palette.teal` is a compatibility alias.
 */

// ---- fonts -----------------------------------------------------------------
export const fonts = {
  serif: {
    600: "Fraunces_600SemiBold",
    700: "Fraunces_700Bold",
    900: "Fraunces_900Black",
  },
  sans: {
    400: "Inter_400Regular",
    500: "Inter_500Medium",
    600: "Inter_600SemiBold",
    700: "Inter_700Bold",
  },
} as const;

type FamilyName = "serif" | "sans";
/** Resolve a (family, weight) to the exact bundled font, nearest weight down. */
export function resolveFont(family: FamilyName, weight: number): string {
  const table = fonts[family];
  const keys = Object.keys(table)
    .map(Number)
    .sort((a, b) => a - b);
  let pick = keys[0];
  for (const k of keys) if (k <= weight) pick = k;
  return table[pick as keyof typeof table];
}

// Accent ramp — marigold (warm saffron school-bus yellow, deepened for UI).
const marigold = {
  900: "#5E3D06",
  800: "#7A4F08",
  700: "#9A650A",
  600: "#C0820C",
  500: "#E19A10", // primary accent
  400: "#F0AE2E",
  300: "#F6C65E",
  200: "#FADFA0",
  100: "#FCEFCF",
  50: "#FDF8EC",
} as const;

export const palette = {
  // Primary ink — warm near-black charcoal (not blue; warmth reads human).
  ink: {
    900: "#1A1712",
    800: "#2A251D",
    700: "#3D362B",
    600: "#57503F",
    500: "#736A57",
    400: "#9A9080",
    300: "#C2B9A8",
    200: "#DED6C6",
    100: "#EDE7DB",
    50: "#F6F2EA",
  },

  // Accent — marigold (brand slot + compatibility alias)
  teal: marigold,
  brand: marigold,

  // A single quiet secondary — ink blue, only for links/info (never decoration)
  cobalt: {
    900: "#132A3A",
    800: "#1C3D53",
    700: "#26526F",
    600: "#356C8F",
    500: "#4A86AB",
    400: "#72A6C4",
    300: "#A0C6DC",
    200: "#C8DEEC",
    100: "#E4F0F6",
    50: "#F2F8FB",
  },

  neutral: {
    0: "#FFFFFF",
    50: "#F6F2EA",
    100: "#EDE7DB",
    200: "#DED6C6",
    300: "#C2B9A8",
    400: "#9A9080",
    500: "#736A57",
    600: "#57503F",
    700: "#3D362B",
    800: "#2A251D",
    900: "#1A1712",
  },

  // Warm paper surfaces — the editorial ledger feel.
  surface: {
    primary: "#FFFFFF", // cards
    secondary: "#F7F3EC", // app background (warm paper)
    tertiary: "#F0EBE1",
    raised: "#FFFFFF",
    sunken: "#EBE5D9",
    dark: "#1A1712", // the rare ink panel
    darkRaised: "#2A251D",
  },

  text: {
    primary: "#1A1712",
    secondary: "#57503F",
    tertiary: "#8A8272",
    disabled: "#B4AC9C",
    inverse: "#FBF8F2",
    accent: "#9A650A",
    link: "#26526F",
  },

  border: {
    subtle: "#EFEADF",
    default: "#E4DDCF",
    strong: "#D3CABA",
    focus: "#E19A10",
    dark: "#3D362B",
  },

  // Semantic — muted, editorial (desaturated, not neon).
  success: { bg: "#EDF4EC", text: "#3D6B4A", border: "#CBE0CD" },
  warning: { bg: "#FBF1D9", text: "#8A5A12", border: "#F0DCA8" },
  danger: { bg: "#F9ECE7", text: "#A23A22", border: "#EDCFC5" },
  info: { bg: "#EAF2F6", text: "#26526F", border: "#CFE0EA" },
} as const;

export const spacing = {
  "0": 0,
  px: 1,
  "0.5": 2,
  "1": 4,
  "1.5": 6,
  "2": 8,
  "2.5": 10,
  "3": 12,
  "3.5": 14,
  "4": 16,
  "5": 20,
  "6": 24,
  "7": 28,
  "8": 32,
  "9": 36,
  "10": 40,
  "12": 48,
  "14": 56,
  "16": 64,
  "20": 80,
} as const;

// Editorial corners — tighter, more considered (not pill-everything).
export const radius = {
  xs: 4,
  sm: 6,
  md: 10,
  lg: 14,
  xl: 18,
  "2xl": 22,
  "3xl": 26,
  full: 9999,
} as const;

// Hairline outline — the primary separation device (borders over shadows).
export const outline = { width: 1, color: "#E4DDCF" } as const;

/**
 * Typography — every variant declares its `family` (serif = Fraunces editorial,
 * sans = Inter UI) and default `weight`; `Text` resolves the exact font. Serif
 * carries the headlines and big numerals; sans carries everything functional.
 */
export const typography = {
  display: {
    large: {
      fontSize: 44,
      lineHeight: 48,
      letterSpacing: -1,
      family: "serif" as const,
      weight: 700,
    },
    medium: {
      fontSize: 34,
      lineHeight: 40,
      letterSpacing: -0.8,
      family: "serif" as const,
      weight: 700,
    },
    small: {
      fontSize: 27,
      lineHeight: 34,
      letterSpacing: -0.5,
      family: "serif" as const,
      weight: 600,
    },
  },
  heading: {
    h1: {
      fontSize: 24,
      lineHeight: 30,
      letterSpacing: -0.4,
      family: "serif" as const,
      weight: 600,
    },
    h2: {
      fontSize: 20,
      lineHeight: 26,
      letterSpacing: -0.3,
      family: "serif" as const,
      weight: 600,
    },
    h3: {
      fontSize: 17,
      lineHeight: 23,
      letterSpacing: 0,
      family: "sans" as const,
      weight: 700,
    },
    h4: {
      fontSize: 15,
      lineHeight: 20,
      letterSpacing: 0,
      family: "sans" as const,
      weight: 700,
    },
  },
  body: {
    large: {
      fontSize: 17,
      lineHeight: 26,
      family: "sans" as const,
      weight: 400,
    },
    default: {
      fontSize: 15,
      lineHeight: 22,
      family: "sans" as const,
      weight: 400,
    },
    small: {
      fontSize: 13,
      lineHeight: 19,
      family: "sans" as const,
      weight: 400,
    },
  },
  label: {
    large: {
      fontSize: 15,
      lineHeight: 20,
      letterSpacing: -0.1,
      family: "sans" as const,
      weight: 600,
    },
    medium: {
      fontSize: 13,
      lineHeight: 18,
      family: "sans" as const,
      weight: 600,
    },
    small: {
      fontSize: 11,
      lineHeight: 16,
      letterSpacing: 0.2,
      family: "sans" as const,
      weight: 600,
    },
  },
  caption: {
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.1,
    family: "sans" as const,
    weight: 500,
  },
  overline: {
    fontSize: 11,
    lineHeight: 16,
    letterSpacing: 1.4,
    textTransform: "uppercase" as const,
    family: "sans" as const,
    weight: 700,
  },
} as const;

// Editorial elevation — barely-there; hairline borders do the real work.
const soft = (y: number, radius: number, opacity: number, elev: number) => ({
  shadowColor: "#1A1712",
  shadowOffset: { width: 0, height: y },
  shadowOpacity: opacity,
  shadowRadius: radius,
  elevation: elev,
});

export const shadows = {
  none: {},
  xs: soft(1, 1, 0.03, 1),
  sm: soft(1, 2, 0.04, 2),
  md: soft(2, 6, 0.05, 3),
  lg: soft(4, 12, 0.07, 6),
  xl: soft(8, 20, 0.09, 10),
} as const;

export const elevation = {
  base: shadows.xs,
  raised: shadows.sm,
  floating: shadows.md,
  overlay: shadows.lg,
} as const;

export const motion = {
  duration: { fast: 150, medium: 250, slow: 400 },
  spring: {
    gentle: { damping: 18, stiffness: 180 },
    default: { damping: 20, stiffness: 220 },
    bouncy: { damping: 12, stiffness: 200 },
    crisp: { damping: 25, stiffness: 300 },
  },
} as const;

/**
 * "Gradients" — intentionally FLAT in this system (two near-identical stops) so
 * every hero using expo-linear-gradient renders as a solid editorial panel, not
 * a showy sweep. The AI-tell gradient look is designed out here, centrally.
 */
export const gradients = {
  hero: ["#211C15", "#1A1712"] as const, // flat ink panel
  teal: ["#E19A10", "#E19A10"] as const, // flat marigold (compat key)
  brand: ["#E19A10", "#E19A10"] as const,
  cobalt: ["#26526F", "#26526F"] as const,
  light: ["#FFFFFF", "#FFFFFF"] as const,
  mist: ["#F7F3EC", "#F7F3EC"] as const,
} as const;

/** Translucent chips for use on the rare ink panel (login/menu identity). */
export const glass = {
  light: {
    backgroundColor: "rgba(255,255,255,0.10)",
    borderColor: "rgba(255,255,255,0.16)",
    borderWidth: 1,
  },
  lighter: {
    backgroundColor: "rgba(255,255,255,0.06)",
    borderColor: "rgba(255,255,255,0.12)",
    borderWidth: 1,
  },
  dark: {
    backgroundColor: "rgba(26,23,18,0.06)",
    borderColor: "rgba(26,23,18,0.10)",
    borderWidth: 1,
  },
} as const;

/**
 * Category tints — muted editorial swatches for status chips / stat tiles.
 * "teal" is the live/brand slot (marigold), the rest are quiet supporting hues.
 */
export const tints = {
  neutral: { bg: "#F0EBE1", fg: "#57503F", icon: "#8A8272", ring: "#E4DDCF" },
  teal: { bg: "#FCEFCF", fg: "#9A650A", icon: "#C0820C", ring: "#F6C65E" }, // brand
  blue: { bg: "#EAF2F6", fg: "#26526F", icon: "#356C8F", ring: "#CFE0EA" },
  green: { bg: "#EDF4EC", fg: "#3D6B4A", icon: "#4E8A5E", ring: "#CBE0CD" },
  amber: { bg: "#FBF1D9", fg: "#8A5A12", icon: "#C0820C", ring: "#F0DCA8" },
  red: { bg: "#F9ECE7", fg: "#A23A22", icon: "#C24A2E", ring: "#EDCFC5" },
  violet: { bg: "#F0ECF3", fg: "#5E4A72", icon: "#7A6293", ring: "#DBD0E4" },
} as const;

export type TintName = keyof typeof tints;

/**
 * Trip + stop status → tint + human label (spec §7). Single source of truth for
 * every status chip, timeline node, and live badge across the app.
 */
export const tripStatusMeta: Record<string, { tint: TintName; label: string }> =
  {
    not_started: { tint: "neutral", label: "Not started" },
    in_progress: { tint: "teal", label: "On the way" },
    completed: { tint: "green", label: "Completed" },
    cancelled: { tint: "red", label: "Cancelled" },
    pending: { tint: "neutral", label: "Waiting" },
    arrived: { tint: "amber", label: "Arriving" },
    picked_up: { tint: "teal", label: "On board" },
    no_show: { tint: "red", label: "Absent" },
    dropped: { tint: "green", label: "Dropped safely" },
  };

export const layout = {
  screenPadding: 20,
  cardPadding: 20,
  sectionGap: 28,
  itemGap: 12,
  sidebarWidth: 264,
  sidebarCollapsedWidth: 76,
  tabBarHeight: 72,
  tabBarClearance: 96,
  chipHeight: 36,
  chipRowHeight: 44,
  contentMaxWidth: 1200,
  wideBreakpoint: 900,
} as const;
