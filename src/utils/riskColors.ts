import { coachMix, CoachColors } from "../theme/coachTheme";

export type RiskUi = {
  label: string;
  background: string;
  text: string;
  accent: string;
};

const DEFAULT_RISK: RiskUi = {
  label: "—",
  background: CoachColors.surfaceContainerLow,
  text: CoachColors.onSurface,
  accent: CoachColors.outline,
};

export function mapRiskLevel(level: string | null | undefined): RiskUi {
  const v = (level ?? "").toUpperCase();
  if (v.includes("DÜŞÜK") || v.includes("DUSUK")) {
    return {
      label: "DÜŞÜK",
      background: coachMix(0.07),
      text: CoachColors.onSurface,
      accent: CoachColors.primary,
    };
  }
  if (v.includes("ORTA")) {
    return {
      label: "ORTA",
      background: CoachColors.accentMuted,
      text: CoachColors.onSurface,
      accent: CoachColors.accent,
    };
  }
  if (v.includes("YÜKSEK") || v.includes("YUKSEK")) {
    return {
      label: "YÜKSEK",
      background: coachMix(0.2),
      text: CoachColors.onSurface,
      accent: CoachColors.primary,
    };
  }
  return {
    label: level?.trim() || DEFAULT_RISK.label,
    background: DEFAULT_RISK.background,
    text: DEFAULT_RISK.text,
    accent: coachMix(0.38),
  };
}
