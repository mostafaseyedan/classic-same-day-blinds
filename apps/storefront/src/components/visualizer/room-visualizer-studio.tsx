"use client";
import { Button } from "@blinds/ui";
import { Select } from "@blinds/ui";
import { SectionPanel } from "@blinds/ui";

import Link from "next/link";
import { useRef, useState } from "react";

import {
  legacyProductAttributeReference,
  visualizerProductReferences,
} from "@/lib/legacy-reference";
import { VisualizerCanvas } from "@/components/visualizer/visualizer-canvas";

const sampleRooms = [
  {
    label: "Living room",
    gradient: "from-[#dfe5e3] to-[#f4ede3]",
    image: "/images/home/viz-room-1.png",
  },
  {
    label: "Bedroom",
    gradient: "from-[#cfd7df] to-[#e9ecf1]",
    image: "/images/home/viz-room-2.png",
  },
  {
    label: "Office",
    gradient: "from-[#d8ddd8] to-[#eef0ec]",
    image: "/images/home/viz-room-3.png",
  },
  {
    label: "Kitchen",
    gradient: "from-[#eee6d8] to-[#f8f3ec]",
    image: "/images/home/viz-room-4.png",
  },
];

const visualizerProductImages: Record<string, string> = {
  "vinyl-blinds": "/images/home/prod-vinyl-isolated.png",
  "faux-wood": "/images/home/prod-fauxwood-isolated.png",
  vertical: "/images/home/prod-vertical-isolated.png",
  "blackout-roller": "/images/home/prod-roller-isolated.png",
};

const visualizerProductPrices: Record<string, number> = {
  "vinyl-blinds": 27.1,
  "faux-wood": 41.73,
  vertical: 18.78,
  "blackout-roller": 36.71,
};

const visualizerProductSlugs: Record<string, string> = {
  "vinyl-blinds": "vinyl-blinds",
  "faux-wood": "faux-wood-blinds",
  vertical: "vertical-blinds",
  "blackout-roller": "vinyl-blinds",
};

const visualizerOverlayPresets: Record<
  string,
  { objectPosition: string; scale: number }
> = {
  "vinyl-blinds": { objectPosition: "50% 50%", scale: 1.2 },
  "faux-wood": { objectPosition: "50% 50%", scale: 1.2 },
  vertical: { objectPosition: "50% 50%", scale: 1.2 },
  "blackout-roller": { objectPosition: "50% 50%", scale: 1.2 },
};

export function RoomVisualizerStudio() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [selectedRoom, setSelectedRoom] = useState(0);
  const [selectedStyle, setSelectedStyle] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string>(
    visualizerProductReferences[0].defaultColors[0],
  );
  const [opacity, setOpacity] = useState(82);
  const [isDraggingFile, setIsDraggingFile] = useState(false);

  function loadImageFile(file: File) {
    if (!file.type.startsWith("image/")) {
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setUploadedImage(typeof reader.result === "string" ? reader.result : null);
    };
    reader.readAsDataURL(file);
  }

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    loadImageFile(file);
  }

  function handleDrop(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDraggingFile(false);
    const file = event.dataTransfer.files?.[0];
    if (file) loadImageFile(file);
  }

  function handleReset() {
    setUploadedImage(null);
    setSelectedStyle(null);
    setSelectedColor(visualizerProductReferences[0].defaultColors[0]);
    setOpacity(82);
  }

  const activeRoom = sampleRooms[selectedRoom];
  const activeTreatment =
    visualizerProductReferences.find((entry) => entry.key === selectedStyle) ??
    visualizerProductReferences[0];

  const visualizerProducts = visualizerProductReferences.map((entry) => ({
    ...entry,
    image: visualizerProductImages[entry.key] ?? "/images/home/rev-prod-default.jpg",
    price: visualizerProductPrices[entry.key] ?? 29,
  }));

  const activeAttributes =
    legacyProductAttributeReference.find((entry) => entry.category === activeTreatment.category) ??
    legacyProductAttributeReference[0];

  return (
    <SectionPanel as="section" className="px-6 py-6">
      <div className="space-y-6">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.55fr)_minmax(16rem,0.45fr)]">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate">Visualizer Studio</p>
                <p className="mt-1 text-sm text-slate/68">
                  Upload a room photo or test the layout with a sample scene.
                </p>
              </div>

              <div className="flex items-center gap-3">
                {uploadedImage ? (
                  <Button variant="secondary" type="button" onClick={handleReset}>
                    Start Over
                  </Button>
                ) : null}

                <Button variant="default"
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  
                >
                  Upload Photo
                </Button>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>

            <div
              className={`relative overflow-hidden rounded-media bg-shell ${
                isDraggingFile ? "ring-2 ring-olive/50" : ""
              }`}
              onDragOver={(event) => {
                event.preventDefault();
                setIsDraggingFile(true);
              }}
              onDragLeave={() => setIsDraggingFile(false)}
              onDrop={handleDrop}
            >
              {uploadedImage ? (
                <VisualizerCanvas
                  uploadedImage={uploadedImage}
                  roomGradient={activeRoom.gradient}
                  treatmentLabel={activeTreatment.label}
                  previewMode={activeTreatment.previewMode}
                  selectedColor={selectedColor}
                  opacity={opacity}
                  hasSelection={Boolean(selectedStyle)}
                  overlayImage={visualizerProductImages[activeTreatment.key]}
                  overlayObjectPosition={
                    visualizerOverlayPresets[activeTreatment.key]?.objectPosition ?? "50% 50%"
                  }
                  overlayScale={visualizerOverlayPresets[activeTreatment.key]?.scale ?? 1}
                />
              ) : (
                <div className="flex min-h-[22rem] flex-col items-center justify-center text-center">
                  <p className="text-sm font-semibold text-slate">Drop your room photo here</p>
                  <p className="mt-1 text-xs text-slate/50">Or choose a sample room below.</p>
                  <Button variant="default"
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    
                  >
                    Upload Your Photo
                  </Button>
                  <p className="mt-3 text-[0.7rem] uppercase tracking-[0.14em] text-slate/40">
                    JPG, PNG, WebP · Max 10MB
                  </p>
                </div>
              )}
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate/60">
                {uploadedImage ? "Switch room" : "Try with a sample room"}
              </p>
              <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-4">
                {sampleRooms.map((room, index) => {
                  const isSelected = uploadedImage === room.image;
                  return (
                    <button
                      key={room.label}
                      type="button"
                      onClick={() => {
                        setSelectedRoom(index);
                        setUploadedImage(room.image);
                      }}
                      className={`group relative overflow-hidden rounded-media transition-all ${
                        isSelected ? "ring-2 ring-olive ring-offset-2" : "bg-white/70 hover:bg-white"
                      }`}
                    >
                      <img
                        src={room.image}
                        alt={room.label}
                        className={`h-20 w-full object-cover object-center transition ${
                          isSelected ? "opacity-100" : "opacity-70 group-hover:opacity-100"
                        }`}
                      />
                      <div className={`absolute inset-x-0 bottom-0 px-2 py-1 text-[0.65rem] font-bold text-white transition ${
                        isSelected ? "bg-olive font-bold" : "bg-black/40 group-hover:bg-black/60"
                      }`}>
                        {room.label}
                      </div>
                      {isSelected && (
                        <div className="absolute right-1 top-1">
                          <div className="rounded-full bg-olive p-0.5 text-white shadow-sm">
                            <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                          </div>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="w-full">
              <p className="text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-brass">
                Tips for best results
              </p>
              <p className="mt-2 max-w-[36rem] text-sm leading-6 text-slate/72">
                Take the photo straight on, not at an angle. Include the full window frame in the
                shot. Use good natural or room lighting. Drag corners to resize the overlay.
              </p>
            </div>
          </div>

          <aside className="space-y-5">
            <div className="space-y-3">
              <p className="text-sm font-semibold text-slate">Select a Product</p>
              <div className="grid gap-2">
                {visualizerProducts.map((product) => {
                  const isSelected = product.key === selectedStyle;
                  const disabled = !uploadedImage;

                  return (
                    <button
                      key={product.key}
                      type="button"
                      onClick={() => {
                        if (!uploadedImage) return;
                        setSelectedStyle(product.key);
                        setSelectedColor(product.defaultColors[0]);
                      }}
                      className={`flex items-center gap-3 rounded-media px-3 py-2 text-left transition ${
                        isSelected
                          ? "bg-shell"
                          : disabled
                            ? "opacity-50"
                            : "bg-white/70 hover:bg-white"
                      }`}
                    >
                      <div className="h-12 w-12 overflow-hidden rounded-media bg-shell">
                        <img
                          src={product.image}
                          alt={product.label}
                          className="h-full w-full object-cover object-center"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-slate">{product.label}</p>
                        <p className="mt-1 text-xs text-slate/60">${product.price.toFixed(2)}</p>
                      </div>
                      {isSelected ? (
                        <span className="text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-olive">
                          Selected
                        </span>
                      ) : null}
                    </button>
                  );
                })}
              </div>

              {!uploadedImage ? (
                <p className="text-[0.72rem] text-slate/50">
                  Upload a room photo first to enable product selection.
                </p>
              ) : null}
            </div>

            <div className="grid gap-4">
              <label className="grid gap-2">
                <span className="text-sm font-semibold text-slate">Treatment style</span>
                <Select
                  value={selectedStyle ?? ""}
                  onChange={(event) => {
                    const nextKey = event.target.value;
                    const nextTreatment =
                      visualizerProductReferences.find((entry) => entry.key === nextKey) ??
                      visualizerProductReferences[0];
                    setSelectedStyle(nextKey);
                    setSelectedColor(nextTreatment.defaultColors[0]);
                  }}
                  disabled={!uploadedImage}
                >
                  <option value="" disabled>
                    Select a product
                  </option>
                  {visualizerProductReferences.map((style) => (
                    <option key={style.key} value={style.key}>
                      {style.label}
                    </option>
                  ))}
                </Select>
              </label>

              <div>
                <p className="text-sm font-semibold text-slate">Color</p>
                <div className="mt-3 flex flex-wrap gap-3">
                  {activeTreatment.defaultColors.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setSelectedColor(color)}
                      className={`h-9 w-9 rounded-full border-2 transition ${
                        selectedColor === color ? "border-olive scale-105" : "border-black/10"
                      }`}
                      style={{ backgroundColor: color }}
                      disabled={!uploadedImage}
                    />
                  ))}
                </div>
              </div>

              <label className="grid gap-2">
                <span className="text-sm font-semibold text-slate">Opacity</span>
                <input
                  type="range"
                  min={25}
                  max={100}
                  value={opacity}
                  onChange={(event) => setOpacity(Number(event.target.value))}
                  className="accent-olive"
                  disabled={!uploadedImage}
                />
                <span className="text-sm text-slate/68">{opacity}%</span>
              </label>

              {selectedStyle ? (
                <div className="rounded-full bg-olive px-4 py-4 text-shell">
                  <p className="text-sm font-semibold text-white">Love how it looks?</p>
                  <p className="mt-1 text-xs text-white/70">
                    Order custom-made to fit your window size.
                  </p>
                  <Button asChild variant="secondary"><Link
                    href={`/products/${visualizerProductSlugs[activeTreatment.key] ?? "vinyl-blinds"}#add-to-cart`}
                    className="-compact mt-3 w-full justify-center bg-white text-olive"
                  >
                    Order {activeTreatment.label}
                  </Link></Button>
                  <Button asChild variant="secondary"><Link
                    href="/free-sample"
                    className="-light mt-2 w-full justify-center"
                  >
                    Request Free Sample
                  </Link></Button>
                </div>
              ) : null}

              <div className="text-sm leading-6 text-slate/72">
                <p className="font-semibold text-slate">{activeTreatment.label}</p>
                <p className="mt-2">{activeTreatment.notes}</p>
                <p className="mt-3 text-xs font-semibold uppercase tracking-[0.14em] text-brass">
                  Legacy attribute reference
                </p>
                <p className="mt-2">{activeAttributes.materials.join(" · ")}</p>
                <p className="mt-2">{activeAttributes.sizeNotes.join(" · ")}</p>
              </div>
            </div>
          </aside>
        </div>

      </div>
    </SectionPanel>
  );
}
