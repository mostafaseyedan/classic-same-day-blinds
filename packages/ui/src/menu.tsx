"use client";

import * as React from "react";

import {
  dropdownActiveItemClassName,
  dropdownItemClassName,
  dropdownPanelClassName,
} from "./dropdown-surface";
import { cn } from "./utils";

export type MenuItem = {
  label: React.ReactNode;
  onSelect: () => void;
  active?: boolean;
  disabled?: boolean;
};

type MenuProps = {
  trigger: (props: {
    open: boolean;
    toggle: () => void;
    close: () => void;
    buttonProps: React.ButtonHTMLAttributes<HTMLButtonElement> & {
      ref: React.Ref<HTMLButtonElement>;
    };
  }) => React.ReactNode;
  items: MenuItem[];
  align?: "left" | "right";
  className?: string;
  contentClassName?: string;
  itemClassName?: string;
};

export function Menu({
  trigger,
  items,
  align = "left",
  className,
  contentClassName,
  itemClassName,
}: MenuProps) {
  const [open, setOpen] = React.useState(false);
  const rootRef = React.useRef<HTMLDivElement>(null);
  const buttonRef = React.useRef<HTMLButtonElement>(null);

  const close = React.useCallback(() => setOpen(false), []);
  const toggle = React.useCallback(() => setOpen((current) => !current), []);

  React.useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  const activeIndex = items.findIndex((item) => item.active && !item.disabled);

  return (
    <div ref={rootRef} className={cn("relative shrink-0", className)}>
      {trigger({
        open,
        toggle,
        close,
        buttonProps: {
          ref: buttonRef,
          type: "button",
          "aria-expanded": open,
          "aria-haspopup": "menu",
          onClick: toggle,
        },
      })}

      {open ? (
        <div
          className={cn(
            dropdownPanelClassName,
            "min-w-[10rem]",
            align === "right" ? "right-0" : "left-0",
            contentClassName,
          )}
          role="menu"
        >
          {items.map((item, index) => (
            <button
              key={index}
              type="button"
              role="menuitemradio"
              aria-checked={item.active}
              disabled={item.disabled}
              autoFocus={activeIndex === index || (activeIndex === -1 && index === 0)}
              onClick={() => {
                if (item.disabled) return;
                item.onSelect();
                setOpen(false);
                buttonRef.current?.focus();
              }}
              className={cn(
                dropdownItemClassName,
                item.active && dropdownActiveItemClassName,
                itemClassName,
              )}
            >
              {item.label}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
