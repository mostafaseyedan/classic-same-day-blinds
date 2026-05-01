"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { PackageIcon, SignOutIcon, UserCircleIcon } from "@phosphor-icons/react";
import { cn } from "@blinds/ui";

type AccountDropdownProps = {
  customerInitials: string;
  customerDisplayName: string;
  customerEmail: string;
  desktopGlass: boolean;
  onLogout: () => void;
  t: (en: string, es: string) => string;
};

export function AccountDropdown({
  customerInitials,
  customerDisplayName,
  customerEmail,
  desktopGlass,
  onLogout,
  t,
}: AccountDropdownProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const handlePointerDown = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };
    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  const panelCn = desktopGlass
    ? "absolute top-full right-0 z-50 mt-2 w-56 overflow-hidden rounded-xl border border-white/12 bg-[rgba(23,35,43,0.82)] shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_20px_44px_rgba(4,10,18,0.32)] backdrop-blur-2xl backdrop-saturate-[1.3]"
    : "absolute top-full right-0 z-50 mt-2 w-56 overflow-hidden rounded-xl border border-black/7 bg-white/98 shadow-[0_20px_44px_rgba(24,36,34,0.12)] ring-1 ring-black/[0.03] backdrop-blur-[10px]";

  const dividerCn = desktopGlass ? "border-white/10" : "border-black/8";

  const itemCn = cn(
    "flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-[0.88rem] font-medium leading-5 transition-[background-color,color] duration-150 focus-visible:outline-none",
    desktopGlass
      ? "text-white/90 hover:bg-white/[0.07] hover:text-white focus-visible:bg-white/[0.07]"
      : "text-slate hover:bg-shell/78 focus-visible:bg-shell/78",
  );

  return (
    <div ref={rootRef} className="relative shrink-0">
      <button
        ref={triggerRef}
        type="button"
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "flex items-center gap-1.5 rounded-media px-3 py-2 transition-[color,transform] duration-150 active:scale-[0.98]",
          desktopGlass ? "text-white/94 hover:text-brass" : "text-slate/84 hover:text-brass",
        )}
      >
        <span
          className={cn(
            "flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-bold uppercase tracking-[0.06em] shadow-[inset_0_1px_0_rgba(255,255,255,0.22)]",
            desktopGlass ? "bg-white text-olive" : "bg-olive text-white",
          )}
        >
          {customerInitials}
        </span>
        <span className="hidden text-[11px] lg:block">{t("Account", "Cuenta")}</span>
      </button>

      {open && (
          <div className={panelCn} role="menu">
            {/* Identity header */}
            <div className={cn("border-b px-4 py-3.5", dividerCn)}>
              <p className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-brass">
                {t("Signed in", "Sesión iniciada")}
              </p>
              <p className={cn("mt-1 truncate text-[0.88rem] font-semibold leading-5", desktopGlass ? "text-white" : "text-slate")}>
                {customerDisplayName}
              </p>
              <p className={cn("mt-0.5 truncate text-xs leading-5", desktopGlass ? "text-white/50" : "text-slate/50")}>
                {customerEmail}
              </p>
            </div>

            {/* Nav links */}
            <div className="py-1.5">
              <Link href="/account" onClick={() => setOpen(false)} className={itemCn} role="menuitem">
                <UserCircleIcon className={cn("h-4 w-4 shrink-0", desktopGlass ? "text-white/40" : "text-slate/40")} weight="regular" />
                {t("Account", "Cuenta")}
              </Link>
              <Link href="/account?tab=orders" onClick={() => setOpen(false)} className={itemCn} role="menuitem">
                <PackageIcon className={cn("h-4 w-4 shrink-0", desktopGlass ? "text-white/40" : "text-slate/40")} weight="regular" />
                {t("Orders", "Pedidos")}
              </Link>
            </div>

            {/* Sign out */}
            <div className={cn("border-t py-1.5", dividerCn)}>
              <button
                type="button"
                role="menuitem"
                onClick={() => { setOpen(false); onLogout(); }}
                className={cn(itemCn, desktopGlass ? "text-white/60 hover:text-white/90" : "text-slate/68 hover:text-slate")}
              >
                <SignOutIcon className={cn("h-4 w-4 shrink-0", desktopGlass ? "text-white/35" : "text-slate/35")} weight="regular" />
                {t("Sign out", "Cerrar sesión")}
              </button>
            </div>
          </div>
      )}
    </div>
  );
}