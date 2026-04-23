"use client";

import * as React from "react";

import {
  dropdownActiveItemClassName,
  dropdownCompactItemClassName,
  dropdownItemClassName,
  dropdownPanelClassName,
} from "./dropdown-surface";
import { cn } from "./utils";

type ParsedOption = {
  label: string;
  value: string;
  disabled: boolean;
};

export interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "size"> {
  error?: string;
  size?: "default" | "compact";
  ref?: React.Ref<HTMLSelectElement>;
}

function extractOptionLabel(children: React.ReactNode): string {
  return React.Children.toArray(children)
    .map((child) => {
      if (typeof child === "string" || typeof child === "number") {
        return String(child);
      }
      if (React.isValidElement(child)) {
        return extractOptionLabel((child.props as { children?: React.ReactNode }).children);
      }
      return "";
    })
    .join("")
    .trim();
}

function parseOptions(children: React.ReactNode): ParsedOption[] {
  return React.Children.toArray(children).flatMap((child) => {
    if (!React.isValidElement(child) || child.type !== "option") {
      return [];
    }

    const optionProps = child.props as React.OptionHTMLAttributes<HTMLOptionElement>;

    return [
      {
        label: extractOptionLabel(optionProps.children),
        value: String(optionProps.value ?? ""),
        disabled: Boolean(optionProps.disabled),
      },
    ];
  });
}

export function Select({
  className,
  error,
  size = "default",
  children,
  ref,
  value,
  defaultValue,
  onChange,
  onBlur,
  name,
  disabled,
  required,
  id,
  ...props
}: SelectProps) {
  const options = React.useMemo(() => parseOptions(children), [children]);
  const isControlled = value !== undefined;
  const initialValue = React.useMemo(() => {
    if (value !== undefined) return String(value);
    if (defaultValue !== undefined) return String(defaultValue);
    return options.find((option) => !option.disabled)?.value ?? "";
  }, [defaultValue, options, value]);

  const [internalValue, setInternalValue] = React.useState(initialValue);
  const [open, setOpen] = React.useState(false);
  const [activeIndex, setActiveIndex] = React.useState(() => {
    const selected = options.findIndex((option) => option.value === initialValue && !option.disabled);
    return selected >= 0 ? selected : options.findIndex((option) => !option.disabled);
  });

  const selectedValue = isControlled ? String(value ?? "") : internalValue;
  const selectedOption =
    options.find((option) => option.value === selectedValue) ??
    options.find((option) => option.value === "") ??
    options[0];

  const rootRef = React.useRef<HTMLDivElement>(null);
  const buttonRef = React.useRef<HTMLButtonElement>(null);
  const selectRef = React.useRef<HTMLSelectElement>(null);

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
        buttonRef.current?.focus({ preventScroll: true });
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  React.useEffect(() => {
    const nextIndex = options.findIndex((option) => option.value === selectedValue && !option.disabled);
    if (nextIndex >= 0) {
      setActiveIndex(nextIndex);
    }
  }, [options, selectedValue]);

  const commitValue = React.useCallback(
    (nextValue: string) => {
      if (!isControlled) {
        setInternalValue(nextValue);
      }

      if (selectRef.current) {
        selectRef.current.value = nextValue;
        selectRef.current.dispatchEvent(new Event("change", { bubbles: true }));
      }

      setOpen(false);
      buttonRef.current?.focus({ preventScroll: true });
    },
    [isControlled],
  );

  const enabledOptions = options.filter((option) => !option.disabled);

  const moveHighlight = React.useCallback(
    (direction: 1 | -1) => {
      if (enabledOptions.length === 0) return;

      const currentEnabledIndex = enabledOptions.findIndex(
        (option) => option.value === options[activeIndex]?.value,
      );
      const nextEnabledIndex =
        currentEnabledIndex === -1
          ? 0
          : (currentEnabledIndex + direction + enabledOptions.length) % enabledOptions.length;
      const nextValue = enabledOptions[nextEnabledIndex]?.value;
      const nextOptionIndex = options.findIndex((option) => option.value === nextValue);
      if (nextOptionIndex >= 0) {
        setActiveIndex(nextOptionIndex);
      }
    },
    [activeIndex, enabledOptions, options],
  );

  const triggerId = id ? `${id}-trigger` : undefined;
  const listboxId = id ? `${id}-listbox` : undefined;

  return (
    <div ref={rootRef} className="relative w-full">
      <select
        ref={(node) => {
          selectRef.current = node;
          if (typeof ref === "function") {
            ref(node);
          } else if (ref) {
            ref.current = node;
          }
        }}
        id={id}
        name={name}
        value={selectedValue}
        onChange={onChange}
        onBlur={onBlur}
        disabled={disabled}
        required={required}
        aria-hidden="true"
        tabIndex={-1}
        className="pointer-events-none absolute inset-0 opacity-0"
        {...props}
      >
        {children}
      </select>

      <button
        ref={buttonRef}
        id={triggerId}
        type="button"
        disabled={disabled}
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-controls={listboxId}
        onClick={() => {
          if (disabled) return;
          setOpen((current) => !current);
        }}
        onKeyDown={(event) => {
          if (disabled) return;

          if (event.key === "ArrowDown" || event.key === "ArrowUp") {
            event.preventDefault();
            if (!open) {
              setOpen(true);
              return;
            }
            moveHighlight(event.key === "ArrowDown" ? 1 : -1);
          }

          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            if (!open) {
              setOpen(true);
              return;
            }

            const highlighted = options[activeIndex];
            if (highlighted && !highlighted.disabled) {
              commitValue(highlighted.value);
            }
          }
        }}
        className={cn(
          "flex w-full cursor-pointer items-center justify-between rounded-card border border-black/10 bg-white/96 text-left text-slate outline-none shadow-[0_8px_24px_rgba(24,36,34,0.04)] transition-[border-color,box-shadow,color,transform,background-color] duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
          size === "default"
            ? "h-12 px-4 pr-3.5 text-[0.95rem] font-medium"
            : "h-10 px-3.5 pr-3 text-[0.88rem] font-medium",
          open
            ? "border-brass/48 bg-white shadow-[0_0_0_3px_rgba(176,125,66,0.12),0_14px_30px_rgba(24,36,34,0.05)]"
            : "hover:border-black/16 hover:bg-white",
          error && "border-red-500 focus-visible:ring-red-500/40",
          className,
        )}
      >
        <span className={cn("min-w-0 truncate", selectedOption?.value === "" && "text-slate/50")}>
          {selectedOption?.label ?? ""}
        </span>
        <span
          aria-hidden="true"
          className={cn(
            "shrink-0 text-slate/42 transition-[color,transform]",
            size === "default" ? "ml-2" : "ml-1.5",
            open && "rotate-180 text-brass/72",
          )}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </span>
      </button>

      {open ? (
        <div
          id={listboxId}
          role="listbox"
          aria-labelledby={triggerId}
          className={cn(dropdownPanelClassName, "left-0 right-0 max-h-72 overflow-y-auto")}
        >
          {options.map((option, index) => {
            const isActive = option.value === selectedValue;
            const isHighlighted = index === activeIndex;

            return (
              <button
                key={`${option.value}-${index}`}
                type="button"
                role="option"
                aria-selected={isActive}
                disabled={option.disabled}
                autoFocus={isHighlighted}
                onMouseEnter={() => setActiveIndex(index)}
                onClick={() => {
                  if (option.disabled) return;
                  commitValue(option.value);
                }}
                className={cn(
                  dropdownItemClassName,
                  (isActive || isHighlighted) && dropdownActiveItemClassName,
                  size === "compact" && dropdownCompactItemClassName,
                )}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      ) : null}

      {error ? (
        <p id={`${String(id ?? "")}-error`} className="mt-1 text-sm text-red-500" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
