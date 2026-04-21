import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "./utils";

const labelVariants = cva("", {
  variants: {
    variant: {
      default: "text-sm font-semibold text-slate",
      utility: "text-[0.68rem] font-semibold uppercase tracking-[0.12em] text-slate/60",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

export interface LabelProps
  extends React.LabelHTMLAttributes<HTMLLabelElement>,
    VariantProps<typeof labelVariants> {
  as?: React.ElementType;
}

const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
  ({ className, variant, as: Comp = "label", ...props }, ref) => (
    <Comp className={cn(labelVariants({ variant, className }))} ref={ref as never} {...props} />
  ),
);

Label.displayName = "Label";

export { Label };
