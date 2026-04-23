"use client";

import { useEffect, useMemo, useState } from "react";
import { Select } from "@blinds/ui";

import { combineMeasurementParts, roundToNearestEighth, splitMeasurement } from "@/lib/measurement-format";

export type DimensionState = {
  widthDecimal: number;
  heightDecimal: number;
};

function clampMeasurement(value: number, minDecimal: number, maxDecimal: number) {
  const roundedMin = roundToNearestEighth(minDecimal);
  const roundedMax = roundToNearestEighth(maxDecimal);
  return Math.min(Math.max(roundToNearestEighth(value), roundedMin), roundedMax);
}

function buildWholeOptions(minDecimal: number, maxDecimal: number) {
  const minParts = splitMeasurement(roundToNearestEighth(minDecimal));
  const maxParts = splitMeasurement(roundToNearestEighth(maxDecimal));
  const values: number[] = [];

  for (let current = minParts.whole; current <= maxParts.whole; current += 1) {
    values.push(current);
  }

  return values;
}

function buildEighthOptionsForWhole(whole: number, minDecimal: number, maxDecimal: number) {
  const minParts = splitMeasurement(roundToNearestEighth(minDecimal));
  const maxParts = splitMeasurement(roundToNearestEighth(maxDecimal));
  const minEighth = whole === minParts.whole ? minParts.eighth : 0;
  const maxEighth = whole === maxParts.whole ? maxParts.eighth : 7;
  const values: number[] = [];

  for (let current = minEighth; current <= maxEighth; current += 1) {
    values.push(current);
  }

  return values;
}

function MeasurementSelect({
  label,
  value,
  minDecimal,
  maxDecimal,
  onChange,
}: {
  label: string;
  value: number;
  minDecimal: number;
  maxDecimal: number;
  onChange: (value: number) => void;
}) {
  const wholeOptions = useMemo(
    () => buildWholeOptions(minDecimal, maxDecimal),
    [maxDecimal, minDecimal],
  );

  const clampedValue = clampMeasurement(value, minDecimal, maxDecimal);
  const { whole, eighth } = splitMeasurement(clampedValue);
  const selectedWhole = wholeOptions.includes(whole) ? whole : (wholeOptions[0] ?? 0);
  const eighthOptions = useMemo(
    () => buildEighthOptionsForWhole(selectedWhole, minDecimal, maxDecimal),
    [maxDecimal, minDecimal, selectedWhole],
  );
  const selectedEighth = eighthOptions.includes(eighth) ? eighth : (eighthOptions[0] ?? 0);

  useEffect(() => {
    const nextValue = combineMeasurementParts(selectedWhole, selectedEighth);
    if (nextValue !== value) {
      onChange(nextValue);
    }
  }, [onChange, selectedEighth, selectedWhole, value]);

  return (
    <div className="grid gap-2.5 sm:grid-cols-[6rem_auto] sm:items-center">
      <p className="text-[0.8rem] font-semibold tracking-[0.01em] text-slate">{label}</p>
      <div className="grid min-w-0 max-w-[13rem] grid-cols-2 gap-2">
        <Select
          size="compact"
          aria-label={`${label} inches`}
          value={selectedWhole}
          onChange={(event) => {
            const nextWhole = Number(event.target.value);
            const nextEighthOptions = buildEighthOptionsForWhole(nextWhole, minDecimal, maxDecimal);
            const nextEighth = nextEighthOptions.includes(selectedEighth)
              ? selectedEighth
              : (nextEighthOptions[0] ?? 0);

            onChange(combineMeasurementParts(nextWhole, nextEighth));
          }}
          className="w-full border-black/12 shadow-none"
        >
          {wholeOptions.map((optionValue) => (
            <option key={optionValue} value={optionValue}>
              {optionValue}
            </option>
          ))}
        </Select>

        <Select
          size="compact"
          aria-label={`${label} eighths`}
          value={selectedEighth}
          onChange={(event) => {
            onChange(combineMeasurementParts(selectedWhole, Number(event.target.value)));
          }}
          className="w-full border-black/12 shadow-none"
        >
          {eighthOptions.map((optionValue) => (
            <option key={optionValue} value={optionValue}>
              {optionValue === 0 ? "0" : `${optionValue}/8`}
            </option>
          ))}
        </Select>
      </div>
    </div>
  );
}

export type DimensionSelectorProps = {
  widthDecimal: number;
  heightDecimal: number;
  minWidthDecimal: number;
  maxWidthDecimal: number;
  minHeightDecimal: number;
  maxHeightDecimal: number;
  onChange: (next: DimensionState) => void;
};

export function DimensionSelector(props: Partial<DimensionSelectorProps>) {
  const minWidthDecimal = props.minWidthDecimal ?? 24;
  const maxWidthDecimal = props.maxWidthDecimal ?? 24;
  const minHeightDecimal = props.minHeightDecimal ?? 48;
  const maxHeightDecimal = props.maxHeightDecimal ?? 48;
  const defaultWidth = minWidthDecimal;
  const defaultHeight = minHeightDecimal;

  const [internalState, setInternalState] = useState<DimensionState>({
    widthDecimal: defaultWidth,
    heightDecimal: defaultHeight,
  });

  const widthDecimal = props.widthDecimal ?? internalState.widthDecimal;
  const heightDecimal = props.heightDecimal ?? internalState.heightDecimal;

  function update(patch: Partial<DimensionState>) {
    const nextState = {
      widthDecimal: patch.widthDecimal ?? widthDecimal,
      heightDecimal: patch.heightDecimal ?? heightDecimal,
    };

    setInternalState(nextState);
    props.onChange?.(nextState);
  }

  return (
    <section>
      <div className="grid gap-2.5">
        <MeasurementSelect
          label="Width"
          value={widthDecimal}
          minDecimal={minWidthDecimal}
          maxDecimal={maxWidthDecimal}
          onChange={(nextValue) => update({ widthDecimal: nextValue })}
        />
        <MeasurementSelect
          label="Height / Drop"
          value={heightDecimal}
          minDecimal={minHeightDecimal}
          maxDecimal={maxHeightDecimal}
          onChange={(nextValue) => update({ heightDecimal: nextValue })}
        />
      </div>
    </section>
  );
}
