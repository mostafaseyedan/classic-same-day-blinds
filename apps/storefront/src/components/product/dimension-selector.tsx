"use client";

import { useState } from "react";
import { Select } from "@blinds/ui";

export type DimensionState = {
  widthDecimal: number;
  heightDecimal: number;
};

function formatDimensionValue(value: number): string {
  return Number.isInteger(value) ? String(value) : String(value);
}

function MeasurementSelect({
  label,
  value,
  availableValues,
  onChange,
}: {
  label: string;
  value: number;
  availableValues: number[];
  onChange: (value: number) => void;
}) {
  return (
    <div className="grid gap-2.5 sm:grid-cols-[5.2rem_minmax(0,1fr)] sm:items-center">
      <p className="text-[0.8rem] font-semibold tracking-[0.01em] text-slate">{label}</p>
      <Select
        size="compact"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="border-black/12 bg-white text-[0.95rem] font-medium leading-none tracking-normal shadow-none hover:border-black/16 focus-visible:ring-brass/45"
      >
        {availableValues.map((optionValue) => (
          <option key={optionValue} value={optionValue}>
            {formatDimensionValue(optionValue)}
          </option>
        ))}
      </Select>
    </div>
  );
}

export type DimensionSelectorProps = {
  widthDecimal: number;
  heightDecimal: number;
  availableWidths?: number[];
  availableHeights?: number[];
  onChange: (next: DimensionState) => void;
};

export function DimensionSelector(props: Partial<DimensionSelectorProps>) {
  const availableWidths = props.availableWidths?.length ? props.availableWidths : [24];
  const availableHeights = props.availableHeights?.length ? props.availableHeights : [48];
  const defaultWidth = availableWidths[0] ?? 24;
  const defaultHeight = availableHeights[0] ?? 48;

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
          availableValues={availableWidths}
          onChange={(value) => update({ widthDecimal: value })}
        />
        <MeasurementSelect
          label="Height / Drop"
          value={heightDecimal}
          availableValues={availableHeights}
          onChange={(value) => update({ heightDecimal: value })}
        />
      </div>
    </section>
  );
}
