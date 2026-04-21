"use client";
import { Badge, Button, CloseButton } from "@blinds/ui";

import { Check } from "@phosphor-icons/react";
import Link from "next/link";
import { formatPrice } from "@/lib/format-price";
import { CompareItem } from "@/lib/compare-store";

interface CompareModalProps {
  items: CompareItem[];
  onClose: () => void;
}

export function CompareModal({ items, onClose }: CompareModalProps) {
  if (items.length < 2) return null;

  const lowestPrice = Math.min(...items.map((p) => p.price));
  const colWidth = Math.floor(100 / items.length);

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-slate/50 p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="dialog-shell w-full max-w-5xl max-h-[92vh] overflow-y-auto rounded-t-[0.625rem] sm:rounded-2xl">
        <div className="sticky top-0 z-20 flex items-center justify-between border-b border-black/5 bg-white/90 px-6 py-4 backdrop-blur">
          <div>
            <h2 className="text-xl font-display font-bold text-slate">
              Compare Products
            </h2>
            <p className="text-sm font-medium text-slate/60">
              {items.length} products selected
            </p>
          </div>
          <CloseButton
            onClick={onClose}
            magnetic
            className="h-10 w-10"
          />
        </div>

        <div className="p-6">
          {/* Product headers */}
          <div 
            className="grid gap-6 mb-8" 
            style={{ gridTemplateColumns: `140px repeat(${items.length}, 1fr)` }}
          >
            <div></div>
            {items.map((p) => {
              const isCheapest = p.price === lowestPrice;
              
              return (
                <div key={p.id} className="flex flex-col items-center gap-3 text-center">
                  <div className="relative w-full aspect-square overflow-hidden rounded-2xl bg-shell">
                    <img 
                      src={p.image} 
                      alt={p.name} 
                      className="w-full h-full object-cover object-center" 
                    />
                    {isCheapest && (
                      <div className="absolute top-3 left-3">
                        <Badge variant="soft" className="border-olive/20 bg-olive text-white">
                          Best price
                        </Badge>
                      </div>
                    )}
                  </div>
                  <h3 className="text-base font-semibold text-slate leading-snug line-clamp-2">
                    {p.name}
                  </h3>
                  <Button asChild variant="default"><Link
                    href={`/products/${p.slug}`}
                    onClick={onClose}
                    className="w-full truncate px-2"
                  >
                    View details
                  </Link></Button>
                </div>
              );
            })}
          </div>

          {/* Comparison rows */}
          <div className="space-y-0 overflow-hidden rounded-2xl border border-black/5">
            {/* Price Row */}
            <div 
              className="grid gap-6 items-center py-4 px-5 bg-white border-b border-black/5" 
              style={{ gridTemplateColumns: `140px repeat(${items.length}, 1fr)` }}
            >
              <p className="text-xs font-bold text-brass uppercase tracking-wider">
                Price
              </p>
              {items.map((p) => (
                <div key={p.id} className="flex flex-col items-center text-center">
                  <span className="text-xl font-bold text-slate">
                    {formatPrice(p.price, "USD")}
                  </span>
                  {p.originalPrice && p.price < p.originalPrice && (
                    <span className="text-xs text-slate/40 line-through font-medium mt-0.5">
                      {formatPrice(p.originalPrice, "USD")}
                    </span>
                  )}
                </div>
              ))}
            </div>

            {/* Category Row */}
            <div 
              className="grid gap-6 items-center py-4 px-5 bg-shell/50 border-b border-black/5" 
              style={{ gridTemplateColumns: `140px repeat(${items.length}, 1fr)` }}
            >
              <p className="text-xs font-bold text-brass uppercase tracking-wider">
                Category
              </p>
              {items.map((p) => (
                <div key={p.id} className="flex justify-center text-center">
                  <span className="text-sm font-semibold text-slate/80 capitalize">
                    {p.categoryLabel.replace(/-/g, " ")}
                  </span>
                </div>
              ))}
            </div>

            {/* Details Row */}
            <div 
              className="grid gap-6 items-center py-4 px-5 bg-white border-b border-black/5" 
              style={{ gridTemplateColumns: `140px repeat(${items.length}, 1fr)` }}
            >
              <p className="text-xs font-bold text-brass uppercase tracking-wider">
                Badge
              </p>
              {items.map((p) => (
                <div key={p.id} className="flex justify-center text-center">
                  {p.badge ? (
                    <Badge variant="soft" className="border-olive/20 bg-olive/10 text-olive">
                      {p.badge}
                    </Badge>
                  ) : (
                    <span className="text-slate/30 text-sm">—</span>
                  )}
                </div>
              ))}
            </div>

            {/* Highlights Rows */}
            <div className="bg-shell/30 py-4 px-5">
              <p className="text-xs font-bold text-brass uppercase tracking-wider mb-4">
                Features
              </p>
              
              {/* Feature Matrix (simplified for generic CatalogProducts) */}
              {[0, 1, 2].map((idx) => {
                const hasAny = items.some((p) => p.highlights && p.highlights[idx]);
                if (!hasAny) return null;
                
                return (
                  <div 
                    key={idx}
                    className="grid gap-6 items-center py-3 border-t border-black/[0.03] first:border-0" 
                    style={{ gridTemplateColumns: `140px repeat(${items.length}, 1fr)` }}
                  >
                    <div></div>
                    {items.map((p) => {
                      const feat = p.highlights?.[idx];
                      return (
                        <div key={p.id} className="flex justify-center text-center">
                          {feat ? (
                            <div className="flex items-center gap-2">
                              <div className="flex h-5 w-5 items-center justify-center rounded-xl bg-olive/10 shrink-0">
                                <Check className="text-olive w-3 h-3" />
                              </div>
                              <span className="text-xs font-medium text-slate/80">{feat}</span>
                            </div>
                          ) : (
                            <span className="text-slate/20 text-sm">—</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
