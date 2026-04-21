import Link from "next/link";
import type { RefObject } from "react";
import { CaretDown, Heart, List, MagnifyingGlass, ShoppingCart, X } from "@phosphor-icons/react";

import { Button, CloseButton } from "@blinds/ui";

import { SearchDropdown } from "@/components/storefront/search-dropdown";

import { browseNavItems, megaMenus, programNavItems, type MegaMenuKey, type MenuLink } from "./navigation";
import { HeaderBrand } from "./shared";

type TranslateFn = (en: string, es: string) => string;

type MobileNavProps = {
  mobileOpen: boolean;
  setMobileOpen: (value: boolean) => void;
  mobileSearchRef: RefObject<HTMLInputElement | null>;
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  searchOpen: boolean;
  setSearchOpen: (value: boolean) => void;
  wishlistCount: number;
  cartQuantity: number;
  utilityTaskLinks: MenuLink[];
  supportLinks: MenuLink[];
  t: TranslateFn;
};

export function MobileNav({
  mobileOpen,
  setMobileOpen,
  mobileSearchRef,
  searchQuery,
  setSearchQuery,
  searchOpen,
  setSearchOpen,
  wishlistCount,
  cartQuantity,
  utilityTaskLinks,
  supportLinks,
  t,
}: MobileNavProps) {
  return (
    <>
      <div className="flex items-center justify-between gap-4 border-b border-black/8 bg-white px-4 py-3 md:hidden">
        <HeaderBrand mobile />

        <div className="flex shrink-0 items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              setMobileOpen(true);
              setTimeout(() => mobileSearchRef.current?.focus(), 100);
            }}
            aria-label={t("Search", "Buscar")}
          >
            <MagnifyingGlass className="h-[20px] w-[20px]" weight="light" />
          </Button>

          <Button asChild variant="ghost" size="icon" className="relative">
            <Link href="/wishlist">
              <Heart className="h-[20px] w-[20px]" weight="light" />
              {wishlistCount > 0 ? (
                <span className="absolute right-0 top-0 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-olive px-1 text-[9px] font-bold text-white ring-2 ring-white">
                  {wishlistCount}
                </span>
              ) : null}
            </Link>
          </Button>

          <Button asChild variant="ghost" size="icon" className="relative">
            <Link href="/cart">
              <ShoppingCart className="h-[20px] w-[20px]" weight="light" />
              {cartQuantity > 0 ? (
                <span className="absolute right-0 top-0 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-olive px-1 text-[9px] font-bold text-white ring-2 ring-white">
                  {cartQuantity}
                </span>
              ) : null}
            </Link>
          </Button>

          <CloseButton
            variant="ghost"
            magnetic
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden"
            aria-label={mobileOpen ? t("Close menu", "Cerrar menú") : t("Open menu", "Abrir menú")}
          >
            {mobileOpen ? (
              <X className="h-[22px] w-[22px]" weight="bold" />
            ) : (
              <List className="h-[22px] w-[22px]" weight="light" />
            )}
          </CloseButton>
        </div>
      </div>

      {mobileOpen ? (
        <div className="max-h-[calc(100dvh-4.5rem)] overflow-y-auto border-t border-black/5 bg-white px-4 py-4 md:hidden">
          <div className="relative mb-4">
            <input
              ref={mobileSearchRef}
              type="text"
              value={searchQuery}
              onChange={(event) => {
                const value = event.target.value;
                setSearchQuery(value);
                setSearchOpen(value.length >= 2);
              }}
              placeholder={t("Search…", "Buscar…")}
              className="w-full rounded-full border border-black/10 bg-slate/5 px-4 py-2.5 pl-9 text-sm text-slate placeholder:text-slate/40 transition focus:border-olive focus:outline-none"
            />
            <MagnifyingGlass className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate/40" />
            <SearchDropdown isOpen={searchOpen} onClose={() => setSearchOpen(false)} searchQuery={searchQuery} />
          </div>

          <div className="grid gap-3">
            <div className="px-1">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-brass">Browse</p>
            </div>
            {browseNavItems.map((item) => (
              <details key={item.key as MegaMenuKey} className="overflow-hidden rounded-2xl border border-black/5 bg-shell/55">
                <summary className="cursor-pointer list-none px-4 py-3 text-sm font-semibold uppercase tracking-[0.12em] text-slate marker:hidden">
                  <div className="flex items-center justify-between">
                    <span>{item.label}</span>
                    <CaretDown className="h-4 w-4 text-slate/45" />
                  </div>
                </summary>
                <div className="border-t border-black/5 px-4 py-4">
                  <div className="space-y-5">
                    {megaMenus[item.key].sections.map((section) => (
                      <div key={section.heading}>
                        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-brass">
                          {section.heading}
                        </p>
                        <div className="mt-2 grid gap-1">
                          {section.links.map((link) => (
                            <Link
                              key={`${section.heading}-${link.label}-${link.href}`}
                              href={link.href}
                              onClick={() => setMobileOpen(false)}
                              className="rounded-xl px-3 py-2 text-sm text-slate/78 transition hover:bg-white hover:text-olive"
                            >
                              {link.label}
                            </Link>
                          ))}
                        </div>
                      </div>
                    ))}
                    <Button asChild variant="secondary">
                      <Link href={megaMenus[item.key].featured.href} onClick={() => setMobileOpen(false)}>
                        {megaMenus[item.key].featured.cta}
                      </Link>
                    </Button>
                  </div>
                </div>
              </details>
            ))}

            <div className="mt-2 border-t border-black/5 pt-4">
              <p className="px-1 text-[10px] font-bold uppercase tracking-[0.2em] text-brass">Tools and Programs</p>
              <div className="mt-2 grid gap-1">
                {programNavItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className="rounded-xl px-4 py-2.5 text-sm font-semibold uppercase tracking-[0.12em] text-slate transition hover:bg-shell hover:text-olive"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>

            <div className="mt-2 border-t border-black/5 pt-4">
              <p className="px-1 text-[10px] font-bold uppercase tracking-[0.2em] text-brass">Quick Links</p>
              <div className="mt-2 grid gap-1">
                {utilityTaskLinks.concat(supportLinks).map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className="rounded-xl px-4 py-2 text-sm text-slate/62 transition hover:bg-shell hover:text-olive"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
