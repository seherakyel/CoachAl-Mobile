import { Platform, TextStyle } from "react-native";

/** Inter when linked; falls back to system sans on device. */
export const CoachFontFamily = Platform.select({
  ios: "System",
  android: "sans-serif",
  default: "System",
});

export const CoachTypography = {
  h1: {
    fontFamily: CoachFontFamily,
    fontSize: 32,
    lineHeight: 38,
    fontWeight: "700" as TextStyle["fontWeight"],
    letterSpacing: -0.8,
  },
  h2: {
    fontFamily: CoachFontFamily,
    fontSize: 26,
    lineHeight: 34,
    fontWeight: "600" as TextStyle["fontWeight"],
    letterSpacing: -0.3,
  },
  h3: {
    fontFamily: CoachFontFamily,
    fontSize: 22,
    lineHeight: 30,
    fontWeight: "600" as TextStyle["fontWeight"],
  },
  bodyLg: {
    fontFamily: CoachFontFamily,
    fontSize: 18,
    lineHeight: 29,
    fontWeight: "400" as TextStyle["fontWeight"],
  },
  bodyMd: {
    fontFamily: CoachFontFamily,
    fontSize: 16,
    lineHeight: 24,
    fontWeight: "400" as TextStyle["fontWeight"],
  },
  labelSm: {
    fontFamily: CoachFontFamily,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "500" as TextStyle["fontWeight"],
  },
  caption: {
    fontFamily: CoachFontFamily,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "400" as TextStyle["fontWeight"],
  },
} as const;
