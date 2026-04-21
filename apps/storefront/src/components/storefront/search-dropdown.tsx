"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { MagnifyingGlass } from "@phosphor-icons/react";
import { useLanguage } from "@/lib/context/language-context";
import { storefrontProducts } from "@/lib/site-data";

interface SearchDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  searchQuery: string;
}

export function SearchDropdown({ isOpen, onClose, searchQuery }: SearchDropdownProps) {
  const { language, t } = useLanguage();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [filteredProducts, setFilteredProducts] = useState(storefrontProducts);

  useEffect(() => {
    if (searchQuery.length >= 2) {
      const query = searchQuery.toLowerCase();
      const results = storefrontProducts.filter((product) => {
        return (
          product.name.toLowerCase().includes(query) ||
          product.description.toLowerCase().includes(query) ||
          product.categoryLabel.toLowerCase().includes(query)
        );
      });
      setFilteredProducts(results);
    } else {
      setFilteredProducts([]);
    }
  }, [searchQuery]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen || searchQuery.length < 2) return null;

  return (
    <div
      ref={dropdownRef}
      className="dialog-shell absolute left-0 right-0 top-full z-50 mt-2 max-h-[500px] overflow-y-auto shadow-[0_20px_50px_rgba(24,36,34,0.12)]"
    >
      {filteredProducts.length > 0 ? (
        <div className="py-2">
          {filteredProducts.map((product) => (
            <Link
              href={`/products/${product.slug}`}
              key={product.slug}
              onClick={onClose}
              className="flex w-full items-center gap-4 px-4 py-3 text-left transition-colors hover:bg-shell"
            >
              <img
                src={product.image}
                alt={product.name}
                className="h-16 w-16 shrink-0 rounded-media object-cover"
              />
              <div className="min-w-0 flex-1">
                <h4 className="truncate text-sm font-semibold text-slate">
                  {product.name}
                </h4>
                <p className="mt-0.5 text-xs text-slate/60">
                  {product.categoryLabel}
                </p>
                <div className="mt-1 flex items-center gap-2">
                  <span className="text-sm font-bold text-olive">
                    ${product.price.toFixed(2)}
                  </span>
                  {product.originalPrice && (
                    <span className="text-xs text-slate/45 line-through">
                      ${product.originalPrice.toFixed(2)}
                    </span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="px-4 py-8 text-center">
          <div className="mb-2 flex justify-center text-slate/20">
            <MagnifyingGlass className="h-8 w-8" />
          </div>
          <p className="text-sm text-slate/60">
            {t("No results found", "No se encontraron resultados")}
          </p>
          <p className="mt-1 text-xs text-slate/55">
            {t("Try different keywords", "Intenta con otras palabras clave")}
          </p>
        </div>
      )}
    </div>
  );
}
