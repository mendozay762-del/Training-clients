export function epley1RM(weightLbs: number, reps: number): number {
  if (!Number.isFinite(weightLbs) || !Number.isFinite(reps)) return 0;
  if (weightLbs <= 0 || reps <= 0) return 0;
  return weightLbs * (1 + reps / 30);
}
