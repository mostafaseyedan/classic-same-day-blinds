"use client";
import { Button, CloseButton } from "@blinds/ui";
import { SectionHeader } from "@blinds/ui";
import { Eyebrow, SectionCopy, SectionTitle } from "@blinds/ui";

import { useEffect, useMemo, useState } from "react";

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
    title: "Vinyl mini blinds in a bedroom",
    category: "Vinyl Blinds",
    src: "/images/home/gallery-roller-shades-bedroom.png",
  },
  {
    id: 7,
    title: "Vinyl blinds in a dining space",
    category: "Vinyl Blinds",
    src: "/images/home/gallery-roller-shades-dining.jpeg",
  },
  {
    id: 8,
    title: "Installed faux wood blinds in a family living space",
    category: "Faux Wood Blinds",
    src: "/images/home/gallery-faux-wood-living.png",
  },
];

export function PhotoGallery() {
  const [activeCategory, setActiveCategory] = useState<GalleryCategory>("All");
  const [heroId, setHeroId] = useState<number>(galleryPhotos[0].id);
  const [lightboxPhoto, setLightboxPhoto] = useState<GalleryPhoto | null>(null);

  // Escape key + body scroll lock for lightbox
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

  // When filter changes, reset hero to first photo of new set
  useEffect(() => {
    setHeroId(filteredPhotos[0]?.id ?? galleryPhotos[0].id);
  }, [filteredPhotos]);

  const hero = filteredPhotos.find((p) => p.id === heroId) ?? filteredPhotos[0];
  // Show up to 3 thumbnails in the side stack
  const thumbs = filteredPhotos.filter((p) => p.id !== hero?.id).slice(0, 3);

  return (
    <section className="page-section bg-white/55">
      <div className="content-shell">
        {/* Header */}
        <SectionHeader>
          <div>
            <Eyebrow>Installed Work</Eyebrow>
            <SectionTitle className="max-w-3xl">
              Real rooms. Real results.
            </SectionTitle>
            <SectionCopy>
              See how our blinds look in finished spaces — not a showroom.
            </SectionCopy>
          </div>
          <Button asChild variant="secondary"><Link href="/products">
            Shop the catalog
          </Link></Button>
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
                className={isActive ? "border-olive bg-olive text-white hover:border-olive hover:text-white" : ""}
              >
                {cat}
              </Button>
            );
          })}
        </div>

        {/* Gallery — aspect-ratio hero, thumbnails fill matched height via grid stretch */}
        {hero && (
          <div className="mt-5 grid items-stretch gap-3 lg:grid-cols-[1fr_200px] xl:grid-cols-[1fr_220px]">

            {/* Hero — 16/9 scales cleanly at every screen width */}
            <button
              type="button"
              onClick={() => setLightboxPhoto(hero)}
              className="group relative w-full overflow-hidden rounded-media bg-slate text-left aspect-[16/9]"
            >
              <img
                src={hero.src}
                alt={hero.title}
                className="h-full w-full object-cover object-center transition duration-500 group-hover:scale-[1.02]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate/75 via-slate/10 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brass">
                  {hero.category}
                </p>
                <h3 className="mt-1 font-display text-lg font-semibold tracking-tight text-white">
                  {hero.title}
                </h3>
              </div>
            </button>

            {/* Thumbnail stack — hidden on mobile, visible lg+, fills hero height via self-stretch */}
            {thumbs.length > 0 && (
              <div
                className={`hidden lg:grid gap-3 ${
                  thumbs.length === 1 ? "grid-rows-1" :
                  thumbs.length === 2 ? "grid-rows-2" : "grid-rows-3"
                }`}
              >
                {thumbs.map((photo) => (
                  <button
                    key={photo.id}
                    type="button"
                    onClick={() => setHeroId(photo.id)}
                    className="group relative overflow-hidden rounded-media bg-slate"
                  >
                    <img
                      src={photo.src}
                      alt={photo.title}
                      className="h-full w-full object-cover object-center transition duration-300 group-hover:scale-[1.05]"
                    />
                  <div className="absolute inset-0 flex items-end bg-gradient-to-t from-slate/70 to-transparent p-3 opacity-0 transition duration-300 group-hover:opacity-100">
                    <p className="line-clamp-2 text-xs font-semibold leading-4 text-white">
                      {photo.title}
                    </p>
                  </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Mobile thumbnail strip — horizontal scroll, shown below hero on < lg */}
        {thumbs.length > 0 && (
          <div className="mt-3 flex gap-3 overflow-x-auto pb-1 lg:hidden">
            {thumbs.map((photo) => (
              <button
                key={photo.id}
                type="button"
                onClick={() => setHeroId(photo.id)}
                className="group relative aspect-[4/3] h-24 shrink-0 overflow-hidden rounded-media bg-slate"
              >
                <img
                  src={photo.src}
                  alt={photo.title}
                  className="h-full w-full object-cover object-center transition duration-300 group-hover:scale-[1.05]"
                />
              </button>
            ))}
          </div>
        )}

      </div>

      {/* Lightbox */}
      {lightboxPhoto && (
        <div
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/90 px-4 py-6"
          onClick={() => setLightboxPhoto(null)}
        >
          {/* Close — white X on dark glass, visible on any dark bg */}
          <CloseButton
            onClick={() => setLightboxPhoto(null)}
            variant="light"
            magnetic
            className="absolute right-4 top-4 z-20"
            aria-label="Close"
          />

          {/* Full image — object-contain, no cropping */}
          <img
            src={lightboxPhoto.src}
            alt={lightboxPhoto.title}
            className="max-h-[82vh] max-w-full rounded-media object-contain shadow-[0_24px_64px_rgba(0,0,0,0.6)]"
            onClick={(e) => e.stopPropagation()}
          />
          {/* Caption */}
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
