/**
 * SchoolRide Connect — 2026 design system ("Clean SaaS"), ONE consistent
 * identity across every role.
 *
 * Senior-dev principle (grounded in 2026 UI/UX practice): a product feels
 * trustworthy when it uses ONE accent, applied to ~10% of the UI (primary
 * buttons, active tabs, links, key icons) over a 60/30 neutral base. More than
 * one brand accent reads as inconsistent — the "made in ChatGPT" tell.
 *
 * - Accent: a single INDIGO (#4F46E5) for the whole app, every role.
 * - Neutral: cool slate ink on a #F5F6FA canvas with white cards.
 * - Functional colour only: green = paid/done, amber = pending/arriving,
 *   red = danger/SOS. These are semantics, not brand, so they stay.
 * - Type: Inter only, one shared scale. Spacing/radius/shadow: one token set.
 *
 * There is ONE `accent` (indigo) for every role — never keyed by role.
 * `palette.brand`, `palette.teal`, `palette.cobalt` are all aliases of the one
 * indigo ramp.
 */

// ---- fonts -----------------------------------------------------------------
export const fonts = {
  // "serif" kept as a compatibility slot — resolves to Inter bold cuts.
  serif: {
    600: "Inter_600SemiBold",
    700: "Inter_700Bold",
    900: "Inter_700Bold",
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

// ---- the single brand accent — indigo, used app-wide -----------------------
/**
 * The one accent for the whole product (primary buttons, active tab, links,
 * key icons). There is exactly ONE — the design is intentionally not
 * role-based — so this is a plain constant, never keyed by role.
 */
export const accent = {
  main: "#4F46E5",
  dark: "#4338CA",
  soft: "#EEF2FF",
  on: "#FFFFFF",
} as const;
export type Accent = typeof accent;

// App accent ramp — one indigo, used everywhere via brand/teal/cobalt aliases.
const indigo = {
  900: "#312E81",
  800: "#3730A3",
  700: "#4338CA",
  600: "#4F46E5",
  500: "#6366F1",
  400: "#818CF8",
  300: "#A5B4FC",
  200: "#C7D2FE",
  100: "#E0E7FF",
  50: "#EEF2FF",
} as const;

export const palette = {
  // Ink — cool slate (the client kit is cool-toned).
  ink: {
    900: "#101828",
    800: "#1D2939",
    700: "#344054",
    600: "#475467",
    500: "#667085",
    400: "#98A2B3",
    300: "#D0D5DD",
    200: "#E4E7EC",
    100: "#F2F4F7",
    50: "#F9FAFB",
  },

  teal: indigo, // compatibility alias → the one indigo accent
  brand: indigo,

  cobalt: indigo,

  neutral: {
    0: "#FFFFFF",
    50: "#F9FAFB",
    100: "#F2F4F7",
    200: "#E4E7EC",
    300: "#D0D5DD",
    400: "#98A2B3",
    500: "#667085",
    600: "#475467",
    700: "#344054",
    800: "#1D2939",
    900: "#101828",
  },

  // Light SaaS surfaces.
  surface: {
    primary: "#FFFFFF", // cards
    secondary: "#F5F6FA", // app background
    tertiary: "#F2F4F7",
    raised: "#FFFFFF",
    sunken: "#EEF0F5",
    dark: "#1E2B4D", // the navy welcome banner
    darkRaised: "#26355E",
  },

  text: {
    primary: "#101828",
    secondary: "#344054",
    tertiary: "#667085",
    disabled: "#98A2B3",
    inverse: "#FFFFFF",
    accent: "#4F46E5",
    link: "#4F46E5",
  },

  border: {
    subtle: "#F2F4F7",
    default: "#E8EAF0",
    strong: "#D0D5DD",
    focus: "#4F46E5",
    dark: "#344054",
  },

  // Semantic — bright, soft SaaS chips (per the client kit).
  success: { bg: "#E8F7EE", text: "#12805C", border: "#B7E4C7" },
  warning: { bg: "#FEF4E6", text: "#B54708", border: "#FBDFB1" },
  danger: { bg: "#FEECEB", text: "#B42318", border: "#F7C6C2" },
  info: { bg: "#EEF2FF", text: "#4338CA", border: "#C7D2FE" },
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

// Soft rounded corners per the client kit (~cards 14–16).
export const radius = {
  xs: 6,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  "2xl": 24,
  "3xl": 28,
  full: 9999,
} as const;

export const outline = { width: 1, color: "#E8EAF0" } as const;

/**
 * Typography — clean Inter throughout (client kit). Every variant declares a
 * `family` + `weight`; `Text` resolves the exact bundled cut.
 */
export const typography = {
  display: {
    large: {
      fontSize: 32,
      lineHeight: 38,
      letterSpacing: -0.6,
      family: "sans" as const,
      weight: 700,
    },
    medium: {
      fontSize: 26,
      lineHeight: 32,
      letterSpacing: -0.4,
      family: "sans" as const,
      weight: 700,
    },
    small: {
      fontSize: 22,
      lineHeight: 28,
      letterSpacing: -0.3,
      family: "sans" as const,
      weight: 700,
    },
  },
  heading: {
    h1: {
      fontSize: 20,
      lineHeight: 26,
      letterSpacing: -0.3,
      family: "sans" as const,
      weight: 700,
    },
    h2: {
      fontSize: 18,
      lineHeight: 24,
      letterSpacing: -0.2,
      family: "sans" as const,
      weight: 700,
    },
    h3: {
      fontSize: 16,
      lineHeight: 22,
      family: "sans" as const,
      weight: 600,
    },
    h4: {
      fontSize: 14,
      lineHeight: 20,
      family: "sans" as const,
      weight: 600,
    },
  },
  body: {
    large: {
      fontSize: 16,
      lineHeight: 24,
      family: "sans" as const,
      weight: 400,
    },
    default: {
      fontSize: 14,
      lineHeight: 21,
      family: "sans" as const,
      weight: 400,
    },
    small: {
      fontSize: 13,
      lineHeight: 18,
      family: "sans" as const,
      weight: 400,
    },
  },
  label: {
    large: {
      fontSize: 15,
      lineHeight: 20,
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
      lineHeight: 15,
      letterSpacing: 0.2,
      family: "sans" as const,
      weight: 600,
    },
  },
  caption: {
    fontSize: 12,
    lineHeight: 16,
    family: "sans" as const,
    weight: 500,
  },
  overline: {
    fontSize: 11,
    lineHeight: 15,
    letterSpacing: 1,
    textTransform: "uppercase" as const,
    family: "sans" as const,
    weight: 700,
  },
} as const;

// Soft SaaS elevation — gentle drop shadows under white cards.
const soft = (y: number, radius: number, opacity: number, elev: number) => ({
  shadowColor: "#101828",
  shadowOffset: { width: 0, height: y },
  shadowOpacity: opacity,
  shadowRadius: radius,
  elevation: elev,
});

export const shadows = {
  none: {},
  xs: soft(1, 2, 0.04, 1),
  sm: soft(2, 4, 0.05, 2),
  md: soft(4, 10, 0.07, 4),
  lg: soft(8, 18, 0.09, 8),
  xl: soft(12, 28, 0.12, 12),
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

/** Gradients — navy welcome banner + ONE indigo accent sweep (all keys equal). */
export const gradients = {
  hero: ["#26355E", "#1E2B4D"] as const, // navy welcome banner (neutral dark)
  teal: ["#6366F1", "#4F46E5"] as const, // indigo sweep (compat key)
  brand: ["#6366F1", "#4F46E5"] as const,
  cobalt: ["#6366F1", "#4F46E5"] as const,
  violet: ["#6366F1", "#4F46E5"] as const, // was parent-only; now the one accent
  light: ["#FFFFFF", "#F5F6FA"] as const,
  mist: ["#EEF2FF", "#F5F6FA"] as const,
} as const;

/** Translucent chips for use on navy/violet banner panels. */
export const glass = {
  light: {
    backgroundColor: "rgba(255,255,255,0.14)",
    borderColor: "rgba(255,255,255,0.22)",
    borderWidth: 1,
  },
  lighter: {
    backgroundColor: "rgba(255,255,255,0.08)",
    borderColor: "rgba(255,255,255,0.14)",
    borderWidth: 1,
  },
  dark: {
    backgroundColor: "rgba(16,24,40,0.06)",
    borderColor: "rgba(16,24,40,0.10)",
    borderWidth: 1,
  },
} as const;

/**
 * Category tints — the three accent-family slots (teal/blue/violet) are all the
 * ONE indigo, so every "brand" tile is identical app-wide. green/amber/red are
 * functional status colours and stay distinct. neutral is the quiet slate slot.
 */
const indigoTint = {
  bg: "#EEF2FF",
  fg: "#4F46E5",
  icon: "#4F46E5",
  ring: "#C7D2FE",
} as const;
export const tints = {
  neutral: { bg: "#F2F4F7", fg: "#475467", icon: "#667085", ring: "#E4E7EC" },
  teal: indigoTint, // live / brand
  blue: indigoTint,
  violet: indigoTint,
  green: { bg: "#E8F7EE", fg: "#12805C", icon: "#12B76A", ring: "#B7E4C7" },
  amber: { bg: "#FEF4E6", fg: "#B54708", icon: "#F79009", ring: "#FBDFB1" },
  red: { bg: "#FEECEB", fg: "#B42318", icon: "#F04438", ring: "#F7C6C2" },
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
  tabBarHeight: 64,
  tabBarClearance: 84,
  chipHeight: 36,
  chipRowHeight: 44,
  contentMaxWidth: 1200,
  wideBreakpoint: 900,
} as const;
