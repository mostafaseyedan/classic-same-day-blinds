import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "./utils";

const textareaVariants = cva(
  "min-h-[120px] w-full resize-none rounded-xl border border-black/10 px-4 py-3 text-[0.92rem] text-slate outline-none transition-colors placeholder:text-slate/40 focus:border-brass focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-white",
        muted: "bg-transparent",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement>,
    VariantProps<typeof textareaVariants> {
  error?: string;
  ref?: React.Ref<HTMLTextAreaElement>;
}

export function Textarea({ className, variant, error, ref, ...props }: TextareaProps) {
  return (
    <div className="relative w-full">
      <textarea
        className={cn(
          textareaVariants({ variant }),
          error && "border-red-500 focus:border-red-500 focus-visible:ring-red-500/40",
          className,
        )}
        ref={ref}
        aria-invalid={!!error}
        aria-describedby={error ? `${String(props.id ?? "")}-error` : undefined}
        {...props}
      />
      {error ? (
        <p id={`${String(props.id ?? "")}-error`} className="mt-1 text-sm text-red-500" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
