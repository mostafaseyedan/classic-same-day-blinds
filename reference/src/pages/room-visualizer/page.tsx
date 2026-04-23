import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { products } from '../../mocks/products';
import VisualizerCanvas from './components/VisualizerCanvas';

const VISUALIZER_PRODUCTS = products.slice(0, 6);

const SAMPLE_ROOMS = [
  {
    label: 'Bright Living Room',
    url: 'https://readdy.ai/api/search-image?query=bright%20airy%20modern%20living%20room%20interior%20with%20large%20white%20framed%20window%20bare%20window%20no%20blinds%20natural%20sunlight%20streaming%20in%20white%20walls%20light%20wood%20floors%20minimal%20furniture%20sofa%20neutral%20tones%20professional%20interior%20photography%20wide%20angle&width=800&height=560&seq=viz-room-1&orientation=landscape',
  },
  {
    label: 'Cozy Bedroom',
    url: 'https://readdy.ai/api/search-image?query=cozy%20minimalist%20bedroom%20interior%20with%20large%20single%20window%20bare%20no%20curtains%20white%20walls%20soft%20morning%20light%20neutral%20bedding%20wooden%20nightstand%20clean%20tidy%20professional%20interior%20photography%20wide%20angle&width=800&height=560&seq=viz-room-2&orientation=landscape',
  },
  {
    label: 'Modern Home Office',
    url: 'https://readdy.ai/api/search-image?query=modern%20clean%20home%20office%20with%20large%20window%20bare%20no%20blinds%20white%20walls%20wooden%20desk%20computer%20minimal%20decor%20natural%20daylight%20professional%20interior%20photography%20wide%20angle%20bright&width=800&height=560&seq=viz-room-3&orientation=landscape',
  },
  {
    label: 'Bright Kitchen',
    url: 'https://readdy.ai/api/search-image?query=bright%20modern%20kitchen%20with%20window%20above%20sink%20bare%20no%20window%20treatment%20white%20cabinets%20marble%20countertops%20natural%20light%20professional%20interior%20photography%20wide%20angle%20minimal&width=800&height=560&seq=viz-room-4&orientation=landscape',
  },
];

export default function RoomVisualizerPage() {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
  const [selectedColor, setSelectedColor] = useState('#FFFFFF');
  const [opacity, setOpacity] = useState(0.88);
  const [isDraggingFile, setIsDraggingFile] = useState(false);
  const [activeStep, setActiveStep] = useState<1 | 2 | 3>(1);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const selectedProduct = VISUALIZER_PRODUCTS.find((p) => p.id === selectedProductId) ?? null;

  const handleFileUpload = (file: File) => {
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      setUploadedImage(e.target?.result as string);
      setActiveStep(2);
    };
    reader.readAsDataURL(file);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileUpload(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingFile(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFileUpload(file);
  };

  const handleUseSample = (url: string) => {
    setUploadedImage(url);
    setActiveStep(2);
  };

  const handleSelectProduct = (id: number) => {
    setSelectedProductId(id);
    const product = VISUALIZER_PRODUCTS.find((p) => p.id === id);
    if (product?.colorOptions?.[0]) setSelectedColor(product.colorOptions[0].hex);
    setActiveStep(3);
  };

  const handleReset = () => {
    setUploadedImage(null);
    setSelectedProductId(null);
    setSelectedColor('#FFFFFF');
    setOpacity(0.88);
    setActiveStep(1);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2 text-gray-900 hover:text-emerald-600 transition-colors cursor-pointer">
              <i className="ri-arrow-left-line text-xl"></i>
              <span className="font-semibold text-base">Back to Home</span>
            </Link>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 flex items-center justify-center bg-emerald-100 rounded-lg">
                <i className="ri-window-line text-emerald-600 text-lg"></i>
              </div>
              <span className="font-bold text-gray-900 text-base">Room Visualizer</span>
            </div>
            <Link to="/products" className="flex items-center gap-2 text-gray-900 hover:text-emerald-600 transition-colors cursor-pointer whitespace-nowrap">
              <i className="ri-shopping-bag-line text-xl"></i>
              <span className="font-semibold text-base">Shop Products</span>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero bar */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 py-5 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-white">Room Visualizer</h1>
            <p className="text-emerald-100 text-sm mt-0.5">See how our blinds &amp; shades look in your actual space before you buy</p>
          </div>
          <div className="hidden md:flex items-center gap-6 text-sm text-emerald-100">
            {[
              { step: 1, label: 'Upload Photo', icon: 'ri-upload-cloud-line' },
              { step: 2, label: 'Pick Product', icon: 'ri-layout-line' },
              { step: 3, label: 'Customize', icon: 'ri-settings-4-line' },
            ].map((s) => (
              <div key={s.step} className={`flex items-center gap-2 ${activeStep >= s.step ? 'text-white' : 'opacity-50'}`}>
                <div className={`w-7 h-7 rounded-full flex items-center justify-center border-2 transition-all ${activeStep >= s.step ? 'bg-white border-white' : 'border-emerald-300'}`}>
                  {activeStep > s.step ? (
                    <i className="ri-check-line text-emerald-600 text-xs font-bold"></i>
                  ) : (
                    <span className="text-xs font-bold text-emerald-700">{s.step}</span>
                  )}
                </div>
                <span className="font-medium">{s.label}</span>
                {s.step < 3 && <i className="ri-arrow-right-line text-emerald-300 ml-2"></i>}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-[1fr_320px] gap-6">
          {/* Canvas area */}
          <div className="flex flex-col gap-4">
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              {/* Canvas header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                <span className="text-sm font-semibold text-gray-700">Preview</span>
                <div className="flex items-center gap-2">
                  {uploadedImage && (
                    <button
                      onClick={handleReset}
                      className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-red-500 transition-colors cursor-pointer whitespace-nowrap"
                    >
                      <i className="ri-refresh-line"></i>
                      Start Over
                    </button>
                  )}
                  {selectedProduct && (
                    <Link
                      to={`/product/${selectedProduct.id}`}
                      className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 hover:text-emerald-700 transition-colors whitespace-nowrap cursor-pointer"
                    >
                      <i className="ri-external-link-line"></i>
                      View Product
                    </Link>
                  )}
                </div>
              </div>

              {/* Canvas */}
              <div className="relative" style={{ height: 480 }}>
                {!uploadedImage ? (
                  /* Upload area */
                  <div
                    className={`h-full flex flex-col items-center justify-center transition-all ${isDraggingFile ? 'bg-emerald-50' : 'bg-gray-50'}`}
                    onDragOver={(e) => { e.preventDefault(); setIsDraggingFile(true); }}
                    onDragLeave={() => setIsDraggingFile(false)}
                    onDrop={handleDrop}
                  >
                    <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-4 transition-all ${isDraggingFile ? 'bg-emerald-100' : 'bg-gray-100'}`}>
                      <i className={`ri-upload-cloud-2-line text-4xl ${isDraggingFile ? 'text-emerald-500' : 'text-gray-400'}`}></i>
                    </div>
                    <p className="text-gray-800 font-semibold mb-1">Drop your room photo here</p>
                    <p className="text-gray-400 text-sm mb-5">or choose from our sample rooms below</p>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center gap-2 bg-emerald-600 text-white px-6 py-3 rounded-xl font-semibold text-sm hover:bg-emerald-700 transition-colors whitespace-nowrap cursor-pointer"
                    >
                      <i className="ri-folder-image-line"></i>
                      Upload Your Photo
                    </button>
                    <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileInputChange} />
                    <p className="text-xs text-gray-400 mt-3">JPG, PNG, WebP · Max 10MB</p>
                  </div>
                ) : (
                  <VisualizerCanvas
                    uploadedImage={uploadedImage}
                    selectedProduct={selectedProduct}
                    selectedColor={selectedColor}
                    opacity={opacity}
                  />
                )}
              </div>
            </div>

            {/* Sample room photos */}
            {!uploadedImage && (
              <div>
                <p className="text-sm font-semibold text-gray-600 mb-3">
                  <i className="ri-image-2-line mr-1"></i>
                  Try with a sample room:
                </p>
                <div className="grid grid-cols-4 gap-3">
                  {SAMPLE_ROOMS.map((room) => (
                    <button
                      key={room.label}
                      onClick={() => handleUseSample(room.url)}
                      className="group relative rounded-xl overflow-hidden border-2 border-transparent hover:border-emerald-400 transition-all cursor-pointer"
                      style={{ aspectRatio: '16/10' }}
                    >
                      <img src={room.url} alt={room.label} className="w-full h-full object-cover object-top" />
                      <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
                        <span className="text-white text-xs font-semibold">{room.label}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Adjustment controls (shown when product selected) */}
            {uploadedImage && selectedProduct && (
              <div className="bg-white border border-gray-200 rounded-xl p-5">
                <h3 className="text-sm font-bold text-gray-800 mb-4">Adjustments</h3>
                <div className="grid grid-cols-2 gap-6">
                  {/* Opacity */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-semibold text-gray-600">Transparency</label>
                      <span className="text-xs text-gray-500">{Math.round(opacity * 100)}%</span>
                    </div>
                    <input
                      type="range"
                      min={20}
                      max={100}
                      value={Math.round(opacity * 100)}
                      onChange={(e) => setOpacity(Number(e.target.value) / 100)}
                      className="w-full h-1.5 rounded-full accent-emerald-600 cursor-pointer"
                    />
                  </div>
                  {/* Color picker */}
                  <div>
                    <label className="text-xs font-semibold text-gray-600 block mb-2">Color</label>
                    <div className="flex items-center gap-2 flex-wrap">
                      {selectedProduct.colorOptions.map((c) => (
                        <button
                          key={c.name}
                          title={c.name}
                          onClick={() => setSelectedColor(c.hex)}
                          className={`w-7 h-7 rounded-full border-2 transition-all cursor-pointer ${
                            selectedColor === c.hex ? 'border-emerald-500 scale-110' : 'border-gray-200 hover:border-gray-400'
                          }`}
                          style={{ backgroundColor: c.hex }}
                        ></button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right sidebar */}
          <div className="flex flex-col gap-5">
            {/* Product selector */}
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
                <h3 className="text-sm font-bold text-gray-800">
                  <i className="ri-layout-line mr-1.5 text-emerald-600"></i>
                  Select a Product
                </h3>
              </div>
              <div className="p-3 space-y-2 max-h-[420px] overflow-y-auto">
                {VISUALIZER_PRODUCTS.map((product) => {
                  const isSelected = product.id === selectedProductId;
                  return (
                    <button
                      key={product.id}
                      onClick={() => handleSelectProduct(product.id)}
                      disabled={!uploadedImage}
                      className={`w-full flex items-center gap-3 p-2.5 rounded-xl border-2 transition-all text-left cursor-pointer ${
                        isSelected
                          ? 'border-emerald-400 bg-emerald-50'
                          : uploadedImage
                          ? 'border-gray-100 hover:border-emerald-200 bg-white'
                          : 'border-gray-100 bg-gray-50 opacity-40 cursor-not-allowed'
                      }`}
                    >
                      <div className="w-14 h-14 rounded-lg overflow-hidden shrink-0 bg-gray-100">
                        <img src={product.image} alt={product.name} className="w-full h-full object-cover object-top" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-xs font-bold truncate ${isSelected ? 'text-emerald-700' : 'text-gray-900'}`}>
                          {product.name}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">${product.price.toFixed(2)}</p>
                        <div className="flex items-center gap-1 mt-1">
                          {product.colorOptions.slice(0, 4).map((c) => (
                            <span
                              key={c.name}
                              className="w-3.5 h-3.5 rounded-full border border-gray-200 inline-block"
                              style={{ backgroundColor: c.hex }}
                              title={c.name}
                            ></span>
                          ))}
                        </div>
                      </div>
                      {isSelected && (
                        <div className="w-5 h-5 flex items-center justify-center bg-emerald-500 rounded-full shrink-0">
                          <i className="ri-check-line text-white text-xs"></i>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
              {!uploadedImage && (
                <div className="px-4 pb-4 pt-2">
                  <p className="text-xs text-center text-gray-400">Upload a photo first to select a product</p>
                </div>
              )}
            </div>

            {/* CTA */}
            {selectedProduct && (
              <div className="bg-gradient-to-b from-emerald-600 to-teal-600 rounded-xl p-5 text-center">
                <p className="text-white font-bold text-sm mb-1">Love how it looks?</p>
                <p className="text-emerald-100 text-xs mb-4">Order custom-made to fit your exact window size</p>
                <Link
                  to={`/product/${selectedProduct.id}`}
                  className="block w-full bg-white text-emerald-700 py-2.5 rounded-lg font-bold text-sm hover:bg-emerald-50 transition-colors cursor-pointer whitespace-nowrap"
                >
                  <i className="ri-shopping-cart-line mr-1.5"></i>
                  Order {selectedProduct.name}
                </Link>
                <Link
                  to="/free-sample"
                  className="block w-full mt-2 border border-white/40 text-white py-2.5 rounded-lg font-semibold text-sm hover:bg-white/10 transition-colors cursor-pointer whitespace-nowrap"
                >
                  <i className="ri-mail-send-line mr-1.5"></i>
                  Request Free Sample
                </Link>
              </div>
            )}

            {/* Tips */}
            <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
              <h4 className="text-xs font-bold text-amber-800 mb-2 flex items-center gap-1.5">
                <i className="ri-lightbulb-line"></i>
                Tips for Best Results
              </h4>
              <ul className="space-y-1.5 text-xs text-amber-700">
                <li className="flex items-start gap-1.5"><i className="ri-check-line mt-0.5 shrink-0"></i>Take the photo straight-on, not at an angle</li>
                <li className="flex items-start gap-1.5"><i className="ri-check-line mt-0.5 shrink-0"></i>Include the full window frame in the shot</li>
                <li className="flex items-start gap-1.5"><i className="ri-check-line mt-0.5 shrink-0"></i>Use good natural or room lighting</li>
                <li className="flex items-start gap-1.5"><i className="ri-check-line mt-0.5 shrink-0"></i>Drag corners to resize the overlay</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
