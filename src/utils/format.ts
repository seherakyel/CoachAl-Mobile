export function formatScore(value: number | null | undefined): string {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return "—";
  return `${Math.round(Number(value))}%`;
}

export function formatDash(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return "—";
  const s = String(value).trim();
  return s.length ? s : "—";
}
