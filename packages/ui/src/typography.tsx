import * as React from "react";

import { cn } from "./utils";

type TextProps = React.HTMLAttributes<HTMLElement> & { as?: React.ElementType };

function createText(defaultClassName: string, defaultTag: React.ElementType) {
  return React.forwardRef<HTMLElement, TextProps>(function Text(
    { className, as: Comp = defaultTag, ...props },
    ref,
  ) {
    return <Comp ref={ref} className={cn(defaultClassName, className)} {...props} />;
  });
}

export const Eyebrow = createText("text-xs font-semibold uppercase tracking-[0.14em] text-olive", "p");
export const EyebrowAccent = createText("text-xs font-semibold uppercase tracking-[0.14em] text-brass", "p");
export const SectionTitle = createText(
  "mt-4 font-display text-3xl font-semibold tracking-tight text-slate md:text-4xl",
  "h2",
);
export const SectionCopy = createText(
  "mt-4 max-w-2xl text-sm leading-6 text-slate/70 sm:text-base sm:leading-7",
  "p",
);
export const PageTitle = createText(
  "mt-4 font-display text-3xl font-semibold leading-[1.1] tracking-tight text-slate md:text-4xl",
  "h1",
);
export const PageTitleLight = createText(
  "mt-4 font-display text-3xl font-semibold leading-[1.1] tracking-tight text-white md:text-4xl",
  "h1",
);
export const PageCopy = createText("mt-4 max-w-xl text-sm leading-6 text-slate/70 sm:text-base sm:leading-7", "p");
export const PageCopyLight = createText(
  "mt-4 max-w-xl text-sm leading-6 text-white/74 sm:text-base sm:leading-7",
  "p",
);
