export function roundToStep(value: number, step = 2.5): number {
  return Math.round(value / step) * step;
}

export function calculatePercentageLoad(rm: number, percentage: number): number {
  const raw = (rm * percentage) / 100;
  return roundToStep(raw);
}

export function formatKg(value: number): string {
  return `${Number.isInteger(value) ? value : value.toFixed(1)} kg`;
}
