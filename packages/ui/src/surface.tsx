import * as React from "react";

import { cn } from "./utils";

type PolymorphicProps = {
  as?: React.ElementType;
  className?: string;
  children?: React.ReactNode;
  [key: string]: unknown;
};

function createSurface(defaultClassName: string) {
  return React.forwardRef<HTMLElement, PolymorphicProps>(function Surface(
    { className, as: Comp = "div", ...props },
    ref,
  ) {
    const Component = Comp as React.ElementType;
    return <Component ref={ref} className={cn(defaultClassName, className as string | undefined)} {...props} />;
  });
}

export const SectionHeader = createSurface("flex flex-col items-start gap-5 lg:flex-row lg:items-end lg:justify-between");
export const SectionPanel = createSurface(
  "overflow-hidden rounded-container bg-white/80 shadow-[0_20px_60px_rgba(24,36,34,0.08)] backdrop-blur-sm",
);
export const SurfaceCard = createSurface("rounded-card bg-white shadow-[0_8px_26px_rgba(24,36,34,0.04)]");
export const SurfaceMuted = createSurface("rounded-media bg-shell/80");
export const SurfaceInset = createSurface("rounded-media bg-white");
export const SurfaceInsetMuted = createSurface("rounded-media bg-shell/80");
export const FormShell = createSurface(
  "rounded-card bg-shell/80 px-5 py-5 shadow-[0_12px_34px_rgba(24,36,34,0.05)] md:px-6",
);
