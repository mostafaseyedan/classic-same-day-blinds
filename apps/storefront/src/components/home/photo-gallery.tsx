"use client";
import { Button, CloseButton } from "@blinds/ui";
import { SectionHeader } from "@blinds/ui";
import { SectionCopy, SectionTitle } from "@blinds/ui";

import { useEffect, useMemo, useState } from "react";
import { useInView } from "@/hooks/use-in-view";

import Link from "next/link";

type GalleryCategory = "All" | "Faux Wood Blinds" | "Aluminum Blinds" | "Vinyl Blinds";

type GalleryPhoto = {
  id: number;
  title: string;
  category: Exclude<GalleryCategory, "All">;
  src: string;
};

const categories: GalleryCategory[] = ["All", "Faux Wood Blinds", "Aluminum Blinds", "Vinyl Blinds"];

const galleryPhotos: GalleryPhoto[] = [
  {
    id: 1,
    title: "White faux wood blinds in a bright living room",
    category: "Faux Wood Blinds",
    src: "/images/home/gallery-faux-wood-white.png",
  },
  {
    id: 2,
    title: "Faux wood close-up with visible slat texture",
    category: "Faux Wood Blinds",
    src: "/images/home/gallery-faux-wood-closeup.webp",
  },
  {
    id: 3,
    title: "Faux wood blinds raised with a garden view",
    category: "Faux Wood Blinds",
    src: "/images/home/gallery-faux-wood-garden.png",
  },
  {
    id: 4,
    title: "Commercial aluminum blinds in a conference room",
    category: "Aluminum Blinds",
    src: "/images/home/gallery-aluminum-conference.jpeg",
  },
  {
    id: 5,
    title: "Aluminum slat detail with textured finish",
    category: "Aluminum Blinds",
    src: "/images/home/gallery-aluminum-texture.webp",
  },
  {
    id: 6,
    title: "Aluminum blinds product view",
    category: "Aluminum Blinds",
    src: "/images/home/rev-prod-aluminum.jpg",
  },
  {
    id: 7,
    title: "Aluminum blinds in a bright window",
    category: "Aluminum Blinds",
    src: "/images/home/catv2-aluminum.jpg",
  },
  {
    id: 8,
    title: "Vinyl mini blinds in a bedroom",
    category: "Vinyl Blinds",
    src: "/images/home/gallery-roller-shades-bedroom.png",
  },
  {
    id: 9,
    title: "Vinyl blinds in a dining space",
    category: "Vinyl Blinds",
    src: "/images/home/gallery-roller-shades-dining.jpeg",
  },
  {
    id: 10,
    title: "Vinyl blinds product close-up",
    category: "Vinyl Blinds",
    src: "/images/home/rev-prod-vinyl.jpg",
  },
  {
    id: 11,
    title: "White vinyl blinds in a bright room",
    category: "Vinyl Blinds",
    src: "/images/home/catv2-vinyl.jpg",
  },
  {
    id: 12,
    title: "Installed faux wood blinds in a family living space",
    category: "Faux Wood Blinds",
    src: "/images/home/gallery-faux-wood-living.png",
  },
];

export function PhotoGallery() {
  const [activeCategory, setActiveCategory] = useState<GalleryCategory>("All");
  const [lightboxPhoto, setLightboxPhoto] = useState<GalleryPhoto | null>(null);
  const contentRef = useInView<HTMLDivElement>();

  useEffect(() => {
    if (!lightboxPhoto) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setLightboxPhoto(null); };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [lightboxPhoto]);

  const filteredPhotos = useMemo(() => {
    if (activeCategory === "All") return galleryPhotos;
    return galleryPhotos.filter((p) => p.category === activeCategory);
  }, [activeCategory]);

  return (
    <section id="photo-gallery" className="page-section bg-shell">
      <div ref={contentRef} data-animate className="content-shell max-w-[68rem]">
        <SectionHeader>
          <div>
            <p className="group flex items-center gap-4 text-xs font-bold uppercase tracking-[0.35em] text-olive">
              <span className="block h-px w-10 bg-olive transition-all duration-300 group-hover:w-16" />
              Our Work
            </p>
            <SectionTitle className="max-w-3xl">
              Photo Gallery
            </SectionTitle>
            <SectionCopy>
              See how our blinds look in finished spaces — not a showroom.
            </SectionCopy>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button asChild variant="secondary">
              <Link href="/products">Shop the catalog</Link>
            </Button>
          </div>
        </SectionHeader>

        {/* Filter tabs */}
        <div className="mt-5 flex flex-wrap gap-2">
          {categories.map((cat) => {
            const isActive = cat === activeCategory;
            return (
              <Button
                variant="secondary"
                size="compact"
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat)}
                className={isActive ? "border-olive bg-olive text-white hover:bg-olive-600" : ""}
              >
                {cat}
              </Button>
            );
          })}
        </div>

        {/* Masonry grid */}
        <div className="mt-6 columns-1 gap-4 space-y-4 sm:columns-2 lg:columns-3">
          {filteredPhotos.map((photo) => (
            <div
              key={photo.id}
              className="break-inside-avoid group relative cursor-pointer overflow-hidden rounded-media shadow-sm transition-all duration-300 hover:shadow-xl"
              onClick={() => setLightboxPhoto(photo)}
            >
              <img
                src={photo.src}
                alt={photo.title}
                className="w-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 flex translate-y-2 flex-col justify-end bg-gradient-to-t from-slate/75 via-slate/10 to-transparent p-4 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                <span className="mb-1 inline-block self-start rounded-full bg-brass px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-ink">
                  {photo.category}
                </span>
                <p className="text-sm font-semibold text-white">{photo.title}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Lightbox */}
      {lightboxPhoto && (
        <div
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/90 px-4 py-6"
          onClick={() => setLightboxPhoto(null)}
        >
          <CloseButton
            onClick={() => setLightboxPhoto(null)}
            variant="light"
            magnetic
            className="absolute right-4 top-4 z-20"
            aria-label="Close"
          />
          <img
            src={lightboxPhoto.src}
            alt={lightboxPhoto.title}
            className="max-h-[82vh] max-w-full rounded-media object-contain shadow-[0_24px_64px_rgba(0,0,0,0.6)]"
            onClick={(e) => e.stopPropagation()}
          />
          <div
            className="mt-4 w-full max-w-3xl"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brass">
              {lightboxPhoto.category}
            </p>
            <p className="mt-1 text-sm font-semibold text-white/80">
              {lightboxPhoto.title}
            </p>
          </div>
        </div>
      )}
    </section>
  );
}
