"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { DesktopNav } from "@/components/site-header/desktop-nav";
import { MobileNav } from "@/components/site-header/mobile-nav";
import type { MegaMenuKey, MenuLink } from "@/components/site-header/navigation";
import { useLanguage } from "@/lib/context/language-context";
import { getWishlistItems, WISHLIST_EVENT } from "@/lib/wishlist-store";
import { useCustomer } from "@/components/customer/customer-provider";
import { useStorefront } from "@/components/storefront/storefront-provider";

type HeaderTheme = {
  desktopShellSurface: string;
  desktopHeaderDivider: string;
  desktopMegaMenuSurface: string;
  desktopMegaMenuFeaturedSurface: string;
  desktopMegaMenuLinkSurface: string;
};

function getHeaderTheme(isHomepage: boolean): HeaderTheme {
  if (isHomepage) {
    const homepageGlassFill =
      "bg-[rgba(23,35,43,0.54)] backdrop-blur-2xl backdrop-saturate-[1.3]";
    const homepageGlassEdge =
      "border-white/12 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]";
    const homepageGlassSurface = `${homepageGlassFill} ${homepageGlassEdge} shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_12px_36px_rgba(4,10,18,0.24)]`;

    return {
      desktopShellSurface: homepageGlassSurface,
      desktopHeaderDivider: "border-b border-white/10",
      desktopMegaMenuSurface: "border-t border-white/10",
      desktopMegaMenuFeaturedSurface: "",
      desktopMegaMenuLinkSurface: "hover:bg-white/[0.04]",
    };
  }

  return {
    desktopShellSurface: "border-black/8 bg-white",
    desktopHeaderDivider: "border-b border-black/8",
    desktopMegaMenuSurface:
      "border border-black/8 border-t-black/5 bg-white shadow-[0_20px_48px_rgba(24,36,34,0.12)]",
    desktopMegaMenuFeaturedSurface: "",
    desktopMegaMenuLinkSurface: "hover:bg-shell/65",
  };
}

export function SiteHeader() {
  const pathname = usePathname();
  const { language, toggleLanguage, t } = useLanguage();
  const { isAuthenticated, customer, logout } = useCustomer();
  const { cartQuantity } = useStorefront();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState<MegaMenuKey | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [wishlistCount, setWishlistCount] = useState(0);
  const mobileSearchRef = useRef<HTMLInputElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setActiveMenu(null);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  useEffect(() => {
    const sync = () => setWishlistCount(getWishlistItems().length);
    sync();
    window.addEventListener(WISHLIST_EVENT, sync);
    return () => window.removeEventListener(WISHLIST_EVENT, sync);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const isHomepage = pathname === "/";
  const theme = getHeaderTheme(isHomepage);
  const customerDisplayName =
    [customer?.first_name, customer?.last_name].filter(Boolean).join(" ") ||
    customer?.email ||
    t("Account", "Cuenta");
  const customerInitials =
    [customer?.first_name, customer?.last_name]
      .filter(Boolean)
      .map((part) => part?.trim().slice(0, 1))
      .join("")
      .slice(0, 2)
      .toUpperCase() ||
    customer?.email?.trim().slice(0, 1).toUpperCase() ||
    "A";

  const utilityTaskLinks: MenuLink[] = [
    { label: t("Track Order", "Rastrear Pedido"), href: "/track-order" },
    { label: t("Free Sample", "Muestra Gratis"), href: "/free-sample" },
    { label: t("How to Measure", "Cómo Medir"), href: "/how-to-measure" },
    { label: t("Room Visualizer", "Visualizador"), href: "/room-visualizer" },
    { label: t("Trade Program", "Programa Comercial"), href: "/membership" },
  ];

  const supportLinks: MenuLink[] = [
    { label: "FAQ", href: "/faq" },
    { label: t("Contact", "Contacto"), href: "/contact" },
    { label: t("About Us", "Nosotros"), href: "/#about" },
  ];

  const handleMenuOpen = (menuKey: MegaMenuKey) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setActiveMenu(menuKey);
  };

  const closeMenu = () => setActiveMenu(null);

  const clearMenuClose = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
  };

  const scheduleMenuClose = () => {
    timeoutRef.current = setTimeout(() => setActiveMenu(null), 150);
  };

  return (
    <header className="sticky top-0 z-50 w-full antialiased">
      <DesktopNav
        isHomepage={isHomepage}
        desktopGlass={isHomepage}
        desktopShellSurface={theme.desktopShellSurface}
        desktopHeaderDivider={theme.desktopHeaderDivider}
        desktopMegaMenuSurface={theme.desktopMegaMenuSurface}
        desktopMegaMenuFeaturedSurface={theme.desktopMegaMenuFeaturedSurface}
        desktopMegaMenuLinkSurface={theme.desktopMegaMenuLinkSurface}
        utilityTaskLinks={utilityTaskLinks}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        searchOpen={searchOpen}
        setSearchOpen={setSearchOpen}
        wishlistCount={wishlistCount}
        cartQuantity={cartQuantity}
        isAuthenticated={isAuthenticated}
        customerDisplayName={customerDisplayName}
        customerInitials={customerInitials}
        customerEmail={customer?.email ?? ""}
        onLogout={() => void logout()}
        language={language}
        toggleLanguage={toggleLanguage}
        activeMenu={activeMenu}
        handleMenuOpen={handleMenuOpen}
        closeMenu={closeMenu}
        clearMenuClose={clearMenuClose}
        scheduleMenuClose={scheduleMenuClose}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
        t={t}
      />

      <MobileNav
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
        mobileSearchRef={mobileSearchRef}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        searchOpen={searchOpen}
        setSearchOpen={setSearchOpen}
        wishlistCount={wishlistCount}
        cartQuantity={cartQuantity}
        utilityTaskLinks={utilityTaskLinks}
        supportLinks={supportLinks}
        t={t}
      />
    </header>
  );
}
