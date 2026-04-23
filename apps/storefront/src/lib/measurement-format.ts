export function roundToNearestEighth(value: number) {
  return Math.round(value * 8) / 8;
}

export function splitMeasurement(value: number) {
  const totalEighths = Math.round(value * 8);

  return {
    whole: Math.floor(totalEighths / 8),
    eighth: totalEighths % 8,
  };
}

export function combineMeasurementParts(whole: number, eighth: number) {
  return whole + eighth / 8;
}

export function formatMeasurementValue(value: number, options?: { includeUnit?: boolean }) {
  const includeUnit = options?.includeUnit ?? true;
  const { whole, eighth } = splitMeasurement(roundToNearestEighth(value));
  const label = eighth === 0 ? `${whole}` : `${whole} ${eighth}/8`;

  return includeUnit ? `${label}"` : label;
}
