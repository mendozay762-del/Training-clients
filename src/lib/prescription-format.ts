// Shared formatting for prescribed targets, used by the program overview and
// the live-logging suggestions. Returns null when there's nothing to show.

export function formatRepsRange(
  low: number | null,
  high: number | null,
  text: string | null,
): string | null {
  if (text) return text;
  if (low !== null && high !== null && low !== high) return `${low}–${high}`;
  if (low !== null) return String(low);
  return null;
}

export function formatRirRange(
  low: number | null,
  high: number | null,
): string | null {
  if (low === null || high === null) return null;
  if (low === high) return String(low);
  return `${low}–${high}`;
}
