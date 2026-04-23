import { useState } from 'react';
import type { Product } from '../page';

interface Props {
  form: Product;
  effectivePrice: number;
  discountPercent: number;
  onFieldChange: <K extends keyof Product>(key: K, value: Product[K]) => void;
}

const mountOptions = ['Inside Mount', 'Outside Mount'];

const badgeColors: Record<string, string> = {
  'Best Seller': 'bg-green-700 text-white',
  'Sale': 'bg-red-500 text-white',
  'Top Rated': 'bg-emerald-600 text-white',
  'New': 'bg-sky-500 text-white',
  'Smart Home': 'bg-indigo-500 text-white',
  'Eco-Friendly': 'bg-green-600 text-white',
  'Popular': 'bg-green-800 text-white',
  'Light & Airy': 'bg-teal-500 text-white',
  'Outdoor': 'bg-stone-600 text-white',
  'Value Pick': 'bg-gray-600 text-white',
};

const featuresByCategory: Record<string, string[]> = {
  'wood-blinds': [
    'Real wood or faux wood construction',
    'Moisture-resistant finish',
    'Cordless lift option',
    'Multiple slat sizes: 2" or 2.5"',
    'Custom stain & paint colors',
  ],
  'roller-shades': [
    'Light filtering or blackout fabric',
    'Smooth chain or cordless operation',
    'Wipe-clean surface',
    'Custom width & drop',
    'Optional motorization',
  ],
  'cellular-shades': [
    'Honeycomb cell insulation',
    'Single, double, or triple cell',
    'Top-down/bottom-up option',
    'Energy Star certified',
    'Cordless or motorized',
  ],
  'roman-shades': [
    'Premium fabric options',
    'Flat, hobbled, or relaxed fold',
    'Blackout lining available',
    'Custom sizing',
    'Cordless lift',
  ],
  'motorized': [
    'App & voice control',
    'Alexa, Google & HomeKit compatible',
    'Rechargeable battery or hardwired',
    'Quiet motor technology',
    'Schedule & automation',
  ],
};

const defaultFeatures = [
  'Custom made to order',
  'Free samples available',
  'Expert installation support',
  'Child-safe cordless options',
  '3-year warranty',
];

const defaultMeasureSteps = [
  { title: 'Choose Inside or Outside Mount', desc: 'Inside mount fits within the window frame. Outside mount covers the frame and can make windows appear larger.' },
  { title: 'Measure Width', desc: 'For inside mount, measure the exact width at the top, middle, and bottom. Use the narrowest measurement.' },
  { title: 'Measure Height', desc: 'For inside mount, measure from the top of the opening to the sill. For outside mount, add 3–4 inches above and below.' },
  { title: 'Enter Your Dimensions', desc: 'Enter your measurements in the fields above. We custom-cut every blind to your exact specifications.' },
];

const defaultInstallSteps = [
  { title: 'Gather Your Tools', desc: "You'll need a drill, level, measuring tape, and the included hardware. Most installs take under 30 minutes." },
  { title: 'Mark Bracket Positions', desc: 'Use a pencil and level to mark where the mounting brackets will go. Ensure they are evenly spaced.' },
  { title: 'Install Brackets', desc: 'Drill pilot holes and secure the brackets with the provided screws. Check that they are level.' },
  { title: 'Snap in the Blind', desc: 'Slide or snap the headrail into the brackets. Test the operation before finishing.' },
];

const COLOR_PRESETS = [
  { name: 'White', hex: '#FFFFFF' },
  { name: 'Ivory', hex: '#FFFFF0' },
  { name: 'Gray', hex: '#9CA3AF' },
  { name: 'Beige', hex: '#D4B896' },
  { name: 'Espresso', hex: '#4B2E1A' },
  { name: 'Natural', hex: '#C8A97E' },
  { name: 'Black', hex: '#1F2937' },
  { name: 'Sage', hex: '#7D9B76' },
  { name: 'Charcoal', hex: '#374151' },
];

// Inline editable text field
function EditableText({
  value,
  onChange,
  className = '',
  placeholder = 'Click to edit...',
  multiline = false,
  inputClassName = '',
}: {
  value: string;
  onChange: (v: string) => void;
  className?: string;
  placeholder?: string;
  multiline?: boolean;
  inputClassName?: string;
}) {
  const [editing, setEditing] = useState(false);

  if (editing) {
    return multiline ? (
      <textarea
        autoFocus
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={() => setEditing(false)}
        rows={3}
        maxLength={500}
        className={`w-full border border-green-400 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-none bg-green-50 ${inputClassName}`}
      />
    ) : (
      <input
        autoFocus
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={() => setEditing(false)}
        className={`w-full border border-green-400 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-green-50 ${inputClassName}`}
      />
    );
  }

  return (
    <span
      onClick={() => setEditing(true)}
      title="Click to edit"
      className={`cursor-text group relative inline-block ${className}`}
    >
      {value || <span className="text-gray-300 italic">{placeholder}</span>}
      <span className="ml-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <i className="ri-edit-line text-green-500 text-xs"></i>
      </span>
    </span>
  );
}

// Inline editable number
function EditableNumber({
  value,
  onChange,
  className = '',
  min = 0,
  step = 0.01,
}: {
  value: number;
  onChange: (v: number) => void;
  className?: string;
  min?: number;
  step?: number;
}) {
  const [editing, setEditing] = useState(false);

  if (editing) {
    return (
      <input
        autoFocus
        type="number"
        min={min}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
        onBlur={() => setEditing(false)}
        className={`border border-green-400 rounded px-2 py-0.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-green-50 w-24 ${className}`}
      />
    );
  }

  return (
    <span
      onClick={() => setEditing(true)}
      title="Click to edit"
      className={`cursor-text group relative inline-flex items-center gap-1 ${className}`}
    >
      {value}
      <span className="opacity-0 group-hover:opacity-100 transition-opacity">
        <i className="ri-edit-line text-green-500 text-xs"></i>
      </span>
    </span>
  );
}

// Editable step item (title + desc)
function EditableStep({
  step,
  index,
  onChangeTitle,
  onChangeDesc,
  onRemove,
}: {
  step: { title: string; desc: string };
  index: number;
  onChangeTitle: (v: string) => void;
  onChangeDesc: (v: string) => void;
  onRemove: () => void;
}) {
  return (
    <div className="flex gap-4 group/step">
      <div className="w-8 h-8 flex items-center justify-center bg-green-700 text-white text-sm font-bold rounded-full shrink-0 mt-0.5">
        {index + 1}
      </div>
      <div className="flex-1">
        <div className="flex items-start gap-2">
          <div className="flex-1">
            <EditableText
              value={step.title}
              onChange={onChangeTitle}
              placeholder="Step title..."
              className="text-sm font-bold text-gray-900 block w-full"
            />
          </div>
          <button
            onClick={onRemove}
            title="Remove step"
            className="opacity-0 group-hover/step:opacity-100 transition-opacity w-6 h-6 flex items-center justify-center text-red-400 hover:text-red-600 cursor-pointer shrink-0 mt-0.5"
          >
            <i className="ri-close-line text-sm"></i>
          </button>
        </div>
        <div className="mt-0.5">
          <EditableText
            value={step.desc}
            onChange={onChangeDesc}
            placeholder="Step description..."
            multiline
            className="text-sm text-gray-600 block w-full"
          />
        </div>
      </div>
    </div>
  );
}

// Editable feature item
function EditableFeature({
  value,
  index,
  onChange,
  onRemove,
}: {
  value: string;
  index: number;
  onChange: (v: string) => void;
  onRemove: () => void;
}) {
  return (
    <li className="flex items-start gap-3 text-sm text-gray-700 group/feat">
      <div className="w-5 h-5 flex items-center justify-center text-green-700 shrink-0 mt-0.5">
        <i className="ri-check-double-line text-base"></i>
      </div>
      <div className="flex-1">
        <EditableText
          value={value}
          onChange={onChange}
          placeholder={`Feature ${index + 1}...`}
          className="text-sm text-gray-700 block w-full"
        />
      </div>
      <button
        onClick={onRemove}
        title="Remove feature"
        className="opacity-0 group-hover/feat:opacity-100 transition-opacity w-5 h-5 flex items-center justify-center text-red-400 hover:text-red-600 cursor-pointer shrink-0"
      >
        <i className="ri-close-line text-xs"></i>
      </button>
    </li>
  );
}

export default function ProductPreviewTab({ form, effectivePrice, discountPercent, onFieldChange }: Props) {
  const [activeTab, setActiveTab] = useState<'details' | 'measure' | 'install'>('details');
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedMount, setSelectedMount] = useState(mountOptions[0]);
  const [selectedColor, setSelectedColor] = useState<string>(
    form.colorOptions.length > 0 ? form.colorOptions[0].name : ''
  );
  const [qty, setQty] = useState(1);
  const [showAddColor, setShowAddColor] = useState(false);
  const [newColorName, setNewColorName] = useState('');
  const [newColorHex, setNewColorHex] = useState('#FFFFFF');

  // Local editable state for tab content
  const [features, setFeatures] = useState<string[]>(
    (form as any).detailFeatures ?? featuresByCategory[form.category] ?? defaultFeatures
  );
  const [measureSteps, setMeasureSteps] = useState<{ title: string; desc: string }[]>(
    (form as any).measureSteps ?? defaultMeasureSteps
  );
  const [installSteps, setInstallSteps] = useState<{ title: string; desc: string }[]>(
    (form as any).installSteps ?? defaultInstallSteps
  );

  const primaryImage = form.images[selectedImageIndex] ?? form.images[0] ?? form.image ?? '';
  const relatedImages = form.images.slice(0, 4);

  const trustBadges = [
    { icon: 'ri-truck-line', text: 'Free Shipping $99+' },
    { icon: 'ri-scissors-cut-line', text: 'Custom Made' },
    { icon: 'ri-shield-check-line', text: '3-Year Warranty' },
  ];

  // Sync local tab edits back to parent form
  const updateFeatures = (updated: string[]) => {
    setFeatures(updated);
    onFieldChange('detailFeatures' as keyof Product, updated as any);
  };

  const updateMeasureSteps = (updated: { title: string; desc: string }[]) => {
    setMeasureSteps(updated);
    onFieldChange('measureSteps' as keyof Product, updated as any);
  };

  const updateInstallSteps = (updated: { title: string; desc: string }[]) => {
    setInstallSteps(updated);
    onFieldChange('installSteps' as keyof Product, updated as any);
  };

  const handleAddColor = () => {
    const name = newColorName.trim();
    if (!name) return;
    const updated = [...form.colorOptions, { name, hex: newColorHex }];
    onFieldChange('colorOptions', updated);
    setNewColorName('');
    setNewColorHex('#FFFFFF');
    setShowAddColor(false);
    setSelectedColor(name);
  };

  const handleAddPresetColor = (preset: { name: string; hex: string }) => {
    if (form.colorOptions.find((c) => c.name === preset.name)) return;
    const updated = [...form.colorOptions, preset];
    onFieldChange('colorOptions', updated);
    setSelectedColor(preset.name);
  };

  return (
    <div className="space-y-3">
      {/* Edit hint banner */}
      <div className="flex items-center gap-2 px-4 py-2.5 bg-green-50 border border-green-200 rounded-xl text-xs text-green-700 font-medium">
        <div className="w-4 h-4 flex items-center justify-center shrink-0">
          <i className="ri-edit-line"></i>
        </div>
        <span>
          <strong>Live Preview</strong> — Click any text, price, feature, or step to edit it directly. Use the + buttons to add new items.
        </span>
      </div>

      {/* Full product page preview */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">

        {/* Simulated navbar */}
        <div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 flex items-center justify-center text-green-700">
              <i className="ri-home-smile-line text-lg"></i>
            </div>
            <span className="text-sm font-bold text-green-800">Blinds &amp; Shades</span>
          </div>
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <span>Shop</span><span>About</span><span>Contact</span>
            <div className="w-7 h-7 flex items-center justify-center bg-green-700 text-white rounded-md">
              <i className="ri-shopping-cart-line text-sm"></i>
            </div>
          </div>
        </div>

        {/* Back bar */}
        <div className="bg-gray-50 border-b border-gray-200 px-6 py-2">
          <button className="flex items-center gap-1.5 px-3 py-1.5 bg-green-700 text-white text-xs font-semibold rounded-md cursor-default whitespace-nowrap">
            <i className="ri-arrow-left-line text-xs"></i>
            ← Back to Home
          </button>
        </div>

        {/* Breadcrumb */}
        <div className="px-6 py-3 text-xs text-gray-500 flex items-center gap-1.5">
          <span className="text-green-700 cursor-default">Home</span>
          <i className="ri-arrow-right-s-line text-gray-400"></i>
          <span className="cursor-default">Shop Our Blinds &amp; Shades</span>
          <i className="ri-arrow-right-s-line text-gray-400"></i>
          <span className="text-gray-800 font-medium truncate max-w-xs">{form.name || 'Product Name'}</span>
        </div>

        {/* Main product section */}
        <div className="px-6 pb-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">

            {/* Left: Image gallery */}
            <div className="relative">
              <div className="w-full h-96 rounded-2xl overflow-hidden bg-gray-50 shadow-sm border border-gray-100">
                {primaryImage ? (
                  <img src={primaryImage} alt={form.name} className="w-full h-full object-cover object-top" />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-gray-300 gap-2">
                    <i className="ri-image-line text-5xl"></i>
                    <span className="text-sm">No image added</span>
                  </div>
                )}
              </div>
              {form.badge && (
                <span className={`absolute top-4 left-4 text-xs font-bold px-3 py-1.5 rounded-full shadow ${badgeColors[form.badge] ?? 'bg-gray-700 text-white'}`}>
                  {form.badge}
                </span>
              )}
              {discountPercent > 0 && (
                <span className="absolute top-4 right-4 bg-white text-red-600 text-sm font-bold px-3 py-1.5 rounded-full shadow">
                  -{discountPercent}% OFF
                </span>
              )}
              {form.images.length > 0 && (
                <div className="flex gap-3 mt-4 flex-wrap">
                  {form.images.map((img, i) => (
                    <div
                      key={i}
                      onClick={() => setSelectedImageIndex(i)}
                      className={`w-16 h-16 rounded-lg overflow-hidden border-2 cursor-pointer transition-all ${selectedImageIndex === i ? 'border-green-700' : 'border-gray-200 hover:border-green-400'}`}
                    >
                      <img src={img} alt={`View ${i + 1}`} className="w-full h-full object-cover object-top" />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Right: Product details */}
            <div className="flex flex-col gap-4">
              <div>
                <p className="text-green-700 text-xs font-bold uppercase tracking-widest mb-1 capitalize">
                  {form.category.replace(/-/g, ' ')}
                </p>
                <h1 className="text-2xl font-bold text-gray-900 leading-tight mb-2">
                  <EditableText
                    value={form.name}
                    onChange={(v) => onFieldChange('name', v)}
                    placeholder="Product Name"
                    className="text-2xl font-bold text-gray-900"
                  />
                </h1>
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex items-center gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="w-4 h-4 flex items-center justify-center">
                        <i className={`ri-star-${i < Math.floor(form.rating) ? 'fill' : 'line'} text-green-600 text-sm`}></i>
                      </div>
                    ))}
                  </div>
                  <span className="text-sm font-semibold text-gray-800">{form.rating}</span>
                  <span className="text-sm text-gray-500">({form.reviews.toLocaleString()} reviews)</span>
                </div>
                <div className="flex items-baseline gap-3 mb-1 flex-wrap">
                  <span className="text-3xl font-bold text-gray-900">
                    $<EditableNumber value={effectivePrice} onChange={(v) => onFieldChange('price', v)} className="text-3xl font-bold text-gray-900" />
                  </span>
                  {discountPercent > 0 && (
                    <>
                      <span className="text-lg text-gray-400 line-through">
                        $<EditableNumber value={form.originalPrice} onChange={(v) => onFieldChange('originalPrice', v)} className="text-lg text-gray-400" />
                      </span>
                      <span className="text-sm font-bold text-red-500">
                        Save ${(form.originalPrice - effectivePrice).toFixed(2)}
                      </span>
                    </>
                  )}
                </div>
                <p className="text-xs text-gray-500 mb-3">Starting price per blind. Final price based on your custom dimensions.</p>
              </div>

              <div className="border-t border-gray-100 pt-3">
                <p className="text-gray-600 text-sm leading-relaxed">
                  <EditableText
                    value={form.description}
                    onChange={(v) => onFieldChange('description', v)}
                    placeholder="Product description..."
                    multiline
                    className="text-gray-600 text-sm leading-relaxed"
                  />
                </p>
              </div>

              {/* Color section — always show so you can add colors even when empty */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-semibold text-gray-800">
                    Color{form.colorOptions.length > 0 ? `: ` : ''}
                    {form.colorOptions.length > 0 && (
                      <span className="font-normal text-gray-600">{selectedColor}</span>
                    )}
                  </p>
                  <button
                    type="button"
                    onClick={() => setShowAddColor((v) => !v)}
                    className="flex items-center gap-1 text-xs font-semibold text-green-700 hover:text-green-900 cursor-pointer whitespace-nowrap"
                  >
                    <div className="w-4 h-4 flex items-center justify-center border border-green-600 rounded-full">
                      <i className={`${showAddColor ? 'ri-subtract-line' : 'ri-add-line'} text-xs`}></i>
                    </div>
                    {showAddColor ? 'Cancel' : 'Add Color'}
                  </button>
                </div>

                {form.colorOptions.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-2">
                    {form.colorOptions.map((c, idx) => (
                      <div
                        key={c.name}
                        className={`group/color relative flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium border transition-all cursor-pointer whitespace-nowrap ${selectedColor === c.name ? 'border-green-700 bg-green-50 text-green-800' : 'border-gray-200 text-gray-600 hover:border-green-400'}`}
                        onClick={() => setSelectedColor(c.name)}
                      >
                        <span className="w-3 h-3 rounded-full border border-slate-300 shrink-0" style={{ backgroundColor: c.hex }}></span>
                        {c.name}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            const updated = form.colorOptions.filter((_, i) => i !== idx);
                            onFieldChange('colorOptions', updated);
                            if (selectedColor === c.name && updated.length > 0) {
                              setSelectedColor(updated[0].name);
                            } else if (updated.length === 0) {
                              setSelectedColor('');
                            }
                          }}
                          title="Remove color"
                          className="ml-1 opacity-0 group-hover/color:opacity-100 transition-opacity w-3.5 h-3.5 flex items-center justify-center text-red-400 hover:text-red-600 cursor-pointer"
                        >
                          <i className="ri-close-line text-xs"></i>
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {form.colorOptions.length === 0 && !showAddColor && (
                  <p className="text-xs text-gray-400 italic">No colors added yet — click &quot;Add Color&quot; to get started.</p>
                )}

                {/* Add color panel */}
                {showAddColor && (
                  <div className="mt-2 p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                    {/* Presets */}
                    <div>
                      <p className="text-xs font-semibold text-slate-600 mb-2">Quick Presets</p>
                      <div className="flex flex-wrap gap-1.5">
                        {COLOR_PRESETS.map((preset) => {
                          const already = form.colorOptions.some((c) => c.name === preset.name);
                          return (
                            <button
                              key={preset.name}
                              type="button"
                              onClick={() => handleAddPresetColor(preset)}
                              disabled={already}
                              title={already ? 'Already added' : `Add ${preset.name}`}
                              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
                                already
                                  ? 'border-green-300 bg-green-50 text-green-600 opacity-50 cursor-not-allowed'
                                  : 'border-slate-200 text-slate-600 hover:border-green-500 hover:bg-green-50'
                              }`}
                            >
                              <span
                                className="w-3 h-3 rounded-full border border-slate-300 shrink-0"
                                style={{ backgroundColor: preset.hex }}
                              ></span>
                              {preset.name}
                              {already && <i className="ri-check-line text-green-600 text-xs"></i>}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Custom color */}
                    <div>
                      <p className="text-xs font-semibold text-slate-600 mb-2">Custom Color</p>
                      <div className="flex gap-2 items-center">
                        <input
                          type="text"
                          value={newColorName}
                          onChange={(e) => setNewColorName(e.target.value)}
                          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddColor(); } }}
                          placeholder="Color name (e.g. Walnut)"
                          className="flex-1 px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                        <input
                          type="color"
                          value={newColorHex}
                          onChange={(e) => setNewColorHex(e.target.value)}
                          className="w-10 h-9 rounded-lg border border-slate-200 cursor-pointer p-0.5 shrink-0"
                        />
                        <button
                          type="button"
                          onClick={handleAddColor}
                          disabled={!newColorName.trim()}
                          className="px-3 py-2 bg-green-700 text-white text-xs font-semibold rounded-lg hover:bg-green-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer whitespace-nowrap"
                        >
                          Add
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {form.colorOptions.length > 0 && (
                  <p className="text-xs text-gray-400 mt-1.5">Hover a color chip to reveal the × delete button</p>
                )}
              </div>

              <div>
                <p className="text-sm font-semibold text-gray-800 mb-2">Mount Type</p>
                <div className="flex gap-3">
                  {mountOptions.map((m) => (
                    <button
                      key={m}
                      onClick={() => setSelectedMount(m)}
                      className={`flex-1 py-2 rounded-md text-sm font-medium border transition-all cursor-pointer whitespace-nowrap ${selectedMount === m ? 'border-green-700 bg-green-50 text-green-800' : 'border-gray-200 text-gray-600 hover:border-green-400'}`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-sm font-semibold text-gray-800 mb-2">Custom Dimensions (inches)</p>
                <div className="flex gap-3">
                  <div className="flex-1">
                    <label className="text-xs text-gray-500 mb-1 block">Width</label>
                    <input type="number" placeholder='e.g. 36"' className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-600" />
                  </div>
                  <div className="flex-1">
                    <label className="text-xs text-gray-500 mb-1 block">Height</label>
                    <input type="number" placeholder='e.g. 48"' className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-600" />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-1">
                <div className="flex items-center border border-gray-200 rounded-md overflow-hidden">
                  <button onClick={() => setQty(Math.max(1, qty - 1))} className="w-9 h-9 flex items-center justify-center text-gray-600 hover:bg-gray-50 cursor-pointer text-lg">−</button>
                  <span className="w-9 text-center text-sm font-semibold text-gray-800">{qty}</span>
                  <button onClick={() => setQty(qty + 1)} className="w-9 h-9 flex items-center justify-center text-gray-600 hover:bg-gray-50 cursor-pointer text-lg">+</button>
                </div>
                <button className="flex-1 py-2.5 bg-green-700 text-white font-bold rounded-md cursor-default whitespace-nowrap text-sm flex items-center justify-center gap-2">
                  <i className="ri-shopping-cart-line"></i> Add to Cart
                </button>
                <button className="w-10 h-10 flex items-center justify-center border border-gray-200 rounded-md text-gray-500 hover:text-red-500 hover:border-red-300 transition-colors cursor-pointer">
                  <i className="ri-heart-line text-base"></i>
                </button>
              </div>

              <div className="grid grid-cols-3 gap-3 pt-2 border-t border-gray-100">
                {trustBadges.map((b) => (
                  <div key={b.text} className="flex flex-col items-center gap-1 text-center">
                    <div className="w-7 h-7 flex items-center justify-center text-green-700">
                      <i className={`${b.icon} text-lg`}></i>
                    </div>
                    <span className="text-xs text-gray-500 leading-tight">{b.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── Tabs ── */}
          <div className="mt-12 border-b border-gray-200">
            <div className="flex gap-0">
              {(['details', 'measure', 'install'] as const).map((tab) => {
                const label = tab === 'details' ? 'Product Details' : tab === 'measure' ? 'How to Measure' : 'Installation';
                return (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-5 py-3 text-sm font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap ${activeTab === tab ? 'border-green-700 text-green-700' : 'border-transparent text-gray-500 hover:text-gray-800'}`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="py-8 max-w-3xl">

            {/* ── Product Details tab ── */}
            {activeTab === 'details' && (
              <div>
                <h3 className="text-base font-bold text-gray-900 mb-4">Key Features</h3>
                <ul className="space-y-3">
                  {features.map((f, i) => (
                    <EditableFeature
                      key={i}
                      value={f}
                      index={i}
                      onChange={(v) => {
                        const updated = features.map((x, idx) => idx === i ? v : x);
                        updateFeatures(updated);
                      }}
                      onRemove={() => updateFeatures(features.filter((_, idx) => idx !== i))}
                    />
                  ))}
                </ul>
                <button
                  onClick={() => updateFeatures([...features, 'New feature...'])}
                  className="mt-4 flex items-center gap-1.5 text-xs font-semibold text-green-700 hover:text-green-900 cursor-pointer whitespace-nowrap"
                >
                  <div className="w-5 h-5 flex items-center justify-center border border-green-600 rounded-full">
                    <i className="ri-add-line text-xs"></i>
                  </div>
                  Add Feature
                </button>
                <div className="mt-6 p-4 bg-green-50 rounded-xl border border-green-100">
                  <p className="text-sm font-bold text-green-800 mb-1">Free Samples Available</p>
                  <p className="text-sm text-green-700">
                    Not sure about the color or texture? Order a free sample before you buy. We&apos;ll ship it right to your door.
                  </p>
                </div>
              </div>
            )}

            {/* ── How to Measure tab ── */}
            {activeTab === 'measure' && (
              <div className="space-y-5">
                <h3 className="text-base font-bold text-gray-900">How to Measure Your Window</h3>
                {measureSteps.map((s, i) => (
                  <EditableStep
                    key={i}
                    step={s}
                    index={i}
                    onChangeTitle={(v) => {
                      const updated = measureSteps.map((x, idx) => idx === i ? { ...x, title: v } : x);
                      updateMeasureSteps(updated);
                    }}
                    onChangeDesc={(v) => {
                      const updated = measureSteps.map((x, idx) => idx === i ? { ...x, desc: v } : x);
                      updateMeasureSteps(updated);
                    }}
                    onRemove={() => updateMeasureSteps(measureSteps.filter((_, idx) => idx !== i))}
                  />
                ))}
                <button
                  onClick={() => updateMeasureSteps([...measureSteps, { title: 'New Step', desc: 'Describe this step...' }])}
                  className="flex items-center gap-1.5 text-xs font-semibold text-green-700 hover:text-green-900 cursor-pointer whitespace-nowrap"
                >
                  <div className="w-5 h-5 flex items-center justify-center border border-green-600 rounded-full">
                    <i className="ri-add-line text-xs"></i>
                  </div>
                  Add Step
                </button>
              </div>
            )}

            {/* ── Installation tab ── */}
            {activeTab === 'install' && (
              <div className="space-y-5">
                <h3 className="text-base font-bold text-gray-900">Installation Guide</h3>
                {installSteps.map((s, i) => (
                  <EditableStep
                    key={i}
                    step={s}
                    index={i}
                    onChangeTitle={(v) => {
                      const updated = installSteps.map((x, idx) => idx === i ? { ...x, title: v } : x);
                      updateInstallSteps(updated);
                    }}
                    onChangeDesc={(v) => {
                      const updated = installSteps.map((x, idx) => idx === i ? { ...x, desc: v } : x);
                      updateInstallSteps(updated);
                    }}
                    onRemove={() => updateInstallSteps(installSteps.filter((_, idx) => idx !== i))}
                  />
                ))}
                <button
                  onClick={() => updateInstallSteps([...installSteps, { title: 'New Step', desc: 'Describe this step...' }])}
                  className="flex items-center gap-1.5 text-xs font-semibold text-green-700 hover:text-green-900 cursor-pointer whitespace-nowrap"
                >
                  <div className="w-5 h-5 flex items-center justify-center border border-green-600 rounded-full">
                    <i className="ri-add-line text-xs"></i>
                  </div>
                  Add Step
                </button>
                <div className="p-4 bg-amber-50 rounded-xl border border-amber-100 mt-2">
                  <p className="text-sm font-bold text-amber-800 mb-1">Need Professional Installation?</p>
                  <p className="text-sm text-amber-700">We offer professional installation services in most areas. Contact us to schedule.</p>
                </div>
              </div>
            )}
          </div>

          {/* Related products */}
          {relatedImages.length > 0 && (
            <div className="mt-4 border-t border-gray-100 pt-10">
              <h2 className="text-xl font-bold text-gray-900 mb-6">You May Also Like</h2>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {relatedImages.map((img, i) => (
                  <div key={i} className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100">
                    <div className="w-full h-36 overflow-hidden bg-gray-50">
                      <img src={img} alt={`Related ${i + 1}`} className="w-full h-full object-cover object-top" />
                    </div>
                    <div className="p-3">
                      <p className="text-xs font-semibold text-green-700 uppercase tracking-wide mb-1 capitalize">
                        {form.category.replace(/-/g, ' ')}
                      </p>
                      <p className="text-sm font-bold text-gray-900 line-clamp-2 leading-snug mb-2">
                        {form.name || 'Related Product'}
                      </p>
                      <span className="text-sm font-bold text-gray-900">${effectivePrice.toFixed(2)}</span>
                      {discountPercent > 0 && (
                        <span className="text-xs text-gray-400 line-through ml-1">${form.originalPrice.toFixed(2)}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Simulated footer */}
        <div className="bg-green-900 text-white px-6 py-6 text-center">
          <p className="text-sm font-semibold">Blinds &amp; Shades — Custom Window Treatments</p>
          <p className="text-xs text-green-300 mt-1">© 2025 All rights reserved</p>
        </div>
      </div>
    </div>
  );
}
