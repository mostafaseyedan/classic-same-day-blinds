"use client";

import { useState } from "react";

import { Breadcrumbs, PageTitle } from "@blinds/ui";
import { faqItems } from "@/lib/site-data";
import { useInView } from "@/hooks/use-in-view";

export function FaqSection({ variant = "teaser" }: { variant?: "teaser" | "page" }) {
  const [openQuestion, setOpenQuestion] = useState<string | null>(faqItems[0]?.question ?? null);
  const isPage = variant === "page";
  const contentRef = useInView<HTMLDivElement>();

  const items = (
    <div className="mt-10 space-y-3">
      {faqItems.map((item) => {
        const isOpen = openQuestion === item.question;
        return (
          <div key={item.question} className="border-b border-black/8 last:border-b-0">
            <button
              type="button"
              aria-expanded={isOpen}
              onClick={() => setOpenQuestion(isOpen ? null : item.question)}
              className="flex w-full cursor-pointer items-center justify-between gap-4 py-5 text-left text-base font-semibold text-slate"
            >
              {item.question}
              <span
                className={`shrink-0 text-lg font-medium text-brass transition-transform duration-200 ${isOpen ? "rotate-45" : ""
                  }`}
              >
                +
              </span>
            </button>
            {isOpen ? (
              <p className="max-w-3xl pb-5 text-sm leading-7 text-slate/70">{item.answer}</p>
            ) : null}
          </div>
        );
      })}
    </div>
  );

  if (isPage) {
    return (
      <>
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "FAQ" }]} />
        <PageTitle>
          The practical questions buyers ask before they place an order.
        </PageTitle>
        {items}
      </>
    );
  }

  return (
    <section className="page-section border-t border-black/5 bg-white">
      <div ref={contentRef} data-animate className="content-shell">
        <p className="group flex items-center gap-4 text-xs font-bold uppercase tracking-[0.35em] text-olive">
          <span className="block h-px w-10 bg-olive transition-all duration-300 group-hover:w-16" />
          FAQ
        </p>
        <h2 className="mt-6 font-display text-4xl font-semibold tracking-tight text-slate md:text-5xl">
          The practical questions buyers ask before they place an order.
        </h2>
        {items}
      </div>
    </section>
  );
}
