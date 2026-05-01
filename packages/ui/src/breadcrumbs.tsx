import Link from "next/link";

import { cn } from "./utils";

export type BreadcrumbItem = {
  label: string;
  href?: string;
};

export type BreadcrumbsProps = {
  items: BreadcrumbItem[];
  className?: string;
  tone?: "default" | "light";
};

export function Breadcrumbs({
  items,
  className,
  tone = "default",
}: BreadcrumbsProps) {
  if (items.length === 0) {
    return null;
  }

  const isLight = tone === "light";
  
  // Design tokens based on home page eyebrows
  const navColor = isLight ? "text-shell/80" : "text-olive";
  const accentColor = isLight ? "bg-shell/60" : "bg-olive";
  const separatorColor = isLight ? "text-shell/30" : "text-olive/30";
  const linkHoverColor = isLight ? "hover:text-white" : "hover:text-olive";
  const currentTextColor = isLight ? "text-white" : "text-olive";

  return (
    <nav
      aria-label="Breadcrumb"
      className={cn(
        "group mb-5 flex flex-wrap items-center gap-4 text-[0.68rem] font-bold uppercase tracking-[0.35em]",
        navColor,
        className,
      )}
    >
      {/* Eyebrow expanding line */}
      <span
        className={cn(
          "block h-px w-10 transition-all duration-300 group-hover:w-16",
          accentColor
        )}
      />

      <div className="flex flex-wrap items-center gap-2">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <span key={`${item.label}-${index}`} className="flex items-center gap-2">
              {index > 0 ? (
                <span className={cn("font-medium tracking-normal", separatorColor)}>
                  /
                </span>
              ) : null}
              {item.href && !isLast ? (
                <Link
                  href={item.href}
                  className={cn(
                    "transition-colors duration-200",
                    linkHoverColor
                  )}
                >
                  {item.label}
                </Link>
              ) : (
                <span
                  aria-current={isLast ? "page" : undefined}
                  className={isLast ? currentTextColor : ""}
                >
                  {item.label}
                </span>
              )}
            </span>
          );
        })}
      </div>
    </nav>
  );
}
