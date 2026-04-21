"use client";

import * as React from "react";
import { X } from "@phosphor-icons/react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "./utils";

const closeButtonVariants = cva(
  "relative flex items-center justify-center rounded-full transition-[background-color,color,border-color,box-shadow] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brass/60 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        ghost: "text-slate/60 hover:bg-black/5 hover:text-slate",
        neutral: "border border-black/10 bg-white text-slate/60 shadow-[0_1px_2px_rgba(24,36,34,0.04)] hover:border-black/15 hover:bg-shell/50 hover:text-slate hover:shadow-[0_4px_12px_rgba(24,36,34,0.06)]",
        destructive: "text-slate/60 hover:bg-red-50 hover:text-red-600",
        light: "text-white/60 hover:bg-white/10 hover:text-white",
      },
      size: {
        sm: "h-7 w-7",
        md: "h-9 w-9",
        lg: "h-11 w-11",
      },
    },
    defaultVariants: {
      variant: "neutral",
      size: "md",
    },
  }
);

export interface CloseButtonProps
  extends Omit<
      React.ButtonHTMLAttributes<HTMLButtonElement>,
      "onDrag" | "onDragStart" | "onDragEnd" | "onAnimationStart"
    >,
    VariantProps<typeof closeButtonVariants> {
  magnetic?: boolean;
}

export const CloseButton = React.forwardRef<HTMLButtonElement, CloseButtonProps>(
  ({ className, variant, size, magnetic = false, onClick, children, "aria-label": ariaLabel = "Close", ...props }, ref) => {
    const x = useMotionValue(0);
    const y = useMotionValue(0);

    const springConfig = { damping: 15, stiffness: 180 };
    const springX = useSpring(x, springConfig);
    const springY = useSpring(y, springConfig);

    const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (!magnetic) return;
      const rect = e.currentTarget.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const distanceX = e.clientX - centerX;
      const distanceY = e.clientY - centerY;

      // Max pull of 8px
      x.set(distanceX * 0.35);
      y.set(distanceY * 0.35);
    };

    const handleMouseLeave = () => {
      x.set(0);
      y.set(0);
    };

    return (
      <motion.button
        ref={ref}
        style={{ x: springX, y: springY }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onClick={onClick}
        className={cn(closeButtonVariants({ variant, size, className }))}
        aria-label={ariaLabel}
        type="button"
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.94 }}
        {...props}
      >
        {children || (
          <X
            className={cn(
              "shrink-0",
              size === "sm" ? "h-3.5 w-3.5" : size === "lg" ? "h-5 w-5" : "h-4 w-4"
            )}
            weight="bold"
          />
        )}
      </motion.button>
    );
  }
);
CloseButton.displayName = "CloseButton";
