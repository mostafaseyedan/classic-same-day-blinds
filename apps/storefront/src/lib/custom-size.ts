import { formatMeasurementValue } from "@/lib/measurement-format";

export function getCustomSizeLabel(metadata?: Record<string, unknown> | null) {
  if (typeof metadata?.custom_size === "string" && metadata.custom_size.trim()) {
    return metadata.custom_size.trim();
  }

  const width =
    typeof metadata?.width === "string"
      ? metadata.width
      : typeof metadata?.width_decimal === "number"
        ? formatMeasurementValue(metadata.width_decimal)
        : null;
  const height =
    typeof metadata?.height === "string"
      ? metadata.height
      : typeof metadata?.height_decimal === "number"
        ? formatMeasurementValue(metadata.height_decimal)
        : null;

  if (!width || !height) {
    return null;
  }

  return `${width} × ${height}`;
}

export function getCustomSizeDetail(metadata?: Record<string, unknown> | null) {
  const sizeLabel = getCustomSizeLabel(metadata);

  if (!sizeLabel) {
    return null;
  }

  return typeof metadata?.size_sqft === "number"
    ? `${sizeLabel} — ${metadata.size_sqft} sq ft`
    : sizeLabel;
}
