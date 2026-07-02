/**
 * SchoolRide Design System — "Midnight Transit" (2026 edition).
 *
 * A premium transport identity: deep midnight-navy ink, school-bus amber as
 * the brand accent (black-on-amber, like a bus livery), warm paper surfaces,
 * and dark glassy hero panels. Tuned for operators, drivers, and parents on
 * the go: oversized display numerals, bento stat tiles, traffic-light status
 * colours, soft blurred elevation, and large rounded corners.
 *
 * NOTE: token KEYS are stable across re-skins (`palette.teal` is the brand
 * ramp slot — it now holds bus-amber; `palette.brand` is the readable alias
 * for new code). Only values change between editions.
 */

// Brand ramp — school-bus amber (signal yellow, deepened for UI use).
const busAmber = {
  900: "#744312",
  800: "#8F5410",
  700: "#B26B05",
  600: "#D68806",
  500: "#F0A70A",
  400: "#F8B81E",
  300: "#FBCE47",
  200: "#FDE38A",
  100: "#FEF0C7",
  50: "#FFF9EB",
} as const;

export const palette = {
  // Primary ink — midnight navy (deep, confident, high-legibility text)
  ink: {
    900: "#0B1526",
    800: "#142338",
    700: "#20334E",
    600: "#334766",
    500: "#536685",
    400: "#8292AC",
    300: "#B3BFD1",
    200: "#D9E0EA",
    100: "#EDF1F6",
    50: "#F7F9FC",
  },

  // Primary brand — school-bus amber (brand slot; see alias below)
  teal: busAmber,
  brand: busAmber,

  // Accent — cobalt blue (links, secondary CTAs, info)
  cobalt: {
    900: "#0B254E",
    800: "#103572",
    700: "#1A4D9E",
    600: "#2563EB",
    500: "#3B82F6",
    400: "#60A5FA",
    300: "#93C5FD",
    200: "#BFDBFE",
    100: "#DBEAFE",
    50: "#EFF6FF",
  },

  // Cool neutral ramp (kept for chart/void use)
  neutral: {
    0: "#FFFFFF",
    50: "#F8FAFC",
    100: "#F1F5F9",
    200: "#E2E8F0",
    300: "#CBD5E1",
    400: "#94A3B8",
    500: "#64748B",
    600: "#475569",
    700: "#334155",
    800: "#1E293B",
    900: "#0F172A",
  },

  // Warm paper surfaces — premium editorial/ticket feel under navy + amber.
  surface: {
    primary: "#FFFFFF",
    secondary: "#F7F6F3",
    tertiary: "#F1EFEA",
    raised: "#FFFFFF",
    sunken: "#ECEAE4",
    dark: "#0B1526",
    darkRaised: "#142338",
  },

  text: {
    primary: "#0B1526",
    secondary: "#2E4160",
    tertiary: "#667085",
    disabled: "#A5ADBB",
    inverse: "#FFFFFF",
    accent: "#B26B05",
    link: "#2563EB",
  },

  border: {
    subtle: "#F0EEE8",
    default: "#E7E4DD",
    strong: "#D6D2C8",
    focus: "#F0A70A",
    dark: "#20334E",
  },

  // Semantic — traffic-light trip/fee states
  success: { bg: "#ECFDF5", text: "#047857", border: "#A7F3D0" },
  warning: { bg: "#FFF9EB", text: "#B26B05", border: "#FDE38A" },
  danger: { bg: "#FEF2F2", text: "#B91C1C", border: "#FECACA" },
  info: { bg: "#EFF6FF", text: "#1D4ED8", border: "#BFDBFE" },
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

// Soft, rounded corners — large radii for the premium 2026 language.
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

// Thin, warm hairline outline.
export const outline = { width: 1, color: "#E7E4DD" } as const;

export const typography = {
  display: {
    large: {
      fontSize: 40,
      lineHeight: 48,
      fontWeight: "700" as const,
      letterSpacing: -0.5,
    },
    medium: {
      fontSize: 32,
      lineHeight: 40,
      fontWeight: "700" as const,
      letterSpacing: -0.4,
    },
    small: {
      fontSize: 28,
      lineHeight: 36,
      fontWeight: "700" as const,
      letterSpacing: -0.3,
    },
  },
  heading: {
    h1: {
      fontSize: 24,
      lineHeight: 30,
      fontWeight: "700" as const,
      letterSpacing: -0.4,
    },
    h2: {
      fontSize: 20,
      lineHeight: 26,
      fontWeight: "600" as const,
      letterSpacing: -0.3,
    },
    h3: {
      fontSize: 17,
      lineHeight: 22,
      fontWeight: "600" as const,
      letterSpacing: -0.2,
    },
    h4: {
      fontSize: 15,
      lineHeight: 20,
      fontWeight: "600" as const,
      letterSpacing: -0.1,
    },
  },
  body: {
    large: { fontSize: 17, lineHeight: 26, fontWeight: "400" as const },
    default: { fontSize: 15, lineHeight: 22, fontWeight: "400" as const },
    small: { fontSize: 13, lineHeight: 18, fontWeight: "400" as const },
  },
  label: {
    large: {
      fontSize: 15,
      lineHeight: 20,
      fontWeight: "600" as const,
      letterSpacing: -0.1,
    },
    medium: {
      fontSize: 13,
      lineHeight: 18,
      fontWeight: "600" as const,
      letterSpacing: 0,
    },
    small: {
      fontSize: 11,
      lineHeight: 16,
      fontWeight: "600" as const,
      letterSpacing: 0.2,
    },
  },
  caption: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "500" as const,
    letterSpacing: 0.1,
  },
  overline: {
    fontSize: 11,
    lineHeight: 16,
    fontWeight: "700" as const,
    letterSpacing: 1.2,
    textTransform: "uppercase" as const,
  },
} as const;

// Soft, blurred elevation — navy-tinted so shadows feel part of the ink.
const soft = (y: number, radius: number, opacity: number, elev: number) => ({
  shadowColor: "#0B1526",
  shadowOffset: { width: 0, height: y },
  shadowOpacity: opacity,
  shadowRadius: radius,
  elevation: elev,
});

export const shadows = {
  none: {},
  xs: soft(1, 2, 0.05, 1),
  sm: soft(2, 6, 0.07, 2),
  md: soft(4, 12, 0.09, 4),
  lg: soft(8, 22, 0.11, 8),
  xl: soft(14, 34, 0.14, 14),
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

/** Gradients — dark-first hero sweeps consumed by expo-linear-gradient. */
export const gradients = {
  hero: ["#16263F", "#0F1B2F", "#0A121F"] as const, // midnight hero
  teal: ["#F8B81E", "#F0A70A"] as const, // brand (amber) sweep — key kept for compat
  brand: ["#F8B81E", "#F0A70A"] as const,
  cobalt: ["#3B82F6", "#2563EB", "#1A4D9E"] as const,
  light: ["#FFFFFF", "#F7F6F3"] as const,
  mist: ["#FFF9EB", "#EDF1F6"] as const, // amber dawn → navy mist
} as const;

/** Glass — translucent frosted panels for overlays over the midnight hero. */
export const glass = {
  light: {
    backgroundColor: "rgba(255,255,255,0.16)",
    borderColor: "rgba(255,255,255,0.28)",
    borderWidth: 1,
  },
  lighter: {
    backgroundColor: "rgba(255,255,255,0.10)",
    borderColor: "rgba(255,255,255,0.18)",
    borderWidth: 1,
  },
  dark: {
    backgroundColor: "rgba(11,21,38,0.30)",
    borderColor: "rgba(255,255,255,0.12)",
    borderWidth: 1,
  },
} as const;

/**
 * Category tints (2026 bento trend) — soft background + matching foreground for
 * tiles/chips, so metrics read at a glance by colour: navy = live/tracking,
 * blue = analytics, green = safe/paid, amber = attention/arriving, red =
 * problem, violet = journey/handover.
 */
export const tints = {
  neutral: { bg: "#F1EFEA", fg: "#4A5568", icon: "#667085", ring: "#E7E4DD" },
  teal: { bg: "#EEF2F8", fg: "#1F3251", icon: "#33476B", ring: "#D9E0EA" }, // live/navy
  blue: { bg: "#EFF6FF", fg: "#2563EB", icon: "#2563EB", ring: "#BFDBFE" },
  green: { bg: "#ECFDF5", fg: "#047857", icon: "#059669", ring: "#A7F3D0" },
  amber: { bg: "#FFF9EB", fg: "#B26B05", icon: "#D68806", ring: "#FDE38A" },
  red: { bg: "#FEF2F2", fg: "#B91C1C", icon: "#DC2626", ring: "#FECACA" },
  violet: { bg: "#F5F3FF", fg: "#6D28D9", icon: "#7C3AED", ring: "#DDD6FE" },
} as const;

export type TintName = keyof typeof tints;

/**
 * Trip + stop status → tint + human label (spec §7). Single source of truth for
 * every status chip, timeline node, and live badge across the app.
 */
export const tripStatusMeta: Record<string, { tint: TintName; label: string }> =
  {
    // trip
    not_started: { tint: "neutral", label: "Not started" },
    in_progress: { tint: "teal", label: "On the way" },
    completed: { tint: "green", label: "Completed" },
    cancelled: { tint: "red", label: "Cancelled" },
    // stop
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
  // Width at/above which the layout switches to the desktop sidebar shell.
  wideBreakpoint: 900,
} as const;
