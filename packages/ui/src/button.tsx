import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "./utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-[color,background-color,border-color,box-shadow,transform] duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] active:scale-[0.985] disabled:pointer-events-none disabled:opacity-50 disabled:translate-y-0 disabled:active:scale-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brass/60 focus-visible:ring-offset-2",
  {
    variants: {
      variant: {
        default: "bg-slate text-white shadow-[0_1px_2px_rgba(24,36,34,0.08)] hover:bg-olive hover:text-white hover:shadow-[0_4px_12px_rgba(24,36,34,0.1)]",
        secondary: "border border-black/10 bg-white text-slate shadow-[0_1px_2px_rgba(24,36,34,0.05)] hover:border-brass hover:text-brass hover:shadow-[0_3px_10px_rgba(24,36,34,0.06)]",
        soft: "border border-black/10 bg-shell text-slate shadow-[0_1px_2px_rgba(24,36,34,0.04)] hover:border-brass hover:text-brass hover:shadow-[0_3px_10px_rgba(24,36,34,0.05)]",
        olive: "bg-olive text-white shadow-[0_1px_2px_rgba(24,36,34,0.08)] hover:bg-pine hover:text-white hover:shadow-[0_4px_12px_rgba(24,36,34,0.1)]",
        "secondary-light": "border border-white/25 bg-white/8 text-white shadow-[0_1px_2px_rgba(0,0,0,0.06)] backdrop-blur-md hover:border-brass hover:text-brass hover:shadow-[0_3px_10px_rgba(0,0,0,0.08)]",
        accent: "bg-brass text-white shadow-[0_1px_2px_rgba(24,36,34,0.08)] hover:bg-olive hover:text-white hover:shadow-[0_10px_30px_-4px_rgba(24,36,34,0.16)]",
        chip: "border border-black/10 bg-white text-slate/75 shadow-[0_1px_2px_rgba(24,36,34,0.03)] hover:border-black/16 hover:bg-shell/55 hover:text-slate hover:shadow-[0_2px_8px_rgba(24,36,34,0.05)]",
        "chip-active": "border border-slate bg-slate text-white shadow-[0_1px_2px_rgba(24,36,34,0.08)] hover:border-olive hover:bg-olive hover:text-white hover:shadow-[0_3px_10px_rgba(24,36,34,0.1)]",
        icon: "border border-black/10 bg-white text-slate/60 shadow-[0_1px_2px_rgba(24,36,34,0.04)] hover:border-black/12 hover:bg-shell/42 hover:text-slate hover:shadow-[0_3px_10px_rgba(24,36,34,0.06)]",
        "icon-light": "border border-white/20 bg-black/20 text-white backdrop-blur-md hover:bg-black/40 hover:text-white",
        ghost: "text-slate hover:bg-transparent hover:text-olive",
        "ghost-light": "text-white/88 hover:bg-transparent hover:text-white",
        link: "text-slate underline-offset-4 hover:underline",
      },
      size: {
        default: "px-5 py-3 text-sm",
        compact: "px-4 py-2 text-[0.72rem]",
        icon: "h-9 w-9 p-0 text-sm",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
  VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export function Button({
  className,
  variant,
  size,
  asChild = false,
  ref,
  ...props
}: ButtonProps & { ref?: React.Ref<HTMLButtonElement> }) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      className={cn(buttonVariants({ variant, size, className }))}
      ref={ref}
      {...props}
    />
  );
}
