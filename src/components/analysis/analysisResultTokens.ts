import { Platform, StyleSheet } from "react-native";
import { WebTokens } from "../../theme/webTokens";

const APP = WebTokens.primary;
const SOFT = WebTokens.primaryContainer;

export const AR = {
  bg: WebTokens.background,
  indigo600: APP,
  indigo500: SOFT,
  slate900: WebTokens.onSurface,
  slate700: WebTokens.onSurfaceVariant,
  slate500: WebTokens.onSurfaceVariant,
  slate400: WebTokens.outline,
  slate200: WebTokens.outlineVariant,
  white: WebTokens.surfaceContainerLowest,
  indigo50: "rgba(53, 37, 205, 0.10)",
  indigo100: "rgba(53, 37, 205, 0.18)",
  indigo200: "rgba(79, 70, 229, 0.35)",
  scoreTrack: WebTokens.surfaceVariant,
  scoreFillStart: "rgba(79, 70, 229, 0.4)",
  scoreFillEnd: APP,
  trendyolOrange: "#f27a1a",
  trendyolBlack: "#0a0a0a",
  rippleBlue: "rgba(53, 37, 205, 0.12)",
} as const;

export const fontTight = { letterSpacing: -0.35 } as const;

export const cardSurface = StyleSheet.create({
  wrap: {
    width: "100%",
    backgroundColor: AR.white,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: WebTokens.outlineVariant,
    padding: 24,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.04,
        shadowRadius: 24,
      },
      android: { elevation: 2 },
    }),
  },
});
