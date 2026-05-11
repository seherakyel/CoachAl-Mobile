import { Platform, StyleSheet } from "react-native";
import { CoachPalette } from "../../theme/coachTheme";

/** AppBar (#385F8C) ile hizalı; mor/indigo yerine tek mavi ailesi */
const APP = CoachPalette.midnightIndigo;
const SOFT = CoachPalette.softIndigo;

export const AR = {
  bg: "#F8FAFC",
  indigo600: APP,
  indigo500: SOFT,
  slate900: "#0f172a",
  slate700: "#334155",
  slate500: "#64748b",
  slate400: "#94a3b8",
  slate200: "#e2e8f0",
  white: "#ffffff",
  /** Açık mavi yüzeyler (liste ikon kutuları vb.) */
  indigo50: "rgba(56, 95, 140, 0.10)",
  indigo100: "rgba(56, 95, 140, 0.22)",
  indigo200: "rgba(56, 95, 140, 0.45)",
  scoreTrack: "#e2e8f0",
  scoreFillStart: "rgba(56, 95, 140, 0.4)",
  scoreFillEnd: APP,
  trendyolOrange: "#f27a1a",
  trendyolBlack: "#0a0a0a",
  /** Ripple / dokunma — AppBar mavisi */
  rippleBlue: "rgba(56, 95, 140, 0.12)",
} as const;

export const fontTight = { letterSpacing: -0.35 } as const;

export const cardSurface = StyleSheet.create({
  wrap: {
    width: "100%",
    backgroundColor: AR.white,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(226, 232, 240, 0.9)",
    padding: 24,
    marginBottom: 12,
    ...Platform.select({
      ios: {
        shadowColor: "#0f172a",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 3,
      },
      android: { elevation: 2 },
    }),
  },
});
