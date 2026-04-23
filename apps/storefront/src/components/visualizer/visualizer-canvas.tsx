"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type PreviewMode = "horizontal" | "vertical";

type OverlayState = {
  x: number;
  y: number;
  width: number;
  height: number;
};

type DragMode = "move" | "resize-se" | "resize-sw" | "resize-ne" | "resize-nw" | null;

type VisualizerCanvasProps = {
  uploadedImage: string | null;
  roomGradient: string;
  treatmentLabel: string;
  previewMode: PreviewMode;
  selectedColor: string;
  opacity: number;
  hasSelection?: boolean;
  overlayImage?: string;
  overlayObjectPosition?: string;
  overlayScale?: number;
};

export function VisualizerCanvas({
  uploadedImage,
  roomGradient,
  treatmentLabel,
  previewMode,
  selectedColor,
  opacity,
  hasSelection = true,
  overlayImage,
  overlayObjectPosition = "50% 50%",
  overlayScale = 1,
}: VisualizerCanvasProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [overlay, setOverlay] = useState<OverlayState>({ x: 110, y: 64, width: 250, height: 290 });
  const dragRef = useRef<{
    mode: DragMode;
    startX: number;
    startY: number;
    startOverlay: OverlayState;
  } | null>(null);

  const getRelativePos = useCallback(
    (event: MouseEvent | React.MouseEvent, container: HTMLElement) => {
      const rect = container.getBoundingClientRect();
      return { x: event.clientX - rect.left, y: event.clientY - rect.top };
    },
    [],
  );

  const handleMouseMove = useCallback(
    (event: MouseEvent) => {
      if (!dragRef.current || !containerRef.current) {
        return;
      }

      const { mode, startX, startY, startOverlay } = dragRef.current;
      const pos = getRelativePos(event, containerRef.current);
      const dx = pos.x - startX;
      const dy = pos.y - startY;
      const minSize = 60;

      setOverlay((prev) => {
        if (mode === "move") {
          return { ...prev, x: startOverlay.x + dx, y: startOverlay.y + dy };
        }

        if (mode === "resize-se") {
          return {
            ...prev,
            width: Math.max(minSize, startOverlay.width + dx),
            height: Math.max(minSize, startOverlay.height + dy),
          };
        }

        if (mode === "resize-sw") {
          const newWidth = Math.max(minSize, startOverlay.width - dx);
          return {
            ...prev,
            x: startOverlay.x + startOverlay.width - newWidth,
            width: newWidth,
            height: Math.max(minSize, startOverlay.height + dy),
          };
        }

        if (mode === "resize-ne") {
          const newHeight = Math.max(minSize, startOverlay.height - dy);
          return {
            ...prev,
            y: startOverlay.y + startOverlay.height - newHeight,
            width: Math.max(minSize, startOverlay.width + dx),
            height: newHeight,
          };
        }

        if (mode === "resize-nw") {
          const newWidth = Math.max(minSize, startOverlay.width - dx);
          const newHeight = Math.max(minSize, startOverlay.height - dy);
          return {
            ...prev,
            x: startOverlay.x + startOverlay.width - newWidth,
            y: startOverlay.y + startOverlay.height - newHeight,
            width: newWidth,
            height: newHeight,
          };
        }

        return prev;
      });
    },
    [getRelativePos],
  );

  const handleMouseUp = useCallback(() => {
    dragRef.current = null;
  }, []);

  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  function startDrag(mode: DragMode, event: React.MouseEvent) {
    event.preventDefault();
    event.stopPropagation();

    if (!containerRef.current) {
      return;
    }

    const pos = getRelativePos(event, containerRef.current);
    dragRef.current = { mode, startX: pos.x, startY: pos.y, startOverlay: { ...overlay } };
  }

  const overlayBackground =
    previewMode === "vertical"
      ? `repeating-linear-gradient(90deg, ${selectedColor}, ${selectedColor} 18px, rgba(255,255,255,0.24) 18px, rgba(255,255,255,0.24) 24px)`
      : `repeating-linear-gradient(180deg, ${selectedColor}, ${selectedColor} 12px, rgba(255,255,255,0.22) 12px, rgba(255,255,255,0.22) 18px)`;

  return (
    <div ref={containerRef} className="relative overflow-hidden rounded-media bg-shell">
      <div className="aspect-[16/10]">
        {uploadedImage ? (
          <img src={uploadedImage} alt="Uploaded room" className="h-full w-full object-cover" />
        ) : (
          <div className={`h-full w-full bg-gradient-to-br ${roomGradient}`}>
            <div className="flex h-full items-end justify-between px-12 pb-12">
              <div className="h-52 w-44 rounded-t-[6rem] border-4 border-white/75 bg-white/55" />
              <div className="h-32 w-64 rounded-[2rem] bg-white/45" />
            </div>
          </div>
        )}
      </div>

      {hasSelection ? (
        <>
          <div
            className="absolute group rounded-full"
            style={{
              left: overlay.x,
              top: overlay.y,
              width: overlay.width,
              height: overlay.height,
              cursor: "move",
              userSelect: "none",
            }}
            onMouseDown={(event) => startDrag("move", event)}
          >
            <div
              className="relative h-full w-full overflow-hidden rounded-full"
              style={{ opacity: opacity / 100 }}
            >
              {overlayImage ? (
                <img
                  src={overlayImage}
                  alt={treatmentLabel}
                  className="h-full w-full object-cover"
                  style={{
                    objectPosition: overlayObjectPosition,
                    transform: `scale(${overlayScale})`,
                    transformOrigin: "center center",
                    mixBlendMode: "multiply",
                  }}
                  draggable={false}
                />
              ) : (
                <div className="h-full w-full" style={{ background: overlayBackground }} />
              )}
              <div
                className="absolute inset-0 mix-blend-multiply"
                style={{ backgroundColor: `${selectedColor}66` }}
              />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.28),transparent_55%)]" />
            </div>

            <div className="pointer-events-none absolute inset-0 rounded-full border-2 border-white/70 transition group-hover:border-emerald-400" />

            <div className="absolute -top-8 left-0 right-0 flex justify-center pointer-events-none">
              <span className="rounded-full bg-emerald-600 px-3 py-1 text-xs font-bold text-white shadow">
                {treatmentLabel}
              </span>
            </div>

            {(["se", "sw", "ne", "nw"] as const).map((dir) => {
              const isBottom = dir.startsWith("s");
              const isRight = dir.endsWith("e");
              const cursors: Record<string, string> = {
                se: "nwse-resize",
                sw: "nesw-resize",
                ne: "nesw-resize",
                nw: "nwse-resize",
              };

              return (
                <div
                  key={dir}
                  className="absolute z-10 h-4 w-4 border-2 border-emerald-500 bg-white opacity-0 transition group-hover:opacity-100"
                  style={{
                    bottom: isBottom ? -6 : "auto",
                    top: !isBottom ? -6 : "auto",
                    right: isRight ? -6 : "auto",
                    left: !isRight ? -6 : "auto",
                    cursor: cursors[dir],
                  }}
                  onMouseDown={(event) => startDrag(`resize-${dir}` as DragMode, event)}
                />
              );
            })}
          </div>

          <div className="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-black/60 px-3 py-1.5 text-xs text-white">
            Drag to move · Drag corners to resize
          </div>
        </>
      ) : (
        <div className="absolute inset-0 flex items-center justify-center bg-black/10">
          <div className="rounded-full bg-white/90 px-5 py-4 text-center text-sm text-slate">
            Select a product from the panel to preview it.
          </div>
        </div>
      )}
    </div>
  );
}
