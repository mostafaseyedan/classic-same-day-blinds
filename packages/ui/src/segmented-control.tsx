"use client";

import * as React from "react";

import { cn } from "./utils";

type SegmentedItem = {
  label: string;
  value: string;
};

interface SegmentedControlProps {
  items: SegmentedItem[];
  value: string;
  onValueChange: (value: string) => void;
  className?: string;
}

export function SegmentedControl({
  items,
  value,
  onValueChange,
  className,
}: SegmentedControlProps) {
  return (
    <div
      className={cn(
        "mx-auto inline-grid min-w-[16.5rem] grid-cols-2 gap-1 rounded-full bg-white p-1",
        className,
      )}
      role="tablist"
      aria-orientation="horizontal"
    >
      {items.map((item) => {
        const active = item.value === value;

        return (
          <button
            key={item.value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onValueChange(item.value)}
            className={cn(
              "inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-semibold transition",
              active ? "bg-slate text-shell" : "text-slate/70",
            )}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
}
