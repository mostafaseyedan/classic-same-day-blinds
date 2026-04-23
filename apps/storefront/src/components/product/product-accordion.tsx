"use client";

import { useState } from "react";

type AccordionItem = {
  key: string;
  label: string;
  content: React.ReactNode;
};

function ChevronIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  );
}

export function ProductAccordion({ items }: { items: AccordionItem[] }) {
  const [openKey, setOpenKey] = useState<string | null>(null);

  return (
    <div className="divide-y divide-black/5">
      {items.map((item) => {
        const isOpen = openKey === item.key;
        return (
          <div key={item.key}>
            <button
              type="button"
              onClick={() => setOpenKey(isOpen ? null : item.key)}
              className="flex w-full cursor-pointer items-center justify-between py-3.5 text-[0.66rem] font-semibold uppercase tracking-[0.18em] text-slate outline-none transition"
              aria-expanded={isOpen}
            >
              {item.label}
              <span
                className="text-slate/40 transition-transform duration-200"
                style={{ transform: isOpen ? "rotate(180deg)" : "rotate(0deg)" }}
              >
                <ChevronIcon />
              </span>
            </button>
            {isOpen && <div className="pb-4">{item.content}</div>}
          </div>
        );
      })}
    </div>
  );
}
