"use client";

import { useEffect, useState } from "react";
import { CaretLeft, CaretRight, MagnifyingGlassPlus } from "@phosphor-icons/react";

type ProductImageGalleryProps = {
  images: string[];
  name: string;
};

export function ProductImageGallery({ images, name }: ProductImageGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const displayed = images.filter(Boolean);
  const mainSrc = displayed[activeIndex] ?? displayed[0] ?? null;
  const hasMultipleImages = displayed.length > 1;

  function showPreviousImage() {
    if (!hasMultipleImages) return;
    setActiveIndex((current) => (current - 1 + displayed.length) % displayed.length);
  }

  function showNextImage() {
    if (!hasMultipleImages) return;
    setActiveIndex((current) => (current + 1) % displayed.length);
  }

  useEffect(() => {
    if (!lightboxOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setLightboxOpen(false);
      }

      if (event.key === "ArrowLeft") {
        event.preventDefault();
        showPreviousImage();
      }

      if (event.key === "ArrowRight") {
        event.preventDefault();
        showNextImage();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [lightboxOpen, hasMultipleImages, displayed.length]);

  return (
    <>
      <div className="relative overflow-hidden rounded-2xl border border-black/8 bg-white">
        {mainSrc ? (
          <button
            type="button"
            onClick={() => setLightboxOpen(true)}
            className="group relative block aspect-[4/4.2] w-full overflow-hidden bg-bone"
            aria-label="Enlarge image"
          >
            <img
              src={mainSrc}
              alt={name}
              className="h-full w-full object-cover object-center transition duration-500 group-hover:scale-[1.02]"
            />
            <div className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full border border-black/8 bg-white/92 text-slate opacity-0 transition duration-200 group-hover:opacity-100">
              <MagnifyingGlassPlus className="h-4 w-4" />
            </div>
          </button>
        ) : (
          <div className="flex aspect-[4/4.2] w-full items-center justify-center bg-bone px-6 text-center text-sm text-slate/56">
            Product image unavailable
          </div>
        )}

        {hasMultipleImages && (
          <div className="grid grid-cols-[repeat(auto-fit,minmax(3.5rem,3.5rem))] justify-center gap-2 border-t border-black/6 px-1 py-3">
            {displayed.map((src, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setActiveIndex(i)}
                className={`relative h-14 w-14 shrink-0 overflow-hidden rounded-media border transition ${
                  i === activeIndex
                    ? "border-olive"
                    : "border-black/10 opacity-60 hover:opacity-100"
                }`}
                aria-label={`View image ${i + 1}`}
              >
                <img src={src} alt="" className="h-full w-full object-cover object-center" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightboxOpen && mainSrc && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/88 px-4"
          onClick={() => setLightboxOpen(false)}
        >
          {hasMultipleImages ? (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  showPreviousImage();
                }}
                className="absolute left-5 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-white/12 text-white transition hover:bg-white/20"
                aria-label="Previous image"
              >
                <CaretLeft className="h-5 w-5" weight="bold" />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  showNextImage();
                }}
                className="absolute right-5 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-white/12 text-white transition hover:bg-white/20"
                aria-label="Next image"
              >
                <CaretRight className="h-5 w-5" weight="bold" />
              </button>
            </>
          ) : null}
          <img
            src={mainSrc}
            alt={name}
            className="max-h-[88vh] max-w-full rounded-2xl object-contain shadow-[0_32px_80px_rgba(0,0,0,0.6)]"
            onClick={(e) => e.stopPropagation()}
          />
          <button
            type="button"
            onClick={() => setLightboxOpen(false)}
            className="absolute right-5 top-5 flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/12 text-white transition hover:bg-white/20"
            aria-label="Close"
          >
            ✕
          </button>
        </div>
      )}
    </>
  );
}
