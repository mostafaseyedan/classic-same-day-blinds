import Link from "next/link";

import { Button, EyebrowAccent, SurfaceMuted, cn } from "@blinds/ui";

import { megaMenus, type MegaMenuKey } from "./navigation";

type MegaMenuProps = {
  activeMenu: MegaMenuKey;
  glass: boolean;
  surfaceClassName: string;
  featuredClassName: string;
  linkHoverClassName: string;
  onMouseEnter: () => void;
  onClose: () => void;
};

export function MegaMenu({
  activeMenu,
  glass,
  surfaceClassName,
  featuredClassName,
  linkHoverClassName,
  onMouseEnter,
  onClose,
}: MegaMenuProps) {
  const menu = megaMenus[activeMenu];

  return (
    <div
      id={`mega-menu-${activeMenu}`}
      className={cn(
        "w-full px-6 py-8 md:px-10",
        glass ? "relative" : "absolute left-0 right-0 top-full z-40",
        surfaceClassName,
      )}
      onMouseEnter={onMouseEnter}
    >
      <div className="grid gap-8 xl:grid-cols-[0.95fr_2.05fr]">
        <SurfaceMuted className={cn("flex flex-col justify-between p-6", featuredClassName)}>
          <div>
            <EyebrowAccent>{menu.featured.eyebrow}</EyebrowAccent>
            <h3 className={cn("mt-3 font-display text-2xl font-semibold leading-tight", glass ? "text-white" : "text-slate")}>
              {menu.featured.title}
            </h3>
            <p className={cn("mt-3 text-sm leading-6", glass ? "text-white/72" : "text-slate/68")}>
              {menu.featured.copy}
            </p>
          </div>
          <Button asChild variant="default">
            <Link href={menu.featured.href} className="mt-6 w-fit" onClick={onClose}>
              {menu.featured.cta}
            </Link>
          </Button>
        </SurfaceMuted>

        <div className="grid gap-8 md:grid-cols-3">
          {menu.sections.map((section) => (
            <div key={section.heading}>
              <h4 className="mb-3 text-[10px] font-bold uppercase tracking-[0.2em] text-brass">
                {section.heading}
              </h4>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={`${section.heading}-${link.label}-${link.href}`}>
                    <Link
                      href={link.href}
                      className={cn("group block rounded-xl px-2 py-1.5 transition", linkHoverClassName)}
                      onClick={onClose}
                    >
                      <span className={cn("block text-sm font-medium transition", glass ? "text-white/94 group-hover:text-brass" : "text-slate group-hover:text-olive")}>
                        {link.label}
                      </span>
                      {link.note ? (
                        <span className={cn("mt-1 block text-xs leading-5", glass ? "text-white/58" : "text-slate/50")}>
                          {link.note}
                        </span>
                      ) : null}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
