export type RiskUi = {
  label: string;
  background: string;
  text: string;
  accent: string;
};

const DEFAULT_RISK: RiskUi = {
  label: "—",
  background: "#f1f5f9",
  text: "#0f172a",
  accent: "#64748b",
};

export function mapRiskLevel(level: string | null | undefined): RiskUi {
  const v = (level ?? "").toUpperCase();
  if (v.includes("DÜŞÜK") || v.includes("DUSUK")) {
    return {
      label: "DÜŞÜK",
      background: "#ecfdf5",
      text: "#064e3b",
      accent: "#10b981",
    };
  }
  if (v.includes("ORTA")) {
    return {
      label: "ORTA",
      background: "#fffbeb",
      text: "#78350f",
      accent: "#f59e0b",
    };
  }
  if (v.includes("YÜKSEK") || v.includes("YUKSEK")) {
    return {
      label: "YÜKSEK",
      background: "#fef2f2",
      text: "#7f1d1d",
      accent: "#ef4444",
    };
  }
  return {
    label: level?.trim() || DEFAULT_RISK.label,
    background: DEFAULT_RISK.background,
    text: DEFAULT_RISK.text,
    accent: "#6366f1",
  };
}
