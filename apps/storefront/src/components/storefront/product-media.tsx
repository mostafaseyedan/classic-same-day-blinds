"use client";

import { useEffect, useState } from "react";
import { ImageBroken } from "@phosphor-icons/react";

type ProductMediaProps = {
  src?: string;
  alt: string;
  title: string;
  categoryLabel?: string;
  className?: string;
  fallbackClassName?: string;
};

export function ProductMedia({
  src,
  alt,
  title,
  categoryLabel,
  className = "",
  fallbackClassName = "",
}: ProductMediaProps) {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setHasError(false);
  }, [src]);

  if (!src || hasError) {
    return (
      <div
        className={`flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-[#f3ecde] via-shell to-[#e8ddc8] px-6 py-8 text-center ${fallbackClassName}`}
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-black/10 bg-white/85 text-slate/50">
          <ImageBroken className="h-6 w-6" />
        </div>
        {categoryLabel ? (
          <p className="mt-4 text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-brass">
            {categoryLabel}
          </p>
        ) : null}
        <p className="mt-2 max-w-[16rem] font-display text-[1.15rem] font-medium leading-6 text-slate">
          {title}
        </p>
        <p className="mt-2 text-[0.74rem] uppercase tracking-[0.12em] text-slate/55">
          Product image unavailable
        </p>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={() => setHasError(true)}
    />
  );
}
