"use client";
import { Badge, Button } from "@blinds/ui";

import Link from "next/link";
import type { ReactNode } from "react";
import { useRef, useState } from "react";

import { VisualizerCanvas } from "@/components/visualizer/visualizer-canvas";
import { formatPrice } from "@/lib/format-price";
import type { CatalogProduct } from "@/lib/medusa/catalog";

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

function getPreviewMode(product: CatalogProduct) {
  const key =
    `${product.slug} ${product.name} ${product.categoryHandle ?? ""} ${product.categoryLabel}`.toLowerCase();
  return key.includes("vertical") ? "vertical" : "horizontal";
}

function getVisualizerProductImage(product: CatalogProduct) {
  const key =
    `${product.slug} ${product.name} ${product.categoryHandle ?? ""} ${product.categoryLabel}`.toLowerCase();

  if (key.includes("aluminum")) {
    return "/images/home/prod-aluminum-isolated.png";
  }

  if (key.includes("faux") || key.includes("wood")) {
    return "/images/home/prod-fauxwood-isolated.png";
  }

  if (key.includes("vertical")) {
    return "/images/home/prod-vertical-isolated.png";
  }

  if (key.includes("roller")) {
    return "/images/home/prod-roller-isolated.png";
  }

  if (key.includes("vinyl") || key.includes("mini")) {
    return "/images/home/prod-vinyl-isolated.png";
  }

  return (
    product.images.find((image) => /front|isolated|\.svg($|\?)/i.test(image)) ??
    product.image
  );
}

function EyebrowLabel({ children }: { children: ReactNode }) {
  return (
    <p className="flex items-center gap-3 text-[0.62rem] font-semibold uppercase tracking-[0.2em] text-olive">
      <span className="block h-px w-6 bg-olive" />
      {children}
    </p>
  );
}

export function RoomVisualizerStudio({ products }: { products: CatalogProduct[] }) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [selectedRoom, setSelectedRoom] = useState(0);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
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
    setSelectedProductId(null);
    setOpacity(82);
  }

  const activeRoom = sampleRooms[selectedRoom];
  const activeProduct = products.find((product) => product.id === selectedProductId) ?? null;
  const activePreviewMode = activeProduct ? getPreviewMode(activeProduct) : "horizontal";
  const activeProductImage = activeProduct ? getVisualizerProductImage(activeProduct) : undefined;

  return (
    <section>
      <div className="space-y-6">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.55fr)_minmax(16rem,0.45fr)]">
          <div className="space-y-4">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />

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
                <>
                  <VisualizerCanvas
                    uploadedImage={uploadedImage}
                    roomGradient={activeRoom.gradient}
                    treatmentLabel={activeProduct?.name ?? "Selected product"}
                    previewMode={activePreviewMode}
                    selectedColor="#ffffff"
                    opacity={opacity}
                    hasSelection={Boolean(activeProduct)}
                    overlayImage={activeProductImage}
                    overlayObjectPosition="50% 50%"
                    overlayScale={1}
                  />
                  <Button
                    variant="secondary"
                    type="button"
                    onClick={handleReset}
                    className="absolute right-4 top-4"
                  >
                    Start Over
                  </Button>
                </>
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
              <p className="text-sm font-semibold text-slate">
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
              <EyebrowLabel>Tips for best results</EyebrowLabel>
              <p className="mt-2 max-w-[36rem] text-sm leading-6 text-slate/72">
                Take the photo straight on, not at an angle. Include the full window frame in the
                shot. Use good natural or room lighting. Drag corners to resize the overlay.
              </p>
            </div>
          </div>

          <aside className="space-y-5">
            <div className="space-y-3">
              <p className="text-sm font-semibold text-slate">Select a Product</p>
              <div className="grid gap-2 rounded-media bg-shell p-2">
                {products.map((product) => {
                  const isSelected = product.id === selectedProductId;
                  const disabled = !uploadedImage;
                  const productImage = getVisualizerProductImage(product);

                  return (
                    <button
                      key={product.id}
                      type="button"
                      onClick={() => {
                        if (!uploadedImage) return;
                        setSelectedProductId(product.id);
                      }}
                      className={`flex items-center gap-3 px-3 py-2 text-left transition ${
                        isSelected ? "border-l-2 border-olive bg-olive/6" : ""
                      } ${disabled ? "opacity-50" : ""}`}
                    >
                      <div className="h-12 w-12 overflow-hidden rounded-media bg-shell">
                        <img
                          src={productImage}
                          alt={product.name}
                          className="h-full w-full object-contain object-center"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-slate">{product.name}</p>
                        <div className="mt-1 flex items-center justify-between gap-3">
                          <p className="text-xs text-slate/60">
                            {formatPrice(product.price, product.currencyCode)}
                          </p>
                          {isSelected ? (
                            <Badge variant="soft-olive" className="shrink-0">
                              Selected
                            </Badge>
                          ) : null}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {products.length === 0 ? (
                <p className="text-[0.72rem] text-slate/50">
                  No catalog products are currently available.
                </p>
              ) : null}

              {!uploadedImage ? (
                <p className="text-[0.72rem] text-slate/50">
                  Upload a room photo first to enable product selection.
                </p>
              ) : null}
            </div>

            <div className="grid gap-4">
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

              {activeProduct ? (
                <div className="border-t border-black/8 pt-4">
                  <p className="text-sm font-semibold text-slate">Love how it looks?</p>
                  <p className="mt-1 text-xs leading-5 text-slate/60">
                    Order custom-made to fit your window size.
                  </p>
                  <div className="mt-3 grid gap-2">
                    <Button
                      asChild
                      variant="default"
                      className="w-full justify-center"
                    >
                      <Link href={`/products/${activeProduct.slug}#add-to-cart`}>
                        Order
                      </Link>
                    </Button>
                    <Button
                      asChild
                      variant="secondary"
                      className="w-full justify-center"
                    >
                      <Link href="/free-sample">
                        Request Free Sample
                      </Link>
                    </Button>
                  </div>
                </div>
              ) : null}

              {activeProduct ? (
                <div className="text-sm leading-6 text-slate/72">
                  <p className="font-semibold text-slate">{activeProduct.name}</p>
                  <p className="mt-2">
                    {activeProduct.description || activeProduct.categoryLabel}
                  </p>
                  {activeProduct.highlights.length > 0 ? (
                    <p className="mt-2">{activeProduct.highlights.join(" · ")}</p>
                  ) : null}
                </div>
              ) : null}
            </div>
          </aside>
        </div>

      </div>
    </section>
  );
}
