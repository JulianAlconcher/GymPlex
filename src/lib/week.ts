export function getSuggestedWeek(startDateIso: string, weeksCount: number): number {
  const today = new Date();
  const startDate = new Date(`${startDateIso}T00:00:00`);

  if (Number.isNaN(startDate.getTime())) {
    return 1;
  }

  const diffMs = today.getTime() - startDate.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const rawWeek = Math.floor(diffDays / 7) + 1;

  if (rawWeek < 1) return 1;
  if (rawWeek > weeksCount) return weeksCount;
  return rawWeek;
}
