import { useState, useRef } from 'react';
import type { Product, RestockEntry } from '../page';
import { BADGE_OPTIONS } from '../page';
import { categories } from '../../../../mocks/products';
import ProductPreviewTab from './ProductPreviewTab';
import RestockHistoryTab from './RestockHistoryTab';

interface Props {
  product: Product | null;
  restockHistory: RestockEntry[];
  onSave: (product: Product) => void;
  onRestock: (productId: number, qty: number, note: string) => void;
  onClose: () => void;
}

const emptyProduct: Product = {
  id: 0,
  name: '',
  nameEs: '',
  price: 0,
  originalPrice: 0,
  discountType: 'none',
  discountValue: 0,
  rating: 4.5,
  reviews: 0,
  category: 'wood-blinds',
  badge: null,
  description: '',
  descriptionEs: '',
  images: [],
  image: '',
  colorOptions: [],
  inventory: 0,
  lowStockThreshold: 10,
};

const COLOR_PRESETS = [
  { name: 'White', hex: '#FFFFFF' },
  { name: 'Ivory', hex: '#FFFFF0' },
  { name: 'Gray', hex: '#9CA3AF' },
  { name: 'Beige', hex: '#D4B896' },
  { name: 'Espresso', hex: '#4B2E1A' },
  { name: 'Natural', hex: '#C8A97E' },
  { name: 'Black', hex: '#1F2937' },
  { name: 'Navy', hex: '#1E3A5F' },
  { name: 'Sage', hex: '#7D9B76' },
  { name: 'Charcoal', hex: '#374151' },
];

type Tab = 'basic' | 'pricing' | 'media' | 'colors' | 'inventory' | 'history' | 'preview';

export default function ProductFormModal({ product, restockHistory, onSave, onRestock, onClose }: Props) {
  const [form, setForm] = useState<Product>(() => {
    if (!product) return emptyProduct;
    return {
      ...product,
      discountType: product.discountType ?? 'none',
      discountValue: product.discountValue ?? 0,
      images: product.images && product.images.length > 0 ? product.images : (product.image ? [product.image] : []),
      colorOptions: product.colorOptions ?? [],
      inventory: product.inventory ?? 0,
      lowStockThreshold: product.lowStockThreshold ?? 10,
    };
  });
  const [errors, setErrors] = useState<Partial<Record<string, string>>>({});
  const [activeTab, setActiveTab] = useState<Tab>('basic');
  const [newImageUrl, setNewImageUrl] = useState('');
  const [newColorName, setNewColorName] = useState('');
  const [newColorHex, setNewColorHex] = useState('#FFFFFF');
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [uploadLoading, setUploadLoading] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const fileUploadRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const set = <K extends keyof Product>(key: K, value: Product[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  // Compute effective sale price based on discount
  const computedSalePrice = (): number => {
    if (form.discountType === 'percent' && form.discountValue > 0) {
      return parseFloat((form.originalPrice * (1 - form.discountValue / 100)).toFixed(2));
    }
    if (form.discountType === 'dollar' && form.discountValue > 0) {
      return parseFloat((form.originalPrice - form.discountValue).toFixed(2));
    }
    return form.price;
  };

  const effectivePrice = computedSalePrice();
  const discountPercent = form.originalPrice > 0
    ? Math.round(((form.originalPrice - effectivePrice) / form.originalPrice) * 100)
    : 0;

  const validate = (): { ok: boolean; firstErrorTab: Tab | null } => {
    const newErrors: Partial<Record<string, string>> = {};
    if (!form.name.trim()) newErrors.name = 'Product name is required';
    if (form.originalPrice <= 0) newErrors.originalPrice = 'Original price must be greater than 0';
    if (!form.description.trim()) newErrors.description = 'Description is required';
    if (form.images.length === 0 && !form.image) newErrors.images = 'At least one image is required';
    setErrors(newErrors);
    if (Object.keys(newErrors).length === 0) return { ok: true, firstErrorTab: null };
    let firstErrorTab: Tab = 'basic';
    if (newErrors.originalPrice) firstErrorTab = 'pricing';
    else if (newErrors.images) firstErrorTab = 'media';
    else if (newErrors.name || newErrors.description) firstErrorTab = 'basic';
    return { ok: false, firstErrorTab };
  };

  const handleSubmit = (e: React.SyntheticEvent) => {
    e.preventDefault();
    const { ok, firstErrorTab } = validate();
    if (!ok) {
      if (firstErrorTab) setActiveTab(firstErrorTab);
      return;
    }
    // If no discount type and no sale price entered, use originalPrice (no discount)
    let finalPrice: number;
    if (form.discountType !== 'none') {
      finalPrice = effectivePrice;
    } else if (form.price > 0 && form.price < form.originalPrice) {
      finalPrice = form.price;
    } else {
      finalPrice = form.originalPrice;
    }
    const primaryImage = form.images.length > 0 ? form.images[0] : form.image;
    onSave({ ...form, price: finalPrice, image: primaryImage });
    setSaveSuccess(true);
  };

  // Images
  const addImage = () => {
    const url = newImageUrl.trim();
    if (!url) return;
    const updated = [...form.images, url];
    set('images', updated);
    set('image', updated[0]);
    setNewImageUrl('');
    setErrors((prev) => ({ ...prev, images: undefined }));
  };

  const removeImage = (idx: number) => {
    const updated = form.images.filter((_, i) => i !== idx);
    set('images', updated);
    set('image', updated[0] ?? '');
    if (selectedImageIndex >= updated.length) setSelectedImageIndex(Math.max(0, updated.length - 1));
  };

  const moveImage = (from: number, to: number) => {
    if (to < 0 || to >= form.images.length) return;
    const updated = [...form.images];
    const [item] = updated.splice(from, 1);
    updated.splice(to, 0, item);
    set('images', updated);
    set('image', updated[0]);
    setSelectedImageIndex(to);
  };

  const setMainImage = (idx: number) => {
    if (idx === 0) return;
    const updated = [...form.images];
    const [item] = updated.splice(idx, 1);
    updated.unshift(item);
    set('images', updated);
    set('image', updated[0]);
    setSelectedImageIndex(0);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploadLoading(true);
    const readers: Promise<string>[] = Array.from(files).map(
      (file) =>
        new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        })
    );
    Promise.all(readers)
      .then((dataUrls) => {
        const updated = [...form.images, ...dataUrls];
        set('images', updated);
        set('image', updated[0]);
        setErrors((prev) => ({ ...prev, images: undefined }));
      })
      .finally(() => {
        setUploadLoading(false);
        e.target.value = '';
      });
  };

  // Colors
  const addColor = () => {
    const name = newColorName.trim();
    if (!name) return;
    const updated = [...form.colorOptions, { name, hex: newColorHex }];
    set('colorOptions', updated);
    setNewColorName('');
    setNewColorHex('#FFFFFF');
  };

  const removeColor = (idx: number) => {
    set('colorOptions', form.colorOptions.filter((_, i) => i !== idx));
  };

  const addPresetColor = (preset: { name: string; hex: string }) => {
    if (form.colorOptions.find((c) => c.name === preset.name)) return;
    set('colorOptions', [...form.colorOptions, preset]);
  };

  const isEdit = product !== null;

  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: 'basic', label: 'Basic Info', icon: 'ri-information-line' },
    { id: 'pricing', label: 'Pricing', icon: 'ri-price-tag-3-line' },
    { id: 'media', label: 'Photos', icon: 'ri-image-line' },
    { id: 'colors', label: 'Colors', icon: 'ri-palette-line' },
    { id: 'inventory', label: 'Inventory', icon: 'ri-stack-line' },
    { id: 'history', label: 'History', icon: 'ri-history-line' },
    { id: 'preview', label: 'Preview', icon: 'ri-eye-line' },
  ];

  const primaryImage = form.images[selectedImageIndex] ?? form.images[0] ?? form.image ?? '';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className={`bg-white rounded-2xl shadow-2xl w-full ${activeTab === 'preview' ? 'max-w-6xl' : 'max-w-5xl'} max-h-[92vh] flex flex-col transition-all duration-300`}>
        {/* Success Toast */}
        {saveSuccess && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2.5 bg-green-700 text-white px-5 py-3 rounded-xl shadow-lg text-sm font-semibold animate-fade-in">
            <div className="w-5 h-5 flex items-center justify-center">
              <i className="ri-checkbox-circle-fill text-base"></i>
            </div>
            {isEdit ? 'Changes saved & live!' : 'Product published & live!'}
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between px-7 py-5 border-b border-slate-200 shrink-0">
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              {isEdit ? 'Edit Product' : 'Add New Product'}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {isEdit ? 'Update product details, photos, colors, inventory & pricing' : 'Fill in all details for the new product'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors cursor-pointer"
          >
            <i className="ri-close-line text-lg"></i>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-200 px-7 shrink-0 overflow-x-auto">
          {tabs.map((tab) => {
            const productRestocks = restockHistory.filter((e) => e.productId === form.id).length;
            const hasError = (
              (tab.id === 'basic' && (errors.name || errors.description)) ||
              (tab.id === 'pricing' && (errors.originalPrice || errors.price)) ||
              (tab.id === 'media' && errors.images)
            );
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-4 py-3 text-xs font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-green-700 text-green-700'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <div className="w-3.5 h-3.5 flex items-center justify-center relative">
                  <i className={tab.icon}></i>
                  {hasError && (
                    <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                  )}
                </div>
                {tab.label}
                {tab.id === 'media' && form.images.length > 0 && !errors.images && (
                  <span className="ml-1 bg-green-100 text-green-700 text-xs px-1.5 py-0.5 rounded-full font-bold">
                    {form.images.length}
                  </span>
                )}
                {tab.id === 'colors' && form.colorOptions.length > 0 && (
                  <span className="ml-1 bg-green-100 text-green-700 text-xs px-1.5 py-0.5 rounded-full font-bold">
                    {form.colorOptions.length}
                  </span>
                )}
                {tab.id === 'inventory' && (
                  <span className={`ml-1 text-xs px-1.5 py-0.5 rounded-full font-bold ${
                    form.inventory === 0
                      ? 'bg-red-100 text-red-700'
                      : form.inventory <= (form.lowStockThreshold ?? 10)
                      ? 'bg-amber-100 text-amber-700'
                      : 'bg-green-100 text-green-700'
                  }`}>
                    {form.inventory}
                  </span>
                )}
                {tab.id === 'history' && productRestocks > 0 && (
                  <span className="ml-1 bg-slate-100 text-slate-600 text-xs px-1.5 py-0.5 rounded-full font-bold">
                    {productRestocks}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-7 py-6">

          {/* ── BASIC INFO ── */}
          {activeTab === 'basic' && (
            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Product Name (EN) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => set('name', e.target.value)}
                    placeholder="e.g. Cordless Faux Wood Blinds"
                    className={`w-full px-3 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 ${errors.name ? 'border-red-400' : 'border-slate-200'}`}
                  />
                  {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Product Name (ES)</label>
                  <input
                    type="text"
                    value={form.nameEs}
                    onChange={(e) => set('nameEs', e.target.value)}
                    placeholder="e.g. Persianas de Madera Sintética"
                    className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Category</label>
                  <select
                    value={form.category}
                    onChange={(e) => set('category', e.target.value)}
                    className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 cursor-pointer"
                  >
                    {categories.filter((c) => c.id !== 'all').map((c) => (
                      <option key={c.id} value={c.id}>{c.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Badge</label>
                  <select
                    value={form.badge ?? ''}
                    onChange={(e) => set('badge', e.target.value || null)}
                    className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 cursor-pointer"
                  >
                    <option value="">No Badge</option>
                    {BADGE_OPTIONS.map((b) => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Rating (0–5)</label>
                  <input
                    type="number" min="0" max="5" step="0.1"
                    value={form.rating}
                    onChange={(e) => set('rating', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Review Count</label>
                  <input
                    type="number" min="0"
                    value={form.reviews}
                    onChange={(e) => set('reviews', parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Description (EN) <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) => set('description', e.target.value)}
                  rows={3} maxLength={500}
                  placeholder="Describe the product in English..."
                  className={`w-full px-3 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 resize-none ${errors.description ? 'border-red-400' : 'border-slate-200'}`}
                />
                {errors.description && <p className="text-xs text-red-500 mt-1">{errors.description}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Description (ES)</label>
                <textarea
                  value={form.descriptionEs}
                  onChange={(e) => set('descriptionEs', e.target.value)}
                  rows={3} maxLength={500}
                  placeholder="Describe el producto en español..."
                  className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 resize-none"
                />
              </div>
            </div>
          )}

          {/* ── PRICING ── */}
          {activeTab === 'pricing' && (
            <div className="space-y-6">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Original / Regular Price ($) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number" min="0" step="0.01"
                  value={form.originalPrice || ''}
                  onChange={(e) => set('originalPrice', parseFloat(e.target.value) || 0)}
                  placeholder="129.99"
                  className={`w-full px-3 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 ${errors.originalPrice ? 'border-red-400' : 'border-slate-200'}`}
                />
                {errors.originalPrice && <p className="text-xs text-red-500 mt-1">{errors.originalPrice}</p>}
              </div>

              {/* Discount type selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2">Discount Type</label>
                <div className="flex gap-3">
                  {[
                    { value: 'none', label: 'No Discount', icon: 'ri-close-circle-line' },
                    { value: 'percent', label: 'Percentage (%)', icon: 'ri-percent-line' },
                    { value: 'dollar', label: 'Dollar Amount ($)', icon: 'ri-money-dollar-circle-line' },
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => set('discountType', opt.value as Product['discountType'])}
                      className={`flex-1 flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl border-2 text-xs font-semibold transition-all cursor-pointer ${
                        form.discountType === opt.value
                          ? 'border-green-700 bg-green-50 text-green-800'
                          : 'border-slate-200 text-slate-500 hover:border-slate-300'
                      }`}
                    >
                      <div className="w-5 h-5 flex items-center justify-center">
                        <i className={`${opt.icon} text-base`}></i>
                      </div>
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {form.discountType !== 'none' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    {form.discountType === 'percent' ? 'Discount Percentage (%)' : 'Discount Amount ($)'}
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-semibold">
                      {form.discountType === 'percent' ? '%' : '$'}
                    </span>
                    <input
                      type="number" min="0"
                      max={form.discountType === 'percent' ? 100 : form.originalPrice}
                      step={form.discountType === 'percent' ? 1 : 0.01}
                      value={form.discountValue || ''}
                      onChange={(e) => set('discountValue', parseFloat(e.target.value) || 0)}
                      placeholder={form.discountType === 'percent' ? '20' : '30.00'}
                      className="w-full pl-8 pr-4 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
                    />
                  </div>
                </div>
              )}

              {form.discountType === 'none' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Sale Price ($) <span className="text-slate-400 font-normal text-[11px]">— optional, leave blank for full price</span>
                  </label>
                  <input
                    type="number" min="0" step="0.01"
                    value={form.price || ''}
                    onChange={(e) => set('price', parseFloat(e.target.value) || 0)}
                    placeholder="Leave blank if no discount"
                    className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">If left empty, the product will show only the original price with no discount.</p>
                </div>
              )}

              {/* Price summary */}
              {form.originalPrice > 0 && (
                <div className="bg-slate-50 rounded-xl border border-slate-200 p-5">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Price Summary</p>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Original Price</span>
                      <span className="font-semibold text-slate-900">${form.originalPrice.toFixed(2)}</span>
                    </div>
                    {form.discountType !== 'none' && form.discountValue > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-red-500">
                          Discount ({form.discountType === 'percent' ? `${form.discountValue}%` : `$${form.discountValue}`})
                        </span>
                        <span className="font-semibold text-red-500">
                          -${(form.originalPrice - effectivePrice).toFixed(2)}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm border-t border-slate-200 pt-2 mt-2">
                      <span className="font-bold text-slate-900">Customer Pays</span>
                      <span className="font-bold text-green-700 text-base">
                        {form.discountType === 'none' && (!form.price || form.price >= form.originalPrice)
                          ? `$${form.originalPrice.toFixed(2)} (no discount)`
                          : `$${effectivePrice.toFixed(2)}`}
                      </span>
                    </div>
                    {discountPercent > 0 && (
                      <div className="flex justify-center mt-2">
                        <span className="bg-red-100 text-red-700 text-xs font-bold px-3 py-1 rounded-full">
                          {discountPercent}% OFF
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── MEDIA / PHOTOS ── */}
          {activeTab === 'media' && (
            <div className="space-y-5">
              {/* Hidden file inputs */}
              <input
                ref={fileUploadRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleFileChange}
              />
              <input
                ref={cameraRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={handleFileChange}
              />

              {/* Upload / Camera / URL buttons */}
              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => fileUploadRef.current?.click()}
                  disabled={uploadLoading}
                  className="flex flex-col items-center justify-center gap-2 py-5 border-2 border-dashed border-slate-300 rounded-xl text-slate-600 hover:border-green-600 hover:bg-green-50 hover:text-green-700 transition-all cursor-pointer group"
                >
                  <div className="w-8 h-8 flex items-center justify-center">
                    <i className="ri-upload-cloud-2-line text-2xl group-hover:text-green-700"></i>
                  </div>
                  <span className="text-xs font-semibold">Upload Photo</span>
                  <span className="text-[10px] text-slate-400">From your device</span>
                </button>

                <button
                  type="button"
                  onClick={() => cameraRef.current?.click()}
                  disabled={uploadLoading}
                  className="flex flex-col items-center justify-center gap-2 py-5 border-2 border-dashed border-slate-300 rounded-xl text-slate-600 hover:border-green-600 hover:bg-green-50 hover:text-green-700 transition-all cursor-pointer group"
                >
                  <div className="w-8 h-8 flex items-center justify-center">
                    <i className="ri-camera-line text-2xl group-hover:text-green-700"></i>
                  </div>
                  <span className="text-xs font-semibold">Take Photo</span>
                  <span className="text-[10px] text-slate-400">Use camera</span>
                </button>

                <div className="flex flex-col items-center justify-center gap-2 py-5 border-2 border-dashed border-slate-200 rounded-xl text-slate-400">
                  <div className="w-8 h-8 flex items-center justify-center">
                    <i className="ri-links-line text-2xl"></i>
                  </div>
                  <span className="text-sm font-medium">Paste URL</span>
                  <span className="text-xs mt-1">From the web</span>
                </div>
              </div>

              {/* URL input row */}
              <div className="flex gap-2">
                <input
                  ref={imageInputRef}
                  type="text"
                  value={newImageUrl}
                  onChange={(e) => setNewImageUrl(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addImage(); } }}
                  placeholder="https://example.com/photo.jpg"
                  className="flex-1 px-3 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
                />
                <button
                  type="button"
                  onClick={addImage}
                  className="px-4 py-2.5 bg-green-700 text-white text-sm font-semibold rounded-lg hover:bg-green-800 transition-colors cursor-pointer whitespace-nowrap"
                >
                  Add
                </button>
              </div>

              {errors.images && <p className="text-xs text-red-500">{errors.images}</p>}

              {uploadLoading && (
                <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-4 py-3">
                  <div className="w-4 h-4 flex items-center justify-center">
                    <i className="ri-loader-4-line animate-spin"></i>
                  </div>
                  Processing photo(s)...
                </div>
              )}

              {form.images.length > 0 && (
                <div>
                  {/* Main preview */}
                  <div className="w-full h-56 rounded-xl overflow-hidden bg-slate-100 mb-3 border border-slate-200">
                    <img
                      src={form.images[selectedImageIndex] ?? form.images[0]}
                      alt="Selected"
                      className="w-full h-full object-cover object-top"
                    />
                  </div>

                  {/* Thumbnails */}
                  <div className="flex flex-wrap gap-2">
                    {form.images.map((img, idx) => (
                      <div
                        key={idx}
                        className={`relative group w-20 h-20 rounded-lg overflow-hidden border-2 cursor-pointer transition-all ${
                          selectedImageIndex === idx ? 'border-green-700' : 'border-slate-200 hover:border-green-400'
                        }`}
                        onClick={() => setSelectedImageIndex(idx)}
                      >
                        <img src={img} alt={`Photo ${idx + 1}`} className="w-full h-full object-cover object-top" />
                        {idx === 0 && (
                          <span className="absolute bottom-0 left-0 right-0 bg-green-700/80 text-white text-[9px] font-bold text-center py-0.5">
                            MAIN
                          </span>
                        )}
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1 p-1">
                          <div className="flex items-center gap-1">
                            {idx > 0 && (
                              <button
                                type="button"
                                onClick={(e) => { e.stopPropagation(); moveImage(idx, idx - 1); }}
                                className="w-6 h-6 flex items-center justify-center bg-white/90 rounded text-slate-700 hover:bg-white cursor-pointer"
                                title="Move left"
                              >
                                <i className="ri-arrow-left-s-line text-xs"></i>
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={(e) => { e.stopPropagation(); removeImage(idx); }}
                              className="w-6 h-6 flex items-center justify-center bg-red-500 rounded text-white hover:bg-red-600 cursor-pointer"
                              title="Remove"
                            >
                              <i className="ri-delete-bin-line text-xs"></i>
                            </button>
                            {idx < form.images.length - 1 && (
                              <button
                                type="button"
                                onClick={(e) => { e.stopPropagation(); moveImage(idx, idx + 1); }}
                                className="w-6 h-6 flex items-center justify-center bg-white/90 rounded text-slate-700 hover:bg-white cursor-pointer"
                                title="Move right"
                              >
                                <i className="ri-arrow-right-s-line text-xs"></i>
                              </button>
                            )}
                          </div>
                          {idx !== 0 && (
                            <button
                              type="button"
                              onClick={(e) => { e.stopPropagation(); setMainImage(idx); }}
                              className="w-full flex items-center justify-center gap-0.5 bg-green-600 hover:bg-green-700 text-white text-[9px] font-bold rounded py-0.5 cursor-pointer whitespace-nowrap"
                              title="Set as main photo"
                            >
                              <i className="ri-star-line text-[9px]"></i> Set Main
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-slate-400 mt-2">
                    {form.images.length} photo{form.images.length !== 1 ? 's' : ''} added · First photo is the main image · Hover to reorder or remove
                  </p>
                </div>
              )}

              {form.images.length === 0 && !uploadLoading && (
                <div className="flex flex-col items-center justify-center py-10 border-2 border-dashed border-slate-200 rounded-xl text-slate-400">
                  <div className="w-10 h-10 flex items-center justify-center mb-2">
                    <i className="ri-image-add-line text-3xl"></i>
                  </div>
                  <p className="text-sm font-medium">No photos added yet</p>
                  <p className="text-xs mt-1">Upload, take a photo, or paste a URL above</p>
                </div>
              )}
            </div>
          )}

          {/* ── COLORS ── */}
          {activeTab === 'colors' && (
            <div className="space-y-5">
              <div>
                <p className="text-xs font-semibold text-slate-700 mb-1">Quick Add Preset Colors</p>
                <p className="text-[11px] text-slate-400 mb-3">Click to add · Click again to remove</p>
                <div className="flex flex-wrap gap-2">
                  {COLOR_PRESETS.map((preset) => {
                    const already = form.colorOptions.some((c) => c.name === preset.name);
                    return (
                      <button
                        key={preset.name}
                        type="button"
                        onClick={() =>
                          already
                            ? removeColor(form.colorOptions.findIndex((c) => c.name === preset.name))
                            : addPresetColor(preset)
                        }
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
                          already
                            ? 'border-red-300 bg-red-50 text-red-600 hover:bg-red-100'
                            : 'border-slate-200 text-slate-600 hover:border-green-500 hover:bg-green-50 hover:text-green-700'
                        }`}
                      >
                        <span
                          className="w-4 h-4 rounded-full border border-slate-300 shrink-0"
                          style={{ backgroundColor: preset.hex }}
                        ></span>
                        {preset.name}
                        {already ? (
                          <i className="ri-close-line text-red-500"></i>
                        ) : (
                          <i className="ri-add-line text-slate-400"></i>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="border-t border-slate-100 pt-4">
                <p className="text-xs font-semibold text-slate-700 mb-3">Add Custom Color</p>
                <div className="flex gap-2 items-end">
                  <div className="flex-1">
                    <label className="block text-xs text-slate-500 mb-1">Color Name</label>
                    <input
                      type="text"
                      value={newColorName}
                      onChange={(e) => setNewColorName(e.target.value)}
                      placeholder="e.g. Walnut Brown"
                      className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">Color</label>
                    <input
                      type="color"
                      value={newColorHex}
                      onChange={(e) => setNewColorHex(e.target.value)}
                      className="w-12 h-10 rounded-lg border border-slate-200 cursor-pointer p-0.5"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={addColor}
                    className="px-4 py-2.5 bg-green-700 text-white text-sm font-semibold rounded-lg hover:bg-green-800 transition-colors cursor-pointer whitespace-nowrap"
                  >
                    Add
                  </button>
                </div>
              </div>

              {form.colorOptions.length > 0 ? (
                <div>
                  <p className="text-xs font-semibold text-slate-700 mb-3">
                    Added Colors ({form.colorOptions.length})
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {form.colorOptions.map((color, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-2 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                      >
                        <span
                          className="w-5 h-5 rounded-full border border-slate-300 shrink-0"
                          style={{ backgroundColor: color.hex }}
                        ></span>
                        <span className="text-xs font-medium text-slate-700">{color.name}</span>
                        <button
                          type="button"
                          onClick={() => removeColor(idx)}
                          className="w-4 h-4 flex items-center justify-center text-slate-400 hover:text-red-500 cursor-pointer ml-1"
                        >
                          <i className="ri-close-line text-xs"></i>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-10 border-2 border-dashed border-slate-200 rounded-xl text-slate-400">
                  <div className="w-10 h-10 flex items-center justify-center mb-2">
                    <i className="ri-palette-line text-3xl"></i>
                  </div>
                  <p className="text-sm font-medium">No colors added yet</p>
                  <p className="text-xs mt-1">Use presets above or add a custom color</p>
                </div>
              )}
            </div>
          )}

          {/* ── INVENTORY ── */}
          {activeTab === 'inventory' && (
            <div className="space-y-6">
              {/* Stock status banner */}
              <div className={`flex items-center gap-3 px-5 py-4 rounded-xl border ${
                form.inventory === 0
                  ? 'bg-red-50 border-red-200'
                  : form.inventory <= (form.lowStockThreshold ?? 10)
                  ? 'bg-amber-50 border-amber-200'
                  : 'bg-green-50 border-green-200'
              }`}>
                <div className={`w-9 h-9 flex items-center justify-center rounded-lg ${
                  form.inventory === 0
                    ? 'bg-red-100 text-red-600'
                    : form.inventory <= (form.lowStockThreshold ?? 10)
                    ? 'bg-amber-100 text-amber-600'
                    : 'bg-green-100 text-green-700'
                }`}>
                  <i className={`text-lg ${
                    form.inventory === 0
                      ? 'ri-close-circle-line'
                      : form.inventory <= (form.lowStockThreshold ?? 10)
                      ? 'ri-alert-line'
                      : 'ri-checkbox-circle-line'
                  }`}></i>
                </div>
                <div>
                  <p className={`text-sm font-bold ${
                    form.inventory === 0 ? 'text-red-700' : form.inventory <= (form.lowStockThreshold ?? 10) ? 'text-amber-700' : 'text-green-800'
                  }`}>
                    {form.inventory === 0
                      ? 'Out of Stock'
                      : form.inventory <= (form.lowStockThreshold ?? 10)
                      ? 'Low Stock'
                      : 'In Stock'}
                  </p>
                  <p className={`text-xs mt-0.5 ${
                    form.inventory === 0 ? 'text-red-500' : form.inventory <= (form.lowStockThreshold ?? 10) ? 'text-amber-600' : 'text-green-600'
                  }`}>
                    {form.inventory === 0
                      ? 'No units available — update quantity below'
                      : form.inventory <= (form.lowStockThreshold ?? 10)
                      ? `Only ${form.inventory} unit${form.inventory !== 1 ? 's' : ''} remaining`
                      : `${form.inventory} units available`}
                  </p>
                </div>
              </div>

              {/* Current stock quantity */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Current Stock Quantity <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => set('inventory', Math.max(0, form.inventory - 1))}
                    className="w-10 h-10 flex items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 cursor-pointer transition-colors text-lg font-bold"
                  >
                    −
                  </button>
                  <input
                    type="number"
                    min="0"
                    value={form.inventory}
                    onChange={(e) => set('inventory', Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-32 text-center px-3 py-2.5 text-lg font-bold border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
                  />
                  <button
                    type="button"
                    onClick={() => set('inventory', form.inventory + 1)}
                    className="w-10 h-10 flex items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 cursor-pointer transition-colors text-lg font-bold"
                  >
                    +
                  </button>
                  <span className="text-sm text-slate-500">units</span>
                </div>
              </div>

              {/* Quick adjust buttons */}
              <div>
                <p className="text-xs font-semibold text-slate-700 mb-2">Quick Adjust</p>
                <div className="flex flex-wrap gap-2">
                  {[-50, -25, -10, -5, +5, +10, +25, +50, +100].map((delta) => (
                    <button
                      key={delta}
                      type="button"
                      onClick={() => set('inventory', Math.max(0, form.inventory + delta))}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-lg border cursor-pointer transition-all whitespace-nowrap ${
                        delta < 0
                          ? 'border-red-200 text-red-600 bg-red-50 hover:bg-red-100'
                          : 'border-green-200 text-green-700 bg-green-50 hover:bg-green-100'
                      }`}
                    >
                      {delta > 0 ? `+${delta}` : delta}
                    </button>
                  ))}
                </div>
              </div>

              {/* Low stock threshold */}
              <div className="border-t border-slate-100 pt-5">
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Low Stock Alert Threshold
                </label>
                <p className="text-xs text-slate-400 mb-3">
                  You'll see a "Low Stock" warning when inventory drops to or below this number.
                </p>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    min="1"
                    value={form.lowStockThreshold ?? 10}
                    onChange={(e) => set('lowStockThreshold', Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-32 px-3 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
                  />
                  <span className="text-sm text-slate-500">units</span>
                </div>
              </div>

              {/* Inventory summary card */}
              <div className="bg-slate-50 rounded-xl border border-slate-200 p-5">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Inventory Summary</p>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Current Stock</span>
                    <span className="font-bold text-slate-900">{form.inventory} units</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Low Stock Alert At</span>
                    <span className="font-semibold text-amber-600">{form.lowStockThreshold ?? 10} units</span>
                  </div>
                  <div className="flex justify-between text-sm border-t border-slate-200 pt-2 mt-2">
                    <span className="text-slate-600">Status</span>
                    <span className={`font-bold ${
                      form.inventory === 0 ? 'text-red-600' : form.inventory <= (form.lowStockThreshold ?? 10) ? 'text-amber-600' : 'text-green-700'
                    }`}>
                      {form.inventory === 0 ? 'Out of Stock' : form.inventory <= (form.lowStockThreshold ?? 10) ? 'Low Stock' : 'In Stock'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── RESTOCK HISTORY ── */}
          {activeTab === 'history' && (
            <RestockHistoryTab
              productId={form.id}
              productName={form.name}
              currentInventory={form.inventory}
              history={restockHistory}
              onRestock={(qty, note) => {
                if (form.id !== 0) {
                  onRestock(form.id, qty, note);
                  set('inventory', form.inventory + qty);
                }
              }}
            />
          )}

          {/* ── PREVIEW ── */}
          {activeTab === 'preview' && (
            <ProductPreviewTab
              form={form}
              effectivePrice={effectivePrice}
              discountPercent={discountPercent}
              onFieldChange={set}
            />
          )}
        </form>

        {/* Footer */}
        <div className="flex items-center justify-between gap-3 px-7 py-5 border-t border-slate-200 bg-slate-50 rounded-b-2xl shrink-0">
          <div className="flex gap-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`w-2 h-2 rounded-full transition-all cursor-pointer ${activeTab === tab.id ? 'bg-green-700 w-4' : 'bg-slate-300'}`}
                title={tab.label}
              ></button>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer whitespace-nowrap"
            >
              {saveSuccess ? 'Close' : 'Cancel'}
            </button>
            {!saveSuccess ? (
              <button
                type="button"
                onClick={handleSubmit}
                className="flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-green-700 rounded-lg hover:bg-green-800 transition-colors cursor-pointer whitespace-nowrap"
              >
                <div className="w-4 h-4 flex items-center justify-center">
                  <i className="ri-save-line"></i>
                </div>
                {isEdit ? 'Save Changes' : 'Publish Product'}
              </button>
            ) : (
              <div className="flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-green-700 bg-green-50 border border-green-200 rounded-lg">
                <div className="w-4 h-4 flex items-center justify-center">
                  <i className="ri-checkbox-circle-fill"></i>
                </div>
                Saved &amp; Live
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
