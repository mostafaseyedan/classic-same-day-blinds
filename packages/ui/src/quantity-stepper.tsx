import * as React from "react";

import { cn } from "./utils";

type QuantityStepperProps = {
  value: number;
  onChange: (nextValue: number) => void;
  min?: number;
  max?: number;
  disabled?: boolean;
  className?: string;
  valueClassName?: string;
  buttonClassName?: string;
};

function StepIcon({ direction }: { direction: "minus" | "plus" }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 16 16"
      className="h-3.5 w-3.5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3.5 8h9" />
      {direction === "plus" ? <path d="M8 3.5v9" /> : null}
    </svg>
  );
}

export function QuantityStepper({
  value,
  onChange,
  min = 1,
  max,
  disabled,
  className,
  valueClassName,
  buttonClassName,
}: QuantityStepperProps) {
  const [inputValue, setInputValue] = React.useState(String(value));
  const canDecrement = !disabled && value > min;
  const canIncrement = !disabled && (max === undefined || value < max);

  React.useEffect(() => {
    setInputValue(String(value));
  }, [value]);

  function clampValue(nextValue: number) {
    const minBounded = Math.max(min, nextValue);

    return max === undefined ? minBounded : Math.min(max, minBounded);
  }

  function commitInputValue(rawValue: string) {
    const parsed = Number.parseInt(rawValue, 10);

    if (!Number.isFinite(parsed)) {
      setInputValue(String(value));
      return;
    }

    const nextValue = clampValue(parsed);
    setInputValue(String(nextValue));
    onChange(nextValue);
  }

  return (
    <div
      className={cn(
        "inline-flex h-11 items-center rounded-full border border-black/10 bg-white px-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.35)] transition-[border-color,box-shadow] duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] focus-within:border-brass focus-within:shadow-[0_0_0_3px_rgba(176,125,66,0.14)]",
        disabled && "opacity-60",
        className,
      )}
    >
      <button
        type="button"
        onClick={() => canDecrement && onChange(clampValue(value - 1))}
        disabled={!canDecrement}
        aria-label="Decrease quantity"
        className={cn(
          "flex h-8 w-8 items-center justify-center rounded-full text-slate/72 transition-[background-color,color,transform] duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] hover:bg-shell hover:text-slate active:scale-[0.97] disabled:cursor-not-allowed disabled:text-slate/24 disabled:hover:bg-transparent",
          buttonClassName,
        )}
      >
        <StepIcon direction="minus" />
      </button>

      <input
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        value={inputValue}
        onChange={(event) => {
          const nextValue = event.target.value.replace(/\D/g, "");
          setInputValue(nextValue);

          if (nextValue.length > 0) {
            commitInputValue(nextValue);
          }
        }}
        onBlur={() => commitInputValue(inputValue)}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.currentTarget.blur();
          }
        }}
        disabled={disabled}
        aria-label="Quantity"
        className={cn(
          "h-8 w-[2.75rem] border-0 bg-transparent px-1.5 text-center text-[0.95rem] font-semibold leading-none text-slate outline-none disabled:cursor-not-allowed",
          valueClassName,
        )}
      />

      <button
        type="button"
        onClick={() => canIncrement && onChange(clampValue(value + 1))}
        disabled={!canIncrement}
        aria-label="Increase quantity"
        className={cn(
          "flex h-8 w-8 items-center justify-center rounded-full text-slate/72 transition-[background-color,color,transform] duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] hover:bg-shell hover:text-slate active:scale-[0.97] disabled:cursor-not-allowed disabled:text-slate/24 disabled:hover:bg-transparent",
          buttonClassName,
        )}
      >
        <StepIcon direction="plus" />
      </button>
    </div>
  );
}
