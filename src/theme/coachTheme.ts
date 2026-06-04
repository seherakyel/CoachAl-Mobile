/**
 * CoachAI mobile theme — aligned with web Tailwind tokens.
 */
import { WebTokens as W } from "./webTokens";

const CREAM = { r: 252, g: 248, b: 255 };
const DEEP = { r: 53, g: 37, b: 205 };

export function coachMix(t: number): string {
  const x = Math.max(0, Math.min(1, t));
  const r = Math.round(CREAM.r + (DEEP.r - CREAM.r) * x);
  const g = Math.round(CREAM.g + (DEEP.g - CREAM.g) * x);
  const b = Math.round(CREAM.b + (DEEP.b - CREAM.b) * x);
  return `#${[r, g, b].map((n) => n.toString(16).padStart(2, "0")).join("")}`;
}

export const CoachPalette = {
  primary: W.primary,
  primaryContainer: W.primaryContainer,
  onPrimary: W.onPrimary,
  onPrimaryContainer: W.onPrimaryContainer,
  primaryFixed: W.primaryFixed,
  primaryFixedDim: W.primaryFixedDim,
  secondary: W.secondary,
  onSecondary: W.onSecondary,
  secondaryContainer: W.secondaryContainer,
  error: W.error,
  onError: W.onError,
  errorContainer: W.errorContainer,
  onErrorContainer: W.onErrorContainer,
  background: W.background,
  onBackground: W.onBackground,
  surface: W.surface,
  surfaceContainerLowest: W.surfaceContainerLowest,
  surfaceContainerLow: W.surfaceContainerLow,
  surfaceContainer: W.surfaceContainer,
  surfaceContainerHigh: W.surfaceContainerHigh,
  surfaceContainerHighest: W.surfaceContainerHighest,
  onSurface: W.onSurface,
  onSurfaceVariant: W.onSurfaceVariant,
  surfaceVariant: W.surfaceVariant,
  outline: W.outline,
  outlineVariant: W.outlineVariant,
} as const;

export const CoachColors = {
  ...CoachPalette,

  /** Legacy alias — header/chrome uses white bar like web ui.js */
  componentSurface: W.surfaceContainerLowest,
  onComponentSurface: W.onSurface,

  surfaceCard: W.surfaceContainerLowest,
  ghostText: W.onSurfaceVariant,
  secondaryText: W.onSurfaceVariant,

  primaryPressed: W.primary,
  primaryButtonShade: W.primary,

  onPrimaryMuted: "rgba(255, 255, 255, 0.88)",

  tabBarBackground: W.surfaceContainerLowest,
  tabActivePill: "rgba(53, 37, 205, 0.12)",
  tabActiveBackground: "rgba(53, 37, 205, 0.12)",
  tabInactiveForeground: W.onSurfaceVariant,
  tabActiveForeground: W.primary,

  accent: W.primaryContainer,
  accentMuted: "rgba(79, 70, 229, 0.14)",
  insightChipBg: W.primaryFixed,

  shadowIndigo: "rgba(53, 37, 205, 0.08)",

  emerald50: "rgba(5, 150, 105, 0.12)",
  emerald200: "#a7f3d0",
  emerald400: "#059669",
  emerald600: "#059669",
  emerald700: "#059669",
  amber50: "rgba(217, 119, 6, 0.12)",
  amber400: "#d97706",
  amber600: "#d97706",
  amber700: "#d97706",
  slate100: W.outlineVariant,
  slate200: W.outlineVariant,
  slate300: W.outline,
  slate500: W.onSurfaceVariant,
  indigo400: W.primaryContainer,
  red50: "rgba(220, 38, 38, 0.08)",
  red200: "#fecaca",
  red600: "#dc2626",
  red700: "#dc2626",

  headerBorder: "rgba(226, 232, 240, 0.9)",
} as const;

export const CoachRadii = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
} as const;

export const CoachShadow = {
  card: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 24,
    elevation: 2,
  },
  elevated: {
    shadowColor: W.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 5,
  },
} as const;

export const CoachGlass = {
  backgroundColor: "rgba(255, 255, 255, 0.94)",
  borderWidth: 1,
  borderColor: W.outlineVariant,
} as const;

export const CoachAppBarTheme = {
  colors: {
    primary: W.onSurface,
    onSurface: W.onSurface,
    surface: W.surfaceContainerLowest,
    elevation: {
      level2: W.surfaceContainerLowest,
      level3: W.surfaceContainerLowest,
    },
  },
};
