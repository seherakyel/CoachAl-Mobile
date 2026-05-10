import type { SkillUiItem } from "../services/api";

/** Web `analysis-result.js` ile aynı mantık: eksik yetenek satırından tahmini puan kazancı. */
export function gapLiftPointsForMissing(row: SkillUiItem, indexInTop3: number): number {
  const w = row.weight;
  if (w != null) {
    const v = Number(w);
    if (!Number.isNaN(v) && v >= 0) {
      if (v > 1) return Math.min(25, Math.round(v));
      if (v > 0) return Math.min(15, Math.max(1, Math.round(v * 12)));
    }
  }
  const im = row.impact;
  if (im != null) {
    const n = Number(im);
    if (!Number.isNaN(n) && n >= 0) return Math.min(25, Math.round(n));
  }
  const tier = [7, 6, 5];
  return tier[indexInTop3] ?? 4;
}

export function computePotentialMatchScore(
  currentScore: number,
  missingRows: SkillUiItem[],
): { potential: number; gain: number } {
  const rows = Array.isArray(missingRows) ? missingRows : [];
  const top = rows.slice(0, 3);
  if (!top.length) {
    return { potential: currentScore, gain: 0 };
  }
  let gain = 0;
  for (let i = 0; i < top.length; i++) {
    gain += gapLiftPointsForMissing(top[i], i);
  }
  const room = Math.max(0, 100 - currentScore);
  gain = Math.min(gain, room);
  let potential = Math.min(100, Math.round(currentScore + gain));
  if (top.length && potential <= currentScore) {
    potential = Math.min(100, currentScore + Math.min(1, room));
  }
  return { potential, gain: potential - currentScore };
}
