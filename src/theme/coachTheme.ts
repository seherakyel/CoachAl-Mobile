/**
 * CoachAI — görsel palet: açık yüzey #E9E9E9 + lacivert #385F8C
 */

export const CoachPalette = {
  midnightIndigo: "#385F8C",
  vanillaCream: "#E9E9E9",
  /** Kartlar — zeminden daha açık, tam beyaz değil */
  surfaceCard: "#F7F7F7",
  subtleBorder: "#D2D2D2",
  /** İkincil / basılı birincil — navy ile krem arası köprü */
  softIndigo: "#6A86A8",
  ghostText: "#6E7182",
  mutedGold: "#C5A059",
  /** Birincil buton koyulaştırma */
  primaryButtonShade: "#2E5075",
} as const;

const CREAM = { r: 233, g: 233, b: 233 }; // #E9E9E9
const DEEP = { r: 56, g: 95, b: 140 }; // #385F8C

export function coachMix(t: number): string {
  const x = Math.max(0, Math.min(1, t));
  const r = Math.round(CREAM.r + (DEEP.r - CREAM.r) * x);
  const g = Math.round(CREAM.g + (DEEP.g - CREAM.g) * x);
  const b = Math.round(CREAM.b + (DEEP.b - CREAM.b) * x);
  return `#${[r, g, b].map((n) => n.toString(16).padStart(2, "0")).join("")}`;
}

const P = CoachPalette;

export const CoachColors = {
  cream: P.vanillaCream,
  deep: P.midnightIndigo,

  background: P.vanillaCream,
  onBackground: P.midnightIndigo,
  surface: P.vanillaCream,

  surfaceCard: P.surfaceCard,
  surfaceContainerLowest: P.surfaceCard,
  surfaceContainerLow: "#F1F1F1",
  surfaceContainer: "#EBEBEB",
  surfaceContainerHigh: "#E4E4E4",
  surfaceContainerHighest: "#DDDDDD",
  surfaceVariant: P.subtleBorder,

  onSurface: P.midnightIndigo,
  onSurfaceVariant: P.ghostText,
  secondaryText: P.ghostText,
  ghostText: P.ghostText,

  outline: coachMix(0.28),
  outlineVariant: P.subtleBorder,

  primary: P.midnightIndigo,
  primaryContainer: P.midnightIndigo,
  onPrimary: P.vanillaCream,
  primaryPressed: P.softIndigo,
  primaryButtonShade: P.primaryButtonShade,

  onPrimaryMuted: "rgba(233, 233, 233, 0.82)",
  onPrimaryContainer: P.ghostText,
  primaryFixed: "rgba(56, 95, 140, 0.12)",
  primaryFixedDim: "rgba(56, 95, 140, 0.18)",

  softIndigo: P.softIndigo,
  secondary: P.softIndigo,
  secondaryContainer: P.softIndigo,
  onSecondary: P.vanillaCream,

  componentSurface: P.midnightIndigo,
  onComponentSurface: P.vanillaCream,

  tabBarBackground: P.vanillaCream,
  tabActivePill: "rgba(56, 95, 140, 0.14)",
  tabActiveBackground: "rgba(56, 95, 140, 0.14)",
  tabInactiveForeground: P.ghostText,
  tabActiveForeground: P.midnightIndigo,

  accent: P.mutedGold,
  accentMuted: "rgba(197, 160, 89, 0.18)",
  successGreen: P.mutedGold,
  insightChipBg: "rgba(197, 160, 89, 0.14)",

  error: P.midnightIndigo,
  onError: P.vanillaCream,
  errorContainer: "rgba(56, 95, 140, 0.06)",
  onErrorContainer: P.midnightIndigo,

  shadowIndigo: "rgba(56, 95, 140, 0.08)",

  emerald50: "rgba(197, 160, 89, 0.12)",
  emerald200: P.subtleBorder,
  emerald400: P.mutedGold,
  emerald600: P.mutedGold,
  emerald700: P.midnightIndigo,
  amber50: coachMix(0.08),
  amber400: P.mutedGold,
  amber600: P.softIndigo,
  amber700: P.midnightIndigo,
  slate100: P.subtleBorder,
  slate200: P.subtleBorder,
  slate300: coachMix(0.25),
  slate500: P.ghostText,
  indigo400: P.softIndigo,
  red50: coachMix(0.06),
  red200: P.subtleBorder,
  red600: P.midnightIndigo,
  red700: P.midnightIndigo,
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
    shadowColor: P.midnightIndigo,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 14,
    elevation: 2,
  },
  elevated: {
    shadowColor: P.midnightIndigo,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 5,
  },
} as const;

export const CoachGlass = {
  backgroundColor: "rgba(247, 247, 247, 0.94)",
  borderWidth: 1,
  borderColor: P.subtleBorder,
} as const;

export const CoachAppBarTheme = {
  colors: {
    primary: P.vanillaCream,
    onSurface: P.vanillaCream,
    surface: P.midnightIndigo,
    elevation: {
      level2: P.midnightIndigo,
      level3: P.midnightIndigo,
    },
  },
};
