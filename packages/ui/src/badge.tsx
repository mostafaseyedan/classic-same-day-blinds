import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "./utils";

const badgeVariants = cva("inline-flex items-center", {
  variants: {
    variant: {
      soft: "rounded-full border border-black/10 bg-shell/80 px-2.5 py-1 text-[0.6rem] font-semibold uppercase tracking-[0.1em] text-slate backdrop-blur-sm",
      "soft-light":
        "rounded-full border border-white/10 bg-white/10 px-3 py-1 text-[0.66rem] font-semibold uppercase tracking-[0.14em] text-shell/70",
      "soft-olive":
        "rounded-full border border-olive/20 bg-olive/8 px-2.5 py-1 text-[0.6rem] font-semibold uppercase tracking-[0.1em] text-olive backdrop-blur-sm",
      "soft-brass":
        "rounded-full border border-brass/20 bg-brass/8 px-2.5 py-1 text-[0.6rem] font-semibold uppercase tracking-[0.1em] text-brass backdrop-blur-sm",
      "soft-slate":
        "rounded-full border border-black/10 bg-black/5 px-2.5 py-1 text-[0.6rem] font-semibold uppercase tracking-[0.1em] text-slate backdrop-blur-sm",
      discount:
        "rounded-full border border-brass/28 bg-brass/12 px-2.5 py-1 text-[0.62rem] font-semibold uppercase tracking-[0.12em] text-brass backdrop-blur-sm",
      pill: "rounded-full border border-black/10 bg-shell px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.12em] text-slate transition-colors hover:border-black/20 hover:bg-black/[0.02]",
      "pill-light":
        "rounded-full border border-black/10 bg-white px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.12em] text-slate transition-colors hover:border-black/20 hover:bg-black/[0.02]",
      "pill-active":
        "rounded-full border border-olive/30 bg-olive/10 px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.12em] text-olive",
    },
  },
  defaultVariants: {
    variant: "soft",
  },
});

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant, className }))} {...props} />;
}
