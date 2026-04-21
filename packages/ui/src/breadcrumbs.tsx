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

  const navTone = tone === "light" ? "text-shell/58" : "text-slate/42";
  const linkTone =
    tone === "light"
      ? "font-semibold text-shell/74 transition hover:text-white"
      : "font-semibold text-slate/55 transition hover:text-slate";
  const currentTone = tone === "light" ? "text-white/86" : "text-slate/68";
  const separatorTone = tone === "light" ? "text-shell/34" : "text-slate/30";

  return (
    <nav
      aria-label="Breadcrumb"
      className={cn(
        "mb-5 flex flex-wrap items-center gap-2 text-[0.68rem] uppercase tracking-[0.1em]",
        navTone,
        className,
      )}
    >
      {items.map((item, index) => {
        const isLast = index === items.length - 1;

        return (
          <span key={`${item.label}-${index}`} className="flex items-center gap-2">
            {index > 0 ? <span className={separatorTone}>/</span> : null}
            {item.href && !isLast ? (
              <Link href={item.href} className={linkTone}>
                {item.label}
              </Link>
            ) : (
              <span aria-current={isLast ? "page" : undefined} className={isLast ? currentTone : ""}>
                {item.label}
              </span>
            )}
          </span>
        );
      })}
    </nav>
  );
}
