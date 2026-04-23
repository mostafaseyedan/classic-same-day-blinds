import { useState, useRef, useCallback, useEffect } from 'react';

interface Product {
  id: number;
  name: string;
  image: string;
  colorOptions: { name: string; hex: string }[];
}

interface OverlayState {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface VisualizerCanvasProps {
  uploadedImage: string | null;
  selectedProduct: Product | null;
  selectedColor: string;
  opacity: number;
}

type DragMode = 'move' | 'resize-se' | 'resize-sw' | 'resize-ne' | 'resize-nw' | null;

export default function VisualizerCanvas({
  uploadedImage,
  selectedProduct,
  selectedColor,
  opacity,
}: VisualizerCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [overlay, setOverlay] = useState<OverlayState>({ x: 80, y: 40, width: 240, height: 340 });
  const dragRef = useRef<{
    mode: DragMode;
    startX: number;
    startY: number;
    startOverlay: OverlayState;
  } | null>(null);

  const getRelativePos = (e: MouseEvent | React.MouseEvent, container: HTMLElement) => {
    const rect = container.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!dragRef.current || !containerRef.current) return;
    const { mode, startX, startY, startOverlay } = dragRef.current;
    const pos = getRelativePos(e, containerRef.current);
    const dx = pos.x - startX;
    const dy = pos.y - startY;
    const minSize = 60;

    setOverlay((prev) => {
      if (mode === 'move') {
        return { ...prev, x: startOverlay.x + dx, y: startOverlay.y + dy };
      }
      if (mode === 'resize-se') {
        return {
          ...prev,
          width: Math.max(minSize, startOverlay.width + dx),
          height: Math.max(minSize, startOverlay.height + dy),
        };
      }
      if (mode === 'resize-sw') {
        const newWidth = Math.max(minSize, startOverlay.width - dx);
        return {
          ...prev,
          x: startOverlay.x + startOverlay.width - newWidth,
          width: newWidth,
          height: Math.max(minSize, startOverlay.height + dy),
        };
      }
      if (mode === 'resize-ne') {
        const newHeight = Math.max(minSize, startOverlay.height - dy);
        return {
          ...prev,
          y: startOverlay.y + startOverlay.height - newHeight,
          width: Math.max(minSize, startOverlay.width + dx),
          height: newHeight,
        };
      }
      if (mode === 'resize-nw') {
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
  }, []);

  const handleMouseUp = useCallback(() => {
    dragRef.current = null;
  }, []);

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  const startDrag = (mode: DragMode, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!containerRef.current) return;
    const pos = getRelativePos(e, containerRef.current);
    dragRef.current = { mode, startX: pos.x, startY: pos.y, startOverlay: { ...overlay } };
  };

  const handleContainerMouseDown = (e: React.MouseEvent) => {
    // Clicking outside the overlay does nothing
    if (e.target === containerRef.current) {
      dragRef.current = null;
    }
  };

  if (!uploadedImage) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <i className="ri-image-add-line text-3xl text-gray-400"></i>
        </div>
        <p className="text-gray-500 font-medium text-sm">Upload a photo to begin</p>
        <p className="text-gray-400 text-xs mt-1">Your room photo will appear here</p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full rounded-xl overflow-hidden select-none"
      onMouseDown={handleContainerMouseDown}
      style={{ cursor: 'default' }}
    >
      {/* Room background */}
      <img
        src={uploadedImage}
        alt="Room"
        className="w-full h-full object-cover object-top"
        draggable={false}
      />

      {/* Product overlay */}
      {selectedProduct && (
        <div
          className="absolute group"
          style={{
            left: overlay.x,
            top: overlay.y,
            width: overlay.width,
            height: overlay.height,
            cursor: 'move',
            userSelect: 'none',
          }}
          onMouseDown={(e) => startDrag('move', e)}
        >
          {/* Product image with color tint */}
          <div
            className="w-full h-full rounded overflow-hidden relative"
            style={{ opacity }}
          >
            <img
              src={selectedProduct.image}
              alt={selectedProduct.name}
              className="w-full h-full object-cover object-top"
              draggable={false}
            />
            {/* Color tint overlay */}
            <div
              className="absolute inset-0 mix-blend-multiply rounded"
              style={{ backgroundColor: selectedColor + '60' }}
            ></div>
          </div>

          {/* Border indicator */}
          <div className="absolute inset-0 border-2 border-white/60 rounded pointer-events-none group-hover:border-emerald-400 transition-colors"></div>

          {/* Label */}
          <div className="absolute -top-7 left-0 right-0 flex justify-center pointer-events-none">
            <span className="bg-emerald-600 text-white text-xs font-bold px-2 py-0.5 rounded-full whitespace-nowrap shadow">
              {selectedProduct.name}
            </span>
          </div>

          {/* Resize handles */}
          {(['se', 'sw', 'ne', 'nw'] as const).map((dir) => {
            const isBottom = dir.startsWith('s');
            const isRight = dir.endsWith('e');
            const cursors: Record<string, string> = {
              se: 'nwse-resize', sw: 'nesw-resize', ne: 'nesw-resize', nw: 'nwse-resize',
            };
            return (
              <div
                key={dir}
                className="absolute w-4 h-4 bg-white border-2 border-emerald-500 rounded-sm opacity-0 group-hover:opacity-100 transition-opacity z-10"
                style={{
                  bottom: isBottom ? -6 : 'auto',
                  top: !isBottom ? -6 : 'auto',
                  right: isRight ? -6 : 'auto',
                  left: !isRight ? -6 : 'auto',
                  cursor: cursors[dir],
                }}
                onMouseDown={(e) => startDrag(`resize-${dir}` as DragMode, e)}
              ></div>
            );
          })}
        </div>
      )}

      {/* Instructions hint */}
      {selectedProduct && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/60 text-white text-xs px-3 py-1.5 rounded-full pointer-events-none whitespace-nowrap">
          Drag to move · Drag corners to resize
        </div>
      )}

      {/* No product selected hint */}
      {!selectedProduct && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/10">
          <div className="bg-white/90 rounded-xl px-6 py-4 text-center">
            <i className="ri-layout-line text-3xl text-emerald-600 block mb-2"></i>
            <p className="text-sm font-semibold text-gray-800">Select a product from the panel</p>
            <p className="text-xs text-gray-500 mt-1">to overlay it on your window</p>
          </div>
        </div>
      )}
    </div>
  );
}
