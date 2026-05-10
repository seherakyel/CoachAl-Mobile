import { Platform, StyleSheet } from "react-native";

export const AR = {
  bg: "#F8FAFC",
  indigo600: "#4f46e5",
  indigo500: "#6366f1",
  slate900: "#0f172a",
  slate700: "#334155",
  slate500: "#64748b",
  slate400: "#94a3b8",
  slate200: "#e2e8f0",
  white: "#ffffff",
  indigo50: "#eef2ff",
  indigo100: "#e0e7ff",
  indigo200: "#c7d2fe",
  scoreTrack: "#e2e8f0",
  scoreFillStart: "#c7d2fe",
  scoreFillEnd: "#4f46e5",
  trendyolOrange: "#f27a1a",
  trendyolBlack: "#0a0a0a",
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
