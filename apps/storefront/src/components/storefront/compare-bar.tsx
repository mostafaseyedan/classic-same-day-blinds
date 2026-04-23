"use client";
import { Button, CloseButton } from "@blinds/ui";

import { useState, useEffect } from "react";
import { Plus, ArrowRight } from "@phosphor-icons/react";
import { CompareModal } from "./compare-modal";
import {
  COMPARE_EVENT,
  getCompareItems,
  clearCompare,
  toggleCompare,
  CompareItem,
} from "@/lib/compare-store";

export function CompareBar() {
  const [items, setItems] = useState<CompareItem[]>([]);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    setItems(getCompareItems());
    const handler = () => setItems(getCompareItems());
    window.addEventListener(COMPARE_EVENT, handler);
    return () => window.removeEventListener(COMPARE_EVENT, handler);
  }, []);

  if (items.length === 0) return null;

  return (
    <>
      {/* Fixed compare bar at bottom */}
      <div className="fixed bottom-0 left-0 right-0 z-[40] border-t border-black/10 bg-white/95 backdrop-blur shadow-[0_-8px_30px_rgba(24,36,34,0.08)] transform transition-transform animate-in slide-in-from-bottom-full duration-300">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-3 sm:px-10 sm:py-4 lg:px-14 md:flex-row md:items-center md:justify-between md:gap-6">
          
          {/* Label Area */}
          <div className="hidden shrink-0 md:block">
            <p className="text-[11px] font-bold text-brass uppercase tracking-[0.15em] mb-1">
              Comparing
            </p>
            <p className="text-xs font-semibold text-slate/50">
              {items.length}/3 selected
            </p>
          </div>

          <div className="flex items-center justify-between md:hidden">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-brass">
                Compare Products
              </p>
              <p className="mt-1 text-xs font-medium text-slate/55">
                {items.length} of 3 selected
              </p>
            </div>
            <Button variant="secondary"
              size="compact"
              onClick={clearCompare}
            >
              Clear
            </Button>
          </div>

          {/* Product Slots */}
          <div className="hidden flex-1 items-center gap-4 overflow-x-auto pb-1 -mb-1 scrollbar-hide sm:flex">
            {[0, 1, 2].map((slot) => {
              const product = items[slot];
              return (
                <div
                  key={slot}
                  className={`flex items-center gap-3 h-14 min-w-[200px] flex-1 rounded-2xl border transition-all ${
                    product
                      ? "bg-white border-olive/30 shadow-sm"
                      : "bg-shell/50 border-dashed border-black/10 hidden sm:flex"
                  }`}
                >
                  {product ? (
                    <>
                      <div className="ml-2 h-10 w-10 overflow-hidden rounded-xl bg-shell shrink-0 border border-black/5">
                        <img 
                          src={product.image} 
                          alt={product.name} 
                          className="w-full h-full object-cover object-center" 
                        />
                      </div>
                      <p className="text-xs font-semibold text-slate flex-1 min-w-0 pr-2 line-clamp-2 leading-snug">
                        {product.name}
                      </p>
                      <CloseButton
                        onClick={() => toggleCompare(product)}
                        variant="destructive"
                        size="sm"
                        className="mr-1 shrink-0"
                        aria-label="Remove item"
                      />
                    </>
                  ) : (
                    <div className="flex items-center gap-2.5 px-4 w-full h-full pointer-events-none">
                      <div className="flex h-6 w-6 items-center justify-center rounded-xl bg-black/5 text-slate/40">
                        <Plus className="w-3.5 h-3.5" />
                      </div>
                      <p className="text-xs font-medium text-slate/40">
                        Add product
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1 sm:hidden">
            {items.map((product) => (
              <div
                key={product.id}
                className="flex min-w-[13rem] items-center gap-2 rounded-2xl border border-olive/20 bg-shell/80 px-3 py-2.5"
              >
                <div className="h-9 w-9 shrink-0 overflow-hidden rounded-xl border border-black/5 bg-white">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="h-full w-full object-cover object-center"
                  />
                </div>
                <p className="min-w-0 flex-1 truncate text-xs font-semibold text-slate">
                  {product.name}
                </p>
                <CloseButton
                  onClick={() => toggleCompare(product)}
                  variant="destructive"
                  size="sm"
                  className="shrink-0"
                  aria-label="Remove item"
                />
              </div>
            ))}
          </div>

          {/* Actions Menu */}
          <div className="flex shrink-0 items-center gap-3">
            <Button variant="secondary"
              onClick={clearCompare}
              className="hidden sm:inline-flex"
            >
              Clear
            </Button>
            <Button
              onClick={() => setShowModal(true)}
              disabled={items.length < 2}
              variant="default"
              className="flex-1 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-slate sm:flex-none sm:px-6"
            >
              Compare
              {items.length >= 2 && <ArrowRight className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Spacer so content isn't hidden behind the fixed bar */}
      <div className="block h-32 w-full sm:h-28"></div>

      {/* Modal */}
      {showModal && (
        <CompareModal
          items={items}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  );
}
