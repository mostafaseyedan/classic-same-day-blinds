"use client";

import { useInView } from "@/hooks/use-in-view";
import type { ReactNode } from "react";

export function AnimateOnScroll({
  children,
  as: Tag = "div",
  className = "",
  threshold,
  rootMargin,
  once = true,
}: {
  children: ReactNode;
  as?: "div" | "section";
  className?: string;
  threshold?: number;
  rootMargin?: string;
  once?: boolean;
}) {
  const ref = useInView<HTMLElement>({ threshold, rootMargin, once });

  return (
    <Tag
      ref={ref as React.RefObject<HTMLDivElement> & React.RefObject<HTMLElement>}
      data-animate
      className={className}
    >
      {children}
    </Tag>
  );
}
