import * as React from "react";

import { cn } from "./utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  ref?: React.Ref<HTMLInputElement>;
}

export function Input({ className, type, error, ref, ...props }: InputProps) {
  return (
    <div className="relative w-full">
      <input
        type={type}
        className={cn(
          "h-11 w-full rounded-full border border-black/10 bg-white px-4 text-[0.92rem] text-slate outline-none transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate/40 focus:border-brass focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
          error && "border-red-500 focus:border-red-500 focus-visible:ring-red-500/40",
          className,
        )}
        ref={ref}
        aria-invalid={!!error}
        aria-describedby={error ? `${props.id}-error` : undefined}
        {...props}
      />
      {error ? (
        <p id={`${props.id}-error`} className="mt-1 text-sm text-red-500" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
