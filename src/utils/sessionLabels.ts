import type { AlignmentListItem } from "../services/api";
import { WebTokens } from "../theme/webTokens";

export function formatSessionDate(iso?: string | null): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString("tr-TR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return String(iso).substring(0, 16);
  }
}

export function alignmentOptionLabel(a: AlignmentListItem): string {
  const cv = a.cv_name || "CV";
  const company = a.company_name || "Şirket";
  const role = a.position || a.target_position || "Pozisyon";
  const score = a.score != null ? ` · %${Math.round(Number(a.score))}` : "";
  return `${cv} → ${company} · ${role}${score}`;
}

export function alignmentIdOf(a: AlignmentListItem): string {
  return a.alignment_id || a.id;
}

export function scoreTextColor(score: number | null | undefined): string {
  if (score == null) return WebTokens.onSurfaceVariant;
  const n = Number(score);
  if (n >= 80) return WebTokens.scoreEmerald;
  if (n >= 60) return WebTokens.scoreAmber;
  return WebTokens.scoreRed;
}

export function sessionModeIcon(mode?: string): string {
  return mode === "quiz" ? "help-circle-outline" : "text-box-outline";
}
