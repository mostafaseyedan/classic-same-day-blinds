import Link from "next/link";
import {
  Buildings,
  CaretDown,
  Globe,
  Heart,
  House,
  List,
  Phone,
  Scissors,
  MagnifyingGlass,
  ShoppingCart,
  Truck,
  User,
  X,
} from "@phosphor-icons/react";

import { Button, CloseButton, Menu, cn } from "@blinds/ui";

import { SearchDropdown } from "@/components/storefront/search-dropdown";

import { MegaMenu } from "./mega-menu";
import { browseNavItems, type MegaMenuKey } from "./navigation";
import { HeaderBrand } from "./shared";

type TranslateFn = (en: string, es: string) => string;

type DesktopNavProps = {
  isHomepage: boolean;
  desktopGlass: boolean;
  desktopShellSurface: string;
  desktopHeaderDivider: string;
  desktopMegaMenuSurface: string;
  desktopMegaMenuFeaturedSurface: string;
  desktopMegaMenuLinkSurface: string;
  utilityTaskLinks: { label: string; href: string }[];
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  searchOpen: boolean;
  setSearchOpen: (value: boolean) => void;
  wishlistCount: number;
  cartQuantity: number;
  language: string;
  toggleLanguage: () => void;
  activeMenu: MegaMenuKey | null;
  handleMenuOpen: (menu: MegaMenuKey) => void;
  closeMenu: () => void;
  clearMenuClose: () => void;
  scheduleMenuClose: () => void;
  mobileOpen: boolean;
  setMobileOpen: (value: boolean) => void;
  t: TranslateFn;
};

export function DesktopNav({
  isHomepage,
  desktopGlass,
  desktopShellSurface,
  desktopHeaderDivider,
  desktopMegaMenuSurface,
  desktopMegaMenuFeaturedSurface,
  desktopMegaMenuLinkSurface,
  utilityTaskLinks,
  searchQuery,
  setSearchQuery,
  searchOpen,
  setSearchOpen,
  wishlistCount,
  cartQuantity,
  language,
  toggleLanguage,
  activeMenu,
  handleMenuOpen,
  closeMenu,
  clearMenuClose,
  scheduleMenuClose,
  mobileOpen,
  setMobileOpen,
  t,
}: DesktopNavProps) {
  return (
    <>
      <div className="hidden items-center justify-between bg-olive px-6 py-2 xl:flex xl:px-10">
        <div className="flex items-center gap-6">
          {[
            { Icon: House, en: "Family Owned", es: "Negocio Familiar" },
            { Icon: Truck, en: "Free Shipping", es: "Envío Gratis" },
            { Icon: Scissors, en: "Custom Made", es: "Hecho a Medida", mdOnly: true },
            { Icon: Buildings, en: "Hospitality Grade", es: "Calidad Hotelera", lgOnly: true },
          ].map(({ Icon, en, es, mdOnly, lgOnly }) => (
            <span key={en} className={`flex items-center gap-3 ${mdOnly ? "hidden md:flex" : lgOnly ? "hidden lg:flex" : "flex"}`}>
              <span className="flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-[0.14em] text-white">
                <Icon className="h-3.5 w-3.5 shrink-0 text-brass" />
                {t(en, es)}
              </span>
            </span>
          ))}
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-1.5">
            {utilityTaskLinks.slice(0, 3).map((item) => (
              <Button
                key={item.href}
                asChild
                variant="ghost-light"
                size="compact"
                className="gap-1.5 rounded-full border border-white/22 bg-transparent px-2.5 py-1.5 text-[10px] font-medium uppercase tracking-[0.12em] text-white shadow-none hover:border-brass/40 hover:bg-transparent hover:text-brass hover:shadow-none"
              >
                <Link href={item.href}>
                  {item.label}
                </Link>
              </Button>
            ))}
          </div>

          <span className="h-3 w-px bg-shell/20" />

          <Menu
            align="right"
            contentClassName="w-36"
            items={[
              {
                label: "English",
                active: language === "en",
                onSelect: () => {
                  if (language !== "en") toggleLanguage();
                },
              },
              {
                label: "Español",
                active: language === "es",
                onSelect: () => {
                  if (language !== "es") toggleLanguage();
                },
              },
            ]}
            trigger={({ open, buttonProps }) => (
              <button
                {...buttonProps}
                className="flex items-center gap-1.5 rounded-full border border-white/22 px-2.5 py-1 text-[11px] font-medium text-white transition hover:border-white/34 hover:text-brass"
              >
                <Globe className="h-3.5 w-3.5 text-brass" weight="regular" />
                {language === "en" ? "EN" : "ES"}
                <CaretDown className={`h-3 w-3 transition-transform ${open ? "rotate-180" : ""}`} />
              </button>
            )}
          />

          <span className="h-3 w-px bg-shell/20" />

          <a href="tel:18005051905" className="flex items-center gap-2 text-[10px] font-medium text-white transition hover:text-brass">
            <Phone className="h-3 w-3 text-brass" />
            1-800-505-1905
          </a>
        </div>
      </div>

      <div className={isHomepage ? "hidden md:absolute md:left-0 md:right-0 md:top-full md:z-30 md:block" : "hidden md:block"}>
        <div
          className={cn(
            "transition-[background-color,border-color,box-shadow,backdrop-filter] duration-500",
            desktopShellSurface,
          )}
          onMouseEnter={clearMenuClose}
          onMouseLeave={scheduleMenuClose}
        >
          <div className={cn("flex items-center justify-between gap-4 px-4 py-3 md:px-10", desktopHeaderDivider)}>
            <HeaderBrand glass={desktopGlass} />

            <div className="relative hidden w-[32%] min-w-[180px] max-w-md md:block lg:w-[38%] lg:max-w-lg">
              <input
                type="text"
                value={searchQuery}
                onChange={(event) => {
                  const value = event.target.value;
                  setSearchQuery(value);
                  setSearchOpen(value.length >= 2);
                }}
                placeholder={t("Search blinds, vinyl, faux wood…", "Buscar persianas, vinilo, madera…")}
                className={cn(
                  "w-full rounded-full py-2.5 pl-4 pr-10 text-sm transition focus:outline-none focus:ring-1",
                  desktopGlass
                    ? "border border-white/26 bg-white/14 text-white placeholder:text-white/66 focus:border-white/42 focus:ring-white/18"
                    : "border border-black/10 bg-white/88 text-slate placeholder:text-slate focus:border-olive focus:ring-olive",
                )}
              />
              <Button
                type="button"
                variant={desktopGlass ? "ghost-light" : "ghost"}
                size="icon"
                onClick={() => setSearchOpen(searchQuery.length >= 2)}
                className={cn(
                  "absolute right-1.5 top-1/2 h-8 w-8 -translate-y-1/2 bg-transparent p-0 shadow-none hover:bg-transparent hover:shadow-none",
                  desktopGlass ? "text-white/72 hover:text-white" : "text-slate hover:text-olive",
                )}
                aria-label="Open search suggestions"
              >
                <MagnifyingGlass className="h-4 w-4" />
              </Button>
              <SearchDropdown isOpen={searchOpen} onClose={() => setSearchOpen(false)} searchQuery={searchQuery} />
            </div>

            <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
              <Button
                asChild
                variant={desktopGlass ? "ghost-light" : "ghost"}
                size="compact"
                className={cn(
                  "hidden bg-transparent sm:flex gap-1.5 px-3 py-2 shadow-none hover:bg-transparent hover:shadow-none",
                  desktopGlass ? "text-white/94 hover:text-brass" : "text-slate/84 hover:text-brass",
                )}
              >
                <Link href="/auth">
                  <User className="h-[17px] w-[17px]" weight="light" />
                  <span className="hidden text-[11px] lg:block">{t("Sign In", "Iniciar")}</span>
                </Link>
              </Button>

              <Button
                asChild
                variant={desktopGlass ? "ghost-light" : "ghost"}
                size="compact"
                className={cn(
                  "relative gap-1.5 bg-transparent px-3 py-2 shadow-none hover:bg-transparent hover:shadow-none",
                  desktopGlass ? "text-white/94 hover:text-brass" : "text-slate/84 hover:text-brass",
                )}
              >
                <Link href="/wishlist">
                  <Heart className="h-[17px] w-[17px]" weight="light" />
                  <span className="hidden text-[11px] lg:block">{t("Wishlist", "Favoritos")}</span>
                  {wishlistCount > 0 ? (
                    <span className="absolute right-0.5 top-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full border border-white/20 bg-olive px-1 text-[9px] font-bold text-white">
                      {wishlistCount}
                    </span>
                  ) : null}
                </Link>
              </Button>

              <Button
                asChild
                variant={desktopGlass ? "ghost-light" : "ghost"}
                size="compact"
                className={cn(
                  "relative gap-1.5 bg-transparent px-3 py-2 shadow-none hover:bg-transparent hover:shadow-none",
                  desktopGlass ? "text-white/94 hover:text-brass" : "text-slate/84 hover:text-brass",
                )}
              >
                <Link href="/cart">
                  <ShoppingCart className="h-[17px] w-[17px]" weight="light" />
                  <span className="hidden text-[11px] lg:block">{t("Cart", "Carrito")}</span>
                  {cartQuantity > 0 ? (
                    <span className="absolute right-0.5 top-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full border border-white/20 bg-olive px-1 text-[9px] font-bold text-white">
                      {cartQuantity}
                    </span>
                  ) : null}
                </Link>
              </Button>

              <CloseButton
                variant={desktopGlass ? "light" : "ghost"}
                magnetic
                onClick={() => setMobileOpen(!mobileOpen)}
                className="ml-1 md:hidden"
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

          <div className="relative">
            <div className="flex items-center justify-center px-6 md:px-10">
              <nav className="flex items-center">
                {browseNavItems.map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    onMouseEnter={() => handleMenuOpen(item.key)}
                    onFocus={() => handleMenuOpen(item.key)}
                    onClick={() => (activeMenu === item.key ? closeMenu() : handleMenuOpen(item.key))}
                    aria-expanded={activeMenu === item.key}
                    aria-controls={`mega-menu-${item.key}`}
                    className={cn(
                      "flex items-center gap-0.5 border-b-2 px-5 py-3 text-xs font-semibold uppercase tracking-[0.1em] transition",
                      activeMenu === item.key
                        ? desktopGlass
                          ? "border-white text-white"
                          : "border-olive text-olive"
                        : desktopGlass
                          ? "border-transparent text-white/90 hover:text-white"
                          : "border-transparent text-slate hover:border-olive hover:text-olive",
                    )}
                  >
                    {item.label}
                    <CaretDown className="h-3 w-3" />
                  </button>
                ))}
              </nav>
            </div>

            {activeMenu ? (
              <MegaMenu
                activeMenu={activeMenu}
                glass={desktopGlass}
                surfaceClassName={desktopMegaMenuSurface}
                featuredClassName={desktopMegaMenuFeaturedSurface}
                linkHoverClassName={desktopMegaMenuLinkSurface}
                onMouseEnter={clearMenuClose}
                onClose={closeMenu}
              />
            ) : null}
          </div>
        </div>
      </div>
    </>
  );
}
